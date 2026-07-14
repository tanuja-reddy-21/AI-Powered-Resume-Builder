import React, { useState } from 'react'
import { Sparkles, Check, X, Loader2 } from 'lucide-react'
import { aiAPI } from '../api'

const AISuggestion = ({ original, type, onAccept, onReject, context }) => {
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState(null)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [retryMessage, setRetryMessage] = useState('')

  const isSimilar = (text1, text2) => {
    if (!text1 || !text2) return false
    const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '')
    const norm1 = normalize(text1)
    const norm2 = normalize(text2)
    
    // Check exact match
    if (norm1 === norm2) return true
    
    // Check similarity ratio (>90% similar)
    const longer = norm1.length > norm2.length ? norm1 : norm2
    const shorter = norm1.length > norm2.length ? norm2 : norm1
    const matchCount = shorter.split('').filter((char, i) => longer[i] === char).length
    return (matchCount / longer.length) > 0.9
  }

  const validateOutput = (optimized, input) => {
    // Failure conditions
    if (!optimized || optimized.trim().length === 0) {
      return { valid: false, reason: 'Empty output' }
    }
    
    if (optimized.length < 50) {
      return { valid: false, reason: 'Output too short (min 50 chars)' }
    }
    
    if (isSimilar(optimized, input)) {
      return { valid: false, reason: 'Output identical to input' }
    }
    
    // Check for generic placeholders
    const genericPhrases = ['detail-oriented professional', 'passionate about', 'team player', 'hardworking']
    const hasGeneric = genericPhrases.some(phrase => optimized.toLowerCase().includes(phrase))
    if (hasGeneric && optimized.length < 100) {
      return { valid: false, reason: 'Generic placeholder content' }
    }
    
    return { valid: true }
  }

  const optimize = async (isRetry = false, enforceRewrite = false) => {
    setLoading(true)
    setError(null)
    setRetryMessage('')
    
    console.log('[AI Optimize] Starting optimization:', { isRetry, enforceRewrite, hasOriginal: !!original, type })
    
    try {
      const payload = {
        text: original || '',
        type,
        context,
        enforceRewrite: enforceRewrite || isRetry
      }
      
      console.log('[AI Optimize] Sending request:', payload)
      
      const result = await aiAPI.optimize(payload.text, payload.type, payload.context, payload.enforceRewrite)
      
      console.log('[AI Optimize] Received response:', result)
      
      if (result.error) {
        console.error('[AI Optimize] Server returned error:', result.error)
        throw new Error(result.error)
      }
      
      const optimized = result.optimizedText?.trim()
      
      console.log('[AI Optimize] Optimized text:', optimized)
      
      // Validate output
      const validation = validateOutput(optimized, original)
      
      console.log('[AI Optimize] Validation result:', validation)
      
      if (!validation.valid) {
        if (retryCount < 1) {
          console.log('[AI Optimize] Validation failed, triggering retry')
          setRetryCount(retryCount + 1)
          setRetryMessage('Summary optimization failed. Retrying with enforced professional rewrite.')
          setTimeout(() => optimize(true, true), 1000)
          return
        } else {
          console.error('[AI Optimize] Validation failed after retry:', validation.reason)
          throw new Error(`Optimization failed after retry: ${validation.reason}`)
        }
      }
      
      console.log('[AI Optimize] Success! Setting suggestion')
      setSuggestion(optimized)
      setRetryCount(0)
      setRetryMessage('')
    } catch (err) {
      console.error('[AI Optimize] Error caught:', err)
      const errorMsg = err.message || 'Optimization failed'
      
      if (!isRetry && retryCount < 1) {
        console.log('[AI Optimize] First failure, triggering retry')
        setRetryCount(retryCount + 1)
        setRetryMessage('Summary optimization failed. Retrying with enforced professional rewrite.')
        setTimeout(() => optimize(true, true), 1500)
      } else {
        console.error('[AI Optimize] Final failure after retry')
        setError(`${errorMsg}. Please check: 1) Server is running, 2) GEMINI_API_KEY is set, 3) Internet connection`)
      }
    } finally {
      setLoading(false)
    }
  }

  const accept = () => {
    onAccept(suggestion)
    setSuggestion(null)
    setRetryCount(0)
    setError(null)
    setRetryMessage('')
  }

  const reject = () => {
    onReject()
    setSuggestion(null)
    setRetryCount(0)
    setError(null)
    setRetryMessage('')
  }

  if (suggestion) {
    return (
      <div className="mt-2 p-4 bg-purple-50 border-2 border-purple-300 rounded-lg animate-pulse-once">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-900">AI Optimized Summary</span>
        </div>
        <div className="text-sm text-gray-800 mb-3 whitespace-pre-wrap font-medium">{suggestion}</div>
        <div className="flex gap-2">
          <button onClick={accept} className="flex items-center gap-1 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 font-semibold">
            <Check className="w-4 h-4" /> Accept
          </button>
          <button onClick={reject} className="flex items-center gap-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
            <X className="w-4 h-4" /> Reject
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-2">
      <button
        onClick={() => optimize(false, false)}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-purple-600 hover:bg-purple-50 rounded-lg border-2 border-purple-300 disabled:opacity-50 transition"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {loading ? 'Optimizing summary...' : 'Optimize Summary'}
      </button>
      
      {retryMessage && (
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-xs text-yellow-800 flex items-start gap-2">
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0 mt-0.5" />
          <span className="font-medium">{retryMessage}</span>
        </div>
      )}
      
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          <p className="font-semibold mb-1">Optimization Failed</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}

export default AISuggestion
