import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { Ticket } from '../src/models/Ticket';
import { Article } from '../src/models/Article';
import bcrypt from 'bcryptjs';
import '../tests/setup';

const app = createApp();

async function agentToken() {
  const email = 'agent@t.com';
  await User.create({ name: 'Agent', email, role: 'agent', passwordHash: await bcrypt.hash('password', 10) });
  const res = await request(app).post('/api/auth/login').send({ email, password: 'password' });
  return res.body.token as string;
}

describe('Agent triage', () => {
  it('triages a ticket and stores suggestion', async () => {
    const token = await agentToken();
    const art = await Article.create({ title: 'Tracking your shipment', body: 'Use tracking link', tags: ['shipping'], status: 'published' });
    const t = await Ticket.create({ title: 'Where is my package?', description: 'Shipment delayed 5 days', category: 'other', status: 'open', createdBy: (await User.findOne({ role: 'agent' }))!._id });
    const triage = await request(app).post('/api/agent/triage').set('Authorization', `Bearer ${token}`).send({ ticketId: t._id.toString() });
    expect(triage.status).toBe(200);
    const suggestion = await request(app).get(`/api/agent/suggestion/${t._id}`).set('Authorization', `Bearer ${token}`);
    expect(suggestion.status).toBe(200);
    expect(suggestion.body.ticketId).toBe(t._id.toString());
  });
});


