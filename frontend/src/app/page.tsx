
import React from 'react';
import { Button } from '../components/ui/Button';
import Link from 'next/link';
import NewsWidget from '../components/NewsWidget';
import NewsletterSignup from '../components/NewsletterSignup';
import { 
  ShieldCheck, 
  TrendingUp, 
  BarChart3, 
  ArrowRight,
  CheckCircle,
  Target,
  Star,
  Award,
  Recycle,
  LineChart,
  DollarSign,
  Clock,
  Shield,
  Truck,
  Eye
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col overflow-hidden bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-800 overflow-hidden pt-8 pb-16">
        {/* Professional Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-transparent to-emerald-500/20 dark:from-green-400/10 dark:via-transparent dark:to-blue-400/10"></div>
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-green-500/20 dark:text-green-400/10"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-1 left-10 w-32 h-32 bg-green-100/50 dark:bg-green-900/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-8 right-10 w-40 h-40 bg-emerald-100/50 dark:bg-blue-900/20 rounded-full blur-xl animate-pulse delay-1000"></div>

        <div className="container mx-auto px-6 pt-1 pb-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="space-y-6">
                <div className="inline-flex items-center px-6 py-3 bg-white/80 dark:bg-slate-800/80 text-green-800 dark:text-green-200 rounded-full text-sm font-semibold backdrop-blur-sm border border-green-200/50 dark:border-green-400/20 shadow-lg">
                  <Star className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                  Advanced Platform • 50K+ Materials Matched • 94% Success Rate
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
                  <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-green-700 dark:from-green-400 dark:via-emerald-300 dark:to-green-500 bg-clip-text text-transparent">
                    CircularSync
                  </span>
                  <br />
                  <span className="text-slate-900 dark:text-white">
                    Smart Trading
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-medium">
                  Transform waste into value with advanced material matching, market analytics, and recommendations for the circular economy.
                </p>
              </div>

              {/* Key Features Preview */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-3xl p-6 border border-green-200/50 dark:border-slate-700/50 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Target className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">Advanced Matching</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">94% accuracy rate</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <LineChart className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">Real-time Data</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Live market insights</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Shield className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">Secure Trading</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Protected transactions</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register" className="group">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-2xl hover:shadow-green-500/25 transition-all duration-300 text-lg px-8 py-4 rounded-2xl font-semibold">
                    Start Trading Now
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#features" className="group">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-green-600 text-green-700 hover:bg-green-50 dark:border-green-400 dark:text-green-300 dark:hover:bg-green-900/20 shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-4 rounded-2xl font-semibold backdrop-blur-sm">
                    <Eye className="w-5 h-5 mr-3" />
                    See How It Works
                  </Button>
                </Link>
              </div>
            </div>

            {/* Professional Dashboard Preview */}
            <div className="relative">
              <div className="relative h-96 md:h-[600px]">
                {/* Main Dashboard Container */}
                <div className="absolute inset-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-green-200/30 dark:border-slate-700/50 p-8 overflow-hidden">
                  <div className="space-y-6">
                    {/* Dashboard Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Trading Dashboard</h3>
                          <p className="text-slate-600 dark:text-slate-400">Real-time market analytics</p>
                        </div>
                      </div>
                    </div>

                    {/* Market Overview Chart */}
                    <div className="bg-gradient-to-br from-white to-green-50/50 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-6 border border-green-100 dark:border-slate-600 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                          Market Performance
                        </h4>
                        <span className="text-sm text-green-600 dark:text-green-400 font-semibold bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">+24.3%</span>
                      </div>
                      <div className="h-32 flex items-center justify-center">
                        <div className="w-full h-full bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200/50 dark:border-green-700/30 p-4">
                          <svg viewBox="0 0 300 120" className="w-full h-full">
                            {/* Grid lines */}
                            <defs>
                              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
                              </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                            
                            {/* Chart line */}
                            <polyline
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="3"
                              points="20,80 60,65 100,70 140,55 180,45 220,35 260,25"
                            />
                            
                            {/* Data points */}
                            <circle cx="20" cy="80" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="2"/>
                            <circle cx="60" cy="65" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="2"/>
                            <circle cx="100" cy="70" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="2"/>
                            <circle cx="140" cy="55" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="2"/>
                            <circle cx="180" cy="45" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="2"/>
                            <circle cx="220" cy="35" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="2"/>
                            <circle cx="260" cy="25" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="2"/>
                            
                            {/* X-axis labels */}
                            <text x="20" y="110" textAnchor="middle" className="text-xs fill-slate-600 dark:fill-slate-400">Jan</text>
                            <text x="60" y="110" textAnchor="middle" className="text-xs fill-slate-600 dark:fill-slate-400">Feb</text>
                            <text x="100" y="110" textAnchor="middle" className="text-xs fill-slate-600 dark:fill-slate-400">Mar</text>
                            <text x="140" y="110" textAnchor="middle" className="text-xs fill-slate-600 dark:fill-slate-400">Apr</text>
                            <text x="180" y="110" textAnchor="middle" className="text-xs fill-slate-600 dark:fill-slate-400">May</text>
                            <text x="220" y="110" textAnchor="middle" className="text-xs fill-slate-600 dark:fill-slate-400">Jun</text>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 text-center border border-green-200/50 dark:border-green-700/30">
                        <div className="text-2xl font-bold text-green-700 dark:text-green-400">50.2K</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Active Materials</div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 text-center border border-blue-200/50 dark:border-blue-700/30">
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">1.8K</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Live Auctions</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 text-center border border-purple-200/50 dark:border-purple-700/30">
                        <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">94.2%</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Success Rate</div>
                      </div>
                    </div>

                    {/* Market Insights */}
                    <div className="bg-gradient-to-r from-slate-50 to-green-50/50 dark:from-slate-700 dark:to-green-900/20 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center space-x-3 mb-3">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">Market Insights</span>
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-medium">Hot</span>
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        <span className="font-medium">Premium PET bottles</span> demand up 24% - optimal listing time: 2-4 PM
                      </div>
                    </div>
                  </div>
                </div>

               
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section id="features" className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
              Smart Features for 
              <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-green-700 dark:from-green-400 dark:via-emerald-300 dark:to-green-500 bg-clip-text text-transparent block">
                Modern Trading
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Harness cutting-edge technology to revolutionize your material trading experience with precision matching, predictive market insights, and automated optimization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {/* Advanced Matching */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border border-green-200/30 dark:border-slate-700/50 hover:shadow-green-500/10 dark:hover:shadow-green-400/10 transition-all duration-300 group">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Advanced Matching</h3>
                  <p className="text-slate-600 dark:text-slate-400">Intelligent material pairing</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">Match Accuracy</span>
                    <span className="text-sm font-bold text-green-600">94.2%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{width: '94.2%'}}></div>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>Recent Match:</strong> PET bottles → Packaging Corp (+$2,400 revenue)
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Analytics */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border border-blue-200/30 dark:border-slate-700/50 hover:shadow-blue-500/10 dark:hover:shadow-blue-400/10 transition-all duration-300 group">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 dark:from-blue-400 dark:to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Live Analytics</h3>
                  <p className="text-slate-600 dark:text-slate-400">Market insights & trends</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4">
                  <div className="h-24 flex items-end justify-between space-x-2">
                    <div className="w-6 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg" style={{height: '60%'}}></div>
                    <div className="w-6 bg-gradient-to-t from-green-500 to-green-300 rounded-t-lg" style={{height: '80%'}}></div>
                    <div className="w-6 bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-lg" style={{height: '45%'}}></div>
                    <div className="w-6 bg-gradient-to-t from-orange-500 to-orange-300 rounded-t-lg" style={{height: '90%'}}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">+24%</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Volume Growth</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">$2.8M</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Monthly GMV</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Pricing */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border border-purple-200/30 dark:border-slate-700/50 hover:shadow-purple-500/10 dark:hover:shadow-purple-400/10 transition-all duration-300 group">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Smart Pricing</h3>
                  <p className="text-slate-600 dark:text-slate-400">Dynamic price optimization</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4">
                  <div className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                    <strong>Recommended Price:</strong>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">$280/ton</div>
                  <div className="text-xs text-green-600">+12% above market avg</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>Trend:</strong> Peak demand window detected (2-4 PM)
                  </div>
                </div>
              </div>
            </div>

            {/* Quality Assessment */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border border-emerald-200/30 dark:border-slate-700/50 hover:shadow-emerald-500/10 dark:hover:shadow-emerald-400/10 transition-all duration-300 group">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Quality Check</h3>
                  <p className="text-slate-600 dark:text-slate-400">Automated assessment</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">Quality Score</span>
                    <span className="text-sm font-bold text-emerald-600">A+ Grade</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-xs text-slate-600 dark:text-slate-400 ml-2">5.0/5.0</span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>Verified:</strong> Contamination-free, premium grade materials
                  </div>
                </div>
              </div>
            </div>

            {/* Supply Chain Insights */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border border-orange-200/30 dark:border-slate-700/50 hover:shadow-orange-500/10 dark:hover:shadow-orange-400/10 transition-all duration-300 group">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Supply Chain</h3>
                  <p className="text-slate-600 dark:text-slate-400">Logistics optimization</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">Delivery Time</span>
                    <span className="text-sm font-bold text-orange-600">2-3 Days</span>
                  </div>
                  <div className="text-xs text-green-600">15% faster than average</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>Route:</strong> Optimized for minimal carbon footprint
                  </div>
                </div>
              </div>
            </div>

            {/* Sustainability Metrics */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border border-teal-200/30 dark:border-slate-700/50 hover:shadow-teal-500/10 dark:hover:shadow-teal-400/10 transition-all duration-300 group">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Recycle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Sustainability</h3>
                  <p className="text-slate-600 dark:text-slate-400">Environmental impact</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">CO₂ Saved</span>
                    <span className="text-sm font-bold text-teal-600">840 kg</span>
                  </div>
                  <div className="text-xs text-green-600">This month's contribution</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>Impact:</strong> Equivalent to planting 38 trees
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry News Section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Industry <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-green-700 dark:from-green-400 dark:via-emerald-300 dark:to-green-500 bg-clip-text text-transparent">Insights</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">Stay ahead with the latest circular economy and technology trends</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl">
            <NewsWidget />
          </div>
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="py-16 bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-slate-900 dark:via-blue-900/50 dark:to-slate-800">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-green-200/30 dark:border-slate-700/50">
              <div className="mb-6">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                  Stay <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Connected</span>
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300">Get exclusive insights, market trends, and platform updates delivered to your inbox</p>
              </div>
              <NewsletterSignup />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 dark:from-slate-900 dark:via-blue-900 dark:to-slate-800 relative overflow-hidden">
        {/* Professional Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10"></div>
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
            <defs>
              <pattern id="cta-grid" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-white/20"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-grid)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-6 text-center relative">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold border border-white/30">
                <Award className="w-4 h-4 mr-2" />
                Join 50,000+ Industry Leaders Today
              </div>
              <h2 className="text-5xl md:text-7xl font-bold text-white dark:text-green-300 leading-tight">
                Ready to Transform
                <span className="block bg-gradient-to-r from-white to-green-100 dark:from-green-200 dark:to-emerald-200 bg-clip-text text-transparent">
                  The Circular Economy?
                </span>
              </h2>
              <p className="text-2xl text-white/90 dark:text-slate-200 max-w-3xl mx-auto leading-relaxed">
                Join CircularSync today and be part of the sustainable future. Start your trading journey in minutes with our advanced platform.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <Link href="/auth/register" className="group">
                <Button size="lg" className="bg-white text-green-600 hover:bg-green-50 shadow-2xl hover:shadow-white/20 text-xl px-12 py-6 rounded-2xl font-bold transition-all duration-300 group-hover:scale-105">
                  Start Trading Free
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/auction/live" className="group">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-green-600 backdrop-blur-sm shadow-lg hover:shadow-xl text-xl px-12 py-6 rounded-2xl font-bold transition-all duration-300 group-hover:scale-105">
                  <Eye className="w-6 h-6 mr-3" />
                  View Live Demo
                </Button>
              </Link>
            </div>

            <div className="pt-8 border-t border-white/20 dark:border-slate-700/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white/90 dark:text-slate-300">
                <div className="flex items-center justify-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-200" />
                  <span className="font-medium">No credit card required</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <ShieldCheck className="w-6 h-6 text-blue-200" />
                  <span className="font-medium">Enterprise-grade security</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <Clock className="w-6 h-6 text-purple-200" />
                  <span className="font-medium">Setup in 2 minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

