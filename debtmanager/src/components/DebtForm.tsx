/**
 * Multi-step debt information collection form with comprehensive validation
 * Collects user financial data for debt analysis and AI recommendations
 */

import React, { useState } from 'react';
import { Plus, Trash2, DollarSign, Percent, Calendar, Building2 } from 'lucide-react';
import { Debt, FinancialProfile, FormErrors } from '../types';
import { validateDebts } from '../utils/financial-calculations';

interface DebtFormProps {
  onSubmit: (profile: FinancialProfile) => void;
  initialData?: FinancialProfile;
}

/**
 * Comprehensive debt and financial information collection form
 * Features multi-step progression with validation and error handling
 */
export const DebtForm: React.FC<DebtFormProps> = ({ onSubmit, initialData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Form state management
  const [profile, setProfile] = useState<FinancialProfile>(
    initialData || {
      monthlyIncome: 0,
      expenses: {
        housing: 0,
        utilities: 0,
        food: 0,
        insurance: 0,
        transportation: 0,
        discretionary: 0,
        other: 0
      },
      emergencySavings: 0,
      debts: []
    }
  );

  /**
   * Adds a new debt entry to the form
   */
  const addDebt = () => {
    const newDebt: Debt = {
      id: `debt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      balance: 0,
      interestRate: 0,
      minimumPayment: 0,
      dueDate: 1,
      type: 'credit_card'
    };
    
    setProfile(prev => ({
      ...prev,
      debts: [...prev.debts, newDebt]
    }));
  };

  /**
   * Removes a debt entry from the form
   */
  const removeDebt = (id: string) => {
    setProfile(prev => ({
      ...prev,
      debts: prev.debts.filter(debt => debt.id !== id)
    }));
  };

  /**
   * Updates a specific debt entry
   */
  const updateDebt = (id: string, field: keyof Debt, value: any) => {
    setProfile(prev => ({
      ...prev,
      debts: prev.debts.map(debt =>
        debt.id === id ? { ...debt, [field]: value } : debt
      )
    }));
  };

  /**
   * Updates profile fields (income, expenses, savings)
   */
  const updateProfile = (field: string, value: number) => {
    if (field.startsWith('expenses.')) {
      const expenseField = field.split('.')[1] as keyof typeof profile.expenses;
      setProfile(prev => ({
        ...prev,
        expenses: {
          ...prev.expenses,
          [expenseField]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  /**
   * Validates current step before allowing progression
   */
  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 1:
        if (profile.monthlyIncome <= 0) {
          newErrors.monthlyIncome = 'Monthly income is required and must be greater than 0';
        }
        break;

      case 2:
        const totalExpenses = Object.values(profile.expenses).reduce((sum, exp) => sum + exp, 0);
        if (totalExpenses >= profile.monthlyIncome) {
          newErrors.expenses = 'Total expenses cannot exceed monthly income';
        }
        
        Object.entries(profile.expenses).forEach(([key, value]) => {
          if (value < 0) {
            newErrors[`expenses.${key}`] = 'Expense amounts cannot be negative';
          }
        });
        break;

      case 3:
        if (profile.debts.length === 0) {
          newErrors.debts = 'Please add at least one debt to analyze';
        } else {
          const debtErrors = validateDebts(profile.debts);
          if (debtErrors.length > 0) {
            newErrors.debts = debtErrors.join('; ');
          }

          profile.debts.forEach((debt, index) => {
            if (!debt.name.trim()) {
              newErrors[`debt-${debt.id}-name`] = 'Debt name is required';
            }
          });
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles step navigation with validation
   */
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  /**
   * Handles form submission with final validation
   */
  const handleSubmit = () => {
    if (validateStep(3)) {
      onSubmit(profile);
    }
  };

  /**
   * Renders the step indicator at the top of the form
   */
  const renderStepIndicator = () => {
    const steps = ['Income', 'Expenses', 'Debts', 'Review'];
    
    return (
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep > index + 1
                  ? 'bg-emerald-500 text-white'
                  : currentStep === index + 1
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {index + 1}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              currentStep >= index + 1 ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {step}
            </span>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-4 rounded ${
                currentStep > index + 1 ? 'bg-emerald-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  /**
   * Renders the income collection step
   */
  const renderIncomeStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's start with your income</h2>
        <p className="text-gray-600">Enter your monthly take-home income after taxes and deductions.</p>
      </div>

      <div className="max-w-md mx-auto">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Monthly Net Income
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="number"
            value={profile.monthlyIncome || ''}
            onChange={(e) => updateProfile('monthlyIncome', parseFloat(e.target.value) || 0)}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg text-lg ${
              errors.monthlyIncome ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="5,000"
          />
        </div>
        {errors.monthlyIncome && (
          <p className="mt-2 text-sm text-red-600">{errors.monthlyIncome}</p>
        )}
      </div>
    </div>
  );

  /**
   * Renders the expenses collection step
   */
  const renderExpensesStep = () => {
    const expenseCategories = [
      { key: 'housing', label: 'Housing (rent/mortgage)', icon: Building2 },
      { key: 'utilities', label: 'Utilities', icon: DollarSign },
      { key: 'food', label: 'Food & Groceries', icon: DollarSign },
      { key: 'insurance', label: 'Insurance', icon: DollarSign },
      { key: 'transportation', label: 'Transportation', icon: DollarSign },
      { key: 'discretionary', label: 'Entertainment & Discretionary', icon: DollarSign },
      { key: 'other', label: 'Other Expenses', icon: DollarSign }
    ];

    const totalExpenses = Object.values(profile.expenses).reduce((sum, exp) => sum + exp, 0);
    const remainingIncome = profile.monthlyIncome - totalExpenses;

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Monthly Expenses</h2>
          <p className="text-gray-600">Break down your monthly expenses by category.</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total Expenses:</span>
            <span className="text-lg font-bold text-blue-600">${totalExpenses.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm font-medium text-gray-700">Remaining Income:</span>
            <span className={`text-lg font-bold ${remainingIncome >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              ${remainingIncome.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {expenseCategories.map(({ key, label, icon: Icon }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={profile.expenses[key as keyof typeof profile.expenses] || ''}
                  onChange={(e) => updateProfile(`expenses.${key}`, parseFloat(e.target.value) || 0)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                    errors[`expenses.${key}`] ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="0"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-md mx-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Emergency Savings
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={profile.emergencySavings || ''}
              onChange={(e) => updateProfile('emergencySavings', parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1,000"
            />
          </div>
        </div>

        {errors.expenses && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{errors.expenses}</p>
          </div>
        )}
      </div>
    );
  };

  /**
   * Renders the debts collection step
   */
  const renderDebtsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Debts</h2>
        <p className="text-gray-600">Add all your debts to get a comprehensive analysis.</p>
      </div>

      <div className="space-y-4">
        {profile.debts.map((debt, index) => (
          <div key={debt.id} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Debt #{index + 1}</h3>
              <button
                onClick={() => removeDebt(debt.id)}
                className="text-red-600 hover:text-red-800 p-1"
                type="button"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Debt Name
                </label>
                <input
                  type="text"
                  value={debt.name}
                  onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors[`debt-${debt.id}-name`] ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Credit Card, Student Loan, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Debt Type
                </label>
                <select
                  value={debt.type}
                  onChange={(e) => updateDebt(debt.id, 'type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="personal_loan">Personal Loan</option>
                  <option value="student_loan">Student Loan</option>
                  <option value="auto_loan">Auto Loan</option>
                  <option value="mortgage">Mortgage</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outstanding Balance
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={debt.balance || ''}
                    onChange={(e) => updateDebt(debt.id, 'balance', parseFloat(e.target.value) || 0)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5,000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interest Rate (APR %)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={debt.interestRate || ''}
                    onChange={(e) => updateDebt(debt.id, 'interestRate', parseFloat(e.target.value) || 0)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="18.99"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Payment
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={debt.minimumPayment || ''}
                    onChange={(e) => updateDebt(debt.id, 'minimumPayment', parseFloat(e.target.value) || 0)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="150"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date (Day of Month)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={debt.dueDate || ''}
                    onChange={(e) => updateDebt(debt.id, 'dueDate', parseInt(e.target.value) || 1)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="15"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addDebt}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
        type="button"
      >
        <Plus className="w-5 h-5" />
        Add Another Debt
      </button>

      {errors.debts && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{errors.debts}</p>
        </div>
      )}
    </div>
  );

  /**
   * Renders the review step before submission
   */
  const renderReviewStep = () => {
    const totalDebt = profile.debts.reduce((sum, debt) => sum + debt.balance, 0);
    const totalMinPayments = profile.debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
    const totalExpenses = Object.values(profile.expenses).reduce((sum, exp) => sum + exp, 0);
    const availableForDebt = profile.monthlyIncome - totalExpenses;

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Information</h2>
          <p className="text-gray-600">Please review your information before we generate your debt analysis.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Monthly Income:</span>
                <span className="font-semibold">${profile.monthlyIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Expenses:</span>
                <span className="font-semibold">${totalExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Available for Debt:</span>
                <span className={`font-semibold ${availableForDebt >= totalMinPayments ? 'text-emerald-600' : 'text-red-600'}`}>
                  ${availableForDebt.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Emergency Savings:</span>
                <span className="font-semibold">${profile.emergencySavings.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Debt Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Debt:</span>
                <span className="font-semibold">${totalDebt.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Number of Debts:</span>
                <span className="font-semibold">{profile.debts.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Min Payments:</span>
                <span className="font-semibold">${totalMinPayments.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Debts</h3>
          <div className="space-y-2">
            {profile.debts.map((debt, index) => (
              <div key={debt.id} className="flex justify-between items-center text-sm">
                <span>{debt.name}</span>
                <span className="font-semibold">
                  ${debt.balance.toLocaleString()} @ {debt.interestRate}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {availableForDebt < totalMinPayments && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">
              <strong>Warning:</strong> Your available income (${availableForDebt.toLocaleString()}) 
              is less than your total minimum payments (${totalMinPayments.toLocaleString()}). 
              You may need to review your budget or consider debt consolidation options.
            </p>
          </div>
        )}
      </div>
    );
  };

  /**
   * Main render method with step navigation
   */
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        {renderStepIndicator()}
        
        <div className="mb-8">
          {currentStep === 1 && renderIncomeStep()}
          {currentStep === 2 && renderExpensesStep()}
          {currentStep === 3 && renderDebtsStep()}
          {currentStep === 4 && renderReviewStep()}
        </div>

        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-2 rounded-lg font-medium ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } transition-colors`}
          >
            Previous
          </button>

          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-8 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Generate Analysis
            </button>
          )}
        </div>
      </div>
    </div>
  );
};