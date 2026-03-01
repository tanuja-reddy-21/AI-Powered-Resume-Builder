import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import RejectionReasons from './RejectionReasons'

const ResumeScore = ({ resumeData }) => {
  const [analysis, setAnalysis] = useState({
    qualityScore: 0,
    atsScore: 0,
    readyToApply: false,
    warnings: [],
    blockers: [],
    sectionScores: {}
  })

  useEffect(() => {
    analyzeResume()
  }, [resumeData])

  const analyzeResume = () => {
    let qualityScore = 0
    const warnings = []
    const blockers = []
    const sectionScores = {}

    // Summary (20 points)
    const summary = resumeData.professional_summary || ''
    if (summary.length < 50) {
      blockers.push('Complete professional summary (min 50 chars)')
    } else if (summary.length < 100) {
      qualityScore += 10
      warnings.push('Summary weak - aim for 100+ characters')
    } else if (summary.includes('passionate') || summary.includes('hardworking')) {
      qualityScore += 12
      warnings.push('Remove weak phrases: passionate, hardworking, team player')
    } else {
      qualityScore += 20
    }
    sectionScores.summary = Math.min(20, qualityScore)

    // Skills (20 points)
    const skills = (resumeData.skills || []).filter(s => s && s.trim())
    if (skills.length < 3) {
      blockers.push('Add at least 3 technical skills')
    } else if (skills.length < 5) {
      qualityScore += 10
      warnings.push('Add more skills - aim for 8+')
    } else if (skills.length < 8) {
      qualityScore += 15
    } else {
      qualityScore += 20
    }
    sectionScores.skills = Math.min(20, qualityScore - sectionScores.summary)

    // Projects (30 points)
    const projects = resumeData.project || []
    if (projects.length === 0) {
      blockers.push('Add at least 1 project')
    } else {
      let projectScore = 0
      if (projects.length >= 2) projectScore += 10
      else warnings.push('Add more projects - aim for 2-3')

      const weakProjects = projects.filter(p => {
        const desc = p.description || ''
        return desc.length < 100 || 
               desc.toLowerCase().includes('worked on') ||
               !desc.match(/\d/)
      })

      if (weakProjects.length > 0) {
        warnings.push(`${weakProjects.length} project(s) lack metrics or use weak language`)
        projectScore += 10
      } else {
        projectScore += 20
      }

      qualityScore += projectScore
      sectionScores.projects = projectScore
    }

    // Education (15 points)
    const education = resumeData.education || []
    if (education.length === 0 || !education[0]?.institution) {
      blockers.push('Complete education section')
    } else {
      qualityScore += 15
      sectionScores.education = 15
    }

    // Contact (15 points)
    const contact = resumeData.personal_info || {}
    let contactScore = 0
    if (contact.full_name && contact.email) contactScore += 10
    else blockers.push('Add full name and email')
    
    if (contact.phone || contact.linkedin) contactScore += 5
    else warnings.push('Add phone or LinkedIn')
    
    qualityScore += contactScore
    sectionScores.contact = contactScore

    // ATS Score
    const atsScore = calculateATS(resumeData)

    setAnalysis({
      qualityScore,
      atsScore,
      readyToApply: qualityScore >= 70 && atsScore >= 60 && blockers.length === 0,
      warnings,
      blockers,
      sectionScores
    })
  }

  const calculateATS = (data) => {
    let score = 100
    const content = `${data.professional_summary || ''} ${(data.skills || []).join(' ')} ${(data.project || []).map(p => p.description).join(' ')}`.toLowerCase()
    
    const keywords = ['python', 'javascript', 'react', 'sql', 'git']
    const missing = keywords.filter(k => !content.includes(k))
    score -= missing.length * 5
    
    if (content.includes('worked on')) score -= 10
    if (content.includes('familiar with')) score -= 10
    
    return Math.max(0, score)
  }

  const getColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-white rounded-lg border p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Resume Quality</h3>
        <div className={`text-2xl font-bold ${getColor(analysis.qualityScore)}`}>
          {analysis.qualityScore}/100
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div 
          className={`h-2 rounded-full transition-all ${analysis.qualityScore >= 80 ? 'bg-green-600' : analysis.qualityScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
          style={{ width: `${analysis.qualityScore}%` }}
        />
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span>ATS Score</span>
          <span className={`font-semibold ${getColor(analysis.atsScore)}`}>{analysis.atsScore}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${analysis.atsScore >= 80 ? 'bg-green-600' : analysis.atsScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
            style={{ width: `${analysis.atsScore}%` }}
          />
        </div>
      </div>

      {!analysis.readyToApply && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
          <div className="flex items-center gap-2 text-sm font-semibold text-red-800">
            <XCircle className="w-4 h-4" />
            NOT READY TO APPLY
          </div>
        </div>
      )}

      {analysis.readyToApply && (
        <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded">
          <div className="flex items-center gap-2 text-sm font-semibold text-green-800">
            <CheckCircle className="w-4 h-4" />
            READY TO APPLY
          </div>
        </div>
      )}

      {analysis.blockers.length > 0 && (
        <div className="space-y-1 mb-3">
          <p className="text-xs font-semibold text-red-700 uppercase">Blockers:</p>
          {analysis.blockers.map((b, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-red-700">
              <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{b}</span>
            </div>
          ))}
        </div>
      )}

      {analysis.warnings.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-orange-700 uppercase">Warnings:</p>
          {analysis.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-orange-700">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      <RejectionReasons reasons={resumeData.rejectionReasons} />
    </div>
  )
}

export default ResumeScore
