import { jest } from '@jest/globals';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as fs from 'fs';
import { handler } from '../src/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

jest.mock('fs');

describe('Static File Server', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('serves index.html for root path', async () => {
        const event = { rawPath: '/' };
        const mockContent = '<html>Test</html>';
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue(mockContent);

        const response = await handler(event);
        
        expect(response.statusCode).toBe(200);
        expect(response.headers['Content-Type']).toBe('text/html');
        expect(response.isBase64Encoded).toBe(true);
    });

    describe('Content Type Tests', () => {
        it('should return correct content type for .woff2 files', async () => {
            const event = {
                rawPath: '/fonts/test.woff2'
            };
            const response = await handler(event);
            expect(response.headers['Content-Type']).to.equal('font/woff2');
        });
    });
});