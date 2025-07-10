import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function WordScramble() {
  const [completedGroups, setCompletedGroups] = useState([])
  const [targetWord, setTargetWord] = useState('')
  const [availableLetters, setAvailableLetters] = useState([])
  const [userGuess, setUserGuess] = useState('')
  const [attempts, setAttempts] = useState([])
  const [isCorrect, setIsCorrect] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [groupLetterMap, setGroupLetterMap] = useState({})
  const [debugInfo, setDebugInfo] = useState({}) // For debugging

  useEffect(() => {
    loadWordScrambleData()
    const interval = setInterval(loadWordScrambleData, 3000) // Refresh every 3 seconds
    return () => clearInterval(interval)
  }, [])

  const loadWordScrambleData = () => {
    try {
      // Load target word and group assignments from instructor settings
      const instructorSettings = localStorage.getItem('instructor-word-settings')
      let wordSettings = {}
      
      if (instructorSettings) {
        wordSettings = JSON.parse(instructorSettings)
        setTargetWord(wordSettings.targetWord || 'GENETICS') // Default fallback
        setGroupLetterMap(wordSettings.groupLetters || {})
      } else {
        // Default settings if instructor hasn't configured anything
        setTargetWord('GENETICS')
        setGroupLetterMap({
          1: 'G', 2: 'E', 3: 'N', 4: 'E', 5: 'T', 6: 'I', 7: 'C', 8: 'S'
        })
      }

      // Load ONLY completed groups from class progress - this is the source of truth
      const classProgress = localStorage.getItem('class-letters-progress')
      let progress = []
      
      if (classProgress) {
        try {
          progress = JSON.parse(classProgress)
          // Validate the data structure
          if (Array.isArray(progress)) {
            // Only include records that have all required fields
            progress = progress.filter(group => 
              group && 
              typeof group.group === 'number' && 
              typeof group.letter === 'string' && 
              group.letter.trim() !== ''
            )
            setCompletedGroups(progress)
            
            // Extract letters from ONLY the completed groups
            const letters = progress.map(group => group.letter.trim().toUpperCase()).filter(letter => letter)
            setAvailableLetters(letters)
          } else {
            // Invalid data structure
            setCompletedGroups([])
            setAvailableLetters([])
          }
        } catch (error) {
          console.error('Error parsing class progress:', error)
          setCompletedGroups([])
          setAvailableLetters([])
        }
      } else {
        // No completions yet
        setCompletedGroups([])
        setAvailableLetters([])
      }
      
      // Set debug info for troubleshooting
      setDebugInfo({
        totalGroups: Object.keys(wordSettings.groupLetters || {}).length,
        completedCount: progress.length,
        lastUpdated: new Date().toLocaleTimeString(),
        hasClassProgress: !!classProgress,
        hasInstructorSettings: !!instructorSettings
      })
      
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading word scramble data:', error)
      setDebugInfo({
        error: error.message,
        lastUpdated: new Date().toLocaleTimeString()
      })
      setIsLoading(false)
    }
  }

  const handleGuessSubmit = (e) => {
    e.preventDefault()
    if (!userGuess.trim() || isCorrect) return

    const guess = userGuess.trim().toUpperCase()
    const target = targetWord.toUpperCase()
    
    const newAttempt = {
      guess: guess,
      isCorrect: guess === target,
      timestamp: new Date().toISOString()
    }
    
    setAttempts(prev => [newAttempt, ...prev])
    
    if (guess === target) {
      setIsCorrect(true)
      // Broadcast success to all students
      broadcastSuccess()
    }
    
    setUserGuess('')
  }

  const broadcastSuccess = () => {
    // Save success state to localStorage so all students can see it
    const successData = {
      solved: true,
      solvedAt: new Date().toISOString(),
      targetWord: targetWord,
      solvedBy: 'class' // Could be enhanced to track who solved it
    }
    localStorage.setItem('word-scramble-success', JSON.stringify(successData))
  }

  // Check if puzzle has been solved by anyone
  useEffect(() => {
    const checkSolvedStatus = () => {
      const successData = localStorage.getItem('word-scramble-success')
      if (successData) {
        try {
          const data = JSON.parse(successData)
          if (data.solved && data.targetWord === targetWord) {
            setIsCorrect(true)
          }
        } catch (error) {
          console.error('Error parsing success data:', error)
        }
      }
    }
    
    checkSolvedStatus()
    const interval = setInterval(checkSolvedStatus, 2000)
    return () => clearInterval(interval)
  }, [targetWord])

  const getLetterFrequency = (letters) => {
    const frequency = {}
    letters.forEach(letter => {
      frequency[letter] = (frequency[letter] || 0) + 1
    })
    return frequency
  }

  const canFormWord = (letters, word) => {
    if (!word || !letters.length) return false
    
    const letterFreq = getLetterFrequency(letters)
    const wordFreq = getLetterFrequency(word.split(''))
    
    return Object.entries(wordFreq).every(([letter, count]) => 
      letterFreq[letter] >= count
    )
  }

  const getHint = () => {
    if (!targetWord) return "No hint available"
    
    const hints = [
      `The word has ${targetWord.length} letters`,
      `The word starts with "${targetWord[0]}"`,
      `The word is related to the study of heredity and variation`,
      `The word ends with "${targetWord[targetWord.length - 1]}"`,
      `The word contains these letters: ${targetWord.split('').slice(0, Math.ceil(targetWord.length / 2)).join(', ')}`
    ]
    
    return hints[Math.min(attempts.length, hints.length - 1)]
  }

  const getTotalExpectedLetters = () => {
    if (!targetWord) return 0
    // Count letters only (not spaces or punctuation)
    return targetWord.replace(/[^A-Za-z]/g, '').length
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading word scramble...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400" 
              style={{ fontFamily: 'Impact, "Arial Black", sans-serif', letterSpacing: '3px' }}>
            🧩 CLASS WORD SCRAMBLE CHALLENGE
          </h1>
          <div className="h-1 w-48 mx-auto bg-gradient-to-r from-yellow-400 to-purple-400 mb-4 animate-pulse"></div>
          <p className="text-blue-200 text-lg">
            Real-time tracking: Only groups that complete Room 4 contribute letters!
          </p>
        </div>

        {/* Debug Info Panel (for instructors) */}
        <div className="mb-6 bg-gray-800 bg-opacity-50 rounded-lg p-4 text-sm text-gray-300">
          <h3 className="font-bold text-white mb-2">📊 Real-time Status & Debugging</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-yellow-400 font-semibold">Target Word:</div>
              <div>{debugInfo.targetWord || 'Not set'}</div>
            </div>
            <div>
              <div className="text-blue-400 font-semibold">Groups Completed:</div>
              <div>{debugInfo.completedCount || 0} / {debugInfo.totalGroups || 0}</div>
            </div>
            <div>
              <div className="text-green-400 font-semibold">Letters Available:</div>
              <div>{availableLetters.length} / {getTotalExpectedLetters()}</div>
            </div>
            <div>
              <div className="text-purple-400 font-semibold">Last Updated:</div>
              <div>{debugInfo.lastUpdated || 'Never'}</div>
            </div>
          </div>
          
          {/* Additional debug info */}
          <div className="mt-3 pt-3 border-t border-gray-600">
            <div className="text-gray-400 text-xs">
              <div>Config Status: {debugInfo.hasInstructorSettings ? '✅' : '❌'} Settings | {debugInfo.hasClassProgress ? '✅' : '❌'} Progress</div>
              {debugInfo.groupLetterSample && (
                <div>Sample assignments: {debugInfo.groupLetterSample.map(([g,l]) => `${g}→${l}`).join(', ')}</div>
              )}
              <div>Available letters: [{availableLetters.join(', ')}]</div>
            </div>
          </div>
          
          {debugInfo.error && (
            <div className="mt-2 text-red-400">Error: {debugInfo.error}</div>
          )}
          
          {/* Quick fix button for instructors */}
          <div className="mt-3 pt-3 border-t border-gray-600">
            <button
              onClick={() => {
                if (confirm('Clear all word scramble progress data? This will reset the challenge.')) {
                  localStorage.removeItem('class-letters-progress');
                  localStorage.removeItem('word-scramble-success');
                  loadWordScrambleData();
                  alert('Word scramble data cleared!');
                }
              }}
              className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              🗑️ Clear Progress (Instructor)
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {isCorrect && (
          <div className="mb-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-8 text-center shadow-2xl">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold mb-4">PUZZLE SOLVED!</h2>
            <p className="text-2xl mb-4">The answer is: <span className="font-bold text-yellow-300">{targetWord.toUpperCase()}</span></p>
            <p className="text-lg text-green-100">
              Congratulations to everyone who worked together to solve this challenge!
            </p>
          </div>
        )}

        {/* Available Letters Display - ONLY from real completions */}
        <div className="mb-8 bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur-lg">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">🔤 Letters from Completed Groups</h2>
          <div className="flex justify-center">
            {availableLetters.length > 0 ? (
              <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                {availableLetters.map((letter, index) => (
                  <div
                    key={index}
                    className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                  >
                    {letter}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-blue-200">
                <div className="text-4xl mb-2">⏳</div>
                <p className="text-lg">Waiting for groups to complete Room 4...</p>
                <p className="text-sm mt-2 text-blue-300">
                  Letters will appear here automatically as groups finish their challenges
                </p>
              </div>
            )}
          </div>
          
          {/* Real-time progress info */}
          <div className="mt-4 text-center text-blue-200 text-sm space-y-1">
            <div>
              Target word needs: {getTotalExpectedLetters()} letters | 
              Available now: {availableLetters.length} letters
            </div>
            <div>
              Groups completed: {completedGroups.length} | 
              Total groups: {Object.keys(groupLetterMap).length}
            </div>
          </div>
        </div>

        {/* Completed Groups Progress - Only show REAL completions */}
        <div className="mb-8 bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur-lg">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">👥 Real Group Progress (Live Updates)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(groupLetterMap).map(([groupNum, assignedLetter]) => {
              const completionRecord = completedGroups.find(group => group.group === parseInt(groupNum))
              const isCompleted = !!completionRecord
              return (
                <div
                  key={groupNum}
                  className={`p-3 rounded-lg text-center ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  <div className="font-bold">Group {groupNum}</div>
                  <div className="text-2xl font-bold mt-1">
                    {isCompleted ? assignedLetter : '?'}
                  </div>
                  <div className="text-xs mt-1">
                    {isCompleted ? (
                      <div>
                        <div>✅ Complete</div>
                        <div className="text-xs text-green-200">
                          {completionRecord.studentName?.split(' ')[0] || 'Student'}
                        </div>
                      </div>
                    ) : (
                      '⏳ In Progress'
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Word Guessing Section */}
        {availableLetters.length > 0 && !isCorrect && (
          <div className="mb-8 bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur-lg">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">🎯 Make Your Guess</h2>
            
            <form onSubmit={handleGuessSubmit} className="max-w-md mx-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userGuess}
                  onChange={(e) => setUserGuess(e.target.value.toUpperCase())}
                  placeholder="Enter your guess..."
                  className="flex-1 px-4 py-3 rounded-lg text-black text-lg font-bold text-center border-2 border-purple-300 focus:outline-none focus:border-yellow-400"
                  disabled={isCorrect}
                />
                <button
                  type="submit"
                  disabled={!userGuess.trim() || isCorrect}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all disabled:opacity-50"
                >
                  Guess!
                </button>
              </div>
            </form>

            {/* Hint System */}
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-yellow-300 hover:text-yellow-400 text-sm underline"
              >
                {showHint ? 'Hide Hint' : 'Need a hint?'}
              </button>
              
              {showHint && (
                <div className="mt-2 bg-yellow-900 bg-opacity-50 rounded-lg p-3 text-yellow-200">
                  💡 {getHint()}
                </div>
              )}
            </div>

            {/* Can Form Word Check */}
            {targetWord && availableLetters.length > 0 && (
              <div className="mt-4 text-center">
                {canFormWord(availableLetters, targetWord.replace(/[^A-Za-z]/g, '')) ? (
                  <div className="text-green-300 text-sm">
                    ✅ You have enough letters to form the target word!
                  </div>
                ) : (
                  <div className="text-orange-300 text-sm">
                    ⏳ Need more groups to complete Room 4... ({availableLetters.length}/{getTotalExpectedLetters()} letters available)
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Previous Attempts */}
        {attempts.length > 0 && (
          <div className="mb-8 bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur-lg">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">📝 Class Attempts</h2>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {attempts.slice(0, 10).map((attempt, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg flex justify-between items-center ${
                    attempt.isCorrect 
                      ? 'bg-green-600 text-white' 
                      : 'bg-red-600 text-white'
                  }`}
                >
                  <span className="font-bold">{attempt.guess}</span>
                  <span>{attempt.isCorrect ? '✅ Correct!' : '❌ Try again'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {!isCorrect && (
          <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
            <h2 className="text-xl font-bold mb-3">📚 How It Works</h2>
            <ul className="space-y-2 text-sm">
              <li>• <strong>Real tracking:</strong> Only groups that complete all 4 rooms contribute letters</li>
              <li>• <strong>Live updates:</strong> This page updates automatically as groups finish</li>
              <li>• <strong>No fake data:</strong> Letters only appear when Room 4 is actually completed</li>
              <li>• <strong>Class collaboration:</strong> Work together to solve the final word puzzle</li>
              <li>• <strong>Immediate notification:</strong> Everyone sees the solution when it's found</li>
            </ul>
          </div>
        )}

        {/* Navigation */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <span className="mr-2">🏠</span>
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
