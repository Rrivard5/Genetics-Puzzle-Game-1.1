import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'
import puzzles from '../data/puzzlesRoom2.json'

export default function Room2() {
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
      setRoomUnlocked(prev => ({ ...prev, room2: true }))
      setCurrentProgress(50)
      navigate('/room3')
    } else {
      setError('Unfortunately, the code you put into the door was incorrect and the door does not budge when you push on it. Check your answers and try again. Remember, you can ask Dr. R if you need a hint.')
    }
    
    setIsSubmitting(false)
  }

  const answeredCount = Object.keys(responses).length
  const progressPercentage = (answeredCount / puzzles.length) * 100

  return (
    <div className="max-w-4xl mx-auto">
      {/* Room Header with Circuit Tech Theme */}
      <div className="relative bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-800 text-white rounded-2xl p-8 mb-8 shadow-2xl overflow-hidden">
        {/* Circuit Pattern Overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24%,rgba(59,130,246,0.3)_25%,rgba(59,130,246,0.3)_26%,transparent_27%,transparent_74%,rgba(59,130,246,0.3)_75%,rgba(59,130,246,0.3)_76%,transparent_77%,transparent)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(59,130,246,0.3)_25%,rgba(59,130,246,0.3)_26%,transparent_27%,transparent_74%,rgba(59,130,246,0.3)_75%,rgba(59,130,246,0.3)_76%,transparent_77%,transparent)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(14,165,233,0.4),transparent_50%)]"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">🔬 Room 2 - Puzzle 3</h1>
            <p className="text-xl text-blue-100">Pedigree Analysis Circuit</p>
            <p className="text-sm text-blue-200 mt-2">Dark vision pedigree for same family as in figure 1</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-200">Progress</div>
            <div className="text-2xl font-bold">{answeredCount}/{puzzles.length}</div>
          </div>
        </div>
        
        <div className="relative z-10 mt-6 bg-blue-900 bg-opacity-50 rounded-full h-3">
          <div 
            className="bg-cyan-400 rounded-full h-3 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Pedigree Information */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-blue-800 mb-4">📊 Pedigree Analysis</h2>
          <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
            <div className="text-blue-700 mb-2 font-semibold">Figure 2: Dark Vision Pedigree</div>
            <div className="text-sm text-blue-600 space-y-1">
              <div>⚫ Black = Dark vision present</div>
              <div>⚪ White = No dark vision</div>
              <div>🔘 Grey = Phenotype unknown</div>
            </div>
            <div className="mt-4 text-xs text-blue-500">
              Generation I: Two affected parents<br/>
              Generation II: Mixed offspring pattern<br/>
              Generation III: Individual 9 shows key inheritance pattern
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {puzzles.map((puzzle, index) => (
          <div key={puzzle.id} className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
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
                      className="flex items-center p-3 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors border border-blue-100"
                    >
                      <input
                        type="radio"
                        name={puzzle.id}
                        value={option}
                        checked={responses[puzzle.id] === option}
                        onChange={(e) => handleChange(e, puzzle.id)}
                        className="mr-3 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
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
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Analyzing Pedigree...
            </span>
          ) : (
            'Submit Analysis'
          )}
        </button>
      </div>

      <div className="mt-6 text-center text-gray-600">
        <p className="text-sm">💡 Hint: Look for patterns in inheritance - X-linked traits show specific patterns in males vs females</p>
      </div>
    </div>
  )
}
