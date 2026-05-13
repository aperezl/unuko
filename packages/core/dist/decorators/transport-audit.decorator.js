export class TransportAuditDecorator {
    decorated;
    audit;
    sessionId;
    constructor(decorated, audit, sessionId) {
        this.decorated = decorated;
        this.audit = audit;
        this.sessionId = sessionId;
    }
    async post(request) {
        await this.audit.log({
            sessionId: this.sessionId,
            category: 'TRANSPORT',
            direction: 'OUT',
            payload: {
                url: request.url,
                headers: request.headers,
                body: request.body
            },
            description: `HTTP POST Request to ${new URL(request.url).pathname}`
        });
        try {
            const response = await this.decorated.post(request);
            await this.audit.log({
                sessionId: this.sessionId,
                category: 'TRANSPORT',
                direction: 'IN',
                payload: response,
                description: `HTTP Response from ${new URL(request.url).pathname}`
            });
            return response;
        }
        catch (error) {
            await this.audit.log({
                sessionId: this.sessionId,
                category: 'TRANSPORT',
                direction: 'IN',
                payload: { error: error instanceof Error ? error.message : String(error) },
                description: `HTTP Failure from ${new URL(request.url).pathname}`
            });
            throw error;
        }
    }
}
