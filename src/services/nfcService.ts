/**
 * Web NFC API Service with fallback emulation
 */
export class NFCService {
  /**
   * Check if the device browser supports Web NFC (Chrome on Android)
   */
  static isSupported(): boolean {
    return 'NDEFReader' in window;
  }

  /**
   * Transmit/Write customer card info to an NFC tag
   */
  static async writeCustomerCard(cardNumber: string, customerName: string): Promise<{ success: boolean; message: string }> {
    if (this.isSupported()) {
      try {
        // @ts-ignore
        const ndef = new window.NDEFReader();
        await ndef.write({
          records: [
            {
              recordType: 'text',
              data: JSON.stringify({ card: cardNumber, name: customerName, type: 'coffee_loyalty' }),
            },
          ],
        });
        return { success: true, message: 'NFC Card written successfully!' };
      } catch (err: any) {
        return { success: false, message: `NFC Write error: ${err.message || err}` };
      }
    }
    // Simulation
    return { success: true, message: 'NFC tag beamed (Simulated Web NFC)' };
  }

  /**
   * Start listening for NFC tags at Barista counter
   */
  static async startReading(onRead: (cardNumber: string) => void): Promise<{ success: boolean; stop?: () => void; error?: string }> {
    if (this.isSupported()) {
      try {
        // @ts-ignore
        const ndef = new window.NDEFReader();
        const ctrl = new AbortController();
        await ndef.scan({ signal: ctrl.signal });

        ndef.addEventListener('reading', ({ message }: any) => {
          for (const record of message.records) {
            if (record.recordType === 'text') {
              const textDecoder = new TextDecoder(record.encoding);
              const text = textDecoder.decode(record.data);
              try {
                const parsed = JSON.parse(text);
                if (parsed.card) {
                  onRead(parsed.card);
                  return;
                }
              } catch {
                if (text.startsWith('COFFEE-')) {
                  onRead(text.trim());
                  return;
                }
              }
            }
          }
        });

        return {
          success: true,
          stop: () => ctrl.abort(),
        };
      } catch (err: any) {
        return { success: false, error: err.message || String(err) };
      }
    }

    return {
      success: false,
      error: 'Web NFC not natively supported in this browser. Use Simulated NFC Tap or Camera QR scanner.',
    };
  }
}
