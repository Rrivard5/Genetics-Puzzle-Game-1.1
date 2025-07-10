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

  useEffect(() => {
    loadWordScrambleData()
    const interval = setInterval(loadWordScrambleData, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const loadWordScrambleData = () => {
    try {
      // Load target word and group assignments from instructor settings
      const instructorSettings = localStorage.getItem('instructor-word-settings')
      if (instructorSettings) {
        const settings = JSON.parse(instructorSettings)
        setTargetWord(settings.targetWord || '')
        setGroupLetterMap(settings.groupLetters || {})
      }

      // Load completed groups from class progress
      const classProgress = localStorage.getItem('class-letters-progress')
      if (classProgress) {
        const progress = JSON.parse(classProgress)
        setCompletedGroups(progress)
        
        // Extract available letters from completed groups only
        const letters = progress.map(group => group.letter).filter(letter => letter)
        setAvailableLetters(letters)
      } else {
        setCompletedGroups([])
        setAvailableLetters([])
      }
      
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading word scramble data:', error)
      setIsLoading(false)
    }
  }

  const handleGuessSubmit = (e) => {
    e.preventDefault()
    if (!userGuess.trim()) return

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
      targetWord: targetWord
    }
    localStorage.setItem('word-scramble-success', JSON.stringify(successData))
  }

  // Check if puzzle has been solved by anyone
  useEffect(() => {
    const checkSolvedStatus = () => {
      const successData = localStorage.getItem('word-scramble-success')
      if (successData) {
        const data = JSON.parse(successData)
        if (data.solved) {
          setIsCorrect(true)
        }
      }
    }
    
    checkSolvedStatus()
    const interval = setInterval(checkSolvedStatus, 2000)
    return () => clearInterval(interval)
  }, [])

  const getLetterFrequency = (letters) => {
    const frequency = {}
    letters.forEach(letter => {
      frequency[letter] = (frequency[letter] || 0) + 1
    })
    return frequency
  }

  const canFormWord = (letters, word) => {
    const letterFreq = getLetterFrequency(letters)
    const wordFreq = getLetterFrequency(word.split(''))
    
    return Object.entries(wordFreq).every(([letter, count]) => 
      letterFreq[letter] >= count
    )
  }

  const getHint = () => {
    if (!targetWord) return "No hint available"
    
    const hints = [
      `The target has ${targetWord.length} characters`,
      `The target starts with "${targetWord[0]}"`,
      `The target is related to the study of heredity and variation`,
      `The target ends with "${targetWord[targetWord.length - 1]}"`,
      `The target contains the letters: ${targetWord.split('').slice(0, Math.ceil(targetWord.length / 2)).join(', ')}`
    ]
    
    return hints[Math.min(attempts.length, hints.length - 1)]
  }

  const countWords = (text) => {
    if (!text) return 0
    return text.trim().split(/\s+/).length
  }

  const getUniqueLettersCount = (letters) => {
    return new Set(letters.filter(letter => letter && letter.trim())).size
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
            🧩 WORD SCRAMBLE CHALLENGE
          </h1>
          <div className="h-1 w-48 mx-auto bg-gradient-to-r from-yellow-400 to-purple-400 mb-4 animate-pulse"></div>
          <p className="text-blue-200 text-lg">
            Unscramble the letters to reveal the final genetics secret!
          </p>
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

        {/* Available Letters Display */}
        <div className="mb-8 bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur-lg">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">🔤 Available Letters</h2>
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
                <p>Waiting for groups to complete their challenges...</p>
              </div>
            )}
          </div>
          
          {/* Updated letter count information */}
          {availableLetters.length > 0 && (
            <div className="mt-4 text-center text-blue-200 text-sm space-y-1">
              <div>
                Total letters: {getTotalExpectedLetters()} | 
                Letters unlocked so far: {availableLetters.length}
              </div>
              {targetWord && (
                <div>
                  Number of words in target: {countWords(targetWord)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Completed Groups Progress */}
        <div className="mb-8 bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur-lg">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">👥 Group Progress</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(groupLetterMap).map(([groupNum, letter]) => {
              const isCompleted = completedGroups.some(group => group.group === parseInt(groupNum))
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
                    {isCompleted ? letter : '?'}
                  </div>
                  <div className="text-xs mt-1">
                    {isCompleted ? '✅ Complete' : '⏳ In Progress'}
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
                    ✅ You have enough letters to form the target!
                  </div>
                ) : (
                  <div className="text-orange-300 text-sm">
                    ⏳ Waiting for more groups to complete... ({availableLetters.length}/{getTotalExpectedLetters()} letters available)
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Previous Attempts */}
        {attempts.length > 0 && (
          <div className="mb-8 bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur-lg">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">📝 Previous Attempts</h2>
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
            <h2 className="text-xl font-bold mb-3">📚 How to Play</h2>
            <ul className="space-y-2 text-sm">
              <li>• Each group that completes all 4 rooms contributes one letter</li>
              <li>• Use the available letters to form a word or phrase related to genetics</li>
              <li>• Work together as a class to solve the final puzzle</li>
              <li>• The page updates automatically as more groups finish</li>
              <li>• Once solved, everyone will see the solution!</li>
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
