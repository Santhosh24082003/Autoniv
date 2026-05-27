const express = require('express');
const bcrypt = require('bcryptjs');
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  listUsers,
  listAgents,
  listCalls,
  listLeads,
  listBookings,
  listPlans,
  createAgent,
  updateAgent,
  deleteAgent,
  createUser,
  updateUser,
  deleteUser,
  getDashboardSummary,
  getBillingView,
  updateUsageMinutes,
} = require('../db');

const router = express.Router();

function publicUser(user) {
  return {
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    blocked: user.blocked,
    plan: user.plan,
    usageMinutes: user.usageMinutes,
    usageLimit: user.usageLimit,
    tenantId: user.tenantId,
    createdAt: user.createdAt,
  };
}

function publicAgent(agent) {
  return {
    id: agent.id,
    userId: agent.userId,
    type: agent.type,
    name: agent.name,
    status: agent.status,
    assistantId: agent.assistantId,
    prompt: agent.prompt,
    voice: agent.voice,
    createdAt: agent.createdAt,
  };
}

function publicCall(call) {
  return {
    id: call.id,
    userId: call.userId,
    agentId: call.agentId,
    callerName: call.callerName,
    callerPhone: call.callerPhone,
    status: call.status,
    durationMinutes: call.durationMinutes,
    recordingUrl: call.recordingUrl,
    summary: call.summary,
    createdAt: call.createdAt,
  };
}

function publicLead(lead) {
  return {
    id: lead.id,
    userId: lead.userId,
    agentId: lead.agentId,
    name: lead.name,
    phone: lead.phone,
    purpose: lead.purpose,
    status: lead.status,
    createdAt: lead.createdAt,
  };
}

function publicBooking(booking) {
  return {
    id: booking.id,
    userId: booking.userId,
    agentId: booking.agentId,
    serviceType: booking.serviceType,
    preferredDateTime: booking.preferredDateTime,
    name: booking.name,
    phone: booking.phone,
    notes: booking.notes,
    status: booking.status,
    createdAt: booking.createdAt,
  };
}

function isAdmin(user) {
  return user.role === 'admin';
}

function canAccess(user, recordUserId) {
  return isAdmin(user) || user.id === recordUserId;
}

router.get('/dashboard/summary', requireAuth, async (req, res) => {
  const summary = await getDashboardSummary(req.user);
  res.json({
    ...summary,
    user: publicUser(summary.user),
    recentAgents: summary.recentAgents.map(publicAgent),
    recentCalls: summary.recentCalls.map(publicCall),
    recentLeads: summary.recentLeads.map(publicLead),
    recentBookings: summary.recentBookings.map(publicBooking),
    users: (summary.users || []).map(publicUser),
  });
});

router.get('/agents', requireAuth, async (req, res) => {
  const agents = await listAgents(isAdmin(req.user) ? null : req.user.id);
  res.json({ agents: agents.map(publicAgent) });
});

router.post('/agents', requireAuth, async (req, res) => {
  const { name, type, prompt, assistantId, voice, userId } = req.body || {};

  if (!name || !type) {
    return res.status(400).json({ error: 'name and type are required' });
  }

  const ownerId = isAdmin(req.user) ? userId || req.user.id : req.user.id;
  const agent = await createAgent({
    userId: ownerId,
    type,
    name,
    prompt,
    assistantId,
    voice,
    status: 'active',
  });

  res.status(201).json({ agent: publicAgent(agent) });
});

router.put('/agents/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};
  const agents = await listAgents(isAdmin(req.user) ? null : req.user.id);
  const agent = agents.find((entry) => entry.id === id);

  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  if (!canAccess(req.user, agent.userId)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  const updated = await updateAgent(id, {
    name: updates.name ?? agent.name,
    type: updates.type ?? agent.type,
    prompt: updates.prompt ?? agent.prompt,
    assistantId: updates.assistantId ?? agent.assistantId,
    voice: updates.voice ?? agent.voice,
    status: updates.status ?? agent.status,
  });

  res.json({ agent: publicAgent(updated) });
});

router.delete('/agents/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const agents = await listAgents(isAdmin(req.user) ? null : req.user.id);
  const agent = agents.find((entry) => entry.id === id);

  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  if (!canAccess(req.user, agent.userId)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  await deleteAgent(id);
  res.json({ ok: true });
});

router.get('/calls', requireAuth, async (req, res) => {
  const calls = await listCalls(isAdmin(req.user) ? null : req.user.id);
  res.json({ calls: calls.map(publicCall) });
});

router.get('/leads', requireAuth, async (req, res) => {
  const leads = await listLeads(isAdmin(req.user) ? null : req.user.id);
  res.json({ leads: leads.map(publicLead) });
});

router.get('/bookings', requireAuth, async (req, res) => {
  const bookings = await listBookings(isAdmin(req.user) ? null : req.user.id);
  res.json({ bookings: bookings.map(publicBooking) });
});

router.get('/users', requireAuth, requireRole('admin'), async (req, res) => {
  const users = await listUsers();
  res.json({ users: users.map(publicUser) });
});

router.post('/users', requireAuth, requireRole('admin'), async (req, res) => {
  const { name, email, password, role, plan, usageLimit } = req.body || {};

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'name, email, password, and role are required' });
  }

  const existingUsers = await listUsers();
  if (existingUsers.some((entry) => entry.email.toLowerCase() === String(email).toLowerCase())) {
    return res.status(409).json({ error: 'A user with that email already exists' });
  }

  const user = await createUser({ name, email, password, role, plan, usageLimit });
  res.status(201).json({ user: publicUser(user) });
});

router.put('/users/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};
  const users = await listUsers();
  const user = users.find((entry) => entry.id === id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const updated = await updateUser(id, {
    name: updates.name ?? user.name,
    email: updates.email ?? user.email,
    role: updates.role ?? user.role,
    blocked: typeof updates.blocked === 'boolean' ? updates.blocked : user.blocked,
    plan: updates.plan ?? user.plan,
    usageMinutes: typeof updates.usageMinutes === 'number' ? updates.usageMinutes : user.usageMinutes,
    usageLimit: updates.usageLimit ?? user.usageLimit,
    passwordHash: updates.password ? bcrypt.hashSync(String(updates.password), 10) : user.passwordHash,
  });

  res.json({ user: publicUser(updated) });
});

router.delete('/users/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const users = await listUsers();
  const user = users.find((entry) => entry.id === id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  await deleteUser(id);
  res.json({ ok: true });
});

router.get('/plans', requireAuth, async (req, res) => {
  const plans = await listPlans();
  res.json({ plans });
});

router.get('/billing', requireAuth, async (req, res) => {
  const billing = await getBillingView(req.user);
  res.json({
    ...billing,
    users: (billing.users || []).map(publicUser),
  });
});

router.put('/billing/:userId', requireAuth, requireRole('admin'), async (req, res) => {
  const { userId } = req.params;
  const { plan, usageLimit, usageMinutes } = req.body || {};
  const users = await listUsers();
  const user = users.find((entry) => entry.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const updated = await updateUser(userId, {
    plan: plan ?? user.plan,
    usageLimit: usageLimit ?? user.usageLimit,
    usageMinutes: typeof usageMinutes === 'number' ? usageMinutes : user.usageMinutes,
  });

  res.json({ user: publicUser(updated) });
});

router.post('/usage/increment', requireAuth, async (req, res) => {
  const { minutes = 0 } = req.body || {};
  const updated = await updateUsageMinutes(req.user.id, minutes);
  res.json({ user: publicUser(updated) });
});

module.exports = router;
