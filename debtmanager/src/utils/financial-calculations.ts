/**
 * Financial calculation utilities for debt analysis and repayment strategies
 * Contains core algorithms for debt management calculations
 */

import { Debt, DebtAnalysis, PaymentBreakdown, RepaymentStrategy } from '../types';

/**
 * Calculates monthly interest rate from annual percentage rate
 * @param annualRate - Annual interest rate as percentage (e.g., 18.5 for 18.5%)
 * @returns Monthly interest rate as decimal
 */
export const calculateMonthlyRate = (annualRate: number): number => {
  return annualRate / 100 / 12;
};

/**
 * Calculates minimum payment required for a debt
 * @param balance - Current outstanding balance
 * @param interestRate - Annual interest rate as percentage
 * @param months - Target payoff period in months
 * @returns Minimum monthly payment amount
 */
export const calculateMinimumPayment = (
  balance: number,
  interestRate: number,
  months: number = 120 // Default 10 years
): number => {
  const monthlyRate = calculateMonthlyRate(interestRate);
  
  if (monthlyRate === 0) return balance / months;
  
  return (balance * monthlyRate * Math.pow(1 + monthlyRate, months)) /
         (Math.pow(1 + monthlyRate, months) - 1);
};

/**
 * Generates detailed payment schedule for a single debt
 * @param debt - Debt object with balance, rate, and payment info
 * @param monthlyPayment - Fixed monthly payment amount
 * @returns Array of monthly payment breakdowns
 */
export const generatePaymentSchedule = (
  debt: Debt,
  monthlyPayment: number
): PaymentBreakdown[] => {
  const schedule: PaymentBreakdown[] = [];
  let remainingBalance = debt.balance;
  let month = 1;
  
  const monthlyRate = calculateMonthlyRate(debt.interestRate);
  
  while (remainingBalance > 0.01 && month <= 600) { // Safety limit of 50 years
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = Math.min(monthlyPayment - interestPayment, remainingBalance);
    
    // Ensure we don't go negative
    const actualPayment = Math.min(monthlyPayment, remainingBalance + interestPayment);
    const actualPrincipal = actualPayment - interestPayment;
    
    remainingBalance -= actualPrincipal;
    
    schedule.push({
      month,
      principal: actualPrincipal,
      interest: interestPayment,
      balance: Math.max(0, remainingBalance),
      totalPayment: actualPayment
    });
    
    month++;
  }
  
  return schedule;
};

/**
 * Implements debt snowball strategy (smallest balance first)
 * @param debts - Array of debt objects
 * @param availablePayment - Total monthly payment available for debt reduction
 * @returns Complete debt analysis with snowball strategy
 */
export const calculateSnowballStrategy = (
  debts: Debt[],
  availablePayment: number
): DebtAnalysis => {
  // Sort debts by balance (smallest first)
  const sortedDebts = [...debts].sort((a, b) => a.balance - b.balance);
  
  return calculateDebtStrategy(sortedDebts, availablePayment, 'snowball');
};

/**
 * Implements debt avalanche strategy (highest interest rate first)
 * @param debts - Array of debt objects
 * @param availablePayment - Total monthly payment available for debt reduction
 * @returns Complete debt analysis with avalanche strategy
 */
export const calculateAvalancheStrategy = (
  debts: Debt[],
  availablePayment: number
): DebtAnalysis => {
  // Sort debts by interest rate (highest first)
  const sortedDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);
  
  return calculateDebtStrategy(sortedDebts, availablePayment, 'avalanche');
};

/**
 * Implements hybrid strategy (balance psychological impact with mathematical efficiency)
 * @param debts - Array of debt objects
 * @param availablePayment - Total monthly payment available for debt reduction
 * @returns Complete debt analysis with hybrid strategy
 */
export const calculateHybridStrategy = (
  debts: Debt[],
  availablePayment: number
): DebtAnalysis => {
  // Create hybrid score: balance impact (40%) + interest savings (60%)
  const scoredDebts = debts.map(debt => ({
    ...debt,
    hybridScore: (debt.balance / 10000) * 0.4 + debt.interestRate * 0.6
  }));
  
  // Sort by hybrid score (lowest first for quicker psychological wins)
  const sortedDebts = scoredDebts.sort((a, b) => a.hybridScore - b.hybridScore);
  
  return calculateDebtStrategy(sortedDebts, availablePayment, 'hybrid');
};

/**
 * Core debt repayment calculation engine
 * @param sortedDebts - Pre-sorted array of debts based on strategy
 * @param availablePayment - Total monthly payment available
 * @param strategy - Strategy type for labeling
 * @returns Complete debt analysis results
 */
const calculateDebtStrategy = (
  sortedDebts: Debt[],
  availablePayment: number,
  strategy: RepaymentStrategy
): DebtAnalysis => {
  const debtCopies = sortedDebts.map(debt => ({ ...debt }));
  const paymentSchedule: PaymentBreakdown[] = [];
  const debtOrder: string[] = [];
  
  let month = 1;
  let totalInterest = 0;
  let remainingPayment = availablePayment;
  
  // Calculate minimum payments total
  const totalMinimums = debtCopies.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  
  if (totalMinimums > availablePayment) {
    throw new Error('Available payment is less than total minimum payments required');
  }
  
  while (debtCopies.some(debt => debt.balance > 0.01) && month <= 600) {
    let monthlyInterest = 0;
    let monthlyPrincipal = 0;
    let extraPayment = availablePayment - totalMinimums;
    
    // Process each debt
    for (let i = 0; i < debtCopies.length; i++) {
      const debt = debtCopies[i];
      
      if (debt.balance <= 0.01) continue;
      
      const monthlyRate = calculateMonthlyRate(debt.interestRate);
      const interestPayment = debt.balance * monthlyRate;
      
      let payment = debt.minimumPayment;
      
      // Apply extra payment to first debt with balance
      if (extraPayment > 0 && i === 0) {
        payment += extraPayment;
        extraPayment = 0;
      }
      
      const principalPayment = Math.min(payment - interestPayment, debt.balance);
      debt.balance -= principalPayment;
      
      monthlyInterest += interestPayment;
      monthlyPrincipal += principalPayment;
      
      // Track when debt is paid off
      if (debt.balance <= 0.01 && !debtOrder.includes(debt.id)) {
        debtOrder.push(debt.id);
        debt.balance = 0;
      }
    }
    
    totalInterest += monthlyInterest;
    
    paymentSchedule.push({
      month,
      principal: monthlyPrincipal,
      interest: monthlyInterest,
      balance: debtCopies.reduce((sum, debt) => sum + debt.balance, 0),
      totalPayment: monthlyPrincipal + monthlyInterest
    });
    
    month++;
  }
  
  return {
    strategy,
    totalInterest,
    payoffTimeMonths: month - 1,
    monthlyPayment: availablePayment,
    paymentSchedule,
    debtOrder
  };
};

/**
 * Calculates total debt load and key financial ratios
 * @param debts - Array of debt objects
 * @param monthlyIncome - User's monthly income
 * @returns Financial health metrics
 */
export const calculateDebtMetrics = (debts: Debt[], monthlyIncome: number) => {
  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalMinimumPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  const debtToIncomeRatio = (totalMinimumPayments / monthlyIncome) * 100;
  
  const weightedInterestRate = debts.reduce((sum, debt) => {
    return sum + (debt.interestRate * debt.balance);
  }, 0) / totalDebt;
  
  return {
    totalDebt,
    totalMinimumPayments,
    debtToIncomeRatio,
    averageInterestRate: weightedInterestRate,
    recommendedPayment: Math.max(totalMinimumPayments, monthlyIncome * 0.2) // 20% of income max
  };
};

/**
 * Validates debt data for calculation accuracy
 * @param debts - Array of debt objects to validate
 * @returns Array of validation error messages
 */
export const validateDebts = (debts: Debt[]): string[] => {
  const errors: string[] = [];
  
  debts.forEach((debt, index) => {
    if (debt.balance <= 0) {
      errors.push(`Debt ${index + 1}: Balance must be greater than 0`);
    }
    
    if (debt.interestRate < 0 || debt.interestRate > 50) {
      errors.push(`Debt ${index + 1}: Interest rate must be between 0% and 50%`);
    }
    
    if (debt.minimumPayment <= 0) {
      errors.push(`Debt ${index + 1}: Minimum payment must be greater than 0`);
    }
    
    const monthlyRate = calculateMonthlyRate(debt.interestRate);
    const interestOnlyPayment = debt.balance * monthlyRate;
    
    if (debt.minimumPayment <= interestOnlyPayment) {
      errors.push(`Debt ${index + 1}: Minimum payment is too low to cover interest`);
    }
  });
  
  return errors;
};