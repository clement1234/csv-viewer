export function trimAndNormalizeString(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

export function removeAccentsFromString(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function normalizeColumnName(name: string): string {
  let normalized = removeAccentsFromString(name);
  normalized = normalized.toLowerCase();
  normalized = normalized.trim();
  // Apostrophes → underscores
  normalized = normalized.replace(/[''`]/g, '_');
  // Espaces et tirets → underscores
  normalized = normalized.replace(/[\s-]+/g, '_');
  // Supprimer tout sauf a-z 0-9 _
  normalized = normalized.replace(/[^a-z0-9_]/g, '');
  // Dédupliquer underscores consécutifs
  normalized = normalized.replace(/_+/g, '_');
  // Supprimer underscores en début/fin
  normalized = normalized.replace(/^_|_$/g, '');
  return normalized;
}

export function normalizeColumnNamesWithDeduplication(names: string[]): string[] {
  const normalizedNames = names.map(normalizeColumnName);
  const countMap = new Map<string, number>();
  return normalizedNames.map((name) => {
    const currentCount = countMap.get(name) ?? 0;
    countMap.set(name, currentCount + 1);
    if (currentCount === 0) return name;
    return `${name}_${currentCount + 1}`;
  });
}

export function detectSeparatorInString(value: string): '|' | ',' | ';' | null {
  // Priorité : | > , > ;
  if (value.includes('|')) return '|';
  if (value.includes(',')) return ',';
  if (value.includes(';')) return ';';
  return null;
}

export function splitStringBySeparator(
  value: string,
  separator: '|' | ',' | ';',
): string[] {
  return value
    .split(separator)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}
