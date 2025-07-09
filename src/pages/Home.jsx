import { Link, useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'

export default function Home() {
  const { resetGame } = useGame()
  const navigate = useNavigate()
  
  // Always reset when returning to home page
  const handleStartNewGame = () => {
    resetGame()
    // Navigate to student info for fresh start
    navigate('/student-info')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-4xl mx-auto">
        {/* Main Title */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            🧬 Genetics Escape Room
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-purple-500 mx-auto mb-6"></div>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="text-6xl mb-4 animate-pulse-soft">🛸</div>
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
            You've discovered evidence of a <span className="font-semibold text-primary-600">mysterious alien species</span>! 
            Their ancient temples hold the secrets of their genetic code. Can you unlock the mysteries of their 
            <span className="font-semibold text-secondary-600"> molecular genetics</span>, decode their 
            <span className="font-semibold text-purple-600"> inheritance patterns</span>, and understand their 
            <span className="font-semibold text-indigo-600"> population dynamics</span> before their legacy is lost forever?
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="text-2xl mb-2">🧩</div>
              <h3 className="font-semibold text-blue-800">Room 1</h3>
              <p className="text-sm text-blue-600">Molecular Genetics</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <div className="text-2xl mb-2">🔬</div>
              <h3 className="font-semibold text-green-800">Room 2</h3>
              <p className="text-sm text-green-600">Pedigree Analysis</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="text-2xl mb-2">🎲</div>
              <h3 className="font-semibold text-purple-800">Room 3</h3>
              <p className="text-sm text-purple-600">Probability Genetics</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg">
              <div className="text-2xl mb-2">🌍</div>
              <h3 className="font-semibold text-indigo-800">Room 4</h3>
              <p className="text-sm text-indigo-600">Population Genetics</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-4">
          <button
            onClick={handleStartNewGame}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <span className="mr-2">🚀</span>
            Start New Adventure
          </button>
          
          <div className="mt-4">
            <Link
              to="/instructor"
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Instructor Portal
            </Link>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
          <h2 className="text-xl font-semibold text-amber-800 mb-3">📚 How to Play</h2>
          <ul className="text-amber-700 space-y-2 text-left max-w-2xl mx-auto">
            <li>• Enter your student information to begin</li>
            <li>• Complete each room by answering all genetics questions correctly</li>
            <li>• Each room unlocks the next one upon completion</li>
            <li>• Each play session is tracked separately</li>
            <li>• Collect the final letter to help your team succeed!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
