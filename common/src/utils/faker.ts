export const getRandomString = (): string => Math.random().toString(36).slice(2);

export const getEmail = (): string => `${getRandomString()}@example.com`;
