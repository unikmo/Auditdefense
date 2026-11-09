// Contact form handler. Sends the message by SMTP to CONTACT_EMAIL.
// Needs these Vercel environment variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS,
// and optionally SMTP_FROM and CONTACT_EMAIL.
const nodemailer = require('nodemailer');

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    if (body.botcheck) return res.status(200).json({ success: true });
    const name = String(body.name || '').trim().slice(0, 120);
    const email = String(body.email || '').trim().slice(0, 200);
    const role = String(body.role || '').trim().slice(0, 80);
    const message = String(body.message || '').trim().slice(0, 4000);
    if (!name || !message || !EMAIL.test(email)) return res.status(400).json({ error: 'Name, valid email and message are required' });

    const host = (process.env.SMTP_HOST || '').trim();
    const port = parseInt((process.env.SMTP_PORT || '').trim(), 10);
    const user = (process.env.SMTP_USER || '').trim();
    const pass = (process.env.SMTP_PASS || '').trim();
    if (!host || !port || !user || !pass) return res.status(500).json({ error: 'Mail is not configured' });

    const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass }, connectionTimeout: 12000, greetingTimeout: 12000, socketTimeout: 15000 });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || user,
      to: process.env.CONTACT_EMAIL || 'mbanwie@gmail.com',
      replyTo: email,
      subject: `Heaude contact from ${name}`,
      html: `<p><strong>Name:</strong> ${esc(name)}</p><p><strong>Email:</strong> ${esc(email)}</p><p><strong>Role:</strong> ${esc(role)}</p><p><strong>Message:</strong></p><p>${esc(message).replace(/\n/g, '<br>')}</p>`
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err && err.message);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};
