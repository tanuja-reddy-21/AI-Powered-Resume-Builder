import { GoogleGenerativeAI } from '@google/generative-ai';

export const optimizeContent = async (req, res) => {
  console.log('[AI Controller] Optimization request received:', { 
    hasText: !!req.body.text, 
    type: req.body.type, 
    enforceRewrite: req.body.enforceRewrite,
    hasContext: !!req.body.context
  });

  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('[AI Controller] GEMINI_API_KEY not configured');
      return res.status(500).json({ error: 'AI service not configured. Please set GEMINI_API_KEY in .env file.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const { text, type, context, enforceRewrite } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const basePrompt = `You are a professional resume writer. Your job is to REWRITE content into clear, concise, professional resume language.

CRITICAL RULES:
1. NEVER return the same text
2. ALWAYS rewrite completely from scratch
3. Use formal, professional tone
4. Remove weak language (passionate, hardworking, team player)
5. Focus on skills, impact, and value
6. NO first-person pronouns (I, my, me)
7. NO placeholders or generic phrases
8. Output ONLY the rewritten text, nothing else`;

    const enforcedPrompt = `${basePrompt}

⚠️ ENFORCED REWRITE MODE ACTIVATED ⚠️

You MUST generate a completely NEW professional summary. Do NOT paraphrase the input.

DISCARD the original structure entirely. Generate fresh content.

MANDATORY: Output must be visibly different from input.`;

    const systemPrompt = enforceRewrite ? enforcedPrompt : basePrompt;

    const prompts = {
      summary: `${systemPrompt}

Task: ${enforceRewrite ? 'Generate a fresh professional summary' : 'Rewrite this professional summary'} into a strong, ATS-friendly resume summary.

${enforceRewrite ? 'Context for generation:' : 'Input Summary:'} "${text || 'No summary provided'}"

Context:
- Skills: ${context?.skills?.join(', ') || 'Not specified'}
- Experience Level: ${context?.experienceLevel || 'Fresher/Entry-level'}
- Target Role: ${context?.targetRole || 'General'}

Requirements:
- 2-4 lines (50-150 characters)
- Structure: [Role/Profile] + [Core Skills] + [Value Proposition]
- Include relevant technical skills from context
- ATS keywords based on target role
- Professional, confident tone
- NO buzzwords without substance
- NO generic phrases like "detail-oriented professional"

${enforceRewrite ? 'Generate from scratch using context. Do NOT copy input structure.' : 'If input is empty/weak, generate a professional baseline summary using the context.'}

Output (${enforceRewrite ? 'fresh' : 'rewritten'} summary only):`,
      
      project: `${systemPrompt}

Task: Rewrite this project description into professional resume format.

Input: "${text}"

Requirements:
- Structure: [Action Verb] + [Technology Stack] + [Outcome]
- Start with: Built/Developed/Engineered/Designed/Implemented
- Include specific technologies
- Add measurable impact if possible
- 2-3 lines maximum
- Remove "This project", "I learned"

Output (rewritten description only):`,
      
      experience: `${systemPrompt}

Task: Rewrite this work experience into professional bullet points.

Input: "${text}"

Requirements:
- Start with strong action verbs (past tense)
- Format: [Action] + [Method/Tool] + [Result]
- Include technologies and measurable impact
- 2-3 bullets maximum
- Remove vague responsibilities

Output (rewritten bullets only):`
    };
    
    const prompt = prompts[type] || prompts.summary;
    const result = await model.generateContent(prompt);
    let optimizedText = result.response.text().trim();
    
    // Remove markdown formatting
    optimizedText = optimizedText.replace(/```[a-z]*\n?/g, '').replace(/\*\*/g, '').replace(/^[#]+\s*/gm, '').trim();
    
    // Strict validation
    const isIdentical = text && optimizedText.toLowerCase().replace(/[^a-z0-9]/g, '') === text.toLowerCase().replace(/[^a-z0-9]/g, '')
    const isTooShort = optimizedText.length < 50
    const isEmpty = !optimizedText || optimizedText.length === 0
    
    if (isEmpty || isTooShort || (isIdentical && !enforceRewrite)) {
      // Force retry with enforced mode
      const retryPrompt = `${enforcedPrompt}\n\nPREVIOUS ATTEMPT FAILED. Generate a completely NEW professional summary.\n\nContext:\n- Skills: ${context?.skills?.join(', ') || 'Python, JavaScript, React'}\n- Level: ${context?.experienceLevel || 'Entry-level'}\n- Role: ${context?.targetRole || 'Software Developer'}\n\nGenerate 2-4 lines. Make it professional, specific, and ATS-friendly. Output ONLY the summary:`;
      
      const retryResult = await model.generateContent(retryPrompt);
      optimizedText = retryResult.response.text().trim().replace(/```[a-z]*\n?/g, '').replace(/\*\*/g, '').replace(/^[#]+\s*/gm, '').trim();
    }
    
    // Final validation
    if (!optimizedText || optimizedText.length < 50) {
      // Fallback: Generate generic professional summary
      const skills = context?.skills?.slice(0, 3).join(', ') || 'software development'
      const role = context?.targetRole || 'professional'
      optimizedText = `Results-driven ${context?.experienceLevel || 'entry-level'} ${role} with expertise in ${skills}. Proven ability to deliver high-quality solutions through technical proficiency and problem-solving skills. Seeking opportunities to contribute to innovative projects and drive measurable impact.`
    }
    
    res.json({ optimizedText });
  } catch (error) {
    console.error('AI optimization error:', error);
    res.status(500).json({ error: 'Summary optimization failed. Please try again.' });
  }
};