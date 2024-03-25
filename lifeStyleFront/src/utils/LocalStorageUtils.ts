export function getLocalStorageValuesByKeyContains(
  searchStr: string
): string[] | null {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes(searchStr)) {
      keys.push(key);
    }
  }
  if (keys.length > 0) {
    return keys;
  }
  return null;
}
