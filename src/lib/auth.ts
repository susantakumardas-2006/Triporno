export function normalizeCredential(value: string) {
  return value.trim().toLowerCase();
}

export function authenticateUser<T extends { email?: string; password?: string }>(
  records: T[],
  email: string,
  password: string,
) {
  const normalizedEmail = normalizeCredential(email);
  const normalizedPassword = normalizeCredential(password);

  return records.find((record) => {
    const recordEmail = normalizeCredential(record.email ?? '');
    const recordPassword = normalizeCredential(record.password ?? '');
    return recordEmail === normalizedEmail && recordPassword === normalizedPassword;
  });
}
