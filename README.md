# Smart MR Agent Platform

A modern, zero-dependency, multi-agent system coordinating Medical Representatives (MRs) and target physicians in regional sectors. 

Built with a premium glassmorphic user interface (Vanilla HTML5/CSS3), native ES Modules, and a lightweight Python backend server for persistent REST state storage.

---

## 🌟 Key Features

* **🤖 Multi-Agent CLI Console**: Execute `/match`, `/schedule`, `/analyze`, and `/report` commands with real-time agent thinking logs and diagnostic terminal entries.
* **🔍 MR Matchmaker**: Recommends optimal representatives based on geographic route metrics, clinical specialties, and physician network sizes.
* **📅 Auto-Scheduler Grid**: Resolves physician calendar slots, alerts on weekday availabilities, and triggers simulated communication invites.
* **💬 Dr. WhatsApp & Field Portal Simulators**: Interactive side-out panels simulating actual physician visit approvals (confirm/reschedule) and representative logged sales deals.
* **📈 Territory Analytics**: Real-time sales indicators, underserved priority sector markers, and interactive Chart.js line and doughnut graphs.
* **📝 Report Architect**: Instantly download client audit previews as formatted PDFs (via `html2pdf.js`) and export structured data to CSV.
* **💾 REST Persistence**: Built-in Python backend serving static files and storing workspace datasets securely in a local JSON file database.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.x installed.
- No Node, NPM, or external pip packages required!

### Running the Application

1. Clone this repository (if running elsewhere):
   ```bash
   git clone https://github.com/shikhasrivastava0574-afk/smart-mr-agent.git
   cd smart-mr-agent
   ```

2. Start the local server:
   ```bash
   python3 server.py
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

---

## 📁 File Structure

- `server.py` - Lightweight HTTP server handling REST endpoints and static files.
- `index.html` - Structural layout for dashboard tabs, console screens, and mobile simulators.
- `css/`
  - `variables.css` - CSS design tokens, HSL typography configurations, and root themes.
  - `styles.css` - Layout controls, dashboard panels, and mobile wrapper configurations.
  - `agents.css` - Console terminals, typing indicators, and agent connection network designs.
- `js/`
  - `data.js` - Live state datasets imported across modules.
  - `app.js` - Main client-side state synchronizer and layout renderer.
  - `console.js` - Command interpreter and NLP routing manager.
  - `matchingAgent.js` - Computes compatibility metrics for representatives.
  - `schedulingAgent.js` - Evaluates route constraints and weekdays.
  - `analyticsAgent.js` - Runs ROI and priority optimization diagnostics.
  - `reportAgent.js` - Sales auditor generating download previews.
