import { Link, useLocation } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'

export default function Header() {
  const location = useLocation()
  const { roomUnlocked, studentInfo } = useGame()
  
  const isHome = location.pathname === '/'
  const isComplete = location.pathname === '/complete'
  const isStudentInfo = location.pathname === '/student-info'
  const isInstructor = location.pathname === '/instructor'

  // Don't show header on these pages
  if (isHome || isComplete || isStudentInfo || isInstructor) return null

  // Check if student info exists
  const hasStudentInfo = studentInfo || localStorage.getItem('current-student-info')

  const rooms = [
    { name: 'Room 1', path: '/room1', unlocked: true },
    { name: 'Room 2', path: '/room2', unlocked: roomUnlocked.room1 },
    { name: 'Room 3', path: '/room3', unlocked: roomUnlocked.room2 },
    { name: 'Room 4', path: '/room4', unlocked: roomUnlocked.room3 },
  ]

  return (
    <header className="bg-white shadow-sm border-b-2 border-primary-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link 
            to="/" 
            className="text-xl font-bold text-primary-700 hover:text-primary-800 transition-colors"
          >
            🧬 Genetics Escape Room
          </Link>
          
          {/* Only show navigation if student info exists */}
          {hasStudentInfo && (
            <nav className="flex flex-wrap gap-2">
              {rooms.map((room) => (
                <Link
                  key={room.name}
                  to={room.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    room.unlocked
                      ? location.pathname === room.path
                        ? 'bg-primary-600 text-white'
                        : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={(e) => !room.unlocked && e.preventDefault()}
                >
                  {room.unlocked ? room.name : `🔒 ${room.name}`}
                </Link>
              ))}
            </nav>
          )}
          
          {/* Show message if no student info */}
          {!hasStudentInfo && (
            <div className="text-amber-600 font-medium">
              Please complete student information to access rooms
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
