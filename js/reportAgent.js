/* js/reportAgent.js */

import { MEETINGS_DATA, MR_DATA, DOCTORS_DATA, SALES_METRICS } from './data.js';

export class ReportAgent {
  constructor() {
    this.name = "Report Agent";
    this.colorClass = "sender-report";
  }

  /**
   * Simulates the agent's thinking logs for terminal
   */
  getThinkingLogs(territory = "All", range = "Q2") {
    return [
      `Retrieving transactional logs and MR time cards for sector: "${territory}".`,
      `Consolidating physician interaction charts for period: [${range}]...`,
      `Synthesizing CRM analytics with monthly sales dispatch reports.`,
      `Performing statistical variance checks on MR target quotas vs closed deals.`,
      `Formulating KPI charts [Average deal values, conversion velocities]...`,
      `Compiling final audit-compliant PDF document layout structure.`
    ];
  }

  /**
   * Generates a structural report object containing computed metrics and records
   * @param {string} territory filter 
   * @returns {Object} report structure
   */
  generateReportData(territory = "All") {
    // 1. Filter MRs
    const targetMRs = territory === "All" 
      ? MR_DATA 
      : MR_DATA.filter(mr => mr.territory.toLowerCase() === territory.toLowerCase());
      
    const mrIds = targetMRs.map(m => m.id);

    // 2. Filter Meetings
    const targetMeetings = MEETINGS_DATA.filter(meet => {
      const isMrInTerritory = mrIds.includes(meet.mrId);
      return isMrInTerritory;
    });

    // 3. Compute KPIs
    const totalMeetings = targetMeetings.length;
    const completedMeetings = targetMeetings.filter(m => m.status === "completed").length;
    const completionRate = totalMeetings > 0 ? Math.round((completedMeetings / totalMeetings) * 100) : 0;
    
    const totalSales = targetMRs.reduce((acc, mr) => acc + mr.monthlySales, 0);
    const avgSalesPerMR = targetMRs.length > 0 ? Math.round(totalSales / targetMRs.length) : 0;

    // 4. Construct Table Records
    const tableData = targetMRs.map(mr => {
      const mrMeets = targetMeetings.filter(m => m.mrId === mr.id);
      const scheduledCount = mrMeets.filter(m => m.status === "scheduled").length;
      const completedCount = mrMeets.filter(m => m.status === "completed").length;
      
      return {
        name: mr.name,
        specialty: mr.specialty,
        territory: mr.territory,
        rating: mr.rating,
        scheduledCount,
        completedCount,
        sales: mr.monthlySales
      };
    });

    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });

    return {
      title: `${territory} Territory Performance Report`,
      date: reportDate,
      period: "Current Operational Month (Q2-2026)",
      kpis: {
        totalMRs: targetMRs.length,
        totalMeetings,
        completionRate: `${completionRate}%`,
        totalSales: `₹${totalSales.toLocaleString('en-IN')}`,
        avgSalesPerMR: `₹${avgSalesPerMR.toLocaleString('en-IN')}`
      },
      tableData,
      executiveSummary: `This audit details activities for the ${territory} region. A total of ${targetMRs.length} medical representatives handled relations with regional hospitals, yielding a cumulative sales volume of ₹${totalSales.toLocaleString('en-IN')} this period. Conversion ratios remain stable with an engagement rate of ${completionRate}%.`
    };
  }

  /**
   * Helper to convert report data to CSV string
   */
  convertToCSV(reportData) {
    const headers = ["Representative Name", "Specialty", "Territory", "Rating", "Meetings Scheduled", "Meetings Completed", "Sales Revenue (₹)"];
    const rows = reportData.tableData.map(row => [
      row.name,
      row.specialty,
      row.territory,
      row.rating,
      row.scheduledCount,
      row.completedCount,
      row.sales
    ]);

    const csvContent = [
      [reportData.title],
      [`Generated: ${reportData.date}`],
      [`Period: ${reportData.period}`],
      [],
      headers.join(","),
      ...rows.map(e => e.map(val => `"${val}"`).join(","))
    ].join("\n");

    return csvContent;
  }
}
