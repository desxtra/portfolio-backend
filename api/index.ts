import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from '@hono/node-server/vercel';
import nodemailer from 'nodemailer';

export const config = {
  runtime: 'nodejs',
};

const app = new Hono().basePath('/api');

app.use('*', cors());

app.get('/', (c) => c.text('Hello from Hono.js!'));

app.post('/', async (c) => {
  const userAgent = c.req.header('user-agent')
  if (!userAgent || userAgent.includes('curl') || userAgent.includes('bot')) {
    return c.json({ status: 'error', message: 'Access denied' }, 403);
  }
  const body = await c.req.parseBody();
  const name = String(body.name);
  const email = String(body.email);
  const message = String(body.message);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_TO,
      subject: 'New message from Portfolio',
      text: message,
    });

    return c.json({ status: 'ok', message: 'Email sent successfully'});
  } catch (err) {
    console.error('Email send failed:', err);
    return c.json({ status: 'error', message: 'Failed to send email' }, 500);
  }
});

export default handle(app);