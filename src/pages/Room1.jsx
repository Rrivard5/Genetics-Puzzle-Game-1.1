import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'
import puzzles from '../data/puzzlesRoom1.json'

export default function Room1() {
  const [responses, setResponses] = useState({})
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showHint, setShowHint] = useState({})
  const navigate = useNavigate()
  const { setRoomUnlocked, setCurrentProgress } = useGame()

  const handleChange = (e, id) => {
    setResponses({ ...responses, [id]: e.target.value })
    if (error) setError(null)
  }

  const toggleHint = (puzzleId) => {
    setShowHint(prev => ({ ...prev, [puzzleId]: !prev[puzzleId] }))
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
      setRoomUnlocked(prev => ({ ...prev, room1: true }))
      setCurrentProgress(25)
      navigate('/room2')
    } else {
      setError('Unfortunately, the code you put into the door was incorrect and the door does not budge when you push on it. Check your answers and try again. Remember, you can ask for a hint.')
    }
    
    setIsSubmitting(false)
  }

  const answeredCount = Object.keys(responses).length
  const progressPercentage = (answeredCount / puzzles.length) * 100

  return (
    <div className="max-w-4xl mx-auto">
      {/* Room Header with Jungle Theme */}
      <div className="relative bg-gradient-to-r from-green-800 via-green-700 to-green-900 text-white rounded-2xl p-8 mb-8 shadow-2xl overflow-hidden">
        {/* Jungle Pattern Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-800"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(34,197,94,0.3),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.3),transparent_50%)]"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">🧩 Room 1 - Puzzle 1</h1>
            <p className="text-xl text-green-100">Molecular Genetics Temple</p>
            <p className="text-sm text-green-200 mt-2">Unmutated Allele: 3'CGACGATACG<span className="bg-yellow-400 text-black px-1 rounded font-bold">G</span>AGGGGTCACTCCT5'</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-green-200">Progress</div>
            <div className="text-2xl font-bold">{answeredCount}/{puzzles.length}</div>
          </div>
        </div>
        
        <div className="relative z-10 mt-6 bg-green-900 bg-opacity-50 rounded-full h-3">
          <div 
            className="bg-yellow-400 rounded-full h-3 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* DNA Sequence Display */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6 mb-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-green-800 mb-4">🧬 Genetic Code Analysis</h2>
          <div className="bg-white rounded-lg p-4 font-mono text-lg border-2 border-green-300">
            <div className="mb-2 text-green-700">Original: 3'CGACGATACG<span className="bg-yellow-300 px-1 rounded">G</span>AGGGGTCACTCCT5'</div>
            <div className="text-green-600">Potential mutations:</div>
            <div className="text-sm mt-2 space-y-1">
              <div className="text-yellow-600">🟡 Point mutation from G to A</div>
              <div className="text-yellow-600">🟡 Point mutation from G to C</div>
              <div className="text-blue-600">🔵 Point mutation from G to T</div>
              <div className="text-purple-600">🟣 Point mutation from G to T</div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {puzzles.map((puzzle, index) => (
          <div key={puzzle.id} className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 leading-relaxed">
                  {puzzle.question}
                </h3>
                <div className="space-y-2 mb-4">
                  {puzzle.options.map((option, optIndex) => (
                    <label 
                      key={optIndex}
                      className="flex items-center p-3 rounded-lg hover:bg-green-50 cursor-pointer transition-colors border border-green-100"
                    >
                      <input
                        type="radio"
                        name={puzzle.id}
                        value={option}
                        checked={responses[puzzle.id] === option}
                        onChange={(e) => handleChange(e, puzzle.id)}
                        className="mr-3 h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                
                {/* Hint Button */}
                {puzzle.hint && (
                  <div className="mt-4">
                    <button
                      onClick={() => toggleHint(puzzle.id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {showHint[puzzle.id] ? 'Hide Hint' : 'Click here to try and unlock a hint'}
                    </button>
                    {showHint[puzzle.id] && (
                      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800 text-sm">💡 {puzzle.hint}</p>
                        <p className="text-xs text-yellow-600 mt-2">Please record on your worksheet that you used this hint.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">🚫</span>
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Unlocking Temple Door...
            </span>
          ) : (
            'Submit Temple Code'
          )}
        </button>
      </div>
    </div>
  )
}
