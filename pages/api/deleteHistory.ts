import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// delete one row by id from https://railway.app/project/c96de165-15f8-444d-a7ad-2fff75050ea2/plugin/1815bda1-279c-4d9d-ad77-d027324d0fd8/data?state=table&table=outreach
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log("req query id", req.query.id);
    const outreach = await prisma.outreach.delete({
      where: {
        id: Number(req.query.id),
      },
    });
    res.status(200).json(outreach);
  } catch (e) {
    res.status(500).json(e);
  }
}
