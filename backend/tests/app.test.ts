import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import app from '../app.js';

let server: Server;
let baseUrl: string;

before(() => {
    return new Promise<void>((resolve) => {
        server = app.listen(0, () => {
            const address = server.address();
            if (address === null || typeof address === 'string') {
                throw new Error('Expected server to listen on a network port');
            }
            baseUrl = `http://127.0.0.1:${address.port}`;
            resolve();
        });
    });
});

after(() => {
    return new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
    });
});

test('GET /api/health returns 200 with the expected shape', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type')?.includes('application/json'), true);

    const body = await response.json() as {
        message: string;
        Server: string;
        Port: number;
        checks: { Database: string; Cloudinary: string };
    };
    assert.equal(body.message, 'API is healthy');
    assert.equal(body.Server, 'Running');
    assert.equal(typeof body.Port, 'number');
    assert.ok('checks' in body);
    assert.equal(body.checks.Database, 'Connected');
    assert.equal(body.checks.Cloudinary, 'Connected');
});

test('GET / returns the API WORKING string', async () => {
    const response = await fetch(`${baseUrl}/`);
    assert.equal(response.status, 200);
    assert.equal(await response.text(), 'API WORKING');
});
