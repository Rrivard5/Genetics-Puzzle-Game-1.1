import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-blue-100 to-white">
      <h1 className="text-4xl font-bold mb-4">🧬 Genetics Puzzle Game</h1>
      <p className="mb-6 max-w-xl text-lg">
        You’ve discovered evidence of a new alien species! Unlock the secrets of their genetics by solving puzzles in their ancient temples. Can you finish before their legacy is lost?
      </p>
      <Link
        to="/room1"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-lg shadow-md"
      >
        Begin Game
      </Link>
    </div>
  )
}
