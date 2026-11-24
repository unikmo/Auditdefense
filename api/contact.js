'use strict';

const nodemailer = require('nodemailer');

const SITE = 'Heaude';
const emailPattern = /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/;
const text = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

// Server-only settings. The recipient is fixed by configuration, never by the visitor.
function config() {
  const user = (process.env.CONTACT_SMTP_USER || '').trim();
  return {
    host: (process.env.CONTACT_SMTP_HOST || '').trim(),
    user,
    pass: (process.env.CONTACT_SMTP_PASSWORD || '').replace(/\s/g, ''),
    to: (process.env.CONTACT_TO_EMAIL || '').trim() || user,
  };
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Request origin is not allowed.' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({ error: 'Invalid request.' });
  if (JSON.stringify(body).length > 12000) return res.status(413).json({ error: 'Request is too large.' });
  // Honeypot: bots fill the hidden field. Pretend success so they learn nothing.
  if (text(body.website, 200)) return res.status(200).json({ ok: true });

  const name = text(body.name, 100);
  const email = text(body.email, 254);
  const topic = text(body.topic, 60) || 'General';
  const message = text(body.message, 5000);
  if (!name || /[\r\n\x00-\x1f]/.test(name)) return res.status(400).json({ error: 'Please enter your name.' });
  if (!emailPattern.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (message.length < 2) return res.status(400).json({ error: 'Please enter a message.' });

  const c = config();
  if (!c.host || !c.user || !c.pass || !emailPattern.test(c.to)) {
    console.error('contact-mail-not-configured');
    return res.status(503).json({ error: 'Message delivery is temporarily unavailable. Please email us directly.' });
  }

  try {
    const transport = nodemailer.createTransport({
      host: c.host, port: 465, secure: true,
      auth: { user: c.user, pass: c.pass },
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
      disableFileAccess: true, disableUrlAccess: true,
    });
    const result = await transport.sendMail({
      from: { name: `${SITE} contact form`, address: c.user },
      to: c.to,
      replyTo: { name: name.replace(/[<>"]/g, ''), address: email },
      subject: `${SITE} enquiry: ${topic.replace(/[\r\n]+/g, ' ')}`,
      text: `Name: ${name}\nReply address: ${email}\nTopic: ${topic}\n\n${message}`,
    });
    if (!result.accepted || !result.accepted.length || (result.rejected && result.rejected.length)) throw new Error('Delivery not accepted');
    return res.status(200).json({ ok: true });
  } catch (error) {
    const code = error && typeof error.code === 'string' ? error.code : 'UNKNOWN';
    console.error('contact-mail-failed', code);
    return res.status(502).json({ error: 'Your message could not be sent. Please try again or email us directly.' });
  }
};
