import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function WordScramble() {
  const [completedGroups, setCompletedGroups] = useState([])
  const [targetWord, setTargetWord] = useState('')
  const [availableLetters, setAvailableLetters] = useState([])
  const [userGuess, setUserGuess] = useState('')
  const [attempts, setAttempts] = useState([])
  const [isCorrect, setIsCorrect] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [groupLetterMap, setGroupLetterMap] = useState({})
  const [debugInfo, setDebugInfo] = useState({})
  const [lastRefresh, setLastRefresh] = useState(null)
  const [refreshCount, setRefreshCount] = useState(0)
  const [isManualRefreshing, setIsManualRefreshing] = useState(false)

  useEffect(() => {
    loadWordScrambleData()
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      console.log('Auto-refresh triggered at', new Date().toLocaleTimeString())
      loadWordScrambleData()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const manualRefresh = async () => {
    setIsManualRefreshing(true)
    console.log('=== MANUAL REFRESH TRIGGERED ===')
    
    try {
      await loadWordScrambleData()
      setRefreshCount(prev => prev + 1)
      
      // Show a brief success indicator
      setTimeout(() => {
        setIsManualRefreshing(false)
      }, 1000)
    } catch (error) {
      console.error('Manual refresh failed:', error)
      setIsManualRefreshing(false)
    }
  }

  const loadWordScrambleData = async () => {
    try {
      const startTime = Date.now()
      
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
        const defaultMap = {}
        // Create a basic mapping for demonstration
        const defaultLetters = 'GENETICS'.split('')
        for (let i = 1; i <= 15; i++) {
          defaultMap[i] = defaultLetters[(i - 1) % defaultLetters.length]
        }
        setGroupLetterMap(defaultMap)
        
        console.warn('No instructor settings found - using defaults')
      }

      // Load ONLY completed groups from class progress - this is the source of truth
      const classProgress = localStorage.getItem('class-letters-progress')
      let progress = []
      let rawProgressData = null
      
      if (classProgress) {
        try {
          rawProgressData = JSON.parse(classProgress)
          console.log('Raw class progress data:', rawProgressData)
          
          // Validate the data structure
          if (Array.isArray(rawProgressData)) {
            // Only include records that have all required fields
            progress = rawProgressData.filter(group => {
              const isValid = group && 
                typeof group.group === 'number' && 
                typeof group.letter === 'string' && 
                group.letter.trim() !== '' &&
                group.letter !== '?'  // Exclude incomplete records
              
              if (!isValid) {
                console.log('Filtering out invalid record:', group)
              }
              return isValid
            })
            
            console.log('Filtered valid progress:', progress)
            setCompletedGroups(progress)
            
            // Extract letters from ONLY the completed groups
            const letters = progress.map(group => group.letter.trim().toUpperCase()).filter(letter => letter)
            setAvailableLetters(letters)
            console.log('Available letters from completions:', letters)
            
          } else {
            // Invalid data structure
            console.error('Invalid class progress data structure:', rawProgressData)
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
        console.log('No class progress found in localStorage')
        setCompletedGroups([])
        setAvailableLetters([])
      }
      
      const loadTime = Date.now() - startTime
      
      // Enhanced debug info for troubleshooting
      const newDebugInfo = {
        totalGroups: Object.keys(wordSettings.groupLetters || {}).length,
        completedCount: progress.length,
        lastUpdated: new Date().toLocaleTimeString(),
        lastRefreshDuration: `${loadTime}ms`,
        hasClassProgress: !!classProgress,
        hasInstructorSettings: !!instructorSettings,
        rawProgressLength: rawProgressData ? rawProgressData.length : 0,
        validProgressLength: progress.length,
        targetWord: wordSettings.targetWord || 'GENETICS',
        availableLettersCount: availableLetters.length,
        groupLetterSample: Object.entries(wordSettings.groupLetters || {}).slice(0, 3),
        storageKeys: Object.keys(localStorage).filter(k => 
          k.includes('progress') || k.includes('letters') || k.includes('word')
        ),
        refreshCount: refreshCount
      }
      
      setDebugInfo(newDebugInfo)
      setLastRefresh(new Date())
      setIsLoading(false)
      
      console.log('=== WORD SCRAMBLE DATA LOADED ===')
      console.log('Debug info:', newDebugInfo)
      
    } catch (error) {
      console.error('Error loading word scramble data:', error)
      setDebugInfo({
        error: error.message,
        lastUpdated: new Date().toLocaleTimeString(),
        refreshCount: refreshCount
      })
      setIsLoading(false)
    }
  }

  // Add the current student's letter if they completed all rooms
  const addMyLetter = () => {
    // Get current student info
    const studentInfoStr = localStorage.getItem('current-student-info')
    if (!studentInfoStr) {
      alert('❌ No student information found. Please complete the student info form first.')
      return
    }

    let studentInfo
    try {
      studentInfo = JSON.parse(studentInfoStr)
    } catch (error) {
      alert('❌ Error reading student information. Please restart the game.')
      return
    }

    if (!studentInfo.groupNumber) {
      alert('❌ No group number found in student information.')
      return
    }

    const groupNumber = parseInt(studentInfo.groupNumber)
    const assignedLetter = groupLetterMap[groupNumber]
    
    if (!assignedLetter) {
      alert(`❌ No letter assigned to group ${groupNumber}. Please contact your instructor.`)
      return
    }

    // Check current progress
    const currentProgress = JSON.parse(localStorage.getItem('class-letters-progress') || '[]')
    
    // Check if this group already has a completion record
    const existingRecord = currentProgress.find(p => p.group === groupNumber)
    if (existingRecord) {
      alert(`✅ Group ${groupNumber} letter "${existingRecord.letter}" is already unlocked!\n\nCompleted by: ${existingRecord.studentName}\nTime: ${new Date(existingRecord.completedAt).toLocaleString()}`)
      return
    }
    
    // Add the completion record
    const newCompletion = {
      group: groupNumber,
      letter: assignedLetter,
      completedAt: new Date().toISOString(),
      studentName: studentInfo.name,
      sessionId: studentInfo.sessionId || `manual-${Date.now()}`,
      addedManually: true // Flag to indicate this was added manually vs automatic completion
    }
    
    currentProgress.push(newCompletion)
    localStorage.setItem('class-letters-progress', JSON.stringify(currentProgress))
    
    console.log('Added student completion:', newCompletion)
    
    // Show success message
    alert(`🎉 Success! Your group's letter "${assignedLetter}" has been unlocked!\n\nGroup ${groupNumber}: ${studentInfo.name}\nLetter: ${assignedLetter}`)
    
    // Refresh the display
    manualRefresh()
  }

  // Get current student info for UI purposes
  const getCurrentStudentInfo = () => {
    const studentInfoStr = localStorage.getItem('current-student-info')
    if (!studentInfoStr) return null
    
    try {
      return JSON.parse(studentInfoStr)
    } catch (error) {
      return null
    }
  }

  const currentStudent = getCurrentStudentInfo()

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
    console.log('Success broadcasted:', successData)
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

  const getTotalExpectedLetters = () => {
    if (!targetWord) return 0
    // Count letters only (not spaces or punctuation)
    return targetWord.replace(/[^A-Za-z]/g, '').length
  }

  const getWordStats = () => {
    if (!targetWord) return { letterCount: 0, wordCount: 0 }
    
    // Count total letters (excluding spaces and punctuation)
    const letterCount = targetWord.replace(/[^A-Za-z]/g, '').length
    
    // Count words (split by spaces and filter out empty strings)
    const wordCount = targetWord.trim().split(/\s+/).filter(word => word.length > 0).length
    
    return { letterCount, wordCount }
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

  const wordStats = getWordStats()

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
          
          {/* Word Stats */}
          <div className="mt-4 bg-white bg-opacity-10 rounded-lg p-4 inline-block">
            <h3 className="text-white font-bold mb-2">🎯 Target Challenge</h3>
            <div className="flex gap-6 justify-center text-white">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">{wordStats.letterCount}</div>
                <div className="text-sm text-blue-200">Letters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-300">{wordStats.wordCount}</div>
                <div className="text-sm text-blue-200">Word{wordStats.wordCount !== 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Refresh Controls */}
        <div className="mb-6 bg-gradient-to-r from-blue-800 to-purple-800 rounded-lg p-4 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h3 className="font-bold text-lg">📊 Live Progress Tracking</h3>
              <p className="text-sm text-blue-200">
                Last updated: {lastRefresh ? lastRefresh.toLocaleTimeString() : 'Never'} 
                {debugInfo.lastRefreshDuration && ` (${debugInfo.lastRefreshDuration})`}
              </p>
              <p className="text-xs text-blue-300">
                Auto-refresh every 5 seconds • Manual refreshes: {refreshCount}
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={manualRefresh}
                disabled={isManualRefreshing}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  isManualRefreshing 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 transform hover:scale-105'
                } text-white shadow-lg`}
              >
                {isManualRefreshing ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Refreshing...
                  </span>
                ) : (
                  '🔄 Reload Class Progress'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Student's Letter Addition */}
        {currentStudent && (
          <div className="mb-6 bg-gradient-to-r from-green-700 to-emerald-700 rounded-lg p-6 text-white">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <h3 className="font-bold text-xl mb-2">🎓 Welcome, {currentStudent.name}!</h3>
                <p className="text-green-200">
                  You completed all 4 rooms as <strong>Group {currentStudent.groupNumber}</strong>
                </p>
                <p className="text-sm text-green-300 mt-1">
                  {(() => {
                    const groupNumber = parseInt(currentStudent.groupNumber)
                    const existingRecord = completedGroups.find(p => p.group === groupNumber)
                    const assignedLetter = groupLetterMap[groupNumber]
                    
                    if (existingRecord) {
                      return `✅ Your group's letter "${existingRecord.letter}" is already unlocked! (Added by ${existingRecord.studentName})`
                    } else if (assignedLetter) {
                      return `🔤 Your group's letter "${assignedLetter}" is ready to be unlocked!`
                    } else {
                      return `⚠️ No letter assigned to your group. Contact your instructor.`
                    }
                  })()}
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                {(() => {
                  const groupNumber = parseInt(currentStudent.groupNumber)
                  const existingRecord = completedGroups.find(p => p.group === groupNumber)
                  const assignedLetter = groupLetterMap[groupNumber]
                  
                  if (existingRecord) {
                    return (
                      <div className="text-center">
                        <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold">
                          ✅ Letter Already Added
                        </div>
                        <div className="text-sm text-green-200 mt-1">
                          Added {new Date(existingRecord.completedAt).toLocaleString()}
                        </div>
                      </div>
                    )
                  } else if (assignedLetter) {
                    return (
                      <button
                        onClick={addMyLetter}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-xl font-bold text-lg shadow-lg transform hover:scale-105 transition-all"
                      >
                        🎯 Add My Letter "{assignedLetter}"
                      </button>
                    )
                  } else {
                    return (
                      <div className="bg-red-500 text-white px-4 py-2 rounded-lg">
                        ⚠️ No Letter Assigned
                      </div>
                    )
                  }
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Debug Info Panel */}
        <div className="mb-6 bg-gray-800 bg-opacity-50 rounded-lg p-4 text-sm text-gray-300">
          <h3 className="font-bold text-white mb-2">📊 System Status</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-yellow-400 font-semibold">Target Word:</div>
              <div className="font-mono">{debugInfo.targetWord || 'Not set'}</div>
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
              <div className="text-purple-400 font-semibold">Data Sources:</div>
              <div>
                {debugInfo.hasInstructorSettings ? '✅' : '❌'} Settings | {debugInfo.hasClassProgress ? '✅' : '❌'} Progress
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-400 space-y-1">
            <div><strong>Available Letters:</strong> [{availableLetters.join(', ')}]</div>
            <div><strong>Progress Records:</strong> {debugInfo.rawProgressLength || 0} raw → {debugInfo.validProgressLength || 0} valid</div>
            <div><strong>Storage Keys:</strong> {debugInfo.storageKeys?.join(', ') || 'None'}</div>
            {debugInfo.error && (
              <div className="text-red-400"><strong>Error:</strong> {debugInfo.error}</div>
            )}
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
        <div className="mb-8 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-8 shadow-2xl border-4 border-yellow-300">
          <h2 className="text-4xl font-bold text-white mb-6 text-center drop-shadow-lg" 
              style={{ fontFamily: 'Impact, "Arial Black", sans-serif', letterSpacing: '2px' }}>
            🔤 UNLOCKED LETTERS
          </h2>
          <div className="flex justify-center">
            {availableLetters.length > 0 ? (
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                {availableLetters.map((letter, index) => (
                  <div
                    key={index}
                    className="w-20 h-20 bg-gradient-to-br from-white to-gray-100 rounded-2xl flex items-center justify-center text-4xl font-bold text-gray-800 shadow-lg border-4 border-white transform hover:scale-105 transition-transform duration-200"
                    style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
                  >
                    {letter}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-white">
                <div className="text-8xl mb-4">⏳</div>
                <p className="text-2xl font-bold mb-2">Waiting for groups to complete Room 4...</p>
                <p className="text-lg text-yellow-100">
                  Letters will appear here automatically as groups finish their challenges
                </p>
                <p className="text-sm text-yellow-200 mt-4">
                  💡 Try the "🔄 Reload Class Progress" button to check for updates manually
                </p>
              </div>
            )}
          </div>
          
          {/* Progress info without revealing target */}
          <div className="mt-6 text-center text-white text-lg">
            <div className="bg-black bg-opacity-30 rounded-xl p-4 inline-block">
              <div className="font-bold text-yellow-200">
                📊 Progress: {availableLetters.length} letters unlocked
              </div>
              <div className="text-yellow-100 text-sm mt-1">
                Groups completed: {completedGroups.length} / {Object.keys(groupLetterMap).length}
              </div>
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
              const actualLetter = isCompleted ? completionRecord.letter : assignedLetter
              
              return (
                <div
                  key={groupNum}
                  className={`p-3 rounded-lg text-center transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-green-500 text-white transform scale-105' 
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  <div className="font-bold">Group {groupNum}</div>
                  <div className="text-2xl font-bold mt-1">
                    {isCompleted ? actualLetter : '?'}
                  </div>
                  <div className="text-xs mt-1">
                    {isCompleted ? (
                      <div>
                        <div>✅ Complete</div>
                        <div className="text-xs text-green-200">
                          {completionRecord.studentName?.split(' ')[0] || 'Student'}
                        </div>
                        <div className="text-xs text-green-200">
                          {new Date(completionRecord.completedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div>⏳ In Progress</div>
                        <div className="text-xs text-gray-400">
                          Will get: {assignedLetter}
                        </div>
                      </div>
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

            {/* Can Form Word Check - without revealing target */}
            {targetWord && availableLetters.length > 0 && (
              <div className="mt-4 text-center">
                {canFormWord(availableLetters, targetWord.replace(/[^A-Za-z]/g, '')) ? (
                  <div className="text-green-300 text-sm">
                    ✅ You have enough letters to solve the puzzle!
                  </div>
                ) : (
                  <div className="text-orange-300 text-sm">
                    ⏳ Need more groups to complete Room 4... ({availableLetters.length} letters available)
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
              <li>• <strong>Manual refresh:</strong> Click "🔄 Reload Class Progress" to check for new completions</li>
              <li>• <strong>Auto-refresh:</strong> Page updates automatically every 5 seconds</li>
              <li>• <strong>Add your letter:</strong> Click "Add My Letter" if you completed all rooms</li>
              <li>• <strong>Class collaboration:</strong> Work together to solve the final word puzzle</li>
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
