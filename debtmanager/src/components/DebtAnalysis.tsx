/**
 * Comprehensive debt analysis dashboard with interactive visualizations
 * Displays debt repayment strategies, payment schedules, and AI recommendations
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Target, MessageCircle, Loader2 } from 'lucide-react';
import { FinancialProfile, DebtAnalysis as DebtAnalysisType, RepaymentStrategy, ConversationContext } from '../types';
import { calculateSnowballStrategy, calculateAvalancheStrategy, calculateHybridStrategy, calculateDebtMetrics } from '../utils/financial-calculations';
import { geminiService } from '../services/gemini-service';
import { useConversationHistory } from '../hooks/useLocalStorage';

interface DebtAnalysisProps {
  profile: FinancialProfile;
  onBack: () => void;
}

/**
 * Main debt analysis component with strategy comparison and AI recommendations
 */
export const DebtAnalysis: React.FC<DebtAnalysisProps> = ({ profile, onBack }) => {
  const [selectedStrategy, setSelectedStrategy] = useState<RepaymentStrategy>('avalanche');
  const [analyses, setAnalyses] = useState<Record<RepaymentStrategy, DebtAnalysisType>>({} as any);
  const [aiRecommendations, setAiRecommendations] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [conversationResponse, setConversationResponse] = useState('');
  const { history, addConversation } = useConversationHistory();

  const totalExpenses = Object.values(profile.expenses).reduce((sum, exp) => sum + exp, 0);
  const availableForDebt = profile.monthlyIncome - totalExpenses;
  const debtMetrics = calculateDebtMetrics(profile.debts, profile.monthlyIncome);

  /**
   * Calculate all debt repayment strategies on component mount
   */
  useEffect(() => {
    try {
      const snowball = calculateSnowballStrategy(profile.debts, availableForDebt);
      const avalanche = calculateAvalancheStrategy(profile.debts, availableForDebt);
      const hybrid = calculateHybridStrategy(profile.debts, availableForDebt);

      setAnalyses({
        snowball,
        avalanche,
        hybrid
      });

      // Auto-load AI recommendations
      loadAIRecommendations(avalanche);
    } catch (error) {
      console.error('Error calculating debt strategies:', error);
    }
  }, [profile, availableForDebt]);

  /**
   * Loads AI-powered recommendations from Gemini service
   */
  const loadAIRecommendations = async (analysis: DebtAnalysisType) => {
    if (!geminiService.isConfigured()) {
      setAiRecommendations('AI recommendations are not available. Please configure your Gemini API key in the .env file to get personalized advice.');
      return;
    }

    setIsLoadingAI(true);
    
    const context: ConversationContext = {
      userProfile: profile,
      previousRecommendations: [],
      conversationHistory: history
    };

    const response = await geminiService.getDebtRecommendations(profile, analysis, context);
    
    if (response.success && response.data) {
      setAiRecommendations(response.data);
    } else {
      setAiRecommendations(`Unable to load AI recommendations: ${response.error}`);
    }
    
    setIsLoadingAI(false);
  };

  /**
   * Handles follow-up questions to the AI
   */
  const handleFollowUpQuestion = async () => {
    if (!followUpQuestion.trim() || !geminiService.isConfigured()) return;

    setIsLoadingAI(true);
    
    const context: ConversationContext = {
      userProfile: profile,
      previousRecommendations: [aiRecommendations],
      conversationHistory: history
    };

    const response = await geminiService.askFollowUpQuestion(followUpQuestion, context);
    
    if (response.success && response.data) {
      setConversationResponse(response.data);
      addConversation(followUpQuestion, response.data);
      setFollowUpQuestion('');
    } else {
      setConversationResponse(`Error: ${response.error}`);
    }
    
    setIsLoadingAI(false);
  };

  /**
   * Renders strategy comparison cards
   */
  const renderStrategyComparison = () => {
    const strategies: { key: RepaymentStrategy; name: string; description: string; color: string }[] = [
      {
        key: 'snowball',
        name: 'Debt Snowball',
        description: 'Pay smallest balances first for psychological wins',
        color: 'blue'
      },
      {
        key: 'avalanche',
        name: 'Debt Avalanche',
        description: 'Pay highest interest rates first to save money',
        color: 'emerald'
      },
      {
        key: 'hybrid',
        name: 'Hybrid Strategy',
        description: 'Balance psychological impact with interest savings',
        color: 'amber'
      }
    ];

    return (
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {strategies.map(({ key, name, description, color }) => {
          const analysis = analyses[key];
          if (!analysis) return null;

          const isSelected = selectedStrategy === key;
          const colorClasses = {
            blue: isSelected ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200 hover:border-blue-300',
            emerald: isSelected ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-gray-200 hover:border-emerald-300',
            amber: isSelected ? 'bg-amber-50 border-amber-500' : 'bg-white border-gray-200 hover:border-amber-300'
          };

          return (
            <div
              key={key}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${colorClasses[color]}`}
              onClick={() => setSelectedStrategy(key)}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{name}</h3>
              <p className="text-sm text-gray-600 mb-4">{description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Payoff Time:</span>
                  <span className="font-semibold">
                    {Math.floor(analysis.payoffTimeMonths / 12)}y {analysis.payoffTimeMonths % 12}m
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Interest:</span>
                  <span className="font-semibold">${analysis.totalInterest.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * Renders detailed analysis for the selected strategy
   */
  const renderDetailedAnalysis = () => {
    const analysis = analyses[selectedStrategy];
    if (!analysis) return null;

    // Create simplified payment schedule for visualization (yearly summaries)
    const yearlyData = analysis.paymentSchedule.reduce((acc, payment) => {
      const year = Math.floor((payment.month - 1) / 12) + 1;
      if (!acc[year]) {
        acc[year] = { totalPrincipal: 0, totalInterest: 0, endBalance: 0 };
      }
      acc[year].totalPrincipal += payment.principal;
      acc[year].totalInterest += payment.interest;
      acc[year].endBalance = payment.balance;
      return acc;
    }, {} as Record<number, { totalPrincipal: number; totalInterest: number; endBalance: number }>);

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 capitalize">
          {selectedStrategy} Strategy Details
        </h3>

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Calendar className="w-5 h-5" />
              <span className="text-sm font-medium">Payoff Time</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">
              {Math.floor(analysis.payoffTimeMonths / 12)}y {analysis.payoffTimeMonths % 12}m
            </p>
          </div>

          <div className="bg-emerald-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm font-medium">Monthly Payment</span>
            </div>
            <p className="text-2xl font-bold text-emerald-700">
              ${analysis.monthlyPayment.toLocaleString()}
            </p>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Total Interest</span>
            </div>
            <p className="text-2xl font-bold text-amber-700">
              ${analysis.totalInterest.toLocaleString()}
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <Target className="w-5 h-5" />
              <span className="text-sm font-medium">Total Cost</span>
            </div>
            <p className="text-2xl font-bold text-purple-700">
              ${(debtMetrics.totalDebt + analysis.totalInterest).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Payment Schedule Visualization */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Schedule by Year</h4>
          <div className="space-y-3">
            {Object.entries(yearlyData).map(([year, data]) => {
              const totalPayments = data.totalPrincipal + data.totalInterest;
              const principalPercent = (data.totalPrincipal / totalPayments) * 100;
              const interestPercent = (data.totalInterest / totalPayments) * 100;

              return (
                <div key={year} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">Year {year}</span>
                    <span className="text-sm text-gray-600">
                      Remaining: ${data.endBalance.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex rounded-lg overflow-hidden h-6 mb-2">
                    <div 
                      className="bg-emerald-500 flex items-center justify-center"
                      style={{ width: `${principalPercent}%` }}
                    >
                      {principalPercent > 20 && (
                        <span className="text-xs text-white font-medium">Principal</span>
                      )}
                    </div>
                    <div 
                      className="bg-red-400 flex items-center justify-center"
                      style={{ width: `${interestPercent}%` }}
                    >
                      {interestPercent > 20 && (
                        <span className="text-xs text-white font-medium">Interest</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Principal: ${data.totalPrincipal.toLocaleString()}</span>
                    <span>Interest: ${data.totalInterest.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Debt Payoff Order */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Payoff Order</h4>
          <div className="space-y-2">
            {analysis.debtOrder.map((debtId, index) => {
              const debt = profile.debts.find(d => d.id === debtId);
              if (!debt) return null;

              return (
                <div key={debtId} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{debt.name}</p>
                    <p className="text-sm text-gray-600">
                      ${debt.balance.toLocaleString()} @ {debt.interestRate}% APR
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Renders AI recommendations section
   */
  const renderAIRecommendations = () => (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-purple-600" />
        AI-Powered Recommendations
      </h3>

      {isLoadingAI && !aiRecommendations ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <span className="ml-2 text-purple-600">Generating personalized recommendations...</span>
        </div>
      ) : (
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {aiRecommendations}
          </div>
        </div>
      )}

      {geminiService.isConfigured() && (
        <div className="mt-6 pt-6 border-t border-purple-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Have a question?</h4>
          <div className="flex gap-3">
            <input
              type="text"
              value={followUpQuestion}
              onChange={(e) => setFollowUpQuestion(e.target.value)}
              placeholder="Ask about your debt strategy, budget optimization, or specific concerns..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleFollowUpQuestion()}
            />
            <button
              onClick={handleFollowUpQuestion}
              disabled={!followUpQuestion.trim() || isLoadingAI}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoadingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ask'}
            </button>
          </div>

          {conversationResponse && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
              <p className="text-gray-700 whitespace-pre-wrap">{conversationResponse}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  /**
   * Main render method
   */
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 mb-4"
        >
          ← Back to Form
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Debt Analysis</h1>
        <p className="text-gray-600">
          Compare strategies and get personalized AI recommendations for your debt payoff journey.
        </p>
      </div>

      {/* Financial Health Overview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Financial Health Overview</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">${debtMetrics.totalDebt.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Debt</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{debtMetrics.debtToIncomeRatio.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Debt-to-Income Ratio</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">{debtMetrics.averageInterestRate.toFixed(2)}%</p>
            <p className="text-sm text-gray-600">Avg Interest Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">${availableForDebt.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Available for Debt</p>
          </div>
        </div>
      </div>

      {renderStrategyComparison()}
      {Object.keys(analyses).length > 0 && renderDetailedAnalysis()}
      {renderAIRecommendations()}
    </div>
  );
};