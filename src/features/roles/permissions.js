// Frontend permission architecture.
//
// IMPORTANT: this is a UI-only guard (show/hide elements, block route access
// for UX purposes). It is NOT a security boundary — the backend must enforce
// authorization on every request regardless of what the frontend renders.
//
// ROLES and PERMISSION_SCHEMA below describe *what roles/permissions can
// exist* — that's frontend domain/UI structure, not fabricated backend data.
// Which permissions a given logged-in user actually holds always comes from
// the backend via GET /auth/me (user.permissions: string[]).

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  SALES: 'SALES',
  SUPPORT: 'SUPPORT',
  INSTALLER: 'INSTALLER',
  DEVELOPER: 'DEVELOPER',
}

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super administrator',
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.MANAGER]: 'Menejer',
  [ROLES.SALES]: 'Sotuvchi',
  [ROLES.SUPPORT]: 'Qo‘llab-quvvatlash',
  [ROLES.INSTALLER]: 'O‘rnatuvchi',
  [ROLES.DEVELOPER]: 'Dasturchi',
}

// resource -> available actions. Phase 2 section 16 spelled these out
// explicitly for most resources — matched exactly below. Two corrections
// from Phase 1's earlier guesses: `deals` loses `delete` (spec only lists
// view/create/edit) and `payments` loses `edit` (spec only lists
// view/create). Two additions go beyond the spec's explicit list because the
// described behavior requires them: `activities` (module 9 needs a
// permission and the spec's section 16 list omits it) and the extra
// `tasks.viewAll` action (section 8 requires "employee sees only own tasks,
// admin/manager sees all," which needs a permission distinct from
// `tasks.view`).
export const PERMISSION_SCHEMA = [
  { resource: 'customers', label: 'Mijozlar', actions: ['view', 'create', 'edit', 'delete'] },
  { resource: 'businesses', label: 'Bizneslar', actions: ['view', 'create', 'edit'] },
  { resource: 'leads', label: 'Murojaatlar', actions: ['view', 'create', 'edit', 'delete'] },
  { resource: 'deals', label: 'Savdolar', actions: ['view', 'create', 'edit'] },
  { resource: 'quotations', label: 'Takliflar', actions: ['view', 'create', 'edit'] },
  { resource: 'payments', label: 'To‘lovlar', actions: ['view', 'create'] },
  { resource: 'tasks', label: 'Vazifalar', actions: ['view', 'create', 'edit', 'viewAll'] },
  { resource: 'activities', label: 'Faoliyatlar', actions: ['view', 'create'] },
  { resource: 'installations', label: 'O‘rnatishlar', actions: ['view', 'create', 'edit'] },
  { resource: 'attachments', label: 'Biriktirilgan fayllar', actions: ['create'] },
  { resource: 'comments', label: 'Izohlar', actions: ['create'] },
  { resource: 'employees', label: 'Xodimlar', actions: ['view', 'create', 'edit', 'delete'] },
  // Not explicitly listed in the spec's permission examples ("Masalan..."), but
  // section 4 requires full Team CRUD architecture, so it needs its own
  // resource to stay consistent with the rest of the permission system.
  { resource: 'teams', label: 'Jamoalar', actions: ['view', 'create', 'edit', 'delete'] },
  { resource: 'settings', label: 'Sozlamalar', actions: ['view', 'edit'] },
]

export const ALL_PERMISSIONS = PERMISSION_SCHEMA.flatMap(({ resource, actions }) =>
  actions.map((action) => `${resource}.${action}`)
)

/**
 * can('employees.view') — checks the given permission key against the
 * current user's `permissions` array (as returned by the backend).
 */
export function can(user, permissionKey) {
  if (!user) return false
  if (user.role === ROLES.SUPER_ADMIN) return true
  return Array.isArray(user.permissions) && user.permissions.includes(permissionKey)
}
