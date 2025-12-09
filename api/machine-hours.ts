import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from './prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getMachineHours(req, res);
      case 'POST':
        return await createMachineHours(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// GET - Fetch machine hours data
async function getMachineHours(req: VercelRequest, res: VercelResponse) {
  const { machine, from, to, limit = '100' } = req.query;

  const where: {
    machineName?: string;
    logTime?: { gte?: Date; lte?: Date };
  } = {};

  if (machine) {
    where.machineName = String(machine);
  }

  if (from || to) {
    where.logTime = {};
    if (from) where.logTime.gte = new Date(String(from));
    if (to) where.logTime.lte = new Date(String(to));
  }

  const data = await prisma.machineHours.findMany({
    where,
    orderBy: { logTime: 'desc' },
    take: Math.min(Number(limit), 1000)
  });

  return res.status(200).json({ data, count: data.length });
}

// POST - Create machine hours entry
async function createMachineHours(req: VercelRequest, res: VercelResponse) {
  const { logTime, machineName, runHour, stopHour, runStatus, stopStatus, reworkStatus } = req.body;

  if (!logTime || !machineName || runHour === undefined || stopHour === undefined) {
    return res.status(400).json({
      error: 'logTime, machineName, runHour, stopHour are required'
    });
  }

  const entry = await prisma.machineHours.create({
    data: {
      logTime: new Date(logTime),
      machineName,
      runHour: Number(runHour),
      stopHour: Number(stopHour),
      runStatus: Number(runStatus) || 0,
      stopStatus: Number(stopStatus) || 0,
      reworkStatus: reworkStatus !== undefined ? Number(reworkStatus) : null
    }
  });

  return res.status(201).json({ message: 'Created', data: entry });
}
