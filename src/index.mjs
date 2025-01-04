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

// Lambda handler
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
    const filePath = rawPath === '/' ? 'index.html' : rawPath.replace(/^\//, '');
    const fileContent = getFileContent(filePath);

    if (fileContent) {
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
    }

    return {
        statusCode: 404,
        headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*'
        },
        body: '404 Not Found'
    };
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