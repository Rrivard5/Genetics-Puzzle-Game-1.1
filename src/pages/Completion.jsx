import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'

export default function Completion() {
  const { finalLetter, resetGame, attemptTracking, studentInfo } = useGame()
  const [showConfetti, setShowConfetti] = useState(false)
  const [wrongAnswerFeedback, setWrongAnswerFeedback] = useState([])

  useEffect(() => {
    // Trigger confetti animation
    setShowConfetti(true)
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    
    // Collect all wrong answer feedback for study guidance
    collectWrongAnswerFeedback()
    
    return () => clearTimeout(timer)
  }, [])

  const collectWrongAnswerFeedback = () => {
    const feedback = []
    
    // Go through all attempts and collect feedback for wrong answers
    Object.entries(attemptTracking).forEach(([key, attempts]) => {
      const [roomId, questionId] = key.split('-')
      attempts.forEach(attempt => {
        if (!attempt.isCorrect) {
          // Get the feedback that was shown to the student
          const feedbackMessage = getStoredFeedback(roomId, questionId, attempt.answer)
          if (feedbackMessage) {
            feedback.push({
              room: roomId,
              question: questionId,
              wrongAnswer: attempt.answer,
              feedback: feedbackMessage,
              timestamp: attempt.timestamp
            })
          }
        }
      })
    })
    
    // Remove duplicates and sort by timestamp
    const uniqueFeedback = feedback.filter((item, index, self) => 
      index === self.findIndex(t => t.room === item.room && t.question === item.question && t.wrongAnswer === item.wrongAnswer)
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    
    setWrongAnswerFeedback(uniqueFeedback)
  }

  const getStoredFeedback = (roomId, questionId, userAnswer) => {
    const savedFeedback = localStorage.getItem('instructor-feedback')
    const customFeedback = savedFeedback ? JSON.parse(savedFeedback) : {}
    
    // Check for group-specific feedback first
    const groupFeedbackKey = `${roomId}_${questionId}_${userAnswer.toLowerCase()}_group${studentInfo?.groupNumber}`
    if (customFeedback[groupFeedbackKey]) {
      return customFeedback[groupFeedbackKey]
    }
    
    // Check for general feedback
    const generalFeedbackKey = `${roomId}_${questionId}_${userAnswer.toLowerCase()}`
    if (customFeedback[generalFeedbackKey]) {
      return customFeedback[generalFeedbackKey]
    }
    
    return null
  }

  const getRoomName = (roomId) => {
    const roomNames = {
      'room1': 'Molecular Genetics',
      'room2': 'Pedigree Analysis',
      'room3': 'Probability Genetics',
      'room4': 'Population Genetics'
    }
    return roomNames[roomId] || roomId
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            >
              {['🎉', '🎊', '⭐', '🌟', '✨'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-8 mb-8 shadow-xl">
          <div className="text-6xl mb-4 animate-bounce-soft">🎉</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Mission Complete!
          </h1>
          <p className="text-xl md:text-2xl text-green-100">
            You've successfully decoded the alien genetic mysteries!
          </p>
        </div>

        {/* Final Letter Reveal - Now First! */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl p-8 mb-8 shadow-xl">
          <h2 className="text-4xl font-bold mb-4">🔓 SECRET LETTER UNLOCKED!</h2>
          <p className="text-xl mb-6">
            🏆 Congratulations! You've unlocked the alien's final genetic code letter:
          </p>
          <div className="bg-white bg-opacity-20 rounded-xl p-8 mb-6">
            <div className="text-9xl font-bold text-white mb-4 animate-pulse-soft drop-shadow-2xl">
              {finalLetter || 'G'}
            </div>
            <p className="text-2xl font-bold text-yellow-100 mb-2">
              🎯 WRITE THIS ON THE CLASS BOARD!
            </p>
            <p className="text-lg text-yellow-100">
              This letter is your team's key to solving the ultimate puzzle!
            </p>
          </div>
          <div className="bg-yellow-600 bg-opacity-50 rounded-lg p-4">
            <p className="text-yellow-100 font-semibold">
              🎓 Your instructor will use this letter as part of the class-wide challenge!
            </p>
          </div>
        </div>

        {/* Achievement Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🏆 Your Genetic Journey</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="text-3xl mb-2">✅</div>
              <div className="font-semibold text-blue-800">Molecular Genetics</div>
              <div className="text-sm text-blue-600">Mastered mutations & DNA</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <div className="text-3xl mb-2">✅</div>
              <div className="font-semibold text-green-800">Pedigree Analysis</div>
              <div className="text-sm text-green-600">Decoded inheritance patterns</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="text-3xl mb-2">✅</div>
              <div className="font-semibold text-purple-800">Genetic Probability</div>
              <div className="text-sm text-purple-600">Calculated outcomes</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg">
              <div className="text-3xl mb-2">✅</div>
              <div className="font-semibold text-indigo-800">Population Genetics</div>
              <div className="text-sm text-indigo-600">Understood evolution</div>
            </div>
          </div>
        </div>

        {/* Study Guidance - Show feedback from wrong answers */}
        {wrongAnswerFeedback.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📚 Study Guidance</h2>
            <p className="text-gray-600 mb-6">
              Here are the concepts you should review based on your incorrect answers during the game:
            </p>
            <div className="space-y-4">
              {wrongAnswerFeedback.map((item, index) => (
                <div key={index} className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="text-2xl">
                        {item.room === 'room1' ? '🧩' : 
                         item.room === 'room2' ? '🔬' : 
                         item.room === 'room3' ? '🎲' : '🌍'}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-amber-800 mb-1">
                        {getRoomName(item.room)} - {item.question}
                      </div>
                      <div className="text-sm text-amber-700 mb-2">
                        <strong>Your answer:</strong> {item.wrongAnswer}
                      </div>
                      <div className="text-sm text-amber-600 leading-relaxed">
                        {item.feedback}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm font-medium">
                💡 <strong>Study Tip:</strong> Review these concepts before your next genetics exam or quiz!
              </p>
            </div>
          </div>
        )}

        {/* Story Conclusion */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-8 mb-8 shadow-xl">
          <div className="text-4xl mb-4">🛸</div>
          <h2 className="text-2xl font-bold mb-4">The Alien Legacy</h2>
          <p className="text-lg leading-relaxed">
            Through your mastery of genetics, you've helped preserve the knowledge of an ancient alien civilization. 
            Their understanding of molecular biology, inheritance patterns, and population dynamics now lives on 
            through your discoveries. The universe's genetic secrets are safer thanks to your efforts!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <span className="mr-2">🏠</span>
            Return Home
          </Link>
          
          <button
            onClick={resetGame}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <span className="mr-2">🔄</span>
            Play Again
          </button>
        </div>

        {/* Teacher Note */}
        <div className="mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-6">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">👩‍🏫</span>
            <h3 className="text-xl font-bold text-amber-800">For Teachers</h3>
          </div>
          <p className="text-amber-700 text-left">
            This game reinforces key genetics concepts including molecular genetics, inheritance patterns, 
            probability calculations, and population genetics. Students should have demonstrated understanding 
            of DNA structure, pedigree analysis, Punnett squares, and Hardy-Weinberg equilibrium to succeed.
            The study guidance section above shows specific areas where this student needed additional support.
          </p>
        </div>
      </div>
    </div>
  )
}
