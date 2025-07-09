import { createContext, useContext, useState, useEffect } from 'react'

const GameContext = createContext()

export const GameProvider = ({ children }) => {
  const [answers, setAnswers] = useState({})
  const [roomUnlocked, setRoomUnlocked] = useState({
    room1: false,
    room2: false,
    room3: false,
    room4: false
  })
  const [finalLetter, setFinalLetter] = useState(null)
  const [currentProgress, setCurrentProgress] = useState(0)
  const [studentInfo, setStudentInfo] = useState(null)
  const [attemptTracking, setAttemptTracking] = useState({})
  const [roomTimers, setRoomTimers] = useState({})

  // Load saved progress from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('genetics-escape-progress')
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress)
        setRoomUnlocked(parsed.roomUnlocked || {
          room1: false,
          room2: false,
          room3: false,
          room4: false
        })
        setFinalLetter(parsed.finalLetter || null)
        setCurrentProgress(parsed.currentProgress || 0)
        setAttemptTracking(parsed.attemptTracking || {})
        setRoomTimers(parsed.roomTimers || {})
      } catch (e) {
        console.log('Could not load saved progress')
      }
    }

    // Load student info
    const savedStudentInfo = localStorage.getItem('current-student-info')
    if (savedStudentInfo) {
      try {
        setStudentInfo(JSON.parse(savedStudentInfo))
      } catch (e) {
        console.log('Could not load student info')
      }
    }
  }, [])

  // Save progress to localStorage whenever state changes
  useEffect(() => {
    if (studentInfo) { // Only save if we have student info
      const progressData = {
        roomUnlocked,
        finalLetter,
        currentProgress,
        attemptTracking,
        roomTimers
      }
      localStorage.setItem('genetics-escape-progress', JSON.stringify(progressData))
    }
  }, [roomUnlocked, finalLetter, currentProgress, attemptTracking, roomTimers, studentInfo])

  // Track question attempts
  const trackAttempt = (roomId, questionId, answer, isCorrect) => {
    if (!studentInfo) return // Don't track if no student info

    const timestamp = new Date().toISOString()
    const attemptKey = `${roomId}-${questionId}`
    
    setAttemptTracking(prev => ({
      ...prev,
      [attemptKey]: [
        ...(prev[attemptKey] || []),
        {
          answer,
          isCorrect,
          timestamp,
          attemptNumber: (prev[attemptKey] || []).length + 1
        }
      ]
    }))

    // Also save to instructor data
    saveStudentDataToInstructor(roomId, questionId, answer, isCorrect, timestamp)
  }

  // Track room completion times
  const startRoomTimer = (roomId) => {
    setRoomTimers(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        startTime: new Date().toISOString()
      }
    }))
  }

  const completeRoom = (roomId) => {
    const completionTime = new Date().toISOString()
    setRoomTimers(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        endTime: completionTime,
        duration: prev[roomId]?.startTime ? 
          new Date(completionTime) - new Date(prev[roomId].startTime) : 0
      }
    }))
  }

  // Save student data to instructor storage
  const saveStudentDataToInstructor = (roomId, questionId, answer, isCorrect, timestamp) => {
    if (!studentInfo) return

    const instructorData = JSON.parse(localStorage.getItem('instructor-student-data') || '[]')
    
    const studentRecord = {
      sessionId: studentInfo.sessionId,
      name: studentInfo.name,
      semester: studentInfo.semester,
      year: studentInfo.year,
      groupNumber: studentInfo.groupNumber,
      roomId,
      questionId,
      answer,
      isCorrect,
      timestamp,
      attemptNumber: (attemptTracking[`${roomId}-${questionId}`] || []).length + 1
    }

    instructorData.push(studentRecord)
    localStorage.setItem('instructor-student-data', JSON.stringify(instructorData))
  }

  const resetGame = () => {
    setAnswers({})
    setRoomUnlocked({
      room1: false,
      room2: false,
      room3: false,
      room4: false
    })
    setFinalLetter(null)
    setCurrentProgress(0)
    setAttemptTracking({})
    setRoomTimers({})
    setStudentInfo(null)
    localStorage.removeItem('genetics-escape-progress')
    localStorage.removeItem('current-student-info')
  }

  return (
    <GameContext.Provider
      value={{
        answers,
        setAnswers,
        roomUnlocked,
        setRoomUnlocked,
        finalLetter,
        setFinalLetter,
        currentProgress,
        setCurrentProgress,
        studentInfo,
        setStudentInfo,
        attemptTracking,
        roomTimers,
        trackAttempt,
        startRoomTimer,
        completeRoom,
        resetGame
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
