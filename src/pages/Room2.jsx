import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'

export default function Room2() {
  const [responses, setResponses] = useState({})
  const [checkedAnswers, setCheckedAnswers] = useState({})
  const [feedback, setFeedback] = useState({})
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeLock, setActiveLock] = useState(null)
  const [puzzles, setPuzzles] = useState([])
  const [pedigreeImages, setPedigreeImages] = useState({})
  const [imageLoaded, setImageLoaded] = useState({})
  const [imageError, setImageError] = useState({})
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
    startRoomTimer('room2')
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
      const groupPuzzles = allPuzzles.room2?.groups?.[groupNumber] || allPuzzles.room2?.groups?.[1] || [];
      
      // Ensure exactly 3 puzzles for the 3 locks
      if (groupPuzzles.length < 3) {
        const defaultPuzzles = [
          {
            id: "p1",
            question: "Looking at the pedigree, what type of inheritance pattern does this trait follow?",
            type: "multiple_choice",
            answer: "X-linked recessive",
            options: ["Autosomal dominant", "Autosomal recessive", "X-linked recessive", "X-linked dominant"]
          },
          {
            id: "p2",
            question: "In the same pedigree family, what is individual 9's genotype for dark vision AND scale color?",
            type: "multiple_choice",
            answer: "XdXd BB",
            options: ["XDXd RB", "XdXd BB", "XdXd RB", "XDXd BB"]
          },
          {
            id: "p3",
            question: "Based on the inheritance patterns shown, if individual 9 had children with a normal vision male, what percentage of their daughters would have dark vision?",
            type: "multiple_choice",
            answer: "0%",
            options: ["0%", "25%", "50%", "100%"]
          }
        ];
        
        // Fill missing puzzles with defaults
        for (let i = groupPuzzles.length; i < 3; i++) {
          groupPuzzles.push(defaultPuzzles[i]);
        }
      }
      
      setPuzzles(groupPuzzles.slice(0, 3)); // Ensure exactly 3 puzzles
    } else {
      // Default puzzles for group 1
      const defaultPuzzles = [
        {
          id: "p1",
          question: "Looking at the pedigree, what type of inheritance pattern does this trait follow?",
          type: "multiple_choice",
          answer: "X-linked recessive",
          options: ["Autosomal dominant", "Autosomal recessive", "X-linked recessive", "X-linked dominant"]
        },
        {
          id: "p2",
          question: "In the same pedigree family, what is individual 9's genotype for dark vision AND scale color?",
          type: "multiple_choice",
          answer: "XdXd BB",
          options: ["XDXd RB", "XdXd BB", "XdXd RB", "XDXd BB"]
        },
        {
          id: "p3",
          question: "Based on the inheritance patterns shown, if individual 9 had children with a normal vision male, what percentage of their daughters would have dark vision?",
          type: "multiple_choice",
          answer: "0%",
          options: ["0%", "25%", "50%", "100%"]
        }
      ];
      setPuzzles(defaultPuzzles);
    }
  };

  const loadPedigreeImages = () => {
    const savedImages = localStorage.getItem('instructor-pedigree-images');
    if (savedImages) {
      setPedigreeImages(JSON.parse(savedImages));
    }
  };

  const getCurrentQuestionImage = (questionId) => {
    if (!studentInfo?.groupNumber) return null;
    const imageKey = `room2_group${studentInfo.groupNumber}_${questionId}`;
    const imageData = pedigreeImages[imageKey];
    return imageData ? imageData.data : null;
  };

  const getCurrentQuestionImageInfo = (questionId) => {
    if (!studentInfo?.groupNumber) return null;
    const imageKey = `room2_group${studentInfo.groupNumber}_${questionId}`;
    return pedigreeImages[imageKey];
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
      isCorrect = puzzle.answer.toLowerCase() === userAnswer.toLowerCase()
    }
    
    // Track the attempt
    trackAttempt('room2', puzzleId, userAnswer, isCorrect)
    
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
    const feedbackKey = `room2_${puzzleId}_${userAnswer.toLowerCase()}_group${studentInfo.groupNumber}`
    const generalFeedbackKey = `room2_${puzzleId}_${userAnswer.toLowerCase()}`
    
    if (customFeedback[feedbackKey]) {
      return customFeedback[feedbackKey]
    }
    
    if (customFeedback[generalFeedbackKey]) {
      return customFeedback[generalFeedbackKey]
    }
    
    // Default feedback
    return `❌ That's not correct. The right answer is "${puzzle.answer}". Try reviewing the pedigree analysis for this question.`
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
      setError('ALL 3 GENETIC LOCKS MUST BE ANALYZED AND VERIFIED TO PROCEED')
      return
    }

    const allCorrect = puzzles.every(p => feedback[p.id]?.isCorrect)
    if (!allCorrect) {
      setError('ALL 3 GENETIC LOCKS MUST BE SOLVED CORRECTLY TO PROCEED')
      return
    }

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setRoomUnlocked(prev => ({ ...prev, room2: true }))
    setCurrentProgress(50)
    completeRoom('room2')
    navigate('/room3')
    
    setIsSubmitting(false)
  }

  const handleImageLoad = (questionId) => {
    setImageLoaded(prev => ({ ...prev, [questionId]: true }))
    setImageError(prev => ({ ...prev, [questionId]: false }))
  }

  const handleImageError = (questionId) => {
    setImageError(prev => ({ ...prev, [questionId]: true }))
    setImageLoaded(prev => ({ ...prev, [questionId]: false }))
  }

  const answeredCount = Object.keys(checkedAnswers).length
  const isLockSolved = (puzzleId) => feedback[puzzleId]?.isCorrect
  const solvedCount = puzzles.filter(p => isLockSolved(p.id)).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-cyan-800 to-teal-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-16 left-16 w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-24 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-24 left-40 w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-16 w-3 h-3 bg-indigo-400 rounded-full animate-ping"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Laboratory Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400" 
              style={{ fontFamily: 'Impact, "Arial Black", sans-serif', letterSpacing: '3px', textShadow: '0 0 20px rgba(6, 182, 212, 0.5)' }}>
            GENETIC ANALYSIS LABORATORY
          </h1>
          <div className="h-1 w-48 mx-auto bg-gradient-to-r from-cyan-400 to-blue-400 mb-4 animate-pulse"></div>
          <p className="text-cyan-300 text-lg">Group {studentInfo.groupNumber} - Pedigree Analysis Division</p>
        </div>

        {/* Scientific Console with 3 Locks */}
        <div className="relative flex justify-center mb-12 door-container">
          <div className="relative">
            <svg width="500" height="700" viewBox="0 0 500 700" className="drop-shadow-2xl">
              {/* Outer Console Frame */}
              <rect x="30" y="30" width="440" height="640" rx="25" fill="url(#outerConsole)" stroke="#0891b2" strokeWidth="8"/>
              
              {/* Inner Frame */}
              <rect x="60" y="60" width="380" height="580" rx="20" fill="url(#innerConsole)" stroke="#0e7490" strokeWidth="4"/>
              
              {/* Console Panels */}
              <rect x="80" y="100" width="340" height="520" rx="15" fill="url(#consoleSurface)"/>
              
              {/* Control Header Section */}
              <rect x="90" y="110" width="320" height="80" rx="10" fill="url(#headerPanel)" stroke="#164e63" strokeWidth="2"/>
              
              {/* Scientific pattern in header */}
              <g opacity="0.4" stroke="#0891b2" strokeWidth="1.5" fill="none">
                <circle cx="250" cy="150" r="20"/>
                <circle cx="250" cy="150" r="15"/>
                <circle cx="250" cy="150" r="10"/>
                <line x1="230" y1="150" x2="270" y2="150"/>
                <line x1="250" y1="130" x2="250" y2="170"/>
              </g>
              
              {/* Central Vertical Display */}
              <line x1="250" y1="100" x2="250" y2="620" stroke="#0e7490" strokeWidth="4"/>
              
              {/* Console Panel Details */}
              <g opacity="0.3" stroke="#0891b2" strokeWidth="2" fill="none">
                <rect x="100" y="220" width="130" height="150" rx="8"/>
                <rect x="110" y="230" width="110" height="130" rx="6"/>
                <path d="M145 295 Q165 285, 185 295" strokeWidth="3"/>
                
                <rect x="270" y="220" width="130" height="150" rx="8"/>
                <rect x="280" y="230" width="110" height="130" rx="6"/>
                <path d="M315 295 Q335 285, 355 295" strokeWidth="3"/>
                
                <rect x="100" y="390" width="130" height="150" rx="8"/>
                <rect x="270" y="390" width="130" height="150" rx="8"/>
                
                <rect x="115" y="235" width="12" height="12" rx="3"/>
                <rect x="375" y="235" width="12" height="12" rx="3"/>
                <rect x="115" y="405" width="12" height="12" rx="3"/>
                <rect x="375" y="405" width="12" height="12" rx="3"/>
              </g>
              
              {/* Pedigree Chart Etchings */}
              <g opacity="0.4" fill="none" stroke="#06b6d4" strokeWidth="2">
                {/* Left side family tree */}
                <circle cx="140" cy="260" r="6"/>
                <rect x="155" y="254" width="12" height="12" rx="2"/>
                <line x1="146" y1="260" x2="161" y2="260"/>
                <line x1="161" y1="266" x2="161" y2="280"/>
                <circle cx="155" cy="290" r="4"/>
                <circle cx="167" cy="290" r="4"/>
                
                {/* Right side family tree */}
                <circle cx="320" cy="430" r="6"/>
                <rect x="335" y="424" width="12" height="12" rx="2"/>
                <line x1="326" y1="430" x2="341" y2="430"/>
                <line x1="341" y1="436" x2="341" y2="450"/>
                <circle cx="335" cy="460" r="4"/>
                <circle cx="347" cy="460" r="4"/>
                
                {/* Center family tree */}
                <circle cx="180" cy="340" r="6"/>
                <rect x="195" y="334" width="12" height="12" rx="2"/>
                <line x1="186" y1="340" x2="201" y2="340"/>
                <line x1="201" y1="346" x2="201" y2="360"/>
                <circle cx="195" cy="370" r="4"/>
                <circle cx="207" cy="370" r="4"/>
              </g>
              
              {/* Analysis Lock Positions - Exactly 3 locks */}
              {puzzles.map((puzzle, index) => {
                const lockY = 250 + (index * 140); // More space between locks
                const isAnswered = checkedAnswers[puzzle.id];
                const isCorrect = isLockSolved(puzzle.id);
                
                return (
                  <g key={puzzle.id}>
                    <circle 
                      cx="250" 
                      cy={lockY} 
                      r="40" 
                      fill="url(#lockBackground)"
                      stroke={isCorrect ? "#06b6d4" : isAnswered ? "#0891b2" : "#475569"}
                      strokeWidth="4"
                      opacity="0.9"
                    />
                    
                    <circle 
                      cx="250" 
                      cy={lockY} 
                      r="30" 
                      fill={isCorrect ? "url(#solvedGlow)" : isAnswered ? "url(#partialGlow)" : "url(#lockedGlow)"}
                      stroke={isCorrect ? "#0e7490" : isAnswered ? "#0891b2" : "#64748b"}
                      strokeWidth="3"
                      className="cursor-pointer transition-all duration-200"
                      onClick={() => handleLockClick(puzzle.id)}
                    />
                    
                    <text 
                      x="250" 
                      y={lockY + 8} 
                      textAnchor="middle" 
                      fill="white" 
                      fontSize="24"
                      className="cursor-pointer pointer-events-none"
                    >
                      {isCorrect ? '🔓' : '🔒'}
                    </text>
                    
                    <text 
                      x="300" 
                      y={lockY + 6} 
                      fill="#06b6d4" 
                      fontSize="16" 
                      fontFamily="Impact, Arial Black, sans-serif"
                      className="pointer-events-none"
                    >
                      LOCK {index + 1}
                    </text>
                  </g>
                );
              })}
              
              {/* Master Analysis Port */}
              {solvedCount === 3 && (
                <g>
                  <ellipse cx="250" cy="590" rx="25" ry="30" fill="#06b6d4" opacity="0.9"/>
                  <rect x="240" y="605" width="20" height="30" fill="#06b6d4" opacity="0.9"/>
                  <text x="250" y="630" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                    COMPLETE
                  </text>
                </g>
              )}
              
              {/* SVG Gradients - Blue/Cyan theme */}
              <defs>
                <linearGradient id="outerConsole" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0e7490"/>
                  <stop offset="30%" stopColor="#0891b2"/>
                  <stop offset="70%" stopColor="#06b6d4"/>
                  <stop offset="100%" stopColor="#0e7490"/>
                </linearGradient>
                <linearGradient id="innerConsole" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#164e63"/>
                  <stop offset="50%" stopColor="#0e7490"/>
                  <stop offset="100%" stopColor="#155e75"/>
                </linearGradient>
                <linearGradient id="consoleSurface" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e3a8a"/>
                  <stop offset="30%" stopColor="#1e40af"/>
                  <stop offset="70%" stopColor="#1d4ed8"/>
                  <stop offset="100%" stopColor="#1e3a8a"/>
                </linearGradient>
                <linearGradient id="headerPanel" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e40af"/>
                  <stop offset="50%" stopColor="#1e3a8a"/>
                  <stop offset="100%" stopColor="#1d4ed8"/>
                </linearGradient>
                <radialGradient id="lockBackground">
                  <stop offset="0%" stopColor="#1e3a8a"/>
                  <stop offset="100%" stopColor="#1e40af"/>
                </radialGradient>
                <radialGradient id="solvedGlow">
                  <stop offset="0%" stopColor="#06b6d4"/>
                  <stop offset="100%" stopColor="#0e7490"/>
                </radialGradient>
                <radialGradient id="partialGlow">
                  <stop offset="0%" stopColor="#0891b2"/>
                  <stop offset="100%" stopColor="#0e7490"/>
                </radialGradient>
                <radialGradient id="lockedGlow">
                  <stop offset="0%" stopColor="#64748b"/>
                  <stop offset="100%" stopColor="#475569"/>
                </radialGradient>
              </defs>
            </svg>
            
            {/* Console Status Text */}
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
              <p className="text-cyan-300 font-bold text-lg" style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>
                {solvedCount === 3 ? 
                  "🧬 ALL GENETIC ANALYSES COMPLETE" : 
                  `🔬 ${3 - solvedCount} ANALYSES REMAINING`
                }
              </p>
              <p className="text-blue-400 text-sm mt-2">Click the analysis locks to examine pedigree data</p>
            </div>
          </div>
        </div>

        {/* Active Analysis Display */}
        {activeLock && (
          <div className="mt-16" id={`puzzle-${activeLock}`}>
            {/* Enhanced Question Image Display */}
            <div className="mb-8">
              <h3 className="text-xl text-cyan-300 font-bold mb-4 text-center">
                🧬 Question Analysis Data - Group {studentInfo.groupNumber}
              </h3>
              <div className="bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900 border-4 border-cyan-400 rounded-xl p-6 shadow-2xl">
                <div className="flex justify-center">
                  {getCurrentQuestionImage(activeLock) ? (
                    <div className="relative">
                      {/* Loading indicator */}
                      {!imageLoaded[activeLock] && !imageError[activeLock] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                            <p className="text-cyan-300">Loading question image...</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Error state */}
                      {imageError[activeLock] && (
                        <div className="bg-red-900 border-2 border-red-400 rounded-lg p-8 text-center">
                          <div className="text-6xl mb-4">⚠️</div>
                          <p className="text-red-300 text-lg mb-2">Error Loading Question Image</p>
                          <p className="text-red-400 text-sm">Please contact your instructor</p>
                        </div>
                      )}
                      
                      {/* Actual image */}
                      <img 
                        src={getCurrentQuestionImage(activeLock)} 
                        alt={`Question ${activeLock} - Group ${studentInfo.groupNumber}`}
                        className={`max-w-full max-h-96 rounded-lg shadow-lg border-2 border-cyan-300 ${
                          !imageLoaded[activeLock] ? 'hidden' : 'block'
                        }`}
                        onLoad={() => handleImageLoad(activeLock)}
                        onError={() => handleImageError(activeLock)}
                      />
                      
                      {/* Image info overlay */}
                      {getCurrentQuestionImageInfo(activeLock) && imageLoaded[activeLock] && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded-lg text-xs">
                          {getCurrentQuestionImageInfo(activeLock).name}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-800 border-2 border-cyan-400 rounded-lg p-8 text-center min-w-[400px]">
                      <div className="text-6xl mb-4">🧬</div>
                      <p className="text-cyan-300 text-lg mb-2">Question Analysis Chart</p>
                      <p className="text-blue-400 text-sm mb-4">
                        No image available for this question in Group {studentInfo.groupNumber}
                      </p>
                      <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4 mt-4">
                        <div className="text-yellow-400 text-sm">
                          <p>📝 <strong>For Students:</strong> Please inform your instructor that no image has been uploaded for this question.</p>
                          <p className="mt-2">🎓 <strong>For Instructors:</strong> Upload images in the "Room 2 Settings" tab of the instructor portal.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-center mt-4">
                  <p className="text-cyan-200 text-sm">
                    {getCurrentQuestionImage(activeLock) 
                      ? `Genetic analysis data for Group ${studentInfo.groupNumber} recovered from alien genetic archives`
                      : "Genetic analysis interface ready - awaiting question data"
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Puzzle Questions */}
            {puzzles.filter(p => p.id === activeLock).map((puzzle, index) => {
              const puzzleIndex = puzzles.findIndex(p => p.id === puzzle.id);
              const hasBeenChecked = checkedAnswers[puzzle.id];
              const currentFeedback = feedback[puzzle.id];
              
              return (
                <div key={puzzle.id} className="relative">
                  <div className={`border-4 rounded-xl p-6 transition-all duration-500 ${
                    currentFeedback?.isCorrect ? 'border-cyan-400 bg-gradient-to-br from-cyan-900 to-cyan-800 shadow-cyan-400/50' :
                    hasBeenChecked ? 'border-blue-400 bg-gradient-to-br from-blue-900 to-blue-800 shadow-blue-400/50' :
                    'border-slate-400 bg-gradient-to-br from-slate-900 to-slate-800 shadow-slate-400/50'
                  } shadow-2xl`}>
                    
                    {/* Return to Console Button */}
                    <button
                      onClick={() => {
                        setActiveLock(null)
                        setTimeout(() => {
                          const consoleElement = document.querySelector('.door-container')
                          if (consoleElement) {
                            consoleElement.scrollIntoView({ 
                              behavior: 'smooth', 
                              block: 'center',
                              inline: 'nearest'
                            })
                          }
                        }, 100)
                      }}
                      className="absolute top-4 right-4 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                    >
                      ⬆️ Return to Console
                    </button>
                    
                    {/* Analysis Symbol */}
                    <div className="flex items-start gap-4 mt-8">
                      <div className={`flex-shrink-0 w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold border-4 ${
                        currentFeedback?.isCorrect ? 'bg-cyan-500 border-cyan-300 text-white' :
                        hasBeenChecked ? 'bg-blue-500 border-blue-300 text-white' :
                        'bg-slate-600 border-slate-400 text-white'
                      }`} style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>
                        {currentFeedback?.isCorrect ? '🔓' : hasBeenChecked ? '❌' : '🔒'}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-4 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                          <span className="text-cyan-400">ANALYSIS LOCK {puzzleIndex + 1}:</span> {puzzle.question}
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
                                      ? 'border-cyan-400 bg-cyan-900/30' 
                                      : 'border-slate-600 bg-slate-800/50 hover:border-cyan-400/50'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={puzzle.id}
                                    value={option}
                                    checked={responses[puzzle.id] === option}
                                    onChange={(e) => handleChange(e, puzzle.id)}
                                    disabled={currentFeedback?.isCorrect}
                                    className="mr-4 h-5 w-5 text-cyan-500 border-slate-400 focus:ring-cyan-500"
                                  />
                                  <span className="text-white font-mono text-lg">{option}</span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={responses[puzzle.id] || ''}
                              onChange={(e) => handleChange(e, puzzle.id)}
                              placeholder="Type your answer here..."
                              className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border-2 border-slate-600 focus:border-cyan-400 focus:outline-none font-mono text-lg"
                              disabled={currentFeedback?.isCorrect}
                            />
                          )}
                        </div>

                        {/* Check Answer Button */}
                        <div className="mb-4">
                          <button
                            onClick={() => checkAnswer(puzzle.id)}
                            disabled={!responses[puzzle.id] || currentFeedback?.isCorrect}
                            className={`px-6 py-3 rounded-lg font-bold text-lg transition-all transform ${
                              currentFeedback?.isCorrect 
                                ? 'bg-cyan-600 cursor-not-allowed opacity-50'
                                : !responses[puzzle.id]
                                ? 'bg-gray-600 cursor-not-allowed opacity-50'
                                : 'bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 hover:scale-105 shadow-lg'
                            } text-white border-2 border-cyan-400`}
                            style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
                          >
                            {currentFeedback?.isCorrect ? '✅ CORRECT!' : '🔬 ANALYZE DATA'}
                          </button>
                        </div>

                        {/* Feedback Display */}
                        {currentFeedback && (
                          <div className={`mb-4 p-4 rounded-lg border-2 ${
                            currentFeedback.isCorrect 
                              ? 'bg-cyan-900 border-cyan-400 text-cyan-100'
                              : 'bg-blue-900 border-blue-400 text-blue-100'
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

        {/* Progress Indicator */}
        <div className="mt-8 bg-white bg-opacity-10 rounded-xl p-4 text-center">
          <div className="text-cyan-300 text-sm mb-2">Analysis Progress</div>
          <div className="flex justify-center gap-2">
            {puzzles.map((puzzle, index) => (
              <div
                key={puzzle.id}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  isLockSolved(puzzle.id) 
                    ? 'bg-cyan-500 text-white' 
                    : checkedAnswers[puzzle.id]
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-600 text-gray-300'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <div className="text-cyan-400 text-xs mt-2">
            {solvedCount}/3 locks solved
          </div>
        </div>

        {/* Activation Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || solvedCount < 3}
            className={`px-12 py-6 rounded-xl font-bold text-2xl shadow-2xl transition-all duration-300 border-4 ${
              isSubmitting
                ? 'bg-gray-600 cursor-not-allowed border-gray-500'
                : solvedCount === 3
                ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white border-cyan-400 hover:border-cyan-300 transform hover:scale-105 animate-pulse'
                : 'bg-gradient-to-r from-slate-600 to-slate-700 text-slate-300 border-slate-500 cursor-not-allowed'
            }`}
            style={{ fontFamily: 'Impact, "Arial Black", sans-serif', letterSpacing: '2px' }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-white mr-4"></div>
                GENETIC ANALYSIS PROCESSING...
              </span>
            ) : solvedCount === 3 ? (
              '🧬 COMPLETE ALL GENETIC ANALYSES'
            ) : (
              `🔬 SOLVE ${3 - solvedCount} MORE ANALYSES`
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 font-mono text-sm">
          "Genetic patterns reveal the secrets of inheritance..."
        </div>
      </div>
    </div>
  )
}
