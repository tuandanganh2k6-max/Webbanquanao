/**
 * ad_unit_test.js
 * Unit tests for the Ad Mongoose Model and core logic.
 */

const Ad = require('../models/Ad');
const mongoose = require('mongoose');

describe('Ad Model Unit Tests', () => {

    test('Validation: Should fail if brandName is missing', async () => {
        const ad = new Ad({
            image: 'banner.jpg',
            fee: 1000
        });
        
        let err;
        try {
            await ad.validate();
        } catch (e) {
            err = e;
        }
        
        expect(err.errors.brandName).toBeDefined();
    });

    test('Default values: Should set status to "active" by default', () => {
        const ad = new Ad({
            brandName: 'Test Brand',
            image: 'test.jpg',
            duration: '1 month',
            fee: 50000
        });
        
        expect(ad.status).toBe('active');
    });

    test('Logic: URL should be a valid string', () => {
        const ad = new Ad({ brandName: 'A', image: 'i.jpg', url: 'invalid-url' });
        // We could add custom validators in the model and test them here
        expect(typeof ad.url).toBe('string');
    });
});
