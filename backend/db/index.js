const postgres = require('postgres');
const { drizzle } = require('drizzle-orm/postgres-js');
const { and, desc, eq } = require('drizzle-orm');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const { sql } = require('drizzle-orm');
const { users, agents, calls, leads, bookings, plans } = require('./schema');

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/autoniv';
const client = postgres(connectionString, { max: 5 });
const db = drizzle(client);

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix) {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

async function ensureSchema() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      blocked BOOLEAN NOT NULL DEFAULT FALSE,
      plan TEXT NOT NULL DEFAULT 'starter',
      usage_minutes INTEGER NOT NULL DEFAULT 0,
      usage_limit INTEGER,
      tenant_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      assistant_id TEXT NOT NULL DEFAULT '',
      prompt TEXT NOT NULL DEFAULT '',
      voice TEXT NOT NULL DEFAULT 'natural-human',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS calls (
      id TEXT PRIMARY KEY,
      call_id TEXT NOT NULL UNIQUE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
      caller_name TEXT NOT NULL DEFAULT '',
      caller_phone TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'completed',
      duration_minutes INTEGER NOT NULL DEFAULT 0,
      recording_url TEXT,
      summary TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      purpose TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'new',
      call_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
      service_type TEXT NOT NULL,
      preferred_date_time TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      timezone TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'confirmed',
      call_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      monthly_minutes INTEGER NOT NULL,
      price INTEGER NOT NULL
    );
  `);
}

async function seedDatabase() {
  const existingUsers = await db.select({ id: users.id }).from(users).limit(1);
  if (existingUsers.length) {
    return;
  }

  const admin = {
    id: 'user-admin',
    role: 'admin',
    name: 'Autoniv Admin',
    email: 'admin@autoniv.ai',
    passwordHash: bcrypt.hashSync('Admin123!', 10),
    blocked: false,
    plan: 'platform',
    usageMinutes: 0,
    usageLimit: null,
    tenantId: 'platform',
    createdAt: nowIso(),
  };

  const clinic = {
    id: 'user-clinic',
    role: 'user',
    name: 'Clinic Demo',
    email: 'clinic@autoniv.ai',
    passwordHash: bcrypt.hashSync('Clinic123!', 10),
    blocked: false,
    plan: 'starter',
    usageMinutes: 84,
    usageLimit: 300,
    tenantId: 'tenant-clinic',
    createdAt: nowIso(),
  };

  await db.insert(users).values([admin, clinic]);

  await db.insert(plans).values([
    { id: 'plan-starter', name: 'Starter', monthlyMinutes: 300, price: 49 },
    { id: 'plan-growth', name: 'Growth', monthlyMinutes: 1200, price: 149 },
    { id: 'plan-scale', name: 'Scale', monthlyMinutes: 5000, price: 399 },
  ]);

  await db.insert(agents).values([
    {
      id: 'agent-receptionist',
      userId: clinic.id,
      type: 'receptionist',
      name: 'Receptionist Agent',
      status: 'active',
      assistantId: 'd855826e-eabd-4707-813c-ad214268ab3b',
      prompt:
        'Greets callers professionally, collects name, phone, and purpose of call, then routes or saves the lead.',
      voice: 'natural-human',
      createdAt: nowIso(),
    },
    {
      id: 'agent-booking',
      userId: clinic.id,
      type: 'booking',
      name: 'Appointment Booking Agent',
      status: 'active',
      assistantId: '8e279ba6-e78a-4411-9ed0-85f745702af3',
      prompt: 'Asks for service type, preferred date and time, confirms the booking, and stores the data.',
      voice: 'natural-human',
      createdAt: nowIso(),
    },
    {
      id: 'agent-faq',
      userId: clinic.id,
      type: 'faq',
      name: 'FAQ / Support Agent',
      status: 'active',
      assistantId: '3fafa36e-de32-4522-bbf5-b37098e102d4',
      prompt:
        'Answers pricing, services, and clinic timings using the predefined prompt and escalates when needed.',
      voice: 'natural-human',
      createdAt: nowIso(),
    },
  ]);

  await db.insert(calls).values([
    {
      id: 'call-1',
      callId: 'call-1',
      userId: clinic.id,
      agentId: 'agent-receptionist',
      callerName: 'Ariana',
      callerPhone: '+15551234567',
      status: 'completed',
      durationMinutes: 4,
      recordingUrl: null,
      summary: 'Lead captured for a callback request.',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: 'call-2',
      callId: 'call-2',
      userId: clinic.id,
      agentId: 'agent-booking',
      callerName: 'Mark',
      callerPhone: '+15557654321',
      status: 'missed',
      durationMinutes: 0,
      recordingUrl: null,
      summary: 'Caller did not stay on the line.',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ]);

  await db.insert(leads).values([
    {
      id: 'lead-1',
      userId: clinic.id,
      agentId: 'agent-receptionist',
      name: 'Ariana',
      phone: '+15551234567',
      purpose: 'New appointment request',
      status: 'new',
      callId: 'call-1',
      createdAt: nowIso(),
    },
  ]);

  await db.insert(bookings).values([
    {
      id: 'booking-1',
      userId: clinic.id,
      agentId: 'agent-booking',
      serviceType: 'Consultation',
      preferredDateTime: '2026-05-28T15:00:00Z',
      name: 'Mark',
      phone: '+15557654321',
      email: '',
      timezone: '',
      notes: 'Morning slot preferred',
      status: 'confirmed',
      callId: 'call-2',
      createdAt: nowIso(),
    },
  ]);
}

async function initDatabase() {
  await ensureSchema();
  await seedDatabase();
}

async function getUserByEmail(email) {
  const rows = await db.select().from(users).where(eq(users.email, String(email))).limit(1);
  return rows[0] || null;
}

async function getUserById(id) {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] || null;
}

async function listUsers() {
  return db.select().from(users).orderBy(desc(users.createdAt));
}

async function listAgents(userId = null) {
  if (!userId) {
    return db.select().from(agents).orderBy(desc(agents.createdAt));
  }

  return db.select().from(agents).where(eq(agents.userId, userId)).orderBy(desc(agents.createdAt));
}

async function listCalls(userId = null) {
  if (!userId) {
    return db.select().from(calls).orderBy(desc(calls.createdAt));
  }

  return db.select().from(calls).where(eq(calls.userId, userId)).orderBy(desc(calls.createdAt));
}

async function listLeads(userId = null) {
  if (!userId) {
    return db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  return db.select().from(leads).where(eq(leads.userId, userId)).orderBy(desc(leads.createdAt));
}

async function listBookings(userId = null) {
  if (!userId) {
    return db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  return db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt));
}

async function listPlans() {
  return db.select().from(plans).orderBy(desc(plans.price));
}

async function createAgent(payload) {
  const row = {
    id: createId('agent'),
    userId: payload.userId,
    type: payload.type,
    name: payload.name,
    status: payload.status || 'active',
    assistantId: payload.assistantId || '',
    prompt: payload.prompt || '',
    voice: payload.voice || 'natural-human',
    createdAt: nowIso(),
  };

  await db.insert(agents).values(row);
  return row;
}

async function updateAgent(id, updates) {
  await db.update(agents).set(updates).where(eq(agents.id, id));
  const rows = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
  return rows[0] || null;
}

async function deleteAgent(id) {
  const rows = await db.delete(agents).where(eq(agents.id, id)).returning();
  return rows[0] || null;
}

async function createUser(payload) {
  const row = {
    id: createId('user'),
    role: payload.role,
    name: payload.name,
    email: payload.email,
    passwordHash: bcrypt.hashSync(payload.password, 10),
    blocked: false,
    plan: payload.plan || 'starter',
    usageMinutes: 0,
    usageLimit: payload.usageLimit ?? null,
    tenantId: createId('tenant'),
    createdAt: nowIso(),
  };
  await db.insert(users).values(row);
  return row;
}

async function updateUser(id, updates) {
  await db.update(users).set(updates).where(eq(users.id, id));
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] || null;
}

async function deleteUser(id) {
  const rows = await db.delete(users).where(eq(users.id, id)).returning();
  return rows[0] || null;
}

async function createLead(payload) {
  const row = {
    id: createId('lead'),
    userId: payload.userId,
    agentId: payload.agentId,
    name: payload.name,
    phone: payload.phone,
    purpose: payload.purpose || '',
    status: payload.status || 'new',
    callId: payload.callId || null,
    createdAt: nowIso(),
  };
  await db.insert(leads).values(row);
  return row;
}

async function createBooking(payload) {
  const row = {
    id: createId('booking'),
    userId: payload.userId,
    agentId: payload.agentId,
    serviceType: payload.serviceType,
    preferredDateTime: payload.preferredDateTime,
    name: payload.name,
    phone: payload.phone,
    email: payload.email || '',
    timezone: payload.timezone || '',
    notes: payload.notes || '',
    status: payload.status || 'confirmed',
    callId: payload.callId || null,
    createdAt: nowIso(),
  };
  await db.insert(bookings).values(row);
  return row;
}

async function upsertCallEvent(payload) {
  const callId = payload.callId || payload.id || createId('call');
  const existing = await db.select().from(calls).where(eq(calls.callId, callId)).limit(1);
  const row = {
    id: existing[0]?.id || callId,
    callId,
    userId: payload.userId,
    agentId: payload.agentId || 'agent-receptionist',
    callerName: payload.callerName || '',
    callerPhone: payload.callerPhone || '',
    status: payload.status || 'completed',
    durationMinutes: Number(payload.durationMinutes || 0),
    recordingUrl: payload.recordingUrl || null,
    summary: payload.summary || payload.eventType || 'Vapi call event received',
    createdAt: existing[0]?.createdAt || nowIso(),
    updatedAt: nowIso(),
  };

  if (existing[0]) {
    await db.update(calls).set(row).where(eq(calls.callId, callId));
  } else {
    await db.insert(calls).values(row);
  }

  return row;
}

async function updateUsageMinutes(userId, minutes) {
  const user = await getUserById(userId);
  if (!user) return null;
  const updated = await updateUser(userId, {
    usageMinutes: Number(user.usageMinutes || 0) + Number(minutes || 0),
  });
  return updated;
}

async function getDashboardSummary(user) {
  const isAdmin = user.role === 'admin';
  const [allUsers, allAgents, allCalls, allLeads, allBookings, allPlans] = await Promise.all([
    listUsers(),
    listAgents(isAdmin ? null : user.id),
    listCalls(isAdmin ? null : user.id),
    listLeads(isAdmin ? null : user.id),
    listBookings(isAdmin ? null : user.id),
    listPlans(),
  ]);

  const minutesUsed = allCalls.reduce((sum, call) => sum + Number(call.durationMinutes || 0), 0);

  return {
    user,
    metrics: {
      totalUsers: isAdmin ? allUsers.length : 1,
      totalAgents: allAgents.length,
      totalCalls: allCalls.length,
      answeredCalls: allCalls.filter((call) => call.status === 'completed').length,
      missedCalls: allCalls.filter((call) => call.status === 'missed').length,
      minutesUsed: Math.round(minutesUsed),
      leadsCount: allLeads.length,
      bookingsCount: allBookings.length,
      plan: user.plan,
      usageLimit: user.usageLimit,
    },
    recentAgents: allAgents.slice(0, 5),
    recentCalls: allCalls.slice(0, 5),
    recentLeads: allLeads.slice(0, 5),
    recentBookings: allBookings.slice(0, 5),
    plans: allPlans,
    users: isAdmin ? allUsers : [],
  };
}

async function getBillingView(user) {
  const allPlans = await listPlans();

  if (user.role === 'admin') {
    return {
      plans: allPlans,
      users: await listUsers(),
    };
  }

  return {
    plans: allPlans,
    plan: user.plan,
    usageMinutes: user.usageMinutes,
    usageLimit: user.usageLimit,
    minutesLeft: user.usageLimit == null ? null : Math.max(user.usageLimit - user.usageMinutes, 0),
  };
}

module.exports = {
  initDatabase,
  getUserByEmail,
  getUserById,
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
  createLead,
  createBooking,
  upsertCallEvent,
  updateUsageMinutes,
  getDashboardSummary,
  getBillingView,
  createId,
  nowIso,
  db,
  client,
};
