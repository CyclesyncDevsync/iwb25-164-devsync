import { Button } from '../components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { 
  UserPlus, 
  ShieldCheck, 
  TrendingUp, 
  CreditCard, 
  Recycle, 
  Brain, 
  BarChart3, 
  Users, 
  ArrowRight,
  CheckCircle,
  Globe,
  Leaf,
  Zap
} from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-white to-supplier/5 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
        
        <div className="container mx-auto px-6 py-20 md:py-32 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light rounded-full text-sm font-medium">
                  <Leaf className="w-4 h-4 mr-2" />
                  Sustainable • AI-Powered • Transparent
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-supplier to-primary bg-clip-text text-transparent leading-tight">
                  CircularSync
                </h1>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-secondary dark:text-secondary-light">
                  The Future of Sustainable Material Management
                </h2>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  Join the AI-powered circular economy platform connecting recyclers, field agents, suppliers, and buyers in a transparent, efficient ecosystem.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register">
                  <Button size="lg" className="w-full sm:w-auto group">
                    Get Started Free
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/auction/demo">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    View Live Demo
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-status-verified mr-2" />
                  AI-Verified Quality
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <ShieldCheck className="w-4 h-4 text-status-verified mr-2" />
                  Secure Transactions
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Globe className="w-4 h-4 text-status-verified mr-2" />
                  Global Network
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative h-96 md:h-[500px] lg:h-[600px]">
                {/* Main Globe */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-80 h-80 md:w-96 md:h-96">
                    <Image 
                      src="/globe.svg"
                      alt="Circular Economy Network"
                      fill
                      style={{ objectFit: 'contain' }}
                      priority
                      className="animate-pulse-slow"
                    />
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-10 left-10 p-3 bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-bounce">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div className="absolute top-20 right-10 p-3 bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-bounce delay-300">
                  <BarChart3 className="w-6 h-6 text-supplier" />
                </div>
                <div className="absolute bottom-20 left-20 p-3 bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-bounce delay-700">
                  <Recycle className="w-6 h-6 text-agent" />
                </div>
                <div className="absolute bottom-10 right-20 p-3 bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-bounce delay-1000">
                  <Zap className="w-6 h-6 text-buyer" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - How It Works */}
      <section className="py-20 bg-white dark:bg-dark-bg">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary dark:text-primary-light">
              How CircularSync Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our AI-powered platform streamlines the entire circular economy workflow from material registration to secure transactions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1: Register Materials */}
            <div className="relative group">
              <div className="p-8 bg-gradient-to-br from-admin/5 to-admin/10 dark:from-admin/10 dark:to-admin/20 rounded-2xl border border-admin/20 hover:border-admin/40 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
                <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-admin/10 text-admin group-hover:bg-admin group-hover:text-white transition-all duration-300">
                  <UserPlus className="w-8 h-8" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-admin/20 text-admin text-xs font-semibold rounded-full">01</span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Suppliers</span>
                  </div>
                  <h3 className="text-xl font-bold text-secondary dark:text-secondary-light">Register Materials</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Suppliers easily register recyclable materials with photos, specifications, and location details through our intuitive platform.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Step 2: AI-Powered Verification */}
            <div className="relative group">
              <div className="p-8 bg-gradient-to-br from-agent/5 to-agent/10 dark:from-agent/10 dark:to-agent/20 rounded-2xl border border-agent/20 hover:border-agent/40 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
                <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-agent/10 text-agent group-hover:bg-agent group-hover:text-white transition-all duration-300">
                  <Brain className="w-8 h-8" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-agent/20 text-agent text-xs font-semibold rounded-full">02</span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Field Agents</span>
                  </div>
                  <h3 className="text-xl font-bold text-secondary dark:text-secondary-light">AI-Powered Verification</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Field agents use AI-assisted tools to verify material quality, authenticity, and specifications with precision and speed.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Step 3: Smart Auction Marketplace */}
            <div className="relative group">
              <div className="p-8 bg-gradient-to-br from-supplier/5 to-supplier/10 dark:from-supplier/10 dark:to-supplier/20 rounded-2xl border border-supplier/20 hover:border-supplier/40 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
                <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-supplier/10 text-supplier group-hover:bg-supplier group-hover:text-white transition-all duration-300">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-supplier/20 text-supplier text-xs font-semibold rounded-full">03</span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Marketplace</span>
                  </div>
                  <h3 className="text-xl font-bold text-secondary dark:text-secondary-light">Smart Auction System</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Verified materials enter our AI-optimized auction marketplace with real-time bidding and intelligent price recommendations.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Step 4: Secure Transactions */}
            <div className="relative group">
              <div className="p-8 bg-gradient-to-br from-buyer/5 to-buyer/10 dark:from-buyer/10 dark:to-buyer/20 rounded-2xl border border-buyer/20 hover:border-buyer/40 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
                <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-buyer/10 text-buyer group-hover:bg-buyer group-hover:text-white transition-all duration-300">
                  <CreditCard className="w-8 h-8" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-buyer/20 text-buyer text-xs font-semibold rounded-full">04</span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Buyers</span>
                  </div>
                  <h3 className="text-xl font-bold text-secondary dark:text-secondary-light">Secure Transactions</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Buyers complete purchases through our secure, multi-wallet payment system with escrow protection and instant settlements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Showcase */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-dark-surface dark:to-dark-bg">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light rounded-full text-sm font-medium">
              <Brain className="w-4 h-4 mr-2" />
              AI-Powered Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-primary dark:text-primary-light">
              Intelligence at Every Step
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our advanced AI algorithms optimize every aspect of the circular economy workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-secondary dark:text-secondary-light">Smart Material Matching</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    AI analyzes material properties, buyer preferences, and market demand to suggest optimal matches and pricing.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-supplier/10 text-supplier rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-secondary dark:text-secondary-light">Predictive Analytics</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Advanced forecasting helps suppliers optimize inventory and buyers plan purchases based on market trends.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-agent/10 text-agent rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-secondary dark:text-secondary-light">Automated Quality Assurance</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Computer vision and machine learning ensure consistent quality verification across all materials.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-buyer/10 text-buyer rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-secondary dark:text-secondary-light">Dynamic Pricing Optimization</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Real-time market analysis provides intelligent pricing suggestions to maximize value for all participants.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 via-supplier/10 to-buyer/10 rounded-3xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Match Score</span>
                      <span className="text-2xl font-bold text-status-verified">94%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-status-verified h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Price Accuracy</span>
                      <span className="text-2xl font-bold text-buyer">89%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-buyer h-2 rounded-full" style={{ width: '89%' }}></div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-lg col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">AI Insights Generated</span>
                      <span className="text-3xl font-bold text-primary">1,247</span>
                    </div>
                    <div className="flex items-center text-sm text-status-verified">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +23% this week
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-supplier to-primary dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-white dark:text-primary-light">
                Ready to Transform the Circular Economy?
              </h2>
              <p className="text-xl text-white/90 dark:text-gray-300">
                Join CircularSync today and be part of the sustainable future. Start your journey in minutes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100 shadow-xl">
                  Get Started for Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/auction/demo">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  Watch Demo
                </Button>
              </Link>
            </div>

            <div className="pt-8 border-t border-white/20 dark:border-gray-700">
              <p className="text-white/80 dark:text-gray-400">
                No credit card required • Free forever plan available • 30-day money-back guarantee
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
