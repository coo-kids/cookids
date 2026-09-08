export function createOrderId(date = new Date()): string {
  const datePart = date.toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = crypto.randomUUID().replaceAll("-", "").slice(0, 4).toUpperCase();
  return `CK-${datePart}-${randomPart}`;
}
