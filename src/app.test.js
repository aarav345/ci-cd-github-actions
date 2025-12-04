const request = require('supertest');
const { app, server } = require('./app');

describe('API Tests', () => {
    afterAll((done) => {
        server.close(done);
    });

    test('GET / should return welcome message', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Hello, CI/CD World! ssh and docker');
    });

    test('GET /goodbye should return goodbye message', async () => {
        const response = await request(app).get('/goodbye');
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Goodbye, CI/CD World!');
        });

    test('GET /health should return healthy status', async () => {
        const response = await request(app).get('/health');
        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe('healthy');
    });
});