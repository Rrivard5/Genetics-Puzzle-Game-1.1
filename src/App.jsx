import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Room1 from './pages/Room1'
import Room2 from './pages/Room2'
import Room3 from './pages/Room3'
import Room4 from './pages/Room4'
import Completion from './pages/Completion'
import InstructorInterface from './components/InstructorInterface'
import { GameProvider } from './context/GameStateContext'
import Header from './components/Header'

export default function App() {
  return (
    <GameProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/room1" element={<Room1 />} />
              <Route path="/room2" element={<Room2 />} />
              <Route path="/room3" element={<Room3 />} />
              <Route path="/room4" element={<Room4 />} />
              <Route path="/complete" element={<Completion />} />
              <Route path="/instructor" element={<InstructorInterface />} />
            </Routes>
          </main>
        </div>
      </Router>
    </GameProvider>
  )
}
