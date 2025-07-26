import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handle } from 'hono/vercel'
import nodemailer from 'nodemailer'
import 'dotenv/config'

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => c.text('Hello from Hono.js!'))

app.post('/api', async (c) => {
  const body  = await c.req.parseBody()
  const name = String((body as any).name)
  const email = String((body as any).email)
  const message = String((body as any).message)

  console.log('EMAIL_USER:', process.env.EMAIL_USER)
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? ' Loaded' : 'Missing')
  console.log('EMAIL_TO:', process.env.EMAIL_TO)


  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  })

  try {
    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_TO,
      subject: 'New message from portfolio',
      text: message,
    })

    console.log('Email sent from:', name)
    return c.redirect('https://portfolio-plum-pi-12.vercel.app/thank-you')

  } catch (err) {
    console.error('Error sending email:', err)
    return c.json({ status: 'error', message: 'Failed to send email' }, 500)
  }
})

export const GET = handle(app)
export const POST = handle(app)