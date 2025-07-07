import { useGame } from '../context/GameStateContext'
import { Link } from 'react-router-dom'

export default function Completion() {
  const { finalLetter } = useGame()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-green-50">
      <h1 className="text-3xl font-bold mb-4 text-green-800">🎉 Congratulations!</h1>
      <p className="mb-4 text-lg max-w-xl">
        You’ve unlocked all the alien temple rooms and solved their genetic mysteries.
      </p>
      <p className="text-xl font-semibold mt-4">
        The final letter you discovered is:
      </p>
      <div className="text-5xl font-bold text-purple-700 my-4">
        {finalLetter || '🔒'}
      </div>
      <p className="text-md text-gray-700 mb-6">
        Write this letter on the class board and help your teammates!
      </p>
      <Link
        to="/"
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Restart Game
      </Link>
    </div>
  )
}
