// Contact form. Sends through Web3Forms, which emails hello@heaude.com.
// The access key is public by design. Paste the key from web3forms.com below.
const ACCESS_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY';
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
  if (ACCESS_KEY.startsWith('YOUR_')) {
    say('The form is not switched on yet. Please email hello@heaude.com.', 'err');
    return;
  }
  say('Sending…');
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: ACCESS_KEY,
        subject: 'Heaude contact form: ' + data.role,
        from_name: 'Heaude website',
        name: data.name, email: data.email, role: data.role, message: data.message
      })
    });
    const out = await res.json();
    if (!res.ok || !out.success) throw new Error(out.message || 'failed');
    form.reset();
    say('Thank you. We got your message and will reply by email.', 'ok');
  } catch (e) {
    say('Sorry, that did not send. Please email hello@heaude.com.', 'err');
  }
});
