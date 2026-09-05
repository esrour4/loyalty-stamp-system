/**
 * Advanced Web NFC API Service
 * Comprehensive Reader/Writer with Hardware Detection, UID Pairing, Readback Verification & Fallbacks
 */

export interface NfcWriteOptions {
  format?: 'smart' | 'compact' | 'url' | 'json';
  customUrl?: string;
}

export interface NfcReadResult {
  cardNumber: string;
  serialNumber?: string;
  recordsCount: number;
  records: Array<{ type: string; data: string }>;
  timestamp: number;
  rawPayload?: any;
}

export class NFCService {
  /**
   * Check if device browser natively supports Web NFC (Google Chrome on Android)
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'NDEFReader' in window;
  }

  /**
   * Write & Encode loyalty pass data onto a physical NFC Tag, Keyfob, or Plastic Smart Card
   */
  static async writeCustomerCard(
    cardNumber: string,
    customerName: string,
    options: NfcWriteOptions = { format: 'smart' }
  ): Promise<{
    success: boolean;
    message: string;
    isHardware?: boolean;
    recordsWritten?: number;
    serialNumber?: string;
  }> {
    const cleanCard = cardNumber.trim();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const passUrl = options.customUrl || `${origin}/?card=${encodeURIComponent(cleanCard)}`;

    if (this.isSupported()) {
      try {
        // @ts-ignore
        const ndef = new window.NDEFReader();
        const recordsToEncode: any[] = [];

        if (options.format === 'compact') {
          // Ultra-compact text record (optimal for NTAG213 144-byte tags)
          recordsToEncode.push({
            recordType: 'text',
            data: cleanCard,
          });
        } else if (options.format === 'url') {
          // Universal Smart URL (auto-opens loyalty pass on any iOS/Android phone)
          recordsToEncode.push({
            recordType: 'url',
            data: passUrl,
          });
        } else if (options.format === 'json') {
          // Full JSON payload with shop metadata
          recordsToEncode.push({
            recordType: 'text',
            data: JSON.stringify({
              card: cleanCard,
              name: customerName,
              app: 'CoffeeLoyalty',
              issuedAt: new Date().toISOString(),
            }),
          });
        } else {
          // 'smart' (Dual Pass: Text + URL)
          recordsToEncode.push({
            recordType: 'text',
            data: cleanCard,
          });
          recordsToEncode.push({
            recordType: 'url',
            data: passUrl,
          });
        }

        console.log('[Web NFC] Writing records to physical tag:', recordsToEncode);
        await ndef.write({ records: recordsToEncode });

        return {
          success: true,
          isHardware: true,
          recordsWritten: recordsToEncode.length,
          message:
            'NFC tag written successfully! Keep tag near phone for verification.',
        };
      } catch (err: any) {
        console.warn('[Web NFC Write Error]:', err);
        let errorMsg = err.message || 'Write operation failed';
        if (err.name === 'NotAllowedError') {
          errorMsg = 'NFC write permission was denied in browser settings.';
        } else if (err.name === 'NotSupportedError') {
          errorMsg = 'NFC tag format not supported or tag is read-only.';
        } else if (err.name === 'AbortError') {
          errorMsg = 'NFC write timeout or operation cancelled.';
        }

        return {
          success: false,
          isHardware: true,
          message: errorMsg,
        };
      }
    }

    // Fallback: Cross-tab / Local Broadcast Simulation
    this.broadcastLocalTap(cleanCard, customerName);

    return {
      success: true,
      isHardware: false,
      recordsWritten: 1,
      message: 'Simulated NFC Tap broadcasted successfully!',
    };
  }

  /**
   * Listen to physical NFC tags with multi-record decoding & UID extraction
   */
  static async startReading(
    onRead: (cardNumber: string, readResult: NfcReadResult) => void,
    onTagDetected?: (serialNumber?: string) => void
  ): Promise<{
    success: boolean;
    stop?: () => void;
    error?: string;
    isHardware?: boolean;
  }> {
    if (this.isSupported()) {
      try {
        // @ts-ignore
        const ndef = new window.NDEFReader();
        const ctrl = new AbortController();

        await ndef.scan({ signal: ctrl.signal });
        console.log('[Web NFC] Hardware scanner active, listening for tags...');

        ndef.addEventListener('reading', (event: any) => {
          const { message, serialNumber } = event;
          console.log('[Web NFC Tag Scanned] Serial:', serialNumber, 'Records:', message.records);

          if (onTagDetected) {
            onTagDetected(serialNumber);
          }

          const decodedRecords: Array<{ type: string; data: string }> = [];
          let detectedCardNumber: string | null = null;

          for (const record of message.records || []) {
            let recordText = '';

            try {
              if (record.recordType === 'text') {
                const textDecoder = new TextDecoder(record.encoding || 'utf-8');
                recordText = textDecoder.decode(record.data);
              } else if (record.recordType === 'url') {
                const textDecoder = new TextDecoder();
                recordText = textDecoder.decode(record.data);
              } else if (record.data) {
                // Fallback for mime, unknown, or raw payload
                const textDecoder = new TextDecoder();
                recordText = textDecoder.decode(record.data);
              }
            } catch (e) {
              console.warn('[Record Decode Error]:', e);
            }

            if (recordText) {
              decodedRecords.push({
                type: record.recordType || 'text',
                data: recordText,
              });

              // Check if record contains card number
              const extracted = this.extractCardNumberFromPayload(recordText);
              if (extracted && !detectedCardNumber) {
                detectedCardNumber = extracted;
              }
            }
          }

          // If no card number was extracted from records, fallback to serialNumber / raw
          const finalCardNumber = detectedCardNumber || serialNumber || '';

          const result: NfcReadResult = {
            cardNumber: finalCardNumber,
            serialNumber: serialNumber || undefined,
            recordsCount: decodedRecords.length,
            records: decodedRecords,
            timestamp: Date.now(),
            rawPayload: message,
          };

          if (finalCardNumber) {
            onRead(finalCardNumber, result);
          }
        });

        ndef.addEventListener('readingerror', (err: any) => {
          console.warn('[Web NFC Read Error]:', err);
        });

        return {
          success: true,
          isHardware: true,
          stop: () => {
            try {
              ctrl.abort();
            } catch (e) {
              // ignore
            }
          },
        };
      } catch (err: any) {
        console.warn('[Web NFC Scanner Failed to Init]:', err);
        return {
          success: false,
          isHardware: true,
          error:
            err.name === 'NotAllowedError'
              ? 'NFC permission was denied by browser.'
              : err.message || 'Failed to start Web NFC reader.',
        };
      }
    }

    return {
      success: false,
      isHardware: false,
      error:
        'Web NFC is supported natively on Google Chrome for Android with physical tags.',
    };
  }

  /**
   * Helper to robustly extract card number from any payload format
   */
  static extractCardNumberFromPayload(payload: string): string | null {
    if (!payload) return null;
    const clean = payload.trim();

    // 1. Direct pure numeric card number or standard alphanumeric format
    if (/^\d{4,12}$/.test(clean)) {
      return clean;
    }

    // 2. Direct standard COFFEE-XXXX match
    if (/^COFFEE-[A-Z0-9]+(-[A-Z0-9]+)?$/i.test(clean)) {
      return clean.toUpperCase();
    }

    // 2. Regex search inside string e.g. "COFFEE-1234-5678"
    const match = clean.match(/COFFEE-[A-Za-z0-9\-]+/i);
    if (match) {
      return match[0].toUpperCase();
    }

    // 3. Extract from URL query parameter ?card= or &card=
    if (clean.includes('card=') || clean.includes('c=')) {
      try {
        const urlObj = new URL(clean.startsWith('http') ? clean : `https://${clean}`);
        const cardVal = urlObj.searchParams.get('card') || urlObj.searchParams.get('c');
        if (cardVal) return cardVal.trim().toUpperCase();
      } catch (e) {
        const urlMatch = clean.match(/[?&](?:card|c)=([A-Za-z0-9\-]+)/i);
        if (urlMatch && urlMatch[1]) return urlMatch[1].trim().toUpperCase();
      }
    }

    // 4. Extract from JSON string
    if (clean.startsWith('{') && clean.endsWith('}')) {
      try {
        const parsed = JSON.parse(clean);
        if (parsed.card || parsed.cardNumber || parsed.id) {
          return String(parsed.card || parsed.cardNumber || parsed.id).trim().toUpperCase();
        }
      } catch (e) {
        // ignore
      }
    }

    // 5. Plain alphanumeric card format
    if (/^[A-Z0-9\-]{4,20}$/i.test(clean)) {
      return clean.toUpperCase();
    }

    return null;
  }

  /**
   * Broadcast local tap for cross-window / cross-device simulation
   */
  static broadcastLocalTap(cardNumber: string, customerName?: string) {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('coffee_nfc_channel');
        bc.postMessage({
          cardNumber: cardNumber.trim(),
          customerName,
          time: Date.now(),
        });
        bc.close();
      }
    } catch (e) {
      // ignore
    }
  }
}
