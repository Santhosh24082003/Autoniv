const express = require('express');
const { createId, listUsers, upsertCallEvent } = require('../db');

const router = express.Router();

router.post('/vapi', async (req, res) => {
  const payload = req.body || {};
  const users = await listUsers();
  const ownerId = payload.userId || users.find((entry) => entry.role === 'user')?.id || 'user-clinic';
  const callId = payload.callId || payload.id || createId('call');
  const storedCall = await upsertCallEvent({
    id: callId,
    callId,
    userId: payload.userId || ownerId,
    agentId: payload.agentId || 'agent-receptionist',
    callerName: payload.callerName || '',
    callerPhone: payload.callerPhone || '',
    status: payload.status || 'completed',
    durationMinutes: typeof payload.durationMinutes === 'number' ? payload.durationMinutes : 0,
    recordingUrl: payload.recordingUrl || null,
    summary: payload.summary || payload.eventType || 'Vapi call event received',
  });

  res.json({ ok: true, call: storedCall });
});

module.exports = router;
