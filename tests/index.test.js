// Set up mocks
const fs = require('fs');
fs.existsSync = jest.fn();
fs.readFileSync = jest.fn();

// Set NODE_ENV to test to use test implementations
process.env.NODE_ENV = 'test';

// Import the code directly from our bridge - no need for complex mocking now
const { handleRequest, getContentType } = require('../src/index.cjs');

describe('Static File Server', () => {
    let req, res;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        req = {
            url: '/',
            method: 'GET'
        };
        res = {
            setHeader: jest.fn(),
            writeHead: jest.fn(),
            end: jest.fn()
        };
    });

    test('serves index.html for root path', async () => {
        const mockContent = '<html>Test</html>';
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue(mockContent);

        await handleRequest(req, res);

        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html');
        expect(res.writeHead).toHaveBeenCalledWith(200);
        expect(res.end).toHaveBeenCalledWith(mockContent);
    });

    test('returns 404 for non-existent files', async () => {
        fs.existsSync.mockReturnValue(false);

        await handleRequest(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(404);
        expect(res.end).toHaveBeenCalledWith('404 Not Found');
    });

    test('serves time endpoint correctly', async () => {
        req.url = '/time';
        
        await handleRequest(req, res);

        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
        expect(res.writeHead).toHaveBeenCalledWith(200);
        const response = JSON.parse(res.end.mock.calls[0][0]);
        expect(response).toHaveProperty('utc_time');
        expect(response).toHaveProperty('timestamp');
    });

    test('sets security headers', async () => {
        await handleRequest(req, res);

        expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
        expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
        expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
    });
    
    test('getContentType returns correct MIME types', () => {
        expect(getContentType('test.html')).toBe('text/html');
        expect(getContentType('test.css')).toBe('text/css');
        expect(getContentType('test.js')).toBe('application/javascript');
        expect(getContentType('test.json')).toBe('application/json');
        expect(getContentType('test.png')).toBe('image/png');
        expect(getContentType('test.jpg')).toBe('image/jpeg');
        expect(getContentType('test.gif')).toBe('image/gif');
        expect(getContentType('test.svg')).toBe('image/svg+xml');
        expect(getContentType('test.ico')).toBe('image/x-icon');
        expect(getContentType('test.woff')).toBe('font/woff');
        expect(getContentType('test.woff2')).toBe('font/woff2');
        expect(getContentType('test.ttf')).toBe('font/ttf');
        expect(getContentType('test.unknown')).toBe('application/octet-stream');
    });
});