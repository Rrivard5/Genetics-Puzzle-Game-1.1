import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'
import puzzles from '../data/puzzlesRoom3.json'

export default function Room3() {
  const [responses, setResponses] = useState({})
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { setRoomUnlocked, setCurrentProgress } = useGame()

  const handleChange = (e, id) => {
    setResponses({ ...responses, [id]: e.target.value })
    if (error) setError(null)
  }

  const handleSubmit = async () => {
    const unanswered = puzzles.find(p => !responses[p.id])
    if (unanswered) {
      setError('Please answer all questions before submitting.')
      return
    }

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const allCorrect = puzzles.every(p => p.answer === responses[p.id])
    
    if (allCorrect) {
      setRoomUnlocked(prev => ({ ...prev, room3: true }))
      setCurrentProgress(75)
      navigate('/room4')
    } else {
      setError('Unfortunately, the code you put into the door was incorrect and the door does not budge when you push on it. Check your answers and try again. Remember, you can ask Dr. R if you need a hint.')
    }
    
    setIsSubmitting(false)
  }

  const answeredCount = Object.keys(responses).length
  const progressPercentage = (answeredCount / puzzles.length) * 100

  return (
    <div className="max-w-4xl mx-auto">
      {/* Room Header with Mechanical/Copper Theme */}
      <div className="relative bg-gradient-to-r from-orange-700 via-amber-700 to-orange-800 text-white rounded-2xl p-8 mb-8 shadow-2xl overflow-hidden">
        {/* Mechanical Pattern Overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[conic-gradient(from_0deg,rgba(251,146,60,0.3),rgba(245,158,11,0.3),rgba(251,146,60,0.3))]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(251,146,60,0.4),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(245,158,11,0.4),transparent_50%)]"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">🎲 Room 3 - Puzzle 2</h1>
            <p className="text-xl text-orange-100">Probability Mechanics</p>
            <p className="text-sm text-orange-200 mt-2">Calculate genetic probabilities to unlock the mechanism</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-orange-200">Progress</div>
            <div className="text-2xl font-bold">{answeredCount}/{puzzles.length}</div>
          </div>
        </div>
        
        <div className="relative z-10 mt-6 bg-orange-900 bg-opacity-50 rounded-full h-3">
          <div 
            className="bg-amber-400 rounded-full h-3 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Genetics Cross Information */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-6 mb-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-orange-800 mb-4">🧬 Genetic Cross Analysis</h2>
          <div className="bg-white rounded-lg p-4 border-2 border-orange-300">
            <div className="text-orange-700 mb-2 font-semibold">Cross: Female (BY Dd) × Male (BR d)</div>
            <div className="text-sm text-orange-600 space-y-1">
              <div><strong>Scale Color:</strong> B = Blue, R = Red, Y = Yellow (codominant)</div>
              <div><strong>Dark Vision:</strong> D = Dark vision, d = no dark vision</div>
              <div><strong>Sex-linked:</strong> Dark vision is X-linked recessive</div>
            </div>
            <div className="mt-4 text-xs text-orange-500">
              Remember: Use Punnett squares and multiplication rule for independent traits
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {puzzles.map((puzzle, index) => (
          <div key={puzzle.id} className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 leading-relaxed">
                  {puzzle.question}
                </h3>
                <div className="space-y-2">
                  {puzzle.options.map((option, optIndex) => (
                    <label 
                      key={optIndex}
                      className="flex items-center p-3 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors border border-orange-100"
                    >
                      <input
                        type="radio"
                        name={puzzle.id}
                        value={option}
                        checked={responses[puzzle.id] === option}
                        onChange={(e) => handleChange(e, puzzle.id)}
                        className="mr-3 h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">🚫</span>
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Calculating Probabilities...
            </span>
          ) : (
            'Submit Calculations'
          )}
        </button>
      </div>

      <div className="mt-6 text-center text-gray-600">
        <p className="text-sm">💡 Hint: Use Punnett squares and the multiplication rule for probability calculations</p>
      </div>
    </div>
  )
}
