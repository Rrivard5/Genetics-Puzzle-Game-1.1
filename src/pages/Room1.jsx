import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'
import puzzles from '../data/puzzlesRoom1.json'
import CodonChart from '../components/CodonChart'

export default function Room1() {
  const [responses, setResponses] = useState({})
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showHint, setShowHint] = useState({})
  const [showGeneticCode, setShowGeneticCode] = useState(false)
  const [activeLock, setActiveLock] = useState(null)
  const navigate = useNavigate()
  const { setRoomUnlocked, setCurrentProgress } = useGame()

  const handleChange = (e, id) => {
    setResponses({ ...responses, [id]: e.target.value })
    if (error) setError(null)
  }

  const toggleHint = (puzzleId) => {
    setShowHint(prev => ({ ...prev, [puzzleId]: !prev[puzzleId] }))
  }

  const handleLockClick = (puzzleId) => {
    setActiveLock(activeLock === puzzleId ? null : puzzleId)
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
  const solvedCount = puzzles.filter(p => isLockSolved(p.id)).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-1 h-1 bg-emerald-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 left-32 w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 right-10 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Temple Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-400" 
              style={{ fontFamily: 'Impact, "Arial Black", sans-serif', letterSpacing: '3px', textShadow: '0 0 20px rgba(34, 197, 94, 0.5)' }}>
            TEMPLE OF MOLECULAR GENESIS
          </h1>
          <div className="h-1 w-48 mx-auto bg-gradient-to-r from-amber-400 to-emerald-400 mb-4 animate-pulse"></div>
          <p className="text-xl text-emerald-300 font-mono tracking-wider">
            GENETIC SEQUENCE: 3'CGACGATACG<span className="bg-amber-400 text-black px-1 rounded font-bold animate-pulse">G</span>AGGGGTCACTCCT5'
          </p>
        </div>

        {/* Codon Chart */}
        <div className="mb-8 flex justify-center">
          <button
            onClick={() => setShowGeneticCode(!showGeneticCode)}
            className="bg-gradient-to-r from-purple-800 to-indigo-800 text-white px-6 py-3 rounded-lg font-bold text-lg border-2 border-purple-400 hover:border-purple-300 transition-all transform hover:scale-105 shadow-lg"
            style={{ fontFamily: 'Impact, "Arial Black", sans-serif', letterSpacing: '1px' }}
          >
            {showGeneticCode ? '⬆ HIDE' : '⬇ REVEAL'} CODON CHART
          </button>
        </div>

        {showGeneticCode && (
          <div className="mb-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-black border-4 border-purple-400 rounded-xl p-6 shadow-2xl">
            <h3 className="text-center text-2xl font-bold text-purple-300 mb-6" style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>
              🧬 CODON CHART 🧬
            </h3>
            <div className="flex justify-center w-full">
              <div className="w-full max-w-6xl">
                <CodonChart />
              </div>
            </div>
            <div className="text-center mt-4">
              <p className="text-purple-200 text-sm">Ancient genetic translation cipher recovered from alien archives</p>
              <p className="text-purple-300 text-xs mt-2">For detailed codon mappings, search "genetic code table" or consult your genetics textbook</p>
            </div>
          </div>
        )}

        {/* Ancient Temple Door - Inspired by realistic temple architecture */}
        <div className="relative flex justify-center mb-12">
          <div className="relative">
            <svg width="500" height="700" viewBox="0 0 500 700" className="drop-shadow-2xl">
              {/* Outer Temple Frame */}
              <rect x="30" y="30" width="440" height="640" rx="25" fill="url(#outerStone)" stroke="#6b4423" strokeWidth="8"/>
              
              {/* Inner Frame */}
              <rect x="60" y="60" width="380" height="580" rx="20" fill="url(#innerStone)" stroke="#8b5a2b" strokeWidth="4"/>
              
              {/* Door Panels - More realistic proportions */}
              <rect x="80" y="100" width="340" height="520" rx="15" fill="url(#doorSurface)"/>
              
              {/* Ornate Header Section */}
              <rect x="90" y="110" width="320" height="80" rx="10" fill="url(#headerCarving)" stroke="#4a5568" strokeWidth="2"/>
              <text x="250" y="155" textAnchor="middle" fill="#10b981" fontSize="18" fontFamily="serif" fontWeight="bold">TEMPLE OF GENESIS</text>
              
              {/* Central Vertical Divide */}
              <line x1="250" y1="100" x2="250" y2="620" stroke="#374151" strokeWidth="4"/>
              
              {/* Realistic Door Panels with Carved Details */}
              <g opacity="0.4" stroke="#4a5568" strokeWidth="2" fill="none">
                {/* Left door panel carvings */}
                <rect x="100" y="220" width="130" height="180" rx="8"/>
                <rect x="110" y="230" width="110" height="160" rx="6"/>
                <circle cx="165" cy="310" r="25"/>
                <path d="M145 310 Q165 290, 185 310" strokeWidth="3"/>
                
                {/* Right door panel carvings */}
                <rect x="270" y="220" width="130" height="180" rx="8"/>
                <rect x="280" y="230" width="110" height="160" rx="6"/>
                <circle cx="335" cy="310" r="25"/>
                <path d="M315 310 Q335 290, 355 310" strokeWidth="3"/>
                
                {/* Lower panels */}
                <rect x="100" y="420" width="130" height="140" rx="8"/>
                <rect x="270" y="420" width="130" height="140" rx="8"/>
                
                {/* Decorative corner elements */}
                <circle cx="120" cy="240" r="8"/>
                <circle cx="380" cy="240" r="8"/>
                <circle cx="120" cy="580" r="8"/>
                <circle cx="380" cy="580" r="8"/>
              </g>
              
              {/* Realistic Door Handles */}
              <g>
                <ellipse cx="190" cy="380" rx="12" ry="8" fill="#b45309" stroke="#8b5a2b" strokeWidth="2"/>
                <rect x="185" y="375" width="10" height="10" fill="#8b5a2b" rx="2"/>
                
                <ellipse cx="310" cy="380" rx="12" ry="8" fill="#b45309" stroke="#8b5a2b" strokeWidth="2"/>
                <rect x="305" y="375" width="10" height="10" fill="#8b5a2b" rx="2"/>
              </g>
              
              {/* Subtle DNA Helix Etchings */}
              <g opacity="0.3" fill="#10b981" stroke="#047857" strokeWidth="1.5">
                {/* Left DNA helix */}
                <path d="M130 260 Q140 250, 150 260 Q160 250, 170 260 Q180 250, 190 260" fill="none" strokeWidth="2"/>
                <path d="M130 280 Q140 270, 150 280 Q160 270, 170 280 Q180 270, 190 280" fill="none" strokeWidth="2"/>
                <line x1="135" y1="265" x2="165" y2="275" strokeWidth="1"/>
                <line x1="145" y1="255" x2="175" y2="285" strokeWidth="1"/>
                <line x1="155" y1="275" x2="185" y2="265" strokeWidth="1"/>
                
                {/* Right DNA helix */}
                <path d="M310 460 Q320 450, 330 460 Q340 450, 350 460 Q360 450, 370 460" fill="none" strokeWidth="2"/>
                <path d="M310 480 Q320 470, 330 480 Q340 470, 350 480 Q360 470, 370 480" fill="none" strokeWidth="2"/>
                <line x1="315" y1="465" x2="345" y2="475" strokeWidth="1"/>
                <line x1="325" y1="455" x2="355" y2="485" strokeWidth="1"/>
                <line x1="335" y1="475" x2="365" y2="465" strokeWidth="1"/>
              </g>
              
              {/* Lock Positions */}
              {puzzles.map((puzzle, index) => {
                const lockY = 250 + (index * 100);
                const isAnswered = responses[puzzle.id];
                const isCorrect = isLockSolved(puzzle.id);
                
                return (
                  <g key={puzzle.id}>
                    {/* Lock Circle Background */}
                    <circle 
                      cx="250" 
                      cy={lockY} 
                      r="35" 
                      fill="url(#lockBackground)"
                      stroke={isCorrect ? "#10b981" : isAnswered ? "#f59e0b" : "#71717a"}
                      strokeWidth="3"
                      opacity="0.8"
                    />
                    
                    {/* Inner Lock Circle */}
                    <circle 
                      cx="250" 
                      cy={lockY} 
                      r="25" 
                      fill={isCorrect ? "url(#solvedGlow)" : isAnswered ? "url(#partialGlow)" : "url(#lockedGlow)"}
                      stroke={isCorrect ? "#059669" : isAnswered ? "#d97706" : "#52525b"}
                      strokeWidth="2"
                      className="cursor-pointer transition-all duration-300 hover:scale-110"
                      onClick={() => handleLockClick(puzzle.id)}
                    />
                    
                    {/* Lock Icon */}
                    <text 
                      x="250" 
                      y={lockY + 6} 
                      textAnchor="middle" 
                      fill="white" 
                      fontSize="20"
                      className="cursor-pointer pointer-events-none"
                    >
                      {isCorrect ? '🔓' : '🔒'}
                    </text>
                    
                    {/* Lock Number */}
                    <text 
                      x="290" 
                      y={lockY + 5} 
                      fill="#f59e0b" 
                      fontSize="14" 
                      fontFamily="Impact, Arial Black, sans-serif"
                      className="pointer-events-none"
                    >
                      {index + 1}
                    </text>
                  </g>
                );
              })}
              
              {/* Master Keyhole (appears when all locks solved) */}
              {solvedCount === 3 && (
                <g>
                  <ellipse cx="250" cy="580" rx="20" ry="25" fill="#f59e0b" opacity="0.9"/>
                  <rect x="243" y="590" width="14" height="25" fill="#f59e0b" opacity="0.9"/>
                </g>
              )}
              
              {/* SVG Gradients and Effects - Updated for realistic stone */}
              <defs>
                <linearGradient id="outerStone" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b7355"/>
                  <stop offset="30%" stopColor="#a0845c"/>
                  <stop offset="70%" stopColor="#9a7c54"/>
                  <stop offset="100%" stopColor="#7a6547"/>
                </linearGradient>
                <linearGradient id="innerStone" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6b5d48"/>
                  <stop offset="50%" stopColor="#7a6b56"/>
                  <stop offset="100%" stopColor="#5c4f3c"/>
                </linearGradient>
                <linearGradient id="doorSurface" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2d3748"/>
                  <stop offset="30%" stopColor="#4a5568"/>
                  <stop offset="70%" stopColor="#374151"/>
                  <stop offset="100%" stopColor="#1a202c"/>
                </linearGradient>
                <linearGradient id="headerCarving" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4a5568"/>
                  <stop offset="50%" stopColor="#2d3748"/>
                  <stop offset="100%" stopColor="#1a202c"/>
                </linearGradient>
                <radialGradient id="lockBackground">
                  <stop offset="0%" stopColor="#1f2937"/>
                  <stop offset="100%" stopColor="#111827"/>
                </radialGradient>
                <radialGradient id="solvedGlow">
                  <stop offset="0%" stopColor="#10b981"/>
                  <stop offset="100%" stopColor="#059669"/>
                </radialGradient>
                <radialGradient id="partialGlow">
                  <stop offset="0%" stopColor="#f59e0b"/>
                  <stop offset="100%" stopColor="#d97706"/>
                </radialGradient>
                <radialGradient id="lockedGlow">
                  <stop offset="0%" stopColor="#6b7280"/>
                  <stop offset="100%" stopColor="#4b5563"/>
                </radialGradient>
              </defs>
            </svg>
            
            {/* Door Status Text */}
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
              <p className="text-amber-300 font-bold text-lg" style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>
                {solvedCount === 3 ? 
                  "🗝️ ANCIENT DOOR UNSEALED" : 
                  `🔒 ${3 - solvedCount} LOCKS REMAINING`
                }
              </p>
              <p className="text-emerald-400 text-sm mt-2">Click the locks to reveal their mysteries</p>
            </div>
          </div>
        </div>

        {/* Active Lock Puzzle Display */}
        {activeLock && (
          <div className="mt-16">
            {puzzles.filter(p => p.id === activeLock).map((puzzle, index) => {
              const puzzleIndex = puzzles.findIndex(p => p.id === puzzle.id);
              return (
                <div key={puzzle.id} className="relative">
                  {/* Lock Container */}
                  <div className={`border-4 rounded-xl p-6 transition-all duration-500 ${
                    isLockSolved(puzzle.id) ? 'border-emerald-400 bg-gradient-to-br from-emerald-900 to-emerald-800 shadow-emerald-400/50' :
                    responses[puzzle.id] ? 'border-amber-400 bg-gradient-to-br from-amber-900 to-amber-800 shadow-amber-400/50' :
                    'border-stone-400 bg-gradient-to-br from-stone-900 to-stone-800 shadow-stone-400/50'
                  } shadow-2xl`}>
                    
                    {/* Close Button */}
                    <button
                      onClick={() => setActiveLock(null)}
                      className="absolute top-4 right-4 text-white hover:text-amber-400 text-2xl transition-colors"
                    >
                      ✕
                    </button>
                    
                    {/* Lock Symbol */}
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold border-4 ${
                        isLockSolved(puzzle.id) ? 'bg-emerald-500 border-emerald-300 text-white' :
                        responses[puzzle.id] ? 'bg-amber-500 border-amber-300 text-black' :
                        'bg-stone-600 border-stone-400 text-white'
                      }`} style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>
                        {isLockSolved(puzzle.id) ? '🔓' : responses[puzzle.id] ? '🔶' : '🔒'}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-4 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                          <span className="text-amber-400">MYSTICAL LOCK {puzzleIndex + 1}:</span> {puzzle.question}
                        </h3>
                        
                        {/* Answer Options */}
                        <div className="space-y-3">
                          {puzzle.options.map((option, optIndex) => (
                            <label 
                              key={optIndex}
                              className="flex items-center p-4 rounded-lg cursor-pointer transition-all border-2 hover:scale-102 transform bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600 hover:border-amber-400 hover:shadow-lg group"
                            >
                              <input
                                type="radio"
                                name={puzzle.id}
                                value={option}
                                checked={responses[puzzle.id] === option}
                                onChange={(e) => handleChange(e, puzzle.id)}
                                className="mr-4 h-5 w-5 text-amber-500 border-gray-400 focus:ring-amber-500 focus:ring-2"
                              />
                              <span className="text-white font-mono group-hover:text-amber-300 transition-colors">{option}</span>
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
              );
            })}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-8 bg-gradient-to-r from-rose-900 to-rose-800 border-4 border-rose-400 rounded-xl p-6 text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-rose-200 font-bold text-lg" style={{ fontFamily: 'Impact, "Arial Black", sans-serif', letterSpacing: '1px' }}>
              {error}
            </p>
          </div>
        )}

        {/* Activation Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || solvedCount < 3}
            className={`px-12 py-6 rounded-xl font-bold text-2xl shadow-2xl transition-all duration-300 border-4 ${
              isSubmitting
                ? 'bg-gray-600 cursor-not-allowed border-gray-500'
                : solvedCount === 3
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-emerald-400 hover:border-emerald-300 transform hover:scale-105 animate-pulse'
                : 'bg-gradient-to-r from-stone-600 to-stone-700 text-stone-300 border-stone-500 cursor-not-allowed'
            }`}
            style={{ fontFamily: 'Impact, "Arial Black", sans-serif', letterSpacing: '2px' }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-white mr-4"></div>
                ANCIENT MECHANISMS ACTIVATING...
              </span>
            ) : solvedCount === 3 ? (
              '🚪 UNSEAL THE TEMPLE DOOR'
            ) : (
              `🔒 SOLVE ${3 - solvedCount} MORE MYSTICAL LOCKS`
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 font-mono text-sm">
          "Only those who understand the ancient language of life may pass..."
        </div>
      </div>
    </div>
  )
}
