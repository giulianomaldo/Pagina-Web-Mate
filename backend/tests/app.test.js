const request = require('supertest');
const app = require('../src/app');

describe('GET /api/health', () => {
  it('debería responder con status 200 y mensaje de ok', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', message: 'Servidor funcionando correctamente' });
  });
});
