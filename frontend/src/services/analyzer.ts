import { ProfileBundle, EvidenceItem, ScoreCategory } from './api';

function calculateScoreCategory(score: number, evidence: EvidenceItem[]): ScoreCategory {
  return {
    score: Math.min(100, Math.max(0, Math.round(score))),
    evidence
  };
}

export const analyzerService = {
  analyze(profileData: any, reposData: any[], languagesMap: Record<string, Record<string, number>>, packageJsonsMap: Record<string, any> = {}): ProfileBundle {
    // 1. Analyze Profile
    const followers = profileData.followers || 0;
    const publicRepos = profileData.public_repos || 0;
    const accountAgeDays = (new Date().getTime() - new Date(profileData.created_at).getTime()) / (1000 * 3600 * 24);
    const accountAgeYears = accountAgeDays / 365;

    // 2. Analyze Repositories
    let totalStars = 0;
    let totalForks = 0;
    let totalCommitsApproximation = 0; // Using repo size/activity as proxy since commits require too many API calls
    const allTechnologies = new Set<string>();
    
    const analyzedRepos = reposData.map(repo => {
      totalStars += repo.stargazers_count;
      totalForks += repo.forks_count;
      
      const repoLangs = languagesMap[repo.name] || {};
      const techs = Object.keys(repoLangs);
      
      const pkg = packageJsonsMap[repo.name];
      if (pkg) {
        const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
        if (deps['react'] || deps['react-dom'] || deps['@types/react']) {
          if (!techs.includes('React')) techs.push('React');
        }
        if (deps['express'] || deps['@types/express']) {
          if (!techs.includes('Node.js')) techs.push('Node.js');
          if (!techs.includes('Express')) techs.push('Express');
        }
        if (deps['next']) {
          if (!techs.includes('Next.js')) techs.push('Next.js');
          if (!techs.includes('React')) techs.push('React');
        }
        if (deps['vue']) {
          if (!techs.includes('Vue')) techs.push('Vue');
        }
        if (deps['@angular/core']) {
          if (!techs.includes('Angular')) techs.push('Angular');
        }
        if (deps['jest']) {
          if (!techs.includes('Jest')) techs.push('Jest');
        }
      }

      techs.forEach(t => allTechnologies.add(t));
      
      const complexityScore = Math.min(100, (repo.size / 1000) * 10 + (repo.stargazers_count * 2));
      totalCommitsApproximation += repo.size / 100;

      return {
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || '',
        language: repo.language || 'Unknown',
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        commits: Math.round(repo.size / 100), // very rough proxy
        technologies: techs,
        complexityScore: Math.round(complexityScore),
        projectType: repo.fork ? 'Fork' : 'Original',
        summary: repo.description || 'A repository created by the user.',
        evidence: [
          { label: 'Stars', value: repo.stargazers_count },
          { label: 'Forks', value: repo.forks_count },
          { label: 'Size', value: `${Math.round(repo.size / 1024)} MB` }
        ],
        pushedAt: repo.pushed_at
      };
    });

    // 3. Calculate Scores
    const experienceScore = Math.min(100, (accountAgeYears * 10) + (publicRepos * 0.5) + (totalStars * 2));
    const codeQualityScore = Math.min(100, 50 + (totalStars > 0 ? 20 : 0) + (analyzedRepos.filter(r => r.description).length / (analyzedRepos.length || 1) * 30));
    const consistencyScore = Math.min(100, 40 + (publicRepos > 10 ? 30 : publicRepos * 3) + (totalForks > 0 ? 30 : 0));
    
    const overallScore = Math.round((experienceScore + codeQualityScore + consistencyScore) / 3);

    const scores = {
      overall: calculateScoreCategory(overallScore, [
        { label: 'Total Repos', value: publicRepos },
        { label: 'Total Stars', value: totalStars }
      ]),
      experience: calculateScoreCategory(experienceScore, [
        { label: 'Years Active', value: accountAgeYears.toFixed(1) }
      ]),
      quality: calculateScoreCategory(codeQualityScore, [
        { label: 'Documented Repos', value: analyzedRepos.filter(r => r.description).length }
      ]),
      consistency: calculateScoreCategory(consistencyScore, [
        { label: 'Total Forks', value: totalForks }
      ])
    };

    let expLevel = 'Junior';
    if (experienceScore > 80) expLevel = 'Lead';
    else if (experienceScore > 60) expLevel = 'Senior';
    else if (experienceScore > 40) expLevel = 'Mid-Level';

    const techArray = Array.from(allTechnologies);
    const strengths = techArray.slice(0, 5);

    return {
      profile: {
        username: profileData.login,
        avatarUrl: profileData.avatar_url,
        name: profileData.name || profileData.login,
        bio: profileData.bio || '',
        followers,
        following: profileData.following,
        publicRepos,
        analyzedAt: new Date().toISOString(),
        shareToken: btoa(profileData.login + Date.now()).substring(0, 10)
      },
      repositories: analyzedRepos,
      scores,
      insights: {
        summary: `Based on an AI-driven analysis of ${profileData.login}'s GitHub profile, the candidate demonstrates a ${expLevel.toLowerCase()} level of experience. They have been active for over ${Math.floor(accountAgeYears)} years, maintaining ${publicRepos} public repositories. Their most prominent technologies include ${strengths.join(', ') || 'various programming languages'}.`,
        strengths: strengths.length ? strengths : ['General Programming'],
        weaknesses: ['Requires evaluation of private codebases', 'System design capabilities not visible via GitHub'],
        recommendedRoles: [
          {
            role: 'Software Engineer',
            matchPercentage: overallScore,
            evidence: ['Repository activity', 'Language distribution'],
            recommendations: ['Consider for technical interview', 'Evaluate system design skills']
          }
        ]
      }
    };
  }
};
