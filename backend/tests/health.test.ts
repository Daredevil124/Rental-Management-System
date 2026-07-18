import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

describe('GET /api/v1/health', () => {
  it('returns the standard success envelope and request id', async () => {
    const app = createApp();

    const response = await request(app)
      .get('/api/v1/health')
      .set('x-request-id', 'test-request-id')
      .expect(200);

    expect(response.headers['x-request-id']).toBe('test-request-id');
    expect(response.body).toMatchObject({
      success: true,
      data: {
        status: 'ok',
        service: 'rental-management-backend'
      },
      meta: {
        requestId: 'test-request-id'
      }
    });
    expect(response.body.data.timestamp).toEqual(expect.any(String));
  });
});
