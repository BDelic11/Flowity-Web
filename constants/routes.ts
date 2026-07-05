const routes = {
  home: "/dashboard",
  dashboard: "/dashboard",
  calendar: "/dashboard/calendar",
  services: "/dashboard/services",
  settings: "/dashboard/settings",
  clients: "/dashboard/clients",
  profile: "/dashboard/profile",
  export: "/dashboard/export",
  staff: "/dashboard/staff",
  plans: "/plans",
  login: "/login",
  register: "/register",
  forbidden: "/forbidden",
  admin: "/admin",
  adminLogin: "/admin/login",
  tickets: "/admin/tickets",
  products: "/dashboard/products",
  selectOrganization: "/select-organization",
  createOrganization: "/create-organization",
  checkEmail: "/check-email",
  verifyEmail: "/verify-email",
  setPassword: "/set-password",
};

const apiRoutes = {
  // auth
  login: "/auth/login",
  register: "/auth/register",
  googleAuth: "/auth/google",
  me: "/users/me",
  logout: "/auth/logout",

  createOrganization: "/organizations",
  calendar: "/calendar",
  bookings: "/bookings",

  services: "/services",

  staff: "/staff",
  customers: "/customers",
  subscriptions: "/subscriptions",

  organizations: "/organizations",
  dashboardMetrics: "/dashboard/metrics",
};

export { routes, apiRoutes };
