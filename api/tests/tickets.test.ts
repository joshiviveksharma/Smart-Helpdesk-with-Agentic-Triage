import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import bcrypt from 'bcryptjs';
import '../tests/setup';

const app = createApp();

async function userToken() {
  const email = 'user@t.com';
  await User.create({ name: 'User', email, role: 'user', passwordHash: await bcrypt.hash('password', 10) });
  const res = await request(app).post('/api/auth/login').send({ email, password: 'password' });
  return res.body.token as string;
}

describe('Tickets', () => {
  it('creates a ticket and lists user tickets', async () => {
    const token = await userToken();
    const created = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Where is my package?', description: 'Shipment delayed 5 days', category: 'other' });
    expect(created.status).toBe(201);
    const list = await request(app).get('/api/tickets').set('Authorization', `Bearer ${token}`).query({ mine: 'true' });
    expect(list.status).toBe(200);
    expect(list.body.items.length).toBe(1);
  });
});


