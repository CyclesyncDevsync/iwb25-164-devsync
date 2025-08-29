
import { Button } from '../components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import NewsWidget from '../components/NewsWidget';
import NewsletterSignup from '../components/NewsletterSignup';
import { 
  ShieldCheck, 
  TrendingUp, 
  Brain, 
  BarChart3, 
  Users, 
  ArrowRight,
  CheckCircle,
  Globe,
  Zap,
  Target,
  Lightbulb,
  PieChart,
  Activity,
  Sparkles,
  Eye,
  Filter,
  Smartphone
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col overflow-hidden bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 60 60" fill="none">
            <g opacity="0.1">
              <circle cx="30" cy="30" r="1.5" fill="currentColor" className="text-green-500"/>
              <circle cx="10" cy="10" r="1" fill="currentColor" className="text-blue-500"/>
              <circle cx="50" cy="10" r="1" fill="currentColor" className="text-purple-500"/>
              <circle cx="10" cy="50" r="1" fill="currentColor" className="text-orange-500"/>
              <circle cx="50" cy="50" r="1" fill="currentColor" className="text-green-500"/>
            </g>
          </svg>
        </div>

        <div className="container mx-auto px-6 py-16 md:py-24 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 dark:bg-gradient-to-r dark:from-green-900/30 dark:to-blue-900/30 dark:text-green-200 rounded-full text-sm font-medium backdrop-blur-sm border border-green-200/50">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI-Powered • Smart Matching • Real-time Analytics
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                  <span className="bg-gradient-to-r from-[#00684A] via-[#0066CC] to-[#8B5CF6] bg-clip-text text-transparent">
                    Intelligent
                  </span>
                  <br />
                  <span className="text-gray-900 dark:text-white">
                    Circular Economy
                  </span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
                  Transform waste into value with AI-powered material matching, predictive analytics, and smart recommendations that optimize your circular economy operations.
                </p>
              </div>

              {/* AI Features Preview */}
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">Smart Matching</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">94% accuracy</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">Live Analytics</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Real-time insights</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register">
                  <Button size="lg" className="w-full sm:w-auto group bg-gradient-to-r from-[#00684A] to-[#0066CC] hover:from-[#005a40] hover:to-[#0052a3] text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    Start Smart Trading
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#ai-demo">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-[#00684A] text-[#00684A] hover:bg-[#00684A]/10 dark:border-[#47A16B] dark:text-[#47A16B] dark:hover:bg-[#47A16B]/20">
                    <Eye className="w-4 h-4 mr-2" />
                    View AI Demo
                  </Button>
                </Link>
              </div>
            </div>

            {/* Enhanced Hero Visual */}
            <div className="relative">
              <div className="relative h-96 md:h-[500px]">
                {/* AI Dashboard Preview */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-800/90 dark:to-gray-900/90 rounded-3xl shadow-2xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Dashboard</h3>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-500">Live</span>
                      </div>
                    </div>

                    {/* Smart Matching Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Brain className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-gray-900 dark:text-white">Smart Matches</span>
                        </div>
                        <span className="text-sm text-green-600 font-semibold">+23%</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Plastic PET</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="w-14 h-full bg-green-500 rounded-full"></div>
                            </div>
                            <span className="text-xs text-gray-500">87%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Metal Aluminum</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="w-12 h-full bg-blue-500 rounded-full"></div>
                            </div>
                            <span className="text-xs text-gray-500">75%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Analytics Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center space-x-2 mb-3">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900 dark:text-white">Market Trends</span>
                      </div>
                      <div className="h-20 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-end justify-around p-2">
                        <div className="w-3 bg-blue-500 rounded-t" style={{height: '60%'}}></div>
                        <div className="w-3 bg-green-500 rounded-t" style={{height: '80%'}}></div>
                        <div className="w-3 bg-purple-500 rounded-t" style={{height: '45%'}}></div>
                        <div className="w-3 bg-orange-500 rounded-t" style={{height: '70%'}}></div>
                        <div className="w-3 bg-pink-500 rounded-t" style={{height: '90%'}}></div>
                      </div>
                    </div>

                    {/* Live Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-green-600">1.2k</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Active Materials</div>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-blue-600">847</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Live Auctions</div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-purple-600">94%</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Match Rate</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating AI Elements */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-bounce delay-500">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Showcase - Phase 12 Implementation */}
      <section id="ai-demo" className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 dark:bg-gradient-to-r dark:from-green-900/30 dark:to-blue-900/30 dark:text-green-200 rounded-full text-sm font-medium">
              <Brain className="w-4 h-4 mr-2" />
              Phase 12: AI Features Interface
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Intelligent <span className="bg-gradient-to-r from-[#00684A] via-[#0066CC] to-[#8B5CF6] bg-clip-text text-transparent">AI Features</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience next-generation AI capabilities that transform how you trade materials with smart matching, predictive analytics, and real-time insights.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Smart Matching Interface */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#00684A] to-[#0066CC] rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Smart Matching Interface</h3>
                    <p className="text-gray-600 dark:text-gray-400">AI-powered recommendation system</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Material Recommendations */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Material Recommendations
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                        <span className="text-sm font-medium">Plastic PET Bottles</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                            <div className="w-14 h-full bg-green-500 rounded-full"></div>
                          </div>
                          <span className="text-xs text-green-600 font-semibold">94%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                        <span className="text-sm font-medium">Aluminum Cans</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                            <div className="w-12 h-full bg-blue-500 rounded-full"></div>
                          </div>
                          <span className="text-xs text-blue-600 font-semibold">87%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Buyer Suggestions */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Buyer Suggestions
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">EcoPlastic Ltd</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">92% match</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">GreenMetal Co</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">89% match</div>
                      </div>
                    </div>
                  </div>

                  {/* Price Optimization */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Price Optimization Alerts
                    </h4>
                    <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg">
                      <span className="text-sm">Suggested Price Range</span>
                      <span className="text-sm font-bold text-purple-600">$245 - $280/ton</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Dashboard */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h3>
                    <p className="text-gray-600 dark:text-gray-400">AI-powered analytics and insights</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Predictive Analytics */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      Predictive Analytics
                    </h4>
                    <div className="h-24 bg-white dark:bg-gray-800 rounded-lg p-3 flex items-end justify-around">
                      <div className="flex flex-col items-center">
                        <div className="w-4 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t" style={{height: '60%'}}></div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">Week 1</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-4 bg-gradient-to-t from-green-500 to-green-300 rounded-t" style={{height: '80%'}}></div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">Week 2</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-4 bg-gradient-to-t from-purple-500 to-purple-300 rounded-t" style={{height: '45%'}}></div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">Week 3</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-4 bg-gradient-to-t from-orange-500 to-orange-300 rounded-t" style={{height: '95%'}}></div>
                        <span className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-semibold">Predicted</span>
                      </div>
                    </div>
                  </div>

                  {/* Market Trends */}
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                    <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-3 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Market Trends
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Plastic Demand</span>
                        <span className="text-sm font-semibold text-green-600">↗ +15%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Metal Prices</span>
                        <span className="text-sm font-semibold text-blue-600">↗ +8%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Paper Supply</span>
                        <span className="text-sm font-semibold text-orange-600">↘ -3%</span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Insights */}
                  <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-4">
                    <h4 className="font-semibold text-pink-800 dark:text-pink-200 mb-3 flex items-center">
                      <PieChart className="w-4 h-4 mr-2" />
                      Performance Insights
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">94%</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Success Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">2.3x</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Efficiency</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">$1.2M</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Revenue</div>
                      </div>
                    </div>
                  </div>

                  {/* Custom Reports */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <Filter className="w-4 h-4 mr-2" />
                      Custom Reports
                    </h4>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 rounded-full text-xs font-medium">
                        Weekly Report
                      </button>
                      <button className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 rounded-full text-xs font-medium">
                        Material Analysis
                      </button>
                      <button className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 rounded-full text-xs font-medium">
                        Price Trends
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Market Insights & Demand Forecasting */}
          <div className="mt-12 bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Market Insights & Demand Forecasting</h3>
              <p className="text-gray-600 dark:text-gray-400">Real-time market intelligence powered by AI</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Eye className="w-6 h-6 text-green-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Market Insights</h4>
                </div>
                <div className="space-y-3">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Top Material: Plastic PET</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">45% of total volume</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Peak Hours: 2-4 PM</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Highest activity period</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Lightbulb className="w-6 h-6 text-purple-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Demand Forecasting</h4>
                </div>
                <div className="space-y-3">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Next Week: +23% Demand</div>
                    <div className="text-xs text-green-600">Metal materials trending up</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Q2 Forecast: $2.8M</div>
                    <div className="text-xs text-blue-600">15% above Q1 results</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Smartphone className="w-6 h-6 text-orange-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Optimization Suggestions</h4>
                </div>
                <div className="space-y-3">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">List 3 hours earlier</div>
                    <div className="text-xs text-orange-600">+12% better pricing</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Bundle with aluminum</div>
                    <div className="text-xs text-purple-600">+8% buyer interest</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Simplified */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Simple. Smart. <span className="text-green-600">Sustainable.</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Three easy steps to transform your material trading with AI-powered intelligence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Step 1: Upload & AI Analysis */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Upload & AI Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Upload your materials and let our AI analyze quality, suggest pricing, and find perfect matches.
              </p>
            </div>

            {/* Step 2: Smart Matching */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Smart Matching</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Our AI connects you with verified buyers and suppliers based on real-time market insights.
              </p>
            </div>

            {/* Step 3: Secure Trading */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Secure Trading</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Complete transactions safely with escrow protection and automated smart contracts.
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <CheckCircle className="w-5 h-5 text-[#10B981]" />
              <span className="font-medium">AI-Verified Quality</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <ShieldCheck className="w-5 h-5 text-[#0066CC]" />
              <span className="font-medium">Secure Transactions</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Globe className="w-5 h-5 text-[#8B5CF6]" />
              <span className="font-medium">Global Network</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Zap className="w-5 h-5 text-[#F59E0B]" />
              <span className="font-medium">Real-time Analytics</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Real impact, measurable results</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">50K+</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Materials Matched</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">94%</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">AI Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">$2.8M</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Platform Volume</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">1.2M</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Tons Processed</div>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Industry News
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Stay updated with the latest business and technology news</p>
          </div>
          <NewsWidget />
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="max-w-md mx-auto">
            <NewsletterSignup />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#00684A] via-[#0066CC] to-[#00684A] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-white dark:text-[#47A16B]">
                Ready to Transform the Circular Economy?
              </h2>
              <p className="text-xl text-white/90 dark:text-gray-300">
                Join CircularSync today and be part of the sustainable future. Start your journey in minutes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="bg-white text-[#00684A] hover:bg-gray-100 shadow-xl">
                  Get Started for Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/auction/live">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#00684A]">
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
    </div>
  );
}

