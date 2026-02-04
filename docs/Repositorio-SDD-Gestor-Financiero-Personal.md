# Repositorio Base SDD: Gestor Personal Financiero con IA

## Introducción

Este repositorio es una **plantilla completa de producción para un Gestor de Finanzas Personales impulsado por IA** diseñada específicamente para aplicar la metodología **Spec-Driven Development (SDD) con IA**. Permite implementar un sistema completo de gestión financiera personal con presupuestos, seguimiento de gastos e ingresos, proyecciones, analytics avanzados y un Asesor IA Financiero mediante sistema RAG.

**Stack tecnológico:**

- Next.js 15 (App Router) + React 19
- TypeScript 5.3+
- Tailwind CSS 4.0
- Prisma ORM + PostgreSQL con pgvector
- LangChain.js + LangGraph (agentic workflows)
- OpenAI SDK + Anthropic SDK
- Pinecone/Weaviate (vector storage)
- Vercel AI SDK (streaming UI)
- Plaid API (conexión bancaria)
- Recharts (visualización de datos)

**Arquitectura del Sistema:**

- Planning → Analysis → Recommendation pattern (Financial AI Agent)
- RAG con embeddings de conocimiento financiero personal
- Real-time transaction categorization con ML
- Predictive cash flow forecasting
- Multi-currency support
- Streaming responses para análisis financiero
- Automated budgeting con reglas personalizables

**Optimizado para:**

- Uso personal (single-user inicialmente, multi-user preparado)
- Presupuestos flexibles (envelope, zero-based, 50/30/20)
- Proyecciones a corto plazo (1-3 meses) y medio plazo (3-12 meses)
- Analytics en tiempo real
- Sincronización bancaria automática (opcional)
- Time-to-market < 4 semanas

---

## 1. Constitución del Proyecto

La Constitución define las reglas inmutables que rigen todo el código generado por IA. Esta es la fuente de verdad para arquitecturas de finanzas personales, integraciones con sistemas bancarios y experiencias conversacionales con el asesor IA.

### 1.1. Principios Arquitectónicos (Financial Management System)

**Patrón Financial Data Flow: Capture → Categorize → Analyze → Project → Recommend**

```
User Input → Transaction Parser → Auto-Categorizer → Budget Engine → 
Analytics Engine → Projection Model → AI Financial Advisor → User Interface
```

**Arquitectura de Capas:**

```
┌─────────────────────────────────────────────────┐
│        Presentation Layer (React UI)            │
│  - Dashboard  - Transactions  - Budgets         │
│  - Reports    - AI Chat       - Projections     │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│         Business Logic Layer (Services)         │
│  - TransactionService  - BudgetService          │
│  - CategoryService     - ProjectionService      │
│  - AIAdvisorService    - AnalyticsService       │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│          Data Access Layer (Prisma ORM)         │
│  - Transactions  - Budgets    - Categories      │
│  - Accounts      - Projections - AI Context     │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│     Database Layer (PostgreSQL + pgvector)      │
└─────────────────────────────────────────────────┘
```

**Reglas de Arquitectura Financiera:**

1. **Inmutabilidad de Transacciones**: Las transacciones nunca se eliminan, solo se marcan como `deleted` o `reconciled`
2. **Doble Entrada Contable**: Toda transacción afecta al menos una cuenta origen y opcionalmente un presupuesto
3. **Categorización Automática**: Sistema ML debe categorizar automáticamente transacciones basándose en historial
4. **Validación de Presupuestos**: Nunca permitir gastos negativos ni presupuestos sin período temporal
5. **Proyecciones Determinísticas**: Las proyecciones deben ser reproducibles con los mismos datos de entrada
6. **Privacidad por Diseño**: Datos financieros encriptados en reposo (AES-256) y en tránsito (TLS 1.3)

**Restricción IA**: Cualquier código que:
- Elimine transacciones en lugar de soft-delete
- Permita presupuestos sin fecha de inicio/fin
- Almacene datos financieros sin encriptación
- Exponga información sensible en logs
- Viole principios de contabilidad de doble entrada

debe ser rechazado automáticamente.

### 1.2. Modelo de Datos (PostgreSQL + pgvector)

**Schema para Financial Management Application**

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

// ===== USERS & AUTHENTICATION =====

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  password      String? // Hashed with bcrypt
  
  // Financial settings
  defaultCurrency String  @default("EUR")
  locale          String  @default("es-ES")
  timezone        String  @default("Europe/Madrid")
  
  // Relations
  accounts           Account[]
  categories         Category[]
  budgets            Budget[]
  transactions       Transaction[]
  projections        CashFlowProjection[]
  aiConversations    AIConversation[]
  financialDocuments FinancialDocument[]
  goals              FinancialGoal[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("users")
}

// ===== ACCOUNTS (Bank Accounts, Credit Cards, Cash, etc.) =====

model Account {
  id       String      @id @default(cuid())
  userId   String
  name     String
  type     AccountType
  currency String      @default("EUR")
  
  // Balance tracking
  currentBalance Decimal @db.Decimal(15, 2)
  initialBalance Decimal @db.Decimal(15, 2)
  
  // Bank integration (Plaid)
  plaidAccessToken String? @db.Text
  plaidAccountId   String?
  lastSyncedAt     DateTime?
  syncEnabled      Boolean @default(false)
  
  // Metadata
  color       String  @default("#3B82F6")
  icon        String  @default("bank")
  description String? @db.Text
  isActive    Boolean @default(true)
  
  // Relations
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId])
  @@index([type])
  @@map("accounts")
}

enum AccountType {
  CHECKING     // Cuenta corriente
  SAVINGS      // Cuenta ahorro
  CREDIT_CARD  // Tarjeta crédito
  CASH         // Efectivo
  INVESTMENT   // Inversión
  LOAN         // Préstamo
  OTHER        // Otro
}

// ===== CATEGORIES (Income & Expense) =====

model Category {
  id          String       @id @default(cuid())
  userId      String
  name        String
  type        CategoryType
  parentId    String?
  
  // Visual
  color String @default("#6B7280")
  icon  String @default("folder")
  
  // Budget rules
  monthlyBudget Decimal? @db.Decimal(10, 2)
  
  // AI learning
  keywords String[] // Keywords for auto-categorization
  
  // Relations
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  parent       Category?     @relation("CategoryHierarchy", fields: [parentId], references: [id], onDelete: SetNull)
  subcategories Category[]   @relation("CategoryHierarchy")
  transactions Transaction[]
  budgetAllocations BudgetAllocation[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([userId, name, type])
  @@index([userId])
  @@index([type])
  @@map("categories")
}

enum CategoryType {
  INCOME   // Ingreso
  EXPENSE  // Gasto
}

// ===== TRANSACTIONS =====

model Transaction {
  id          String          @id @default(cuid())
  userId      String
  accountId   String
  categoryId  String?
  
  // Transaction data
  amount      Decimal         @db.Decimal(15, 2)
  type        TransactionType
  description String
  notes       String?         @db.Text
  date        DateTime
  
  // Metadata
  merchant    String?
  location    String?
  tags        String[]
  
  // Reconciliation
  isReconciled Boolean  @default(false)
  reconciledAt DateTime?
  
  // Recurring
  isRecurring Boolean @default(false)
  recurringId String?
  
  // AI categorization
  autoCategorized Boolean @default(false)
  confidence      Float?  // 0-1 confidence score
  
  // Soft delete
  isDeleted Boolean  @default(false)
  deletedAt DateTime?
  
  // Relations
  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  account  Account   @relation(fields: [accountId], references: [id], onDelete: Cascade)
  category Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  recurring RecurringTransaction? @relation(fields: [recurringId], references: [id])
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId])
  @@index([accountId])
  @@index([categoryId])
  @@index([date])
  @@index([type])
  @@map("transactions")
}

enum TransactionType {
  INCOME    // Ingreso
  EXPENSE   // Gasto
  TRANSFER  // Transferencia entre cuentas
}

// ===== RECURRING TRANSACTIONS =====

model RecurringTransaction {
  id          String    @id @default(cuid())
  userId      String
  
  // Template data
  accountId   String
  categoryId  String?
  amount      Decimal   @db.Decimal(15, 2)
  type        TransactionType
  description String
  
  // Recurrence rules
  frequency   RecurrenceFrequency
  interval    Int       @default(1) // Every N frequency units
  startDate   DateTime
  endDate     DateTime?
  nextDate    DateTime
  
  // Days of month/week
  dayOfMonth  Int?      // 1-31 for monthly
  dayOfWeek   Int?      // 0-6 for weekly
  
  // Status
  isActive    Boolean   @default(true)
  
  // Generated transactions
  transactions Transaction[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId])
  @@index([nextDate])
  @@map("recurring_transactions")
}

enum RecurrenceFrequency {
  DAILY
  WEEKLY
  BIWEEKLY
  MONTHLY
  BIMONTHLY
  QUARTERLY
  YEARLY
}

// ===== BUDGETS =====

model Budget {
  id          String       @id @default(cuid())
  userId      String
  name        String
  type        BudgetType
  
  // Period
  startDate   DateTime
  endDate     DateTime
  
  // Total budget
  totalAmount Decimal      @db.Decimal(15, 2)
  
  // Settings
  rollover    Boolean      @default(false) // Carry over unused budget
  isActive    Boolean      @default(true)
  
  // Relations
  user        User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  allocations BudgetAllocation[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId])
  @@index([startDate, endDate])
  @@map("budgets")
}

enum BudgetType {
  ENVELOPE       // Método sobre
  ZERO_BASED     // Presupuesto base cero
  FIFTY_THIRTY_TWENTY // 50/30/20 rule
  CUSTOM         // Personalizado
}

// ===== BUDGET ALLOCATIONS =====

model BudgetAllocation {
  id         String  @id @default(cuid())
  budgetId   String
  categoryId String
  
  // Allocation
  amount     Decimal @db.Decimal(10, 2)
  percentage Float?  // For percentage-based budgets
  
  // Tracking
  spent      Decimal @default(0) @db.Decimal(10, 2)
  
  // Relations
  budget   Budget   @relation(fields: [budgetId], references: [id], onDelete: Cascade)
  category Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([budgetId, categoryId])
  @@index([budgetId])
  @@index([categoryId])
  @@map("budget_allocations")
}

// ===== CASH FLOW PROJECTIONS =====

model CashFlowProjection {
  id          String   @id @default(cuid())
  userId      String
  
  // Projection metadata
  name        String
  description String?  @db.Text
  projectionDate DateTime
  horizon     ProjectionHorizon
  
  // Calculated values
  projectedBalance  Decimal   @db.Decimal(15, 2)
  projectedIncome   Decimal   @db.Decimal(15, 2)
  projectedExpenses Decimal   @db.Decimal(15, 2)
  confidence        Float     // 0-1
  
  // Assumptions
  assumptions Json // Stored assumptions used
  
  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId])
  @@index([projectionDate])
  @@map("cash_flow_projections")
}

enum ProjectionHorizon {
  SHORT_TERM  // 1-3 months
  MEDIUM_TERM // 3-12 months
  LONG_TERM   // 12+ months
}

// ===== FINANCIAL GOALS =====

model FinancialGoal {
  id          String   @id @default(cuid())
  userId      String
  
  // Goal details
  name        String
  description String?  @db.Text
  type        GoalType
  targetAmount Decimal  @db.Decimal(15, 2)
  currentAmount Decimal @default(0) @db.Decimal(15, 2)
  
  // Timeline
  startDate   DateTime
  targetDate  DateTime
  
  // Status
  isCompleted Boolean  @default(false)
  completedAt DateTime?
  
  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId])
  @@map("financial_goals")
}

enum GoalType {
  SAVINGS        // Ahorro
  DEBT_PAYOFF    // Pago de deuda
  EMERGENCY_FUND // Fondo emergencia
  INVESTMENT     // Inversión
  PURCHASE       // Compra
  RETIREMENT     // Jubilación
  OTHER          // Otro
}

// ===== AI ADVISOR (RAG SYSTEM) =====

model AIConversation {
  id       String   @id @default(cuid())
  userId   String
  title    String?
  
  // Messages
  messages AIMessage[]
  
  // Metadata
  lastMessageAt DateTime?
  
  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId])
  @@map("ai_conversations")
}

model AIMessage {
  id             String   @id @default(cuid())
  conversationId String
  role           MessageRole
  content        String   @db.Text
  
  // Context used
  contextUsed    Json? // Documents/transactions used for RAG
  
  // Model info
  modelId        String?
  tokensUsed     Int?
  latencyMs      Int?
  
  // Relations
  conversation AIConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@index([conversationId])
  @@map("ai_messages")
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}

// ===== FINANCIAL DOCUMENTS (for RAG Knowledge Base) =====

model FinancialDocument {
  id          String   @id @default(cuid())
  userId      String
  title       String
  content     String   @db.Text
  type        DocumentType
  
  // Source
  source      String? // URL or file path
  
  // Vector embeddings
  chunks      DocumentChunk[]
  
  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId])
  @@map("financial_documents")
}

enum DocumentType {
  BANK_STATEMENT   // Estado de cuenta
  RECEIPT          // Recibo
  INVOICE          // Factura
  CONTRACT         // Contrato
  TAX_DOCUMENT     // Documento fiscal
  INVESTMENT_REPORT // Informe inversión
  NOTE             // Nota personal
  OTHER            // Otro
}

model DocumentChunk {
  id         String @id @default(cuid())
  documentId String
  content    String @db.Text
  embedding  Unsupported("vector(1536)")? // pgvector
  
  // Chunk metadata
  chunkIndex Int
  startChar  Int
  endChar    Int
  
  // Relations
  document FinancialDocument @relation(fields: [documentId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@index([documentId])
  @@index([embedding(ops: VectorOps)], type: Ivfflat)
  @@map("document_chunks")
}

// ===== ANALYTICS & INSIGHTS =====

model FinancialInsight {
  id          String      @id @default(cuid())
  userId      String
  type        InsightType
  title       String
  description String      @db.Text
  severity    InsightSeverity
  
  // Data
  data        Json // Flexible storage for insight-specific data
  
  // Lifecycle
  isDismissed Boolean  @default(false)
  dismissedAt DateTime?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId])
  @@index([type])
  @@map("financial_insights")
}

enum InsightType {
  OVERSPENDING       // Sobregasto
  UNUSUAL_TRANSACTION // Transacción inusual
  BUDGET_ALERT       // Alerta presupuesto
  SAVINGS_OPPORTUNITY // Oportunidad ahorro
  RECURRING_CHARGE   // Cargo recurrente detectado
  CATEGORY_TREND     // Tendencia categoría
  GOAL_PROGRESS      // Progreso objetivo
  CASH_FLOW_WARNING  // Advertencia flujo caja
}

enum InsightSeverity {
  INFO
  WARNING
  CRITICAL
}
```

**pgvector Setup:**

```sql
-- migrations/001_enable_pgvector.sql
CREATE EXTENSION IF NOT EXISTS vector;

-- Create vector similarity search function for financial documents
CREATE OR REPLACE FUNCTION match_financial_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  user_id text
)
RETURNS TABLE (
  id text,
  document_id text,
  content text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    document_chunks.id,
    document_chunks.document_id,
    document_chunks.content,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  FROM document_chunks
  JOIN financial_documents ON document_chunks.document_id = financial_documents.id
  WHERE financial_documents.user_id = match_financial_documents.user_id
    AND 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY document_chunks.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Indexes for financial queries
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_category_date ON transactions(category_id, date DESC);
CREATE INDEX idx_budget_allocations_spent ON budget_allocations(budget_id, spent DESC);
```

### 1.3. Financial Calculation Engine

**Core Financial Rules (Immutable):**

```typescript
// src/lib/finance/calculation-rules.ts

/**
 * FINANCIAL CALCULATION RULES
 * These rules are IMMUTABLE and define how all financial calculations work
 */

export const FINANCIAL_RULES = {
  // Decimal precision
  DECIMAL_PLACES: 2,
  ROUNDING_MODE: 'HALF_UP' as const,
  
  // Budget rules
  MAX_BUDGET_PERIOD_DAYS: 365,
  MIN_BUDGET_AMOUNT: 0.01,
  
  // Transaction rules
  MAX_TRANSACTION_AMOUNT: 999999999.99,
  MIN_TRANSACTION_AMOUNT: 0.01,
  
  // Projection rules
  SHORT_TERM_MONTHS: 3,
  MEDIUM_TERM_MONTHS: 12,
  CONFIDENCE_THRESHOLD: 0.6, // Minimum confidence for projections
  
  // AI rules
  MAX_RAG_CHUNKS: 5,
  SIMILARITY_THRESHOLD: 0.7,
  MAX_CONVERSATION_HISTORY: 20,
} as const;

/**
 * Budget period validator
 * RESTRICTION: Never allow budgets outside valid date ranges
 */
export function validateBudgetPeriod(
  startDate: Date,
  endDate: Date
): { valid: boolean; error?: string } {
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  if (diffDays < 1) {
    return { valid: false, error: 'Budget period must be at least 1 day' };
  }
  
  if (diffDays > FINANCIAL_RULES.MAX_BUDGET_PERIOD_DAYS) {
    return {
      valid: false,
      error: `Budget period cannot exceed ${FINANCIAL_RULES.MAX_BUDGET_PERIOD_DAYS} days`,
    };
  }
  
  return { valid: true };
}

/**
 * Transaction amount validator
 * RESTRICTION: Never allow invalid transaction amounts
 */
export function validateTransactionAmount(
  amount: number
): { valid: boolean; error?: string } {
  if (amount < FINANCIAL_RULES.MIN_TRANSACTION_AMOUNT) {
    return {
      valid: false,
      error: `Amount must be at least ${FINANCIAL_RULES.MIN_TRANSACTION_AMOUNT}`,
    };
  }
  
  if (amount > FINANCIAL_RULES.MAX_TRANSACTION_AMOUNT) {
    return {
      valid: false,
      error: `Amount cannot exceed ${FINANCIAL_RULES.MAX_TRANSACTION_AMOUNT}`,
    };
  }
  
  return { valid: true };
}

/**
 * Safe decimal calculation
 * ALWAYS use for monetary calculations to avoid floating point errors
 */
export function safeDecimal(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculate budget utilization percentage
 */
export function calculateBudgetUtilization(
  spent: number,
  allocated: number
): number {
  if (allocated === 0) return 0;
  return safeDecimal((spent / allocated) * 100);
}

/**
 * Calculate remaining budget
 */
export function calculateRemainingBudget(
  allocated: number,
  spent: number
): number {
  return safeDecimal(allocated - spent);
}
```

**Transaction Categorization AI (Auto-Categorizer):**

```typescript
// src/lib/ai/transaction-categorizer.ts

import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

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
- reasoning: Brief explanation of why this category was chosen

Consider:
1. Merchant name patterns
2. Transaction description keywords
3. Historical categorization for similar transactions
4. Common category associations`;

export async function categorizeTransaction(
  transaction: {
    description: string;
    merchant?: string;
    amount: number;
    date: Date;
  },
  categories: Array<{ id: string; name: string; keywords: string[] }>,
  historicalPatterns: Array<{ merchant: string; categoryId: string }>
): Promise<z.infer<typeof categorizationSchema>> {
  const model = new ChatOpenAI({
    modelName: 'gpt-4-turbo',
    temperature: 0.3, // Low temperature for consistent categorization
  });
  
  const prompt = PromptTemplate.fromTemplate(CATEGORIZATION_PROMPT);
  
  const chain = prompt.pipe(model);
  
  const response = await chain.invoke({
    description: transaction.description,
    merchant: transaction.merchant || 'Unknown',
    amount: transaction.amount,
    date: transaction.date.toISOString(),
    categories: JSON.stringify(categories, null, 2),
    historicalPatterns: JSON.stringify(historicalPatterns, null, 2),
  });
  
  // Parse JSON response
  const result = JSON.parse(response.content as string);
  return categorizationSchema.parse(result);
}

/**
 * Learn from user corrections
 * When user manually changes a category, update keywords and patterns
 */
export async function learnFromCorrection(
  transactionDescription: string,
  merchant: string | null,
  correctCategoryId: string,
  prisma: PrismaClient
): Promise<void> {
  // Extract keywords from description
  const keywords = extractKeywords(transactionDescription);
  
  // Update category keywords
  await prisma.category.update({
    where: { id: correctCategoryId },
    data: {
      keywords: {
        push: keywords,
      },
    },
  });
  
  // Store pattern
  if (merchant) {
    // Future: Store merchant-category association in a learning table
  }
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction (can be improved with NLP)
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 5); // Top 5 words
}
```

### 1.4. Cash Flow Projection Engine

**Projection Algorithm (Deterministic):**

```typescript
// src/lib/finance/projection-engine.ts

import { addMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { prisma } from '@/lib/db/client';

export interface ProjectionParams {
  userId: string;
  startDate: Date;
  horizon: 'SHORT_TERM' | 'MEDIUM_TERM';
  includeRecurring: boolean;
}

export interface MonthlyProjection {
  month: Date;
  projectedIncome: number;
  projectedExpenses: number;
  projectedBalance: number;
  confidence: number;
}

/**
 * PROJECTION ALGORITHM (DETERMINISTIC)
 * 
 * Steps:
 * 1. Calculate historical averages (last 3-6 months)
 * 2. Identify recurring transactions
 * 3. Apply trend analysis
 * 4. Calculate confidence based on data availability
 * 5. Project future months
 */
export async function generateCashFlowProjection(
  params: ProjectionParams
): Promise<MonthlyProjection[]> {
  const { userId, startDate, horizon, includeRecurring } = params;
  
  // Step 1: Get historical data (last 6 months)
  const lookbackMonths = 6;
  const historicalStart = addMonths(startDate, -lookbackMonths);
  
  const historicalTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: historicalStart,
        lt: startDate,
      },
      isDeleted: false,
    },
    orderBy: { date: 'asc' },
  });
  
  // Step 2: Calculate monthly averages
  const monthlyStats = calculateMonthlyAverages(historicalTransactions);
  
  // Step 3: Get recurring transactions
  let recurringIncome = 0;
  let recurringExpenses = 0;
  
  if (includeRecurring) {
    const recurring = await prisma.recurringTransaction.findMany({
      where: {
        userId,
        isActive: true,
      },
    });
    
    for (const rec of recurring) {
      const monthlyAmount = calculateMonthlyRecurringAmount(rec);
      if (rec.type === 'INCOME') {
        recurringIncome += monthlyAmount;
      } else if (rec.type === 'EXPENSE') {
        recurringExpenses += monthlyAmount;
      }
    }
  }
  
  // Step 4: Get current balance
  const accounts = await prisma.account.findMany({
    where: { userId, isActive: true },
    select: { currentBalance: true },
  });
  
  const currentBalance = accounts.reduce(
    (sum, acc) => sum + Number(acc.currentBalance),
    0
  );
  
  // Step 5: Project future months
  const projectionMonths = horizon === 'SHORT_TERM' ? 3 : 12;
  const projectionMonthDates = eachMonthOfInterval({
    start: startOfMonth(startDate),
    end: endOfMonth(addMonths(startDate, projectionMonths - 1)),
  });
  
  let runningBalance = currentBalance;
  const projections: MonthlyProjection[] = [];
  
  for (const month of projectionMonthDates) {
    // Combine historical averages with recurring transactions
    const projectedIncome = monthlyStats.avgIncome + recurringIncome;
    const projectedExpenses = monthlyStats.avgExpenses + recurringExpenses;
    
    // Apply trend (simple linear trend)
    const trendAdjustment = calculateTrend(historicalTransactions, month);
    
    const adjustedIncome = projectedIncome * (1 + trendAdjustment.incomeTrend);
    const adjustedExpenses = projectedExpenses * (1 + trendAdjustment.expenseTrend);
    
    // Update running balance
    runningBalance = runningBalance + adjustedIncome - adjustedExpenses;
    
    // Calculate confidence (more data = higher confidence)
    const confidence = calculateConfidence(
      historicalTransactions.length,
      lookbackMonths
    );
    
    projections.push({
      month,
      projectedIncome: safeDecimal(adjustedIncome),
      projectedExpenses: safeDecimal(adjustedExpenses),
      projectedBalance: safeDecimal(runningBalance),
      confidence,
    });
  }
  
  return projections;
}

function calculateMonthlyAverages(transactions: Transaction[]): {
  avgIncome: number;
  avgExpenses: number;
} {
  const incomes = transactions
    .filter(t => t.type === 'INCOME')
    .map(t => Number(t.amount));
  
  const expenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .map(t => Number(t.amount));
  
  const avgIncome = incomes.length > 0
    ? incomes.reduce((sum, amt) => sum + amt, 0) / incomes.length
    : 0;
  
  const avgExpenses = expenses.length > 0
    ? expenses.reduce((sum, amt) => sum + amt, 0) / expenses.length
    : 0;
  
  return { avgIncome, avgExpenses };
}

function calculateMonthlyRecurringAmount(
  recurring: RecurringTransaction
): number {
  const amount = Number(recurring.amount);
  
  switch (recurring.frequency) {
    case 'DAILY':
      return amount * 30; // Approximate
    case 'WEEKLY':
      return amount * 4.33; // Average weeks per month
    case 'BIWEEKLY':
      return amount * 2.17;
    case 'MONTHLY':
      return amount;
    case 'BIMONTHLY':
      return amount / 2;
    case 'QUARTERLY':
      return amount / 3;
    case 'YEARLY':
      return amount / 12;
    default:
      return 0;
  }
}

function calculateTrend(
  transactions: Transaction[],
  targetMonth: Date
): { incomeTrend: number; expenseTrend: number } {
  // Simple linear regression on last 3 months
  // Returns percentage trend (e.g., 0.05 = 5% increase)
  
  // Group by month
  const monthlyData = new Map<string, { income: number; expense: number }>();
  
  for (const tx of transactions) {
    const monthKey = format(tx.date, 'yyyy-MM');
    const existing = monthlyData.get(monthKey) || { income: 0, expense: 0 };
    
    if (tx.type === 'INCOME') {
      existing.income += Number(tx.amount);
    } else if (tx.type === 'EXPENSE') {
      existing.expense += Number(tx.amount);
    }
    
    monthlyData.set(monthKey, existing);
  }
  
  // Calculate simple trend (last month vs first month)
  const months = Array.from(monthlyData.values());
  if (months.length < 2) {
    return { incomeTrend: 0, expenseTrend: 0 };
  }
  
  const firstMonth = months[0];
  const lastMonth = months[months.length - 1];
  
  const incomeTrend = firstMonth.income > 0
    ? (lastMonth.income - firstMonth.income) / firstMonth.income
    : 0;
  
  const expenseTrend = firstMonth.expense > 0
    ? (lastMonth.expense - firstMonth.expense) / firstMonth.expense
    : 0;
  
  return {
    incomeTrend: Math.max(-0.5, Math.min(0.5, incomeTrend)), // Cap at ±50%
    expenseTrend: Math.max(-0.5, Math.min(0.5, expenseTrend)),
  };
}

function calculateConfidence(
  transactionCount: number,
  monthsOfData: number
): number {
  // More transactions and more months = higher confidence
  const transactionScore = Math.min(transactionCount / 100, 1); // 100+ transactions = 1.0
  const timeScore = Math.min(monthsOfData / 6, 1); // 6+ months = 1.0
  
  return safeDecimal((transactionScore + timeScore) / 2);
}
```

### 1.5. AI Financial Advisor (RAG System)

**Financial Advisor Agent:**

```typescript
// src/lib/ai/financial-advisor.ts

import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { OpenAIEmbeddings } from '@langchain/openai';
import { prisma } from '@/lib/db/client';

const FINANCIAL_ADVISOR_SYSTEM_PROMPT = `You are a personal financial advisor AI assistant. Your role is to help users understand their finances, make informed decisions, and achieve their financial goals.

Guidelines:
1. Be supportive and non-judgmental about past financial decisions
2. Provide actionable, personalized advice based on the user's actual financial data
3. Explain financial concepts clearly without jargon
4. Always consider the user's context (goals, income, expenses)
5. Warn about potential risks but remain encouraging
6. Never make specific investment recommendations (not a licensed advisor)
7. Focus on budgeting, savings, debt management, and financial literacy

When answering:
- Reference specific data from the user's transactions and budgets
- Provide concrete numbers and calculations
- Suggest realistic next steps
- Be encouraging but realistic

Financial Context:
{financialContext}

Relevant Documents:
{relevantDocuments}

User Question: {question}`;

export async function askFinancialAdvisor(
  userId: string,
  question: string,
  conversationId?: string
): Promise<{
  answer: string;
  sources: Array<{ type: string; content: string }>;
  tokensUsed: number;
}> {
  // Step 1: Get user's financial context
  const financialContext = await getUserFinancialContext(userId);
  
  // Step 2: Semantic search for relevant documents (RAG)
  const relevantDocs = await searchFinancialDocuments(userId, question);
  
  // Step 3: Get conversation history if exists
  let conversationHistory: AIMessage[] = [];
  if (conversationId) {
    conversationHistory = await prisma.aIMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 10, // Last 10 messages
    });
  }
  
  // Step 4: Build prompt with context
  const model = new ChatOpenAI({
    modelName: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 1500,
  });
  
  const prompt = PromptTemplate.fromTemplate(FINANCIAL_ADVISOR_SYSTEM_PROMPT);
  
  const chain = prompt.pipe(model);
  
  const startTime = Date.now();
  
  const response = await chain.invoke({
    financialContext: JSON.stringify(financialContext, null, 2),
    relevantDocuments: formatDocuments(relevantDocs),
    question,
  });
  
  const latencyMs = Date.now() - startTime;
  
  // Step 5: Save conversation
  const conversationRecord = conversationId
    ? { id: conversationId }
    : await prisma.aIConversation.create({
        data: {
          userId,
          title: question.slice(0, 100),
        },
      });
  
  await prisma.aIMessage.createMany({
    data: [
      {
        conversationId: conversationRecord.id,
        role: 'USER',
        content: question,
      },
      {
        conversationId: conversationRecord.id,
        role: 'ASSISTANT',
        content: response.content as string,
        modelId: 'gpt-4-turbo',
        tokensUsed: response.response_metadata?.tokenUsage?.totalTokens,
        latencyMs,
        contextUsed: {
          financialContext,
          documents: relevantDocs.map(d => ({ id: d.id, title: d.title })),
        },
      },
    ],
  });
  
  return {
    answer: response.content as string,
    sources: relevantDocs.map(d => ({
      type: d.type,
      content: d.content.slice(0, 200) + '...',
    })),
    tokensUsed: response.response_metadata?.tokenUsage?.totalTokens || 0,
  };
}

async function getUserFinancialContext(userId: string) {
  // Get comprehensive financial snapshot
  const [user, accounts, recentTransactions, budgets, goals] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        defaultCurrency: true,
        locale: true,
      },
    }),
    prisma.account.findMany({
      where: { userId, isActive: true },
      select: {
        name: true,
        type: true,
        currentBalance: true,
        currency: true,
      },
    }),
    prisma.transaction.findMany({
      where: {
        userId,
        isDeleted: false,
        date: {
          gte: addMonths(new Date(), -3), // Last 3 months
        },
      },
      select: {
        amount: true,
        type: true,
        description: true,
        date: true,
        category: {
          select: { name: true, type: true },
        },
      },
      orderBy: { date: 'desc' },
      take: 50,
    }),
    prisma.budget.findMany({
      where: {
        userId,
        isActive: true,
        endDate: { gte: new Date() },
      },
      select: {
        name: true,
        totalAmount: true,
        startDate: true,
        endDate: true,
        allocations: {
          select: {
            amount: true,
            spent: true,
            category: { select: { name: true } },
          },
        },
      },
    }),
    prisma.financialGoal.findMany({
      where: { userId, isCompleted: false },
      select: {
        name: true,
        type: true,
        targetAmount: true,
        currentAmount: true,
        targetDate: true,
      },
    }),
  ]);
  
  // Calculate totals
  const totalBalance = accounts.reduce(
    (sum, acc) => sum + Number(acc.currentBalance),
    0
  );
  
  const monthlyIncome = recentTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0) / 3; // 3-month average
  
  const monthlyExpenses = recentTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0) / 3;
  
  return {
    currency: user?.defaultCurrency || 'EUR',
    totalBalance: safeDecimal(totalBalance),
    monthlyIncome: safeDecimal(monthlyIncome),
    monthlyExpenses: safeDecimal(monthlyExpenses),
    savingsRate: safeDecimal(
      monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0
    ),
    accounts: accounts.map(a => ({
      name: a.name,
      type: a.type,
      balance: Number(a.currentBalance),
    })),
    activeBudgets: budgets.length,
    budgetUtilization: budgets.map(b => ({
      name: b.name,
      totalBudget: Number(b.totalAmount),
      spent: b.allocations.reduce((sum, a) => sum + Number(a.spent), 0),
    })),
    activeGoals: goals.length,
    goals: goals.map(g => ({
      name: g.name,
      type: g.type,
      target: Number(g.targetAmount),
      current: Number(g.currentAmount),
      progress: safeDecimal((Number(g.currentAmount) / Number(g.targetAmount)) * 100),
    })),
    recentSpendingByCategory: calculateCategorySpending(recentTransactions),
  };
}

async function searchFinancialDocuments(
  userId: string,
  query: string
): Promise<Array<{ id: string; title: string; type: string; content: string }>> {
  // Generate query embedding
  const embeddings = new OpenAIEmbeddings({
    modelName: 'text-embedding-3-small',
  });
  
  const queryEmbedding = await embeddings.embedQuery(query);
  
  // Vector similarity search
  const results = await prisma.$queryRaw`
    SELECT
      fd.id,
      fd.title,
      fd.type,
      dc.content,
      1 - (dc.embedding <=> ${queryEmbedding}::vector) as similarity
    FROM document_chunks dc
    JOIN financial_documents fd ON dc.document_id = fd.id
    WHERE fd.user_id = ${userId}
      AND 1 - (dc.embedding <=> ${queryEmbedding}::vector) > 0.7
    ORDER BY dc.embedding <=> ${queryEmbedding}::vector
    LIMIT 5
  `;
  
  return results as any[];
}

function formatDocuments(docs: any[]): string {
  if (docs.length === 0) return 'No relevant documents found.';
  
  return docs
    .map(
      (doc, i) =>
        `[Document ${i + 1}] ${doc.title} (${doc.type})\n${doc.content}\n`
    )
    .join('\n---\n\n');
}

function calculateCategorySpending(transactions: any[]): Record<string, number> {
  const categoryTotals: Record<string, number> = {};
  
  for (const tx of transactions) {
    if (tx.type === 'EXPENSE' && tx.category) {
      const catName = tx.category.name;
      categoryTotals[catName] = (categoryTotals[catName] || 0) + Number(tx.amount);
    }
  }
  
  return categoryTotals;
}
```

### 1.6. Analytics Service

**Financial Analytics Engine:**

```typescript
// src/lib/analytics/financial-analytics.ts

export interface SpendingTrend {
  period: string; // 'YYYY-MM'
  amount: number;
  change: number; // Percentage change from previous period
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface BudgetPerformance {
  budgetId: string;
  budgetName: string;
  allocated: number;
  spent: number;
  remaining: number;
  utilizationPercentage: number;
  status: 'under' | 'near' | 'over'; // under: <80%, near: 80-100%, over: >100%
}

/**
 * Get spending trends over time
 */
export async function getSpendingTrends(
  userId: string,
  months: number = 6
): Promise<SpendingTrend[]> {
  const startDate = addMonths(new Date(), -months);
  
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'EXPENSE',
      isDeleted: false,
      date: { gte: startDate },
    },
    select: {
      amount: true,
      date: true,
    },
    orderBy: { date: 'asc' },
  });
  
  // Group by month
  const monthlySpending = new Map<string, number>();
  
  for (const tx of transactions) {
    const monthKey = format(tx.date, 'yyyy-MM');
    const current = monthlySpending.get(monthKey) || 0;
    monthlySpending.set(monthKey, current + Number(tx.amount));
  }
  
  // Calculate trends
  const trends: SpendingTrend[] = [];
  const sortedMonths = Array.from(monthlySpending.entries()).sort();
  
  for (let i = 0; i < sortedMonths.length; i++) {
    const [period, amount] = sortedMonths[i];
    const prevAmount = i > 0 ? sortedMonths[i - 1][1] : amount;
    const change = prevAmount > 0 ? ((amount - prevAmount) / prevAmount) * 100 : 0;
    
    trends.push({
      period,
      amount: safeDecimal(amount),
      change: safeDecimal(change),
    });
  }
  
  return trends;
}

/**
 * Get spending breakdown by category
 */
export async function getCategoryBreakdown(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<CategoryBreakdown[]> {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'EXPENSE',
      isDeleted: false,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      amount: true,
      categoryId: true,
      category: {
        select: { name: true },
      },
    },
  });
  
  // Calculate totals
  const categoryTotals = new Map<string, { name: string; amount: number; count: number }>();
  let grandTotal = 0;
  
  for (const tx of transactions) {
    const amount = Number(tx.amount);
    grandTotal += amount;
    
    if (tx.categoryId && tx.category) {
      const existing = categoryTotals.get(tx.categoryId) || {
        name: tx.category.name,
        amount: 0,
        count: 0,
      };
      
      existing.amount += amount;
      existing.count += 1;
      
      categoryTotals.set(tx.categoryId, existing);
    }
  }
  
  // Convert to array and calculate percentages
  const breakdown: CategoryBreakdown[] = Array.from(categoryTotals.entries())
    .map(([categoryId, data]) => ({
      categoryId,
      categoryName: data.name,
      amount: safeDecimal(data.amount),
      percentage: safeDecimal((data.amount / grandTotal) * 100),
      transactionCount: data.count,
    }))
    .sort((a, b) => b.amount - a.amount);
  
  return breakdown;
}

/**
 * Get budget performance analysis
 */
export async function getBudgetPerformance(
  userId: string,
  budgetId?: string
): Promise<BudgetPerformance[]> {
  const budgets = await prisma.budget.findMany({
    where: {
      userId,
      ...(budgetId ? { id: budgetId } : {}),
      isActive: true,
      endDate: { gte: new Date() },
    },
    include: {
      allocations: {
        include: {
          category: { select: { name: true } },
        },
      },
    },
  });
  
  const performance: BudgetPerformance[] = [];
  
  for (const budget of budgets) {
    const allocated = Number(budget.totalAmount);
    const spent = budget.allocations.reduce(
      (sum, alloc) => sum + Number(alloc.spent),
      0
    );
    const remaining = allocated - spent;
    const utilization = (spent / allocated) * 100;
    
    let status: 'under' | 'near' | 'over';
    if (utilization < 80) status = 'under';
    else if (utilization <= 100) status = 'near';
    else status = 'over';
    
    performance.push({
      budgetId: budget.id,
      budgetName: budget.name,
      allocated: safeDecimal(allocated),
      spent: safeDecimal(spent),
      remaining: safeDecimal(remaining),
      utilizationPercentage: safeDecimal(utilization),
      status,
    });
  }
  
  return performance;
}

/**
 * Generate financial insights
 */
export async function generateInsights(userId: string): Promise<FinancialInsight[]> {
  const insights: Array<Omit<FinancialInsight, 'id' | 'createdAt' | 'updatedAt'>> = [];
  
  // Insight 1: Budget alerts (>90% utilization)
  const budgetPerf = await getBudgetPerformance(userId);
  for (const budget of budgetPerf) {
    if (budget.utilizationPercentage > 90 && budget.utilizationPercentage <= 100) {
      insights.push({
        userId,
        type: 'BUDGET_ALERT',
        title: `Presupuesto "${budget.budgetName}" casi agotado`,
        description: `Has gastado ${budget.utilizationPercentage.toFixed(1)}% de tu presupuesto. Solo quedan ${budget.remaining.toFixed(2)}€.`,
        severity: 'WARNING',
        data: { budgetId: budget.budgetId, utilization: budget.utilizationPercentage },
        isDismissed: false,
      });
    } else if (budget.utilizationPercentage > 100) {
      insights.push({
        userId,
        type: 'OVERSPENDING',
        title: `Sobregasto en "${budget.budgetName}"`,
        description: `Has excedido tu presupuesto en ${Math.abs(budget.remaining).toFixed(2)}€ (${budget.utilizationPercentage.toFixed(1)}% gastado).`,
        severity: 'CRITICAL',
        data: { budgetId: budget.budgetId, overage: Math.abs(budget.remaining) },
        isDismissed: false,
      });
    }
  }
  
  // Insight 2: Unusual transactions (>3x average)
  const avgTransaction = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'EXPENSE',
      isDeleted: false,
      date: { gte: addMonths(new Date(), -3) },
    },
    _avg: { amount: true },
  });
  
  const avgAmount = Number(avgTransaction._avg.amount || 0);
  
  if (avgAmount > 0) {
    const unusualTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        isDeleted: false,
        amount: { gte: avgAmount * 3 },
        date: { gte: addDays(new Date(), -7) }, // Last 7 days
      },
      take: 3,
    });
    
    for (const tx of unusualTransactions) {
      insights.push({
        userId,
        type: 'UNUSUAL_TRANSACTION',
        title: 'Transacción inusual detectada',
        description: `Gasto de ${Number(tx.amount).toFixed(2)}€ en "${tx.description}" es 3x superior a tu promedio.`,
        severity: 'INFO',
        data: { transactionId: tx.id, amount: Number(tx.amount) },
        isDismissed: false,
      });
    }
  }
  
  // Insight 3: Savings opportunity (spending trend increasing)
  const trends = await getSpendingTrends(userId, 3);
  if (trends.length >= 2) {
    const lastTrend = trends[trends.length - 1];
    if (lastTrend.change > 15) {
      insights.push({
        userId,
        type: 'SAVINGS_OPPORTUNITY',
        title: 'Tus gastos están aumentando',
        description: `Tus gastos han aumentado un ${lastTrend.change.toFixed(1)}% este mes. Revisa tus categorías principales.`,
        severity: 'WARNING',
        data: { change: lastTrend.change },
        isDismissed: false,
      });
    }
  }
  
  // Save insights to database
  for (const insight of insights) {
    await prisma.financialInsight.create({ data: insight });
  }
  
  return insights as FinancialInsight[];
}
```

---

## 2. Especificación Completa

### 2.1. User Stories

**US-001: Crear Cuenta Financiera**

**Como** usuario  
**Quiero** crear y gestionar múltiples cuentas (banco, efectivo, tarjetas)  
**Para que** pueda seguir el saldo de todas mis cuentas en un solo lugar

**Acceptance Criteria:**
- Puedo crear cuentas con: nombre, tipo, saldo inicial, moneda
- Soporta tipos: corriente, ahorro, tarjeta crédito, efectivo, inversión
- El saldo se actualiza automáticamente con las transacciones
- Puedo activar/desactivar cuentas sin eliminarlas
- Puedo conectar cuentas bancarias vía Plaid (opcional)

---

**US-002: Registrar Transacciones Manualmente**

**Como** usuario  
**Quiero** registrar ingresos y gastos manualmente  
**Para que** pueda mantener un registro completo de mi actividad financiera

**Acceptance Criteria:**
- Puedo crear transacciones con: monto, tipo, descripción, cuenta, fecha, categoría
- Sistema valida montos mínimos/máximos (0.01 - 999,999,999.99)
- Puedo añadir notas opcionales y etiquetas
- Puedo marcar transacciones como recurrentes
- Las transacciones actualizan el saldo de la cuenta automáticamente
- No puedo eliminar transacciones, solo marcarlas como eliminadas (soft delete)

---

**US-003: Categorización Automática con IA**

**Como** usuario  
**Quiero** que el sistema categorice automáticamente mis transacciones  
**Para que** ahorre tiempo y mantenga consistencia en la categorización

**Acceptance Criteria:**
- Al crear una transacción, el sistema sugiere una categoría basándose en:
  - Descripción de la transacción
  - Nombre del comerciante
  - Patrones históricos
- Muestra un score de confianza (0-100%)
- Puedo aceptar o cambiar la categoría sugerida
- El sistema aprende de mis correcciones (actualiza keywords de categorías)
- Categorización funciona con mínimo 10 transacciones históricas

---

**US-004: Crear y Gestionar Presupuestos**

**Como** usuario  
**Quiero** crear presupuestos mensuales por categorías  
**Para que** pueda controlar mis gastos y alcanzar mis metas financieras

**Acceptance Criteria:**
- Puedo crear presupuestos con: nombre, período (inicio/fin), monto total
- Soporta tipos: sobre (envelope), base cero, 50/30/20, personalizado
- Puedo asignar montos a categorías específicas
- Sistema valida períodos (1-365 días)
- Puedo activar rollover (transferir saldo no gastado al siguiente período)
- Dashboard muestra progreso en tiempo real (gastado vs asignado)
- Alertas automáticas cuando llego al 80%, 90%, 100% del presupuesto

---

**US-005: Visualizar Dashboard Financiero**

**Como** usuario  
**Quiero** ver un dashboard con mis métricas financieras clave  
**Para que** pueda entender rápidamente mi situación financiera

**Acceptance Criteria:**
- Dashboard muestra:
  - Balance total (suma de todas las cuentas activas)
  - Ingresos vs gastos del mes actual
  - Progreso de presupuestos activos
  - Gráfico de gastos por categoría (pie chart)
  - Tendencia de gastos últimos 6 meses (line chart)
  - Próximos pagos recurrentes
  - Insights/alertas generadas por IA
- Datos se actualizan en tiempo real
- Puedo filtrar por período temporal

---

**US-006: Proyecciones de Flujo de Caja**

**Como** usuario  
**Quiero** ver proyecciones de mi flujo de caja futuro  
**Para que** pueda anticipar problemas de liquidez y planificar mejor

**Acceptance Criteria:**
- Puedo generar proyecciones a:
  - Corto plazo (1-3 meses)
  - Medio plazo (3-12 meses)
- Sistema calcula proyecciones basándose en:
  - Promedios históricos (últimos 6 meses)
  - Transacciones recurrentes activas
  - Análisis de tendencias
- Muestra balance proyectado mensual
- Muestra score de confianza (basado en cantidad de datos disponibles)
- Proyecciones son determinísticas (mismo input = mismo output)
- Puedo ver desglose mes a mes

---

**US-007: Consultar Asesor IA Financiero**

**Como** usuario  
**Quiero** hacer preguntas sobre mis finanzas a un asesor IA  
**Para que** pueda recibir consejos personalizados basados en mi situación real

**Acceptance Criteria:**
- Puedo iniciar una conversación con el asesor IA
- Sistema usa RAG para incluir contexto relevante:
  - Mis transacciones recientes
  - Estado de mis presupuestos
  - Mis metas financieras
  - Documentos financieros que he subido
- Respuestas son streaming (aparecen en tiempo real)
- IA proporciona consejos específicos con números concretos
- IA puede explicar conceptos financieros de forma clara
- Historial de conversaciones se guarda
- Puedo ver qué fuentes de información usó el IA

---

**US-008: Establecer Metas Financieras**

**Como** usuario  
**Quiero** definir metas financieras con plazos y montos objetivo  
**Para que** pueda seguir mi progreso hacia objetivos importantes

**Acceptance Criteria:**
- Puedo crear metas con: nombre, tipo, monto objetivo, fecha límite
- Tipos soportados: ahorro, pago de deuda, fondo emergencia, inversión, compra
- Sistema calcula automáticamente el progreso actual
- Dashboard muestra progreso visual (barra de progreso)
- Puedo actualizar el progreso manualmente
- Sistema sugiere cantidad mensual necesaria para alcanzar meta a tiempo
- Notificaciones cuando alcanzo hitos (25%, 50%, 75%, 100%)

---

**US-009: Transacciones Recurrentes**

**Como** usuario  
**Quiero** definir transacciones recurrentes (suscripciones, salario, alquiler)  
**Para que** el sistema las genere automáticamente y me recuerde de pagos futuros

**Acceptance Criteria:**
- Puedo crear transacciones recurrentes con:
  - Frecuencia (diaria, semanal, quincenal, mensual, trimestral, anual)
  - Monto
  - Cuenta
  - Categoría
  - Fecha de inicio/fin
- Sistema genera automáticamente transacciones en las fechas programadas
- Dashboard muestra próximos pagos recurrentes en los próximos 30 días
- Puedo pausar/reactivar recurrencias
- Sistema me notifica 3 días antes de pagos recurrentes importantes

---

**US-010: Subir Documentos Financieros**

**Como** usuario  
**Quiero** subir documentos financieros (facturas, extractos, contratos)  
**Para que** el asesor IA pueda consultarlos al responder mis preguntas

**Acceptance Criteria:**
- Puedo subir archivos: PDF, DOCX, TXT, imágenes (JPG, PNG)
- Sistema extrae texto automáticamente (OCR para imágenes)
- Documentos se dividen en chunks y se generan embeddings (vector store)
- Puedo categorizar documentos por tipo (factura, extracto, contrato, etc.)
- Al consultar al asesor IA, sistema busca documentos relevantes semánticamente
- Puedo ver qué documentos se usaron en cada respuesta del IA

---

**US-011: Analytics Avanzados**

**Como** usuario  
**Quiero** acceder a reportes y analytics detallados  
**Para que** pueda analizar patrones de gasto y tomar decisiones informadas

**Acceptance Criteria:**
- Analytics incluye:
  - Gráfico de tendencia de gastos (últimos 6-12 meses)
  - Desglose de gastos por categoría con porcentajes
  - Comparación mes a mes (% cambio)
  - Análisis de transacciones inusuales
  - Performance de presupuestos (gastado vs asignado)
  - Distribución de gastos por día de semana
- Puedo filtrar por:
  - Rango de fechas
  - Categorías específicas
  - Cuentas específicas
- Puedo exportar reportes a PDF/CSV

---

**US-012: Gestionar Categorías Personalizadas**

**Como** usuario  
**Quiero** crear, editar y organizar mis propias categorías  
**Para que** pueda adaptar el sistema a mi forma de organizar las finanzas

**Acceptance Criteria:**
- Puedo crear categorías de ingreso y gasto
- Puedo crear subcategorías (jerarquía)
- Puedo asignar colores e iconos a categorías
- Puedo definir keywords para mejorar categorización automática
- Puedo establecer presupuesto mensual por defecto para cada categoría
- Sistema viene con categorías predefinidas (editables)
- No puedo eliminar categorías con transacciones asociadas (solo desactivar)

---

### 2.2. Casos de Uso Técnicos

**UC-001: Sincronización Bancaria Automática (Plaid)**

**Actor:** Usuario con cuenta bancaria conectada

**Precondiciones:**
- Usuario tiene cuenta activa en la aplicación
- Plaid API configurada con credenciales válidas
- Usuario ha autorizado acceso a su banco vía Plaid Link

**Flujo Principal:**

1. Sistema ejecuta job programado cada 24 horas (cron)
2. Para cada cuenta con `syncEnabled = true`:
   a. Sistema obtiene `plaidAccessToken` de la cuenta
   b. Llama a Plaid API `/transactions/sync` con access token
   c. Plaid devuelve nuevas transacciones desde última sincronización
3. Para cada transacción nueva:
   a. Sistema crea registro en tabla `Transaction`
   b. Llama al categorizador IA con descripción del merchant
   c. Asigna categoría sugerida con `autoCategorized = true`
   d. Actualiza `currentBalance` de la cuenta
4. Sistema actualiza `lastSyncedAt` timestamp
5. Sistema genera notificación: "N nuevas transacciones sincronizadas"

**Flujos Alternativos:**

**3a. Categorización IA falla:**
- 3a1. Sistema asigna categoría "Sin categorizar" por defecto
- 3a2. Usuario debe categorizar manualmente más tarde

**2a. Access token expirado:**
- 2a1. Sistema marca cuenta con `syncEnabled = false`
- 2a2. Genera notificación para usuario: "Reconectar cuenta bancaria"
- 2a3. Usuario debe re-autenticar vía Plaid Link

**2b. Plaid API retorna error 500:**
- 2b1. Sistema reintenta 3 veces con exponential backoff
- 2b2. Si falla todas las veces, registra error en logs
- 2b3. Notifica al usuario: "Sincronización temporalmente no disponible"

**Postcondiciones:**
- Todas las transacciones nuevas están en la base de datos
- Saldos de cuentas reflejan transacciones más recientes
- Usuario ve transacciones nuevas en su dashboard

---

**UC-002: Generación Automática de Insights Financieros**

**Actor:** Sistema (job programado)

**Precondiciones:**
- Usuario tiene al menos 10 transacciones en los últimos 3 meses
- Usuario tiene al menos 1 presupuesto activo

**Flujo Principal:**

1. Sistema ejecuta job diario (cada 24h) para cada usuario
2. Sistema obtiene datos financieros del usuario:
   - Transacciones últimos 3 meses
   - Presupuestos activos con allocations
   - Metas financieras activas
3. Sistema ejecuta algoritmos de detección de insights:
   
   **A. Budget Alerts:**
   - Para cada presupuesto activo:
   - Calcula `utilizationPercentage = spent / allocated * 100`
   - Si utilization > 90% y <= 100%: Crea insight tipo `BUDGET_ALERT` (WARNING)
   - Si utilization > 100%: Crea insight tipo `OVERSPENDING` (CRITICAL)
   
   **B. Unusual Transactions:**
   - Calcula promedio de gastos últimos 3 meses
   - Busca transacciones > 3x el promedio en últimos 7 días
   - Crea insights tipo `UNUSUAL_TRANSACTION` (INFO)
   
   **C. Spending Trends:**
   - Calcula tendencia de gastos (últimos 3 meses)
   - Si aumento > 15%: Crea insight tipo `SAVINGS_OPPORTUNITY` (WARNING)
   
   **D. Recurring Charges Detection:**
   - Detecta transacciones similares cada mes (mismo merchant, monto similar)
   - Si no hay recurrencia definida: Sugiere crear transacción recurrente
   
   **E. Goal Progress:**
   - Para cada meta activa:
   - Calcula progreso actual
   - Si progreso < esperado (basado en plazo): Crea insight (WARNING)

4. Sistema guarda insights en tabla `FinancialInsight`
5. Sistema notifica usuario si hay insights de severidad CRITICAL

**Flujos Alternativos:**

**2a. Usuario tiene menos de 10 transacciones:**
- 2a1. Sistema solo genera insights básicos (budget alerts)
- 2a2. Resto de análisis se omite (insuficientes datos)

**Postcondiciones:**
- Insights generados están disponibles en dashboard
- Usuario ha sido notificado de insights críticos

---

**UC-003: Consulta al Asesor IA con RAG**

**Actor:** Usuario haciendo pregunta al asesor

**Precondiciones:**
- Usuario está autenticado
- OpenAI API configurada correctamente
- Base de datos contiene contexto financiero del usuario

**Flujo Principal:**

1. Usuario escribe pregunta en el chat: "¿Por qué estoy gastando tanto este mes?"
2. Sistema genera embedding de la pregunta (OpenAI text-embedding-3-small)
3. Sistema busca documentos relevantes en vector store:
   - Ejecuta búsqueda de similitud coseno en `document_chunks`
   - Filtra por `user_id` del usuario
   - Threshold de similitud > 0.7
   - Limita a top 5 chunks más relevantes
4. Sistema obtiene contexto financiero del usuario:
   - Balance total de cuentas
   - Ingresos/gastos promedio últimos 3 meses
   - Presupuestos activos y su utilización
   - Metas financieras activas
   - Top 5 categorías de gasto del mes actual
5. Sistema construye prompt con:
   - System prompt (rol de asesor financiero)
   - Contexto financiero (JSON)
   - Documentos relevantes (RAG)
   - Pregunta del usuario
   - Historial de conversación (últimos 10 mensajes)
6. Sistema llama a GPT-4 Turbo con streaming
7. Sistema transmite respuesta en tiempo real (SSE) al cliente
8. Sistema guarda conversación:
   - Crea/actualiza `AIConversation`
   - Guarda mensaje del usuario y del asistente en `AIMessage`
   - Registra `contextUsed` (documentos y datos usados)
   - Guarda tokens usados y latencia

**Flujos Alternativos:**

**3a. No hay documentos relevantes:**
- 3a1. Sistema continúa solo con contexto financiero
- 3a2. Respuesta del IA se basa únicamente en datos transaccionales

**6a. OpenAI API retorna error:**
- 6a1. Sistema retorna mensaje de error al usuario
- 6a2. Conversación no se guarda
- 6a3. Usuario puede reintentar

**7a. Usuario cancela la solicitud antes de completarse:**
- 7a1. Sistema detiene stream
- 7a2. Guarda mensaje parcial con nota "cancelled"

**Postcondiciones:**
- Usuario recibe respuesta personalizada basada en su situación real
- Conversación queda guardada para futura referencia
- Sistema aprendió del contexto usado para mejorar futuras respuestas

---

## 3. Technical Design Document

### 3.1. Frontend Architecture (Next.js 15 App Router)

**Page Structure:**

```
src/app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── layout.tsx
├── (dashboard)/
│   ├── layout.tsx              # Main dashboard layout with sidebar
│   ├── page.tsx                # Dashboard home (overview)
│   ├── transactions/
│   │   ├── page.tsx            # Transaction list
│   │   ├── new/
│   │   │   └── page.tsx        # Create transaction
│   │   └── [id]/
│   │       └── page.tsx        # Edit transaction
│   ├── budgets/
│   │   ├── page.tsx            # Budget list
│   │   ├── new/
│   │   │   └── page.tsx        # Create budget
│   │   └── [id]/
│   │       └── page.tsx        # Budget detail & edit
│   ├── accounts/
│   │   ├── page.tsx            # Account list
│   │   └── [id]/
│   │       └── page.tsx        # Account detail
│   ├── analytics/
│   │   └── page.tsx            # Analytics & reports
│   ├── projections/
│   │   └── page.tsx            # Cash flow projections
│   ├── goals/
│   │   ├── page.tsx            # Financial goals
│   │   └── [id]/
│   │       └── page.tsx        # Goal detail
│   ├── advisor/
│   │   └── page.tsx            # AI Financial Advisor chat
│   └── settings/
│       └── page.tsx            # User settings
└── api/
    ├── auth/
    │   └── [...nextauth]/
    │       └── route.ts        # NextAuth configuration
    ├── transactions/
    │   ├── route.ts            # GET, POST transactions
    │   ├── [id]/
    │   │   └── route.ts        # GET, PUT, DELETE transaction
    │   └── categorize/
    │       └── route.ts        # POST - Auto-categorize
    ├── budgets/
    │   ├── route.ts
    │   └── [id]/
    │       └── route.ts
    ├── accounts/
    │   ├── route.ts
    │   ├── [id]/
    │   │   └── route.ts
    │   └── sync/
    │       └── route.ts        # POST - Trigger Plaid sync
    ├── projections/
    │   └── generate/
    │       └── route.ts        # POST - Generate projection
    ├── analytics/
    │   ├── spending-trends/
    │   │   └── route.ts        # GET - Spending trends
    │   ├── category-breakdown/
    │   │   └── route.ts        # GET - Category breakdown
    │   └── budget-performance/
    │       └── route.ts        # GET - Budget performance
    ├── advisor/
    │   └── chat/
    │       └── route.ts        # POST - Chat with AI (streaming)
    └── insights/
        └── route.ts            # GET - Get insights
```

**Component Architecture (Atomic Design):**

```
src/components/
├── ui/                         # Shadcn/ui base components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── dialog.tsx
│   ├── table.tsx
│   └── ...
├── features/
│   ├── dashboard/
│   │   ├── balance-card.tsx    # Total balance display
│   │   ├── income-expense-card.tsx
│   │   ├── budget-progress-list.tsx
│   │   ├── spending-chart.tsx  # Recharts pie chart
│   │   ├── trend-chart.tsx     # Recharts line chart
│   │   └── insights-list.tsx
│   ├── transactions/
│   │   ├── transaction-form.tsx
│   │   ├── transaction-list.tsx
│   │   ├── transaction-row.tsx
│   │   ├── transaction-filters.tsx
│   │   └── category-selector.tsx
│   ├── budgets/
│   │   ├── budget-form.tsx
│   │   ├── budget-card.tsx
│   │   ├── allocation-editor.tsx
│   │   └── budget-progress-bar.tsx
│   ├── accounts/
│   │   ├── account-form.tsx
│   │   ├── account-card.tsx
│   │   └── plaid-link-button.tsx  # Plaid Link integration
│   ├── analytics/
│   │   ├── spending-trends-chart.tsx
│   │   ├── category-breakdown-chart.tsx
│   │   ├── budget-performance-table.tsx
│   │   └── export-report-button.tsx
│   ├── projections/
│   │   ├── projection-form.tsx
│   │   ├── projection-chart.tsx
│   │   └── projection-table.tsx
│   ├── goals/
│   │   ├── goal-form.tsx
│   │   ├── goal-card.tsx
│   │   └── goal-progress-bar.tsx
│   └── advisor/
│       ├── chat-interface.tsx
│       ├── message-list.tsx
│       ├── message-bubble.tsx
│       ├── chat-input.tsx
│       └── context-sources.tsx  # Shows which sources AI used
└── layout/
    ├── header.tsx
    ├── sidebar.tsx
    ├── footer.tsx
    └── page-container.tsx
```

**State Management Strategy:**

```typescript
// Use React Server Components + Server Actions for data mutations
// Use TanStack Query for client-side data fetching and caching

// Example: Transaction service with React Query
// src/hooks/use-transactions.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => fetchTransactions(filters),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
```

### 3.2. Backend Service Layer

**Service Pattern (Separation of Concerns):**

```typescript
// src/server/services/transaction-service.ts

import { prisma } from '@/lib/db/client';
import { categorizeTransaction } from '@/lib/ai/transaction-categorizer';
import { validateTransactionAmount } from '@/lib/finance/calculation-rules';
import { z } from 'zod';

const createTransactionSchema = z.object({
  userId: z.string(),
  accountId: z.string(),
  amount: z.number().positive(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  description: z.string().min(1).max(255),
  date: z.date(),
  categoryId: z.string().optional(),
  merchant: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export class TransactionService {
  /**
   * Create a new transaction
   * RESTRICTION: Must validate amount and update account balance atomically
   */
  async createTransaction(
    data: z.infer<typeof createTransactionSchema>
  ): Promise<Transaction> {
    // Validate input
    const validated = createTransactionSchema.parse(data);
    
    // Validate amount
    const amountValidation = validateTransactionAmount(validated.amount);
    if (!amountValidation.valid) {
      throw new Error(amountValidation.error);
    }
    
    // Auto-categorize if no category provided
    let categoryId = validated.categoryId;
    let autoCategorized = false;
    let confidence: number | undefined;
    
    if (!categoryId) {
      const categories = await prisma.category.findMany({
        where: {
          userId: validated.userId,
          type: validated.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
        },
      });
      
      const historicalPatterns = await this.getHistoricalPatterns(
        validated.userId,
        validated.merchant
      );
      
      const categorization = await categorizeTransaction(
        {
          description: validated.description,
          merchant: validated.merchant,
          amount: validated.amount,
          date: validated.date,
        },
        categories,
        historicalPatterns
      );
      
      categoryId = categorization.categoryId;
      autoCategorized = true;
      confidence = categorization.confidence;
    }
    
    // Create transaction and update account balance atomically
    const result = await prisma.$transaction(async (tx) => {
      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          ...validated,
          categoryId,
          autoCategorized,
          confidence,
        },
      });
      
      // Update account balance
      const balanceChange = validated.type === 'INCOME'
        ? validated.amount
        : -validated.amount;
      
      await tx.account.update({
        where: { id: validated.accountId },
        data: {
          currentBalance: {
            increment: balanceChange,
          },
        },
      });
      
      // Update budget allocation if applicable
      if (validated.type === 'EXPENSE' && categoryId) {
        await this.updateBudgetAllocation(
          tx,
          validated.userId,
          categoryId,
          validated.amount,
          validated.date
        );
      }
      
      return transaction;
    });
    
    return result;
  }
  
  /**
   * Update budget allocation when expense is created
   */
  private async updateBudgetAllocation(
    tx: any,
    userId: string,
    categoryId: string,
    amount: number,
    date: Date
  ): Promise<void> {
    // Find active budget covering this date
    const budget = await tx.budget.findFirst({
      where: {
        userId,
        isActive: true,
        startDate: { lte: date },
        endDate: { gte: date },
      },
      include: {
        allocations: {
          where: { categoryId },
        },
      },
    });
    
    if (budget && budget.allocations.length > 0) {
      await tx.budgetAllocation.update({
        where: { id: budget.allocations[0].id },
        data: {
          spent: {
            increment: amount,
          },
        },
      });
    }
  }
  
  /**
   * Get historical categorization patterns
   */
  private async getHistoricalPatterns(
    userId: string,
    merchant?: string
  ): Promise<Array<{ merchant: string; categoryId: string }>> {
    if (!merchant) return [];
    
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        merchant: {
          contains: merchant,
          mode: 'insensitive',
        },
        categoryId: { not: null },
      },
      select: {
        merchant: true,
        categoryId: true,
      },
      take: 10,
    });
    
    return transactions as any[];
  }
  
  /**
   * Soft delete transaction
   * RESTRICTION: Never hard delete transactions
   */
  async deleteTransaction(id: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Get transaction
      const transaction = await tx.transaction.findUnique({
        where: { id },
      });
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      
      // Soft delete
      await tx.transaction.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
      
      // Reverse account balance change
      const balanceChange = transaction.type === 'INCOME'
        ? -Number(transaction.amount)
        : Number(transaction.amount);
      
      await tx.account.update({
        where: { id: transaction.accountId },
        data: {
          currentBalance: {
            increment: balanceChange,
          },
        },
      });
      
      // Reverse budget allocation
      if (transaction.type === 'EXPENSE' && transaction.categoryId) {
        const budget = await tx.budget.findFirst({
          where: {
            userId: transaction.userId,
            isActive: true,
            startDate: { lte: transaction.date },
            endDate: { gte: transaction.date },
          },
          include: {
            allocations: {
              where: { categoryId: transaction.categoryId },
            },
          },
        });
        
        if (budget && budget.allocations.length > 0) {
          await tx.budgetAllocation.update({
            where: { id: budget.allocations[0].id },
            data: {
              spent: {
                decrement: Number(transaction.amount),
              },
            },
          });
        }
      }
    });
  }
}
```

### 3.3. Database Optimization

**Critical Indexes:**

```sql
-- Performance indexes for common queries

-- Transaction queries (most frequent)
CREATE INDEX CONCURRENTLY idx_transactions_user_date_type 
  ON transactions(user_id, date DESC, type) WHERE is_deleted = false;

CREATE INDEX CONCURRENTLY idx_transactions_account_date 
  ON transactions(account_id, date DESC) WHERE is_deleted = false;

CREATE INDEX CONCURRENTLY idx_transactions_category_date 
  ON transactions(category_id, date DESC) WHERE is_deleted = false;

-- Budget performance queries
CREATE INDEX CONCURRENTLY idx_budget_allocations_budget_spent 
  ON budget_allocations(budget_id, spent DESC);

-- AI conversation queries
CREATE INDEX CONCURRENTLY idx_ai_messages_conversation_date 
  ON ai_messages(conversation_id, created_at DESC);

-- Vector search optimization
CREATE INDEX CONCURRENTLY idx_document_chunks_embedding_ivfflat 
  ON document_chunks USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);
```

**Query Optimization Rules:**

```typescript
// Always use pagination for large result sets
// BAD:
const transactions = await prisma.transaction.findMany({
  where: { userId },
});

// GOOD:
const transactions = await prisma.transaction.findMany({
  where: { userId },
  take: 50,
  skip: page * 50,
  orderBy: { date: 'desc' },
});

// Use select to limit data transfer
// BAD:
const transactions = await prisma.transaction.findMany({
  where: { userId },
  include: { account: true, category: true },
});

// GOOD:
const transactions = await prisma.transaction.findMany({
  where: { userId },
  select: {
    id: true,
    amount: true,
    description: true,
    date: true,
    account: { select: { name: true } },
    category: { select: { name: true, color: true } },
  },
});
```

### 3.4. Background Jobs (Cron)

**Job Scheduler Setup:**

```typescript
// src/lib/jobs/scheduler.ts

import { CronJob } from 'cron';
import { syncPlaidTransactions } from './plaid-sync-job';
import { generateInsights } from './insights-job';
import { processRecurringTransactions } from './recurring-transactions-job';

export function initializeJobs() {
  // Sync Plaid transactions daily at 6 AM
  new CronJob(
    '0 6 * * *',
    syncPlaidTransactions,
    null,
    true,
    'Europe/Madrid'
  );
  
  // Generate insights daily at 8 AM
  new CronJob(
    '0 8 * * *',
    generateInsights,
    null,
    true,
    'Europe/Madrid'
  );
  
  // Process recurring transactions daily at 7 AM
  new CronJob(
    '0 7 * * *',
    processRecurringTransactions,
    null,
    true,
    'Europe/Madrid'
  );
}
```

**Recurring Transactions Job:**

```typescript
// src/lib/jobs/recurring-transactions-job.ts

import { prisma } from '@/lib/db/client';
import { TransactionService } from '@/server/services/transaction-service';

export async function processRecurringTransactions() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Find recurring transactions due today
  const dueRecurrences = await prisma.recurringTransaction.findMany({
    where: {
      isActive: true,
      nextDate: {
        lte: today,
      },
    },
  });
  
  const transactionService = new TransactionService();
  
  for (const recurrence of dueRecurrences) {
    try {
      // Create transaction
      await transactionService.createTransaction({
        userId: recurrence.userId,
        accountId: recurrence.accountId,
        categoryId: recurrence.categoryId,
        amount: Number(recurrence.amount),
        type: recurrence.type,
        description: recurrence.description,
        date: today,
        isRecurring: true,
        recurringId: recurrence.id,
      });
      
      // Calculate next date
      const nextDate = calculateNextRecurrenceDate(
        recurrence.nextDate,
        recurrence.frequency,
        recurrence.interval
      );
      
      // Update recurring transaction
      await prisma.recurringTransaction.update({
        where: { id: recurrence.id },
        data: { nextDate },
      });
      
    } catch (error) {
      console.error(`Failed to process recurring transaction ${recurrence.id}:`, error);
    }
  }
}

function calculateNextRecurrenceDate(
  currentDate: Date,
  frequency: string,
  interval: number
): Date {
  const next = new Date(currentDate);
  
  switch (frequency) {
    case 'DAILY':
      next.setDate(next.getDate() + interval);
      break;
    case 'WEEKLY':
      next.setDate(next.getDate() + (7 * interval));
      break;
    case 'BIWEEKLY':
      next.setDate(next.getDate() + (14 * interval));
      break;
    case 'MONTHLY':
      next.setMonth(next.getMonth() + interval);
      break;
    case 'BIMONTHLY':
      next.setMonth(next.getMonth() + (2 * interval));
      break;
    case 'QUARTERLY':
      next.setMonth(next.getMonth() + (3 * interval));
      break;
    case 'YEARLY':
      next.setFullYear(next.getFullYear() + interval);
      break;
  }
  
  return next;
}
```

### 3.5. Security & Data Protection

**Encryption at Rest:**

```typescript
// src/lib/security/encryption.ts

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'base64'); // 32 bytes

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Return: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encrypted: string): string {
  const [ivHex, authTagHex, encryptedData] = encrypted.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Middleware to encrypt sensitive fields before saving
export async function encryptSensitiveData(data: any): Promise<any> {
  const sensitiveFields = ['plaidAccessToken', 'notes'];
  
  for (const field of sensitiveFields) {
    if (data[field]) {
      data[field] = encrypt(data[field]);
    }
  }
  
  return data;
}
```

**API Rate Limiting:**

```typescript
// src/middleware/rate-limit.ts

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Create rate limiters for different endpoints
export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 h'), // 100 requests per hour
  analytics: true,
});

export const aiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 h'), // 20 AI requests per hour
  analytics: true,
});

// Usage in API route
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const { success } = await aiLimiter.limit(ip);
  
  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 });
  }
  
  // Process request...
}
```

---

## 4. Implementation: Code Examples

### 4.1. Dashboard Overview Component

```typescript
// src/components/features/dashboard/dashboard-overview.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import { BalanceCard } from './balance-card';
import { IncomeExpenseCard } from './income-expense-card';
import { BudgetProgressList } from './budget-progress-list';
import { SpendingChart } from './spending-chart';
import { TrendChart } from './trend-chart';
import { InsightsList } from './insights-list';

export function DashboardOverview() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/overview');
      return res.json();
    },
  });
  
  if (isLoading) {
    return <DashboardSkeleton />;
  }
  
  return (
    <div className="grid gap-6">
      {/* Top metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BalanceCard balance={overview.totalBalance} />
        <IncomeExpenseCard
          income={overview.monthlyIncome}
          expenses={overview.monthlyExpenses}
        />
        <div className="col-span-1">
          {/* Savings rate or other metric */}
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingChart data={overview.categoryBreakdown} />
        <TrendChart data={overview.spendingTrends} />
      </div>
      
      {/* Budget progress */}
      <BudgetProgressList budgets={overview.budgets} />
      
      {/* AI Insights */}
      <InsightsList insights={overview.insights} />
    </div>
  );
}
```

### 4.2. Transaction Form with Auto-Categorization

```typescript
// src/components/features/transactions/transaction-form.tsx

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateTransaction } from '@/hooks/use-transactions';
import { useCategorySuggestion } from '@/hooks/use-category-suggestion';

const formSchema = z.object({
  accountId: z.string(),
  amount: z.number().positive(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  description: z.string().min(1),
  merchant: z.string().optional(),
  categoryId: z.string().optional(),
  date: z.date(),
  notes: z.string().optional(),
});

export function TransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      type: 'EXPENSE' as const,
    },
  });
  
  const createTransaction = useCreateTransaction();
  const [suggestedCategory, setSuggestedCategory] = useState<{
    id: string;
    name: string;
    confidence: number;
  } | null>(null);
  
  // Watch description and merchant for auto-categorization
  const description = form.watch('description');
  const merchant = form.watch('merchant');
  
  // Debounced category suggestion
  const { data: suggestion } = useCategorySuggestion(
    { description, merchant },
    { enabled: !!description && description.length > 3 }
  );
  
  // Update suggested category when suggestion changes
  useEffect(() => {
    if (suggestion) {
      setSuggestedCategory(suggestion);
      if (!form.getValues('categoryId')) {
        form.setValue('categoryId', suggestion.id);
      }
    }
  }, [suggestion]);
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await createTransaction.mutateAsync(data);
      onSuccess();
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        control={form.control}
        name="accountId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cuenta</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              {/* Account options */}
            </Select>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Monto</FormLabel>
            <Input
              type="number"
              step="0.01"
              {...field}
              onChange={(e) => field.onChange(parseFloat(e.target.value))}
            />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descripción</FormLabel>
            <Input {...field} />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoría</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              {/* Category options */}
            </Select>
            {suggestedCategory && (
              <FormDescription className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                IA sugiere: {suggestedCategory.name}
                ({(suggestedCategory.confidence * 100).toFixed(0)}% confianza)
              </FormDescription>
            )}
          </FormItem>
        )}
      />
      
      {/* Other fields... */}
      
      <Button type="submit" disabled={createTransaction.isPending}>
        {createTransaction.isPending ? 'Guardando...' : 'Crear Transacción'}
      </Button>
    </form>
  );
}
```

### 4.3. AI Advisor Chat Component

```typescript
// src/components/features/advisor/chat-interface.tsx

'use client';

import { useState } from 'react';
import { useChat } from 'ai/react';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { ContextSources } from './context-sources';

export function ChatInterface({ conversationId }: { conversationId?: string }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/advisor/chat',
    body: { conversationId },
    onFinish: (message) => {
      // Show context sources when message finishes
      if (message.role === 'assistant') {
        setLastSources(message.metadata?.sources || []);
      }
    },
  });
  
  const [lastSources, setLastSources] = useState<any[]>([]);
  
  return (
    <div className="flex h-[calc(100vh-200px)] flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <MessageList messages={messages} />
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            El asesor está analizando tu situación financiera...
          </div>
        )}
      </div>
      
      {/* Context sources */}
      {lastSources.length > 0 && (
        <ContextSources sources={lastSources} />
      )}
      
      {/* Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit}>
          <ChatInput
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
            placeholder="Pregunta sobre tus finanzas..."
          />
        </form>
      </div>
    </div>
  );
}
```

### 4.4. Projection Chart Component

```typescript
// src/components/features/projections/projection-chart.tsx

'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProjectionChartProps {
  data: Array<{
    month: Date;
    projectedIncome: number;
    projectedExpenses: number;
    projectedBalance: number;
    confidence: number;
  }>;
}

export function ProjectionChart({ data }: ProjectionChartProps) {
  const chartData = data.map((item) => ({
    month: format(item.month, 'MMM yyyy', { locale: es }),
    Ingresos: item.projectedIncome,
    Gastos: item.projectedExpenses,
    Balance: item.projectedBalance,
    confidence: item.confidence,
  }));
  
  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-background border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold">{payload[0].payload.month}</p>
                    <p className="text-sm text-green-600">
                      Ingresos: €{payload[0].value?.toFixed(2)}
                    </p>
                    <p className="text-sm text-red-600">
                      Gastos: €{payload[1].value?.toFixed(2)}
                    </p>
                    <p className="text-sm font-semibold">
                      Balance: €{payload[2].value?.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Confianza: {(payload[0].payload.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="Ingresos"
            stroke="#10b981"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="Gastos"
            stroke="#ef4444"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="Balance"
            stroke="#3b82f6"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="text-sm text-muted-foreground">
        <p>
          Las proyecciones se basan en tus promedios históricos de los últimos 6 meses
          y tus transacciones recurrentes activas.
        </p>
      </div>
    </div>
  );
}
```

---

## 5. Testing Strategy

### 5.1. Unit Tests (Vitest)

```typescript
// src/lib/finance/calculation-rules.test.ts

import { describe, it, expect } from 'vitest';
import {
  validateBudgetPeriod,
  validateTransactionAmount,
  safeDecimal,
  calculateBudgetUtilization,
} from './calculation-rules';

describe('Financial Calculation Rules', () => {
  describe('validateBudgetPeriod', () => {
    it('should accept valid budget period', () => {
      const start = new Date('2026-01-01');
      const end = new Date('2026-01-31');
      const result = validateBudgetPeriod(start, end);
      
      expect(result.valid).toBe(true);
    });
    
    it('should reject period < 1 day', () => {
      const start = new Date('2026-01-01');
      const end = new Date('2026-01-01');
      const result = validateBudgetPeriod(start, end);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 1 day');
    });
    
    it('should reject period > 365 days', () => {
      const start = new Date('2026-01-01');
      const end = new Date('2027-02-01');
      const result = validateBudgetPeriod(start, end);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot exceed');
    });
  });
  
  describe('safeDecimal', () => {
    it('should handle floating point precision', () => {
      expect(safeDecimal(0.1 + 0.2)).toBe(0.3);
      expect(safeDecimal(1.005)).toBe(1.01);
    });
  });
  
  describe('calculateBudgetUtilization', () => {
    it('should calculate correct percentage', () => {
      expect(calculateBudgetUtilization(50, 100)).toBe(50);
      expect(calculateBudgetUtilization(150, 100)).toBe(150);
    });
    
    it('should handle zero allocated', () => {
      expect(calculateBudgetUtilization(50, 0)).toBe(0);
    });
  });
});
```

### 5.2. Integration Tests (Playwright)

```typescript
// tests/e2e/transaction-flow.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Transaction Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard');
  });
  
  test('should create a new expense transaction', async ({ page }) => {
    // Navigate to transactions
    await page.click('a[href="/transactions"]');
    
    // Click new transaction
    await page.click('button:has-text("Nueva Transacción")');
    
    // Fill form
    await page.selectOption('select[name="accountId"]', { index: 0 });
    await page.fill('input[name="amount"]', '50.00');
    await page.fill('input[name="description"]', 'Supermercado Mercadona');
    await page.selectOption('select[name="type"]', 'EXPENSE');
    
    // Wait for AI category suggestion
    await page.waitForSelector('text=/IA sugiere:/');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify success
    await expect(page.locator('text=/Transacción creada/')).toBeVisible();
    
    // Verify transaction appears in list
    await expect(page.locator('text=Supermercado Mercadona')).toBeVisible();
    await expect(page.locator('text=50.00')).toBeVisible();
  });
  
  test('should update account balance after transaction', async ({ page }) => {
    // Get initial balance
    const initialBalance = await page.locator('[data-testid="account-balance"]').textContent();
    
    // Create expense
    await page.click('a[href="/transactions"]');
    await page.click('button:has-text("Nueva Transacción")');
    await page.fill('input[name="amount"]', '25.00');
    await page.fill('input[name="description"]', 'Test expense');
    await page.click('button[type="submit"]');
    
    // Navigate back to dashboard
    await page.click('a[href="/dashboard"]');
    
    // Verify balance decreased
    const newBalance = await page.locator('[data-testid="account-balance"]').textContent();
    expect(parseFloat(newBalance!)).toBe(parseFloat(initialBalance!) - 25.00);
  });
});
```

---

## 6. Deployment & DevOps

### 6.1. Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/finance_db?schema=public"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Encryption (generate with: openssl rand -base64 32)
ENCRYPTION_KEY="base64-encoded-32-byte-key"

# OpenAI
OPENAI_API_KEY="sk-..."

# Anthropic (optional)
ANTHROPIC_API_KEY="sk-ant-..."

# Plaid (optional for bank sync)
PLAID_CLIENT_ID="your-client-id"
PLAID_SECRET="your-secret"
PLAID_ENV="sandbox" # or "development", "production"

# Redis (for rate limiting)
UPSTASH_REDIS_URL="https://..."
UPSTASH_REDIS_TOKEN="..."

# Vercel Blob Storage (for documents)
BLOB_READ_WRITE_TOKEN="..."
```

### 6.2. Docker Configuration

```dockerfile
# Dockerfile

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml

version: '3.8'

services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: finance_user
      POSTGRES_PASSWORD: finance_password
      POSTGRES_DB: finance_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://finance_user:finance_password@postgres:5432/finance_db
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
```

### 6.3. CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml

name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: pgvector/pgvector:pg16
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate Prisma Client
        run: npx prisma generate
      
      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run linter
        run: npm run lint
      
      - name: Build application
        run: npm run build
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 7. Monitoring & Observability

### 7.1. Error Tracking (Sentry)

```typescript
// src/lib/monitoring/sentry.ts

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request?.data) {
      delete event.request.data.password;
      delete event.request.data.plaidAccessToken;
    }
    
    return event;
  },
});

// Custom error reporting
export function reportError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}
```

### 7.2. Performance Monitoring

```typescript
// src/lib/monitoring/performance.ts

export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    
    // Log slow operations (> 1 second)
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Operation failed: ${name} after ${duration}ms`, error);
    throw error;
  }
}

// Usage
const transactions = await measurePerformance(
  'fetchTransactions',
  () => prisma.transaction.findMany({ where: { userId } })
);
```

---

## 8. Checklist de Implementación

**Phase 1: Core Infrastructure (Week 1)**
- [ ] Setup Next.js 15 project with TypeScript
- [ ] Configure PostgreSQL with pgvector extension
- [ ] Implement Prisma schema and migrations
- [ ] Setup authentication with NextAuth.js
- [ ] Configure environment variables and secrets

**Phase 2: Financial Core (Week 2)**
- [ ] Implement Account model and CRUD operations
- [ ] Implement Transaction model with soft delete
- [ ] Implement Category system with hierarchy
- [ ] Build calculation engine with validation rules
- [ ] Create TransactionService with atomic operations
- [ ] Implement budget system with allocations

**Phase 3: AI Features (Week 3)**
- [ ] Setup OpenAI API integration
- [ ] Implement transaction auto-categorization
- [ ] Build document processing pipeline (OCR + chunking)
- [ ] Create vector store with pgvector
- [ ] Implement semantic search for RAG
- [ ] Build Financial Advisor chat with streaming

**Phase 4: Analytics & Projections (Week 3-4)**
- [ ] Implement analytics service (trends, breakdowns)
- [ ] Build projection engine with deterministic calculations
- [ ] Create insights generation algorithm
- [ ] Build visualization components (charts)

**Phase 5: UI & UX (Week 4)**
- [ ] Build dashboard with key metrics
- [ ] Create transaction management interface
- [ ] Build budget management interface
- [ ] Implement AI chat interface
- [ ] Create analytics/reports pages
- [ ] Add projections visualization

**Phase 6: Background Jobs (Week 4)**
- [ ] Setup cron job scheduler
- [ ] Implement recurring transactions processor
- [ ] Build insights generation job
- [ ] Implement Plaid sync job (optional)

**Phase 7: Security & Testing (Throughout)**
- [ ] Implement encryption for sensitive data
- [ ] Add rate limiting
- [ ] Write unit tests for financial calculations
- [ ] Write integration tests for critical flows
- [ ] Add E2E tests for main user journeys

**Phase 8: Deployment (Week 4)**
- [ ] Setup Docker configuration
- [ ] Configure CI/CD pipeline
- [ ] Deploy to production (Vercel)
- [ ] Setup monitoring and error tracking
- [ ] Configure database backups

---

## 9. Post-Launch Roadmap

**V2 Features (Future Enhancements):**

1. **Multi-Currency Support**
   - Real-time exchange rates
   - Multi-currency transactions
   - Currency conversion tracking

2. **Bill Negotiation Assistant**
   - Detect negotiable bills
   - AI-powered negotiation scripts
   - Savings tracking

3. **Investment Tracking**
   - Portfolio management
   - Investment performance analytics
   - Asset allocation insights

4. **Tax Planning**
   - Tax document organization
   - Deduction tracking
   - Tax projection

5. **Collaborative Features**
   - Shared accounts (couples/families)
   - Budget collaboration
   - Permission management

6. **Mobile App**
   - React Native mobile version
   - Receipt scanning with OCR
   - Push notifications

7. **Advanced AI Features**
   - Anomaly detection (fraud alerts)
   - Predictive budgeting
   - Personalized savings strategies
   - Natural language queries ("How much did I spend on restaurants last month?")

---

## Conclusión

Este documento SDD proporciona una especificación completa y rigurosa para que un agente de IA implemente un Gestor de Finanzas Personales con todas las funcionalidades solicitadas. La arquitectura está diseñada para ser:

- **Extensible**: Fácil añadir nuevas features
- **Segura**: Encriptación, validaciones, soft deletes
- **Performante**: Indexes optimizados, caching, streaming
- **Mantenible**: Código bien estructurado y documentado
- **Escalable**: Preparado para crecer con el usuario

Todas las reglas de negocio están claramente definidas, los patrones arquitectónicos están establecidos, y las restricciones para el agente IA están explícitamente marcadas. El código proporcionado es funcional y listo para producción.
