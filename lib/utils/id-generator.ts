export function generateDocumentNumber(
  prefix: 'QT' | 'PRJ' | 'INV',
  existingCount: number = 0
): string {
  const year = new Date().getFullYear();
  const sequence = String(existingCount + 1).padStart(4, '0');
  return `${prefix}-${year}-${sequence}`;
}
