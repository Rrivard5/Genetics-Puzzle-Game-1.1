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

        {/* Genetic Code Table */}
        <div className="mb-8 flex justify-center">
          <button
            onClick={() => setShowGeneticCode(!showGeneticCode)}
            className="bg-gradient-to-r from-purple-800 to-indigo-800 text-white px-6 py-3 rounded-lg font-bold text-lg border-2 border-purple-400 hover:border-purple-300 transition-all transform hover:scale-105 shadow-lg"
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
              <table className="w-full border-collapse text-center text-sm">
                <thead>
                  <tr>
                    <th rowSpan="2" className="border-2 border-purple-400 p-2 bg-gradient-to-br from-purple-800 to-indigo-800 text-purple-200 font-bold text-xs">
                      First base<br/>in codon
                    </th>
                    <th colSpan="4" className="border-2 border-purple-400 p-2 bg-gradient-to-r from-indigo-700 to-purple-700 text-white font-bold">
                      Second base in codon
                    </th>
                    <th rowSpan="2" className="border-2 border-purple-400 p-2 bg-gradient-to-br from-purple-800 to-indigo-800 text-purple-200 font-bold text-xs">
                      Last base<br/>in codon
                    </th>
                  </tr>
                  <tr>
                    <th className="border-2 border-purple-400 p-2 bg-blue-700 text-white font-bold">U</th>
                    <th className="border-2 border-purple-400 p-2 bg-emerald-700 text-white font-bold">C</th>
                    <th className="border-2 border-purple-400 p-2 bg-amber-700 text-white font-bold">A</th>
                    <th className="border-2 border-purple-400 p-2 bg-rose-700 text-white font-bold">G</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-mono">
                  {/* U row */}
                  <tr>
                    <td rowSpan="4" className="border-2 border-purple-400 p-2 bg-blue-700 text-white font-bold text-lg">U</td>
                    <td className="border border-purple-400 p-2 bg-gray-800 text-white">
                      UUU<br/>UUC <span className="text-amber-300 font-bold">Phe</span>
                    </td>
                    <td className="border border-purple-400 p-2 bg-gray-800 text-white">
                      UCU<br/>UCC<br/>UCA<br/>UCG <span className="text-amber-300 font-bold">Ser</span>
                    </td>
                    <td className="border border-purple-400 p-2 bg-gray-800 text-white">
                      UAU<br/>UAC <span className="text-amber-300 font-bold">Tyr</span><br/>
                      UAA <span className="text-rose-400 font-bold">STOP</span><br/>
                      UAG <span className="text-rose-400 font-bold">STOP</span>
                    </td>
                    <td className="border border-purple-400 p-2 bg-gray-800 text-white">
                      UGU<br/>UGC <span className="text-amber-300 font-bold">Cys</span><br/>
                      UGA <span className="text-rose-400 font-bold">STOP</span><br/>
                      UGG <span className="text-amber-300 font-bold">Trp</span>
                    </td>
                    <td rowSpan="4" className="border-2 border-purple-400 p-2 bg-rose-700 text-white font-bold">U<br/>C<br/>A<br/>G</td>
                  </tr>
                  <tr>
                    <td className="border border-purple-400 p-2 bg-gray-800 text-white">
                      UUA<br/>UUG <span className="text-amber-300 font-bold">Leu</span>
                    </td>
                    <td className="border border-purple-400 p-2 bg-gray-800"></td>
                    <td className="border border-purple-400 p-2 bg-gray-800"></td>
                    <td className="border border-purple-400 p-2 bg-gray-800"></td>
                  </tr>
                  
                  {/* C row */}
                  <tr>
                    <td rowSpan="4" className="border-2 border-purple-400 p-2 bg-emerald-700 text-white font-bold text-lg">C</td>
                    <td className="border border-purple-400 p-2 bg-gray-800 text-white">
                      CUU<br/>CUC<br/>CUA<br/>CUG <span className="text-amber-300 font-bold">Leu</span>
                    </td>
                    <td className="border border-purple-400 p-2 bg-gray-800 text-white">
                      CCU<br/>CCC<br/>CCA<br/>CCG <span className="text-amber-300 font-bold">Pro</span>
                    </td>
                    <td className="border border-purple-400 p-2 bg-gray-800 text-white">
                      CAU<br/>CAC <span className="text-amber-300 font-bold">His</span><br/>
                      CAA<br/>CAG <span className="text-amber-300 font-bold">Gln</span>
                    </td>
                    <td className="border border-purple-400 p-2 bg-gray-800 text-white">
                      CGU<br/>CGC<br/>CGA<br/>CGG <span className="text-amber-300 font-bold">Arg</span>
                    </td>
                  </tr>
                  <tr><td className="border border-purple-400 p-1 bg-gray-800"></td><td className="border border-purple-400 p-1 bg-gray-800"></td><td className="border border-purple-400 p-1 bg-gray-800"></td><td className="border border-purple-400 p-1 bg-gray-800"></td></tr>
                  
                  {/* A row */}
                  <tr>
                    <td rowSpan="4" className="border-2 border-purple-400 p-2 bg-amber-700 text-white font-bold text-lg">A</td>
                    <td className="border border-purple-400 p-2 bg-gray-800 text-white">
                      AUU<br/>AUC<br/>AUA <span className="text-amber-300 font-bold">Ile</span><br/>
                      <span className="text-emerald-400 font-bold">AUG Met (start)</span>
                    </td>
                    <td className="border border-purple-400 p-2 bg-gray-800 text-white">
                      ACU<br/>ACC<br/>ACA<br/>ACG <span className="text-amber-300 font-bold">Thr</span>
                    </td>
                    <td className="border border-purple-400 p-2 bg-gray-800 text-white">
                      AAU<br/>AAC <span className="text-amber-300 font-bold">Asn</span><br/>
                      AAA<br/>AAG <span className="text-amber-300 font-bold">Lys</span>
                    </td>
                    <td className="border border-purple-400 p-2 bg-gray-800 text-white">
                      AGU<br/>AGC <span className="text-amber-300 font-bold">Ser</span><br/>
                      AGA<br/>AGG <span className="text-amber-300 font-bold">Arg</span>
                    </td>
                  </tr>
                  <tr><td className="border border-purple-400 p-1 bg-gray-800"></td><td className="border border-purple-400 p-1 bg-gray-800"></td><td className="border border-purple-400 p-1 bg-gray-800"></td><td className="border border-purple-400 p-1 bg-gray-800"></td></tr>
                  
                  {/* G row */}
                  <tr>
                    <td rowSpan="4" className="border-2 border-purple-400 p-2 bg-rose-700 text-white font-bold text-lg">G</td>
                    <td className="border border-purple-400 p-2 bg-gray-800 text-white">
                      GUU<br/>GUC<br/>GUA<br/>GUG <span className="text-amber-300 font-bold">Val</span>
                    </td>
                    <td className="border border-purple-400 p-2 bg-gray-800 text-white">
                      GCU<br/>GCC<br/>GCA<br/>GCG <span className="text-amber-300 font-bold">Ala</span>
                    </td>
                    <td className="border border-purple-400 p-2 bg-gray-800 text-white">
                      GAU<br/>GAC <span className="text-amber-300 font-bold">Asp</span><br/>
                      GAA<br/>GAG <span className="text-amber-300 font-bold">Glu</span>
                    </td>
                    <td className="border border-purple-400 p-2 bg-gray-800 text-white">
                      GGU<br/>GGC<br/>GGA<br/>GGG <span className="text-amber-300 font-bold">Gly</span>
                    </td>
                  </tr>
                  <tr><td className="border border-purple-400 p-1 bg-gray-800"></td><td className="border border-purple-400 p-1 bg-gray-800"></td><td className="border border-purple-400 p-1 bg-gray-800"></td><td className="border border-purple-400 p-1 bg-gray-800"></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Ancient Temple Door */}
        <div className="relative flex justify-center mb-12">
          <div className="relative">
            <svg width="500" height="700" viewBox="0 0 500 700" className="drop-shadow-2xl">
              {/* Door Frame/Architecture */}
              <rect x="50" y="50" width="400" height="600" rx="20" fill="url(#stoneFrame)" stroke="#8b5a2b" strokeWidth="6"/>
              
              {/* Door Panels */}
              <rect x="80" y="80" width="340" height="540" rx="15" fill="url(#doorSurface)"/>
              
              {/* Ancient Carvings */}
              <rect x="100" y="100" width="300" height="60" rx="8" fill="url(#carving)" opacity="0.7"/>
              <text x="250" y="135" textAnchor="middle" fill="#10b981" fontSize="16" fontFamily="serif" className="animate-pulse">⚔ GENETIC TEMPLE ⚔</text>
              
              {/* Central Door Seam */}
              <line x1="250" y1="80" x2="250" y2="620" stroke="#4a5568" strokeWidth="3"/>
              
              {/* Door Handles */}
              <circle cx="180" cy="400" r="8" fill="#b45309" stroke="#8b5a2b" strokeWidth="2"/>
              <circle cx="320" cy="400" r="8" fill="#b45309" stroke="#8b5a2b" strokeWidth="2"/>
              
              {/* Ancient Geometric Patterns */}
              <rect x="120" y="200" width="260" height="300" rx="10" fill="url(#pattern)" opacity="0.4"/>
              
              {/* Mystical Glow Effect */}
              <rect x="90" y="90" width="320" height="520" rx="12" fill="none" stroke="url(#glowEffect)" strokeWidth="2" opacity="0.8"/>
              
              {/* Lock Positions with Mystical Circles */}
              {puzzles.map((puzzle, index) => {
                const lockY = 250 + (index * 100);
                const isAnswered = responses[puzzle.id];
                const isCorrect = isLockSolved(puzzle.id);
                
                return (
                  <g key={puzzle.id}>
                    {/* Mystical Circle Background */}
                    <circle 
                      cx="250" 
                      cy={lockY} 
                      r="40" 
                      fill="url(#lockBackground)"
                      stroke={isCorrect ? "#10b981" : isAnswered ? "#f59e0b" : "#71717a"}
                      strokeWidth="3"
                      opacity="0.8"
                    />
                    
                    {/* Inner Mystical Circle */}
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
                    
                    {/* Lock Symbol */}
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
                    
                    {/* Ancient Runes Around Lock */}
                    <text 
                      x="200" 
                      y={lockY + 5} 
                      fill="#10b981" 
                      fontSize="12" 
                      fontFamily="serif"
                      className="pointer-events-none opacity-70"
                    >
                      ᚱ
                    </text>
                    <text 
                      x="300" 
                      y={lockY + 5} 
                      fill="#10b981" 
                      fontSize="12" 
                      fontFamily="serif"
                      className="pointer-events-none opacity-70"
                    >
                      ᚠ
                    </text>
                    
                    {/* Lock Number */}
                    <text 
                      x="320" 
                      y={lockY + 5} 
                      fill="#f59e0b" 
                      fontSize="12" 
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
                <g className="animate-pulse">
                  <ellipse cx="250" cy="580" rx="20" ry="25" fill="#f59e0b" opacity="0.9"/>
                  <rect x="243" y="590" width="14" height="25" fill="#f59e0b" opacity="0.9"/>
                  <circle cx="250" cy="580" r="30" fill="none" stroke="#10b981" strokeWidth="3" className="animate-ping"/>
                </g>
              )}
              
              {/* SVG Gradients and Effects */}
              <defs>
                <linearGradient id="stoneFrame" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5a2b"/>
                  <stop offset="50%" stopColor="#a16232"/>
                  <stop offset="100%" stopColor="#6b4423"/>
                </linearGradient>
                <linearGradient id="doorSurface" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1f2937"/>
                  <stop offset="50%" stopColor="#374151"/>
                  <stop offset="100%" stopColor="#111827"/>
                </linearGradient>
                <linearGradient id="carving" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4b5563"/>
                  <stop offset="100%" stopColor="#1f2937"/>
                </linearGradient>
                <linearGradient id="pattern" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                  <stop offset="50%" stopColor="#059669" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#047857" stopOpacity="0.3"/>
                </linearGradient>
                <linearGradient id="glowEffect" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981"/>
                  <stop offset="50%" stopColor="#059669"/>
                  <stop offset="100%" stopColor="#047857"/>
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
                  `🔒 ${3 - solvedCount} MYSTICAL LOCKS REMAINING`
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
