import { expect } from 'chai';
import { handler } from './index.mjs';

describe('Content Type Tests', () => {
    it('should return correct content type for .woff2 files', async () => {
        const event = {
            rawPath: '/fonts/test.woff2'
        };
        const response = await handler(event);
        expect(response.headers['Content-Type']).to.equal('font/woff2');
    });
});