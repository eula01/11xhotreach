import type { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';
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
  let { name, title, job, company } = req.body;
  let prompt = `
  Write a personalized cold email to ${name}, who is a ${title} at ${job}, and explain the benefits of using a fully automated sales development representative worker, and how it can deliver value to their company. Benefits include 24/7 availability, low cost, and relevant personalization. Keep it short, and include a call to action at the end.

  Here is more inforamtion about ${name}'s company:

  ${company}`;

  const completion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt,
    max_tokens: 1000,
  });

  console.log(completion.data.choices[0].text);

  await prisma.outreach.create({
    data: {
      name,
      email: req.body.email || null,
      body: completion.data.choices[0].text,
      got_reply: false,
    },
  });

  res.status(200).json({ body: completion.data.choices[0].text });
}
