/**
 * TypeScript type definitions for the Debt Management Assistant
 * Provides comprehensive type safety for financial data and calculations
 */

/** Represents a single debt item with all necessary financial details */
export interface Debt {
  id: string;
  name: string;
  balance: number;
  interestRate: number; // Annual percentage rate
  minimumPayment: number;
  dueDate: number; // Day of month (1-31)
  type: 'credit_card' | 'personal_loan' | 'student_loan' | 'auto_loan' | 'mortgage' | 'other';
}

/** User's complete financial profile for comprehensive analysis */
export interface FinancialProfile {
  monthlyIncome: number;
  expenses: {
    housing: number;
    utilities: number;
    food: number;
    insurance: number;
    transportation: number;
    discretionary: number;
    other: number;
  };
  emergencySavings: number;
  debts: Debt[];
}

/** Different debt repayment strategy types */
export type RepaymentStrategy = 'snowball' | 'avalanche' | 'hybrid';

/** Monthly payment breakdown for detailed analysis */
export interface PaymentBreakdown {
  month: number;
  principal: number;
  interest: number;
  balance: number;
  totalPayment: number;
}

/** Complete debt analysis results with multiple strategies */
export interface DebtAnalysis {
  strategy: RepaymentStrategy;
  totalInterest: number;
  payoffTimeMonths: number;
  monthlyPayment: number;
  paymentSchedule: PaymentBreakdown[];
  debtOrder: string[]; // Order of debt payoff by ID
}

/** Budget optimization recommendations */
export interface BudgetRecommendation {
  category: string;
  currentAmount: number;
  recommendedAmount: number;
  potentialSavings: number;
  reasoning: string;
}

/** AI conversation context for personalized recommendations */
export interface ConversationContext {
  userProfile: FinancialProfile;
  previousRecommendations: string[];
  conversationHistory: Array<{
    timestamp: Date;
    userMessage: string;
    aiResponse: string;
  }>;
}

/** Form validation state management */
export interface FormErrors {
  [key: string]: string;
}

/** API response wrapper for error handling */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}