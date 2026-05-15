import { UniversalHardwarePort, APDU, ChipStatus, TransportError } from '../../../domain/ports/out/hardware.port';

export class MockHardwareAdapter implements UniversalHardwarePort {
  async transmit(command: APDU): Promise<{
    success: boolean;
    data?: Buffer;
    status?: ChipStatus;
    error?: TransportError;
  }> {
    console.log(`[MOCK HARDWARE] Transmitting APDU: ${command.toString('hex').toUpperCase()}`);
    
    // Simular latencia de hardware
    await new Promise(resolve => setTimeout(resolve, 50));

    // Lógica básica: si es un SELECT (empezando con 00A4), responder OK
    if (command[0] === 0x00 && command[1] === 0xA4) {
      return {
        success: true,
        data: Buffer.from('611A', 'hex'),
        status: { sw1: 0x90, sw2: 0x00, isSuccess: true }
      };
    }

    // Por defecto, responder OK sin datos (9000)
    return {
      success: true,
      data: Buffer.from('', 'hex'),
      status: { sw1: 0x90, sw2: 0x00, isSuccess: true }
    };
  }

  async reset(): Promise<boolean> {
    console.log('[MOCK HARDWARE] Resetting interface...');
    return true;
  }
}
