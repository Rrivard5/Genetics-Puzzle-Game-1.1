import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';

export default function StudentInfo() {
  const [studentData, setStudentData] = useState({
    name: '',
    semester: '',
    year: new Date().getFullYear(),
    groupNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { setStudentInfo } = useGame();

  const validateForm = () => {
    const newErrors = {};
    
    if (!studentData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!studentData.semester.trim()) {
      newErrors.semester = 'Semester is required';
    }
    
    if (!studentData.year.toString().trim()) {
      newErrors.year = 'Year is required';
    } else if (isNaN(studentData.year) || studentData.year < 2020 || studentData.year > 2030) {
      newErrors.year = 'Please enter a valid year (2020-2030)';
    }
    
    if (!studentData.groupNumber.toString().trim()) {
      newErrors.groupNumber = 'Group number is required';
    } else if (isNaN(studentData.groupNumber) || studentData.groupNumber < 1 || studentData.groupNumber > 50) {
      newErrors.groupNumber = 'Please enter a valid group number (1-50)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Create new session (always a fresh start)
      const studentInfo = {
        ...studentData,
        sessionId: Date.now(), // Unique session ID
        startTime: new Date().toISOString()
      };
      
      // Clear any previous game data
      localStorage.removeItem('genetics-escape-progress');
      localStorage.removeItem('current-student-info');
      
      // Save to localStorage first
      localStorage.setItem('current-student-info', JSON.stringify(studentInfo));
      
      // Set in context
      setStudentInfo(studentInfo);
      
      // Navigate to Room1
      setTimeout(() => {
        setIsSubmitting(false);
        navigate('/room1');
      }, 500);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full border border-gray-200">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🧬</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Genetics Escape Room
          </h1>
          <p className="text-gray-600">
            Please enter your information before starting the adventure
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={studentData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
              disabled={isSubmitting}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester *
              </label>
              <select
                name="semester"
                value={studentData.semester}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.semester ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              >
                <option value="">Select semester</option>
                <option value="Spring">Spring</option>
                <option value="Fall">Fall</option>
                <option value="Summer">Summer</option>
              </select>
              {errors.semester && <p className="mt-1 text-sm text-red-600">{errors.semester}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year *
              </label>
              <input
                type="number"
                name="year"
                value={studentData.year}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.year ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="2024"
                min="2020"
                max="2030"
                disabled={isSubmitting}
              />
              {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Number *
            </label>
            <input
              type="number"
              name="groupNumber"
              value={studentData.groupNumber}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.groupNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your group number"
              min="1"
              max="50"
              disabled={isSubmitting}
            />
            {errors.groupNumber && <p className="mt-1 text-sm text-red-600">{errors.groupNumber}</p>}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-all transform shadow-lg ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:-translate-y-0.5 hover:shadow-xl text-white'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Starting Adventure...
                </span>
              ) : (
                '🚀 Start Genetics Adventure'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            All fields are required. Each session is tracked separately.
          </p>
        </div>
      </div>
    </div>
  );
}
