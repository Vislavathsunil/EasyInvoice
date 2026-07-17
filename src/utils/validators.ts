/**
 * Validates whether an email string matches a standard email pattern.
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates password rules:
 * - Minimum 6 characters
 * - Must contain at least one letter and one number for solid basic security
 */
export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long.' };
  }
  
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return { isValid: false, error: 'Password must contain both letters and numbers for safety.' };
  }
  
  return { isValid: true };
};
