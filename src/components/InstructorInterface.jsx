import { useState, useEffect } from 'react';

const InstructorInterface = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

  // Load existing puzzles on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadPuzzles();
      loadGameSettings();
      loadStudentProgress();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    // Simple password check - in production, use proper authentication
    if (password === 'genetics2024') {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      alert('Incorrect password');
    }
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

  const loadPuzzles = () => {
    // Load puzzles from localStorage or use defaults
    const savedPuzzles = localStorage.getItem('instructor-puzzles');
    if (savedPuzzles) {
      setPuzzles(JSON.parse(savedPuzzles));
    } else {
      // Default puzzles
      setPuzzles({
        room1: [
          {
            id: "p1",
            question: "What type of mutation results from changing the highlighted G to A in the DNA sequence?",
            options: [
              "Point mutation from G to A",
              "Point mutation from G to C", 
              "Point mutation from G to T",
              "Insertion mutation"
            ],
            answer: "Point mutation from G to A",
            hint: "Look at the color coding - the mutation type is determined by the color of the highlighted nucleotide."
          },
          {
            id: "p2",
            question: "Based on the genetic code wheel, what amino acid sequence would result from the correct mutation in the previous question?",
            options: [
              "RPQ",
              "RSE", 
              "SPE",
              "SPQ"
            ],
            answer: "RPQ",
            hint: "Use the codon wheel to translate the mRNA sequence after the mutation occurs."
          },
          {
            id: "p3", 
            question: "Looking at the answer options in the table, which represents the correct translated product following the point mutation?",
            options: [
              "CPE → RPQ",
              "PPE → RSE",
              "PPQ → SPE", 
              "RPE → SPQ"
            ],
            answer: "CPE → RPQ",
            hint: "Compare the original sequence translation with the mutated sequence translation."
          }
        ],
        room2: [
          {
            id: "p1",
            question: "Looking at the pedigree for dark vision (Figure 2), what type of inheritance pattern does this trait follow?",
            options: [
              "Autosomal dominant",
              "Autosomal recessive", 
              "X-linked recessive",
              "X-linked dominant"
            ],
            answer: "X-linked recessive"
          },
          {
            id: "p2",
            question: "In the same pedigree family, what is individual 9's genotype for dark vision AND scale color?",
            options: [
              "XDXd RB",
              "XdXd BB", 
              "XdXd RB",
              "XDXd BB"
            ],
            answer: "XdXd BB"
          },
          {
            id: "p3",
            question: "Based on the inheritance patterns shown, if individual 9 had children with a normal vision male, what percentage of their daughters would have dark vision?",
            options: [
              "0%",
              "25%", 
              "50%",
              "100%"
            ],
            answer: "0%"
          }
        ],
        room3: [
          {
            id: "p1",
            question: "A female (BY Dd) and male (BR d) mate. What is the likelihood that one of their female offspring who does not have dark vision will have blue OR red scales?",
            options: [
              "1/8",
              "1/4",
              "1/2", 
              "3/4"
            ],
            answer: "1/2"
          },
          {
            id: "p2",
            question: "In the same cross (BY Dd × BR d), what is the probability of getting a male offspring with orange scales and dark vision?",
            options: [
              "1/8",
              "1/4",
              "1/2",
              "0"
            ],
            answer: "1/4"
          },
          {
            id: "p3",
            question: "If two loci are 33 centimorgans apart, what is the recombination frequency between them?",
            options: [
              "0%",
              "16.5%",
              "33%",
              "50%"
            ],
            answer: "33%"
          }
        ],
        room4: [
          {
            id: "p1",
            question: "A population of aliens is at Hardy-Weinberg equilibrium. The frequency of the dominant allele for wings is 0.6. What is the frequency of homozygous recessive genotypes in this population?",
            options: [
              "0.04",
              "0.16",
              "0.36",
              "0.64"
            ],
            answer: "0.16"
          },
          {
            id: "p2",
            question: "If a population is NOT in Hardy-Weinberg equilibrium, which of the following factors could be responsible?",
            options: [
              "Natural selection",
              "Gene flow (migration)",
              "Genetic drift",
              "All of the above"
            ],
            answer: "All of the above"
          },
          {
            id: "p3",
            question: "In RNA processing, which segments are removed from the pre-mRNA to create the final mature mRNA?",
            options: [
              "Exons",
              "Introns",
              "Both exons and introns",
              "Neither exons nor introns"
            ],
            answer: "Introns"
          }
        ]
      });
    }
  };

  const loadStudentProgress = () => {
    // Simulate student progress data
    const mockProgress = [
      { name: 'Alex Johnson', room1: 100, room2: 75, room3: 50, room4: 0, lastActivity: '2024-07-08 14:30' },
      { name: 'Sarah Kim', room1: 100, room2: 100, room3: 100, room4: 33, lastActivity: '2024-07-08 15:15' },
      { name: 'Mike Chen', room1: 100, room2: 100, room3: 0, room4: 0, lastActivity: '2024-07-08 13:45' },
      { name: 'Emma Davis', room1: 100, room2: 33, room3: 0, room4: 0, lastActivity: '2024-07-08 14:00' },
      { name: 'James Wilson', room1: 67, room2: 0, room3: 0, room4: 0, lastActivity: '2024-07-08 13:20' }
    ];
    setStudentProgress(mockProgress);
  };

  const savePuzzles = () => {
    localStorage.setItem('instructor-puzzles', JSON.stringify(puzzles));
    alert('Puzzles saved successfully!');
  };

  const exportPuzzles = () => {
    const dataStr = JSON.stringify(puzzles, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'genetics-escape-room-puzzles.json';
    link.click();
  };

  const addNewPuzzle = (room) => {
    const newPuzzle = {
      id: `p${puzzles[room].length + 1}`,
      question: 'New question here...',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      answer: 'Option A',
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
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Login
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
              onClick={() => setIsAuthenticated(false)}
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
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Student Progress Overview</h2>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${student.room1}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500">{student.room1}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${student.room2}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500">{student.room2}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-orange-600 h-2 rounded-full" 
                                style={{ width: `${student.room3}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500">{student.room3}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full" 
                                style={{ width: `${student.room4}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500">{student.room4}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.lastActivity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
                      {puzzle.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-2 mb-2">
                          <input
                            type="radio"
                            name={`answer-${puzzle.id}`}
                            checked={puzzle.answer === option}
                            onChange={() => updatePuzzle(activeTab, puzzle.id, { ...puzzle, answer: option })}
                            className="text-blue-600"
                          />
                          <input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...puzzle.options];
                              newOptions[optIndex] = e.target.value;
                              updatePuzzle(activeTab, puzzle.id, { ...puzzle, options: newOptions });
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}
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

export default InstructorInterface;
