import ky from 'ky';

export const handler = ky.create({
  prefixUrl: import.meta.env.VITE_SERVER_URL,
  credentials: 'include',
});
