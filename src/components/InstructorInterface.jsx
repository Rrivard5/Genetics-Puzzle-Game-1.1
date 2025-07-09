import { useState, useEffect } from 'react';

const InstructorInterface = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [puzzles, setPuzzles] = useState({
    room1: [],
    room2: [],
    room3: [],
    room4: []
  });
  const [gameSettings, setGameSettings] = useState({
    wildTypeSequence: "3'CGACGATACGGAGGGGTCACTCCT5'",
    highlightedNucleotide: "G",
    highlightedPosition: 11
  });
  const [studentProgress, setStudentProgress] = useState([]);
  const [detailedStudentData, setDetailedStudentData] = useState([]);
  const [feedbackSettings, setFeedbackSettings] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      loadPuzzles();
      loadGameSettings();
      loadStudentProgress();
      loadDetailedStudentData();
      loadFeedbackSettings();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    if (password === 'genetics2024') {
      setIsLoggingIn(true);
      setTimeout(() => {
        setIsAuthenticated(true);
        setPassword('');
        setIsLoggingIn(false);
      }, 1000);
    } else {
      alert('Incorrect password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  const loadGameSettings = () => {
    const savedSettings = localStorage.getItem('instructor-game-settings');
    if (savedSettings) {
      setGameSettings(JSON.parse(savedSettings));
    }
  };

  const saveGameSettings = () => {
    localStorage.setItem('instructor-game-settings', JSON.stringify(gameSettings));
    alert('Game settings saved successfully!');
  };

  const loadFeedbackSettings = () => {
    const savedFeedback = localStorage.getItem('instructor-feedback');
    if (savedFeedback) {
      setFeedbackSettings(JSON.parse(savedFeedback));
    }
  };

  const saveFeedbackSettings = () => {
    localStorage.setItem('instructor-feedback', JSON.stringify(feedbackSettings));
    alert('Feedback settings saved successfully!');
  };

  const addFeedbackRule = (room, puzzleId, wrongAnswer) => {
    const key = `${room}_${puzzleId}_${wrongAnswer.toLowerCase()}`;
    const newFeedback = prompt('Enter feedback message for this wrong answer:');
    if (newFeedback) {
      setFeedbackSettings(prev => ({
        ...prev,
        [key]: newFeedback
      }));
    }
  };

  const deleteFeedbackRule = (key) => {
    if (confirm('Are you sure you want to delete this feedback rule?')) {
      setFeedbackSettings(prev => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }
  };

  const loadPuzzles = () => {
    const savedPuzzles = localStorage.getItem('instructor-puzzles');
    if (savedPuzzles) {
      setPuzzles(JSON.parse(savedPuzzles));
    } else {
      setPuzzles({
        room1: [
          {
            id: "p1",
            question: "What type of mutation results from changing the highlighted G to A in the DNA sequence?",
            answer: "Point mutation from G to A",
            hint: "Look at the color coding - the mutation type is determined by the color of the highlighted nucleotide."
          },
          {
            id: "p2",
            question: "Based on the genetic code wheel, what amino acid sequence would result from the correct mutation in the previous question?",
            answer: "RPQ",
            hint: "Use the codon wheel to translate the mRNA sequence after the mutation occurs."
          },
          {
            id: "p3", 
            question: "Looking at the answer options in the table, which represents the correct translated product following the point mutation?",
            answer: "CPE → RPQ",
            hint: "Compare the original sequence translation with the mutated sequence translation."
          }
        ],
        room2: [
          {
            id: "p1",
            question: "Looking at the pedigree for dark vision (Figure 2), what type of inheritance pattern does this trait follow?",
            answer: "X-linked recessive"
          },
          {
            id: "p2",
            question: "In the same pedigree family, what is individual 9's genotype for dark vision AND scale color?",
            answer: "XdXd BB"
          },
          {
            id: "p3",
            question: "Based on the inheritance patterns shown, if individual 9 had children with a normal vision male, what percentage of their daughters would have dark vision?",
            answer: "0%"
          }
        ],
        room3: [
          {
            id: "p1",
            question: "A female (BY Dd) and male (BR d) mate. What is the likelihood that one of their female offspring who does not have dark vision will have blue OR red scales?",
            answer: "1/2"
          },
          {
            id: "p2",
            question: "In the same cross (BY Dd × BR d), what is the probability of getting a male offspring with orange scales and dark vision?",
            answer: "1/4"
          },
          {
            id: "p3",
            question: "If two loci are 33 centimorgans apart, what is the recombination frequency between them?",
            answer: "33%"
          }
        ],
        room4: [
          {
            id: "p1",
            question: "A population of aliens is at Hardy-Weinberg equilibrium. The frequency of the dominant allele for wings is 0.6. What is the frequency of homozygous recessive genotypes in this population?",
            answer: "0.16"
          },
          {
            id: "p2",
            question: "If a population is NOT in Hardy-Weinberg equilibrium, which of the following factors could be responsible?",
            answer: "All of the above"
          },
          {
            id: "p3",
            question: "In RNA processing, which segments are removed from the pre-mRNA to create the final mature mRNA?",
            answer: "Introns"
          }
        ]
      });
    }
  };

  const loadStudentProgress = () => {
    const savedProgress = localStorage.getItem('instructor-student-progress');
    if (savedProgress) {
      setStudentProgress(JSON.parse(savedProgress));
    } else {
      const mockProgress = [
        { 
          name: 'Alex Johnson', 
          semester: 'Fall', 
          year: 2024, 
          groupNumber: 1,
          room1: { percentage: 100, attempts: { p1: [{ answer: 'Point mutation from G to A', isCorrect: true, timestamp: '2024-07-08T14:30:00Z' }], p2: [{ answer: 'RPQ', isCorrect: true, timestamp: '2024-07-08T14:31:00Z' }], p3: [{ answer: 'CPE → RPQ', isCorrect: true, timestamp: '2024-07-08T14:32:00Z' }] }},
          room2: { percentage: 75, attempts: { p1: [{ answer: 'X-linked recessive', isCorrect: true, timestamp: '2024-07-08T14:35:00Z' }], p2: [{ answer: 'XdXd BB', isCorrect: true, timestamp: '2024-07-08T14:36:00Z' }], p3: [{ answer: '25%', isCorrect: false, timestamp: '2024-07-08T14:37:00Z' }] }},
          room3: { percentage: 50, attempts: { p1: [{ answer: '1/2', isCorrect: true, timestamp: '2024-07-08T14:40:00Z' }], p2: [{ answer: '1/8', isCorrect: false, timestamp: '2024-07-08T14:41:00Z' }], p3: [{ answer: '16.5%', isCorrect: false, timestamp: '2024-07-08T14:42:00Z' }] }},
          room4: { percentage: 0, attempts: {} },
          lastActivity: '2024-07-08T14:30:00Z'
        }
      ];
      setStudentProgress(mockProgress);
    }
  };

  const loadDetailedStudentData = () => {
    const savedData = localStorage.getItem('instructor-student-data');
    if (savedData) {
      setDetailedStudentData(JSON.parse(savedData));
    } else {
      const detailedData = [];
      studentProgress.forEach(student => {
        ['room1', 'room2', 'room3', 'room4'].forEach(roomId => {
          const roomData = student[roomId];
          if (roomData && roomData.attempts) {
            Object.entries(roomData.attempts).forEach(([questionId, attempts]) => {
              attempts.forEach((attempt, index) => {
                detailedData.push({
                  sessionId: `session_${student.name.replace(' ', '_')}_${Date.now()}`,
                  name: student.name,
                  semester: student.semester,
                  year: student.year,
                  groupNumber: student.groupNumber,
                  roomId,
                  questionId,
                  answer: attempt.answer,
                  isCorrect: attempt.isCorrect,
                  timestamp: attempt.timestamp,
                  attemptNumber: index + 1
                });
              });
            });
          }
        });
      });
      setDetailedStudentData(detailedData);
    }
  };

  const savePuzzles = () => {
    localStorage.setItem('instructor-puzzles', JSON.stringify(puzzles));
    alert('Puzzles saved successfully!');
  };

  const exportPuzzles = () => {
    const dataStr = JSON.stringify(puzzles, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'genetics_puzzles.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportToExcel = () => {
    const csvData = [];
    csvData.push([
      'Student Name', 'Semester', 'Year', 'Group Number', 'Session ID', 'Room',
      'Question', 'Answer Given', 'Correct (Y/N)', 'Attempt Number', 'Timestamp'
    ]);
    
    detailedStudentData.forEach(record => {
      csvData.push([
        record.name, record.semester, record.year, record.groupNumber, record.sessionId,
        record.roomId, record.questionId, record.answer, record.isCorrect ? 'Y' : 'N',
        record.attemptNumber, new Date(record.timestamp).toLocaleString()
      ]);
    });
    
    const csvContent = csvData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `genetics-escape-room-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const addNewPuzzle = (room) => {
    const newPuzzle = {
      id: `p${puzzles[room].length + 1}`,
      question: 'New question here...',
      answer: 'Correct answer here...',
      hint: 'Hint for this question...'
    };
    setPuzzles(prev => ({
      ...prev,
      [room]: [...prev[room], newPuzzle]
    }));
  };

  const updatePuzzle = (room, puzzleId, updatedPuzzle) => {
    setPuzzles(prev => ({
      ...prev,
      [room]: prev[room].map(p => p.id === puzzleId ? updatedPuzzle : p)
    }));
  };

  const deletePuzzle = (room, puzzleId) => {
    if (confirm('Are you sure you want to delete this puzzle?')) {
      setPuzzles(prev => ({
        ...prev,
        [room]: prev[room].filter(p => p.id !== puzzleId)
      }));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Genetics Escape Room</h1>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Instructor Portal</h2>
            <p className="text-gray-600">Enter password to access instructor tools</p>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter instructor password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                isLoggingIn
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLoggingIn ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </div>
          <div className="mt-6 text-center text-sm text-gray-500">
            Default password: genetics2024
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Genetics Escape Room - Instructor Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', name: 'Student Progress', icon: '📊' },
              { id: 'detailed', name: 'Detailed Tracking', icon: '📋' },
              { id: 'feedback', name: 'Feedback Management', icon: '💬' },
              { id: 'settings', name: 'Game Settings', icon: '⚙️' },
              { id: 'room1', name: 'Room 1 Puzzles', icon: '🧩' },
              { id: 'room2', name: 'Room 2 Puzzles', icon: '🔬' },
              { id: 'room3', name: 'Room 3 Puzzles', icon: '🎲' },
              { id: 'room4', name: 'Room 4 Puzzles', icon: '🌍' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Feedback Management Tab */}
        {activeTab === 'feedback' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Feedback Management</h2>
              <button
                onClick={saveFeedbackSettings}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Feedback Settings
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Custom Feedback Rules</h3>
              <p className="text-gray-600 mb-4">
                Create custom feedback messages for specific wrong answers. When a student enters a wrong answer,
                they'll see your custom message instead of the default feedback.
              </p>
              
              <div className="space-y-4">
                {['room1', 'room2', 'room3', 'room4'].map(room => (
                  <div key={room} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-2">
                      {room.toUpperCase()} - {room === 'room1' ? 'Molecular Genetics' : 
                                              room === 'room2' ? 'Pedigree Analysis' :
                                              room === 'room3' ? 'Probability Genetics' :
                                              'Population Genetics'}
                    </h4>
                    
                    {puzzles[room]?.map(puzzle => (
                      <div key={puzzle.id} className="ml-4 mb-3 p-3 bg-gray-50 rounded">
                        <p className="font-medium text-sm text-gray-700 mb-2">
                          {puzzle.id.toUpperCase()}: {puzzle.question}
                        </p>
                        <p className="text-xs text-green-600 mb-2">Correct Answer: {puzzle.answer}</p>
                        
                        {/* Show existing feedback rules for this question */}
                        {Object.entries(feedbackSettings)
                          .filter(([key]) => key.startsWith(`${room}_${puzzle.id}_`))
                          .map(([key, feedback]) => {
                            const wrongAnswer = key.split('_').slice(2).join('_');
                            return (
                              <div key={key} className="flex items-center justify-between bg-white p-2 rounded mb-1">
                                <div className="flex-1">
                                  <span className="text-xs font-mono text-red-600">{wrongAnswer}</span>
                                  <p className="text-xs text-gray-600">{feedback}</p>
                                </div>
                                <button
                                  onClick={() => deleteFeedbackRule(key)}
                                  className="text-red-500 hover:text-red-700 text-xs ml-2"
                                >
                                  Delete
                                </button>
                              </div>
                            );
                          })
                        }
                        
                        <button
                          onClick={() => {
                            const wrongAnswer = prompt('Enter the wrong answer you want to create feedback for:');
                            if (wrongAnswer) {
                              addFeedbackRule(room, puzzle.id, wrongAnswer);
                            }
                          }}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                        >
                          + Add Feedback Rule
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Game Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Game Settings</h2>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wild Type Genetic Sequence
                    </label>
                    <input
                      type="text"
                      value={gameSettings.wildTypeSequence}
                      onChange={(e) => setGameSettings(prev => ({ ...prev, wildTypeSequence: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      placeholder="Enter genetic sequence"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Highlighted Nucleotide
                    </label>
                    <input
                      type="text"
                      value={gameSettings.highlightedNucleotide}
                      onChange={(e) => setGameSettings(prev => ({ ...prev, highlightedNucleotide: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      placeholder="Enter nucleotide (A, T, G, C)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Highlighted Position (0-based index)
                    </label>
                    <input
                      type="number"
                      value={gameSettings.highlightedPosition}
                      onChange={(e) => setGameSettings(prev => ({ ...prev, highlightedPosition: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter position number"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <button
                      onClick={saveGameSettings}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Game Settings
                    </button>
                  </div>
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-700 mb-2">Preview:</h3>
                    <p className="font-mono text-lg">
                      {gameSettings.wildTypeSequence.substring(0, gameSettings.highlightedPosition)}
                      <span className="bg-yellow-300 px-1 rounded font-bold">
                        {gameSettings.highlightedNucleotide}
                      </span>
                      {gameSettings.wildTypeSequence.substring(gameSettings.highlightedPosition + 1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Progress Dashboard */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Student Progress Overview</h2>
              <button
                onClick={exportToExcel}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                📊 Export to Excel
              </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room 1
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room 2
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room 3
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room 4
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentProgress.map((student, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">
                          {student.semester} {student.year} - Group {student.groupNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${student.room1.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500">{student.room3.percentage}%</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {Object.values(student.room3.attempts).reduce((total, attempts) => total + attempts.length, 0)} attempts
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ width: `${student.room4.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500">{student.room4.percentage}%</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {Object.values(student.room4.attempts).reduce((total, attempts) => total + attempts.length, 0)} attempts
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(student.lastActivity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detailed Tracking Tab */}
        {activeTab === 'detailed' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Detailed Answer Tracking</h2>
              <button
                onClick={() => loadDetailedStudentData()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Refresh Data
              </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room/Question
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Answer Given
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Result
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attempt #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {detailedStudentData.slice(-50).reverse().map((record, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{record.name}</div>
                        <div className="text-sm text-gray-500">Group {record.groupNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.roomId}</div>
                        <div className="text-sm text-gray-500">{record.questionId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{record.answer}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.isCorrect 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        #{record.attemptNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-sm text-gray-600 text-center">
              Showing last 50 attempts. Export to Excel for complete data.
            </div>
          </div>
        )}

        {/* Puzzle Management */}
        {['room1', 'room2', 'room3', 'room4'].includes(activeTab) && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Puzzles
              </h2>
              <div className="space-x-2">
                <button
                  onClick={() => addNewPuzzle(activeTab)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  + Add Puzzle
                </button>
                <button
                  onClick={savePuzzles}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={exportPuzzles}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Export Puzzles
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {puzzles[activeTab]?.map((puzzle, index) => (
                <div key={puzzle.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Puzzle {index + 1}</h3>
                    <button
                      onClick={() => deletePuzzle(activeTab, puzzle.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                      <textarea
                        value={puzzle.question}
                        onChange={(e) => updatePuzzle(activeTab, puzzle.id, { ...puzzle, question: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                      <input
                        value={puzzle.answer}
                        onChange={(e) => updatePuzzle(activeTab, puzzle.id, { ...puzzle, answer: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter the correct answer"
                      />
                    </div>

                    {puzzle.hint && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hint (Optional)</label>
                        <input
                          value={puzzle.hint}
                          onChange={(e) => updatePuzzle(activeTab, puzzle.id, { ...puzzle, hint: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">Custom Feedback for Wrong Answers</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Add specific feedback messages for common wrong answers to help guide students.
                      </p>
                      
                      {/* Show existing feedback rules */}
                      <div className="space-y-2 mb-3">
                        {Object.entries(feedbackSettings)
                          .filter(([key]) => key.startsWith(`${activeTab}_${puzzle.id}_`))
                          .map(([key, feedback]) => {
                            const wrongAnswer = key.split('_').slice(2).join('_');
                            return (
                              <div key={key} className="flex items-center justify-between bg-white p-3 rounded border">
                                <div className="flex-1">
                                  <div className="font-mono text-sm text-red-600">"{wrongAnswer}"</div>
                                  <div className="text-sm text-gray-600 mt-1">{feedback}</div>
                                </div>
                                <button
                                  onClick={() => deleteFeedbackRule(key)}
                                  className="text-red-500 hover:text-red-700 text-sm ml-2"
                                >
                                  Delete
                                </button>
                              </div>
                            );
                          })
                        }
                      </div>
                      
                      <button
                        onClick={() => {
                          const wrongAnswer = prompt('Enter the wrong answer you want to create feedback for:');
                          if (wrongAnswer) {
                            addFeedbackRule(activeTab, puzzle.id, wrongAnswer);
                          }
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
                      >
                        + Add Feedback Rule
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorInterface;.room1.percentage}%</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {Object.values(student.room1.attempts).reduce((total, attempts) => total + attempts.length, 0)} attempts
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${student.room2.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500">{student.room2.percentage}%</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {Object.values(student.room2.attempts).reduce((total, attempts) => total + attempts.length, 0)} attempts
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-orange-600 h-2 rounded-full" 
                              style={{ width: `${student
