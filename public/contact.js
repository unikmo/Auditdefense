// Contact form. Posts to /api/contact, which emails the Heaude team.
const form = document.getElementById('contact-form');
const status = document.getElementById('contact-status');
function say(text, kind) { status.textContent = text; status.className = 'contact-status ' + (kind || ''); }
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  if (data.botcheck) return;
  if (!data.name.trim() || !data.message.trim() || !/^\S+@\S+\.\S+$/.test(data.email)) {
    say('Please fill in your name, a valid email and a message.', 'err');
    return;
  }
  say('Sending…');
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: data.name, email: data.email, role: data.role, message: data.message })
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok || !out.success) throw new Error(out.error || 'failed');
    form.reset();
    say('Thank you. We got your message and will reply by email.', 'ok');
  } catch (e) {
    say('Sorry, that did not send. Please email hello@heaude.com.', 'err');
  }
});
