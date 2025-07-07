import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'
import puzzles from '../data/puzzlesRoom1.json'

export default function Room1() {
  const [responses, setResponses] = useState({})
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { setRoomUnlocked } = useGame()

  const handleChange = (e, id) => {
    setResponses({ ...responses, [id]: e.target.value })
  }

  const handleSubmit = () => {
    const allCorrect = puzzles.every(p => p.answer === responses[p.id])
    if (allCorrect) {
      setRoomUnlocked(prev => ({ ...prev, room1: true }))
      navigate('/room2')
    } else {
      setError('One or more answers are incorrect. Please try again.')
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">🧩 Room 1 – Molecular Genetics</h2>
      {puzzles.map(p => (
        <div key={p.id} className="mb-6">
          <p className="mb-2 font-semibold">{p.question}</p>
          <select
            className="w-full p-2 border r
