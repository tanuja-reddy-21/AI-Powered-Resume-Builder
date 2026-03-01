import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { resumeAPI } from '../api'
import { Plus, FileText, Trash2, Eye } from 'lucide-react'

const Dashboard = () => {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNameModal, setShowNameModal] = useState(false)
  const [resumeName, setResumeName] = useState('')
  const [nameError, setNameError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadResumes()
  }, [])

  const loadResumes = async () => {
    try {
      setLoading(true)
      const data = await resumeAPI.getAll()
      if (Array.isArray(data)) {
        setResumes(data)
      } else {
        setResumes([])
      }
    } catch (error) {
      console.error('Error loading resumes:', error)
      setResumes([])
    } finally {
      setLoading(false)
    }
  }

  const validateResumeName = (name) => {
    const trimmed = name.trim()
    if (!trimmed) return 'Please enter a resume name to continue.'
    if (trimmed.length < 3) return 'Resume name must be at least 3 characters.'
    if (trimmed.length > 50) return 'Resume name must not exceed 50 characters.'
    return null
  }

  const handleCreateResume = () => {
    setShowNameModal(true)
    setResumeName('')
    setNameError('')
  }

  const createNewResume = async () => {
    const error = validateResumeName(resumeName)
    if (error) {
      setNameError(error)
      return
    }

    try {
      const newResume = await resumeAPI.create({ 
        title: resumeName.trim(),
        template: 'modern',
        accentColor: '#3b82f6',
        personal_info: { full_name: 'Your Name', email: 'your.email@example.com' },
        professional_summary: 'Write your professional summary here. This should be at least 50 characters long.',
        education: [{ institution: 'University Name', degree: 'Degree Name' }],
        skills: ['Skill 1', 'Skill 2', 'Skill 3'],
        project: [{ name: 'Project Name', description: 'Project description goes here' }]
      })
      if (newResume && newResume._id) {
        setShowNameModal(false)
        navigate(`/app/builder/${newResume._id}`)
      } else {
        alert('Failed to create resume')
      }
    } catch (error) {
      console.error('Error creating resume:', error)
      alert('Failed to create resume. Please try again.')
    }
  }

  const deleteResume = async (id) => {
    if (confirm('Delete this resume?')) {
      await resumeAPI.delete(id)
      loadResumes()
    }
  }

  return (
    <div>
      {/* Resume Name Modal */}
      {showNameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Name Your Resume</h2>
            <p className="text-gray-600 mb-6 text-sm">Give your resume a descriptive name to identify it easily</p>
            
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resume Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={resumeName}
              onChange={(e) => {
                setResumeName(e.target.value)
                setNameError('')
              }}
              onKeyPress={(e) => e.key === 'Enter' && createNewResume()}
              placeholder="e.g., AI Engineer – Fresher 2026, Internship Resume – ML"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none mb-2"
              autoFocus
              maxLength={50}
            />
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-gray-500">{resumeName.length}/50 characters</span>
              {nameError && <span className="text-xs text-red-600">{nameError}</span>}
            </div>

            {nameError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {nameError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowNameModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={createNewResume}
                disabled={!resumeName.trim()}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Resume
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Resumes</h1>
              <p className="text-gray-600 mt-1">Create and manage your professional resumes</p>
            </div>
            <button
              onClick={handleCreateResume}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              <Plus className="w-5 h-5" />
              Create New Resume
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <div key={resume._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <FileText className="w-10 h-10 text-green-600" />
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/view/${resume._id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Preview"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const duplicate = await resumeAPI.duplicate(resume._id)
                          if (duplicate._id) {
                            loadResumes()
                            alert('Resume duplicated successfully!')
                          }
                        } catch (error) {
                          alert('Failed to duplicate resume')
                        }
                      }}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                      title="Duplicate"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteResume(resume._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{resume.title}</h3>
                <div className="space-y-1 mb-4">
                  <p className="text-sm text-gray-500">
                    Updated {new Date(resume.updatedAt).toLocaleDateString()}
                  </p>
                  {resume.qualityScore > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            resume.qualityScore >= 70 ? 'bg-green-500' : 
                            resume.qualityScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${resume.qualityScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{resume.qualityScore}/100</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigate(`/app/builder/${resume._id}`)}
                  className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  Edit Resume
                </button>
              </div>
            ))}
          </div>

          {resumes.length === 0 && (
            <div className="text-center py-20">
              <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No resumes yet</h3>
              <p className="text-gray-500 mb-6">Create your first resume to get started</p>
              <button
                onClick={handleCreateResume}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
              >
                Create Resume
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Dashboard