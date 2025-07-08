import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'
import puzzles from '../data/puzzlesRoom4.json'

export default function Room4() {
  const [responses, setResponses] = useState({})
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { setRoomUnlocked, setFinalLetter, setCurrentProgress } = useGame()

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
      setRoomUnlocked(prev => ({ ...prev, room4: true }))
      setCurrentProgress(100)
      setFinalLetter('G') // The final letter for completion
      navigate('/complete')
    } else {
      setError('Unfortunately, the code you put into the door was incorrect and the door does not budge when you push on it. Check your answers and try again. Remember, you can ask Dr. R if you need a hint.')
    }
    
    setIsSubmitting(false)
  }

  const answeredCount = Object.keys(responses).length
  const progressPercentage = (answeredCount / puzzles.length) * 100

  return (
    <div className="max-w-4xl mx-auto">
      {/* Room Header with Alien Purple Theme */}
      <div className="relative bg-gradient-to-r from-purple-800 via-violet-800 to-purple-900 text-white rounded-2xl p-8 mb-8 shadow-2xl overflow-hidden">
        {/* Alien Pattern Overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.4),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(147,51,234,0.3),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.3),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[conic-gradient(from_45deg,rgba(168,85,247,0.2),rgba(147,51,234,0.2),rgba(139,92,246,0.2))]"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">🌍 Room 4 - Puzzle 2</h1>
            <p className="text-xl text-purple-100">Alien Population Genetics</p>
            <p className="text-sm text-purple-200 mt-2">Hardy-Weinberg equilibrium in alien populations</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-purple-200">Progress</div>
            <div className="text-2xl font-bold">{answeredCount}/{puzzles.length}</div>
          </div>
        </div>
        
        <div className="relative z-10 mt-6 bg-purple-900 bg-opacity-50 rounded-full h-3">
          <div 
            className="bg-violet-400 rounded-full h-3 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Final Room Notice */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-6 mb-8">
        <div className="flex items-center">
          <span className="text-3xl mr-3">🏆</span>
          <div>
            <h2 className="text-xl font-bold text-amber-800">Final Challenge!</h2>
            <p className="text-amber-700">Complete this room to unlock the alien's final secret and help your team!</p>
          </div>
        </div>
      </div>

      {/* Hardy-Weinberg Information */}
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-purple-800 mb-4">🧬 Population Genetics</h2>
          <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
            <div className="text-purple-700 mb-2 font-semibold">Hardy-Weinberg Equilibrium</div>
            <div className="text-sm text-purple-600 space-y-1">
              <div><strong>Allele frequencies:</strong> p + q = 1</div>
              <div><strong>Genotype frequencies:</strong> p² + 2pq + q² = 1</div>
              <div><strong>Dominant allele frequency:</strong> p = 0.6</div>
              <div><strong>Recessive allele frequency:</strong> q = 0.4</div>
            </div>
            <div className="mt-4 text-xs text-purple-500">
              Click below if you need a reminder about Hardy-Weinberg equations
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {puzzles.map((puzzle, index) => (
          <div key={puzzle.id} className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
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
                      className="flex items-center p-3 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors border border-purple-100"
                    >
                      <input
                        type="radio"
                        name={puzzle.id}
                        value={option}
                        checked={responses[puzzle.id] === option}
                        onChange={(e) => handleChange(e, puzzle.id)}
                        className="mr-3 h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
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
              : 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Unlocking Final Secret...
            </span>
          ) : (
            'Complete Adventure'
          )}
        </button>
      </div>

      <div className="mt-6 text-center text-gray-600">
        <p className="text-sm">💡 Hint: Remember Hardy-Weinberg equilibrium conditions and the RNA splicing process</p>
      </div>
    </div>
  )
}
