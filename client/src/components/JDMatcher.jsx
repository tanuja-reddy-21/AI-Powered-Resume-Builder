import React, { useState } from 'react'
import { FileText, TrendingUp, AlertCircle, Check } from 'lucide-react'
import { resumeAPI } from '../api'

const JDMatcher = ({ resumeId, onMatch }) => {
  const [jd, setJd] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const analyzeMatch = async () => {
    if (!jd || jd.length < 50) {
      alert('Please paste a job description (minimum 50 characters)')
      return
    }

    setLoading(true)
    try {
      const matchResult = await resumeAPI.matchJD(resumeId, jd)
      setResult(matchResult)
      if (onMatch) onMatch(matchResult)
    } catch (error) {
      alert('Failed to analyze job description')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-800">Job Description Matcher</h3>
      </div>

      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        placeholder="Paste the job description here to see how well your resume matches..."
        className="w-full h-32 p-3 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <button
        onClick={analyzeMatch}
        disabled={loading || !jd}
        className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Analyzing...' : 'Analyze Match'}
      </button>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-300">
            <div>
              <p className="text-sm text-gray-600">Match Score</p>
              <p className="text-3xl font-bold text-blue-700">{result.matchScore}%</p>
            </div>
            <TrendingUp className={`w-12 h-12 ${result.matchScore >= 70 ? 'text-green-500' : result.matchScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`} />
          </div>

          {result.matchedKeywords && result.matchedKeywords.length > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-800">Matched Keywords ({result.matchedKeywords.length})</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.matchedKeywords.slice(0, 10).map((kw, idx) => (
                  <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.missingKeywords && result.missingKeywords.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h4 className="font-semibold text-red-800">Missing Keywords ({result.missingKeywords.length})</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords.map((kw, idx) => (
                  <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                    {kw}
                  </span>
                ))}
              </div>
              <p className="text-xs text-red-600 mt-2">Add these keywords to your summary, skills, or project descriptions</p>
            </div>
          )}

          {result.suggestions && result.suggestions.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Recommendations</h4>
              <ul className="space-y-1">
                {result.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="text-sm text-yellow-700">• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default JDMatcher
