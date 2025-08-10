import * as fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

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
        case '.md': return 'text/html';
        default: return 'application/octet-stream';
    }
};

const getFileContent = (filePath) => {
    try {
        const sanitizedPath = path.normalize(filePath).replace(/^(\.\.[\\/])+/, '');
        const resolvedPath = path.join(PUBLIC_DIR, sanitizedPath);
        
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

const getMarkdownPosts = (dir, filelist = []) => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            getMarkdownPosts(filepath, filelist);
        } else if (path.extname(file) === '.md') {
            filelist.push(path.relative(PUBLIC_DIR, filepath).replace(/\\/g, '/'));
        }
    });
    return filelist;
};

export const handler = async (event) => {

        if (requestPath === '/posts/list') {
            const posts = getMarkdownPosts(path.join(PUBLIC_DIR, 'posts'));
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(posts)
            };
        }

        if (requestPath.startsWith('/posts/render/')) {
            const postPath = requestPath.substring('/posts/render/'.length);
            const markdownContent = getFileContent(postPath);
            if (markdownContent) {
                const html = marked(markdownContent.toString('utf-8'));
                return {
                    statusCode: 200,
                    headers: { 'Content-Type': 'text/html' },
                    body: html
                };
            }
        }

        if (requestPath === '/time') {
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

        const filePath = requestPath === '/' ? 'index.html' : requestPath.replace(/^\//, '');
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
