import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'
import puzzles from '../data/puzzlesRoom4.json'

export default function Room4() {
  const [responses, setResponses] = useState({})
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { setRoomUnlocked, setFinalLetter } = useGame()

  const handleChange = (e, id) => {
    setResponses({ ...responses, [id]: e.target.value })
  }

  const handleSubmit = () => {
    const allCorrect = puzzles.every(p => p.answer === responses[p.id])
    if (allCorrect) {
      setRoomUnlocked(prev => ({ ...prev, room4: true }))
      setFinalLetter('I') // Room 4 letter as per game
      navigate('/complete')
    } else {
      setError('Some answers are incorrect. Double check your logic!')
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">🧬 Room 4 – Population Genetics & RNA</h2>
      {puzzles.map(p => (
        <div key={p.id} className="mb-6">
          <p className="mb-2 font-semibold">{p.question}</p>
          <select
            className="w-full p-2 border rounded"
            onChange={(e) => handleChange(e, p.id)}
            defaultValue=""
          >
            <option value="" disabled>Select an answer</option>
            {p.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      ))}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
      >
