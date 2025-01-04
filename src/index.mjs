import * as fs from 'node:fs';
import path from 'node:path';

const getContentType = (filePath) => {
    const extname = path.extname(filePath).toLowerCase();
    switch (extname) {
        case '.html': return 'text/html';
        case '.css': return 'text/css';
        case '.js': return 'application/javascript';
        case '.json': return 'application/json';
        case '.png': return 'image/png';
        case '.jpg':
        case '.jpeg': return 'image/jpeg';
        case '.gif': return 'image/gif';
        case '.svg': return 'image/svg+xml';
        case '.ico': return 'image/x-icon';
        case '.woff': return 'font/woff';
        case '.woff2': return 'font/woff2';
        case '.ttf': return 'font/ttf';
        default: return 'application/octet-stream';
    }
};

const getFileContent = (filePath) => {
    try {
        return fs.readFileSync(filePath);
    } catch (err) {
        console.error(`File not found: ${filePath}`);
        return null;
    }
};

export const handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    const { rawPath } = event;

    // Handle time endpoint
    if (rawPath === '/time') {
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                utc_time: new Date().toISOString(),
                timestamp: Date.now()
            })
        };
    }

    // Handle static files
    let filePath = 'index.html';
    let contentType = 'text/html';

    if (rawPath && rawPath !== '/') {
        filePath = `.${rawPath}`;
        contentType = getContentType(filePath);
    }

    const fileContent = getFileContent(filePath);

    if (fileContent) {
        return {
            statusCode: 200,
            headers: {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*'
            },
            body: fileContent.toString(contentType.startsWith('text/') ? 'utf8' : 'base64'),
            isBase64Encoded: !contentType.startsWith('text/')
        };
    }

    return {
        statusCode: 404,
        headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*'
        },
        body: 'Not Found'
    };
};