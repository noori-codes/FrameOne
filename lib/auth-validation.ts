/** Shared auth field limits — keep HTML attrs and server checks in sync. */

export const NAME_MAX = 80;
export const EMAIL_MAX = 254;
export const PASSWORD_MIN = 6;
export const PASSWORD_MAX = 128;

/**
 * Practical email shape: local@domain.tld, no spaces.
 * Stricter than bare `type="email"` for empty TLD / trailing dots.
 */
export const EMAIL_PATTERN =
  "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$";

const EMAIL_RE = new RegExp(EMAIL_PATTERN);

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
