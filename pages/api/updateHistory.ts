import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// invert the got_reply column at the given id in the query param
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    let { id, got_reply } = req.query;

    console.log('req query id', id);

    console.log('\n req query got_reply', got_reply);

    const outreach = await prisma.outreach.update({
      where: {
        id: Number(id),
      },
      data: {
        got_reply: got_reply === 'true' ? true : false,
      },
    });
    res.status(200).json(outreach);
  } catch (e) {
    res.status(500).json(e);
  }
}
