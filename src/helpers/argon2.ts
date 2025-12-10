export function isArgon2Hash(hash: string | null): boolean {
  const regex = /^\$argon2(id|i|d)\$v=\d+\$.*\$.+/;
  if (typeof hash !== 'string') {
    return false;
  }
  return regex.test(hash);
}
