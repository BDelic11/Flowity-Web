import { UserRole as Role, UserRole } from "@prisma/client";

export type Permission =
  | "manage_staff"
  | "view_all_calendars"
  | "manage_appointments"
  | "manage_services"
  | "manage_tenant_settings"
  | "invite_staff"
  | "view_staff_page"
  | "edit_own_profile";

export type Permissions = Record<Permission, boolean>;

export const canManageSettings = (role: UserRole) =>
  role === "OWNER" || role === "ADMIN";

export const ROLE_PERMISSIONS: Record<Role, Permissions> = {
  OWNER: {
    manage_staff: true,
    view_all_calendars: true,
    manage_appointments: true,
    manage_services: true,
    manage_tenant_settings: true,
    invite_staff: true,
    view_staff_page: true,
    edit_own_profile: true,
  },
  ADMIN: {
    manage_staff: true,
    view_all_calendars: true,
    manage_appointments: true,
    manage_services: true,
    manage_tenant_settings: false, // flip to true if you want admins to change billing/tenant
    invite_staff: true,
    view_staff_page: true,
    edit_own_profile: true,
  },
  STAFF: {
    manage_staff: false,
    view_all_calendars: false, // sees own calendar only
    manage_appointments: true, // often allowed (their own)
    manage_services: false,
    manage_tenant_settings: false,
    invite_staff: false,
    view_staff_page: false, // hide Staff page entirely
    edit_own_profile: true,
  },
};

export type PermissionOverride = Partial<Permissions>;

export function getEffectivePermissions(
  role: Role,
  override?: PermissionOverride
): Permissions {
  return { ...(ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.STAFF), ...override };
}

export function hasPerm(effective: Permissions, perm: Permission) {
  return !!effective[perm];
}

export const STAFF_CAN_CREATE_OWN_SERVICE = true;

export const canStaffCreateOwnService = (role: Role) =>
  role === "STAFF" && STAFF_CAN_CREATE_OWN_SERVICE;

// ---- helpers ---------------------------------------------------------------

export function getPermissionsForRole(role: Role): Permissions {
  return ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.STAFF;
}

export function has(role: Role, perm: Permission): boolean {
  return !!ROLE_PERMISSIONS[role]?.[perm];
}

// Optional ergonomic wrappers
export const canManageStaff = (role: Role) => has(role, "manage_staff");
export const canViewAllCalendars = (role: Role) =>
  has(role, "view_all_calendars");
export const canManageAppointments = (role: Role) =>
  has(role, "manage_appointments");
export const canManageServices = (role: Role) => has(role, "manage_services");
export const canManageTenantSettings = (role: Role) =>
  has(role, "manage_tenant_settings");
export const canInviteStaff = (role: Role) => has(role, "invite_staff");
export const canViewStaffPage = (role: Role) => has(role, "view_staff_page");
export const canEditOwnProfile = (role: Role) => has(role, "edit_own_profile");

// Throwing guard for server actions/pages
export function requirePerm(role: Role, perm: Permission) {
  if (!has(role, perm)) throw new Error("Forbidden");
}

export function requireTenant(userTenantId: string, resourceTenantId: string) {
  if (userTenantId !== resourceTenantId) throw new Error("Forbidden");
}

export function require(perms: Permissions, perm: Permission) {
  if (!perms[perm]) throw new Error("Forbidden");
}

// ---- resource scoping helpers ---------------------------------------------

/**
 * Calendar scoping:
 * - STAFF: returns { staffId: <their staffId> }
 * - OWNER/ADMIN: returns {} (no staff filter, see all)
 */
export function calendarStaffScope(role: Role, staffId?: string) {
  if (canViewAllCalendars(role)) return {};
  return staffId ? { staffId } : { staffId: "__no_staff__" }; // defensively impossible id if missing
}

/**
 * Appointment scoping example for reads.
 * - STAFF: only their appointments
 * - ADMIN/OWNER: all tenant appointments
 */
export function appointmentWhereByRole(
  role: Role,
  tenantId: string,
  staffId?: string
) {
  return {
    tenantId,
    ...(canViewAllCalendars(role) ? {} : calendarStaffScope(role, staffId)),
  };
}
