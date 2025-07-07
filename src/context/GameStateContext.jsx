import { createContext, useContext, useState } from 'react'

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

  return (
    <GameContext.Provider
      value={{
        answers,
        setAnswers,
        roomUnlocked,
        setRoomUnlocked,
        finalLetter,
        setFinalLetter
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export const useGame = () => useContext(GameContext)
