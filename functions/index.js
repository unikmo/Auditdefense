const { onRequest } = require('firebase-functions/v2/https');
const { initializeApp, applicationDefault } = require('firebase-admin/app');

// Uses Firebase/GCP runtime credentials. No service-account private key belongs
// in source control or client code.
initializeApp({ credential: applicationDefault() });

exports.health = onRequest({ cors: false }, (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.status(200).json({
    ok: true,
    service: 'auditdefend-backend',
    mode: 'non-production',
    phiAccepted: false
  });
});
