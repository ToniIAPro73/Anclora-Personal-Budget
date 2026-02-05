import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import prisma from '@/lib/prisma';
import { addMonths } from 'date-fns';
// import { safeDecimal } from '@/lib/finance/calculation-rules';

const FINANCIAL_ADVISOR_SYSTEM_PROMPT = `You are a personal financial advisor AI assistant.
... (as defined in SDD)
Financial Context:
{financialContext}

Relevant Documents:
{relevantDocuments}

User Question: {question}`;

export async function askFinancialAdvisor(
  userId: string,
  question: string,
  _conversationId?: string
) {
  const financialContext = await getUserFinancialContext(userId);
  const relevantDocs = await searchFinancialDocuments(userId, question);
  
  const model = new ChatOpenAI({
    modelName: 'gpt-4-turbo',
    temperature: 0.7,
  });
  
  const prompt = PromptTemplate.fromTemplate(FINANCIAL_ADVISOR_SYSTEM_PROMPT);
  const chain = prompt.pipe(model);
  
  const response = await chain.invoke({
    financialContext: JSON.stringify(financialContext, null, 2),
    relevantDocuments: formatDocuments(relevantDocs),
    question,
  });
  
  // Logic to save message to DB...
  
  return {
    answer: response.content,
    sources: relevantDocs,
  };
}

async function getUserFinancialContext(userId: string) {
  // Snapshot implementation as defined in SDD section 1.5
  const [accounts, recentTransactions, budgets, goals] = await Promise.all([
    prisma.account.findMany({ where: { userId, isActive: true } }),
    prisma.transaction.findMany({
      where: { userId, isDeleted: false, date: { gte: addMonths(new Date(), -3) } },
      orderBy: { date: 'desc' },
      take: 50,
    }),
    prisma.budget.findMany({ where: { userId, isActive: true } }),
    prisma.financialGoal.findMany({ where: { userId, isCompleted: false } }),
  ]);

  return {
    accounts,
    recentTransactions,
    budgets,
    goals,
    // Add calculated metrics here...
  };
}

async function searchFinancialDocuments(userId: string, query: string) {
  const embeddings = new OpenAIEmbeddings({ modelName: 'text-embedding-3-small' });
  const queryEmbedding = await embeddings.embedQuery(query);
  
  // Vector search via raw query
  const results = await prisma.$queryRaw`
    SELECT fd.id, fd.title, fd.type, dc.content
    FROM document_chunks dc
    JOIN financial_documents fd ON dc.document_id = fd.id
    WHERE fd.user_id = ${userId}
    ORDER BY dc.embedding <=> ${queryEmbedding}::vector
    LIMIT 5
  `;
  
  return results as any[];
}

function formatDocuments(docs: any[]): string {
    return docs.map((d, i) => `[Doc ${i+1}] ${d.title}: ${d.content}`).join('\n\n');
}
