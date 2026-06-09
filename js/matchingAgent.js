/* js/matchingAgent.js */

import { MR_DATA } from './data.js';

export class MatchingAgent {
  constructor() {
    this.name = "Matching Agent";
    this.colorClass = "sender-matching";
  }

  /**
   * Simulates the agent's step-by-step thinking process for terminal output
   * @param {string} specialty 
   * @param {string} region 
   * @returns {Array<string>} log lines of thinking
   */
  getThinkingLogs(specialty, region) {
    return [
      `Initializing MR selection protocol for therapeutic area: "${specialty}" in region: "${region}".`,
      `Accessing Medical Representative registry (retrieved ${MR_DATA.length} active agent profiles)...`,
      `Filtering candidates by core specialty overlap and primary territory alignment.`,
      `Analyzing physician connection densities and historical doctor-relationship logs.`,
      `Calculating compatibility index score based on: [Specialty Match (40%), Region Fit (30%), Doctor Networks (20%), Representative Rating (10%)].`,
      `Refining ranking matrix and selecting top performing profiles...`
    ];
  }

  /**
   * Matches medical representatives based on product specialty and region
   * @param {string} specialty 
   * @param {string} region 
   * @returns {Array<Object>} list of match results with score details
   */
  findMatches(specialty, region) {
    const results = [];

    for (const mr of MR_DATA) {
      let specialtyScore = 0;
      let territoryScore = 0;
      
      // 1. Specialty Match (40 points max)
      if (mr.specialty.toLowerCase() === specialty.toLowerCase()) {
        specialtyScore = 40;
      } else if (
        (specialty.toLowerCase().includes("cardio") && mr.specialty.toLowerCase().includes("cardio")) ||
        (specialty.toLowerCase().includes("diabetes") && mr.specialty.toLowerCase().includes("endocrinology"))
      ) {
        specialtyScore = 30; // close match
      } else {
        specialtyScore = 10; // general clinical experience
      }

      // 2. Territory Fit (30 points max)
      if (mr.territory.toLowerCase() === region.toLowerCase()) {
        territoryScore = 30;
      } else {
        territoryScore = 0; // different region
      }

      // 3. Doctor Relationships (20 points max, scaled up to 60 relationships)
      const relationshipsScore = Math.min(20, (mr.doctorRelationships / 60) * 20);

      // 4. Rating Score (10 points max, rating / 5 * 10)
      const ratingScore = (mr.rating / 5.0) * 10;

      const totalScore = Math.round(specialtyScore + territoryScore + relationshipsScore + ratingScore);

      // Construct reasoning statements
      const reasoning = [];
      if (specialtyScore === 40) {
        reasoning.push(`Perfect specialty fit. Expert-level familiarity with ${mr.specialty} therapies.`);
      } else if (specialtyScore === 30) {
        reasoning.push(`High transferrable specialty knowledge in related therapeutic field.`);
      }

      if (territoryScore === 30) {
        reasoning.push(`Local representative. Already established in ${mr.territory} with active route plans.`);
      } else {
        reasoning.push(`Non-local. Will require new territory deployment strategy for ${region}.`);
      }

      if (mr.doctorRelationships >= 45) {
        reasoning.push(`Outstanding physician network (${mr.doctorRelationships} active relationships), accelerating clinic access.`);
      } else {
        reasoning.push(`Moderate physician network (${mr.doctorRelationships} relationships), expansion potential available.`);
      }

      if (mr.rating >= 4.8) {
        reasoning.push(`Top-tier performance rating (${mr.rating}/5.0) based on doctor feedback.`);
      }

      results.push({
        mr,
        score: totalScore,
        specialtyScore,
        territoryScore,
        relationshipsScore: Math.round(relationshipsScore),
        ratingScore: Math.round(ratingScore),
        reasoning
      });
    }

    // Sort by highest score first
    return results.sort((a, b) => b.score - a.score);
  }
}
