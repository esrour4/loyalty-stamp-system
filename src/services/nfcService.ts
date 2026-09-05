/**
 * Web NFC API Service with hardware detection & fallback emulation
 */
export class NFCService {
  /**
   * Check if the device browser supports Web NFC (Google Chrome on Android)
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'NDEFReader' in window;
  }

  /**
   * Write/Encode customer card info to an NFC physical tag or card
   */
  static async writeCustomerCard(
    cardNumber: string,
    customerName: string
  ): Promise<{ success: boolean; message: string; isHardware?: boolean }> {
    if (this.isSupported()) {
      try {
        // @ts-ignore
        const ndef = new window.NDEFReader();
        await ndef.write({
          records: [
            {
              recordType: 'text',
              data: JSON.stringify({
                card: cardNumber,
                name: customerName,
                type: 'coffee_loyalty',
                timestamp: Date.now(),
              }),
            },
            {
              recordType: 'url',
              data: `${window.location.origin}/?card=${encodeURIComponent(cardNumber)}`,
            },
          ],
        });
        return {
          success: true,
          isHardware: true,
          message: 'NFC Card written successfully! Hold tag near device to verify.',
        };
      } catch (err: any) {
        console.warn('NFC Write Exception:', err);
        return {
          success: false,
          isHardware: true,
          message: `NFC Write error: ${err.message || err}`,
        };
      }
    }

    // Broadcast across local browser instances/tabs if testing
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('coffee_nfc_channel');
        bc.postMessage({ cardNumber, customerName, time: Date.now() });
        bc.close();
      }
    } catch (e) {
      // ignore
    }

    return {
      success: true,
      isHardware: false,
      message: 'Simulated NFC Tap broadcasted successfully!',
    };
  }

  /**
   * Start listening for physical NFC tags or cards
   */
  static async startReading(
    onRead: (cardNumber: string, rawData?: any) => void
  ): Promise<{ success: boolean; stop?: () => void; error?: string; isHardware?: boolean }> {
    if (this.isSupported()) {
      try {
        // @ts-ignore
        const ndef = new window.NDEFReader();
        const ctrl = new AbortController();

        await ndef.scan({ signal: ctrl.signal });

        ndef.addEventListener('reading', ({ message, serialNumber }: any) => {
          console.log('[NFC Read Event] Serial:', serialNumber, 'Records:', message.records);
          for (const record of message.records) {
            // Text record
            if (record.recordType === 'text') {
              const textDecoder = new TextDecoder(record.encoding || 'utf-8');
              const text = textDecoder.decode(record.data);
              try {
                const parsed = JSON.parse(text);
                if (parsed.card) {
                  onRead(parsed.card, parsed);
                  return;
                }
              } catch {
                if (text.startsWith('COFFEE-')) {
                  onRead(text.trim(), { card: text.trim() });
                  return;
                }
              }
            }

            // URL record
            if (record.recordType === 'url') {
              const textDecoder = new TextDecoder();
              const urlStr = textDecoder.decode(record.data);
              try {
                const url = new URL(urlStr);
                const card = url.searchParams.get('card');
                if (card) {
                  onRead(card, { url: urlStr });
                  return;
                }
              } catch {
                if (urlStr.includes('COFFEE-')) {
                  const match = urlStr.match(/COFFEE-[A-Z0-9]+-[A-Z0-9]+/);
                  if (match) {
                    onRead(match[0], { url: urlStr });
                    return;
                  }
                }
              }
            }

            // MIME or generic JSON
            if (record.recordType === 'mime' || record.mediaType === 'application/json') {
              const textDecoder = new TextDecoder();
              const jsonStr = textDecoder.decode(record.data);
              try {
                const parsed = JSON.parse(jsonStr);
                if (parsed.card) {
                  onRead(parsed.card, parsed);
                  return;
                }
              } catch {
                // ignore
              }
            }
          }
        });

        ndef.addEventListener('readingerror', (e: any) => {
          console.warn('[NFC Reading Error]', e);
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
        console.warn('[NFC Scan Init Failed]', err);
        return {
          success: false,
          isHardware: true,
          error: err.name === 'NotAllowedError'
            ? 'NFC permission was denied.'
            : (err.message || 'Failed to start Web NFC reader.'),
        };
      }
    }

    return {
      success: false,
      isHardware: false,
      error: 'Web NFC is only natively supported on Google Chrome for Android with physical NFC tags.',
    };
  }
}
