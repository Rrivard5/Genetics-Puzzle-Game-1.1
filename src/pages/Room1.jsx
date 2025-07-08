import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'
import puzzles from '../data/puzzlesRoom1.json'

export default function Room1() {
  const [responses, setResponses] = useState({})
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showHint, setShowHint] = useState({})
  const [showGeneticCode, setShowGeneticCode] = useState(false)
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
      setError('ALL PUZZLE LOCKS MUST BE ACTIVATED TO PROCEED')
      return
    }

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const allCorrect = puzzles.every(p => p.answer === responses[p.id])
    
    if (allCorrect) {
      setRoomUnlocked(prev => ({ ...prev, room1: true }))
      setCurrentProgress(25)
      navigate('/room2')
    } else {
      setError('ANCIENT LOCKS REMAIN SEALED. THE SPIRITS REJECT YOUR ANSWERS. SEEK THE TRUTH IN THE GENETIC CODEX.')
    }
    
    setIsSubmitting(false)
  }

  const answeredCount = Object.keys(responses).length
  const isLockSolved = (puzzleId) => responses[puzzleId] === puzzles.find(p => p.id === puzzleId)?.answer

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-green-900 to-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 left-32 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 right-10 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Temple Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-400 to-purple-400" 
              style={{ fontFamily: 'Impact, "Arial Black", sans-serif', letterSpacing: '3px', textShadow: '0 0 20px rgba(34, 197, 94, 0.5)' }}>
            TEMPLE OF MOLECULAR GENESIS
          </h1>
          <div className="h-1 w-48 mx-auto bg-gradient-to-r from-green-400 to-blue-400 mb-4 animate-pulse"></div>
          <p className="text-xl text-green-300 font-mono tracking-wider">
            GENETIC SEQUENCE: 3'CGACGATACG<span className="bg-yellow-400 text-black px-1 rounded font-bold animate-pulse">G</span>AGGGGTCACTCCT5'
          </p>
        </div>

        {/* Genetic Code Table */}
        <div className="mb-8 flex justify-center">
          <button
            onClick={() => setShowGeneticCode(!showGeneticCode)}
            className="bg-gradient-to-r from-purple-800 to-blue-800 text-white px-6 py-3 rounded-lg font-bold text-lg border-2 border-purple-400 hover:border-purple-300 transition-all transform hover:scale-105 shadow-lg"
            style={{ fontFamily: 'Impact, "Arial Black", sans-serif', letterSpacing: '1px' }}
          >
            {showGeneticCode ? '⬆ HIDE' : '⬇ REVEAL'} ANCIENT GENETIC CODEX
          </button>
        </div>

        {showGeneticCode && (
          <div className="mb-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-black border-4 border-purple-400 rounded-xl p-6 shadow-2xl">
            <h3 className="text-center text-2xl font-bold text-purple-300 mb-4" style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>
              🧬 ALIEN GENETIC TRANSLATION MATRIX 🧬
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border-2 border-purple-400 p-2 text-center bg-gradient-to-br from-purple-800 to-indigo-800">
                      <div className="text-purple-200 font-bold">Second letter</div>
                    </th>
                    <th className="border-2 border-purple-400 p-2 bg-blue-800 text-white font-bold">U</th>
                    <th className="border-2 border-purple-400 p-2 bg-yellow-700 text-white font-bold">C</th>
                    <th className="border-2 border-purple-400 p-2 bg-green-700 text-white font-bold">A</th>
                    <th className="border-2 border-purple-400 p-2 bg-purple-700 text-white font-bold">G</th>
                    <th className="border-2 border-purple-400 p-2 text-center bg-gradient-to-br from-purple-800 to-indigo-800">
                      <div className="text-purple-200 font-bold">Third letter</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm font-mono">
                  <tr>
                    <td rowSpan="4" className="border-2 border-purple-400 p-2 text-center bg-blue-800 text-white font-bold">U</td>
                    <td className="border border-purple-400 p-1 bg-gray-800 text-white">UUU<br/>UUC} <span className="text-yellow-300">Phe</span></td>
                    <td className="border border-purple-400 p-1 bg-gray-800 text-white">UCU<br/>UCC<br/>UCA<br/>UCG} <span className="text-yellow-300">Ser</span></td>
                    <td className="border border-purple-400 p-1 bg-gray-800 text-white">UAU<br/>UAC} <span className="text-yellow-300">Tyr</span><br/>UAA <span className="text-red-400">Stop</span><br/>UAG <span className="text-red-400">Stop</span></td>
                    <td className="border border-purple-400 p-1 bg-gray-800 text-white">UGU<br/>UGC} <span className="text-yellow-300">Cys</span><br/>UGA <span className="text-red-400">Stop</span><br/>UGG <span className="text-yellow-300">Trp</span></td>
                    <td rowSpan="4" className="border-2 border-purple-400 p-2 text-center bg-purple-800 text-white font-bold">U<br/>C<br/>A<br/>G</td>
                  </tr>
                  <tr>
                    <td className="border border-purple-400 p-1 bg-gray-800 text-white">UUA<br/>UUG} <span className="text-yellow-300">Leu</span></td>
                    <td className="border border-purple-400 p-1 bg-gray-800 text-white"></td>
                    <td className="border border-purple-400 p-1 bg-gray-800 text-white"></td>
                    <td className="border border-purple-400 p-1 bg-gray-800 text-white"></td>
                  </tr>
                  <tr>
                    <td rowSpan="4" className="border-2 border-purple-400 p-2 text-center bg-yellow-700 text-white font-bold">C</td>
                    <td className="border border-purple-400 p-1 bg-gray-800 text-white">CUU<br/>CUC<br/>CUA<br/>CUG} <span className="text-yellow-300">Leu</span></td>
                    <td className="border border-purple-400 p-1 bg-gray-800 text-white">CCU<br/>CCC<br/>CCA<br/>CCG} <span className="text-yellow-300">Pro</span></td>
                    <td className="border border-purple-400 p-1 bg-gray-800 text-white">CAU<br/>CAC} <span className="text-yellow-300">His</span><br/>CAA<br/>CAG} <span className="text-yellow-300">Gln</span></td>
                    <td className="border border-purple-400 p-1 bg-gray-800 text-white">CGU<br/>CGC<br/>CGA<br/>CGG} <span className="text-yellow-300">Arg</span></td>
                  </tr>
                  <tr>
                    <td rowSpan="4" className="border-2 border-purple-400 p-2 text-center bg-green-700 text-white font-bold">A</td>
                    <td className="border border-purple-400 p-1 bg-gray-800 text-white">AUU<br/>AUC<br/>AUA} <span className="text-yellow-300">Ile</span><br/><span className="text-red-300">AUG</span> <span className="text-yellow-300">Met</span></td>
                    <td className="border border-purple-400 p-1 bg-gray-800 text-white">ACU<br/>ACC<br/>ACA<br/>ACG} <span className="text-yellow-300">Thr</span></td>
                    <td className="border border-purple-400 p-1 bg-gray-800 text-white">AAU<br/>AAC} <span className="text-yellow-300">Asn</span><br/>AAA<br/>AAG} <span className="text-yellow-300">Lys</span></td>
                    <td className="border border-purple-400 p-1 bg-gray-800 text-white">AGU<br/>AGC} <span className="text-yellow-300">Ser</span><br/>AGA<br/>AGG} <span className="text-yellow-300">Arg</span></td>
                  </tr>
                  <tr>
                    <td rowSpan="4" className="border-2 border-purple-400 p-2 text-center bg-purple-700 text-white font-bold">G</td>
                    <td className="border border-purple-400 p-1 bg-gray-800 text-white">GUU<br/>GUC<br/>GUA<br/>GUG} <span className="text-yellow-300">Val</span></td>
                    <td className="border border-purple-400 p-1 bg-gray-800 text-white">GCU<br/>GCC<br/>GCA<br/>GCG} <span className="text-yellow-300">Ala</span></td>
                    <td className="border border-purple-400 p-1 bg-gray-800 text-white">GAU<br/>GAC} <span className="text-yellow-300">Asp</span><br/>GAA<br/>GAG} <span className="text-yellow-300">Glu</span></td>
                    <td className="border border-purple-400 p-1 bg-gray-800 text-white">GGU<br/>GGC<br/>GGA<br/>GGG} <span className="text-yellow-300">Gly</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Ancient Door with Puzzle Locks */}
        <div className="relative">
          {/* Door Frame */}
          <div className="bg-gradient-to-b from-stone-800 via-stone-700 to-stone-900 rounded-3xl p-8 border-8 border-yellow-600 shadow-2xl">
            {/* Door Surface */}
            <div className="bg-gradient-to-br from-stone-600 via-stone-700 to-stone-800 rounded-2xl p-6 border-4 border-yellow-500 relative">
              
              {/* Ancient Symbols */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-6xl text-yellow-400 animate-pulse">
                🧬
              </div>
              
              {/* Progress Indicator */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-yellow-300 mb-2" style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>
                  PUZZLE LOCKS: {answeredCount}/3
                </h2>
                <div className="flex justify-center space-x-4">
                  {puzzles.map((puzzle, index) => (
                    <div key={puzzle.id} className={`w-4 h-4 rounded-full border-2 ${
                      isLockSolved(puzzle.id) ? 'bg-green-400 border-green-300 animate-pulse' : 
                      responses[puzzle.id] ? 'bg-yellow-400 border-yellow-300' : 
                      'bg-gray-600 border-gray-500'
                    }`}></div>
                  ))}
                </div>
              </div>

              {/* Puzzle Locks */}
              <div className="space-y-8">
                {puzzles.map((puzzle, index) => (
                  <div key={puzzle.id} className="relative">
                    {/* Lock Container */}
                    <div className={`border-4 rounded-xl p-6 transition-all duration-500 ${
                      isLockSolved(puzzle.id) ? 'border-green-400 bg-gradient-to-br from-green-900 to-green-800 shadow-green-400/50' :
                      responses[puzzle.id] ? 'border-yellow-400 bg-gradient-to-br from-yellow-900 to-yellow-800 shadow-yellow-400/50' :
                      'border-red-400 bg-gradient-to-br from-red-900 to-red-800 shadow-red-400/50'
                    } shadow-2xl`}>
                      
                      {/* Lock Symbol */}
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold border-4 ${
                          isLockSolved(puzzle.id) ? 'bg-green-500 border-green-300 text-white' :
                          responses[puzzle.id] ? 'bg-yellow-500 border-yellow-300 text-black' :
                          'bg-red-600 border-red-400 text-white'
                        }`} style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>
                          {isLockSolved(puzzle.id) ? '🔓' : responses[puzzle.id] ? '🔶' : '🔒'}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-4 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                            <span className="text-yellow-400">LOCK {index + 1}:</span> {puzzle.question}
                          </h3>
                          
                          {/* Answer Options */}
                          <div className="space-y-3">
                            {puzzle.options.map((option, optIndex) => (
                              <label 
                                key={optIndex}
                                className="flex items-center p-4 rounded-lg cursor-pointer transition-all border-2 hover:scale-102 transform bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600 hover:border-yellow-400 hover:shadow-lg group"
                              >
                                <input
                                  type="radio"
                                  name={puzzle.id}
                                  value={option}
                                  checked={responses[puzzle.id] === option}
                                  onChange={(e) => handleChange(e, puzzle.id)}
                                  className="mr-4 h-5 w-5 text-yellow-500 border-gray-400 focus:ring-yellow-500 focus:ring-2"
                                />
                                <span className="text-white font-mono group-hover:text-yellow-300 transition-colors">{option}</span>
                              </label>
                            ))}
                          </div>

                          {/* Hint Button */}
                          {puzzle.hint && (
                            <div className="mt-4">
                              <button
                                onClick={() => toggleHint(puzzle.id)}
                                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105 border-2 border-purple-400"
                                style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
                              >
                                {showHint[puzzle.id] ? '⬆ HIDE ANCIENT WISDOM' : '⬇ SEEK ANCIENT WISDOM'}
                              </button>
                              {showHint[puzzle.id] && (
                                <div className="mt-3 bg-gradient-to-r from-purple-900 to-indigo-900 border-2 border-purple-400 rounded-lg p-4">
                                  <p className="text-purple-200 text-sm font-mono">🔮 {puzzle.hint}</p>
                                  <p className="text-xs text-purple-400 mt-2 font-mono">Record this wisdom usage on your sacred scrolls.</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-8 bg-gradient-to-r from-red-900 to-red-800 border-4 border-red-400 rounded-xl p-6 text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-red-200 font-bold text-lg" style={{ fontFamily: 'Impact, "Arial Black", sans-serif', letterSpacing: '1px' }}>
              {error}
            </p>
          </div>
        )}

        {/* Activation Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-12 py-6 rounded-xl font-bold text-2xl shadow-2xl transition-all duration-300 border-4 ${
              isSubmitting
                ? 'bg-gray-600 cursor-not-allowed border-gray-500'
                : answeredCount === 3
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-green-400 hover:border-green-300 transform hover:scale-105 animate-pulse'
                : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white border-yellow-400 hover:border-yellow-300 transform hover:scale-105'
            }`}
            style={{ fontFamily: 'Impact, "Arial Black", sans-serif', letterSpacing: '2px' }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-white mr-4"></div>
                ANCIENT MECHANISMS ACTIVATING...
              </span>
            ) : answeredCount === 3 ? (
              '🚪 OPEN TEMPLE DOOR'
            ) : (
              `🔒 SOLVE ${3 - answeredCount} MORE LOCKS`
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 font-mono text-sm">
          "Only those who understand the language of life may pass..."
        </div>
      </div>
    </div>
  )
}
