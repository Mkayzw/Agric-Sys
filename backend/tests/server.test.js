const request = require('supertest');
const express = require('express');

// Mock the database connection
jest.mock('../config/db', () => jest.fn());

describe('Server Tests', () => {
    let app;

    beforeAll(() => {
        // Import the server app before each test
        app = require('../server');
    });

    describe('Basic Server Functionality', () => {
        test('Server should be defined', () => {
            expect(app).toBeDefined();
        });
    });

    describe('Authentication Routes', () => {
        test('POST /api/auth/register should exist', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@test.com',
                    password: 'password123',
                    name: 'Test User'
                });
            expect(response.status).not.toBe(404);
        });

        test('POST /api/auth/login should exist', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@test.com',
                    password: 'password123'
                });
            expect(response.status).not.toBe(404);
        });
    });

    describe('Job Routes', () => {
        test('GET /api/jobs should return jobs list', async () => {
            const response = await request(app).get('/api/jobs');
            expect(response.status).not.toBe(404);
        });

        test('POST /api/jobs should handle job creation', async () => {
            const response = await request(app)
                .post('/api/jobs')
                .send({
                    title: 'Test Job',
                    description: 'Test Description',
                    requirements: ['test1', 'test2']
                });
            expect(response.status).not.toBe(404);
        });
    });

    describe('Error Handling', () => {
        test('Non-existent route should return 404', async () => {
            const response = await request(app).get('/non-existent-route');
            expect(response.status).toBe(404);
        });

        test('Server should handle internal errors', async () => {
            // Create a route that throws an error
            app.get('/test-error', () => {
                throw new Error('Test error');
            });

            const response = await request(app).get('/test-error');
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('success', false);
        });
    });
}); 