import { useState, useEffect } from 'react';

const InstructorInterface = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [puzzles, setPuzzles] = useState({
    room1: { groups: {} },
    room2: { groups: {} },
    room3: { groups: {} },
    room4: { groups: {} }
  });
  const [selectedGroup, setSelectedGroup] = useState(1);
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

  const addFeedbackRule = (room, puzzleId, wrongAnswer, groupNumber = null) => {
    const key = groupNumber 
      ? `${room}_${puzzleId}_${wrongAnswer.toLowerCase()}_group${groupNumber}`
      : `${room}_${puzzleId}_${wrongAnswer.toLowerCase()}`;
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
      // Initialize with default structure
      const defaultPuzzles = {
        room1: {
          groups: {
            1: [
              {
                id: "p1",
                question: "What type of mutation results from changing the highlighted G to A in the DNA sequence?",
                type: "text",
                answer: "Point mutation from G to A",
                options: []
              },
              {
                id: "p2",
                question: "Based on the genetic code wheel, what amino acid sequence would result from the correct mutation in the previous question?",
                type: "text",
                answer: "RPQ",
                options: []
              },
              {
                id: "p3", 
                question: "Looking at the answer options in the table, which represents the correct translated product following the point mutation?",
                type: "text",
                answer: "CPE → RPQ",
                options: []
              }
            ]
          }
        },
        room2: { groups: {} },
        room3: { groups: {} },
        room4: { groups: {} }
      };
      setPuzzles(defaultPuzzles);
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
          room1: { percentage: 100, attempts: { p1: [{ answer: 'Point mutation from G to A', isCorrect: true, timestamp: '2024-07-08T14:30:00Z' }] }},
          room2: { percentage: 75, attempts: { p1: [{ answer: 'X-linked recessive', isCorrect: true, timestamp: '2024-07-08T14:35:00Z' }] }},
          room3: { percentage: 50, attempts: { p1: [{ answer: '1/2', isCorrect: true, timestamp: '2024-07-08T14:40:00Z' }] }},
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
      setDetailedStudentData([]);
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

  const addNewPuzzle = (room, groupNumber) => {
    const existingPuzzles = puzzles[room].groups[groupNumber] || [];
    const newPuzzle = {
      id: `p${existingPuzzles.length + 1}`,
      question: 'New question here...',
      type: 'text',
      answer: 'Correct answer here...',
      options: []
    };
    setPuzzles(prev => ({
      ...prev,
      [room]: {
        ...prev[room],
        groups: {
          ...prev[room].groups,
          [groupNumber]: [...existingPuzzles, newPuzzle]
        }
      }
    }));
  };

  const updatePuzzle = (room, groupNumber, puzzleId, updatedPuzzle) => {
    setPuzzles(prev => ({
      ...prev,
      [room]: {
        ...prev[room],
        groups: {
          ...prev[room].groups,
          [groupNumber]: prev[room].groups[groupNumber].map(p => 
            p.id === puzzleId ? updatedPuzzle : p
          )
        }
      }
    }));
  };

  const deletePuzzle = (room, groupNumber, puzzleId) => {
    if (confirm('Are you sure you want to delete this puzzle?')) {
      setPuzzles(prev => ({
        ...prev,
        [room]: {
          ...prev[room],
          groups: {
            ...prev[room].groups,
            [groupNumber]: prev[room].groups[groupNumber].filter(p => p.id !== puzzleId)
          }
        }
      }));
    }
  };

  const addNewGroup = (room) => {
    const existingGroups = Object.keys(puzzles[room].groups).map(Number);
    const newGroupNumber = existingGroups.length > 0 ? Math.max(...existingGroups) + 1 : 1;
    setPuzzles(prev => ({
      ...prev,
      [room]: {
        ...prev[room],
        groups: {
          ...prev[room].groups,
          [newGroupNumber]: []
        }
      }
    }));
    setSelectedGroup(newGroupNumber);
  };

  const copyGroupQuestions = (room, fromGroup, toGroup) => {
    const questionsToSelect = puzzles[room].groups[fromGroup] || [];
    const questionsToCopy = questionsToSelect.map(q => ({ ...q }));
    
    setPuzzles(prev => ({
      ...prev,
      [room]: {
        ...prev[room],
        groups: {
          ...prev[room].groups,
          [toGroup]: questionsToCopy
        }
      }
    }));
  };

  const addOptionToPuzzle = (room, groupNumber, puzzleId) => {
    const puzzle = puzzles[room].groups[groupNumber].find(p => p.id === puzzleId);
    const newOptions = [...puzzle.options, 'New option'];
    updatePuzzle(room, groupNumber, puzzleId, { ...puzzle, options: newOptions });
  };

  const removeOptionFromPuzzle = (room, groupNumber, puzzleId, optionIndex) => {
    const puzzle = puzzles[room].groups[groupNumber].find(p => p.id === puzzleId);
    const newOptions = puzzle.options.filter((_, index) => index !== optionIndex);
    updatePuzzle(room, groupNumber, puzzleId, { ...puzzle, options: newOptions });
  };

  const updatePuzzleOption = (room, groupNumber, puzzleId, optionIndex, newValue) => {
    const puzzle = puzzles[room].groups[groupNumber].find(p => p.id === puzzleId);
    const newOptions = [...puzzle.options];
    newOptions[optionIndex] = newValue;
    updatePuzzle(room, groupNumber, puzzleId, { ...puzzle, options: newOptions });
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
        {/* Group Management Notice */}
        {['room1', 'room2', 'room3', 'room4'].includes(activeTab) && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">📚 Group-Based Question Management</h3>
            <p className="text-blue-700 text-sm">
              Create different question sets for each group. Students will automatically receive questions 
              based on their group number entered during registration.
            </p>
          </div>
        )}

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
                Create custom feedback messages for specific wrong answers. You can create feedback for 
                specific groups or general feedback that applies to all groups.
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
                    
                    {/* Show feedback rules */}
                    <div className="space-y-2">
                      {Object.entries(feedbackSettings)
                        .filter(([key]) => key.startsWith(room))
                        .map(([key, feedback]) => (
                          <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div className="flex-1">
                              <span className="text-xs font-mono text-gray-600">{key}</span>
                              <p className="text-sm text-gray-700">{feedback}</p>
                            </div>
                            <button
                              onClick={() => deleteFeedbackRule(key)}
                              className="text-red-500 hover:text-red-700 text-xs ml-2"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                    </div>
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
                          <span className="text-sm text-gray-500">{student.room1.percentage}%</span>
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-orange-600 h-2 rounded-full" 
                              style={{ width: `${student.room3.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500">{student.room3.percentage}%</span>
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
                  onClick={() => addNewGroup(activeTab)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  + Add Group
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

            {/* Group Selection */}
            <div className="mb-6 bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Select Group to Edit:</h3>
              <div className="flex flex-wrap gap-2">
                {Object.keys(puzzles[activeTab].groups).map(groupNum => (
                  <button
                    key={groupNum}
                    onClick={() => setSelectedGroup(parseInt(groupNum))}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedGroup === parseInt(groupNum)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Group {groupNum}
                  </button>
                ))}
              </div>
              
              {selectedGroup && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => addNewPuzzle(activeTab, selectedGroup)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    + Add Puzzle to Group {selectedGroup}
                  </button>
                  
                  <select
                    onChange={(e) => {
                      const fromGroup = parseInt(e.target.value);
                      if (fromGroup && fromGroup !== selectedGroup) {
                        copyGroupQuestions(activeTab, fromGroup, selectedGroup);
                      }
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Copy from another group...</option>
                    {Object.keys(puzzles[activeTab].groups)
                      .filter(num => parseInt(num) !== selectedGroup)
                      .map(groupNum => (
                        <option key={groupNum} value={groupNum}>
                          Copy from Group {groupNum}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            {/* Puzzles for Selected Group */}
            {selectedGroup && puzzles[activeTab].groups[selectedGroup] && (
              <div className="space-y-6">
                {puzzles[activeTab].groups[selectedGroup].map((puzzle, index) => (
                  <div key={puzzle.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Group {selectedGroup} - Puzzle {index + 1}
                      </h3>
                      <button
                        onClick={() => deletePuzzle(activeTab, selectedGroup, puzzle.id)}
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
                          onChange={(e) => updatePuzzle(activeTab, selectedGroup, puzzle.id, { ...puzzle, question: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                        <select
                          value={puzzle.type}
                          onChange={(e) => {
                            const newType = e.target.value;
                            const updatedPuzzle = { ...puzzle, type: newType };
                            if (newType === 'multiple_choice' && (!puzzle.options || puzzle.options.length === 0)) {
                              updatedPuzzle.options = ['Option A', 'Option B', 'Option C', 'Option D'];
                            }
                            updatePuzzle(activeTab, selectedGroup, puzzle.id, updatedPuzzle);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="text">Text Input (Open-ended)</option>
                          <option value="multiple_choice">Multiple Choice</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                        <input
                          value={puzzle.answer}
                          onChange={(e) => updatePuzzle(activeTab, selectedGroup, puzzle.id, { ...puzzle, answer: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter the correct answer"
                        />
                      </div>

                      {puzzle.type === 'multiple_choice' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
                          {puzzle.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center space-x-2 mb-2">
                              <input
                                type="radio"
                                name={`answer-${puzzle.id}`}
                                checked={puzzle.answer === option}
                                onChange={() => updatePuzzle(activeTab, selectedGroup, puzzle.id, { ...puzzle, answer: option })}
                                className="text-blue-600"
                              />
                              <input
                                value={option}
                                onChange={(e) => updatePuzzleOption(activeTab, selectedGroup, puzzle.id, optIndex, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <button
                                onClick={() => removeOptionFromPuzzle(activeTab, selectedGroup, puzzle.id, optIndex)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addOptionToPuzzle(activeTab, selectedGroup, puzzle.id)}
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                          >
                            + Add Option
                          </button>
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
                              addFeedbackRule(activeTab, puzzle.id, wrongAnswer, selectedGroup);
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorInterface;
