import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { resumeAPI } from '../api'
import { Save, ChevronLeft, ChevronRight, Palette } from 'lucide-react'
import AISuggestion from '../components/AISuggestion'
import ResumeScore from '../components/ResumeScore'
import JDMatcher from '../components/JDMatcher'
import ModernTemplate from '../assets/templates/ModernTemplate'
import ClassicTemplate from '../assets/templates/ClassicTemplate'
import MinimalTemplate from '../assets/templates/MinimalTemplate'
import MinimalImageTemplate from '../assets/templates/MinimalImageTemplate'
import ExecutiveTemplate from '../assets/templates/ExecutiveTemplate'
import HeaderStyling from '../components/HeaderStyling'

const templates = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  minimalImage: MinimalImageTemplate,
  executive: ExecutiveTemplate
}

const STEPS = [
  { id: 'personal', label: 'Personal Info', required: true, fields: ['full_name', 'email'] },
  { id: 'summary', label: 'Professional Summary', required: true, minLength: 50 },
  { id: 'experience', label: 'Experience (Optional)', required: false },
  { id: 'education', label: 'Education', required: true, minItems: 1 },
  { id: 'skills', label: 'Skills', required: true, minItems: 3 },
  { id: 'projects', label: 'Projects', required: true, minItems: 1 }
]

const ResumeBuilder = () => {
  const { resumeId } = useParams()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [showStyling, setShowStyling] = useState(false)
  const [resumeData, setResumeData] = useState({
    title: 'Untitled Resume',
    template: 'modern',
    accentColor: '#3b82f6',
    personal_info: { full_name: '', email: '', phone: '', location: '', linkedin: '', website: '' },
    professional_summary: '',
    experience: [],
    education: [],
    skills: [],
    project: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (resumeId) loadResume()
  }, [resumeId])

  const loadResume = async () => {
    try {
      setLoading(true)
      const data = await resumeAPI.getOne(resumeId)
      if (data && data._id) {
        setResumeData({
          ...data,
          personal_info: data.personal_info || { full_name: '', email: '', phone: '', location: '', linkedin: '', website: '' },
          experience: data.experience || [],
          education: data.education || [],
          skills: data.skills || [],
          project: data.project || []
        })
      }
      setError(null)
    } catch (err) {
      setError('Failed to load resume')
    } finally {
      setLoading(false)
    }
  }

  const clearPlaceholder = (field, value, placeholder) => {
    return value === placeholder ? '' : value
  }

  const saveResume = async () => {
    try {
      await resumeAPI.update(resumeId, resumeData)
      alert('Resume saved successfully!')
    } catch (err) {
      console.error(err)
      alert('Failed to save resume')
    }
  }

  const finishResume = async () => {
    try {
      await resumeAPI.update(resumeId, resumeData)
      alert('Resume saved successfully!')
      window.location.href = '/app'
    } catch (err) {
      console.error(err)
      alert('Failed to save resume')
    }
  }

  const validateStep = () => {
    const step = STEPS[currentStep]
    if (!step) return false
    
    if (step.id === 'personal') {
      return resumeData.personal_info.full_name && resumeData.personal_info.email
    }
    
    if (step.id === 'summary') {
      return resumeData.professional_summary && resumeData.professional_summary.length >= (step.minLength || 0)
    }
    
    if (step.id === 'education') {
      return resumeData.education.length >= (step.minItems || 0) && 
             resumeData.education.every(e => e.institution && e.degree)
    }
    
    if (step.id === 'skills') {
      return resumeData.skills.filter(s => s).length >= (step.minItems || 0)
    }
    
    if (step.id === 'projects') {
      return resumeData.project.length >= (step.minItems || 0) && 
             resumeData.project.every(p => p.name && p.description)
    }
    
    return true
  }

  const getValidationMessage = () => {
    const step = STEPS[currentStep]
    if (!step) return null
    
    if (step.id === 'personal') {
      if (!resumeData.personal_info.full_name) return 'Full name is required'
      if (!resumeData.personal_info.email) return 'Email is required'
    }
    
    if (step.id === 'summary') {
      if (!resumeData.professional_summary) return 'Professional summary is required'
      if (resumeData.professional_summary.length < (step.minLength || 0)) {
        return `Summary must be at least ${step.minLength} characters (${resumeData.professional_summary.length}/${step.minLength})`
      }
    }
    
    if (step.id === 'education') {
      if (resumeData.education.length < (step.minItems || 0)) return 'At least one education entry is required'
      const incomplete = resumeData.education.find(e => !e.institution || !e.degree)
      if (incomplete) return 'Please complete all education fields (Institution and Degree are required)'
    }
    
    if (step.id === 'skills') {
      const validSkills = resumeData.skills.filter(s => s).length
      if (validSkills < (step.minItems || 0)) {
        return `At least ${step.minItems} skills are required (${validSkills}/${step.minItems})`
      }
    }
    
    if (step.id === 'projects') {
      if (resumeData.project.length < (step.minItems || 0)) return 'At least one project is required'
      const incomplete = resumeData.project.find(p => !p.name || !p.description)
      if (incomplete) return 'Please complete all project fields (Name and Description are required)'
    }
    
    return null
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1 && validateStep()) {
      setCurrentStep(currentStep + 1)
      resumeAPI.update(resumeId, resumeData).catch(err => console.error(err))
    }
  }

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [...resumeData.experience, { company: '', position: '', start_date: '', end_date: '', is_current: false, description: '' }]
    })
  }

  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [...resumeData.education, { institution: '', degree: '', field: '', graduation_date: '', gpa: '' }]
    })
  }

  const addProject = () => {
    setResumeData({
      ...resumeData,
      project: [...resumeData.project, { name: '', description: '' }]
    })
  }

  const hasContent = resumeData.personal_info?.full_name && resumeData.professional_summary?.length >= 50

  const handleTemplateChange = (templateId) => {
    setResumeData({ ...resumeData, template: templateId })
  }

  const handleColorChange = (color) => {
    setResumeData({ ...resumeData, accentColor: color })
  }

  const TemplateComponent = templates[resumeData.template] || ModernTemplate
  const currentStepData = STEPS[currentStep]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading resume...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={loadResume} className="bg-green-600 text-white px-4 py-2 rounded-lg">Retry</button>
        </div>
      </div>
    )
  }

  if (!currentStepData) {
    return <div className="flex items-center justify-center h-screen">Invalid step</div>
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* Editor Panel */}
      <div className="w-1/2 bg-white rounded-xl shadow-lg p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Resume Name</label>
            <input
              type="text"
              value={resumeData.title}
              onChange={(e) => setResumeData({ ...resumeData, title: e.target.value })}
              className="text-2xl font-bold border-b-2 border-transparent hover:border-gray-300 focus:border-green-500 outline-none w-full"
              placeholder="Resume Name"
              maxLength={50}
            />
            <div className="text-xs text-gray-400 mt-1">{resumeData.title.length}/50</div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowStyling(!showStyling)} 
              className="flex items-center gap-2 px-4 py-2 border-2 border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50"
            >
              <Palette className="w-4 h-4" /> Style
            </button>
            <button onClick={saveResume} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        </div>

        {/* Styling Panel */}
        {showStyling && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-purple-200">
            <HeaderStyling
              currentColor={resumeData.accentColor}
              currentTemplate={resumeData.template}
              onColorChange={handleColorChange}
              onTemplateChange={handleTemplateChange}
              hasContent={hasContent}
            />
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep + 1} of {STEPS.length}</span>
            <span className="text-sm text-gray-500">{currentStepData.label}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                index === currentStep 
                  ? 'bg-green-600 text-white' 
                  : index < currentStep 
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              <span className="font-semibold">{index + 1}</span>
              <span>{step.label}</span>
              {step.required && <span className="text-red-500">*</span>}
            </div>
          ))}
        </div>

        {/* Validation Message */}
        {!validateStep() && getValidationMessage() && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            ⚠️ {getValidationMessage()}
          </div>
        )}

        {/* Step Content */}
        <div className="mb-6">
          {/* Personal Info */}
          {currentStepData.id === 'personal' && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name *"
                value={resumeData.personal_info.full_name}
                onFocus={(e) => e.target.value === 'Your Name' && setResumeData({ ...resumeData, personal_info: { ...resumeData.personal_info, full_name: '' } })}
                onChange={(e) => setResumeData({ ...resumeData, personal_info: { ...resumeData.personal_info, full_name: e.target.value } })}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="email"
                placeholder="Email *"
                value={resumeData.personal_info.email}
                onFocus={(e) => e.target.value === 'your.email@example.com' && setResumeData({ ...resumeData, personal_info: { ...resumeData.personal_info, email: '' } })}
                onChange={(e) => setResumeData({ ...resumeData, personal_info: { ...resumeData.personal_info, email: e.target.value } })}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={resumeData.personal_info.phone}
                onChange={(e) => setResumeData({ ...resumeData, personal_info: { ...resumeData.personal_info, phone: e.target.value } })}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Location"
                value={resumeData.personal_info.location}
                onChange={(e) => setResumeData({ ...resumeData, personal_info: { ...resumeData.personal_info, location: e.target.value } })}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="url"
                placeholder="LinkedIn URL"
                value={resumeData.personal_info.linkedin}
                onChange={(e) => setResumeData({ ...resumeData, personal_info: { ...resumeData.personal_info, linkedin: e.target.value } })}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="url"
                placeholder="Website URL"
                value={resumeData.personal_info.website}
                onChange={(e) => setResumeData({ ...resumeData, personal_info: { ...resumeData.personal_info, website: e.target.value } })}
                className="w-full p-3 border rounded-lg"
              />
            </div>
          )}

          {/* Professional Summary */}
          {currentStepData.id === 'summary' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Professional Summary <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">
                  (Minimum {currentStepData.minLength || 0} characters)
                </span>
              </label>
              <textarea
                value={resumeData.professional_summary}
                onFocus={(e) => e.target.value === 'Write your professional summary here. This should be at least 50 characters long.' && setResumeData({ ...resumeData, professional_summary: '' })}
                onChange={(e) => setResumeData({ ...resumeData, professional_summary: e.target.value })}
                className="w-full p-3 border rounded-lg h-32"
                placeholder="Write a brief professional summary..."
              />
              <div className="text-xs text-gray-500 mt-1">
                {resumeData.professional_summary.length}/{currentStepData.minLength || 0} characters
              </div>
            </div>
          )}

          {/* Experience */}
          {currentStepData.id === 'experience' && (
            <div className="space-y-4">
              {resumeData.experience.map((exp, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <input
                    type="text"
                    placeholder="Position"
                    value={exp.position}
                    onChange={(e) => {
                      const newExp = [...resumeData.experience]
                      newExp[index].position = e.target.value
                      setResumeData({ ...resumeData, experience: newExp })
                    }}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={exp.company}
                    onChange={(e) => {
                      const newExp = [...resumeData.experience]
                      newExp[index].company = e.target.value
                      setResumeData({ ...resumeData, experience: newExp })
                    }}
                    className="w-full p-2 border rounded"
                  />
                  <div className="flex gap-2">
                    <input
                      type="month"
                      value={exp.start_date}
                      onChange={(e) => {
                        const newExp = [...resumeData.experience]
                        newExp[index].start_date = e.target.value
                        setResumeData({ ...resumeData, experience: newExp })
                      }}
                      className="flex-1 p-2 border rounded"
                    />
                    <input
                      type="month"
                      value={exp.end_date}
                      onChange={(e) => {
                        const newExp = [...resumeData.experience]
                        newExp[index].end_date = e.target.value
                        setResumeData({ ...resumeData, experience: newExp })
                      }}
                      className="flex-1 p-2 border rounded"
                      disabled={exp.is_current}
                    />
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={exp.is_current}
                      onChange={(e) => {
                        const newExp = [...resumeData.experience]
                        newExp[index].is_current = e.target.checked
                        setResumeData({ ...resumeData, experience: newExp })
                      }}
                    />
                    Currently working here
                  </label>
                  <textarea
                    placeholder="Description"
                    value={exp.description}
                    onChange={(e) => {
                      const newExp = [...resumeData.experience]
                      newExp[index].description = e.target.value
                      setResumeData({ ...resumeData, experience: newExp })
                    }}
                    className="w-full p-2 border rounded h-24"
                  />
                  <button
                    onClick={() => setResumeData({ ...resumeData, experience: resumeData.experience.filter((_, i) => i !== index) })}
                    className="text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button onClick={addExperience} className="w-full p-3 border-2 border-dashed rounded-lg text-green-600 hover:bg-green-50">
                + Add Experience
              </button>
            </div>
          )}

          {/* Education */}
          {currentStepData.id === 'education' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">
                  Education <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(At least 1 required)</span>
                </label>
              </div>
              {resumeData.education.map((edu, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <input
                    type="text"
                    placeholder="Institution *"
                    value={edu.institution}
                    onFocus={(e) => e.target.value === 'University Name' && (() => {
                      const newEdu = [...resumeData.education]
                      newEdu[index].institution = ''
                      setResumeData({ ...resumeData, education: newEdu })
                    })()}
                    onChange={(e) => {
                      const newEdu = [...resumeData.education]
                      newEdu[index].institution = e.target.value
                      setResumeData({ ...resumeData, education: newEdu })
                    }}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Degree *"
                    value={edu.degree}
                    onFocus={(e) => e.target.value === 'Degree Name' && (() => {
                      const newEdu = [...resumeData.education]
                      newEdu[index].degree = ''
                      setResumeData({ ...resumeData, education: newEdu })
                    })()}
                    onChange={(e) => {
                      const newEdu = [...resumeData.education]
                      newEdu[index].degree = e.target.value
                      setResumeData({ ...resumeData, education: newEdu })
                    }}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Field of Study"
                    value={edu.field}
                    onChange={(e) => {
                      const newEdu = [...resumeData.education]
                      newEdu[index].field = e.target.value
                      setResumeData({ ...resumeData, education: newEdu })
                    }}
                    className="w-full p-2 border rounded"
                  />
                  <div className="flex gap-2">
                    <input
                      type="month"
                      value={edu.graduation_date}
                      onChange={(e) => {
                        const newEdu = [...resumeData.education]
                        newEdu[index].graduation_date = e.target.value
                        setResumeData({ ...resumeData, education: newEdu })
                      }}
                      className="flex-1 p-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="GPA"
                      value={edu.gpa}
                      onChange={(e) => {
                        const newEdu = [...resumeData.education]
                        newEdu[index].gpa = e.target.value
                        setResumeData({ ...resumeData, education: newEdu })
                      }}
                      className="w-24 p-2 border rounded"
                    />
                  </div>
                  <button
                    onClick={() => setResumeData({ ...resumeData, education: resumeData.education.filter((_, i) => i !== index) })}
                    className="text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button onClick={addEducation} className="w-full p-3 border-2 border-dashed rounded-lg text-green-600 hover:bg-green-50">
                + Add Education
              </button>
            </div>
          )}

          {/* Skills */}
          {currentStepData.id === 'skills' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Skills <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">
                  (Minimum {currentStepData.minItems || 0} skills required)
                </span>
              </label>
              <textarea
                placeholder="Enter skills separated by commas (e.g., JavaScript, React, Node.js)"
                value={resumeData.skills.join(', ')}
                onChange={(e) => {
                  const value = e.target.value
                  const skills = value.split(',').map(s => s.trim())
                  setResumeData({ ...resumeData, skills })
                }}
                className="w-full p-3 border rounded-lg h-32"
              />
              <div className="text-xs text-gray-500 mt-1">
                {resumeData.skills.filter(s => s).length}/{currentStepData.minItems || 0} skills added
              </div>
            </div>
          )}

          {/* Projects */}
          {currentStepData.id === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">
                  Projects <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(At least 1 required)</span>
                </label>
              </div>
              {resumeData.project.map((proj, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <input
                    type="text"
                    placeholder="Project Name *"
                    value={proj.name}
                    onFocus={(e) => e.target.value === 'Project Name' && (() => {
                      const newProj = [...resumeData.project]
                      newProj[index].name = ''
                      setResumeData({ ...resumeData, project: newProj })
                    })()}
                    onChange={(e) => {
                      const newProj = [...resumeData.project]
                      newProj[index].name = e.target.value
                      setResumeData({ ...resumeData, project: newProj })
                    }}
                    className="w-full p-2 border rounded"
                  />
                  <textarea
                    placeholder="Project Description *"
                    value={proj.description}
                    onFocus={(e) => e.target.value === 'Project description goes here' && (() => {
                      const newProj = [...resumeData.project]
                      newProj[index].description = ''
                      setResumeData({ ...resumeData, project: newProj })
                    })()}
                    onChange={(e) => {
                      const newProj = [...resumeData.project]
                      newProj[index].description = e.target.value
                      setResumeData({ ...resumeData, project: newProj })
                    }}
                    className="w-full p-2 border rounded h-24"
                  />
                  <AISuggestion
                    original={proj.description}
                    type="project"
                    onAccept={(optimized) => {
                      const newProj = [...resumeData.project]
                      newProj[index].description = optimized
                      setResumeData({ ...resumeData, project: newProj })
                    }}
                    onReject={() => {}}
                  />
                  <button
                    onClick={() => setResumeData({ ...resumeData, project: resumeData.project.filter((_, i) => i !== index) })}
                    className="text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button onClick={addProject} className="w-full p-3 border-2 border-dashed rounded-lg text-green-600 hover:bg-green-50">
                + Add Project
              </button>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={currentStep === STEPS.length - 1 ? finishResume : nextStep}
            disabled={!validateStep()}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === STEPS.length - 1 ? 'Finish' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-1/2 bg-white rounded-xl shadow-lg p-6 overflow-y-auto">
        <ResumeScore resumeData={resumeData} />
        <JDMatcher resumeId={resumeId} onMatch={(result) => {
          setResumeData({ ...resumeData, jobDescription: result.jobDescription })
        }} />
        <h2 className="text-xl font-bold mb-4 mt-6">Live Preview</h2>
        <div className="border rounded-lg p-4 bg-white" style={{ transform: 'scale(0.8)', transformOrigin: 'top' }}>
          <TemplateComponent data={resumeData} accentColor={resumeData.accentColor} />
        </div>
      </div>
    </div>
  )
}

export default ResumeBuilder
