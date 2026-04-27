/**
 * ad_acceptance_test.js
 * Acceptance tests for Advertisement API endpoints.
 */

const request = require('supertest');
const app = require('../server'); // Assuming server.js exports the app

describe('Advertisement API Acceptance Tests', () => {
    
    let adminToken;

    beforeAll(async () => {
        // Mock Login as Admin to get JWT
        const res = await request(app)
            .post('/api/users/login')
            .send({ email: 'admin@webbanquanao.com', password: 'password123' });
        adminToken = res.body.token;
    });

    test('POST /api/ads - Should create a new ad when admin is authenticated', async () => {
        const newAd = {
            brandName: 'Adidas',
            duration: '6 months',
            fee: 5000000,
            image: 'adidas_spring.jpg',
            url: 'https://adidas.com.vn'
        };

        const response = await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(newAd);

        expect(response.status).toBe(201);
        expect(response.body.brandName).toBe('Adidas');
    });

    test('DELETE /api/ads/:id - Should remove an ad', async () => {
        // First create an ad to delete
        const tempAd = await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ brandName: 'Temp', duration: '1m', fee: 0, image: 't.jpg' });

        const response = await request(app)
            .delete(`/api/ads/${tempAd.body._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Ad removed');
    });

    test('GET /api/ads - Public access should be allowed', async () => {
        const response = await request(app).get('/api/ads');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});
