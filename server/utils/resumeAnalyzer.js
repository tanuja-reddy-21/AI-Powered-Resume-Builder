export const analyzeResume = (resumeData) => {
  const analysis = {
    qualityScore: 0,
    atsScore: 0,
    readyToApply: false,
    warnings: [],
    rejectionReasons: [],
    sectionScores: {},
    blockers: []
  };

  // Summary Analysis (20 points)
  const summary = resumeData.professional_summary || '';
  if (summary.length < 50) {
    analysis.warnings.push('Summary too short - minimum 50 characters required');
    analysis.blockers.push('Complete professional summary');
    analysis.rejectionReasons.push('❌ REJECTED: No professional summary - Recruiters skip resumes without clear value proposition');
  } else if (summary.length < 100) {
    analysis.qualityScore += 10;
    analysis.warnings.push('Summary weak - aim for 100+ characters with specific skills');
    analysis.rejectionReasons.push('⚠️ LIKELY REJECTED: Vague summary - Doesn\'t communicate specific expertise or value');
  } else if (summary.includes('passionate') || summary.includes('hardworking') || summary.includes('team player')) {
    analysis.qualityScore += 12;
    analysis.warnings.push('Summary contains weak phrases - remove generic terms');
    analysis.rejectionReasons.push('⚠️ WEAK: Generic buzzwords detected - Hiring managers ignore cliché phrases');
  } else {
    analysis.qualityScore += 20;
  }
  analysis.sectionScores.summary = Math.min(20, analysis.qualityScore);

  // Skills Analysis (20 points)
  const skills = (resumeData.skills || []).filter(s => s && s.trim());
  if (skills.length < 3) {
    analysis.warnings.push('Too few skills - minimum 3 required');
    analysis.blockers.push('Add at least 3 technical skills');
    analysis.rejectionReasons.push('❌ REJECTED: Insufficient skills listed - ATS filters out candidates with <5 relevant skills');
  } else if (skills.length < 5) {
    analysis.qualityScore += 10;
    analysis.warnings.push('Add more skills - aim for 8+ relevant skills');
    analysis.rejectionReasons.push('⚠️ LIKELY REJECTED: Skill set appears limited - Won\'t match most JD requirements');
  } else if (skills.length < 8) {
    analysis.qualityScore += 15;
  } else {
    analysis.qualityScore += 20;
  }
  analysis.sectionScores.skills = Math.min(20, analysis.qualityScore - analysis.sectionScores.summary);

  // Projects Analysis (30 points)
  const projects = resumeData.project || [];
  if (projects.length === 0) {
    analysis.warnings.push('No projects listed');
    analysis.blockers.push('Add at least 1 project with detailed description');
    analysis.rejectionReasons.push('❌ REJECTED: No projects - Freshers without projects appear inexperienced');
  } else {
    let projectScore = 0;
    if (projects.length >= 2) projectScore += 10;
    else {
      analysis.warnings.push('Add more projects - aim for 2-3 strong projects');
      analysis.rejectionReasons.push('⚠️ WEAK: Only 1 project - Insufficient proof of technical capability');
    }

    const weakProjects = projects.filter(p => {
      const desc = p.description || '';
      return desc.length < 100 || 
             desc.toLowerCase().includes('worked on') ||
             desc.toLowerCase().includes('familiar with') ||
             !desc.match(/\d/);
    });

    if (weakProjects.length > 0) {
      analysis.warnings.push(`${weakProjects.length} project(s) lack detail, metrics, or use weak language`);
      analysis.rejectionReasons.push(`⚠️ LIKELY REJECTED: ${weakProjects.length} project(s) lack measurable impact - No metrics = no credibility`);
      projectScore += 10;
    } else {
      projectScore += 20;
    }

    analysis.qualityScore += projectScore;
    analysis.sectionScores.projects = projectScore;
  }

  // Education Analysis (15 points)
  const education = resumeData.education || [];
  if (education.length === 0 || !education[0]?.institution || !education[0]?.degree) {
    analysis.warnings.push('Education incomplete');
    analysis.blockers.push('Complete education section');
    analysis.rejectionReasons.push('❌ REJECTED: Missing education details - Mandatory field for most roles');
  } else {
    analysis.qualityScore += 15;
    analysis.sectionScores.education = 15;
  }

  // Contact Info Analysis (15 points)
  const contact = resumeData.personal_info || {};
  let contactScore = 0;
  if (contact.full_name && contact.email) contactScore += 10;
  else {
    analysis.blockers.push('Add full name and email');
    analysis.rejectionReasons.push('❌ REJECTED: Missing contact info - Recruiter cannot reach you');
  }
  
  if (contact.phone || contact.linkedin) contactScore += 5;
  else {
    analysis.warnings.push('Add phone or LinkedIn for better reach');
    analysis.rejectionReasons.push('⚠️ WEAK: No phone/LinkedIn - Reduces callback chances by 40%');
  }
  
  analysis.qualityScore += contactScore;
  analysis.sectionScores.contact = contactScore;

  // ATS Analysis
  const atsAnalysis = calculateATSScore(resumeData);
  analysis.atsScore = atsAnalysis.score;
  if (atsAnalysis.score < 60) {
    analysis.rejectionReasons.push('❌ LIKELY REJECTED: ATS score too low - Resume won\'t pass automated screening');
  }

  // Readiness Check
  analysis.readyToApply = analysis.qualityScore >= 70 && analysis.atsScore >= 60 && analysis.blockers.length === 0;

  return analysis;
};

const calculateATSScore = (resumeData) => {
  let score = 100;
  
  const summary = (resumeData.professional_summary || '').toLowerCase();
  const skills = (resumeData.skills || []).join(' ').toLowerCase();
  const projects = (resumeData.project || []).map(p => p.description || '').join(' ').toLowerCase();
  
  const content = `${summary} ${skills} ${projects}`;
  
  const criticalKeywords = ['python', 'javascript', 'react', 'node', 'sql', 'git', 'api', 'database'];
  const missingKeywords = criticalKeywords.filter(kw => !content.includes(kw));
  
  score -= missingKeywords.length * 5;
  
  const weakVerbs = ['worked on', 'helped with', 'familiar with', 'responsible for'];
  weakVerbs.forEach(verb => {
    if (content.includes(verb)) score -= 10;
  });
  
  return { score: Math.max(0, score), missingKeywords };
};

export const matchJobDescription = (resumeData, jobDescription) => {
  if (!jobDescription || jobDescription.length < 50) {
    return { matchScore: 0, missingKeywords: [], suggestions: [] };
  }

  const jd = jobDescription.toLowerCase();
  const resumeContent = `
    ${resumeData.professional_summary || ''}
    ${(resumeData.skills || []).join(' ')}
    ${(resumeData.project || []).map(p => p.description).join(' ')}
    ${(resumeData.experience || []).map(e => e.description).join(' ')}
  `.toLowerCase();

  // Extract keywords from JD
  const techKeywords = jd.match(/\b(python|javascript|java|react|node|sql|aws|docker|kubernetes|tensorflow|pytorch|mongodb|postgresql|git|api|rest|graphql|typescript|angular|vue|django|flask|spring|microservices|ci\/cd|agile|scrum)\b/gi) || [];
  const uniqueKeywords = [...new Set(techKeywords.map(k => k.toLowerCase()))];
  
  const missingKeywords = uniqueKeywords.filter(kw => !resumeContent.includes(kw));
  const matchedKeywords = uniqueKeywords.filter(kw => resumeContent.includes(kw));
  
  const matchScore = uniqueKeywords.length > 0 
    ? Math.round((matchedKeywords.length / uniqueKeywords.length) * 100)
    : 0;

  const suggestions = [];
  if (matchScore < 60) suggestions.push('Add more JD keywords to summary and project descriptions');
  if (missingKeywords.length > 5) suggestions.push(`Critical: ${missingKeywords.length} key technologies missing`);
  
  return { matchScore, missingKeywords: missingKeywords.slice(0, 10), suggestions, matchedKeywords };
};

export const validateBulletPoint = (text) => {
  const issues = [];
  
  if (!text || text.length < 20) {
    issues.push('Too short - add detail');
    return { valid: false, issues };
  }
  
  const weakVerbs = ['worked on', 'helped', 'assisted', 'responsible for', 'familiar with'];
  const hasWeakVerb = weakVerbs.some(v => text.toLowerCase().includes(v));
  if (hasWeakVerb) issues.push('Weak action verb - use Built/Developed/Implemented/Designed');
  
  const hasMetric = /\d+/.test(text);
  if (!hasMetric) issues.push('Add metrics - numbers, percentages, or scale');
  
  const hasTech = /python|javascript|react|node|sql|tensorflow|pytorch|aws|docker/i.test(text);
  if (!hasTech) issues.push('Mention specific technologies used');
  
  return { valid: issues.length === 0, issues };
};
