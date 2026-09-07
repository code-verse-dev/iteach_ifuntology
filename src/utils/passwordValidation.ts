export const PASSWORD_POLICY_MESSAGE =
  "Password must be at least 8 characters and include one uppercase letter, one number, and one special character.";

export const PASSWORD_POLICY_HINT =
  "At least 8 characters with one uppercase letter, one number, and one special character.";

export function isStrongPassword(password: string): boolean {
  if (!password || password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/\d/.test(password)) return false;
  if (!/[^A-Za-z0-9]/.test(password)) return false;
  return true;
}

export function getPasswordValidationError(password: string): string | null {
  if (!password) return null;
  if (!isStrongPassword(password)) return PASSWORD_POLICY_MESSAGE;
  return null;
}
