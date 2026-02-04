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
