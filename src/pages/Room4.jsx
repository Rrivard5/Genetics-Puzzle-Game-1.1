import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'

export default function Room4() {
  const [responses, setResponses] = useState({})
  const [checkedAnswers, setCheckedAnswers] = useState({})
  const [feedback, setFeedback] = useState({})
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeLock, setActiveLock] = useState(null)
  const [puzzles, setPuzzles] = useState([])
  const [showHelp, setShowHelp] = useState(false)
  const [helpQuestion, setHelpQuestion] = useState(null)
  const [helpResponse, setHelpResponse] = useState('')
  const [helpAnswered, setHelpAnswered] = useState(false)
  const [helpFeedback, setHelpFeedback] = useState(null)
  const navigate = useNavigate()
  const { setRoomUnlocked, setFinalLetter, setCurrentProgress, trackAttempt, startRoomTimer, completeRoom, studentInfo } = useGame()

  // Load puzzles based on student's group
  useEffect(() => {
    if (studentInfo?.groupNumber) {
      loadPuzzlesForGroup(studentInfo.groupNumber)
      loadHelpQuestion(studentInfo.groupNumber)
    }
  }, [studentInfo])

  // Start room timer when component mounts
  useEffect(() => {
    startRoomTimer('room4')
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
      const groupPuzzles = allPuzzles.room4?.groups?.[groupNumber] || allPuzzles.room4?.groups?.[1] || [];
      setPuzzles(groupPuzzles);
    } else {
      // Default puzzles for group 1
      const defaultPuzzles = [
        {
          id: "p1",
          question: "A population of aliens is at Hardy-Weinberg equilibrium. The frequency of the dominant allele for wings is 0.6. What is the frequency of homozygous recessive genotypes in this population?",
          type: "multiple_choice",
          answer: "0.16",
          options: ["0.04", "0.16", "0.36", "0.64"]
        },
        {
          id: "p2",
          question: "If a population is NOT in Hardy-Weinberg equilibrium, which of the following factors could be responsible?",
          type: "multiple_choice",
          answer: "All of the above",
          options: ["Natural selection", "Gene flow (migration)", "Genetic drift", "All of the above"]
        },
        {
          id: "p3",
          question: "In RNA processing, which segments are removed from the pre-mRNA to create the final mature mRNA?",
          type: "multiple_choice",
          answer: "Introns",
          options: ["Exons", "Introns", "Both exons and introns", "Neither exons nor introns"]
        }
      ];
      setPuzzles(defaultPuzzles);
    }
  };

  const loadHelpQuestion = (groupNumber) => {
    const savedPuzzles = localStorage.getItem('instructor-puzzles');
    if (savedPuzzles) {
      const allPuzzles = JSON.parse(savedPuzzles);
      const helpQ = allPuzzles.room4?.groups?.[groupNumber]?.helpQuestion || allPuzzles.room4?.groups?.[1]?.helpQuestion;
      if (helpQ) {
        setHelpQuestion(helpQ);
      } else {
        // Default help question
        setHelpQuestion({
          id: "help1",
          question: "What does the Hardy-Weinberg principle describe?",
          type: "multiple_choice",
          answer: "The genetic equilibrium in populations",
          options: [
            "The genetic equilibrium in populations",
            "The rate of mutations in DNA",
            "The process of natural selection",
            "The inheritance of dominant traits"
          ]
        });
      }
    } else {
      // Default help question
      setHelpQuestion({
        id: "help1",
        question: "What does the Hardy-Weinberg principle describe?",
        type: "multiple_choice",
        answer: "The genetic equilibrium in populations",
        options: [
          "The genetic equilibrium in populations",
          "The rate of mutations in DNA",
          "The process of natural selection",
          "The inheritance of dominant traits"
        ]
      });
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

  const handleHelpChange = (e) => {
    setHelpResponse(e.target.value)
    if (helpFeedback) {
      setHelpFeedback(null)
    }
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
    trackAttempt('room4', puzzleId, userAnswer, isCorrect)
    
    // Mark as checked
    setCheckedAnswers(prev => ({ ...prev, [puzzleId]: true }))
    
    if (isCorrect) {
      setFeedback(prev => ({ 
        ...prev, 
        [puzzleId]: { 
          isCorrect: true, 
          message: "🎉 Correct! Excellent work!",
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

  const checkHelpAnswer = () => {
    if (!helpResponse.trim()) {
      setHelpFeedback({
        isCorrect: false,
        message: "Please select an answer before checking.",
        type: "warning"
      })
      return
    }

    const isCorrect = helpQuestion.answer === helpResponse.trim()
    
    // Track the help attempt
    trackAttempt('room4', 'help', helpResponse, isCorrect)
    
    if (isCorrect) {
      setHelpAnswered(true)
      setHelpFeedback({
        isCorrect: true,
        message: "🎉 Correct! You've unlocked the Population Genetics equations!",
        type: "success"
      })
    } else {
      setHelpFeedback({
        isCorrect: false,
        message: `❌ That's not correct. The right answer is "${helpQuestion.answer}". Try again!`,
        type: "error"
      })
    }
  }

  const getWrongAnswerFeedback = (puzzleId, userAnswer, puzzle) => {
    // Load custom feedback from localStorage (instructor-defined)
    const savedFeedback = localStorage.getItem('instructor-feedback')
    const customFeedback = savedFeedback ? JSON.parse(savedFeedback) : {}
    
    // Check if instructor has defined custom feedback for this specific wrong answer
    const feedbackKey = `room4_${puzzleId}_${userAnswer.toLowerCase()}_group${studentInfo.groupNumber}`
    const generalFeedbackKey = `room4_${puzzleId}_${userAnswer.toLowerCase()}`
    
    if (customFeedback[feedbackKey]) {
      return customFeedback[feedbackKey]
    }
    
    if (customFeedback[generalFeedbackKey]) {
      return customFeedback[generalFeedbackKey]
    }
    
    // Default feedback
    return `❌ That's not correct. The right answer is "${puzzle.answer}". Try reviewing the population genetics concepts for this question.`
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
      setError('ALL POPULATION LOCKS MUST BE ANALYZED AND VERIFIED TO PROCEED')
      return
    }

    const allCorrect = puzzles.every(p => feedback[p.id]?.isCorrect)
    if (!allCorrect) {
      setError('ALL POPULATION LOCKS MUST BE SOLVED CORRECTLY TO PROCEED')
      return
    }

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setRoomUnlocked(prev => ({ ...prev, room4: true }))
    setCurrentProgress(100)
    setFinalLetter('G') // The final letter for completion
    completeRoom('room4')
    navigate('/complete')
    
    setIsSubmitting(false)
  }

  const answeredCount = Object.keys(checkedAnswers).length
  const isLockSolved = (puzzleId) => feedback[puzzleId]?.isCorrect
  const solvedCount = puzzles.filter(p => isLockSolved(p.id)).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-800 to-violet-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-16 left-16 w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-24 w-2 h-2 bg-violet-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-24 left-40 w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-16 w-3 h-3 bg-purple-400 rounded-full animate-ping"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Population Observatory Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400" 
              style={{ fontFamily: 'Impact, "Arial Black", sans-serif', letterSpacing: '3px', textShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}>
            POPULATION GENETICS OBSERVATORY
          </h1>
          <div className="h-1 w-48 mx-auto bg-gradient-to-r from-purple-400 to-violet-400 mb-4 animate-pulse"></div>
          <p className="text-purple-300 text-lg">Group {studentInfo.groupNumber} - Final Challenge</p>
        </div>

        {/* Help Question Modal */}
        {showHelp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">🆘 Population Genetics Help</h2>
                  <button
                    onClick={() => setShowHelp(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                {helpQuestion && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-800 mb-2">Help Question:</h3>
                      <p className="text-blue-700">{helpQuestion.question}</p>
                    </div>
                    
                    <div className="space-y-2">
                      {helpQuestion.options.map((option, index) => (
                        <label 
                          key={index}
                          className={`flex items-center p-3 rounded-lg cursor-pointer transition-all border-2 ${
                            helpResponse === option 
                              ? 'border-blue-400 bg-blue-50' 
                              : 'border-gray-200 bg-gray-50 hover:border-blue-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="helpQuestion"
                            value={option}
                            checked={helpResponse === option}
                            onChange={handleHelpChange}
                            disabled={helpAnswered}
                            className="mr-3 h-4 w-4 text-blue-600"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                    
                    <div className="flex justify-center">
                      <button
                        onClick={checkHelpAnswer}
                        disabled={!helpResponse || helpAnswered}
                        className={`px-6 py-3 rounded-lg font-bold transition-all ${
                          helpAnswered 
                            ? 'bg-green-600 cursor-not-allowed opacity-50'
                            : !helpResponse
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {helpAnswered ? '✅ Correct!' : '🔍 Check Answer'}
                      </button>
                    </div>
                    
                    {helpFeedback && (
                      <div className={`p-4 rounded-lg border-2 ${
                        helpFeedback.isCorrect 
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}>
                        <p>{helpFeedback.message}</p>
                      </div>
                    )}
                    
                    {helpAnswered && (
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6 mt-4">
                        <h3 className="text-xl font-bold text-green-800 mb-4">🧬 Population Genetics Equations Unlocked!</h3>
                        <div className="space-y-3">
                          <div className="bg-white rounded-lg p-4 border border-green-300">
                            <p className="text-lg font-mono text-gray-800"><strong>Allele frequencies:</strong> p + q = 1</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-green-300">
                            <p className="text-lg font-mono text-gray-800"><strong>Genotype frequencies:</strong> p² + 2pq + q² = 1</p>
                          </div>
                          <div className="text-sm text-green-700 mt-4">
                            <p>Use these equations to solve the population genetics problems!</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Observatory Mechanism with Help Button */}
        <div className="relative flex justify-center mb-12 door-container">
          <div className="relative">
            {/* Help Button */}
            <button
              onClick={() => setShowHelp(true)}
              className="absolute -left-32 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-6 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 border-4 border-yellow-400 hover:border-yellow-300 animate-pulse"
              style={{ fontFamily: 'Impact, "Arial Black", sans-serif', letterSpacing: '1px' }}
            >
              <div className="text-3xl mb-2">🆘</div>
              <div className="text-sm">Need Help?</div>
            </button>
            
            <svg width="500" height="700" viewBox="0 0 500 700" className="drop-shadow-2xl">
              {/* Outer Observatory Frame */}
              <rect x="30" y="30" width="440" height="640" rx="25" fill="url(#outerObservatory)" stroke="#8b5cf6" strokeWidth="8"/>
              
              {/* Inner Frame */}
              <rect x="60" y="60" width="380" height="580" rx="20" fill="url(#innerObservatory)" stroke="#7c3aed" strokeWidth="4"/>
              
              {/* Observatory Panels */}
              <rect x="80" y="100" width="340" height="520" rx="15" fill="url(#observatorySurface)"/>
              
              {/* Control Header Section */}
              <rect x="90" y="110" width="320" height="80" rx="10" fill="url(#headerObservatory)" stroke="#6d28d9" strokeWidth="2"/>
              
              {/* Observatory pattern in header */}
              <g opacity="0.4" stroke="#a78bfa" strokeWidth="1.5" fill="none">
                <circle cx="250" cy="150" r="20"/>
                <circle cx="250" cy="150" r="15"/>
                <circle cx="250" cy="150" r="10"/>
                <circle cx="250" cy="150" r="5"/>
              </g>
              
              {/* Central Vertical Display */}
              <line x1="250" y1="100" x2="250" y2="620" stroke="#7c3aed" strokeWidth="4"/>
              
              {/* Observatory Lock Positions */}
              {puzzles.map((puzzle, index) => {
                const lockY = 270 + (index * 100);
                const isAnswered = checkedAnswers[puzzle.id];
                const isCorrect = isLockSolved(puzzle.id);
                
                return (
                  <g key={puzzle.id}>
                    <circle 
                      cx="250" 
                      cy={lockY} 
                      r="35" 
                      fill="url(#lockBackground)"
                      stroke={isCorrect ? "#a78bfa" : isAnswered ? "#8b5cf6" : "#64748b"}
                      strokeWidth="3"
                      opacity="0.9"
                    />
                    
                    <circle 
                      cx="250" 
                      cy={lockY} 
                      r="25" 
                      fill={isCorrect ? "url(#solvedGlow)" : isAnswered ? "url(#partialGlow)" : "url(#lockedGlow)"}
                      stroke={isCorrect ? "#7c3aed" : isAnswered ? "#8b5cf6" : "#64748b"}
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
                      fill="#a78bfa" 
                      fontSize="14" 
                      fontFamily="Impact, Arial Black, sans-serif"
                      className="pointer-events-none"
                    >
                      {index + 1}
                    </text>
                  </g>
                );
              })}
              
              {/* Master Observatory Port */}
              {solvedCount === puzzles.length && (
                <g>
                  <ellipse cx="250" cy="580" rx="20" ry="25" fill="#a78bfa" opacity="0.9"/>
                  <rect x="243" y="590" width="14" height="25" fill="#a78bfa" opacity="0.9"/>
                </g>
              )}
              
              {/* SVG Gradients - Purple theme */}
              <defs>
                <linearGradient id="outerObservatory" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed"/>
                  <stop offset="30%" stopColor="#8b5cf6"/>
                  <stop offset="70%" stopColor="#a78bfa"/>
                  <stop offset="100%" stopColor="#7c3aed"/>
                </linearGradient>
                <linearGradient id="innerObservatory" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6d28d9"/>
                  <stop offset="50%" stopColor="#7c3aed"/>
                  <stop offset="100%" stopColor="#6b21a8"/>
                </linearGradient>
                <linearGradient id="observatorySurface" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#581c87"/>
                  <stop offset="30%" stopColor="#6b21a8"/>
                  <stop offset="70%" stopColor="#7c2d12"/>
                  <stop offset="100%" stopColor="#581c87"/>
                </linearGradient>
                <linearGradient id="headerObservatory" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6b21a8"/>
                  <stop offset="50%" stopColor="#581c87"/>
                  <stop offset="100%" stopColor="#7c3aed"/>
                </linearGradient>
                <radialGradient id="lockBackground">
                  <stop offset="0%" stopColor="#581c87"/>
                  <stop offset="100%" stopColor="#6b21a8"/>
                </radialGradient>
                <radialGradient id="solvedGlow">
                  <stop offset="0%" stopColor="#a78bfa"/>
                  <stop offset="100%" stopColor="#7c3aed"/>
                </radialGradient>
                <radialGradient id="partialGlow">
                  <stop offset="0%" stopColor="#8b5cf6"/>
                  <stop offset="100%" stopColor="#7c3aed"/>
                </radialGradient>
                <radialGradient id="lockedGlow">
                  <stop offset="0%" stopColor="#64748b"/>
                  <stop offset="100%" stopColor="#475569"/>
                </radialGradient>
              </defs>
            </svg>
            
            {/* Observatory Status Text */}
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
              <p className="text-purple-300 font-bold text-lg" style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>
                {solvedCount === puzzles.length ? 
                  "🌍 POPULATION ANALYSIS COMPLETE" : 
                  `🔬 ${puzzles.length - solvedCount} ANALYSES REMAINING`
                }
              </p>
              <p className="text-violet-400 text-sm mt-2">Click the analysis ports to examine population data</p>
            </div>
          </div>
        </div>

        {/* Active Analysis Display */}
        {activeLock && (
          <div className="mt-16" id={`puzzle-${activeLock}`}>
            {puzzles.filter(p => p.id === activeLock).map((puzzle, index) => {
              const puzzleIndex = puzzles.findIndex(p => p.id === puzzle.id);
              const hasBeenChecked = checkedAnswers[puzzle.id];
              const currentFeedback = feedback[puzzle.id];
              
              return (
                <div key={puzzle.id} className="relative">
                  <div className={`border-4 rounded-xl p-6 transition-all duration-500 ${
                    currentFeedback?.isCorrect ? 'border-purple-400 bg-gradient-to-br from-purple-900 to-purple-800 shadow-purple-400/50' :
                    hasBeenChecked ? 'border-violet-400 bg-gradient-to-br from-violet-900 to-violet-800 shadow-violet-400/50' :
                    'border-slate-400 bg-gradient-to-br from-slate-900 to-slate-800 shadow-slate-400/50'
                  } shadow-2xl`}>
                    
                    {/* Return to Observatory Button */}
                    <button
                      onClick={() => {
                        setActiveLock(null)
                        setTimeout(() => {
                          const observatoryElement = document.querySelector('.door-container')
                          if (observatoryElement) {
                            observatoryElement.scrollIntoView({ 
                              behavior: 'smooth', 
                              block: 'center',
                              inline: 'nearest'
                            })
                          }
                        }, 100)
                      }}
                      className="absolute top-4 right-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                    >
                      ⬆️ Return to Observatory
                    </button>
                    
                    {/* Analysis Symbol */}
                    <div className="flex items-start gap-4 mt-8">
                      <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold border-4 ${
                        currentFeedback?.isCorrect ? 'bg-purple-500 border-purple-300 text-white' :
                        hasBeenChecked ? 'bg-violet-500 border-violet-300 text-white' :
                        'bg-slate-600 border-slate-400 text-white'
                      }`} style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>
                        {currentFeedback?.isCorrect ? '🔓' : hasBeenChecked ? '❌' : '🔒'}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-4 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                          <span className="text-purple-400">POPULATION LOCK {puzzleIndex + 1}:</span> {puzzle.question}
                        </h3>
                        
                        {/* Answer Input - Multiple Choice */}
                        <div className="mb-4">
                          <div className="space-y-2">
                            {puzzle.options.map((option, optIndex) => (
                              <label 
                                key={optIndex}
                                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all border-2 ${
                                  responses[puzzle.id] === option 
                                    ? 'border-purple-400 bg-purple-900/30' 
                                    : 'border-slate-600 bg-slate-800/50 hover:border-purple-400/50'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={puzzle.id}
                                  value={option}
                                  checked={responses[puzzle.id] === option}
                                  onChange={(e) => handleChange(e, puzzle.id)}
                                  disabled={currentFeedback?.isCorrect}
                                  className="mr-4 h-5 w-5 text-purple-500 border-slate-400 focus:ring-purple-500"
                                />
                                <span className="text-white font-mono text-lg">{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Check Answer Button */}
                        <div className="mb-4">
                          <button
                            onClick={() => checkAnswer(puzzle.id)}
                            disabled={!responses[puzzle.id] || currentFeedback?.isCorrect}
                            className={`px-6 py-3 rounded-lg font-bold text-lg transition-all transform ${
                              currentFeedback?.isCorrect 
                                ? 'bg-purple-600 cursor-not-allowed opacity-50'
                                : !responses[puzzle.id]
                                ? 'bg-gray-600 cursor-not-allowed opacity-50'
                                : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 hover:scale-105 shadow-lg'
                            } text-white border-2 border-purple-400`}
                            style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
                          >
                            {currentFeedback?.isCorrect ? '✅ CORRECT!' : '🌍 ANALYZE POPULATION'}
                          </button>
                        </div>

                        {/* Feedback Display */}
                        {currentFeedback && (
                          <div className={`mb-4 p-4 rounded-lg border-2 ${
                            currentFeedback.isCorrect 
                              ? 'bg-purple-900 border-purple-400 text-purple-100'
                              : 'bg-violet-900 border-violet-400 text-violet-100'
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

        {/* Final Challenge Notice */}
        {solvedCount === puzzles.length && (
          <div className="mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-6">
            <div className="flex items-center justify-center">
              <span className="text-3xl mr-3">🏆</span>
              <div className="text-center">
                <h2 className="text-xl font-bold text-amber-800">Final Challenge Complete!</h2>
                <p className="text-amber-700">All population genetics analyses solved! Activate the final sequence!</p>
              </div>
            </div>
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
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-purple-400 hover:border-purple-300 transform hover:scale-105 animate-pulse'
                : 'bg-gradient-to-r from-slate-600 to-slate-700 text-slate-300 border-slate-500 cursor-not-allowed'
            }`}
            style={{ fontFamily: 'Impact, "Arial Black", sans-serif', letterSpacing: '2px' }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-white mr-4"></div>
                UNLOCKING FINAL SECRET...
              </span>
            ) : solvedCount === puzzles.length ? (
              '🏆 COMPLETE FINAL CHALLENGE'
            ) : (
              `🌍 SOLVE ${puzzles.length - solvedCount} MORE POPULATION ANALYSES`
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 font-mono text-sm">
          "Population genetics reveals the evolutionary forces that shape life..."
        </div>
      </div>
    </div>
  )
}
