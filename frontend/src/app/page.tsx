import Link from 'next/link';
import LoginButton from '@/components/LoginButton';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold underline mb-8">
          Hello world!
        </h1>
         <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Next.js + Asgardeo</h1>
        <LoginButton />
      </div>
    </main>
        
        <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">AI-Powered Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Link 
                href="/demand-prediction" 
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                📊 Demand Prediction Dashboard
              </Link>
              <p className="text-gray-600 text-sm">
                Get AI-powered forecasts for waste material demand, pricing predictions, and market insights.
              </p>
            </div>

            <div className="space-y-3">
              <Link 
                href="/quality-assessment" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                🔍 Quality Assessment
              </Link>
              <p className="text-gray-600 text-sm">
                Upload waste images for automated quality analysis, contamination detection, and compliance checking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

}