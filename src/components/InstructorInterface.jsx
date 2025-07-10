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
    // Group-based genetic code settings
    groups: {}
  });
  const [studentProgress, setStudentProgress] = useState([]);
  const [detailedStudentData, setDetailedStudentData] = useState([]);
  const [feedbackSettings, setFeedbackSettings] = useState({});
  const [pedigreeImages, setPedigreeImages] = useState({});
  const [uploadingImages, setUploadingImages] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      loadPuzzles();
      loadGameSettings();
      loadStudentProgress();
      loadDetailedStudentData();
      loadFeedbackSettings();
      loadPedigreeImages();
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
    } else {
      // Initialize with default settings for each group
      const defaultSettings = {
        groups: {}
      };
      for (let i = 1; i <= 15; i++) {
        defaultSettings.groups[i] = {
          wildTypeSequence: "3'CGACGATACGGAGGGGTCACTCCT5'",
          highlightedNucleotide: "G",
          highlightedPosition: 11
        };
      }
      setGameSettings(defaultSettings);
    }
  };

  const saveGameSettings = () => {
    localStorage.setItem('instructor-game-settings', JSON.stringify(gameSettings));
    alert('Game settings saved successfully!');
  };

  const updateGroupGameSettings = (groupNumber, field, value) => {
    setGameSettings(prev => ({
      ...prev,
      groups: {
        ...prev.groups,
        [groupNumber]: {
          ...prev.groups[groupNumber],
          [field]: value
        }
      }
    }));
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

  const loadPedigreeImages = () => {
    const savedImages = localStorage.getItem('instructor-pedigree-images');
    if (savedImages) {
      setPedigreeImages(JSON.parse(savedImages));
    }
  };

  const savePedigreeImages = () => {
    localStorage.setItem('instructor-pedigree-images', JSON.stringify(pedigreeImages));
    alert('Pedigree images saved successfully!');
  };

  // Enhanced image upload handler for individual questions
  const handleQuestionImageUpload = (event, room, groupNumber, questionId) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload only image files (JPG, PNG, etc.)');
        return;
      }
      
      // Validate file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const uploadKey = `${room}_${groupNumber}_${questionId}`;
      setUploadingImages(prev => ({ ...prev, [uploadKey]: true }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageKey = `${room}_group${groupNumber}_${questionId}`;
        setPedigreeImages(prev => ({
          ...prev,
          [imageKey]: {
            data: e.target.result,
            name: file.name,
            size: file.size,
            lastModified: new Date().toISOString()
          }
        }));
        setUploadingImages(prev => ({ ...prev, [uploadKey]: false }));
      };
      reader.onerror = () => {
        alert('Error reading file. Please try again.');
        setUploadingImages(prev => ({ ...prev, [uploadKey]: false }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeQuestionImage = (room, groupNumber, questionId) => {
    if (confirm('Are you sure you want to remove this image?')) {
      const imageKey = `${room}_group${groupNumber}_${questionId}`;
      setPedigreeImages(prev => {
        const updated = { ...prev };
        delete updated[imageKey];
        return updated;
      });
    }
  };

  const previewQuestionImage = (room, groupNumber, questionId) => {
    const imageKey = `${room}_group${groupNumber}_${questionId}`;
    const imageData = pedigreeImages[imageKey];
    if (imageData) {
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`
        <html>
          <head>
            <title>Question Image Preview - ${room.toUpperCase()} Group ${groupNumber} Question ${questionId}</title>
            <style>
              body { margin: 0; padding: 20px; background: #f5f5f5; font-family: Arial, sans-serif; }
              .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
              .header { text-align: center; margin-bottom: 20px; }
              .image-container { text-align: center; }
              img { max-width: 100%; height: auto; border: 2px solid #ddd; border-radius: 8px; }
              .info { margin-top: 20px; padding: 10px; background: #f9f9f9; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>${room.toUpperCase()} - Group ${groupNumber} - Question ${questionId}</h2>
              </div>
              <div class="image-container">
                <img src="${imageData.data}" alt="Question Image" />
              </div>
              <div class="info">
                <p><strong>Filename:</strong> ${imageData.name}</p>
                <p><strong>Size:</strong> ${(imageData.size / 1024).toFixed(2)} KB</p>
                <p><strong>Last Modified:</strong> ${new Date(imageData.lastModified).toLocaleString()}</p>
              </div>
            </div>
          </body>
        </html>
      `);
    }
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
        room2: {
          groups: {
            1: [
              {
                id: "p1",
                question: "Looking at the pedigree, what type of inheritance pattern does this trait follow?",
                type: "multiple_choice",
                answer: "X-linked recessive",
                options: ["Autosomal dominant", "Autosomal recessive", "X-linked recessive", "X-linked dominant"]
              },
              {
                id: "p2",
                question: "What is the genotype of the affected individual?",
                type: "multiple_choice",
                answer: "XdXd",
                options: ["XDXd", "XdXd", "XdXd RB", "XDXd BB"]
              },
              {
                id: "p3",
                question: "What percentage of offspring would be affected?",
                type: "multiple_choice",
                answer: "25%",
                options: ["0%", "25%", "50%", "100%"]
              }
            ]
          }
        },
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
    
    let defaultPuzzles = [];
    if (room === 'room2') {
      // Room 2 needs exactly 3 questions for the 3 locks
      defaultPuzzles = [
        {
          id: "p1",
          question: "Question 1 for the pedigree analysis...",
          type: "multiple_choice",
          answer: "Option A",
          options: ["Option A", "Option B", "Option C", "Option D"]
        },
        {
          id: "p2",
          question: "Question 2 for the pedigree analysis...",
          type: "multiple_choice",
          answer: "Option A",
          options: ["Option A", "Option B", "Option C", "Option D"]
        },
        {
          id: "p3",
          question: "Question 3 for the pedigree analysis...",
          type: "multiple_choice",
          answer: "Option A",
          options: ["Option A", "Option B", "Option C", "Option D"]
        }
      ];
    }
    
    setPuzzles(prev => ({
      ...prev,
      [room]: {
        ...prev[room],
        groups: {
          ...prev[room].groups,
          [newGroupNumber]: defaultPuzzles
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
              { id: 'room1', name: 'Room 1 Settings', icon: '🧩' },
              { id: 'room2', name: 'Room 2 Settings', icon: '🔬' },
              { id: 'room3', name: 'Room 3 Settings', icon: '🎲' },
              { id: 'room4', name: 'Room 4 Settings', icon: '🌍' }
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
            <h3 className="font-semibold text-blue-800 mb-2">📚 Group-Based Content Management</h3>
            <p className="text-blue-700 text-sm">
              Create different content for each group (1-15). Students will automatically receive content 
              based on their group number entered during registration. Configure puzzles, images, and settings for each group.
            </p>
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

        {/* Room Settings */}
        {['room1', 'room2', 'room3', 'room4'].includes(activeTab) && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {activeTab === 'room1' ? 'Room 1 - Molecular Genetics Settings' :
                 activeTab === 'room2' ? 'Room 2 - Pedigree Analysis Settings' :
                 activeTab === 'room3' ? 'Room 3 - Probability Genetics Settings' :
                 'Room 4 - Population Genetics Settings'}
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

            {/* Group-Based Game Settings for Room 1 */}
            {activeTab === 'room1' && (
              <div className="mb-6 bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Group-Based Genetic Code Settings</h3>
                <p className="text-sm text-gray-600 mb-4">Configure different genetic sequences for each group</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(15)].map((_, i) => {
                    const groupNumber = i + 1;
                    const groupSettings = gameSettings.groups[groupNumber] || {
                      wildTypeSequence: "3'CGACGATACGGAGGGGTCACTCCT5'",
                      highlightedNucleotide: "G",
                      highlightedPosition: 11
                    };
                    
                    return (
                      <div key={groupNumber} className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-700 mb-3">Group {groupNumber}</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Wild Type Sequence
                            </label>
                            <input
                              type="text"
                              value={groupSettings.wildTypeSequence}
                              onChange={(e) => updateGroupGameSettings(groupNumber, 'wildTypeSequence', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Highlighted Nucleotide
                            </label>
                            <input
                              type="text"
                              value={groupSettings.highlightedNucleotide}
                              onChange={(e) => updateGroupGameSettings(groupNumber, 'highlightedNucleotide', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Highlighted Position
                            </label>
                            <input
                              type="number"
                              value={groupSettings.highlightedPosition}
                              onChange={(e) => updateGroupGameSettings(groupNumber, 'highlightedPosition', parseInt(e.target.value))}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4">
                  <button
                    onClick={saveGameSettings}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save All Group Settings
                  </button>
                </div>
              </div>
            )}

            {/* Group Selection */}
            <div className="mb-6 bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Select Group to Edit Questions:</h3>
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
                    {activeTab === 'room2' && (
                      <div className="text-xs mt-1">
                        {puzzles[activeTab].groups[groupNum]?.length || 0}/3 questions
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              {selectedGroup && (
                <div className="mt-4 flex gap-2">
                  {activeTab !== 'room2' && (
                    <button
                      onClick={() => addNewPuzzle(activeTab, selectedGroup)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      + Add Question to Group {selectedGroup}
                    </button>
                  )}
                  {activeTab === 'room2' && puzzles[activeTab].groups[selectedGroup]?.length !== 3 && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded-lg text-sm">
                      Room 2 requires exactly 3 questions (one for each lock). 
                      {puzzles[activeTab].groups[selectedGroup]?.length < 3 && (
                        <button
                          onClick={() => addNewPuzzle(activeTab, selectedGroup)}
                          className="ml-2 bg-yellow-600 text-white px-2 py-1 rounded text-xs hover:bg-yellow-700"
                        >
                          Add Question
                        </button>
                      )}
                    </div>
                  )}
                  
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

            {/* Questions for Selected Group */}
            {selectedGroup && puzzles[activeTab].groups[selectedGroup] && (
              <div className="space-y-6">
                {puzzles[activeTab].groups[selectedGroup].map((puzzle, index) => (
                  <div key={puzzle.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Group {selectedGroup} - Question {index + 1}
                        {activeTab === 'room2' && ` (Lock ${index + 1})`}
                      </h3>
                      {(activeTab !== 'room2' || puzzles[activeTab].groups[selectedGroup].length > 3) && (
                        <button
                          onClick={() => deletePuzzle(activeTab, selectedGroup, puzzle.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      )}
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

                      {/* Question Image Upload for Room 2 */}
                      {activeTab === 'room2' && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                          <h4 className="font-medium text-gray-700 mb-2">Question Image</h4>
                          <p className="text-sm text-gray-600 mb-3">Upload an image for this specific question</p>
                          
                          {pedigreeImages[`${activeTab}_group${selectedGroup}_${puzzle.id}`] ? (
                            <div className="space-y-2">
                              <img
                                src={pedigreeImages[`${activeTab}_group${selectedGroup}_${puzzle.id}`].data}
                                alt={`Question ${puzzle.id} image`}
                                className="w-full max-w-md h-32 object-cover rounded border"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => previewQuestionImage(activeTab, selectedGroup, puzzle.id)}
                                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                >
                                  Preview
                                </button>
                                <button
                                  onClick={() => removeQuestionImage(activeTab, selectedGroup, puzzle.id)}
                                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                                <span className="text-gray-400">No image uploaded</span>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleQuestionImageUpload(e, activeTab, selectedGroup, puzzle.id)}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                disabled={uploadingImages[`${activeTab}_${selectedGroup}_${puzzle.id}`]}
                              />
                            </div>
                          )}
                        </div>
                      )}

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
                
                {puzzles[activeTab].groups[selectedGroup].length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No questions created for Group {selectedGroup} yet.</p>
                    <p className="text-sm mt-2">Click "Add Question" to create your first question.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorInterface;
