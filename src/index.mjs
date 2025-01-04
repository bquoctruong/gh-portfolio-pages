import * as fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, '../public');

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

// File content helper with Lambda support
const getFileContent = (filePath) => {
    try {
        const resolvedPath = path.join(PUBLIC_DIR, filePath);
        if (!resolvedPath.startsWith(PUBLIC_DIR)) {
            console.error('Path traversal attempt:', filePath);
            return null;
        }
        return fs.readFileSync(resolvedPath);
    } catch (err) {
        console.error(`File not found: ${filePath}`);
        return null;
    }
};

// Lambda handler function - must be named 'handler'
export const handler = async (event) => {
    try {
        console.log('Event:', JSON.stringify(event, null, 2));
        
        // API Gateway event structure
        const path = event.path || event.rawPath || '/';
        
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
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'text/plain',
                    'Access-Control-Allow-Origin': '*'
                },
                body: '404 Not Found'
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
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*'
            },
            body: 'Internal Server Error'
        };
    }
};

// Local server support
if (process.env.NODE_ENV === 'development') {
    import('http').then(({ createServer }) => {
        const PORT = process.env.PORT || 80;
        
        const server = createServer(async (req, res) => {
            const event = {
                rawPath: req.url
            };
            
            const result = await handler(event);
            
            res.writeHead(result.statusCode, result.headers);
            const body = result.isBase64Encoded 
                ? Buffer.from(result.body, 'base64')
                : result.body;
            res.end(body);
        });

        server.listen(PORT, () => {
            console.log(`Development server running at http://localhost:${PORT}/`);
        });
    });
}