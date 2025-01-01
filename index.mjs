import * as fs from 'node:fs';
import path from 'node:path';

/**
 * Load HTML from the filesystem.
 */
const html = fs.readFileSync('index.html', { encoding: 'utf8' });

/**
 * A helper function to determine the content type based on file extension.
 */
const getContentType = (filePath) => {
    const extname = path.extname(filePath).toLowerCase();
    switch (extname) {
        case '.html':
            return 'text/html';
        case '.css':
            return 'text/css';
        case '.js':
            return 'application/javascript';
        case '.json':
            return 'application/json';
        case '.png':
            return 'image/png';
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.gif':
            return 'image/gif';
        case '.svg':
            return 'image/svg+xml';
        case '.ico':
            return 'image/x-icon';
        case '.woff':
            return 'font/woff';
        case '.woff2':
            return 'font/woff2';
        case '.ttf':
            return 'font/ttf';
        default:
            return 'application/octet-stream';
    }
};

/**
 * Reads the file from the filesystem and returns its content.
 */
const getFileContent = (filePath) => {
    try {
        return fs.readFileSync(filePath);
    } catch (err) {
        console.error(`File not found: ${filePath}`);
        return null;
    }
};

/**
 * Lambda handler function.
 * Serves the HTML page, CSS, JS, images, and other assets.
 */
export const handler = async (event) => {
    const { rawPath, httpMethod } = event;
    
    // Handle time endpoint
    if (httpMethod === 'GET' && rawPath === '/time') {
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                utc_time: new Date().toISOString(),
                timestamp: Date.now()
            })
        };
    }
    let filePath = 'index.html';
    let contentType = 'text/html';

    // Check if the request is for a specific file (e.g., CSS, JS, images)
    if (event.rawPath && event.rawPath !== '/') {
        filePath = `.${event.rawPath}`; // Prefix with '.' to ensure correct path handling
        contentType = getContentType(filePath);
    }

    const fileContent = getFileContent(filePath);

    if (fileContent) {
        return {
            statusCode: 200,
            headers: {
                'Content-Type': contentType,
            },
            body: fileContent.toString(contentType.startsWith('text/') ? 'utf8' : 'base64'),
            isBase64Encoded: !contentType.startsWith('text/'), // Encode non-text files as base64
        };
    } else {
        return {
            statusCode: 404,
            headers: {
                'Content-Type': 'text/plain',
            },
            body: '404 Not Found',
        };
    }
};
