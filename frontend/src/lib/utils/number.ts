export function getPositiveNumber(
  value: string | null,
): number | undefined {
  if (!value?.trim()) return undefined;

  const number = Number(value);

  return Number.isInteger(number) && number > 0
    ? number
    : undefined;
}

export function getNonNegativeNumber(
  value: string | null,
): number | undefined {
  if (!value?.trim()) return undefined;

  const number = Number(value);

  return Number.isFinite(number) && number >= 0
    ? number
    : undefined;
}