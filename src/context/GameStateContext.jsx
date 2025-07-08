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
      } catch (e) {
        console.log('Could not load saved progress')
      }
    }
  }, [])

  // Save progress to localStorage whenever state changes
  useEffect(() => {
    const progressData = {
      roomUnlocked,
      finalLetter,
      currentProgress
    }
    localStorage.setItem('genetics-escape-progress', JSON.stringify(progressData))
  }, [roomUnlocked, finalLetter, currentProgress])

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
    localStorage.removeItem('genetics-escape-progress')
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
