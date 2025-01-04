const fs = require('fs');
const path = require('path');
const http = require('http');

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

const handleRequest = async (req, res) => {
    console.log('Request:', req.method, req.url);
    const rawPath = req.url;

    // Handle time endpoint
    if (rawPath === '/time') {
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
            utc_time: new Date().toISOString(),
            timestamp: Date.now()
        }));
        return;
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
        res.writeHead(200, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*'
        });
        res.end(fileContent);
    } else {
        res.writeHead(404, {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*'
        });
        res.end('Not Found');
    }
};

// Create and start the server
const PORT = process.env.PORT || 80;
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});