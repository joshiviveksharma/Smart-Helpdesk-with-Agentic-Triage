import { connectToDatabase } from './db';
import { User } from './models/User';
import { Article } from './models/Article';
import { Ticket } from './models/Ticket';
import bcrypt from 'bcryptjs';
import { logger } from './utils/logger';

async function run() {
  await connectToDatabase();

  // Clear minimal collections for idempotency in dev
  await Promise.all([User.deleteMany({}), Article.deleteMany({}), Ticket.deleteMany({})]);

  const createdUsers = await User.create([
    { name: 'Admin', email: 'admin@example.com', passwordHash: await bcrypt.hash('password', 10), role: 'admin' },
    { name: 'Agent', email: 'agent@example.com', passwordHash: await bcrypt.hash('password', 10), role: 'agent' },
    { name: 'User', email: 'user@example.com', passwordHash: await bcrypt.hash('password', 10), role: 'user' }
  ]);
  const admin = createdUsers[0];
  const agent = createdUsers[1];
  const user = createdUsers[2];

  const articles = await Article.create([
    {
      title: 'How to update payment method',
      body: 'Go to billing settings and update your card details.',
      tags: ['billing', 'payments'],
      status: 'published'
    },
    {
      title: 'Troubleshooting 500 errors',
      body: 'Check logs, inspect stack trace, and verify environment variables.',
      tags: ['tech', 'errors'],
      status: 'published'
    },
    {
      title: 'Tracking your shipment',
      body: 'Use the tracking link sent to your email to see updates.',
      tags: ['shipping', 'delivery'],
      status: 'published'
    }
  ]);

  if (user) {
    await Ticket.create([
      { title: 'Refund for double charge', description: 'I was charged twice for order #1234', category: 'other', createdBy: user._id },
      { title: 'App shows 500 on login', description: 'Stack trace mentions auth module', category: 'other', createdBy: user._id },
      { title: 'Where is my package?', description: 'Shipment delayed 5 days', category: 'other', createdBy: user._id }
    ]);
  }

  logger.info({ admin: admin?.email, agent: agent?.email, user: user?.email, articles: articles.length }, 'Seed completed');
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error({ err }, 'Seed failed');
    process.exit(1);
  });


