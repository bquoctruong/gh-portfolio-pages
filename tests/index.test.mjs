import { jest } from '@jest/globals';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { handler, getContentType } from '../src/index.mjs';

// Setup ES module mocking
const mockFs = {
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  readdirSync: jest.fn(() => ['assets', 'index.html', 'posts', 'projects'])
};

// Mock the fs module
jest.unstable_mockModule('fs', () => mockFs);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Static File Server', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('serves index.html for root path', async () => {
        const event = { rawPath: '/' };
        const mockContent = '<html>Test</html>';
        
        // Setup mocks
        mockFs.existsSync.mockReturnValue(true);
        mockFs.readFileSync.mockReturnValue(Buffer.from(mockContent));

        const response = await handler(event);
        
        expect(response.statusCode).toBe(200);
        expect(response.headers['Content-Type']).toBe('text/html');
        expect(response.isBase64Encoded).toBe(true);
    });

    test('returns 404 for non-existent files', async () => {
        const event = { rawPath: '/not-found.txt' };
        
        // Setup mock to return false for file existence
        mockFs.existsSync.mockReturnValue(false);

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
            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue(Buffer.from('mock font data'));
            
            const response = await handler(event);
            expect(response.headers['Content-Type']).toBe('font/woff2');
        });
    });
});