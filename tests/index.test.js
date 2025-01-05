const http = require('http');
const path = require('path');
const fs = require('fs');

// Mock server dependencies
jest.mock('fs');
jest.mock('http');

const { handleRequest, getContentType } = require('../src/index.js');

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

        expect(res.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'text/html' });
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

        expect(res.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'application/json' });
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
});