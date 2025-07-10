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
  const [crossSettings, setCrossSettings] = useState({
    groups: {}
  });
  const [imageSettings, setImageSettings] = useState({});
  const [studentProgress, setStudentProgress] = useState([]);
  const [detailedStudentData, setDetailedStudentData] = useState([]);
  const [feedbackSettings, setFeedbackSettings] = useState({});
  const [questionImages, setQuestionImages] = useState({});
  const [uploadingImages, setUploadingImages] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [wordSettings, setWordSettings] = useState({
    targetWord: '',
    numGroups: 15,
    groupLetters: {}
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadPuzzles();
      loadGameSettings();
      loadCrossSettings();
      loadImageSettings();
      loadStudentProgress();
      loadDetailedStudentData();
      loadFeedbackSettings();
      loadQuestionImages();
      loadWordSettings();
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

  const loadWordSettings = () => {
    const savedSettings = localStorage.getItem('instructor-word-settings');
    if (savedSettings) {
      setWordSettings(JSON.parse(savedSettings));
    } else {
      // Initialize with default settings
      const defaultSettings = {
        targetWord: 'GENETICS',
        numGroups: 15,
        groupLetters: {}
      };
      // Auto-assign letters for default word
      assignLettersToGroups(defaultSettings, 'GENETICS', 15);
      setWordSettings(defaultSettings);
    }
  };

  const assignLettersToGroups = (settings, word, numGroups) => {
    if (!word || numGroups < 1) return;
    
    const letters = word.toUpperCase().split('');
    const newGroupLetters = {};
    
    // Create an array of letters repeated enough times to cover all groups
    const expandedLetters = [];
    for (let i = 0; i < numGroups; i++) {
      expandedLetters.push(letters[i % letters.length]);
    }
    
    // Shuffle the letters randomly using Fisher-Yates shuffle algorithm
    const shuffledLetters = [...expandedLetters];
    for (let i = shuffledLetters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledLetters[i], shuffledLetters[j]] = [shuffledLetters[j], shuffledLetters[i]];
    }
    
    // Assign shuffled letters to groups
    for (let i = 1; i <= numGroups; i++) {
      newGroupLetters[i] = shuffledLetters[i - 1];
    }
    
    settings.groupLetters = newGroupLetters;
  };

  const handleWordChange = (newWord) => {
    const updatedSettings = {
      ...wordSettings,
      targetWord: newWord.toUpperCase()
    };
    
    if (newWord.trim()) {
      assignLettersToGroups(updatedSettings, newWord, wordSettings.numGroups);
    }
    
    setWordSettings(updatedSettings);
  };

  const handleNumGroupsChange = (newNumGroups) => {
    const num = parseInt(newNumGroups);
    if (isNaN(num) || num < 1) return;
    
    const updatedSettings = {
      ...wordSettings,
      numGroups: num
    };
    
    if (wordSettings.targetWord.trim()) {
      assignLettersToGroups(updatedSettings, wordSettings.targetWord, num);
    }
    
    setWordSettings(updatedSettings);
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

  const loadCrossSettings = () => {
    const savedSettings = localStorage.getItem('instructor-cross-settings');
    if (savedSettings) {
      setCrossSettings(JSON.parse(savedSettings));
    } else {
      // Initialize with default cross settings for each group
      const defaultSettings = {
        groups: {}
      };
      for (let i = 1; i <= 15; i++) {
        defaultSettings.groups[i] = {
          female: 'BY Dd',
          male: 'BR d',
          description: 'Cross: Female (BY Dd) × Male (BR d)',
          notes: [
            'Scale Color: B = Blue, R = Red, Y = Yellow (codominant)',
            'Dark Vision: D = Dark vision, d = no dark vision',
            'Sex-linked: Dark vision is X-linked recessive'
          ]
        };
      }
      setCrossSettings(defaultSettings);
    }
  };

  const loadImageSettings = () => {
    const savedSettings = localStorage.getItem('instructor-image-settings');
    if (savedSettings) {
      setImageSettings(JSON.parse(savedSettings));
    }
  };

  // Single save function that saves everything
  const saveAllSettings = async () => {
    setIsSaving(true);
    try {
      // Save all settings to localStorage
      localStorage.setItem('instructor-puzzles', JSON.stringify(puzzles));
      localStorage.setItem('instructor-game-settings', JSON.stringify(gameSettings));
      localStorage.setItem('instructor-cross-settings', JSON.stringify(crossSettings));
      localStorage.setItem('instructor-image-settings', JSON.stringify(imageSettings));
      localStorage.setItem('instructor-feedback', JSON.stringify(feedbackSettings));
      localStorage.setItem('instructor-question-images', JSON.stringify(questionImages));
      localStorage.setItem('instructor-word-settings', JSON.stringify(wordSettings));
      
      // Simulate a brief delay to show the saving state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('All settings saved successfully!');
    } catch (error) {
      alert('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
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

  const updateGroupCrossSettings = (groupNumber, field, value) => {
    setCrossSettings(prev => ({
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

  const updateCrossNote = (groupNumber, noteIndex, value) => {
    setCrossSettings(prev => ({
      ...prev,
      groups: {
        ...prev.groups,
        [groupNumber]: {
          ...prev.groups[groupNumber],
          notes: prev.groups[groupNumber].notes.map((note, index) => 
            index === noteIndex ? value : note
          )
        }
      }
    }));
  };

  const addCrossNote = (groupNumber) => {
    setCrossSettings(prev => ({
      ...prev,
      groups: {
        ...prev.groups,
        [groupNumber]: {
          ...prev.groups[groupNumber],
          notes: [...prev.groups[groupNumber].notes, 'New note: Add your text here']
        }
      }
    }));
  };

  const removeCrossNote = (groupNumber, noteIndex) => {
    setCrossSettings(prev => ({
      ...prev,
      groups: {
        ...prev.groups,
        [groupNumber]: {
          ...prev.groups[groupNumber],
          notes: prev.groups[groupNumber].notes.filter((_, index) => index !== noteIndex)
        }
      }
    }));
  };

  const toggleImageExpected = (room, groupNumber, questionId) => {
    const settingKey = `${room}_group${groupNumber}_${questionId}`;
    setImageSettings(prev => ({
      ...prev,
      [settingKey]: !prev[settingKey]
    }));
  };

  const loadFeedbackSettings = () => {
    const savedFeedback = localStorage.getItem('instructor-feedback');
    if (savedFeedback) {
      setFeedbackSettings(JSON.parse(savedFeedback));
    }
  };

  const loadQuestionImages = () => {
    const savedImages = localStorage.getItem('instructor-question-images');
    if (savedImages) {
      setQuestionImages(JSON.parse(savedImages));
    }
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
        setQuestionImages(prev => ({
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

  // Special handler for Room 3 pedigree images
  const handlePedigreeImageUpload = (event, groupNumber) => {
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

      const uploadKey = `room3_${groupNumber}_pedigree`;
      setUploadingImages(prev => ({ ...prev, [uploadKey]: true }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageKey = `room3_group${groupNumber}_pedigree`;
        setQuestionImages(prev => ({
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
      setQuestionImages(prev => {
        const updated = { ...prev };
        delete updated[imageKey];
        return updated;
      });
    }
  };

  const removePedigreeImage = (groupNumber) => {
    if (confirm('Are you sure you want to remove this pedigree image?')) {
      const imageKey = `room3_group${groupNumber}_pedigree`;
      setQuestionImages(prev => {
        const updated = { ...prev };
        delete updated[imageKey];
        return updated;
      });
    }
  };

  const previewQuestionImage = (room, groupNumber, questionId) => {
    const imageKey = `${room}_group${groupNumber}_${questionId}`;
    const imageData = questionImages[imageKey];
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
      const loadedPuzzles = JSON.parse(savedPuzzles);
      
      // Ensure Room 4 groups have help questions
      if (loadedPuzzles.room4 && loadedPuzzles.room4.groups) {
        Object.keys(loadedPuzzles.room4.groups).forEach(groupNum => {
          const groupPuzzles = loadedPuzzles.room4.groups[groupNum];
          const hasHelpQuestion = groupPuzzles.some(p => p.id === 'help');
          
          if (!hasHelpQuestion) {
            groupPuzzles.push({
              id: "help",
              question: "What does the Hardy-Weinberg principle describe?",
              type: "multiple_choice",
              answer: "The genetic equilibrium in populations",
              options: [
                "The genetic equilibrium in populations",
                "The rate of mutations in DNA",
                "The process of natural selection",
                "The inheritance of dominant traits"
              ]
            });
          }
        });
      }
      
      setPuzzles(loadedPuzzles);
    } else {
      // Initialize with default structure including help questions
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
        room4: { 
          groups: {
            1: [
              {
                id: "help",
                question: "What does the Hardy-Weinberg principle describe?",
                type: "multiple_choice",
                answer: "The genetic equilibrium in populations",
                options: [
                  "The genetic equilibrium in populations",
                  "The rate of mutations in DNA",
                  "The process of natural selection",
                  "The inheritance of dominant traits"
                ]
              }
            ]
          }
        }
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

  // Updated addNewPuzzle function to avoid adding help questions manually
  const addNewPuzzle = (room, groupNumber) => {
    const existingPuzzles = puzzles[room].groups[groupNumber] || [];
    const regularPuzzles = existingPuzzles.filter(p => p.id !== 'help');
    const helpQuestion = existingPuzzles.find(p => p.id === 'help');
    
    const newPuzzle = {
      id: `p${regularPuzzles.length + 1}`,
      question: 'New question here...',
      type: 'text',
      answer: 'Correct answer here...',
      options: []
    };
    
    const updatedPuzzles = [...regularPuzzles, newPuzzle];
    if (helpQuestion) {
      updatedPuzzles.push(helpQuestion);
    }
    
    setPuzzles(prev => ({
      ...prev,
      [room]: {
        ...prev[room],
        groups: {
          ...prev[room].groups,
          [groupNumber]: updatedPuzzles
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
    if (puzzleId === 'help') {
      alert('Cannot delete the help question. You can edit it instead.');
      return;
    }
    
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
    } else if (room === 'room4') {
      // Room 4 includes help question
      defaultPuzzles = [
        {
          id: "help",
          question: "What does the Hardy-Weinberg principle describe?",
          type: "multiple_choice",
          answer: "The genetic equilibrium in populations",
          options: [
            "The genetic equilibrium in populations",
            "The rate of mutations in DNA",
            "The process of natural selection",
            "The inheritance of dominant traits"
          ]
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
            <div className="flex items-center space-x-4">
              {/* Single Save Button */}
              <button
                onClick={saveAllSettings}
                disabled={isSaving}
                className={`px-6 py-3 rounded-lg font-semibold text-lg transition-all transform ${
                  isSaving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 hover:scale-105 shadow-lg'
                }`}
              >
                {isSaving ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </span>
                ) : (
                  '💾 Save All Settings'
                )}
              </button>
              
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
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
              { id: 'data-management', name: 'Data Management', icon: '🗂️' },
              { id: 'word-settings', name: 'Word Scramble', icon: '🧩' },
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
        {/* Save Reminder Notice */}
        {['room1', 'room2', 'room3', 'room4', 'feedback', 'word-settings'].includes(activeTab) && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">💾 Save Reminder</h3>
            <p className="text-green-700 text-sm">
              Don't forget to click the "Save All Settings" button in the header after making changes. 
              This will save all your puzzles, images, cross settings, word settings, and feedback rules at once.
            </p>
          </div>
        )}

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

        {/* Data Management Tab */}
        {activeTab === 'data-management' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">🗂️ Data Management & Cleanup</h2>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Current Data Status</h3>
              
              {/* Data Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-blue-800 font-semibold">Student Progress</div>
                  <div className="text-2xl font-bold text-blue-600">{studentProgress.length}</div>
                  <div className="text-sm text-blue-600">student records</div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-green-800 font-semibold">Detailed Attempts</div>
                  <div className="text-2xl font-bold text-green-600">{detailedStudentData.length}</div>
                  <div className="text-sm text-green-600">answer attempts</div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-purple-800 font-semibold">Class Completions</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {(() => {
                      const classProgress = localStorage.getItem('class-letters-progress');
                      return classProgress ? JSON.parse(classProgress).length : 0;
                    })()}
                  </div>
                  <div className="text-sm text-purple-600">groups completed</div>
                </div>
              </div>
              
              {/* Word Scramble Status */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-yellow-800 mb-2">Word Scramble Status</h4>
                <div className="text-sm text-yellow-700">
                  {(() => {
                    const classProgress = localStorage.getItem('class-letters-progress');
                    const wordSettings = localStorage.getItem('instructor-word-settings');
                    
                    if (!wordSettings) {
                      return "⚠️ Word scramble not configured yet";
                    }
                    
                    const settings = JSON.parse(wordSettings);
                    const completions = classProgress ? JSON.parse(classProgress) : [];
                    
                    return (
                      <div>
                        <p>Target word: <strong>{settings.targetWord || 'Not set'}</strong></p>
                        <p>Groups with letters: {completions.length} / {Object.keys(settings.groupLetters || {}).length}</p>
                        <p>Available letters: {completions.map(c => c.letter).join(', ') || 'None yet'}</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">⚠️ Data Cleanup Operations</h3>
              <p className="text-gray-600 mb-6">
                Use these tools to clear data between class sessions or when testing. 
                <strong className="text-red-600"> Warning: These actions cannot be undone!</strong>
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Clear Class Progress */}
                <div className="border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Clear Word Scramble Progress</h4>
                  <p className="text-sm text-red-600 mb-4">
                    Removes all group completion records from the word scramble. Use this to start fresh for a new class session.
                  </p>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to clear ALL word scramble progress? This will remove all group completion records and reset the word scramble.')) {
                        localStorage.removeItem('class-letters-progress');
                        localStorage.removeItem('word-scramble-success');
                        alert('Word scramble progress cleared! The word scramble page will now show no completions.');
                      }
                    }}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                  >
                    🗑️ Clear Word Scramble Data
                  </button>
                </div>
                
                {/* Clear Student Data */}
                <div className="border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-2">Clear Student Tracking Data</h4>
                  <p className="text-sm text-orange-600 mb-4">
                    Removes all student progress and detailed answer tracking. Use this to clear test data before real class use.
                  </p>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to clear ALL student tracking data? This includes progress records and detailed answer attempts.')) {
                        localStorage.removeItem('instructor-student-progress');
                        localStorage.removeItem('instructor-student-data');
                        setStudentProgress([]);
                        setDetailedStudentData([]);
                        alert('Student tracking data cleared!');
                      }
                    }}
                    className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-semibold"
                  >
                    📊 Clear Student Data
                  </button>
                </div>
                
                {/* Clear Everything */}
                <div className="border border-gray-800 rounded-lg p-4 md:col-span-2">
                  <h4 className="font-semibold text-gray-800 mb-2">Nuclear Option: Clear Everything</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Removes ALL data including student progress, word scramble progress, and detailed tracking. 
                    <strong className="text-red-600"> Only use this for a complete reset!</strong>
                  </p>
                  <button
                    onClick={() => {
                      if (confirm('⚠️ DANGER: This will delete ALL student data, word scramble progress, and tracking information. Are you absolutely sure?')) {
                        if (confirm('This is your final warning. ALL DATA WILL BE PERMANENTLY DELETED. Proceed?')) {
                          // Clear all student and progress data
                          localStorage.removeItem('instructor-student-progress');
                          localStorage.removeItem('instructor-student-data');
                          localStorage.removeItem('class-letters-progress');
                          localStorage.removeItem('word-scramble-success');
                          
                          // Reset state
                          setStudentProgress([]);
                          setDetailedStudentData([]);
                          
                          alert('🧹 Complete data wipe completed! All student and progress data has been cleared.');
                        }
                      }
                    }}
                    className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors text-sm font-semibold"
                  >
                    💥 CLEAR EVERYTHING
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">💡 Recommended Workflow</h4>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. <strong>Before class:</strong> Configure word scramble settings and clear old data</li>
                <li>2. <strong>During class:</strong> Students complete rooms and contribute letters automatically</li>
                <li>3. <strong>After class:</strong> Export student data, then clear progress for next session</li>
                <li>4. <strong>Between semesters:</strong> Use "Clear Everything" for a complete reset</li>
              </ol>
            </div>
          </div>
        )}

        {/* Word Scramble Settings Tab */}
        {activeTab === 'word-settings' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">🧩 Word Scramble Settings</h2>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Target Word Configuration</h3>
              <p className="text-gray-600 mb-6">
                Set up the target word for the class word scramble challenge. Letters will be automatically 
                distributed <strong>randomly</strong> among the groups to prevent students from guessing letter positions.
              </p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Word
                  </label>
                  <input
                    type="text"
                    value={wordSettings.targetWord}
                    onChange={(e) => handleWordChange(e.target.value)}
                    placeholder="Enter the target word (e.g., GENETICS)"
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg uppercase"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter a word related to genetics. Letters will be distributed to groups automatically.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Groups
                  </label>
                  <input
                    type="number"
                    value={wordSettings.numGroups}
                    onChange={(e) => handleNumGroupsChange(e.target.value)}
                    min="1"
                    max="50"
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Specify how many groups will participate in the activity.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Letter Distribution Preview */}
            {wordSettings.targetWord && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Letter Distribution Preview</h3>
                <p className="text-gray-600 mb-4">
                  Preview how letters will be assigned to each group:
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                  {Object.entries(wordSettings.groupLetters).map(([groupNum, letter]) => (
                    <div
                      key={groupNum}
                      className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg text-center border border-blue-200"
                    >
                      <div className="font-bold text-blue-800">Group {groupNum}</div>
                      <div className="text-3xl font-bold text-blue-600 mt-1">{letter}</div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Letter Distribution Logic:</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>• Target word: <strong>{wordSettings.targetWord}</strong></p>
                    <p>• Word length: <strong>{wordSettings.targetWord.length} letters</strong></p>
                    <p>• Number of groups: <strong>{wordSettings.numGroups}</strong></p>
                    <p>• Letters are distributed <strong>randomly</strong> to prevent students from guessing letter positions</p>
                    <p>• If there are more groups than letters, some letters will be assigned to multiple groups</p>
                    <p>• Each time you change the word or group count, letters are redistributed randomly</p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <button
                      onClick={() => {
                        const updatedSettings = { ...wordSettings };
                        assignLettersToGroups(updatedSettings, wordSettings.targetWord, wordSettings.numGroups);
                        setWordSettings(updatedSettings);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      🎲 Randomize Letter Distribution Again
                    </button>
                    <p className="text-xs text-blue-600 mt-2">
                      Click this button to shuffle the letter assignments to different groups
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feedback Management Tab */}
        {activeTab === 'feedback' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Feedback Management</h2>
              <button
                onClick={exportPuzzles}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                📤 Export Puzzles
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

        {/* Room Settings - Simplified without multiple save buttons */}
        {['room1', 'room2', 'room3', 'room4'].includes(activeTab) && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {activeTab === 'room1' ? 'Room 1 - Molecular Genetics Settings' :
                 activeTab === 'room2' ? 'Room 2 - Pedigree Analysis Settings' :
                 activeTab === 'room3' ? 'Room 3 - Probability Genetics Settings' :
                 'Room 4 - Population Genetics Settings'}
              </h2>
              <button
                onClick={() => addNewGroup(activeTab)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                + Add Group
              </button>
            </div>

            {/* Room 1 Specific Settings */}
            {activeTab === 'room1' && (
              <div className="mb-6 bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Select Group to Edit</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {[...Array(15)].map((_, i) => {
                    const groupNumber = i + 1;
                    return (
                      <button
                        key={groupNumber}
                        onClick={() => setSelectedGroup(groupNumber)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedGroup === groupNumber
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Group {groupNumber}
                      </button>
                    );
                  })}
                </div>

                {/* Group-Specific Genetic Code Settings */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-700 mb-4">
                    Genetic Code Settings for Group {selectedGroup}
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Wild Type Genetic Sequence
                      </label>
                      <input
                        type="text"
                        value={gameSettings.groups[selectedGroup]?.wildTypeSequence || "3'CGACGATACGGAGGGGTCACTCCT5'"}
                        onChange={(e) => updateGroupGameSettings(selectedGroup, 'wildTypeSequence', e.target.value)}
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
                        value={gameSettings.groups[selectedGroup]?.highlightedNucleotide || "G"}
                        onChange={(e) => updateGroupGameSettings(selectedGroup, 'highlightedNucleotide', e.target.value)}
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
                        value={gameSettings.groups[selectedGroup]?.highlightedPosition || 11}
                        onChange={(e) => updateGroupGameSettings(selectedGroup, 'highlightedPosition', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter position number"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Room 3 Specific Settings */}
            {activeTab === 'room3' && (
              <div className="mb-6 bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Select Group to Edit Cross Settings</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {[...Array(15)].map((_, i) => {
                    const groupNumber = i + 1;
                    return (
                      <button
                        key={groupNumber}
                        onClick={() => setSelectedGroup(groupNumber)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedGroup === groupNumber
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Group {groupNumber}
                      </button>
                    );
                  })}
                </div>

                {/* Group-Specific Cross Settings */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-700 mb-4">
                    Genetic Cross Settings for Group {selectedGroup}
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Female Genotype
                      </label>
                      <input
                        type="text"
                        value={crossSettings.groups[selectedGroup]?.female || 'BY Dd'}
                        onChange={(e) => updateGroupCrossSettings(selectedGroup, 'female', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        placeholder="Enter female genotype"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Male Genotype
                      </label>
                      <input
                        type="text"
                        value={crossSettings.groups[selectedGroup]?.male || 'BR d'}
                        onChange={(e) => updateGroupCrossSettings(selectedGroup, 'male', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        placeholder="Enter male genotype"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cross Description
                      </label>
                      <input
                        type="text"
                        value={crossSettings.groups[selectedGroup]?.description || 'Cross: Female (BY Dd) × Male (BR d)'}
                        onChange={(e) => updateGroupCrossSettings(selectedGroup, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter cross description"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Genetic Information Notes
                      </label>
                      <div className="space-y-2">
                        {(crossSettings.groups[selectedGroup]?.notes || []).map((note, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={note}
                              onChange={(e) => updateCrossNote(selectedGroup, index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter genetic information note"
                            />
                            <button
                              onClick={() => removeCrossNote(selectedGroup, index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addCrossNote(selectedGroup)}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                        >
                          + Add Note
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pedigree Image Upload for Room 3 */}
                <div className="mt-6 border-t pt-6">
                  <h4 className="font-semibold text-gray-700 mb-4">
                    Pedigree Image for Group {selectedGroup}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a pedigree image specific to Room 3 for this group. If no image is uploaded, 
                    Room 3 will automatically use pedigree images from Room 2 if available.
                  </p>
                  
                  {questionImages[`room3_group${selectedGroup}_pedigree`] ? (
                    <div className="space-y-2">
                      <img
                        src={questionImages[`room3_group${selectedGroup}_pedigree`].data}
                        alt={`Pedigree for Group ${selectedGroup}`}
                        className="w-full max-w-md h-32 object-cover rounded border"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const imageData = questionImages[`room3_group${selectedGroup}_pedigree`];
                            const newWindow = window.open('', '_blank');
                            newWindow.document.write(`
                              <html>
                                <head><title>Pedigree Chart - Group ${selectedGroup}</title></head>
                                <body style="margin: 20px; text-align: center;">
                                  <h2>Room 3 Pedigree Chart - Group ${selectedGroup}</h2>
                                  <img src="${imageData.data}" style="max-width: 100%; border: 2px solid #ddd;" />
                                </body>
                              </html>
                            `);
                          }}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => removePedigreeImage(selectedGroup)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                        <span className="text-gray-400">No pedigree image uploaded</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePedigreeImageUpload(e, selectedGroup)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        disabled={uploadingImages[`room3_${selectedGroup}_pedigree`]}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Group Selection for Questions */}
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
                  {activeTab !== 'room2' ? (
                    <button
                      onClick={() => addNewPuzzle(activeTab, selectedGroup)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      + Add Question to Group {selectedGroup}
                    </button>
                  ) : (
                    puzzles[activeTab].groups[selectedGroup]?.length !== 3 && (
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
                    )
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

            {/* Help Question Management - ONLY for Room 4 */}
            {activeTab === 'room4' && selectedGroup && (
              <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-orange-800 mb-4">🆘 Help Question Settings</h3>
                <p className="text-orange-700 text-sm mb-4">
                  Configure the help question that students can access when they click "Need Help?" in Room 4. 
                  When answered correctly, this unlocks the Hardy-Weinberg equations.
                </p>
                
                {(() => {
                  const groupPuzzles = puzzles[activeTab].groups[selectedGroup] || [];
                  const helpQuestion = groupPuzzles.find(p => p.id === 'help') || {
                    id: 'help',
                    question: 'What does the Hardy-Weinberg principle describe?',
                    type: 'multiple_choice',
                    answer: 'The genetic equilibrium in populations',
                    options: [
                      'The genetic equilibrium in populations',
                      'The rate of mutations in DNA',
                      'The process of natural selection',
                      'The inheritance of dominant traits'
                    ]
                  };
                  
                  return (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-orange-700 mb-2">Help Question</label>
                        <textarea
                          value={helpQuestion.question}
                          onChange={(e) => {
                            const updatedQuestion = { ...helpQuestion, question: e.target.value };
                            const updatedPuzzles = groupPuzzles.filter(p => p.id !== 'help');
                            updatedPuzzles.push(updatedQuestion);
                            setPuzzles(prev => ({
                              ...prev,
                              [activeTab]: {
                                ...prev[activeTab],
                                groups: {
                                  ...prev[activeTab].groups,
                                  [selectedGroup]: updatedPuzzles
                                }
                              }
                            }));
                          }}
                          className="w-full px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          rows="3"
                          placeholder="Enter the help question..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-orange-700 mb-2">Correct Answer</label>
                        <input
                          type="text"
                          value={helpQuestion.answer}
                          onChange={(e) => {
                            const updatedQuestion = { ...helpQuestion, answer: e.target.value };
                            const updatedPuzzles = groupPuzzles.filter(p => p.id !== 'help');
                            updatedPuzzles.push(updatedQuestion);
                            setPuzzles(prev => ({
                              ...prev,
                              [activeTab]: {
                                ...prev[activeTab],
                                groups: {
                                  ...prev[activeTab].groups,
                                  [selectedGroup]: updatedPuzzles
                                }
                              }
                            }));
                          }}
                          className="w-full px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Enter the correct answer..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-orange-700 mb-2">Answer Options</label>
                        {helpQuestion.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center space-x-2 mb-2">
                            <input
                              type="radio"
                              name={`helpAnswer-${selectedGroup}`}
                              checked={helpQuestion.answer === option}
                              onChange={() => {
                                const updatedQuestion = { ...helpQuestion, answer: option };
                                const updatedPuzzles = groupPuzzles.filter(p => p.id !== 'help');
                                updatedPuzzles.push(updatedQuestion);
                                setPuzzles(prev => ({
                                  ...prev,
                                  [activeTab]: {
                                    ...prev[activeTab],
                                    groups: {
                                      ...prev[activeTab].groups,
                                      [selectedGroup]: updatedPuzzles
                                    }
                                  }
                                }));
                              }}
                              className="text-orange-600"
                            />
                            <input
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...helpQuestion.options];
                                newOptions[optIndex] = e.target.value;
                                const updatedQuestion = { ...helpQuestion, options: newOptions };
                                const updatedPuzzles = groupPuzzles.filter(p => p.id !== 'help');
                                updatedPuzzles.push(updatedQuestion);
                                setPuzzles(prev => ({
                                  ...prev,
                                  [activeTab]: {
                                    ...prev[activeTab],
                                    groups: {
                                      ...prev[activeTab].groups,
                                      [selectedGroup]: updatedPuzzles
                                    }
                                  }
                                }));
                              }}
                              className="flex-1 px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <button
                              onClick={() => {
                                const newOptions = helpQuestion.options.filter((_, index) => index !== optIndex);
                                const updatedQuestion = { ...helpQuestion, options: newOptions };
                                const updatedPuzzles = groupPuzzles.filter(p => p.id !== 'help');
                                updatedPuzzles.push(updatedQuestion);
                                setPuzzles(prev => ({
                                  ...prev,
                                  [activeTab]: {
                                    ...prev[activeTab],
                                    groups: {
                                      ...prev[activeTab].groups,
                                      [selectedGroup]: updatedPuzzles
                                    }
                                  }
                                }));
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newOptions = [...helpQuestion.options, 'New option'];
                            const updatedQuestion = { ...helpQuestion, options: newOptions };
                            const updatedPuzzles = groupPuzzles.filter(p => p.id !== 'help');
                            updatedPuzzles.push(updatedQuestion);
                            setPuzzles(prev => ({
                              ...prev,
                              [activeTab]: {
                                ...prev[activeTab],
                                groups: {
                                  ...prev[activeTab].groups,
                                  [selectedGroup]: updatedPuzzles
                                }
                              }
                            }));
                          }}
                          className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
                        >
                          + Add Option
                        </button>
                      </div>
                      
                      <div className="bg-orange-100 border border-orange-300 rounded-lg p-4">
                        <h4 className="font-medium text-orange-800 mb-2">What happens when students answer correctly:</h4>
                        <div className="text-sm text-orange-700 space-y-1">
                          <p>✅ They see: "Population Genetics Equations Unlocked!"</p>
                          <p>📚 Equations shown: p + q = 1</p>
                          <p>📚 Equations shown: p² + 2pq + q² = 1</p>
                          <p>⚠️ Note: Specific allele frequencies are NOT provided (students must read the questions carefully)</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Questions for Selected Group */}
            {selectedGroup && puzzles[activeTab].groups[selectedGroup] && (
              <div className="space-y-6">
                {puzzles[activeTab].groups[selectedGroup]
                  .filter(puzzle => puzzle.id !== 'help') // Exclude help question from regular questions display
                  .map((puzzle, index) => (
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
                          <h4 className="font-medium text-gray-700 mb-2">Question Image Settings</h4>
                          <div className="mb-3">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={imageSettings[`room2_group${selectedGroup}_${puzzle.id}`] || false}
                                onChange={() => toggleImageExpected('room2', selectedGroup, puzzle.id)}
                                className="mr-2"
                              />
                              <span className="text-sm text-gray-700">
                                This question requires an image (students will see an error if no image is uploaded)
                              </span>
                            </label>
                          </div>
                          
                          {questionImages[`room2_group${selectedGroup}_${puzzle.id}`] ? (
                            <div className="space-y-2">
                              <img
                                src={questionImages[`room2_group${selectedGroup}_${puzzle.id}`].data}
                                alt={`Question ${puzzle.id} image`}
                                className="w-full max-w-md h-32 object-cover rounded border"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => previewQuestionImage('room2', selectedGroup, puzzle.id)}
                                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                >
                                  Preview
                                </button>
                                <button
                                  onClick={() => removeQuestionImage('room2', selectedGroup, puzzle.id)}
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
                                onChange={(e) => handleQuestionImageUpload(e, 'room2', selectedGroup, puzzle.id)}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                disabled={uploadingImages[`room2_${selectedGroup}_${puzzle.id}`]}
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
                
                {puzzles[activeTab].groups[selectedGroup].filter(p => p.id !== 'help').length === 0 && (
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
