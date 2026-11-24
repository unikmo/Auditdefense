(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;
  var errorEl = document.getElementById('contact-error');
  var button = form.querySelector('button[type="submit"]');
  var sent = document.getElementById('contact-sent');

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    errorEl.hidden = true;
    button.disabled = true;
    button.textContent = 'Sending…';
    var payload = {};
    new FormData(form).forEach(function (value, key) { payload[key] = value; });
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (data) {
          if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : '');
        });
      })
      .then(function () {
        form.reset();
        form.hidden = true;
        sent.hidden = false;
        sent.focus();
      })
      .catch(function (error) {
        errorEl.textContent = error && error.message ? error.message : 'Your message could not be sent. Please try again or email hello@heaude.com.';
        errorEl.hidden = false;
        button.disabled = false;
        button.textContent = 'Send message';
      });
  });
})();
