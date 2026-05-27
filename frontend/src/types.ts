export type Role = 'admin' | 'user'

export interface User {
  id: string
  role: Role
  name: string
  email: string
  blocked: boolean
  plan: string
  usageMinutes: number
  usageLimit: number | null
  tenantId: string
  createdAt: string
}

export interface Agent {
  id: string
  userId: string
  type: string
  name: string
  status: string
  assistantId: string
  prompt: string
  voice: string
  createdAt: string
}

export interface CallRecord {
  id: string
  userId: string
  agentId: string
  callerName: string
  callerPhone: string
  status: string
  durationMinutes: number
  recordingUrl: string | null
  summary: string
  createdAt: string
}

export interface Lead {
  id: string
  userId: string
  agentId: string
  name: string
  phone: string
  purpose: string
  status: string
  createdAt: string
}

export interface Booking {
  id: string
  userId: string
  agentId: string
  serviceType: string
  preferredDateTime: string
  name: string
  phone: string
  notes: string
  status: string
  createdAt: string
}

export interface Plan {
  id: string
  name: string
  monthlyMinutes: number
  price: number
}
