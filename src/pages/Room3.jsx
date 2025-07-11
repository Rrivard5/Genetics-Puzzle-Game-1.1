import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'

export default function Room3() {
  const [responses, setResponses] = useState({})
  const [checkedAnswers, setCheckedAnswers] = useState({})
  const [feedback, setFeedback] = useState({})
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeLock, setActiveLock] = useState(null)
  const [puzzles, setPuzzles] = useState([])
  const [showPedigree, setShowPedigree] = useState(false)
  const [pedigreeImages, setPedigreeImages] = useState({})
  const [pedigreeImageLoaded, setPedigreeImageLoaded] = useState(false)
  const [pedigreeImageError, setPedigreeImageError] = useState(false)
  const navigate = useNavigate()
  const { setRoomUnlocked, setCurrentProgress, trackAttempt, startRoomTimer, completeRoom, studentInfo } = useGame()

  // Load puzzles based on student's group
  useEffect(() => {
    if (studentInfo?.groupNumber) {
      loadPuzzlesForGroup(studentInfo.groupNumber)
      loadPedigreeImages()
    }
  }, [studentInfo])

  // Start room timer when component mounts
  useEffect(() => {
    startRoomTimer('room3')
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

  const loadPuzzlesForGroup = (groupNumber) => {
    const savedPuzzles = localStorage.getItem('instructor-puzzles');
    if (savedPuzzles) {
      const allPuzzles = JSON.parse(savedPuzzles);
      const groupPuzzles = allPuzzles.room3?.groups?.[groupNumber] || allPuzzles.room3?.groups?.[1] || [];
      setPuzzles(groupPuzzles);
    } else {
      // Default puzzles for group 1
      const defaultPuzzles = [
        {
          id: "p1",
          question: "A female (BY Dd) and male (BR d) mate. What is the likelihood that one of their female offspring who does not have dark vision will have blue OR red scales?",
          type: "multiple_choice",
          answer: "1/2",
          options: ["1/8", "1/4", "1/2", "3/4"]
        },
        {
          id: "p2",
          question: "In the same cross (BY Dd × BR d), what is the probability of getting a male offspring with orange scales and dark vision?",
          type: "multiple_choice",
          answer: "1/4",
          options: ["1/8", "1/4", "1/2", "0"]
        },
        {
          id: "p3",
          question: "If two loci are 33 centimorgans apart, what is the recombination frequency between them?",
          type: "multiple_choice",
          answer: "33%",
          options: ["0%", "16.5%", "33%", "50%"]
        }
      ];
      setPuzzles(defaultPuzzles);
    }
  };

  const loadPedigreeImages = () => {
    const savedImages = localStorage.getItem('instructor-question-images');
    if (savedImages) {
      setPedigreeImages(JSON.parse(savedImages));
    }
  };

  const getPedigreeImageForGroup = () => {
    if (!studentInfo?.groupNumber) return null;
    
    // First check if there's a Room 3 specific pedigree image
    const room3ImageKey = `room3_group${studentInfo.groupNumber}_pedigree`;
    const room3Image = pedigreeImages[room3ImageKey];
    if (room3Image) {
      return room3Image.data;
    }
    
    // Fallback to Room 2 images (any of the 3 questions)
    for (let i = 1; i <= 3; i++) {
      const room2ImageKey = `room2_group${studentInfo.groupNumber}_p${i}`;
      const room2Image = pedigreeImages[room2ImageKey];
      if (room2Image) {
        return room2Image.data;
      }
    }
    
    return null;
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
          message: "Please select an answer before checking.",
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
    trackAttempt('room3', puzzleId, userAnswer, isCorrect)
    
    // Mark as checked
    setCheckedAnswers(prev => ({ ...prev, [puzzleId]: true }))
    
    if (isCorrect) {
      setFeedback(prev => ({ 
        ...prev, 
        [puzzleId]: { 
          isCorrect: true, 
          message: "🎉 Correct! Excellent probability calculation!",
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
    const feedbackKey = `room3_${puzzleId}_${userAnswer.toLowerCase()}_group${studentInfo.groupNumber}`
    const generalFeedbackKey = `room3_${puzzleId}_${userAnswer.toLowerCase()}`
    
    if (customFeedback[feedbackKey]) {
      return customFeedback[feedbackKey]
    }
    
    if (customFeedback[generalFeedbackKey]) {
      return customFeedback[generalFeedbackKey]
    }
    
    // Default feedback
    return `❌ That's not correct. The right answer is "${puzzle.answer}". Try reviewing the probability calculations for this question.`
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
      setError('ALL PROBABILITY LOCKS MUST BE CALCULATED AND VERIFIED TO PROCEED')
      return
    }

    const allCorrect = puzzles.every(p => feedback[p.id]?.isCorrect)
    if (!allCorrect) {
      setError('ALL PROBABILITY LOCKS MUST BE SOLVED CORRECTLY TO PROCEED')
      return
    }

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setRoomUnlocked(prev => ({ ...prev, room3: true }))
    setCurrentProgress(75)
    completeRoom('room3')
    navigate('/room4')
    
    setIsSubmitting(false)
  }

  const handlePedigreeImageLoad = () => {
    setPedigreeImageLoaded(true)
    setPedigreeImageError(false)
  }

  const handlePedigreeImageError = () => {
    setPedigreeImageError(true)
    setPedigreeImageLoaded(false)
  }

  const answeredCount = Object.keys(checkedAnswers).length
  const isLockSolved = (puzzleId) => feedback[puzzleId]?.isCorrect
  const solvedCount = puzzles.filter(p => isLockSolved(p.id)).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-900 via-amber-800 to-yellow-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-16 left-16 w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-24 w-2 h-2 bg-orange-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-24 left-40 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-16 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Probability Chamber Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400" 
              style={{ fontFamily: 'Impact, "Arial Black", sans-serif', letterSpacing: '3px', textShadow: '0 0 20px rgba(251, 191, 36, 0.5)' }}>
            PROBABILITY CALCULATION CHAMBER
          </h1>
          <div className="h-1 w-48 mx-auto bg-gradient-to-r from-amber-400 to-orange-400 mb-4 animate-pulse"></div>
          <p className="text-amber-300 text-lg">Group {studentInfo.groupNumber} - Genetic Probability Division</p>
        </div>

        {/* Probability Mechanism */}
        <div className="relative flex justify-center mb-12 door-container">
          <div className="relative">
            <svg width="500" height="700" viewBox="0 0 500 700" className="drop-shadow-2xl">
              {/* Outer Mechanism Frame */}
              <rect x="30" y="30" width="440" height="640" rx="25" fill="url(#outerMechanism)" stroke="#d97706" strokeWidth="8"/>
              
              {/* Inner Frame */}
              <rect x="60" y="60" width="380" height="580" rx="20" fill="url(#innerMechanism)" stroke="#b45309" strokeWidth="4"/>
              
              {/* Mechanism Panels */}
              <rect x="80" y="100" width="340" height="520" rx="15" fill="url(#mechanismSurface)"/>
              
              {/* Control Header Section */}
              <rect x="90" y="110" width="320" height="80" rx="10" fill="url(#headerMechanism)" stroke="#92400e" strokeWidth="2"/>
              
              {/* Probability pattern in header */}
              <g opacity="0.4" stroke="#f59e0b" strokeWidth="1.5" fill="none">
                <circle cx="250" cy="150" r="20"/>
                <circle cx="250" cy="150" r="15"/>
                <circle cx="250" cy="150" r="10"/>
                <path d="M230 140 Q250 130, 270 140 Q250 150, 230 140"/>
                <path d="M230 160 Q250 170, 270 160 Q250 150, 230 160"/>
              </g>
              
              {/* Central Vertical Calculator */}
              <line x1="250" y1="100" x2="250" y2="620" stroke="#b45309" strokeWidth="4"/>
              
              {/* Mechanism Panel Details */}
              <g opacity="0.3" stroke="#f59e0b" strokeWidth="2" fill="none">
                <rect x="100" y="220" width="130" height="180" rx="8"/>
                <rect x="110" y="230" width="110" height="160" rx="6"/>
                <path d="M145 310 Q165 290, 185 310" strokeWidth="3"/>
                
                <rect x="270" y="220" width="130" height="180" rx="8"/>
                <rect x="280" y="230" width="110" height="160" rx="6"/>
                <path d="M315 310 Q335 290, 355 310" strokeWidth="3"/>
                
                <rect x="100" y="420" width="130" height="140" rx="8"/>
                <rect x="270" y="420" width="130" height="140" rx="8"/>
                
                <rect x="115" y="235" width="12" height="12" rx="3"/>
                <rect x="375" y="235" width="12" height="12" rx="3"/>
                <rect x="115" y="575" width="12" height="12" rx="3"/>
                <rect x="375" y="575" width="12" height="12" rx="3"/>
              </g>
              
              {/* Probability Calculation Etchings */}
              <g opacity="0.4" fill="none" stroke="#fbbf24" strokeWidth="2">
                {/* Left side probability grid */}
                <rect x="130" y="270" width="50" height="50" rx="4"/>
                <line x1="130" y1="295" x2="180" y2="295"/>
                <line x1="155" y1="270" x2="155" y2="320"/>
                <circle cx="142" cy="282" r="3"/>
                <circle cx="167" cy="282" r="3"/>
                <circle cx="142" cy="307" r="3"/>
                <circle cx="167" cy="307" r="3"/>
                
                {/* Right side probability grid */}
                <rect x="310" y="470" width="50" height="50" rx="4"/>
                <line x1="310" y1="495" x2="360" y2="495"/>
                <line x1="335" y1="470" x2="335" y2="520"/>
                <circle cx="322" cy="482" r="3"/>
                <circle cx="347" cy="482" r="3"/>
                <circle cx="322" cy="507" r="3"/>
                <circle cx="347" cy="507" r="3"/>
              </g>
              
              {/* Probability Lock Positions */}
              {puzzles.map((puzzle, index) => {
                const lockY = 270 + (index * 120);
                const isAnswered = checkedAnswers[puzzle.id];
                const isCorrect = isLockSolved(puzzle.id);
                
                return (
                  <g key={puzzle.id}>
                    <circle 
                      cx="250" 
                      cy={lockY} 
                      r="35" 
                      fill="url(#lockBackground)"
                      stroke={isCorrect ? "#f59e0b" : isAnswered ? "#d97706" : "#78716c"}
                      strokeWidth="3"
                      opacity="0.9"
                    />
                    
                    <circle 
                      cx="250" 
                      cy={lockY} 
                      r="25" 
                      fill={isCorrect ? "url(#solvedGlow)" : isAnswered ? "url(#partialGlow)" : "url(#lockedGlow)"}
                      stroke={isCorrect ? "#b45309" : isAnswered ? "#d97706" : "#78716c"}
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
              
              {/* Master Calculation Port */}
              {solvedCount === puzzles.length && (
                <g>
                  <ellipse cx="250" cy="580" rx="20" ry="25" fill="#f59e0b" opacity="0.9"/>
                  <rect x="243" y="590" width="14" height="25" fill="#f59e0b" opacity="0.9"/>
                </g>
              )}
              
              {/* SVG Gradients - Orange/Amber theme */}
              <defs>
                <linearGradient id="outerMechanism" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#b45309"/>
                  <stop offset="30%" stopColor="#d97706"/>
                  <stop offset="70%" stopColor="#f59e0b"/>
                  <stop offset="100%" stopColor="#b45309"/>
                </linearGradient>
                <linearGradient id="innerMechanism" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#92400e"/>
                  <stop offset="50%" stopColor="#b45309"/>
                  <stop offset="100%" stopColor="#a3530a"/>
                </linearGradient>
                <linearGradient id="mechanismSurface" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#dc2626"/>
                  <stop offset="30%" stopColor="#ea580c"/>
                  <stop offset="70%" stopColor="#f59e0b"/>
                  <stop offset="100%" stopColor="#dc2626"/>
                </linearGradient>
                <linearGradient id="headerMechanism" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ea580c"/>
                  <stop offset="50%" stopColor="#dc2626"/>
                  <stop offset="100%" stopColor="#f59e0b"/>
                </linearGradient>
                <radialGradient id="lockBackground">
                  <stop offset="0%" stopColor="#dc2626"/>
                  <stop offset="100%" stopColor="#ea580c"/>
                </radialGradient>
                <radialGradient id="solvedGlow">
                  <stop offset="0%" stopColor="#f59e0b"/>
                  <stop offset="100%" stopColor="#b45309"/>
                </radialGradient>
                <radialGradient id="partialGlow">
                  <stop offset="0%" stopColor="#d97706"/>
                  <stop offset="100%" stopColor="#b45309"/>
                </radialGradient>
                <radialGradient id="lockedGlow">
                  <stop offset="0%" stopColor="#78716c"/>
                  <stop offset="100%" stopColor="#57534e"/>
                </radialGradient>
              </defs>
            </svg>
            
            {/* Mechanism Status Text */}
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
              <p className="text-amber-300 font-bold text-lg" style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>
                {solvedCount === puzzles.length ? 
                  "🎲 PROBABILITY CALCULATIONS COMPLETE" : 
                  `🔢 ${puzzles.length - solvedCount} CALCULATIONS REMAINING`
                }
              </p>
              <p className="text-orange-400 text-sm mt-2">Click the calculation locks to solve probability problems</p>
            </div>
          </div>
        </div>

        {/* Active Calculation Display */}
        {activeLock && (
          <div className="mt-16" id={`puzzle-${activeLock}`}>
            {/* Pedigree Access Button */}
            <div className="mb-6 flex justify-center">
              <button
                onClick={() => setShowPedigree(!showPedigree)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-bold text-lg border-2 border-blue-400 hover:border-blue-300 transition-all transform hover:scale-105 shadow-lg"
                style={{ fontFamily: 'Impact, "Arial Black", sans-serif', letterSpacing: '1px' }}
              >
                {showPedigree ? 'HIDE' : 'VIEW'} PEDIGREE CHART
              </button>
            </div>

            {/* Pedigree Chart Display */}
            {showPedigree && (
              <div className="mb-8 bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900 border-4 border-blue-400 rounded-xl p-6 shadow-2xl">
                <h3 className="text-center text-2xl font-bold text-blue-300 mb-6" style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>
                  PEDIGREE ANALYSIS CHART
                </h3>
                <div className="flex justify-center">
                  {getPedigreeImageForGroup() ? (
                    <div className="relative">
                      {/* Loading indicator */}
                      {!pedigreeImageLoaded && !pedigreeImageError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                            <p className="text-blue-300">Loading pedigree chart...</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Error state */}
                      {pedigreeImageError && (
                        <div className="bg-red-900 border-2 border-red-400 rounded-lg p-8 text-center">
                          <div className="text-6xl mb-4">⚠️</div>
                          <p className="text-red-300 text-lg mb-2">Error Loading Pedigree Chart</p>
                          <p className="text-red-400 text-sm">Please contact your instructor</p>
                        </div>
                      )}
                      
                      {/* Actual image */}
                      <img 
                        src={getPedigreeImageForGroup()} 
                        alt={`Pedigree Chart - Group ${studentInfo.groupNumber}`}
                        className={`max-w-full max-h-96 rounded-lg shadow-lg border-2 border-blue-300 ${
                          !pedigreeImageLoaded ? 'hidden' : 'block'
                        }`}
                        onLoad={handlePedigreeImageLoad}
                        onError={handlePedigreeImageError}
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-800 border-2 border-blue-400 rounded-lg p-8 text-center min-w-[400px]">
                      <div className="text-6xl mb-4">🧬</div>
                      <p className="text-blue-300 text-lg mb-2">Pedigree Analysis Chart</p>
                      <p className="text-blue-400 text-sm mb-4">
                        No pedigree chart available for Group {studentInfo.groupNumber}
                      </p>
                      <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4 mt-4">
                        <div className="text-yellow-400 text-sm">
                          <p>🎓 <strong>For Instructors:</strong> Upload pedigree images in Room 2 or Room 3 settings.</p>
                          <p className="mt-2">📝 <strong>Note:</strong> Room 3 will automatically use Room 2 pedigree images if available.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-center mt-4">
                  <p className="text-blue-200 text-sm">
                    Reference pedigree chart from genetic analysis archives
                  </p>
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
                    currentFeedback?.isCorrect ? 'border-amber-400 bg-gradient-to-br from-amber-900 to-amber-800 shadow-amber-400/50' :
                    hasBeenChecked ? 'border-orange-400 bg-gradient-to-br from-orange-900 to-orange-800 shadow-orange-400/50' :
                    'border-stone-400 bg-gradient-to-br from-stone-900 to-stone-800 shadow-stone-400/50'
                  } shadow-2xl`}>
                    
                    {/* Return to Mechanism Button */}
                    <button
                      onClick={() => {
                        setActiveLock(null)
                        setTimeout(() => {
                          const mechanismElement = document.querySelector('.door-container')
                          if (mechanismElement) {
                            mechanismElement.scrollIntoView({ 
                              behavior: 'smooth', 
                              block: 'center',
                              inline: 'nearest'
                            })
                          }
                        }, 100)
                      }}
                      className="absolute top-4 right-4 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                    >
                      ⬆️ Return to Mechanism
                    </button>
                    
                    {/* Calculation Symbol */}
                    <div className="flex items-start gap-4 mt-8">
                      <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold border-4 ${
                        currentFeedback?.isCorrect ? 'bg-amber-500 border-amber-300 text-white' :
                        hasBeenChecked ? 'bg-orange-500 border-orange-300 text-white' :
                        'bg-stone-600 border-stone-400 text-white'
                      }`} style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>
                        {currentFeedback?.isCorrect ? '🔓' : hasBeenChecked ? '❌' : '🔒'}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-4 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                          <span className="text-amber-400">CALCULATION LOCK {puzzleIndex + 1}:</span> {puzzle.question}
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
                                      : 'border-stone-600 bg-stone-800/50 hover:border-amber-400/50'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={puzzle.id}
                                    value={option}
                                    checked={responses[puzzle.id] === option}
                                    onChange={(e) => handleChange(e, puzzle.id)}
                                    disabled={currentFeedback?.isCorrect}
                                    className="mr-4 h-5 w-5 text-amber-500 border-stone-400 focus:ring-amber-500"
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
                                className="w-full px-4 py-3 rounded-lg bg-stone-700 text-white border-2 border-stone-600 focus:border-amber-400 focus:outline-none font-mono text-lg"
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
                                ? 'bg-amber-600 cursor-not-allowed opacity-50'
                                : !responses[puzzle.id]
                                ? 'bg-gray-600 cursor-not-allowed opacity-50'
                                : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 hover:scale-105 shadow-lg'
                            } text-white border-2 border-amber-400`}
                            style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
                          >
                            {currentFeedback?.isCorrect ? '✅ CORRECT!' : '📝 SUBMIT ANSWER'}
                          </button>
                        </div>

                        {/* Feedback Display */}
                        {currentFeedback && (
                          <div className={`mb-4 p-4 rounded-lg border-2 ${
                            currentFeedback.isCorrect 
                              ? 'bg-amber-900 border-amber-400 text-amber-100'
                              : 'bg-orange-900 border-orange-400 text-orange-100'
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
            disabled={isSubmitting || solvedCount < puzzles.length}
            className={`px-12 py-6 rounded-xl font-bold text-2xl shadow-2xl transition-all duration-300 border-4 ${
              isSubmitting
                ? 'bg-gray-600 cursor-not-allowed border-gray-500'
                : solvedCount === puzzles.length
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-amber-400 hover:border-amber-300 transform hover:scale-105 animate-pulse'
                : 'bg-gradient-to-r from-stone-600 to-stone-700 text-stone-300 border-stone-500 cursor-not-allowed'
            }`}
            style={{ fontFamily: 'Impact, "Arial Black", sans-serif', letterSpacing: '2px' }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-white mr-4"></div>
                PROBABILITY CALCULATIONS PROCESSING...
              </span>
            ) : solvedCount === puzzles.length ? (
              '🎲 COMPLETE PROBABILITY SEQUENCE'
            ) : (
              `🔢 SOLVE ${puzzles.length - solvedCount} MORE CALCULATIONS`
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 font-mono text-sm">
          "Probability governs the dance of genetics..."
        </div>
      </div>
    </div>
  )
}
