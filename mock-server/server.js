/**
 * ZENIX CRM — local mock backend.
 *
 * FOR LOCAL DEVELOPMENT/DEMO ONLY. Not production code: data lives in
 * memory and resets every restart, there's no real password hashing, and
 * validation is minimal. It exists purely so the real frontend (which talks
 * to real REST endpoints) has something to talk to before the real backend
 * is built. Endpoints mirror src/api/endpoints.js exactly.
 */
const express = require('express')
const cookieParser = require('cookie-parser')
const multer = require('multer')
const crypto = require('crypto')

const app = express()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } })
const PORT = 4000

app.use(express.json())
app.use(cookieParser())

// ---------------------------------------------------------------------------
// In-memory data
// ---------------------------------------------------------------------------
const uid = () => crypto.randomUUID()
const now = () => new Date().toISOString()

const db = {
  sessions: new Map(), // sid -> userId
  users: [],
  teams: [],
  customers: [],
  businesses: [],
  leads: [],
  deals: [],
  dealItems: [],
  quotations: [],
  payments: [],
  tasks: [],
  activities: [],
  installations: [],
  comments: [],
  attachments: [],
  attachmentFiles: new Map(), // id -> Buffer
  notifications: [],
}

function seed() {
  const teamSales = { id: uid(), name: 'Sales', description: 'Sotuv bo‘limi', lead: null, status: 'active', membersCount: 2 }
  const teamInstall = { id: uid(), name: 'Installation', description: 'O‘rnatish bo‘limi', lead: null, status: 'active', membersCount: 1 }
  db.teams.push(teamSales, teamInstall)

  const admin = {
    id: uid(),
    name: 'Admin Zenix',
    email: 'admin@zenix.com',
    password: 'admin123',
    phone: '+998901234567',
    role: 'SUPER_ADMIN',
    permissions: [],
    team: teamSales,
    status: 'active',
    createdAt: now(),
  }
  const sales = {
    id: uid(),
    name: 'Sardor Aliyev',
    email: 'sardor@zenix.com',
    password: 'sardor123',
    phone: '+998901112233',
    role: 'SALES',
    permissions: [
      'customers.view', 'customers.create', 'customers.edit',
      'businesses.view', 'businesses.create', 'businesses.edit',
      'leads.view', 'leads.create', 'leads.edit',
      'deals.view', 'deals.create', 'deals.edit',
      'quotations.view', 'quotations.create', 'quotations.edit',
      'payments.view', 'payments.create',
      'tasks.view', 'tasks.create', 'tasks.edit',
      'activities.view', 'activities.create',
      'installations.view',
      'attachments.create', 'comments.create',
    ],
    team: teamSales,
    status: 'active',
    createdAt: now(),
  }
  const installer = {
    id: uid(),
    name: 'Javohir Karimov',
    email: 'javohir@zenix.com',
    password: 'javohir123',
    phone: '+998903334455',
    role: 'INSTALLER',
    permissions: ['installations.view', 'installations.edit', 'tasks.view', 'activities.view', 'activities.create', 'comments.create'],
    team: teamInstall,
    status: 'active',
    createdAt: now(),
  }
  db.users.push(admin, sales, installer)
  teamSales.lead = { id: sales.id, name: sales.name }
  teamInstall.lead = { id: installer.id, name: installer.name }

  const customer1 = {
    id: uid(),
    name: 'Ali Valiyev',
    phone: '+998901234500',
    email: 'ali@example.com',
    assignedEmployee: { id: sales.id, name: sales.name },
    status: 'active',
    createdAt: now(),
  }
  const customer2 = {
    id: uid(),
    name: 'Malika Rustamova',
    phone: '+998907654321',
    email: 'malika@example.com',
    assignedEmployee: { id: sales.id, name: sales.name },
    status: 'active',
    createdAt: now(),
  }
  db.customers.push(customer1, customer2)

  const business1 = {
    id: uid(),
    name: 'Ali Restaurant',
    businessType: 'Restoran',
    customer: { id: customer1.id, name: customer1.name },
    phone: '+998901234500',
    email: 'ali@example.com',
    address: 'Amir Temur ko‘chasi 12',
    city: 'Toshkent',
    status: 'active',
    assignedEmployee: { id: sales.id, name: sales.name },
    notes: 'VIP mijoz',
    createdAt: now(),
  }
  db.businesses.push(business1)
  customer1.business = { id: business1.id, name: business1.name }

  const lead1 = {
    id: uid(),
    title: 'POS tizimi uchun qiziqish',
    customer: { id: customer1.id, name: customer1.name },
    business: { id: business1.id, name: business1.name },
    source: 'INSTAGRAM',
    assignedEmployee: { id: sales.id, name: sales.name },
    interestLevel: 'HIGH',
    need: 'Restoran uchun zamonaviy POS kerak',
    interestedProduct: 'POS terminal',
    status: 'QUOTATION',
    expectedValue: 4500000,
    nextFollowUpDate: null,
    notes: '',
    dealId: null,
    createdAt: now(),
  }
  const lead2 = {
    id: uid(),
    title: 'Kassa apparati so‘rovi',
    customer: { id: customer2.id, name: customer2.name },
    business: null,
    source: 'TELEGRAM',
    assignedEmployee: { id: sales.id, name: sales.name },
    interestLevel: 'MEDIUM',
    need: 'Kichik do‘kon uchun kassa',
    interestedProduct: 'Kassa apparati',
    status: 'NEW',
    expectedValue: 1200000,
    nextFollowUpDate: null,
    notes: '',
    dealId: null,
    createdAt: now(),
  }
  db.leads.push(lead1, lead2)

  const deal1 = {
    id: uid(),
    name: 'Ali Restaurant — POS o‘rnatish',
    customer: { id: customer1.id, name: customer1.name },
    business: { id: business1.id, name: business1.name },
    salesEmployee: { id: sales.id, name: sales.name },
    stage: 'QUOTATION',
    value: 4500000,
    paymentStatus: 'PARTIAL',
    installationStatus: 'PENDING',
    expectedCloseDate: null,
    createdAt: now(),
  }
  db.deals.push(deal1)
  lead1.dealId = deal1.id

  const item1 = { id: uid(), dealId: deal1.id, product: 'POS terminal (Android)', quantity: 2, unitPrice: 2000000, discount: 100000, total: 3900000, createdAt: now() }
  const item2 = { id: uid(), dealId: deal1.id, product: 'Termal printer', quantity: 2, unitPrice: 300000, discount: 0, total: 600000, createdAt: now() }
  db.dealItems.push(item1, item2)

  const quotation1 = {
    id: uid(),
    number: '2026-0001',
    dealId: deal1.id,
    deal: { id: deal1.id, name: deal1.name },
    customer: { id: customer1.id, name: customer1.name, phone: customer1.phone, email: customer1.email },
    business: { id: business1.id, name: business1.name, address: business1.address },
    total: 4500000,
    status: 'SENT',
    validUntil: null,
    notes: 'Yetkazib berish narxga kirmagan',
    createdAt: now(),
  }
  db.quotations.push(quotation1)

  db.payments.push({
    id: uid(),
    dealId: deal1.id,
    deal: { id: deal1.id, name: deal1.name },
    customer: { id: customer1.id, name: customer1.name },
    business: { id: business1.id, name: business1.name },
    amount: 2000000,
    method: 'CASH',
    status: 'PAID',
    date: now().slice(0, 10),
    employee: { id: sales.id, name: sales.name },
    createdAt: now(),
  })

  db.tasks.push({
    id: uid(),
    title: 'Ali bilan quotation bo‘yicha bog‘lanish',
    description: 'Taklifnoma yuborilgan, javob kutilmoqda',
    assignedEmployee: { id: sales.id, name: sales.name },
    assignedEmployeeId: sales.id,
    customer: { id: customer1.id, name: customer1.name },
    deal: { id: deal1.id, name: deal1.name },
    dueDate: null,
    priority: 'HIGH',
    status: 'TODO',
    createdAt: now(),
  })

  db.activities.push({
    id: uid(),
    type: 'CALL',
    title: 'Birinchi qo‘ng‘iroq',
    description: 'Ehtiyojlar aniqlandi',
    employeeName: sales.name,
    customerId: customer1.id,
    businessId: business1.id,
    leadId: lead1.id,
    dealId: null,
    date: now(),
    duration: 12,
    result: 'Qiziqish yuqori',
    nextAction: 'Demo ko‘rsatish',
    createdAt: now(),
  })
  db.activities.push({
    id: uid(),
    type: 'DEMO',
    title: 'POS demo',
    description: 'Mahsulot imkoniyatlari ko‘rsatildi',
    employeeName: sales.name,
    customerId: customer1.id,
    businessId: business1.id,
    leadId: lead1.id,
    dealId: deal1.id,
    date: now(),
    duration: 30,
    result: 'Mijoz mamnun',
    nextAction: 'Quotation yuborish',
    createdAt: now(),
  })

  db.installations.push({
    id: uid(),
    dealId: deal1.id,
    deal: { id: deal1.id, name: deal1.name },
    dealItemId: item1.id,
    dealItem: { id: item1.id, product: item1.product },
    customer: { id: customer1.id, name: customer1.name },
    business: { id: business1.id, name: business1.name },
    assignedEmployee: { id: installer.id, name: installer.name },
    address: business1.address,
    scheduledDate: null,
    startedDate: null,
    completedDate: null,
    status: 'SCHEDULED',
    notes: '',
    createdAt: now(),
  })

  db.notifications.push({
    id: uid(),
    title: 'New task assigned',
    message: '"Ali bilan quotation bo‘yicha bog‘lanish" sizga biriktirildi',
    type: 'task',
    read: false,
    relatedEntityType: 'task',
    relatedEntityId: null,
    createdAt: now(),
  })
  db.notifications.push({
    id: uid(),
    title: 'Deal moved to Quotation',
    message: `"${deal1.name}" Quotation bosqichiga o‘tdi`,
    type: 'deal',
    read: false,
    relatedEntityType: 'deal',
    relatedEntityId: deal1.id,
    createdAt: now(),
  })
}
seed()

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function publicUser(user) {
  const { password, ...rest } = user
  return rest
}

function requireAuth(req, res, next) {
  const sid = req.cookies.sid
  const userId = sid && db.sessions.get(sid)
  const user = db.users.find((u) => u.id === userId)
  if (!user) return res.status(401).json({ message: 'Sessiya topilmadi. Iltimos qayta kiring.' })
  req.user = user
  next()
}

function paginate(list, query, { searchFields = [], relationFields = [] } = {}) {
  let result = [...list]

  relationFields.forEach((field) => {
    if (query[field]) result = result.filter((item) => String(resolveRelationId(item, field)) === String(query[field]))
  })

  if (query.status) result = result.filter((item) => item.status === query.status)
  if (query.source) result = result.filter((item) => item.source === query.source)
  if (query.method) result = result.filter((item) => item.method === query.method)
  if (query.type) result = result.filter((item) => item.type === query.type)

  if (query.search) {
    const term = String(query.search).toLowerCase()
    result = result.filter((item) => searchFields.some((field) => String(item[field] || '').toLowerCase().includes(term)))
  }

  if (query.assignedToMe === 'true' && query.__currentUserId) {
    result = result.filter((item) => resolveAssignedEmployeeId(item) === query.__currentUserId)
  }

  if (query.sort) {
    const desc = query.sort.startsWith('-')
    const field = desc ? query.sort.slice(1) : query.sort
    result.sort((a, b) => {
      const av = a[field] ?? ''
      const bv = b[field] ?? ''
      if (av < bv) return desc ? 1 : -1
      if (av > bv) return desc ? -1 : 1
      return 0
    })
  }

  const total = result.length
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 20
  const items = result.slice((page - 1) * pageSize, page * pageSize)
  return { items, total, page, pageSize }
}

function resolveRelationId(item, field) {
  if (field === 'customerId') return item.customer?.id ?? item.customerId
  if (field === 'businessId') return item.business?.id ?? item.businessId
  if (field === 'dealId') return item.deal?.id ?? item.dealId
  if (field === 'leadId') return item.lead?.id ?? item.leadId
  if (field === 'installationId') return item.installation?.id ?? item.installationId
  if (field === 'salesEmployeeId' || field === 'assignedEmployeeId') return resolveAssignedEmployeeId(item)
  return item[field]
}

// "Assigned employee" is stored under different field names/shapes per
// resource (Tasks: flat assignedEmployeeId, Leads/Installations: nested
// assignedEmployee.id, Deals: nested salesEmployee.id) — this normalizes
// all of them for `assignedToMe` filtering and the Deals/Installations
// employee filter.
function resolveAssignedEmployeeId(item) {
  return item.assignedEmployeeId ?? item.assignedEmployee?.id ?? item.salesEmployee?.id ?? null
}

// The frontend creates records by sending flat *Id fields (customerId,
// businessId, dealId, assignedEmployeeId, ...) — this resolves each one to
// the nested {id, name} display object every list/detail page expects
// (row.customer?.name, row.deal?.name, etc), so newly-created records show
// real names immediately instead of only after a full reload.
function enrichReferences(item) {
  if (item.customerId && !item.customer) {
    const c = db.customers.find((x) => x.id === item.customerId)
    if (c) item.customer = { id: c.id, name: c.name }
  }
  if (item.businessId && !item.business) {
    const b = db.businesses.find((x) => x.id === item.businessId)
    if (b) item.business = { id: b.id, name: b.name }
  }
  if (item.dealId && !item.deal) {
    const d = db.deals.find((x) => x.id === item.dealId)
    // Includes the deal's own customer/business so consumers that fall back
    // to `item.deal?.customer` (e.g. an Installation with no customerId of
    // its own) still resolve a name instead of showing "—".
    if (d) item.deal = { id: d.id, name: d.name, customer: d.customer, business: d.business }
  }
  if (item.leadId && !item.lead) {
    const l = db.leads.find((x) => x.id === item.leadId)
    if (l) item.lead = { id: l.id, title: l.title }
  }
  if (item.dealItemId && !item.dealItem) {
    const di = db.dealItems.find((x) => x.id === item.dealItemId)
    if (di) item.dealItem = { id: di.id, product: di.product }
  }
  if (item.assignedEmployeeId && !item.assignedEmployee) {
    const e = db.users.find((x) => x.id === item.assignedEmployeeId)
    if (e) item.assignedEmployee = { id: e.id, name: e.name }
  }
  if (item.salesEmployeeId && !item.salesEmployee) {
    const e = db.users.find((x) => x.id === item.salesEmployeeId)
    if (e) item.salesEmployee = { id: e.id, name: e.name }
  }
  return item
}

function findOr404(res, list, id, label) {
  const item = list.find((x) => x.id === id)
  if (!item) {
    res.status(404).json({ message: `${label} topilmadi` })
    return null
  }
  return item
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {}
  const user = db.users.find((u) => u.email === email && u.password === password)
  if (!user) return res.status(401).json({ message: 'Email yoki parol noto‘g‘ri' })

  const sid = uid()
  db.sessions.set(sid, user.id)
  res.cookie('sid', sid, { httpOnly: true, sameSite: 'lax', path: '/' })
  res.json(publicUser(user))
})

app.post('/api/auth/logout', (req, res) => {
  const sid = req.cookies.sid
  if (sid) db.sessions.delete(sid)
  res.clearCookie('sid', { path: '/' })
  res.json({ ok: true })
})

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json(publicUser(req.user))
})

app.patch('/api/users/me', requireAuth, (req, res) => {
  Object.assign(req.user, req.body)
  res.json(publicUser(req.user))
})

// ---------------------------------------------------------------------------
// Employees
// ---------------------------------------------------------------------------
app.use('/api', requireAuth)

app.get('/api/employees', (req, res) => res.json(paginate(db.users, req.query, { searchFields: ['name', 'email'] })))
app.get('/api/employees/:id', (req, res) => {
  const user = findOr404(res, db.users, req.params.id, 'Xodim')
  if (user) res.json(publicUser(user))
})
app.post('/api/employees', (req, res) => {
  const employee = { id: uid(), status: 'active', createdAt: now(), ...req.body, password: req.body.password || 'changeme123' }
  db.users.push(employee)
  res.status(201).json(publicUser(employee))
})
app.patch('/api/employees/:id', (req, res) => {
  const user = findOr404(res, db.users, req.params.id, 'Xodim')
  if (!user) return
  Object.assign(user, req.body)
  res.json(publicUser(user))
})
app.post('/api/employees/:id/activate', (req, res) => {
  const user = findOr404(res, db.users, req.params.id, 'Xodim')
  if (!user) return
  user.status = 'active'
  res.json(publicUser(user))
})
app.post('/api/employees/:id/deactivate', (req, res) => {
  const user = findOr404(res, db.users, req.params.id, 'Xodim')
  if (!user) return
  user.status = 'inactive'
  res.json(publicUser(user))
})
app.get('/api/employees/:id/tasks', (req, res) => res.json(paginate(db.tasks.filter((t) => t.assignedEmployeeId === req.params.id), {})))
app.get('/api/employees/:id/leads', (req, res) => res.json(paginate(db.leads.filter((l) => l.assignedEmployee?.id === req.params.id), {})))
app.get('/api/employees/:id/deals', (req, res) => res.json(paginate(db.deals.filter((d) => d.salesEmployee?.id === req.params.id), {})))
app.get('/api/employees/:id/installations', (req, res) =>
  res.json(paginate(db.installations.filter((i) => i.assignedEmployee?.id === req.params.id), {}))
)

// ---------------------------------------------------------------------------
// Teams
// ---------------------------------------------------------------------------
app.get('/api/teams', (req, res) => res.json(paginate(db.teams, req.query, { searchFields: ['name'] })))
app.get('/api/teams/:id', (req, res) => {
  const team = findOr404(res, db.teams, req.params.id, 'Jamoa')
  if (team) res.json(team)
})
app.post('/api/teams', (req, res) => {
  const team = { id: uid(), status: 'active', membersCount: 0, members: [], createdAt: now(), ...req.body }
  db.teams.push(team)
  res.status(201).json(team)
})
app.patch('/api/teams/:id', (req, res) => {
  const team = findOr404(res, db.teams, req.params.id, 'Jamoa')
  if (!team) return
  Object.assign(team, req.body)
  res.json(team)
})
app.delete('/api/teams/:id', (req, res) => {
  const index = db.teams.findIndex((t) => t.id === req.params.id)
  if (index === -1) return res.status(404).json({ message: 'Jamoa topilmadi' })
  db.teams.splice(index, 1)
  res.status(204).end()
})

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------
const seededRoles = [
  { id: uid(), name: 'SUPER_ADMIN', permissions: [] },
  { id: uid(), name: 'SALES', permissions: db.users.find((u) => u.role === 'SALES')?.permissions ?? [] },
  { id: uid(), name: 'INSTALLER', permissions: db.users.find((u) => u.role === 'INSTALLER')?.permissions ?? [] },
]
app.get('/api/roles', (req, res) => res.json(paginate(seededRoles, req.query, { searchFields: ['name'] })))
app.get('/api/roles/permissions-schema', (req, res) => res.json([]))
app.get('/api/roles/:id', (req, res) => {
  const role = findOr404(res, seededRoles, req.params.id, 'Rol')
  if (role) res.json(role)
})

// ---------------------------------------------------------------------------
// Generic CRM resource factory
// ---------------------------------------------------------------------------
function registerResource(
  path,
  collection,
  { searchFields = ['name'], relationFields = [], skipCreate = false, defaultStatus = 'active' } = {}
) {
  app.get(`/api/${path}`, (req, res) => res.json(paginate(collection, { ...req.query, __currentUserId: req.user.id }, { searchFields, relationFields })))
  app.get(`/api/${path}/:id`, (req, res) => {
    const item = findOr404(res, collection, req.params.id, path)
    if (item) res.json(item)
  })
  // skipCreate: true means a resource registers its own POST handler
  // elsewhere (quotations/payments/tasks/activities need bespoke defaults
  // like an auto-numbered `number` or `employeeName` from the session) —
  // Express only invokes the FIRST matching handler for a route, so this
  // generic one must not be registered at all for those, or it would
  // silently shadow the specialized one.
  if (!skipCreate) {
    app.post(`/api/${path}`, (req, res) => {
      const item = enrichReferences({ id: uid(), status: req.body.status || defaultStatus, createdAt: now(), ...req.body })
      collection.push(item)
      res.status(201).json(item)
    })
  }
  app.patch(`/api/${path}/:id`, (req, res) => {
    const item = findOr404(res, collection, req.params.id, path)
    if (!item) return
    Object.assign(item, req.body)
    enrichReferences(item)
    res.json(item)
  })
}

registerResource('customers', db.customers, { searchFields: ['name', 'phone', 'email'] })
app.post('/api/customers/:id/deactivate', (req, res) => {
  const customer = findOr404(res, db.customers, req.params.id, 'Mijoz')
  if (!customer) return
  customer.status = customer.status === 'active' ? 'inactive' : 'active'
  res.json(customer)
})

registerResource('businesses', db.businesses, { searchFields: ['name', 'city'], relationFields: ['customerId'] })
app.get('/api/businesses/:id/products', (req, res) => {
  const items = db.dealItems.filter((item) => {
    const deal = db.deals.find((d) => d.id === item.dealId)
    return deal?.business?.id === req.params.id
  })
  res.json({ items, total: items.length })
})

registerResource('leads', db.leads, { searchFields: ['title'], relationFields: ['customerId', 'businessId'] })
app.delete('/api/leads/:id', (req, res) => {
  const index = db.leads.findIndex((l) => l.id === req.params.id)
  if (index === -1) return res.status(404).json({ message: 'Lead topilmadi' })
  db.leads.splice(index, 1)
  res.status(204).end()
})
app.post('/api/leads/:id/convert-to-deal', (req, res) => {
  const lead = findOr404(res, db.leads, req.params.id, 'Lead')
  if (!lead) return
  // Customer/business always come from the lead itself — the payload from
  // the Convert to Deal modal only supplies editable fields (name/value/
  // assigned employee/products note), never re-creates them.
  const { name, value, salesEmployeeId, productsNote } = req.body || {}
  const salesEmployee = salesEmployeeId ? db.users.find((u) => u.id === salesEmployeeId) : lead.assignedEmployee
  const deal = {
    id: uid(),
    name: name || lead.title,
    customer: lead.customer,
    business: lead.business,
    salesEmployee: salesEmployee ? { id: salesEmployee.id, name: salesEmployee.name } : lead.assignedEmployee,
    stage: 'NEW',
    value: value != null ? value : lead.expectedValue,
    productsNote: productsNote || lead.interestedProduct || '',
    paymentStatus: 'PENDING',
    installationStatus: 'PENDING',
    expectedCloseDate: null,
    createdAt: now(),
  }
  db.deals.push(deal)
  lead.dealId = deal.id
  lead.status = 'WON'
  res.status(201).json({ id: deal.id, dealId: deal.id })
})

registerResource('deals', db.deals, { searchFields: ['name'], relationFields: ['customerId', 'businessId', 'salesEmployeeId'] })
app.patch('/api/deals/:id/stage', (req, res) => {
  const deal = findOr404(res, db.deals, req.params.id, 'Deal')
  if (!deal) return
  deal.stage = req.body.stage
  res.json(deal)
})
app.get('/api/deals/:dealId/items', (req, res) => {
  const items = db.dealItems.filter((item) => item.dealId === req.params.dealId)
  res.json({ items, total: items.length })
})
app.post('/api/deals/:dealId/items', (req, res) => {
  const item = {
    id: uid(),
    dealId: req.params.dealId,
    createdAt: now(),
    ...req.body,
    total: Math.max(0, Number(req.body.quantity || 0) * Number(req.body.unitPrice || 0) - Number(req.body.discount || 0)),
  }
  db.dealItems.push(item)
  res.status(201).json(item)
})
app.patch('/api/deals/:dealId/items/:itemId', (req, res) => {
  const item = findOr404(res, db.dealItems, req.params.itemId, 'Mahsulot')
  if (!item) return
  Object.assign(item, req.body)
  item.total = Math.max(0, Number(item.quantity || 0) * Number(item.unitPrice || 0) - Number(item.discount || 0))
  res.json(item)
})
app.delete('/api/deals/:dealId/items/:itemId', (req, res) => {
  const index = db.dealItems.findIndex((i) => i.id === req.params.itemId)
  if (index === -1) return res.status(404).json({ message: 'Mahsulot topilmadi' })
  db.dealItems.splice(index, 1)
  res.status(204).end()
})

registerResource('quotations', db.quotations, { searchFields: ['number'], relationFields: ['dealId'], skipCreate: true })
app.post('/api/quotations', (req, res) => {
  const deal = db.deals.find((d) => d.id === req.body.dealId)
  const quotation = {
    id: uid(),
    number: `2026-${String(db.quotations.length + 1).padStart(4, '0')}`,
    dealId: req.body.dealId,
    deal: deal ? { id: deal.id, name: deal.name } : null,
    customer: deal?.customer ?? null,
    business: deal?.business ?? null,
    total: deal?.value ?? 0,
    status: 'DRAFT',
    createdAt: now(),
    ...req.body,
  }
  db.quotations.push(quotation)
  res.status(201).json(quotation)
})
app.post('/api/quotations/:id/send', (req, res) => transitionQuotation(req, res, 'SENT'))
app.post('/api/quotations/:id/accept', (req, res) => transitionQuotation(req, res, 'ACCEPTED'))
app.post('/api/quotations/:id/reject', (req, res) => transitionQuotation(req, res, 'REJECTED'))
function transitionQuotation(req, res, status) {
  const quotation = findOr404(res, db.quotations, req.params.id, 'Taklifnoma')
  if (!quotation) return
  quotation.status = status
  res.json(quotation)
}

registerResource('payments', db.payments, { searchFields: [], relationFields: ['customerId', 'businessId', 'dealId'], skipCreate: true })
app.post('/api/payments', (req, res) => {
  const deal = db.deals.find((d) => d.id === req.body.dealId)
  const payment = {
    id: uid(),
    createdAt: now(),
    deal: deal ? { id: deal.id, name: deal.name } : null,
    customer: deal?.customer ?? null,
    business: deal?.business ?? null,
    employee: { id: req.user.id, name: req.user.name },
    ...req.body,
  }
  db.payments.push(payment)
  res.status(201).json(payment)
})

registerResource('tasks', db.tasks, {
  searchFields: ['title'],
  relationFields: ['customerId', 'businessId', 'leadId', 'dealId', 'installationId'],
  skipCreate: true,
})
app.post('/api/tasks', (req, res) => {
  const task = enrichReferences({ id: uid(), status: 'TODO', createdAt: now(), ...req.body })
  db.tasks.push(task)
  res.status(201).json(task)
})

registerResource('activities', db.activities, {
  searchFields: ['title'],
  relationFields: ['customerId', 'businessId', 'leadId', 'dealId', 'installationId'],
  skipCreate: true,
})
app.post('/api/activities', (req, res) => {
  const activity = enrichReferences({ id: uid(), employeeName: req.user.name, createdAt: now(), date: req.body.date || now(), ...req.body })
  db.activities.push(activity)
  res.status(201).json(activity)
})

registerResource('installations', db.installations, {
  searchFields: [],
  relationFields: ['customerId', 'businessId', 'dealId', 'assignedEmployeeId'],
  defaultStatus: 'PENDING',
})

// ---------------------------------------------------------------------------
// Comments (generic, entityType + entityId)
// ---------------------------------------------------------------------------
app.get('/api/comments', (req, res) => {
  const { entityType, entityId } = req.query
  const items = db.comments.filter((c) => c.entityType === entityType && c.entityId === entityId)
  res.json({ items, total: items.length })
})
app.post('/api/comments', (req, res) => {
  const comment = {
    id: uid(),
    author: { id: req.user.id, name: req.user.name, avatarUrl: req.user.avatarUrl },
    createdAt: now(),
    ...req.body,
  }
  db.comments.push(comment)
  res.status(201).json(comment)
})
app.patch('/api/comments/:id', (req, res) => {
  const comment = findOr404(res, db.comments, req.params.id, 'Izoh')
  if (!comment) return
  Object.assign(comment, req.body)
  res.json(comment)
})
app.delete('/api/comments/:id', (req, res) => {
  const index = db.comments.findIndex((c) => c.id === req.params.id)
  if (index === -1) return res.status(404).json({ message: 'Izoh topilmadi' })
  db.comments.splice(index, 1)
  res.status(204).end()
})

// ---------------------------------------------------------------------------
// Attachments (real in-memory file storage — actually downloadable)
// ---------------------------------------------------------------------------
app.get('/api/attachments', (req, res) => {
  const { entityType, entityId } = req.query
  const items = db.attachments.filter((a) => a.entityType === entityType && a.entityId === entityId)
  res.json({ items, total: items.length })
})
app.post('/api/attachments', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Fayl topilmadi' })
  const id = uid()
  db.attachmentFiles.set(id, req.file.buffer)
  const attachment = {
    id,
    entityType: req.body.entityType,
    entityId: req.body.entityId,
    name: req.file.originalname,
    size: req.file.size,
    uploadedBy: { id: req.user.id, name: req.user.name },
    url: `/api/attachments/${id}/download`,
    createdAt: now(),
  }
  db.attachments.push(attachment)
  res.status(201).json(attachment)
})
app.get('/api/attachments/:id/download', (req, res) => {
  const attachment = db.attachments.find((a) => a.id === req.params.id)
  const buffer = db.attachmentFiles.get(req.params.id)
  if (!attachment || !buffer) return res.status(404).json({ message: 'Fayl topilmadi' })
  res.setHeader('Content-Disposition', `attachment; filename="${attachment.name}"`)
  res.send(buffer)
})
app.delete('/api/attachments/:id', (req, res) => {
  const index = db.attachments.findIndex((a) => a.id === req.params.id)
  if (index === -1) return res.status(404).json({ message: 'Fayl topilmadi' })
  db.attachments.splice(index, 1)
  db.attachmentFiles.delete(req.params.id)
  res.status(204).end()
})

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------
app.get('/api/notifications', (req, res) => res.json(paginate(db.notifications, req.query)))
app.get('/api/notifications/unread-count', (req, res) => res.json({ count: db.notifications.filter((n) => !n.read).length }))
app.post('/api/notifications/:id/read', (req, res) => {
  const notification = findOr404(res, db.notifications, req.params.id, 'Bildirishnoma')
  if (!notification) return
  notification.read = true
  res.json(notification)
})
app.post('/api/notifications/mark-all-read', (req, res) => {
  db.notifications.forEach((n) => (n.read = true))
  res.json({ ok: true })
})

// ---------------------------------------------------------------------------
// Timeline — cross-entity merged history for a Customer or Deal
// ---------------------------------------------------------------------------
app.get('/api/timeline', (req, res) => {
  const { entityType, entityId } = req.query
  const events = []

  const addLead = (l) => events.push({ id: `lead-${l.id}`, type: 'LEAD_CREATED', date: l.createdAt, title: l.title, employeeName: l.assignedEmployee?.name })
  const addDeal = (d) =>
    events.push({ id: `deal-${d.id}`, type: 'STAGE_CHANGED', date: d.createdAt, title: `${d.name} — ${d.stage}`, employeeName: d.salesEmployee?.name })
  const addQuotation = (q) => events.push({ id: `quote-${q.id}`, type: 'QUOTATION_CREATED', date: q.createdAt, title: `Taklifnoma #${q.number}` })
  const addPayment = (p) =>
    events.push({ id: `pay-${p.id}`, type: 'PAYMENT_RECEIVED', date: p.date || p.createdAt, title: `${p.amount} (${p.method})`, employeeName: p.employee?.name })
  const addInstallation = (i) => {
    events.push({ id: `inst-sched-${i.id}`, type: 'INSTALLATION_SCHEDULED', date: i.createdAt, title: i.address, employeeName: i.assignedEmployee?.name })
    if (i.completedDate) events.push({ id: `inst-done-${i.id}`, type: 'INSTALLATION_COMPLETED', date: i.completedDate, title: i.address })
  }
  const addActivity = (a) => events.push({ id: `act-${a.id}`, type: a.type, date: a.date, title: a.title, description: a.description, employeeName: a.employeeName })
  const addCompletedTask = (t) => {
    if (t.status === 'COMPLETED') events.push({ id: `task-${t.id}`, type: 'TASK_COMPLETED', date: t.createdAt, title: t.title })
  }

  if (entityType === 'customer') {
    const leads = db.leads.filter((l) => l.customer?.id === entityId)
    const deals = db.deals.filter((d) => d.customer?.id === entityId)
    const dealIds = deals.map((d) => d.id)
    leads.forEach(addLead)
    deals.forEach(addDeal)
    db.quotations.filter((q) => dealIds.includes(q.dealId)).forEach(addQuotation)
    db.payments.filter((p) => dealIds.includes(p.dealId)).forEach(addPayment)
    db.installations.filter((i) => i.customer?.id === entityId || dealIds.includes(i.dealId)).forEach(addInstallation)
    db.activities.filter((a) => a.customerId === entityId).forEach(addActivity)
    db.tasks.filter((t) => t.customer?.id === entityId).forEach(addCompletedTask)
  } else if (entityType === 'deal') {
    const deal = db.deals.find((d) => d.id === entityId)
    if (deal) addDeal(deal)
    db.quotations.filter((q) => q.dealId === entityId).forEach(addQuotation)
    db.payments.filter((p) => p.dealId === entityId).forEach(addPayment)
    db.installations.filter((i) => i.dealId === entityId).forEach(addInstallation)
    db.activities.filter((a) => a.dealId === entityId).forEach(addActivity)
    db.tasks.filter((t) => t.deal?.id === entityId).forEach(addCompletedTask)
  }

  events.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))
  res.json({ items: events })
})

// ---------------------------------------------------------------------------
// Global search
// ---------------------------------------------------------------------------
app.get('/api/search', (req, res) => {
  const term = String(req.query.q || '').toLowerCase()
  if (!term) return res.json({ items: [] })

  const items = [
    ...db.customers.filter((c) => c.name.toLowerCase().includes(term)).map((c) => ({ type: 'customer', id: c.id, label: c.name })),
    ...db.businesses.filter((b) => b.name.toLowerCase().includes(term)).map((b) => ({ type: 'business', id: b.id, label: b.name })),
    ...db.leads.filter((l) => l.title.toLowerCase().includes(term)).map((l) => ({ type: 'lead', id: l.id, label: l.title })),
    ...db.deals.filter((d) => d.name.toLowerCase().includes(term)).map((d) => ({ type: 'deal', id: d.id, label: d.name })),
  ]
  res.json({ items })
})

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------
app.get('/api/analytics/dashboard-summary', (req, res) => {
  res.json({
    totalLeads: db.leads.length,
    activeDeals: db.deals.filter((d) => !['WON', 'LOST'].includes(d.stage)).length,
    wonDeals: db.deals.filter((d) => d.stage === 'WON').length,
    revenue: db.payments.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + Number(p.amount || 0), 0),
    pendingPayments: db.payments.filter((p) => p.status === 'PENDING').length,
    installations: db.installations.length,
    tasks: db.tasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length,
  })
})
app.get('/api/analytics/leads-by-status', (req, res) => {
  const counts = {}
  db.leads.forEach((l) => (counts[l.status] = (counts[l.status] || 0) + 1))
  res.json(Object.entries(counts).map(([status, count]) => ({ status, count })))
})
app.get('/api/analytics/deals-by-stage', (req, res) => {
  const counts = {}
  db.deals.forEach((d) => (counts[d.stage] = (counts[d.stage] || 0) + 1))
  res.json(Object.entries(counts).map(([stage, count]) => ({ stage, count })))
})
app.get('/api/analytics/revenue', (req, res) => {
  res.json([{ period: 'This month', amount: db.payments.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + Number(p.amount || 0), 0) }])
})
app.get('/api/analytics/installations-by-status', (req, res) => {
  const counts = {}
  db.installations.forEach((i) => (counts[i.status] = (counts[i.status] || 0) + 1))
  res.json(Object.entries(counts).map(([status, count]) => ({ status, count })))
})
app.get('/api/analytics/employee-performance/:id', (req, res) => {
  const employeeId = req.params.id
  const leads = db.leads.filter((l) => l.assignedEmployee?.id === employeeId)
  const deals = db.deals.filter((d) => d.salesEmployee?.id === employeeId)
  const wonDeals = deals.filter((d) => d.stage === 'WON')
  const revenue = db.payments
    .filter((p) => p.status === 'PAID' && deals.some((d) => d.id === p.dealId))
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const tasksCompleted = db.tasks.filter((t) => t.assignedEmployeeId === employeeId && t.status === 'COMPLETED').length
  const installationsCompleted = db.installations.filter((i) => i.assignedEmployee?.id === employeeId && i.status === 'COMPLETED').length

  res.json({
    leads: leads.length,
    deals: deals.length,
    wonDeals: wonDeals.length,
    revenue,
    tasksCompleted,
    installationsCompleted,
  })
})

app.listen(PORT, () => {
  console.log(`ZENIX CRM mock-server running at http://localhost:${PORT}`)
  console.log('Seeded login: admin@zenix.com / admin123 (SUPER_ADMIN)')
  console.log('Also: sardor@zenix.com / sardor123 (SALES), javohir@zenix.com / javohir123 (INSTALLER)')
})
