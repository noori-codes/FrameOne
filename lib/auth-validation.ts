/** Shared auth field limits — keep HTML attrs and server checks in sync. */

export const NAME_MAX = 80;
export const EMAIL_MAX = 254;
export const PASSWORD_MIN = 6;
export const PASSWORD_MAX = 128;

/**
 * Safe for HTML `pattern` (browsers compile with the `v` flag — no `/` etc. in classes).
 * local@domain.tld, no spaces.
 */
export const EMAIL_PATTERN = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string) {
  return email.length > 0 && email.length <= EMAIL_MAX && EMAIL_RE.test(email);
}

/** Strip spaces and lowercase while typing / pasting. */
export function sanitizeEmailInput(value: string) {
  return value.replace(/\s/g, "").toLowerCase();
}

/** Digits only for OTP fields. */
export function sanitizeOtpInput(value: string) {
  return value.replace(/\D/g, "").slice(0, 6);
}
