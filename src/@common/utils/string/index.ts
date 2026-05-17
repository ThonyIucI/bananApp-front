/** Oculta la parte local del email dejando solo el primer carácter visible. */
export const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  if (!domain || !local) return email;
  return `${local[0]}***@${domain}`;
};
