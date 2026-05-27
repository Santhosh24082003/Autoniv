const { pgTable, text, integer, boolean, timestamp } = require('drizzle-orm/pg-core');

const users = pgTable('users', {
  id: text('id').primaryKey(),
  role: text('role').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  blocked: boolean('blocked').notNull().default(false),
  plan: text('plan').notNull().default('starter'),
  usageMinutes: integer('usage_minutes').notNull().default(0),
  usageLimit: integer('usage_limit'),
  tenantId: text('tenant_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
});

const agents = pgTable('agents', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  name: text('name').notNull(),
  status: text('status').notNull().default('active'),
  assistantId: text('assistant_id').notNull().default(''),
  prompt: text('prompt').notNull().default(''),
  voice: text('voice').notNull().default('natural-human'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
});

const calls = pgTable('calls', {
  id: text('id').primaryKey(),
  callId: text('call_id').notNull().unique(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  agentId: text('agent_id').references(() => agents.id, { onDelete: 'set null' }),
  callerName: text('caller_name').notNull().default(''),
  callerPhone: text('caller_phone').notNull().default(''),
  status: text('status').notNull().default('completed'),
  durationMinutes: integer('duration_minutes').notNull().default(0),
  recordingUrl: text('recording_url'),
  summary: text('summary').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
});

const leads = pgTable('leads', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  agentId: text('agent_id').references(() => agents.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  purpose: text('purpose').notNull().default(''),
  status: text('status').notNull().default('new'),
  callId: text('call_id'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
});

const bookings = pgTable('bookings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  agentId: text('agent_id').references(() => agents.id, { onDelete: 'set null' }),
  serviceType: text('service_type').notNull(),
  preferredDateTime: text('preferred_date_time').notNull(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull().default(''),
  timezone: text('timezone').notNull().default(''),
  notes: text('notes').notNull().default(''),
  status: text('status').notNull().default('confirmed'),
  callId: text('call_id'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
});

const plans = pgTable('plans', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  monthlyMinutes: integer('monthly_minutes').notNull(),
  price: integer('price').notNull(),
});

module.exports = {
  users,
  agents,
  calls,
  leads,
  bookings,
  plans,
};
