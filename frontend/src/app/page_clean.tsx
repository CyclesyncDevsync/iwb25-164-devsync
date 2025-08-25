import { Button } from '../components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { 
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
  Zap,
  Star,
  MapPin,
  Clock,
  Award
} from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col overflow-hidden">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Recycle className="w-8 h-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">CircularSync</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-700 dark:text-gray-300 hover:text-green-600 transition-colors">Features</Link>
              <Link href="#how-it-works" className="text-gray-700 dark:text-gray-300 hover:text-green-600 transition-colors">How It Works</Link>
              <Link href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-green-600 transition-colors">Pricing</Link>
              <Link href="/auth/login" className="text-gray-700 dark:text-gray-300 hover:text-green-600 transition-colors">Sign In</Link>
              <Link href="/auth/register">
                <Button className="bg-green-600 hover:bg-green-700 text-white">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-6 py-20 md:py-32 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium">
                  <Leaf className="w-4 h-4 mr-2" />
                  Sustainable • AI-Powered • Transparent
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-green-600 bg-clip-text text-transparent leading-tight">
                  CircularSync
                </h1>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-white">
                  Revolutionizing Sustainable Material Trading
                </h2>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  Connect with verified suppliers and buyers in a secure marketplace. Trade recyclable materials efficiently with AI-powered matching and real-time auctions.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register">
                  <Button size="lg" className="w-full sm:w-auto group bg-green-600 hover:bg-green-700 text-white">
                    Start Trading Today
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/auction/live">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-green-600 text-green-600 hover:bg-green-50">
                    View Live Auctions
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Verified Materials
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <ShieldCheck className="w-4 h-4 text-green-500 mr-2" />
                  Secure Payments
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Globe className="w-4 h-4 text-green-500 mr-2" />
                  Global Network
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative h-96 md:h-[500px] lg:h-[600px]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-80 h-80 md:w-96 md:h-96">
                    <Image 
                      src="/globe.svg"
                      alt="Global Circular Economy Network"
                      fill
                      style={{ objectFit: 'contain' }}
                      priority
                      className="animate-pulse"
                    />
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-10 left-10 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-bounce">
                  <Brain className="w-6 h-6 text-green-600" />
                </div>
                <div className="absolute top-20 right-10 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-bounce delay-300">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="absolute bottom-20 left-20 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-bounce delay-700">
                  <Recycle className="w-6 h-6 text-purple-600" />
                </div>
                <div className="absolute bottom-10 right-20 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-bounce delay-1000">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - How It Works */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-green-600 dark:text-green-400">
              How CircularSync Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our AI-powered platform streamlines the entire circular economy workflow from material registration to secure transactions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1: Register Materials */}
            <div className="relative group">
              <div className="p-8 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl border border-green-200 hover:border-green-400 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
                <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                  <Users className="w-8 h-8" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-semibold rounded-full">01</span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Suppliers</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Register Materials</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Suppliers easily register recyclable materials with photos, specifications, and location details through our intuitive platform.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Step 2: AI-Powered Verification */}
            <div className="relative group">
              <div className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl border border-blue-200 hover:border-blue-400 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
                <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <Brain className="w-8 h-8" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs font-semibold rounded-full">02</span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Field Agents</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI-Powered Verification</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Field agents use AI-assisted tools to verify material quality, authenticity, and specifications with precision and speed.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Step 3: Smart Auction Marketplace */}
            <div className="relative group">
              <div className="p-8 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl border border-purple-200 hover:border-purple-400 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
                <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-purple-200 text-purple-800 text-xs font-semibold rounded-full">03</span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Marketplace</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Smart Auction System</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Verified materials enter our AI-optimized auction marketplace with real-time bidding and intelligent price recommendations.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Step 4: Secure Transactions */}
            <div className="relative group">
              <div className="p-8 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl border border-orange-200 hover:border-orange-400 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
                <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                  <CreditCard className="w-8 h-8" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-orange-200 text-orange-800 text-xs font-semibold rounded-full">04</span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Buyers</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Secure Transactions</h3>
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
      <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium">
              <Brain className="w-4 h-4 mr-2" />
              AI-Powered Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-green-600 dark:text-green-400">
              Intelligence at Every Step
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our advanced AI algorithms optimize every aspect of the circular economy workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Smart Material Matching</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    AI analyzes material properties, buyer preferences, and market demand to suggest optimal matches and pricing.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Predictive Analytics</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Advanced forecasting helps suppliers optimize inventory and buyers plan purchases based on market trends.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Automated Quality Assurance</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Computer vision and machine learning ensure consistent quality verification across all materials.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Dynamic Pricing Optimization</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Real-time market analysis provides intelligent pricing suggestions to maximize value for all participants.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-900/20 dark:via-blue-900/20 dark:to-purple-900/20 rounded-3xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Match Score</span>
                      <span className="text-2xl font-bold text-green-600">94%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Price Accuracy</span>
                      <span className="text-2xl font-bold text-blue-600">89%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '89%' }}></div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">AI Insights Generated</span>
                      <span className="text-3xl font-bold text-green-600">1,247</span>
                    </div>
                    <div className="flex items-center text-sm text-green-600">
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

      {/* Stats Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">50K+</div>
              <div className="text-gray-600 dark:text-gray-400">Materials Traded</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">1.2M+</div>
              <div className="text-gray-600 dark:text-gray-400">Tons Recycled</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">98%</div>
              <div className="text-gray-600 dark:text-gray-400">Customer Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-400">Platform Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join thousands of satisfied users who are making a difference in the circular economy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                "CircularSync has revolutionized how we trade recyclable materials. The AI matching is incredibly accurate and has increased our sales by 40%."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-600 font-semibold">MS</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Maria Santos</div>
                  <div className="text-sm text-gray-500">Supplier, EcoMaterials Inc.</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                "The real-time auction system is fantastic. We can now source materials more efficiently and at better prices than ever before."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-semibold">JC</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">James Chen</div>
                  <div className="text-sm text-gray-500">Buyer, GreenTech Solutions</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                "As a field agent, the mobile app makes verification incredibly easy. The AI tools help me assess materials quickly and accurately."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-purple-600 font-semibold">AR</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Arun Raj</div>
                  <div className="text-sm text-gray-500">Field Agent, CircularSync</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 via-blue-600 to-green-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-white dark:text-green-400">
                Ready to Transform the Circular Economy?
              </h2>
              <p className="text-xl text-white/90 dark:text-gray-300">
                Join CircularSync today and be part of the sustainable future. Start your journey in minutes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 shadow-xl">
                  Get Started for Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/auction/live">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                  View Live Auctions
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

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Recycle className="w-8 h-8 text-green-400" />
                <span className="text-xl font-bold">CircularSync</span>
              </div>
              <p className="text-gray-400">
                Transforming the circular economy through AI-powered sustainable material trading.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                  <Users className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                  <Brain className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/supplier" className="hover:text-green-400 transition-colors">For Suppliers</Link></li>
                <li><Link href="/buyer" className="hover:text-green-400 transition-colors">For Buyers</Link></li>
                <li><Link href="/agent" className="hover:text-green-400 transition-colors">Field Agents</Link></li>
                <li><Link href="/auction/live" className="hover:text-green-400 transition-colors">Live Auctions</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-green-400 transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-green-400 transition-colors">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-green-400 transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-green-400 transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-green-400 transition-colors">Help Center</Link></li>
                <li><Link href="/docs" className="hover:text-green-400 transition-colors">Documentation</Link></li>
                <li><Link href="/privacy" className="hover:text-green-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-green-400 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CircularSync. All rights reserved. Building a sustainable future together.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
