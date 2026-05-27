const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'db.json');

function nowIso() {
  return new Date().toISOString();
}

function seedDb() {
  const adminPasswordHash = bcrypt.hashSync('Admin123!', 10);
  const clientPasswordHash = bcrypt.hashSync('Clinic123!', 10);

  return {
    users: [
      {
        id: 'user-admin',
        role: 'admin',
        name: 'Autoniv Admin',
        email: 'admin@autoniv.ai',
        passwordHash: adminPasswordHash,
        blocked: false,
        plan: 'platform',
        usageMinutes: 0,
        usageLimit: null,
        tenantId: 'platform',
        createdAt: nowIso(),
      },
      {
        id: 'user-clinic',
        role: 'user',
        name: 'Clinic Demo',
        email: 'clinic@autoniv.ai',
        passwordHash: clientPasswordHash,
        blocked: false,
        plan: 'starter',
        usageMinutes: 84,
        usageLimit: 300,
        tenantId: 'tenant-clinic',
        createdAt: nowIso(),
      },
    ],
    agents: [
      {
        id: 'agent-receptionist',
        userId: 'user-clinic',
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
        userId: 'user-clinic',
        type: 'booking',
        name: 'Appointment Booking Agent',
        status: 'active',
        assistantId: '8e279ba6-e78a-4411-9ed0-85f745702af3',
        prompt:
          'Asks for service type, preferred date and time, confirms the booking, and stores the data.',
        voice: 'natural-human',
        createdAt: nowIso(),
      },
      {
        id: 'agent-faq',
        userId: 'user-clinic',
        type: 'faq',
        name: 'FAQ / Support Agent',
        status: 'active',
        assistantId: '3fafa36e-de32-4522-bbf5-b37098e102d4',
        prompt:
          'Answers pricing, services, and clinic timings using the predefined prompt and escalates when needed.',
        voice: 'natural-human',
        createdAt: nowIso(),
      },
    ],
    calls: [
      {
        id: 'call-1',
        userId: 'user-clinic',
        agentId: 'agent-receptionist',
        callerName: 'Ariana',
        callerPhone: '+15551234567',
        status: 'completed',
        durationMinutes: 4.2,
        recordingUrl: null,
        summary: 'Lead captured for a callback request.',
        createdAt: nowIso(),
      },
      {
        id: 'call-2',
        userId: 'user-clinic',
        agentId: 'agent-booking',
        callerName: 'Mark',
        callerPhone: '+15557654321',
        status: 'missed',
        durationMinutes: 0,
        recordingUrl: null,
        summary: 'Caller did not stay on the line.',
        createdAt: nowIso(),
      },
    ],
    leads: [
      {
        id: 'lead-1',
        userId: 'user-clinic',
        agentId: 'agent-receptionist',
        name: 'Ariana',
        phone: '+15551234567',
        purpose: 'New appointment request',
        status: 'new',
        createdAt: nowIso(),
      },
    ],
    bookings: [
      {
        id: 'booking-1',
        userId: 'user-clinic',
        agentId: 'agent-booking',
        serviceType: 'Consultation',
        preferredDateTime: '2026-05-28T15:00:00Z',
        name: 'Mark',
        phone: '+15557654321',
        notes: 'Morning slot preferred',
        status: 'confirmed',
        createdAt: nowIso(),
      },
    ],
    plans: [
      {
        id: 'plan-starter',
        name: 'Starter',
        monthlyMinutes: 300,
        price: 49,
      },
      {
        id: 'plan-growth',
        name: 'Growth',
        monthlyMinutes: 1200,
        price: 149,
      },
      {
        id: 'plan-scale',
        name: 'Scale',
        monthlyMinutes: 5000,
        price: 399,
      },
    ],
  };
}

function ensureDb() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(seedDb(), null, 2), 'utf8');
  }
}

function readDb() {
  ensureDb();
  const raw = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(raw);
}

function writeDb(db) {
  ensureDb();
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
}

function updateDb(mutator) {
  const db = readDb();
  const updated = mutator(db) || db;
  writeDb(updated);
  return updated;
}

function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

module.exports = {
  createId,
  readDb,
  updateDb,
  nowIso,
};