export class HardwareAuditDecorator {
    decorated;
    audit;
    sessionId;
    constructor(decorated, audit, sessionId) {
        this.decorated = decorated;
        this.audit = audit;
        this.sessionId = sessionId;
    }
    async transmit(command) {
        const commandHex = command.toString('hex').toUpperCase();
        await this.audit.log({
            sessionId: this.sessionId,
            category: 'HARDWARE',
            direction: 'OUT',
            payload: { apdu: commandHex },
            description: 'APDU Command'
        });
        try {
            const response = await this.decorated.transmit(command);
            const respHex = response.data ? response.data.toString('hex').toUpperCase() : '';
            const swHex = response.status
                ? `${response.status.sw1.toString(16).padStart(2, '0')}${response.status.sw2.toString(16).padStart(2, '0')}`.toUpperCase()
                : '';
            await this.audit.log({
                sessionId: this.sessionId,
                category: 'HARDWARE',
                direction: 'IN',
                payload: {
                    data: respHex,
                    sw: swHex,
                    success: response.success,
                    error: response.error
                },
                description: 'APDU Response'
            });
            return response;
        }
        catch (error) {
            await this.audit.log({
                sessionId: this.sessionId,
                category: 'HARDWARE',
                direction: 'IN',
                payload: { error: error instanceof Error ? error.message : String(error) },
                description: 'APDU Transmission Failure'
            });
            throw error;
        }
    }
    async reset() {
        await this.audit.log({
            sessionId: this.sessionId,
            category: 'HARDWARE',
            direction: 'OUT',
            payload: {},
            description: 'Hardware Reset Request'
        });
        return this.decorated.reset();
    }
}
