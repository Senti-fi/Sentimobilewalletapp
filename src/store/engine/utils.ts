export const generateId = (): string => crypto.randomUUID();

export const nowISO = (): string => new Date().toISOString();

/** Round to 2 decimal places to avoid floating-point drift. */
export const round2 = (n: number): number => Math.round(n * 100) / 100;
