type ClassValue = string | number | boolean | null | undefined | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  return inputs
    .flat(Infinity as 0)
    .filter((v) => typeof v === 'string' && v.length > 0)
    .join(' ');
}
