import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import StudentInfo from './pages/StudentInfo'
import Room1 from './pages/Room1'
import Room2 from './pages/Room2'
import Room3 from './pages/Room3'
import Room4 from './pages/Room4'
import Completion from './pages/Completion'
import WordScramble from './pages/WordScramble'
import InstructorInterface from './components/InstructorInterface'
import { GameProvider } from './context/GameStateContext'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <GameProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/student-info" element={<StudentInfo />} />
              
              {/* Protected Room Routes */}
              <Route 
                path="/room1" 
                element={
                  <ProtectedRoute>
                    <Room1 />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/room2" 
                element={
                  <ProtectedRoute>
                    <Room2 />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/room3" 
                element={
                  <ProtectedRoute>
                    <Room3 />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/room4" 
                element={
                  <ProtectedRoute>
                    <Room4 />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/complete" 
                element={
                  <ProtectedRoute>
                    <Completion />
                  </ProtectedRoute>
                } 
              />
              
              {/* Word Scramble can be accessed without student info */}
              <Route path="/word-scramble" element={<WordScramble />} />
              
              {/* Instructor Interface */}
              <Route path="/instructor" element={<InstructorInterface />} />
            </Routes>
          </main>
        </div>
      </Router>
    </GameProvider>
  )
}
