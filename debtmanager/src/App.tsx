/**
 * Main application component for the Debt Management Assistant
 * Orchestrates the multi-step debt analysis and AI recommendation workflow
 */

import React, { useState } from 'react';
import { Calculator, TrendingUp, Brain, Shield } from 'lucide-react';
import { DebtForm } from './components/DebtForm';
import { DebtAnalysis } from './components/DebtAnalysis';
import { FinancialProfile } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';

/**
 * Main application state management and component routing
 */
function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'form' | 'analysis'>('landing');
  const [financialProfile, setFinancialProfile] = useLocalStorage<FinancialProfile | null>('debt-profile', null);

  /**
   * Handles form submission and transitions to analysis view
   */
  const handleProfileComplete = (profile: FinancialProfile) => {
    setFinancialProfile(profile);
    setCurrentView('analysis');
  };

  /**
   * Handles navigation back to form from analysis
   */
  const handleBackToForm = () => {
    setCurrentView('form');
  };

  /**
   * Handles starting a new analysis
   */
  const handleStartAnalysis = () => {
    setCurrentView('form');
  };

  /**
   * Renders the landing page with feature highlights
   */
  const renderLandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Take Control of Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600"> Debt Journey</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Get personalized debt repayment strategies powered by AI. Compare snowball, avalanche, and hybrid approaches 
              to find the perfect plan for your financial situation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleStartAnalysis}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Start Your Free Analysis
              </button>
              {financialProfile && (
                <button
                  onClick={() => setCurrentView('analysis')}
                  className="px-8 py-4 bg-white text-gray-700 rounded-lg font-semibold text-lg border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all duration-200"
                >
                  View Previous Analysis
                </button>
              )}
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Calculator className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Calculations</h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced algorithms calculate optimal payment schedules, interest savings, and payoff timelines for multiple strategies.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Strategy Comparison</h3>
              <p className="text-gray-600 leading-relaxed">
                Compare debt snowball, avalanche, and hybrid strategies side-by-side to find your ideal approach.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Recommendations</h3>
              <p className="text-gray-600 leading-relaxed">
                Get personalized advice powered by Google's Gemini AI, tailored to your unique financial situation.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Privacy First</h3>
              <p className="text-gray-600 leading-relaxed">
                Your financial data is stored locally in your browser. No account required, no data shared with third parties.
              </p>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="bg-white rounded-2xl shadow-xl p-12 mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Enter Your Information</h3>
                <p className="text-gray-600">
                  Input your income, expenses, and debt details through our secure, step-by-step form.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Your Analysis</h3>
                <p className="text-gray-600">
                  Our advanced algorithms calculate multiple repayment strategies and project your debt-free date.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Receive AI Guidance</h3>
                <p className="text-gray-600">
                  Get personalized recommendations and actionable advice to accelerate your journey to financial freedom.
                </p>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="text-center">
            <p className="text-gray-500 mb-4">Trusted by thousands to manage their debt journey</p>
            <div className="flex justify-center items-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Bank-Level Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                <span className="text-sm font-medium">AI-Powered Insights</span>
              </div>
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                <span className="text-sm font-medium">Certified Calculations</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * Main render method with view routing
   */
  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'landing' && renderLandingPage()}
      
      {currentView === 'form' && (
        <div className="py-8">
          <DebtForm 
            onSubmit={handleProfileComplete}
            initialData={financialProfile || undefined}
          />
        </div>
      )}
      
      {currentView === 'analysis' && financialProfile && (
        <div className="py-8">
          <DebtAnalysis 
            profile={financialProfile}
            onBack={handleBackToForm}
          />
        </div>
      )}
    </div>
  );
}

export default App;