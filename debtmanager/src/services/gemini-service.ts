/**
 * Gemini AI Service for personalized debt management recommendations
 * Handles API communication, rate limiting, and context management
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { FinancialProfile, DebtAnalysis, BudgetRecommendation, ConversationContext, ApiResponse } from '../types';

/**
 * Service class for managing Gemini AI interactions
 * Provides secure, rate-limited access to AI-powered financial advice
 */
class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly maxRequestsPerMinute = 10;
  private readonly requestInterval = 60000; // 1 minute in milliseconds

  /**
   * Initializes the Gemini AI service with API key validation
   * @param apiKey - Gemini API key from environment variables
   */
  constructor(apiKey?: string) {
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      } catch (error) {
        console.error('Failed to initialize Gemini AI:', error);
      }
    }
  }

  /**
   * Checks if the service is properly configured and ready to use
   */
  public isConfigured(): boolean {
    return this.model !== null;
  }

  /**
   * Implements rate limiting to prevent API quota exhaustion
   * @returns True if request is allowed, false if rate limited
   */
  private checkRateLimit(): boolean {
    const currentTime = Date.now();
    
    // Reset counter if more than a minute has passed
    if (currentTime - this.lastRequestTime > this.requestInterval) {
      this.requestCount = 0;
    }
    
    if (this.requestCount >= this.maxRequestsPerMinute) {
      return false;
    }
    
    this.requestCount++;
    this.lastRequestTime = currentTime;
    return true;
  }

  /**
   * Generates comprehensive debt analysis recommendations using AI
   * @param profile - User's complete financial profile
   * @param analysis - Debt analysis results from calculations
   * @param context - Previous conversation context for personalization
   * @returns AI-powered financial recommendations
   */
  public async getDebtRecommendations(
    profile: FinancialProfile,
    analysis: DebtAnalysis,
    context?: ConversationContext
  ): Promise<ApiResponse<string>> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Gemini AI service is not configured. Please add your API key to the .env file.'
      };
    }

    if (!this.checkRateLimit()) {
      return {
        success: false,
        error: 'Rate limit exceeded. Please wait a moment before requesting more recommendations.'
      };
    }

    try {
      const prompt = this.buildDebtAnalysisPrompt(profile, analysis, context);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        data: text
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        success: false,
        error: 'Failed to generate recommendations. Please check your API key and try again.'
      };
    }
  }

  /**
   * Generates budget optimization suggestions using AI analysis
   * @param profile - User's financial profile with income and expenses
   * @returns AI-powered budget recommendations
   */
  public async getBudgetRecommendations(
    profile: FinancialProfile
  ): Promise<ApiResponse<BudgetRecommendation[]>> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Gemini AI service is not configured. Please add your API key to the .env file.'
      };
    }

    if (!this.checkRateLimit()) {
      return {
        success: false,
        error: 'Rate limit exceeded. Please wait a moment before requesting more recommendations.'
      };
    }

    try {
      const prompt = this.buildBudgetAnalysisPrompt(profile);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the structured response into BudgetRecommendation objects
      const recommendations = this.parseBudgetRecommendations(text, profile);

      return {
        success: true,
        data: recommendations
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        success: false,
        error: 'Failed to generate budget recommendations.'
      };
    }
  }

  /**
   * Handles follow-up questions and conversational debt advice
   * @param question - User's follow-up question
   * @param context - Conversation context for continuity
   * @returns Conversational AI response
   */
  public async askFollowUpQuestion(
    question: string,
    context: ConversationContext
  ): Promise<ApiResponse<string>> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Gemini AI service is not configured.'
      };
    }

    if (!this.checkRateLimit()) {
      return {
        success: false,
        error: 'Rate limit exceeded. Please wait before asking another question.'
      };
    }

    try {
      const prompt = this.buildFollowUpPrompt(question, context);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        data: text
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        success: false,
        error: 'Failed to process your question.'
      };
    }
  }

  /**
   * Builds comprehensive prompt for debt analysis recommendations
   */
  private buildDebtAnalysisPrompt(
    profile: FinancialProfile,
    analysis: DebtAnalysis,
    context?: ConversationContext
  ): string {
    const totalExpenses = Object.values(profile.expenses).reduce((sum, exp) => sum + exp, 0);
    const disposableIncome = profile.monthlyIncome - totalExpenses;

    return `
As a certified financial advisor, provide personalized debt management recommendations based on this analysis:

FINANCIAL PROFILE:
- Monthly Income: $${profile.monthlyIncome.toLocaleString()}
- Total Monthly Expenses: $${totalExpenses.toLocaleString()}
- Disposable Income: $${disposableIncome.toLocaleString()}
- Emergency Savings: $${profile.emergencySavings.toLocaleString()}
- Number of Debts: ${profile.debts.length}

DEBT DETAILS:
${profile.debts.map(debt => `
- ${debt.name}: $${debt.balance.toLocaleString()} at ${debt.interestRate}% APR
  Minimum Payment: $${debt.minimumPayment.toLocaleString()}
`).join('')}

STRATEGY ANALYSIS:
- Strategy: ${analysis.strategy}
- Payoff Time: ${Math.floor(analysis.payoffTimeMonths / 12)} years, ${analysis.payoffTimeMonths % 12} months
- Total Interest: $${analysis.totalInterest.toLocaleString()}
- Monthly Payment: $${analysis.monthlyPayment.toLocaleString()}

EXPENSE BREAKDOWN:
- Housing: $${profile.expenses.housing}
- Utilities: $${profile.expenses.utilities}
- Food: $${profile.expenses.food}
- Insurance: $${profile.expenses.insurance}
- Transportation: $${profile.expenses.transportation}
- Discretionary: $${profile.expenses.discretionary}
- Other: $${profile.expenses.other}

Please provide:
1. Assessment of their current financial situation
2. Specific actionable recommendations for debt repayment
3. Budget optimization suggestions with dollar amounts
4. Emergency fund guidance
5. Motivational milestones and psychological strategies
6. Potential risks and how to mitigate them

Be specific, actionable, and encouraging. Format your response in clear sections with bullet points.
    `;
  }

  /**
   * Builds focused prompt for budget optimization analysis
   */
  private buildBudgetAnalysisPrompt(profile: FinancialProfile): string {
    const totalExpenses = Object.values(profile.expenses).reduce((sum, exp) => sum + exp, 0);

    return `
Analyze this monthly budget and provide specific optimization recommendations:

INCOME: $${profile.monthlyIncome.toLocaleString()}

CURRENT EXPENSES:
- Housing: $${profile.expenses.housing}
- Utilities: $${profile.expenses.utilities}
- Food: $${profile.expenses.food}
- Insurance: $${profile.expenses.insurance}
- Transportation: $${profile.expenses.transportation}
- Discretionary: $${profile.expenses.discretionary}
- Other: $${profile.expenses.other}

Total Expenses: $${totalExpenses.toLocaleString()}

For each category, provide:
1. Current amount assessment (reasonable/high/low)
2. Recommended target amount
3. Specific strategies to achieve the target
4. Potential monthly savings

Format as JSON with this structure:
{
  "recommendations": [
    {
      "category": "category_name",
      "assessment": "assessment_text",
      "recommendedAmount": number,
      "strategies": ["strategy1", "strategy2"],
      "potentialSavings": number
    }
  ]
}
    `;
  }

  /**
   * Builds prompt for conversational follow-up questions
   */
  private buildFollowUpPrompt(question: string, context: ConversationContext): string {
    const recentHistory = context.conversationHistory.slice(-3); // Last 3 interactions

    return `
Continue this debt management consultation conversation:

USER'S FINANCIAL CONTEXT:
- Monthly Income: $${context.userProfile.monthlyIncome.toLocaleString()}
- Total Debt: $${context.userProfile.debts.reduce((sum, debt) => sum + debt.balance, 0).toLocaleString()}
- Emergency Savings: $${context.userProfile.emergencySavings.toLocaleString()}

RECENT CONVERSATION:
${recentHistory.map(item => `
User: ${item.userMessage}
Assistant: ${item.aiResponse.substring(0, 200)}...
`).join('\n')}

CURRENT QUESTION: "${question}"

Provide a helpful, specific response that:
1. Directly addresses their question
2. Considers their financial context
3. Offers actionable advice
4. Maintains continuity with previous recommendations

Keep the response concise but comprehensive.
    `;
  }

  /**
   * Parses AI response into structured budget recommendations
   */
  private parseBudgetRecommendations(text: string, profile: FinancialProfile): BudgetRecommendation[] {
    const recommendations: BudgetRecommendation[] = [];

    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.recommendations || [];
      }
    } catch (error) {
      console.log('Could not parse JSON response, creating fallback recommendations');
    }

    // Fallback: create basic recommendations based on common financial advice
    const expenses = profile.expenses;
    const income = profile.monthlyIncome;

    if (expenses.discretionary > income * 0.1) {
      recommendations.push({
        category: 'discretionary',
        currentAmount: expenses.discretionary,
        recommendedAmount: Math.round(income * 0.08),
        potentialSavings: expenses.discretionary - Math.round(income * 0.08),
        reasoning: 'Discretionary spending should be limited to 8-10% of income to maximize debt repayment'
      });
    }

    if (expenses.food > income * 0.15) {
      recommendations.push({
        category: 'food',
        currentAmount: expenses.food,
        recommendedAmount: Math.round(income * 0.12),
        potentialSavings: expenses.food - Math.round(income * 0.12),
        reasoning: 'Food expenses can often be reduced through meal planning and bulk purchasing'
      });
    }

    return recommendations;
  }
}

// Export singleton instance
export const geminiService = new GeminiService(import.meta.env.VITE_GEMINI_API_KEY);