import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const categorizationSchema = z.object({
  categoryId: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

const CATEGORIZATION_PROMPT = `You are a financial transaction categorizer. Based on the transaction description, merchant, and historical patterns, determine the most appropriate category.

Transaction:
- Description: {description}
- Merchant: {merchant}
- Amount: {amount}
- Date: {date}

Available Categories:
{categories}

Historical Patterns:
{historicalPatterns}

Return a JSON object with:
- categoryId: The ID of the selected category
- confidence: A confidence score between 0 and 1
- reasoning: Brief explanation of why this category was chosen`;

export async function categorizeTransaction(
  transaction: {
    description: string;
    merchant?: string;
    amount: number;
    date: Date;
  },
  categories: Array<{ id: string; name: string; keywords: string[] }>,
  userId: string
): Promise<z.infer<typeof categorizationSchema>> {
  const model = new ChatOpenAI({
    modelName: 'gpt-4-turbo',
    temperature: 0.3,
  });

  // Fetch historical patterns for the user
  const historicalPatterns = await prisma.transaction.findMany({
    where: {
      userId,
      categoryId: { not: null as any },
    },
    select: {
      description: true,
      merchant: true,
      categoryId: true,
    },
    take: 50,
  });
  
  const prompt = PromptTemplate.fromTemplate(CATEGORIZATION_PROMPT);
  
  const chain = prompt.pipe(model);
  
  const response: any = await chain.invoke({
    description: transaction.description,
    merchant: transaction.merchant || 'Unknown',
    amount: transaction.amount.toString(),
    date: transaction.date.toISOString(),
    categories: JSON.stringify(categories, null, 2),
    historicalPatterns: JSON.stringify(historicalPatterns, null, 2),
  });
  
  const result = JSON.parse(response.content as string);
  return categorizationSchema.parse(result);
}
