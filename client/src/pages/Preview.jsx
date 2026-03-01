import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { resumeAPI } from '../api'
import { Share2, Download, ArrowLeft } from 'lucide-react'
import ModernTemplate from '../assets/templates/ModernTemplate'
import ClassicTemplate from '../assets/templates/ClassicTemplate'
import MinimalTemplate from '../assets/templates/MinimalTemplate'
import MinimalImageTemplate from '../assets/templates/MinimalImageTemplate'
import ExecutiveTemplate from '../assets/templates/ExecutiveTemplate'

const templates = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  minimalImage: MinimalImageTemplate,
  executive: ExecutiveTemplate
}

const Preview = () => {
  const { resumeId } = useParams()
  const [resumeData, setResumeData] = useState(null)

  useEffect(() => {
    loadResume()
  }, [resumeId])

  const loadResume = async () => {
    const data = await resumeAPI.getOne(resumeId)
    setResumeData(data)
  }

  const shareResume = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    alert('Resume link copied to clipboard!')
  }

  const downloadResume = () => {
    window.print()
  }

  if (!resumeData) return <div className="flex items-center justify-center h-screen">Loading...</div>

  const TemplateComponent = templates[resumeData.template]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/app" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
            <div className="flex gap-3">
              <button
                onClick={shareResume}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={downloadResume}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <TemplateComponent data={resumeData} accentColor={resumeData.accentColor} />
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .max-w-4xl, .max-w-4xl * { visibility: visible; }
          .max-w-4xl { position: absolute; left: 0; top: 0; width: 100%; }
          button, nav { display: none !important; }
        }
      `}</style>
    </div>
  )
}

export default Preview