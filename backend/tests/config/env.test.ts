import { test } from 'node:test';
import assert from 'node:assert/strict';
import { envSchema } from '../../config/env.js';

const REQUIRED_VARS = {
    MONGODB_URI: 'mongodb://localhost:27017/test',
    STRIPE_SECRET_KEY: 'sk_test_123',
    RAZORPAY_KEY_ID: 'rzp_test_123',
    RAZORPAY_SECRET_KEY: 'razorpay_secret_123',
    JWT_SECRET_KEY: 'jwt_secret_123',
};

test('parses a fully-populated env', () => {
    const result = envSchema.parse({
        ...REQUIRED_VARS,
        PORT: '4000',
        CLIENT_URL: 'http://localhost:3000',
        ADMIN_URL: 'http://localhost:3001',
        NODE_ENV: 'production',
        CLOUDINARY_NAME: 'demo',
        CLOUDINARY_API_KEY: 'key',
        CLOUDINARY_SECRET_KEY: 'secret',
    });

    assert.equal(result.PORT, 4000);
    assert.equal(result.NODE_ENV, 'production');
    assert.equal(result.MONGODB_URI, REQUIRED_VARS.MONGODB_URI);
});

test('coerces PORT from a string to a number', () => {
    const result = envSchema.parse({ ...REQUIRED_VARS, PORT: '8080' });
    assert.equal(result.PORT, 8080);
    assert.equal(typeof result.PORT, 'number');
});

test('applies defaults when optional vars are omitted', () => {
    const result = envSchema.parse({ ...REQUIRED_VARS });

    assert.equal(result.PORT, 5000);
    assert.equal(result.CLIENT_URL, 'http://localhost:3000');
    assert.equal(result.ADMIN_URL, 'http://localhost:3001');
    assert.equal(result.NODE_ENV, 'development');
    assert.equal(result.CLOUDINARY_NAME, '');
});

for (const key of Object.keys(REQUIRED_VARS)) {
    test(`throws when required var ${key} is missing`, () => {
        const input = { ...REQUIRED_VARS };
        delete (input as Record<string, string>)[key];
        assert.throws(() => envSchema.parse(input));
    });

    test(`throws when required var ${key} is an empty string`, () => {
        assert.throws(() => envSchema.parse({ ...REQUIRED_VARS, [key]: '' }));
    });
}

test('throws when CLIENT_URL is not a valid URL', () => {
    assert.throws(() => envSchema.parse({ ...REQUIRED_VARS, CLIENT_URL: 'not-a-url' }));
});

test('throws when ADMIN_URL is not a valid URL', () => {
    assert.throws(() => envSchema.parse({ ...REQUIRED_VARS, ADMIN_URL: 'not-a-url' }));
});

test('throws when PORT is negative', () => {
    assert.throws(() => envSchema.parse({ ...REQUIRED_VARS, PORT: '-1' }));
});
