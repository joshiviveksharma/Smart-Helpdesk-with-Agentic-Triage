import request from 'supertest';
import { createApp } from '../src/app';
import '../tests/setup';

const app = createApp();

describe('Auth', () => {
  it('registers and logs in', async () => {
    const reg = await request(app).post('/api/auth/register').send({ name: 'A', email: 'a@b.com', password: 'secret1' });
    expect(reg.status).toBe(201);
    expect(reg.body.token).toBeTruthy();
    const login = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'secret1' });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();
  });
});


