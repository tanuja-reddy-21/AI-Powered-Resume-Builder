import React from 'react'
import { XCircle, AlertTriangle } from 'lucide-react'

const RejectionReasons = ({ reasons }) => {
  if (!reasons || reasons.length === 0) return null

  const critical = reasons.filter(r => r.includes('❌'))
  const warnings = reasons.filter(r => r.includes('⚠️'))

  return (
    <div className="mt-4 space-y-3">
      <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
        <XCircle className="w-5 h-5" />
        Why This Will Get Rejected
      </h3>
      
      {critical.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <h4 className="font-semibold text-red-800 mb-2">Critical Issues (Auto-Reject)</h4>
          <ul className="space-y-2">
            {critical.map((reason, idx) => (
              <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">High-Risk Weaknesses</h4>
          <ul className="space-y-2">
            {warnings.map((reason, idx) => (
              <li key={idx} className="text-sm text-yellow-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default RejectionReasons
