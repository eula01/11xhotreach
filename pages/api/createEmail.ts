import type { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from 'openai';
import { PrismaClient } from '@prisma/client';

// define api clients outside of handler to avoid creating new clients for each request
const prisma = new PrismaClient();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_SECRET,
});
const openai = new OpenAIApi(configuration);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let { name, title, companyName, job, company, email } = req.body;
  let prompt = `
  Write a personalized cold email to ${name} who is a ${title} at ${companyName}. ${companyName} is a company that ${company}.
  
  In the casual cold email, sell them our automated sales development representative (SDR) product. It can help drive sales by being available 24/7 and being low cost. Keep it short and casual. Include a call to action at the end.`;

  try {
    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 1000,
    });
    console.log(completion.data.choices[0].text);

    await prisma.outreach.create({
      data: {
        name,
        email,
        body: completion.data.choices[0].text,
        got_reply: false,
        companyname: companyName,
      },
    });
    res.status(200).json({ body: completion.data.choices[0].text });
  } catch (e) {
    res.status(500).json(e);
  }
}
