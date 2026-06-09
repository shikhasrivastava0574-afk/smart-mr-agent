/* js/analyticsAgent.js */

import { TERRITORIES_DATA, MR_DATA } from './data.js';

export class AnalyticsAgent {
  constructor() {
    this.name = "Analytics Agent";
    this.colorClass = "sender-analytics";
  }

  /**
   * Simulates the agent's thinking logs for terminal
   */
  getThinkingLogs(region = "all") {
    return [
      `Retrieving demographic healthcare datasets for region: "${region}".`,
      `Scanning territorial doctor density vs existing MR coverage indices...`,
      `Analyzing prescription demand multipliers and competitor market penetration.`,
      `Correlating territorial ROI potentials with travel cost benchmarks.`,
      `Running priority matrix algorithm to locate high-potential underserved sectors...`,
      `Generating territory recommendation scores (Scale 1-100)...`
    ];
  }

  /**
   * Calculates territory diagnostics and identifies high-priority underserved regions
   * Priority Index = (Market Demand Value * Doctor Count * Competitor Gap) / (Active MRs + 0.5)
   */
  analyzeTerritories() {
    const analysis = TERRITORIES_DATA.map(terr => {
      // Numerical weightings
      const demandVal = terr.marketDemand === "High" ? 3 : (terr.marketDemand === "Medium" ? 2 : 1);
      const compVal = terr.competitorStrength === "High" ? 1 : (terr.competitorStrength === "Medium" ? 2.5 : 4);
      
      // Calculate Doctor Density (Doctors per active Representative)
      const activeMRs = mrCountForTerritory(terr.name);
      const docDensity = Math.round(terr.doctorsCount / (activeMRs || 0.5));
      
      // Multiplier formula for priority score (0 - 100 normalization)
      const rawScore = (demandVal * terr.doctorsCount * compVal) / (activeMRs + 0.5);
      
      // Let's normalize it to a reasonable scale of 30 - 99
      const priorityScore = Math.min(99, Math.max(30, Math.round(rawScore / 25)));

      // Formulate automated recommendation texts
      let actionRecommendation = "";
      if (activeMRs === 0) {
        actionRecommendation = `CRITICAL ACTION REQUIRED: Territory has zero coverage. Market demand is ${terr.marketDemand}. Deploy at least 2 Representatives immediately.`;
      } else if (docDensity > 200) {
        actionRecommendation = `EXPANSION RECOMMENDED: Active representatives are overloaded (1 MR per ${docDensity} doctors). Deploy 1 additional representative.`;
      } else if (priorityScore > 80) {
        actionRecommendation = `OPPORTUNITY WARNING: High ROI potential (${terr.estimatedROI}%) coupled with low competitor resistance. Highly favorable expansion.`;
      } else {
        actionRecommendation = `STABILIZE: Coverage is balanced. Focus on representative relationship maturity and conversion audits.`;
      }

      return {
        ...terr,
        activeMRs,
        docDensity,
        priorityScore,
        actionRecommendation
      };
    });

    // Sort by highest priority first
    return analysis.sort((a, b) => b.priorityScore - a.priorityScore);
  }
}

/**
 * Helper to count actual active MRs assigned to a territory name
 */
function mrCountForTerritory(territoryName) {
  return MR_DATA.filter(mr => mr.territory.toLowerCase() === territoryName.toLowerCase()).length;
}
