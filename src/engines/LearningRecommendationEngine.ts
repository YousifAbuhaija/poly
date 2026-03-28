import type { IssueProfile, IssueStatement } from '../types';

export interface LearningRecommendation {
  category: string;
  reason: string;
  topics: string[];
  priority: 'high' | 'medium' | 'low';
}

/**
 * Analyzes user's issue responses to recommend learning topics
 */
export function generateLearningRecommendations(
  issueProfile: IssueProfile,
  issues: IssueStatement[]
): LearningRecommendation[] {
  const recommendations: LearningRecommendation[] = [];
  const categoryStats = analyzeCategoryEngagement(issueProfile, issues);

  // Find categories where user skipped questions (low engagement)
  const skippedCategories = Object.entries(categoryStats)
    .filter(([_, stats]) => stats.skipRate > 0.5)
    .map(([category]) => category);

  // Find categories where user has strong opinions (high engagement)
  const strongOpinionCategories = Object.entries(categoryStats)
    .filter(([_, stats]) => stats.strongOpinionRate > 0.7)
    .map(([category]) => category);

  // Find categories with mixed/uncertain responses
  const uncertainCategories = Object.entries(categoryStats)
    .filter(([_, stats]) => stats.skipRate > 0.3 && stats.skipRate < 0.7)
    .map(([category]) => category);

  // Generate recommendations for skipped categories (high priority)
  skippedCategories.forEach(category => {
    recommendations.push({
      category,
      reason: "You skipped most questions in this area. Learning the basics could help you form informed opinions.",
      topics: getBasicTopics(category),
      priority: 'high'
    });
  });

  // Generate recommendations for uncertain categories (medium priority)
  uncertainCategories.forEach(category => {
    recommendations.push({
      category,
      reason: "You seem uncertain about some issues here. Exploring different perspectives could clarify your stance.",
      topics: getIntermediateTopics(category),
      priority: 'medium'
    });
  });

  // Generate recommendations for strong opinion categories (low priority - deepening knowledge)
  strongOpinionCategories.slice(0, 2).forEach(category => {
    recommendations.push({
      category,
      reason: "You have strong views here. Dive deeper to understand counterarguments and nuances.",
      topics: getAdvancedTopics(category),
      priority: 'low'
    });
  });

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

interface CategoryStats {
  total: number;
  skipped: number;
  strongOpinions: number;
  skipRate: number;
  strongOpinionRate: number;
}

function analyzeCategoryEngagement(
  issueProfile: IssueProfile,
  issues: IssueStatement[]
): Record<string, CategoryStats> {
  const stats: Record<string, CategoryStats> = {};

  issues.forEach(issue => {
    const category = issue.category;
    const response = issueProfile[issue.id] || 0;

    if (!stats[category]) {
      stats[category] = {
        total: 0,
        skipped: 0,
        strongOpinions: 0,
        skipRate: 0,
        strongOpinionRate: 0
      };
    }

    stats[category].total++;
    
    if (response === 0) {
      stats[category].skipped++;
    } else if (Math.abs(response) === 1) {
      stats[category].strongOpinions++;
    }
  });

  // Calculate rates
  Object.values(stats).forEach(stat => {
    stat.skipRate = stat.skipped / stat.total;
    stat.strongOpinionRate = stat.strongOpinions / stat.total;
  });

  return stats;
}

function getBasicTopics(category: string): string[] {
  const topicMap: Record<string, string[]> = {
    'Healthcare': [
      'How the U.S. healthcare system works',
      'Public vs. private insurance basics',
      'What is Medicaid and Medicare?'
    ],
    'Education': [
      'How public education is funded',
      'Student loan system overview',
      'Federal vs. state education roles'
    ],
    'Economy': [
      'How taxes work in the U.S.',
      'Progressive vs. flat tax systems',
      'Income inequality basics'
    ],
    'Housing': [
      'Rent control pros and cons',
      'Affordable housing programs',
      'Zoning laws explained'
    ],
    'Environment': [
      'Climate change science basics',
      'How environmental regulations work',
      'Renewable vs. fossil fuel energy'
    ],
    'Public Safety': [
      'Police funding and budgets',
      'Community policing models',
      'Criminal justice reform overview'
    ],
    'Electoral': [
      'How the Electoral College works',
      'Voting rights history',
      'Gerrymandering explained'
    ],
    'Domestic Policy': [
      'Second Amendment interpretation',
      'Gun control measures overview',
      'Background check systems'
    ],
    'Immigration': [
      'U.S. immigration system basics',
      'Legal vs. undocumented immigration',
      'Border policy overview'
    ],
    'Social': [
      'LGBTQ+ rights history',
      'Marriage equality timeline',
      'Religious freedom vs. civil rights'
    ]
  };

  return topicMap[category] || ['General political literacy', 'How government works', 'Civic engagement basics'];
}

function getIntermediateTopics(category: string): string[] {
  const topicMap: Record<string, string[]> = {
    'Healthcare': [
      'Single-payer vs. multi-payer systems',
      'Healthcare cost drivers',
      'Comparing international healthcare models'
    ],
    'Education': [
      'School choice and voucher programs',
      'Higher education funding models',
      'Education policy debates'
    ],
    'Economy': [
      'Supply-side vs. demand-side economics',
      'Wealth redistribution arguments',
      'Corporate tax policy'
    ],
    'Housing': [
      'Housing market economics',
      'Homelessness root causes',
      'Urban planning approaches'
    ],
    'Environment': [
      'Carbon pricing mechanisms',
      'Green New Deal proposals',
      'Environmental justice issues'
    ],
    'Public Safety': [
      'Defund vs. reform debates',
      'Qualified immunity explained',
      'Prison reform proposals'
    ],
    'Electoral': [
      'Ranked choice voting',
      'Campaign finance reform',
      'Voter ID law debates'
    ],
    'Domestic Policy': [
      'Red flag laws',
      'Assault weapon definitions',
      'Gun violence research'
    ],
    'Immigration': [
      'Path to citizenship proposals',
      'DACA and Dreamers',
      'Immigration enforcement policies'
    ],
    'Social': [
      'Religious liberty cases',
      'Anti-discrimination laws',
      'Social policy trade-offs'
    ]
  };

  return topicMap[category] || ['Policy analysis methods', 'Understanding political ideologies', 'Evaluating sources'];
}

function getAdvancedTopics(category: string): string[] {
  const topicMap: Record<string, string[]> = {
    'Healthcare': [
      'Healthcare economics and incentives',
      'Medical innovation vs. cost control',
      'Global health policy comparisons'
    ],
    'Education': [
      'Education research and outcomes',
      'Teacher compensation models',
      'Education technology policy'
    ],
    'Economy': [
      'Modern monetary theory',
      'Inequality and economic mobility',
      'Trade policy and globalization'
    ],
    'Housing': [
      'Housing policy effectiveness studies',
      'Land use and property rights',
      'Gentrification economics'
    ],
    'Environment': [
      'Climate policy cost-benefit analysis',
      'Energy transition challenges',
      'Environmental regulation effectiveness'
    ],
    'Public Safety': [
      'Policing research and data',
      'Criminal justice system reform',
      'Recidivism and rehabilitation'
    ],
    'Electoral': [
      'Electoral system design',
      'Democratic theory and practice',
      'Voting behavior research'
    ],
    'Domestic Policy': [
      'Gun policy research and data',
      'Constitutional law and rights',
      'Public safety vs. liberty trade-offs'
    ],
    'Immigration': [
      'Immigration economics',
      'Border security technology',
      'Integration and assimilation research'
    ],
    'Social': [
      'Constitutional rights jurisprudence',
      'Social change movements',
      'Cultural and political polarization'
    ]
  };

  return topicMap[category] || ['Advanced policy analysis', 'Political philosophy', 'Comparative government'];
}
