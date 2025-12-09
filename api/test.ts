import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  return res.status(200).json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    env: {
      DB_HOST: process.env.DB_HOST,
      DB_HOST_length: process.env.DB_HOST?.length,
      DB_PORT: process.env.DB_PORT,
      DB_USER: process.env.DB_USER ? 'set' : 'not set',
      DB_PASSWORD: process.env.DB_PASSWORD ? 'set' : 'not set',
      DB_NAME: process.env.DB_NAME
    }
  });
}
