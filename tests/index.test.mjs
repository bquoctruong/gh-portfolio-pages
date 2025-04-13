import { jest } from '@jest/globals';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as fs from 'fs';
import { handler, getContentType } from '../src/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Setup proper mocking for fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  readdirSync: jest.fn().mockReturnValue(['assets', 'index.html', 'posts', 'projects'])
}));

describe('Static File Server', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default mocks for environment variables
        process.env.LAMBDA_TASK_ROOT = undefined;
    });

    test('serves index.html for root path', async () => {
        const event = { rawPath: '/' };
        const mockContent = '<html>Test</html>';
        
        // Setup mocks
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue(Buffer.from(mockContent));

        const response = await handler(event);
        
        expect(response.statusCode).toBe(200);
        expect(response.headers['Content-Type']).toBe('text/html');
        expect(response.isBase64Encoded).toBe(true);
    });

    test('returns 404 for non-existent files', async () => {
        const event = { rawPath: '/not-found.txt' };
        
        // Setup mock to return false for file existence
        fs.existsSync.mockReturnValue(false);

        const response = await handler(event);
        
        expect(response.statusCode).toBe(404);
        expect(response.body).toBe('File not found');
    });

    describe('Content Type Tests', () => {
        test('should return correct content type for .woff2 files', async () => {
            // Test the getContentType function directly
            const contentType = getContentType('test.woff2');
            expect(contentType).toBe('font/woff2');
            
            // Also test the handler
            const event = { rawPath: '/fonts/test.woff2' };
            
            // Setup mock to return true for file existence and mock file content
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(Buffer.from('mock font data'));
            
            const response = await handler(event);
            expect(response.headers['Content-Type']).toBe('font/woff2');
        });
    });
});