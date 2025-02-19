import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Constants
const PORT = parseInt(process.env.PORT) || 80;
const PUBLIC_DIR = path.join(__dirname, '../public');

// Create proxy middleware
const proxyMiddleware = createProxyMiddleware({
    target: 'https://cads-gcp-webui-645149004633.us-central1.run.app',
    changeOrigin: true,
    logLevel: 'debug'
});


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

// File content helper
const getFileContent = (filePath) => {
    try {
        const resolvedPath = path.join(PUBLIC_DIR, filePath);
        if (!resolvedPath.startsWith(PUBLIC_DIR)) {
            console.error('Path traversal attempt:', filePath);
            return null;
        }
        
        if (fs.existsSync(resolvedPath)) {
            return fs.readFileSync(resolvedPath);
        }
        return null;
    } catch (err) {
        console.error(`Error reading file: ${filePath}`, err);
        return null;
    }
};

// Request handler
const handleRequest = async (req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Handle time endpoint
    if (req.url === '/time') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            utc_time: new Date().toISOString(),
            timestamp: Date.now()
        }));
        return;
    }

    // Proxy for DeepSeek server
    if (req.url.startsWith('/deepseek')) {
        return proxyMiddleware(req, res);
    }

    // Handle static files
    let filePath = req.url === '/' ? 'index.html' : req.url.replace(/^\//, '');
    const fileContent = getFileContent(filePath);

    if (fileContent) {
        res.writeHead(200, { 'Content-Type': getContentType(filePath) });
        res.end(fileContent);
    } else {
        res.writeHead(404);
        res.end('404 Not Found');
    }
};

// Create server without starting it
const createServer = () => {
    return http.createServer(handleRequest);
};

// Start server function
const startServer = (port = PORT) => {
    const server = createServer();
    // Add error handling for port binding
    server.on('error', (error) => {
        console.error('Server error:', error);
        process.exit(1);  // Exit on error so Cloud Run can restart
    });

    server.listen(port, '0.0.0.0', () => {
        console.log('Server starting with configuration:');
        console.log(`- Port: ${port}`);
        console.log(`- Environment PORT: ${process.env.PORT}`);
        console.log(`- Process running as uid:`, process.getuid());
    });
    return server;
};

// Only start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    startServer();
}

// export = {
//     handleRequest,
//     createServer,
//     startServer,
//     getContentType,
//     getFileContent
// };