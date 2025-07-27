import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handle } from '@hono/node-server/vercel'
import nodemailer from 'nodemailer'
import 'dotenv/config'

export const config = {
  api: {
    bodyParser: false
  }
}

const app = new Hono().basePath('/api')

app.use('*', cors())

app.get('/', (c) => c.text('Hello from Hono.js!'))

app.post('/', async (c) => {
  const body = await c.req.parseBody()
  const name = String((body as any).name)
  const email = String((body as any).email)
  const message = String((body as any).message)

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })

  try {
    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_TO,
      subject: 'New message from portfolio',
      text: message
    })

    return c.json({ status: 'ok' })
  } catch (err) {
    console.error('Email send failed:', err)
    return c.json({ status: 'error', message: 'Failed to send email' }, 500)
  }
})

export default  handle(app)