// The OTP flows (2FA, account verification, password change/reset) need a working
// mail sender. Off unless the deployment says otherwise.
export const EMAIL_ENABLED =
  (window.__RUNTIME_CONFIG__?.EMAIL_ENABLED || import.meta.env.VITE_EMAIL_ENABLED) === "true";
