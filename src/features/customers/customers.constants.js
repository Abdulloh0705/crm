export const CUSTOMER_STATUSES = ['active', 'inactive']

export const CUSTOMER_STATUS_LABELS = {
  active: 'Faol',
  inactive: 'Nofaol',
}

// Mijoz bilan ishlash jarayoni (Bitrix-style pipeline) — customer.status
// (active/inactive) dan alohida: bu mijozning savdo jarayonidagi bosqichi,
// u esa hisobning faollik holati.
export const CUSTOMER_STAGES = ['NEW', 'CONTACTED', 'ORDERED', 'PAID', 'INSTALLING', 'DONE']

export const CUSTOMER_STAGE_LABELS = {
  NEW: 'Yangi',
  CONTACTED: 'Gaplashildi',
  ORDERED: 'Buyurtma olindi',
  PAID: 'To‘lov qilindi',
  INSTALLING: 'O‘rnatish',
  DONE: 'Tugallandi',
}

export const CUSTOMER_STAGE_BADGE_VARIANTS = {
  NEW: 'gray',
  CONTACTED: 'info',
  ORDERED: 'warning',
  PAID: 'primary',
  INSTALLING: 'warning',
  DONE: 'success',
}

export const PROGRAM_STATUSES = ['NEW', 'INSTALLING', 'ACTIVE', 'SUSPENDED', 'EXPIRED']

export const PROGRAM_STATUS_LABELS = {
  NEW: 'Yangi',
  INSTALLING: 'O‘rnatilmoqda',
  ACTIVE: 'Faol',
  SUSPENDED: 'To‘xtatilgan',
  EXPIRED: 'Tugagan',
}

export const PROGRAM_STATUS_BADGE_VARIANTS = {
  NEW: 'info',
  INSTALLING: 'warning',
  ACTIVE: 'success',
  SUSPENDED: 'gray',
  EXPIRED: 'danger',
}

export const CUSTOM_FIELD_TYPES = ['TEXT', 'NUMBER', 'DATE', 'SELECT', 'BOOLEAN', 'PHONE', 'ADDRESS']

export const CUSTOM_FIELD_TYPE_LABELS = {
  TEXT: 'Matn',
  NUMBER: 'Raqam',
  DATE: 'Sana',
  SELECT: 'Tanlash',
  BOOLEAN: 'Ha/Yo‘q',
  PHONE: 'Telefon',
  ADDRESS: 'Manzil',
}
