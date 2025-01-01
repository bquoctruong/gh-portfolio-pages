import * as fs from 'node:fs';
import path from 'node:path';

export const handler = async (event) => {
    // Log the event for debugging
    console.log('Event:', JSON.stringify(event, null, 2));

    // Handle time endpoint - check multiple possible path formats
    if (event.rawPath === '/time' || 
        event.path === '/time' || 
        event.resource === '/time') {
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

    return {
        statusCode: 404,
        headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*'
        },
        body: 'Not Found'
    };
};