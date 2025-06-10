<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { Calculator, PiggyBank, Users, Phone, Menu, X, TrendingUp, Shield, Target, ChevronDown } from 'lucide-react';

const Navigation = ({ scrollY }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Tax Calculator', icon: Calculator, href: '#tax-calculator' },
    { name: 'Savings Planner', icon: PiggyBank, href: '#savings-planner' }
  ];

  const rightNavItems = [
    { name: 'About Us', icon: Users, href: '#about' },
    { name: 'Contact Us', icon: Phone, href: '#contact' }
  ];

  const NavItem = ({ item, index }) => (
    <a href={item.href} className="nav-item" style={{ animationDelay: `${index * 100}ms` }}>
      <item.icon className="nav-icon" />
      <span>{item.name}</span>
    </a>
  );

  const Logo = () => (
    <div className="logo-container">
      <div className="logo">
        <h1>DhanSaathi</h1>
      </div>
    </div>
  );

  const MobileMenu = () => (
    <div className={`mobile-menu ${isMenuOpen ? 'mobile-menu-open' : ''}`}>
      <div className="mobile-menu-content">
        {[...navItems, ...rightNavItems].map((item, index) => (
          <a
            key={item.name}
            href={item.href}
            className="mobile-nav-item"
            onClick={() => setIsMenuOpen(false)}
          >
            <item.icon className="mobile-nav-icon" />
            <span>{item.name}</span>
          </a>
        ))}
      </div>
    </div>
  );

  return (
    <nav className={`navigation ${scrollY > 50 ? 'navigation-scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-content">
          <div className="nav-left">
            {navItems.map((item, index) => (
              <NavItem key={item.name} item={item} index={index} />
            ))}
          </div>

          <Logo />

          <div className="nav-right">
            {rightNavItems.map((item, index) => (
              <NavItem key={item.name} item={item} index={index + 2} />
            ))}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="mobile-menu-button"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <MobileMenu />
    </nav>
  );
};

const HeroSection = () => {
  const ActionButton = ({ primary, children, icon: Icon }) => (
    <button className={`action-button ${primary ? 'action-button-primary' : 'action-button-secondary'}`}>
      {children}
      <Icon className="button-icon" size={20} />
    </button>
  );

  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-content">
          <h2 className="hero-title">
            Your Financial
            <span className="hero-title-accent">Success Partner</span>
          </h2>
          <p className="hero-description">
            Empowering your financial journey with intelligent tools, personalized insights, and expert guidance. 
            Safeguard your wealth with DhanSaathi.
          </p>
          <div className="hero-buttons">
            <ActionButton primary icon={TrendingUp}>
              Get Started Today
            </ActionButton>
            <ActionButton icon={ChevronDown}>
              Learn More
            </ActionButton>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ feature, index }) => (
  <div className="feature-card" style={{ animationDelay: `${index * 200}ms` }}>
    <div className="feature-icon">
      <feature.icon size={32} />
    </div>
    <h4 className="feature-title">{feature.title}</h4>
    <p className="feature-description">{feature.description}</p>
  </div>
);

const FeaturesSection = () => {
  const features = [
    {
      icon: Calculator,
      title: 'Smart Tax Calculator',
      description: 'Calculate your taxes with precision and discover optimization strategies'
    },
    {
      icon: PiggyBank,
      title: 'Savings Planner',
      description: 'Plan your financial future with intelligent savings recommendations'
    },
    {
      icon: TrendingUp,
      title: 'Investment Insights',
      description: 'Get personalized investment advice tailored to your goals'
    }
  ];

  return (
    <section className="features-section">
      <div className="container">
        <div className="features-header">
          <h3 className="features-title">Powerful Financial Tools</h3>
          <p className="features-description">
            Everything you need to make informed financial decisions and build lasting wealth
          </p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

const CTASection = () => (
  <section className="cta-section">
    <div className="container">
      <div className="cta-card">
        <h3 className="cta-title">Ready to Transform Your Finances?</h3>
        <p className="cta-description">
          Join thousands of users who have already taken control of their financial future with DhanSaathi
        </p>
        <button className="cta-button">
          Start Your Journey
          <Shield className="button-icon" size={20} />
        </button>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-content">
        <h4 className="footer-logo">DhanSaathi</h4>
        <p className="footer-tagline">Your trusted partner in financial success</p>
        <div className="footer-links">
          <a href="#" className="footer-link">Privacy Policy</a>
          <a href="#" className="footer-link">Terms of Service</a>
          <a href="#" className="footer-link">Support</a>
        </div>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div className="app">
        <Navigation scrollY={scrollY} />
        <HeroSection />
        <FeaturesSection />
        <CTASection />
        <Footer />
      </div>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          line-height: 1.6;
          color: #1f2937;
        }

        .app {
          min-height: 100vh;
          background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 50%, #f0f4e8 100%);
          overflow-x: hidden;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .navigation {
          position: fixed;
          width: 100%;
          z-index: 1000;
          transition: all 0.3s ease;
          background: transparent;
        }

        .navigation-scrolled {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 80px;
        }

        .nav-left, .nav-right {
          display: none;
          align-items: center;
          gap: 2rem;
        }

        @media (min-width: 1024px) {
          .nav-left, .nav-right {
            display: flex;
          }
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #374151;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
          transform: scale(1);
        }

        .nav-item:hover {
          color: #65a30d;
          transform: scale(1.05);
        }

        .nav-icon {
          transition: transform 0.3s ease;
        }

        .nav-item:hover .nav-icon {
          transform: rotate(12deg);
        }

        .logo-container {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        @media (min-width: 1024px) {
          .logo-container {
            flex: none;
          }
        }

        .logo {
          background: linear-gradient(135deg, #65a30d, #16a34a);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 9999px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.5s ease;
          transform: scale(1);
        }

        .logo:hover {
          transform: scale(1.1);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .logo h1 {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.025em;
        }

        @media (min-width: 768px) {
          .logo h1 {
            font-size: 1.75rem;
          }
        }

        .mobile-menu-button {
          display: block;
          padding: 0.5rem;
          border: none;
          background: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .mobile-menu-button:hover {
          background-color: #f0f4e8;
        }

        @media (min-width: 1024px) {
          .mobile-menu-button {
            display: none;
          }
        }

        .mobile-menu {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
        }

        .mobile-menu-open {
          max-height: 384px;
          opacity: 1;
        }

        @media (min-width: 1024px) {
          .mobile-menu {
            display: none;
          }
        }

        .mobile-menu-content {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 0.5rem;
          color: #374151;
          text-decoration: none;
          font-weight: 500;
          transition: background-color 0.2s ease;
        }

        .mobile-nav-item:hover {
          background-color: #f0f4e8;
        }

        .mobile-nav-icon {
          color: #65a30d;
        }

        .hero-section {
          padding: 6rem 1rem 4rem;
          text-align: center;
        }

        @media (min-width: 768px) {
          .hero-section {
            padding: 8rem 1rem 6rem;
          }
        }

        .hero-content {
          animation: fadeInUp 1s ease-out;
        }

        .hero-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        @media (min-width: 768px) {
          .hero-title {
            font-size: 4rem;
          }
        }

        @media (min-width: 1024px) {
          .hero-title {
            font-size: 4.5rem;
          }
        }

        .hero-title-accent {
          background: linear-gradient(135deg, #65a30d, #16a34a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: block;
          margin-top: 0.5rem;
        }

        .hero-description {
          font-size: 1.125rem;
          color: #6b7280;
          max-width: 48rem;
          margin: 0 auto 3rem;
          line-height: 1.7;
        }

        @media (min-width: 768px) {
          .hero-description {
            font-size: 1.25rem;
          }
        }

        .hero-buttons {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: center;
        }

        @media (min-width: 640px) {
          .hero-buttons {
            flex-direction: row;
            justify-content: center;
          }
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 1.125rem;
          cursor: pointer;
          transition: all 0.3s ease;
          transform: scale(1);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border: none;
        }

        .action-button:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .action-button-primary {
          background: linear-gradient(135deg, #65a30d, #16a34a);
          color: white;
        }

        .action-button-secondary {
          background: white;
          color: #65a30d;
          border: 2px solid #65a30d;
        }

        .action-button-secondary:hover {
          background: #65a30d;
          color: white;
        }

        .button-icon {
          transition: transform 0.3s ease;
        }

        .action-button:hover .button-icon {
          transform: translateX(4px);
        }

        .features-section {
          padding: 4rem 1rem;
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(10px);
        }

        @media (min-width: 768px) {
          .features-section {
            padding: 6rem 1rem;
          }
        }

        .features-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .features-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        @media (min-width: 768px) {
          .features-title {
            font-size: 2.5rem;
          }
        }

        .features-description {
          font-size: 1.125rem;
          color: #6b7280;
          max-width: 32rem;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          gap: 2rem;
          grid-template-columns: 1fr;
        }

        @media (min-width: 768px) {
          .features-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(101, 163, 13, 0.1);
          transition: all 0.3s ease;
          transform: translateY(0);
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .feature-icon {
          background: linear-gradient(135deg, #65a30d, #16a34a);
          color: white;
          width: 4rem;
          height: 4rem;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          transition: transform 0.3s ease;
        }

        .feature-card:hover .feature-icon {
          transform: scale(1.1);
        }

        .feature-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .feature-description {
          color: #6b7280;
          line-height: 1.7;
        }

        .cta-section {
          padding: 4rem 1rem;
        }

        @media (min-width: 768px) {
          .cta-section {
            padding: 6rem 1rem;
          }
        }

        .cta-card {
          background: linear-gradient(135deg, #65a30d, #16a34a);
          border-radius: 1.5rem;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
          max-width: 64rem;
          margin: 0 auto;
        }

        @media (min-width: 768px) {
          .cta-card {
            padding: 3rem;
          }
        }

        .cta-title {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 768px) {
          .cta-title {
            font-size: 2.5rem;
          }
        }

        .cta-description {
          font-size: 1.125rem;
          color: rgba(217, 249, 157, 1);
          margin-bottom: 2rem;
          max-width: 32rem;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-button {
          background: white;
          color: #65a30d;
          padding: 1rem 2rem;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 1.125rem;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          transform: scale(1);
        }

        .cta-button:hover {
          transform: scale(1.05);
          background: #f7faf3;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        /* Footer Styles */
        .footer {
          background: #111827;
          color: white;
          padding: 3rem 1rem;
        }

        .footer-content {
          text-align: center;
        }

        .footer-logo {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #65a30d, #16a34a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
        }

        .footer-tagline {
          color: #9ca3af;
          margin-bottom: 1.5rem;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: 2rem;
          font-size: 0.875rem;
        }

        .footer-link {
          color: #9ca3af;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .footer-link:hover {
          color: white;
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0, -30px, 0);
          }
          70% {
            transform: translate3d(0, -15px, 0);
          }
          90% {
            transform: translate3d(0, -4px, 0);
          }
        }

        /* Responsive Design */
        @media (max-width: 640px) {
          .container {
            padding: 0 0.75rem;
          }
          
          .hero-title {
            font-size: 2rem;
          }
          
          .hero-description {
            font-size: 1rem;
          }
          
          .action-button {
            padding: 0.875rem 1.5rem;
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  );
}
=======
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
>>>>>>> ed9cf4248af0f11b66c8a86281baa9e346c80924
