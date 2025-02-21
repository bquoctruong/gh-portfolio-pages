import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = parseInt(process.env.PORT) || 80;
const PUBLIC_DIR = path.join(__dirname, '../public');
const TARGET_URL = 'https://cads-gcp-webui-645149004633.us-central1.run.app';

// Checks for local files; used to differentiate between proxy and local file serving
const localFileExists = (filePath) => {
    try {
        const resolvedPath = path.join(PUBLIC_DIR, filePath);
        return resolvedPath.startsWith(PUBLIC_DIR) && fs.existsSync(resolvedPath);
    } catch (err) {
        return false;
    }
};

const webuiProxy = createProxyMiddleware({
    target: 'https://cads-gcp-webui-645149004633.us-central1.run.app',
    changeOrigin: true,
    ws: true,
    pathRewrite: {
        '^/deepseek': '' // Remove /deepseek prefix
    }
});

const ollamaProxy = createProxyMiddleware({
    target: 'https://cads-gcp-ollama-645149004633.us-central1.run.app',
    changeOrigin: true,
    ws: true
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

// Modified shouldProxy function with local file check
const shouldProxy = (url) => {
    const proxyPaths = [
        '/deepseek',
        '/user.png',
        '/_app',
        '/static',
        '/assets',
        '/api',
        ,'/ollama',
        '/favicon'
    ];
    
    // Check if URL matches proxy paths AND doesn't exist locally
    const urlPath = url.replace(/^\//, '');
    return proxyPaths.some(path => url.startsWith(path)) && !localFileExists(urlPath);
};

/// Request handler
const handleRequest = async (req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Route based on URL path
    if (req.url.startsWith('/api/chat')) {
        return ollamaProxy(req, res);
    }

    // Check for WebUI paths
    const webuiPaths = ['/deepseek', '/_app', '/static', '/assets', '/favicon'];
    if (webuiPaths.some(path => req.url.startsWith(path))) {
        return webuiProxy(req, res);
    }

    // Handle local static files
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
    server.on('error', (error) => {
        console.error('Server error:', error);
        process.exit(1);
    });

    server.listen(port, '0.0.0.0', () => {
        console.log('Server starting with configuration:');
        console.log(`- Port: ${port}`);
        console.log(`- Environment PORT: ${process.env.PORT}`);
        console.log(`- Process running as uid:`, process.getuid());
        console.log(`- Serving static files from: ${PUBLIC_DIR}`);
    });
    return server;
};

if (import.meta.url === `file://${process.argv[1]}`) {
    startServer();
}
