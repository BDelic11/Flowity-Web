const routes = {
  home: "/dashboard",
  dashboard: "/dashboard",
  calendar: "/dashboard/calendar",
  services: "/dashboard/services",
  settings: "/dashboard/settings",
  staff: "/dashboard/staff",
  login: "/login",
  register: "/register",
  forbidden: "/forbidden",
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

  organizations: "/organizations",
  dashboardMetrics: "/dashboard/metrics",
};

export { routes, apiRoutes };
