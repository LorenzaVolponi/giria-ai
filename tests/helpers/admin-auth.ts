export const ADMIN_SESSION_COOKIE = "giria_admin_session=admin-panel-session";
export const ADMIN_CSRF_COOKIE = "giria_admin_csrf=test-csrf";
export const ADMIN_ROLE_COOKIE = "giria_admin_role=owner";
export const ADMIN_CSRF_HEADER = "test-csrf";

export function adminSessionCookie() {
  return ADMIN_SESSION_COOKIE;
}

export function adminModerationHeaders() {
  return {
    cookie: `${ADMIN_SESSION_COOKIE}; ${ADMIN_CSRF_COOKIE}; ${ADMIN_ROLE_COOKIE}`,
    "x-csrf-token": ADMIN_CSRF_HEADER,
  };
}
