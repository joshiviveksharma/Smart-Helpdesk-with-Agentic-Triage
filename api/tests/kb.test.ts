import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import bcrypt from 'bcryptjs';
import '../tests/setup';

const app = createApp();

async function adminToken() {
  const email = 'admin@t.com';
  await User.create({ name: 'Admin', email, role: 'admin', passwordHash: await bcrypt.hash('password', 10) });
  const res = await request(app).post('/api/auth/login').send({ email, password: 'password' });
  return res.body.token as string;
}

describe('KB', () => {
  it('creates and searches articles', async () => {
    const token = await adminToken();
    const created = await request(app)
      .post('/api/kb')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Troubleshooting 500 errors', body: 'Check logs', tags: ['tech'], status: 'published' });
    expect(created.status).toBe(201);
    const search = await request(app).get('/api/kb').query({ query: '500' });
    expect(search.status).toBe(200);
    expect(search.body.items.length).toBeGreaterThan(0);
  });
});


