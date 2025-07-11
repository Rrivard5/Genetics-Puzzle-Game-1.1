import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'
import CodonChart from '../components/CodonChart'

export default function Room1() {
  const [responses, setResponses] = useState({})
  const [checkedAnswers, setCheckedAnswers] = useState({})
  const [feedback, setFeedback] = useState({})
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showGeneticCode, setShowGeneticCode] = useState(false)
  const [activeLock, setActiveLock] = useState(null)
  const [puzzles, setPuzzles] = useState([])
  const [groupSettings, setGroupSettings] = useState({
    wildTypeSequence: "3'CGACGATACGGAGGGGTCACTCCT5'",
    highlightedNucleotide: "G",
    highlightedPosition: 11
  })
  const navigate = useNavigate()
  const { setRoomUnlocked, setCurrentProgress, trackAttempt, startRoomTimer, completeRoom, studentInfo } = useGame()

  // Load puzzles based on student's group
  useEffect(() => {
    if (studentInfo?.groupNumber) {
      loadPuzzlesForGroup(studentInfo.groupNumber)
      loadGroupSettings(studentInfo.groupNumber)
    }
  }, [studentInfo])

  // Start room timer when component mounts
  useEffect(() => {
    startRoomTimer('room1')
  }, [startRoomTimer])

  // Redirect to student info if no student info exists
  useEffect(() => {
    if (!studentInfo) {
      const savedStudentInfo = localStorage.getItem('current-student-info');
      if (!savedStudentInfo) {
        navigate('/student-info');
        return;
      }
    }
  }, [studentInfo, navigate]);

  const loadGroupSettings = (groupNumber) => {
    const savedSettings = localStorage.getItem('instructor-game-settings');
    if (savedSettings) {
      const allSettings = JSON.parse(savedSettings);
      const groupSpecificSettings = allSettings.groups?.[groupNumber];
      if (groupSpecificSettings) {
        setGroupSettings(groupSpecificSettings);
      }
    }
  };

  const loadPuzzlesForGroup = (groupNumber) => {
    const savedPuzzles = localStorage.getItem('instructor-puzzles');
    if (savedPuzzles) {
      const allPuzzles = JSON.parse(savedPuzzles);
      const groupPuzzles = allPuzzles.room1?.groups?.[groupNumber] || allPuzzles.room1?.groups?.[1] || [];
      setPuzzles(groupPuzzles);
    } else {
      // Default puzzles for group 1
      const defaultPuzzles = [
        {
          id: "p1",
          question: "What type of mutation results from changing the highlighted G to A in the DNA sequence?",
          type: "text",
          answer: "Point mutation from G to A",
          options: [],
          caseSensitive: false
        },
        {
          id: "p2",
          question: "Based on the genetic code wheel, what amino acid sequence would result from the correct mutation in the previous question?",
          type: "text",
          answer: "RPQ",
          options: [],
          caseSensitive: false
        },
        {
          id: "p3", 
          question: "Looking at the answer options in the table, which represents the correct translated product following the point mutation?",
          type: "text",
          answer: "CPE → RPQ",
          options: [],
          caseSensitive: false
        }
      ];
      setPuzzles(defaultPuzzles);
    }
  };

  // Show loading if no student info
  if (!studentInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleChange = (e, id) => {
    const value = e.target.value
    setResponses({ ...responses, [id]: value })
    
    // Clear feedback when user changes their answer
    if (feedback[id]) {
      setFeedback(prev => ({ ...prev, [id]: null }))
    }
    
    if (error) setError(null)
  }

  const checkAnswer = (puzzleId) => {
    const userAnswer = responses[puzzleId]?.trim()
    const puzzle = puzzles.find(p => p.id === puzzleId)
    
    if (!userAnswer) {
      setFeedback(prev => ({ 
        ...prev, 
        [puzzleId]: { 
          isCorrect: false, 
          message: "Please enter an answer before checking.",
          type: "warning"
        }
      }))
      return
    }

    let isCorrect = false
    
    if (puzzle.type === 'multiple_choice') {
      isCorrect = puzzle.answer === userAnswer
    } else {
      // Handle case sensitivity for text questions
      if (puzzle.caseSensitive) {
        isCorrect = puzzle.answer === userAnswer
      } else {
        isCorrect = puzzle.answer.toLowerCase() === userAnswer.toLowerCase()
      }
    }
    
    // Track the attempt
    trackAttempt('room1', puzzleId, userAnswer, isCorrect)
    
    // Mark as checked
    setCheckedAnswers(prev => ({ ...prev, [puzzleId]: true }))
    
    if (isCorrect) {
      setFeedback(prev => ({ 
        ...prev, 
        [puzzleId]: { 
          isCorrect: true, 
          message: "🎉 Correct! Well done!",
          type: "success"
        }
      }))
    } else {
      // Get specific feedback based on the wrong answer
      const wrongAnswerFeedback = getWrongAnswerFeedback(puzzleId, userAnswer, puzzle)
      setFeedback(prev => ({ 
        ...prev, 
        [puzzleId]: { 
          isCorrect: false, 
          message: wrongAnswerFeedback,
          type: "error"
        }
      }))
    }
  }

  const getWrongAnswerFeedback = (puzzleId, userAnswer, puzzle) => {
    // Load custom feedback from localStorage (instructor-defined)
    const savedFeedback = localStorage.getItem('instructor-feedback')
    const customFeedback = savedFeedback ? JSON.parse(savedFeedback) : {}
    
    // Check if instructor has defined custom feedback for this specific wrong answer
    const feedbackKey = `room1_${puzzleId}_${userAnswer.toLowerCase()}_group${studentInfo.groupNumber}`
    const generalFeedbackKey = `room1_${puzzleId}_${userAnswer.toLowerCase()}`
    
    if (customFeedback[feedbackKey]) {
      return customFeedback[feedbackKey]
    }
    
    if (customFeedback[generalFeedbackKey]) {
      return customFeedback[generalFeedbackKey]
    }
    
    // Default feedback
    return `❌ That's not correct. The right answer is "${puzzle.answer}". Try reviewing the genetic concepts for this question.`
  }

  const handleLockClick = (puzzleId) => {
    setActiveLock(activeLock === puzzleId ? null : puzzleId)
    
    if (activeLock !== puzzleId) {
      setTimeout(() => {
        const puzzleElement = document.getElementById(`puzzle-${puzzleId}`)
        if (puzzleElement) {
          puzzleElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          })
        }
      }, 100)
    }
  }

  const handleSubmit = async () => {
    // Check if all questions have been answered correctly
    const allAnswered = puzzles.every(p => checkedAnswers[p.id])
    if (!allAnswered) {
      setError('ALL PUZZLE LOCKS MUST BE CHECKED WITH CORRECT ANSWERS TO PROCEED')
      return
    }

    const allCorrect = puzzles.every(p => feedback[p.id]?.isCorrect)
    if (!allCorrect) {
      setError('ALL PUZZLE LOCKS MUST BE SOLVED CORRECTLY TO PROCEED')
      return
    }

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setRoomUnlocked(prev => ({ ...prev, room1: true }))
    setCurrentProgress(25)
    completeRoom('room1')
    navigate('/room2')
    
    setIsSubmitting(false)
  }

  const answeredCount = Object.keys(checkedAnswers).length
  const isLockSolved = (puzzleId) => feedback[puzzleId]?.isCorrect
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
          <p className="text-emerald-300 text-lg">Group {studentInfo.groupNumber} - Specialized Challenge</p>
        </div>

        {/* Ancient Temple Door */}
        <div className="relative flex justify-center mb-12 door-container">
          <div className="relative">
            <svg width="500" height="700" viewBox="0 0 500 700" className="drop-shadow-2xl">
              {/* Outer Temple Frame */}
              <rect x="30" y="30" width="440" height="640" rx="25" fill="url(#outerStone)" stroke="#6b4423" strokeWidth="8"/>
              
              {/* Inner Frame */}
              <rect x="60" y="60" width="380" height="580" rx="20" fill="url(#innerStone)" stroke="#8b5a2b" strokeWidth="4"/>
              
              {/* Door Panels */}
              <rect x="80" y="100" width="340" height="520" rx="15" fill="url(#doorSurface)"/>
              
              {/* Ornate Header Section */}
              <rect x="90" y="110" width="320" height="80" rx="10" fill="url(#headerCarving)" stroke="#4a5568" strokeWidth="2"/>
              
              {/* Subtle carved pattern in header */}
              <g opacity="0.3" stroke="#4a5568" strokeWidth="1.5" fill="none">
                <circle cx="250" cy="150" r="20"/>
                <circle cx="250" cy="150" r="15"/>
                <line x1="230" y1="150" x2="270" y2="150"/>
                <line x1="250" y1="130" x2="250" y2="170"/>
              </g>
              
              {/* Central Vertical Divide */}
              <line x1="250" y1="100" x2="250" y2="620" stroke="#374151" strokeWidth="4"/>
              
              {/* Door Panel Details */}
              <g opacity="0.4" stroke="#4a5568" strokeWidth="2" fill="none">
                <rect x="100" y="220" width="130" height="180" rx="8"/>
                <rect x="110" y="230" width="110" height="160" rx="6"/>
                <path d="M145 310 Q165 290, 185 310" strokeWidth="3"/>
                
                <rect x="270" y="220" width="130" height="180" rx="8"/>
                <rect x="280" y="230" width="110" height="160" rx="6"/>
                <path d="M315 310 Q335 290, 355 310" strokeWidth="3"/>
                
                <rect x="100" y="420" width="130" height="140" rx="8"/>
                <rect x="270" y="420" width="130" height="140" rx="8"/>
                
                <rect x="115" y="235" width="10" height="10" rx="2"/>
                <rect x="375" y="235" width="10" height="10" rx="2"/>
                <rect x="115" y="575" width="10" height="10" rx="2"/>
                <rect x="375" y="575" width="10" height="10" rx="2"/>
              </g>
              
              {/* DNA Helix Etchings */}
              <g opacity="0.3" fill="#10b981" stroke="#047857" strokeWidth="1.5">
                <path d="M130 260 Q140 250, 150 260 Q160 250, 170 260 Q180 250, 190 260" fill="none" strokeWidth="2"/>
                <path d="M130 280 Q140 270, 150 280 Q160 270, 170 280 Q180 270, 190 280" fill="none" strokeWidth="2"/>
                <line x1="135" y1="265" x2="165" y2="275" strokeWidth="1"/>
                <line x1="145" y1="255" x2="175" y2="285" strokeWidth="1"/>
                <line x1="155" y1="275" x2="185" y2="265" strokeWidth="1"/>
                
                <path d="M310 460 Q320 450, 330 460 Q340 450, 350 460 Q360 450, 370 460" fill="none" strokeWidth="2"/>
                <path d="M310 480 Q320 470, 330 480 Q340 470, 350 480 Q360 470, 370 480" fill="none" strokeWidth="2"/>
                <line x1="315" y1="465" x2="345" y2="475" strokeWidth="1"/>
                <line x1="325" y1="455" x2="355" y2="485" strokeWidth="1"/>
                <line x1="335" y1="475" x2="365" y2="465" strokeWidth="1"/>
              </g>
              
              {/* Lock Positions */}
              {puzzles.map((puzzle, index) => {
                const lockY = 250 + (index * 100);
                const isAnswered = checkedAnswers[puzzle.id];
                const isCorrect = isLockSolved(puzzle.id);
                
                return (
                  <g key={puzzle.id}>
                    <circle 
                      cx="250" 
                      cy={lockY} 
                      r="35" 
                      fill="url(#lockBackground)"
                      stroke={isCorrect ? "#10b981" : isAnswered ? "#f59e0b" : "#71717a"}
                      strokeWidth="3"
                      opacity="0.8"
                    />
                    
                    <circle 
                      cx="250" 
                      cy={lockY} 
                      r="25" 
                      fill={isCorrect ? "url(#solvedGlow)" : isAnswered ? "url(#partialGlow)" : "url(#lockedGlow)"}
                      stroke={isCorrect ? "#059669" : isAnswered ? "#d97706" : "#52525b"}
                      strokeWidth="2"
                      className="cursor-pointer transition-all duration-200"
                      onClick={() => handleLockClick(puzzle.id)}
                    />
                    
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
              
              {/* Master Keyhole */}
              {solvedCount === puzzles.length && (
                <g>
                  <ellipse cx="250" cy="580" rx="20" ry="25" fill="#f59e0b" opacity="0.9"/>
                  <rect x="243" y="590" width="14" height="25" fill="#f59e0b" opacity="0.9"/>
                </g>
              )}
              
              {/* SVG Gradients */}
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
                {solvedCount === puzzles.length ? 
                  "🗝️ SECURITY DOOR UNLOCKED" : 
                  `🔒 ${puzzles.length - solvedCount} LOCKS REMAINING`
                }
              </p>
              <p className="text-emerald-400 text-sm mt-2">Click the locks to reveal their mysteries</p>
            </div>
          </div>
        </div>

        {/* Active Lock Puzzle Display */}
        {activeLock && (
          <div className="mt-16" id={`puzzle-${activeLock}`}>
            {/* Wild Type Genetic Sequence - Group Specific */}
            <div className="mb-6 text-center">
              <h3 className="text-xl text-emerald-300 font-bold mb-2">Wild Type Genetic Sequence</h3>
              <div className="bg-gray-800 p-4 rounded-lg inline-block">
                <p className="text-xl text-emerald-300 font-mono tracking-wider">
                  {groupSettings.wildTypeSequence.substring(0, groupSettings.highlightedPosition)}
                  <span className="bg-amber-400 text-black px-1 rounded font-bold animate-pulse">
                    {groupSettings.highlightedNucleotide}
                  </span>
                  {groupSettings.wildTypeSequence.substring(groupSettings.highlightedPosition + 1)}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Group {studentInfo.groupNumber} - Position {groupSettings.highlightedPosition + 1} highlighted
                </p>
              </div>
            </div>

            {/* Codon Chart Button */}
            <div className="mb-6 flex justify-center">
              <button
                onClick={() => setShowGeneticCode(!showGeneticCode)}
                className="bg-gradient-to-r from-purple-800 to-indigo-800 text-white px-6 py-3 rounded-lg font-bold text-lg border-2 border-purple-400 hover:border-purple-300 transition-all transform hover:scale-105 shadow-lg"
                style={{ fontFamily: 'Impact, "Arial Black", sans-serif', letterSpacing: '1px' }}
              >
                {showGeneticCode ? 'HIDE' : 'REVEAL'} CODON CHART
              </button>
            </div>

            {showGeneticCode && (
              <div className="mb-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-black border-4 border-purple-400 rounded-xl p-6 shadow-2xl">
                <h3 className="text-center text-2xl font-bold text-purple-300 mb-6" style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>
                  CODON CHART
                </h3>
                <div className="flex justify-center w-full">
                  <div className="w-full max-w-6xl">
                    <CodonChart />
                  </div>
                </div>
                <div className="text-center mt-4">
                  <p className="text-purple-200 text-sm">Ancient genetic translation cipher recovered from alien archives</p>
                </div>
              </div>
            )}

            {puzzles.filter(p => p.id === activeLock).map((puzzle, index) => {
              const puzzleIndex = puzzles.findIndex(p => p.id === puzzle.id);
              const hasBeenChecked = checkedAnswers[puzzle.id];
              const currentFeedback = feedback[puzzle.id];
              
              return (
                <div key={puzzle.id} className="relative">
                  <div className={`border-4 rounded-xl p-6 transition-all duration-500 ${
                    currentFeedback?.isCorrect ? 'border-emerald-400 bg-gradient-to-br from-emerald-900 to-emerald-800 shadow-emerald-400/50' :
                    hasBeenChecked ? 'border-red-400 bg-gradient-to-br from-red-900 to-red-800 shadow-red-400/50' :
                    'border-stone-400 bg-gradient-to-br from-stone-900 to-stone-800 shadow-stone-400/50'
                  } shadow-2xl`}>
                    
                    {/* Return to Door Button */}
                    <button
                      onClick={() => {
                        setActiveLock(null)
                        setTimeout(() => {
                          const doorElement = document.querySelector('.door-container')
                          if (doorElement) {
                            doorElement.scrollIntoView({ 
                              behavior: 'smooth', 
                              block: 'center',
                              inline: 'nearest'
                            })
                          }
                        }, 100)
                      }}
                      className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                    >
                      ⬆️ Return to Door
                    </button>
                    
                    {/* Lock Symbol */}
                    <div className="flex items-start gap-4 mt-8">
                      <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold border-4 ${
                        currentFeedback?.isCorrect ? 'bg-emerald-500 border-emerald-300 text-white' :
                        hasBeenChecked ? 'bg-red-500 border-red-300 text-white' :
                        'bg-stone-600 border-stone-400 text-white'
                      }`} style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>
                        {currentFeedback?.isCorrect ? '🔓' : hasBeenChecked ? '❌' : '🔒'}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-4 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                          <span className="text-amber-400">SECURITY LOCK {puzzleIndex + 1}:</span> {puzzle.question}
                        </h3>
                        
                        {/* Answer Input - Text or Multiple Choice */}
                        <div className="mb-4">
                          {puzzle.type === 'multiple_choice' ? (
                            <div className="space-y-2">
                              {puzzle.options.map((option, optIndex) => (
                                <label 
                                  key={optIndex}
                                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-all border-2 ${
                                    responses[puzzle.id] === option 
                                      ? 'border-amber-400 bg-amber-900/30' 
                                      : 'border-gray-600 bg-gray-800/50 hover:border-amber-400/50'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={puzzle.id}
                                    value={option}
                                    checked={responses[puzzle.id] === option}
                                    onChange={(e) => handleChange(e, puzzle.id)}
                                    disabled={currentFeedback?.isCorrect}
                                    className="mr-4 h-5 w-5 text-amber-500 border-gray-400 focus:ring-amber-500"
                                  />
                                  <span className="text-white font-mono text-lg">{option}</span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {/* Case Sensitivity Notification */}
                              {puzzle.type === 'text' && (
                                <div className={`p-3 rounded-lg border-2 ${
                                  puzzle.caseSensitive 
                                    ? 'bg-yellow-900/30 border-yellow-400/50' 
                                    : 'bg-blue-900/30 border-blue-400/50'
                                }`}>
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">
                                      {puzzle.caseSensitive ? '⚠️' : 'ℹ️'}
                                    </span>
                                    <span className={`text-sm font-medium ${
                                      puzzle.caseSensitive ? 'text-yellow-200' : 'text-blue-200'
                                    }`}>
                                      {puzzle.caseSensitive ? 
                                        'Case-sensitive answer: Capitalization matters!' : 
                                        'Case-insensitive answer: Capitalization doesn\'t matter'
                                      }
                                    </span>
                                  </div>
                                  <div className={`text-xs mt-1 ${
                                    puzzle.caseSensitive ? 'text-yellow-300' : 'text-blue-300'
                                  }`}>
                                    {puzzle.caseSensitive ? 
                                      'Make sure your answer matches the exact capitalization required.' : 
                                      'You can type your answer in any capitalization.'
                                    }
                                  </div>
                                </div>
                              )}
                              
                              <input
                                type="text"
                                value={responses[puzzle.id] || ''}
                                onChange={(e) => handleChange(e, puzzle.id)}
                                placeholder="Type your answer here..."
                                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border-2 border-gray-600 focus:border-amber-400 focus:outline-none font-mono text-lg"
                                disabled={currentFeedback?.isCorrect}
                              />
                            </div>
                          )}
                        </div>

                        {/* Check Answer Button */}
                        <div className="mb-4">
                          <button
                            onClick={() => checkAnswer(puzzle.id)}
                            disabled={!responses[puzzle.id] || currentFeedback?.isCorrect}
                            className={`px-6 py-3 rounded-lg font-bold text-lg transition-all transform ${
                              currentFeedback?.isCorrect 
                                ? 'bg-emerald-600 cursor-not-allowed opacity-50'
                                : !responses[puzzle.id]
                                ? 'bg-gray-600 cursor-not-allowed opacity-50'
                                : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 hover:scale-105 shadow-lg'
                            } text-white border-2 border-amber-400`}
                            style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
                          >
                            {currentFeedback?.isCorrect ? '✅ CORRECT!' : '🔍 CHECK ANSWER'}
                          </button>
                        </div>

                        {/* Feedback Display */}
                        {currentFeedback && (
                          <div className={`mb-4 p-4 rounded-lg border-2 ${
                            currentFeedback.isCorrect 
                              ? 'bg-emerald-900 border-emerald-400 text-emerald-100'
                              : 'bg-red-900 border-red-400 text-red-100'
                          }`}>
                            <p className="font-mono text-sm leading-relaxed">{currentFeedback.message}</p>
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
            disabled={isSubmitting || solvedCount < puzzles.length}
            className={`px-12 py-6 rounded-xl font-bold text-2xl shadow-2xl transition-all duration-300 border-4 ${
              isSubmitting
                ? 'bg-gray-600 cursor-not-allowed border-gray-500'
                : solvedCount === puzzles.length
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
            ) : solvedCount === puzzles.length ? (
              '🚪 ACTIVATE DOOR SEQUENCE'
            ) : (
              `🔒 SOLVE ${puzzles.length - solvedCount} MORE SECURITY LOCKS`
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 font-mono text-sm">
          "Only those who understand the language of genetics may proceed..."
        </div>
      </div>
    </div>
  )
}
