/* js/console.js */

import { MatchingAgent } from './matchingAgent.js';
import { SchedulingAgent } from './schedulingAgent.js';
import { AnalyticsAgent } from './analyticsAgent.js';
import { ReportAgent } from './reportAgent.js';
import { MR_DATA, DOCTORS_DATA, PRODUCTS_DATA, MEETINGS_DATA } from './data.js';

export class AgentConsole {
  constructor(appInstance) {
    this.app = appInstance;
    
    // Instantiate sub-agents
    this.matchingAgent = new MatchingAgent();
    this.schedulingAgent = new SchedulingAgent();
    this.analyticsAgent = new AnalyticsAgent();
    this.reportAgent = new ReportAgent();

    // DOM bindings
    this.screen = document.getElementById("terminal-screen");
    this.form = document.getElementById("terminal-form");
    this.input = document.getElementById("terminal-input");
    this.nodes = document.querySelectorAll(".agent-node");

    this.initEvents();
    this.writeSystemLog("Multi-Agent Coordinator initialized. Ready for operations. Type /help to see command matrix.");
  }

  initEvents() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const rawCmd = this.input.value.trim();
      if (!rawCmd) return;
      
      this.input.value = "";
      this.handleCommand(rawCmd);
    });

    // Node click to focus
    this.nodes.forEach(node => {
      node.addEventListener("click", () => {
        const agentName = node.dataset.agent;
        this.writeSystemLog(`Direct link established with [${agentName.toUpperCase()} AGENT]. Command line focused.`);
        this.input.focus();
        
        // Populate sample text depending on agent
        if (agentName === "matching") {
          this.input.value = "/match Cardiology Lucknow";
        } else if (agentName === "scheduling") {
          this.input.value = `/schedule mr-01 doc-01 2026-06-12 10:30`;
        } else if (agentName === "analytics") {
          this.input.value = "/analyze Prayagraj";
        } else if (agentName === "report") {
          this.input.value = "/report Lucknow";
        }
      });
    });
  }

  writeLog(sender, message, colorClass = "sender-system", isThinking = false) {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    const entry = document.createElement("div");
    entry.className = `log-entry ${isThinking ? 'thinking-state' : ''}`;
    
    entry.innerHTML = `
      <span class="log-timestamp">[${timeStr}]</span>
      <span class="log-sender ${colorClass}">${sender}:</span>
      <span class="log-message">${message}</span>
    `;
    
    this.screen.appendChild(entry);
    this.screen.scrollTop = this.screen.scrollHeight;
    return entry;
  }

  writeSystemLog(message) {
    this.writeLog("System", message, "sender-system");
  }

  showTypingIndicator(sender, colorClass) {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const entry = document.createElement("div");
    entry.className = "log-entry thinking-state";
    entry.id = "temp-typing";
    entry.innerHTML = `
      <span class="log-timestamp">[${timeStr}]</span>
      <span class="log-sender ${colorClass}">${sender}:</span>
      <span class="typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </span>
    `;
    this.screen.appendChild(entry);
    this.screen.scrollTop = this.screen.scrollHeight;
  }

  removeTypingIndicator() {
    const indicator = document.getElementById("temp-typing");
    if (indicator) indicator.remove();
  }

  setAgentNodeActive(agentKey, active) {
    const node = document.querySelector(`.agent-node[data-agent="${agentKey}"]`);
    if (!node) return;
    if (active) {
      node.classList.add("active");
    } else {
      node.classList.remove("active");
    }
  }

  /**
   * Helper to write a sequential log stream for agent thoughts
   */
  async streamThinking(agentKey, agentName, colorClass, logs) {
    this.setAgentNodeActive("system", true);
    this.setAgentNodeActive(agentKey, true);
    
    for (const logText of logs) {
      this.showTypingIndicator(agentName, colorClass);
      await new Promise(r => setTimeout(r, 600));
      this.removeTypingIndicator();
      this.writeLog(agentName, logText, colorClass, true);
    }
    
    this.setAgentNodeActive(agentKey, false);
    this.setAgentNodeActive("system", false);
  }

  /**
   * Command router
   */
  async handleCommand(rawCmd) {
    this.writeLog("User", rawCmd, "sender-user");
    
    const parts = rawCmd.split(/\s+/);
    const command = parts[0].toLowerCase();
    
    // Direct command execution
    if (command === "/help") {
      this.printHelp();
      return;
    }
    
    if (command === "/clear") {
      this.screen.innerHTML = "";
      this.writeSystemLog("Console cleared.");
      return;
    }

    // Natural Language translation or CLI routing
    if (command === "/match" || rawCmd.toLowerCase().includes("match") || rawCmd.toLowerCase().includes("find rep")) {
      await this.executeMatchCommand(parts, rawCmd);
    } 
    else if (command === "/schedule" || rawCmd.toLowerCase().includes("schedule") || rawCmd.toLowerCase().includes("book")) {
      await this.executeScheduleCommand(parts, rawCmd);
    } 
    else if (command === "/analyze" || rawCmd.toLowerCase().includes("analyze") || rawCmd.toLowerCase().includes("territory")) {
      await this.executeAnalyzeCommand(parts, rawCmd);
    } 
    else if (command === "/report" || rawCmd.toLowerCase().includes("report") || rawCmd.toLowerCase().includes("sales")) {
      await this.executeReportCommand(parts, rawCmd);
    } 
    else {
      // General routing fallback
      this.writeSystemLog(`Command not recognized as a direct CLI route. Delegating query to Coordinator agent...`);
      await new Promise(r => setTimeout(r, 1000));
      this.writeLog("Coordinator Agent", `Analyzing prompt intent... Detected generic query. Suggesting '/help' for available capabilities.`, "sender-system");
    }
  }

  printHelp() {
    this.writeSystemLog(`Available Agent Orchestrations:
- 🔍 /match [Specialty] [Territory]  : Connect MRs based on product and region.
  Example: /match Cardiology Lucknow
- 📅 /schedule [mrId] [docId] [YYYY-MM-DD] [HH:MM]  : Book physician visits.
  Example: /schedule mr-01 doc-01 2026-06-15 14:00
- 📈 /analyze [Territory]           : Optimize territory allocations and demand metrics.
  Example: /analyze Prayagraj
- 📝 /report [Territory]            : Generate a performance audit preview.
  Example: /report Lucknow
- 🧹 /clear                         : Wipe terminal logs.
`);
  }

  // --- Matching Agent Execution ---
  async executeMatchCommand(parts, rawCmd) {
    let specialty = "Cardiology";
    let region = "Lucknow";

    if (parts[0] === "/match" && parts.length >= 3) {
      specialty = parts[1].replace(/['"]/g, ''); // strip quotes
      region = parts[2];
      
      const matchedProd = PRODUCTS_DATA.find(p => p.name.toLowerCase() === specialty.toLowerCase());
      if (matchedProd) {
        specialty = matchedProd.specialty;
      }
    } else {
      // Simple NLP parser for general speech
      if (rawCmd.toLowerCase().includes("oncology")) specialty = "Oncology";
      if (rawCmd.toLowerCase().includes("pediatrics")) specialty = "Pediatrics";
      if (rawCmd.toLowerCase().includes("diabetes")) specialty = "Diabetes & Endocrinology";
      if (rawCmd.toLowerCase().includes("neurology")) specialty = "Neurology";

      if (rawCmd.toLowerCase().includes("noida")) region = "Noida";
      if (rawCmd.toLowerCase().includes("gorakhpur")) region = "Gorakhpur";
      if (rawCmd.toLowerCase().includes("kanpur")) region = "Kanpur";
      if (rawCmd.toLowerCase().includes("varanasi")) region = "Varanasi";
      if (rawCmd.toLowerCase().includes("prayagraj") || rawCmd.toLowerCase().includes("allahabad")) region = "Prayagraj";
    }

    const logs = this.matchingAgent.getThinkingLogs(specialty, region);
    await this.streamThinking("matching", this.matchingAgent.name, this.matchingAgent.colorClass, logs);

    // Call actual agent logic
    const matches = this.matchingAgent.findMatches(specialty, region);
    this.writeLog(this.matchingAgent.name, `Process complete. Found ${matches.length} candidates. Top candidate: ${matches[0].mr.name} (${matches[0].score}% Compatibility Score).`, this.matchingAgent.colorClass);
    
    // Update dashboard UI state
    this.app.renderMatches(matches, specialty, region);
    this.app.switchTab("matching-tab");
  }

  // --- Scheduling Agent Execution ---
  async executeScheduleCommand(parts, rawCmd) {
    let mrId = "mr-01";
    let docId = "doc-01";
    let date = "2026-06-12";
    let time = "10:30";
    let notes = "";

    const match = rawCmd.match(/^\/schedule\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)(?:\s+(.*))?$/i);
    if (match) {
      mrId = match[1];
      docId = match[2];
      date = match[3];
      time = match[4];
      notes = match[5] ? match[5].replace(/^["']|["']$/g, '') : "";
    } else {
      // NLP fallbacks or standard selections
      if (parts[0] === "/schedule") {
        this.writeLog(this.schedulingAgent.name, "Parameters missing. Defaulting booking values for simulation...", this.schedulingAgent.colorClass);
      }
      
      // Simple NLP logic from original command
      if (rawCmd.toLowerCase().includes("priya")) mrId = "mr-01";
      else if (rawCmd.toLowerCase().includes("rajesh")) mrId = "mr-02";
      else if (rawCmd.toLowerCase().includes("amit")) mrId = "mr-03";
      
      if (rawCmd.toLowerCase().includes("alok")) docId = "doc-01";
      else if (rawCmd.toLowerCase().includes("sunita")) docId = "doc-02";
      else if (rawCmd.toLowerCase().includes("rakesh")) docId = "doc-03";
    }

    const mr = MR_DATA.find(m => m.id === mrId);
    const doctor = DOCTORS_DATA.find(d => d.id === docId);
    const mrName = mr?.name || mrId;
    const docName = doctor?.name || docId;
    const defaultNotes = notes || (doctor ? `Product presentation with ${doctor.name}.` : `Product presentation.`);

    const logs = this.schedulingAgent.getThinkingLogs(mrName, docName, date, time);
    await this.streamThinking("scheduling", this.schedulingAgent.name, this.schedulingAgent.colorClass, logs);

    // Execute scheduling validation
    const result = this.schedulingAgent.scheduleMeeting(mrId, docId, date, time, defaultNotes);

    if (result.success) {
      result.warningLogs.forEach(warn => {
        this.writeLog(this.schedulingAgent.name, `[WARNING] ${warn}`, this.schedulingAgent.colorClass);
      });
      
      try {
        const response = await fetch('/api/meetings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mrId, doctorId: docId, date, time, notes: defaultNotes })
        });
        if (!response.ok) throw new Error('Failed to save scheduled meeting on server');
        const updatedDb = await response.json();
        await this.app.syncWithServer(updatedDb);

        // Find the newly created meeting in the synced MEETINGS_DATA
        const newMeeting = MEETINGS_DATA.find(m => m.mrId === mrId && m.doctorId === docId && m.date === date && m.time === time && m.status === 'pending');
        if (!newMeeting) throw new Error('New meeting not found in synced database');

        this.writeLog(this.schedulingAgent.name, `Booking initialized in PENDING state. Awaiting physician confirmation.`, this.schedulingAgent.colorClass);
        
        // Dispatch communication agent
        this.app.triggerDoctorWhatsApp(newMeeting);
        
        this.app.renderCalendar();
        this.app.switchTab("scheduling-tab");
      } catch (err) {
        this.writeLog(this.schedulingAgent.name, `[ERROR] Failed to save scheduled meeting to server: ${err.message}`, this.schedulingAgent.colorClass);
      }
    } else {
      result.errorLogs.forEach(err => {
        this.writeLog(this.schedulingAgent.name, `[ERROR] ${err}`, this.schedulingAgent.colorClass);
      });
    }
  }

  // --- Analytics Agent Execution ---
  async executeAnalyzeCommand(parts, rawCmd) {
    let region = "All";
    if (parts[0] === "/analyze" && parts.length >= 2) {
      region = parts.slice(1).join(" ");
    }

    const logs = this.analyticsAgent.getThinkingLogs(region);
    await this.streamThinking("analytics", this.analyticsAgent.name, this.analyticsAgent.colorClass, logs);

    const diagnostics = this.analyticsAgent.analyzeTerritories();
    const highestPriority = diagnostics[0];

    this.writeLog(this.analyticsAgent.name, `Analysis completed. Priority optimization zone: ${highestPriority.name} (Priority Score: ${highestPriority.priorityScore}/99, ROI: ${highestPriority.estimatedROI}%). Recommendation: ${highestPriority.actionRecommendation}`, this.analyticsAgent.colorClass);

    this.app.renderAnalytics(diagnostics);
    this.app.switchTab("analytics-tab");
  }

  // --- Report Agent Execution ---
  async executeReportCommand(parts, rawCmd) {
    let territory = "All";
    if (parts[0] === "/report" && parts.length >= 2) {
      territory = parts[1];
    }

    const logs = this.reportAgent.getThinkingLogs(territory);
    await this.streamThinking("report", this.reportAgent.name, this.reportAgent.colorClass, logs);

    const reportData = this.reportAgent.generateReportData(territory);
    this.writeLog(this.reportAgent.name, `Performance report compiled. ${reportData.title} is ready. Total Sales: ${reportData.kpis.totalSales}.`, this.reportAgent.colorClass);

    this.app.renderReport(reportData);
    this.app.switchTab("reports-tab");
  }
}
