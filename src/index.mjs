import * as fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lambda-specific path resolution
const PUBLIC_DIR = process.env.LAMBDA_TASK_ROOT 
    ? path.join(process.env.LAMBDA_TASK_ROOT, 'public')
    : path.join(__dirname, '../public');

// Content type helper
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

// Debug logging
console.log('Environment:', {
    LAMBDA_TASK_ROOT: process.env.LAMBDA_TASK_ROOT,
    PUBLIC_DIR,
    __dirname,
    files: fs.readdirSync(process.env.LAMBDA_TASK_ROOT || PUBLIC_DIR)
});

const getFileContent = (filePath) => {
    try {
        const sanitizedPath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
        const resolvedPath = path.join(PUBLIC_DIR, sanitizedPath);
        
        console.log('File request:', {
            requested: filePath,
            resolved: resolvedPath,
            exists: fs.existsSync(resolvedPath)
        });
        
        if (!resolvedPath.startsWith(PUBLIC_DIR)) {
            console.error('Path traversal attempt:', filePath);
            return null;
        }
        
        return fs.existsSync(resolvedPath) ? fs.readFileSync(resolvedPath) : null;
    } catch (err) {
        console.error('File read error:', err);
        return null;
    }
};

export const handler = async (event) => {
    console.log('Event:', JSON.stringify(event));
    
    try {
        const path = event.path || event.rawPath || '/';
        console.log('Requested path:', path);

        // Handle time endpoint
        if (path === '/time') {
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
        const filePath = path === '/' ? 'index.html' : path.replace(/^\//, '');
        const fileContent = getFileContent(filePath);

        if (!fileContent) {
            console.log('File not found:', filePath);
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'text/plain',
                    'Access-Control-Allow-Origin': '*'
                },
                body: 'File not found'
            };
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': getContentType(filePath),
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'Access-Control-Allow-Origin': '*'
            },
            body: fileContent.toString('base64'),
            isBase64Encoded: true
        };
    } catch (error) {
        console.error('Lambda error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Internal Server Error',
                message: error.message
            })
        };
    }
};

export { getContentType };