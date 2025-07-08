import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'
import puzzles from '../data/puzzlesRoom1.json'

export default function Room1() {
  const [responses, setResponses] = useState({})
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showHint, setShowHint] = useState({})
  const navigate = useNavigate()
  const { setRoomUnlocked, setCurrentProgress } = useGame()

  const handleChange = (e, id) => {
    setResponses({ ...responses, [id]: e.target.value })
    if (error) setError(null)
  }

  const toggleHint = (puzzleId) => {
    setShowHint(prev => ({ ...prev, [puzzleId]: !prev[puzzleId] }))
  }

  const handleSubmit = async () => {
    const unanswered = puzzles.find(p => !responses[p.id])
    if (unanswered) {
      setError('Please answer all questions before submitting.')
      return
    }

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const allCorrect = puzzles.every(p => p.answer === responses[p.id])
    
    if (allCorrect) {
      setRoomUnlocked(prev => ({ ...prev, room1: true }))
      setCurrentProgress(25)
      navigate('/room2')
    } else {
      setError('Unfortunately, the code you put into the door was incorrect and the door does not budge when you push on it. Check your answers and try again. Remember, you can ask for a hint.')
    }
    
    setIsSubmitting(false)
  }

  const answeredCount = Object.keys(responses).length
  const progressPercentage = (answeredCount / puzzles.length) * 100

  return (
    <div className="max-w-4xl mx-auto">
      {/* Room Header with Jungle Theme */}
      <div className="relative bg-gradient-to-r from-green-800 via-green-700 to-green-900 text-white rounded-2xl p-8 mb-8 shadow-2xl overflow-hidden">
        {/* Jungle Pattern Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-800"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(34,197,94,0.3),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.3),transparent_50%)]"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">🧩 Room 1 - Puzzle 1</h1>
            <p className="text-xl text-green-100">Molecular Genetics Temple</p>
            <p className="text-sm text-green-200 mt-2">Unmutated Allele: 3'CGACGATACG<span className="bg-yellow-400 text-black px-1 rounded font-bold">G</span>AGGGGTCACTCCT5'</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-green-200">Progress</div>
            <div className="text-2xl font-bold">{answeredCount}/{puzzles.length}</div>
          </div>
        </div>
        
        <div className="relative z-10 mt-6 bg-green-900 bg-opacity-50 rounded-full h-3">
          <div 
            className="bg-yellow-400 rounded-full h-3 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
