const https = require('https');
const { URL } = require('url');

function forwardToCRM(crmUrl, payload) {
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(crmUrl);
      const data = JSON.stringify(payload);

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + (urlObj.search || ''),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body }));
      });

      req.on('error', (err) => reject(err));
      req.write(data);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

async function captureLead(req, res) {
  const { name, phone, purpose, callId } = req.body || {};

  if (!name || !phone) {
    return res.status(400).json({ error: 'Missing required fields: name and phone' });
  }

  const lead = { name, phone, purpose: purpose || '', callId: callId || null };
  const crmUrl = process.env.CRM_WEBHOOK_URL || '';

  if (crmUrl) {
    try {
      const result = await forwardToCRM(crmUrl, lead);
      return res.status(200).json({ ok: true, forwarded: true, crm: result, lead });
    } catch (err) {
      console.error('Failed to forward lead to CRM:', err);
      return res.status(502).json({ ok: false, forwarded: false, error: String(err), lead });
    }
  }

  return res.status(200).json({ ok: true, forwarded: false, lead });
}

async function captureBooking(req, res) {
  const { serviceType, preferredDateTime, name, phone, notes, callId } = req.body || {};

  if (!serviceType || !preferredDateTime) {
    return res
      .status(400)
      .json({ error: 'Missing required fields: serviceType and preferredDateTime' });
  }

  const booking = {
    serviceType,
    preferredDateTime,
    name: name || '',
    phone: phone || '',
    notes: notes || '',
    callId: callId || null,
  };

  const bookingWebhookUrl = process.env.BOOKING_WEBHOOK_URL || '';

  if (bookingWebhookUrl) {
    try {
      const result = await forwardToCRM(bookingWebhookUrl, booking);
      return res.status(200).json({ ok: true, forwarded: true, webhook: result, booking });
    } catch (err) {
      console.error('Failed to forward booking to webhook:', err);
      return res.status(502).json({ ok: false, forwarded: false, error: String(err), booking });
    }
  }

  return res.status(200).json({ ok: true, forwarded: false, booking });
}

function health(req, res) {
  res.json({ ok: true, service: 'vapi' });
}

module.exports = { captureLead, captureBooking, health };
