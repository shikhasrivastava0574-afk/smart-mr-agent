# Smart MR Agent Platform

A modern, enterprise-grade, multi-agent system coordinating Medical Representatives (MRs) and target physicians in regional sectors. 

Built with a premium glassmorphic user interface (Vanilla HTML5/CSS3), native ES Modules, a persistent relational SQLite backend, and production Docker containerization.

---

## 🌟 Key Features

* **🤖 Multi-Agent CLI Console**: Execute `/match`, `/schedule`, `/analyze`, and `/report` commands with real-time agent thinking logs and diagnostic terminal entries.
* **💾 Relational SQLite Persistence**: Full SQLite database integration (`mrs`, `doctors`, `meetings`, `territories`, `products`, `sales_metrics`) with automatic seed initialization and migration logic.
* **⚡ Doctor Engagement Scoring (New!)**: A dynamic 0-100 index score calculated on the fly using prescription potentials (High/Medium/Low), completed meeting count history, closed deal value volume, and availability matches.
* **🔮 AI Territory Expansion Predictor (New!)**: Regional expansion simulator on the Territory Analytics tab featuring interactive 6-month growth curves (Chart.js), CAC forecasts, and ROI calculations based on representative headcount deployment.
* **🛎️ Real-Time Transactional Alerts (New!)**: Slide-in animated notifications and a header notification bell logs tracker warning on cancellations, SMS alerts, and email notifications.
* **🔍 MR Matchmaker**: Recommends optimal representatives based on geographic route metrics, clinical specialties, and physician network sizes.
* **📅 Auto-Scheduler Grid & Map Optimizer**: Resolves physician calendar slots, highlights weekly availability, and calculates the optimal commute order using a nearest-neighbor Traveling Salesperson (TSP) algorithm.
* **📝 Report Architect**: Instantly download client audit previews as formatted PDFs (via `html2pdf.js`) and export structured data to CSV.

---

## 🚀 Getting Started

### Local Setup
1. Clone this repository:
   ```bash
   git clone https://github.com/shikhasrivastava0574-afk/smart-mr-agent.git
   cd smart-mr-agent
   ```

2. Start the local server:
   ```bash
   python3 server.py
   ```

3. Open your browser and navigate to `http://localhost:8000`.

### Running with Docker & Compose
You can run the entire stack locally in a isolated container using Docker:
```bash
# Build and start container with SQLite persistence volume
docker compose up -d --build
```
The application will be accessible at `http://localhost:8000`, and `database.db` will persist locally.

---

## 🌐 Production Deployment
The project is containerized and compatible out of the box with hosts like **Render**, **Railway**, and **VPS Providers**. 

For step-by-step instructions, see the complete [Deployment Guide](file:///Users/shikhasrivastava/.gemini/antigravity/brain/1ff6e554-9847-4a42-81e5-2ae59d085d1c/deployment.md).

---

## 📁 File Structure

- `server.py` - Persistent SQLite REST handler and static files web server.
- `index.html` - Dashboard workspace, CRM registries, and simulator side-panels.
- `Dockerfile` - Packages python execution layers into a lightweight image.
- `docker-compose.yml` - Configures volume directories and env mappings.
- `css/`
  - `variables.css` - CSS design tokens, HSL typography configurations, and themes.
  - `styles.css` - Glassmorphic layout panels and dashboard structures.
  - `agents.css` - Terminal consoles, message logs, and connection indicator layouts.
- `js/`
  - `data.js` - Baseline client data definitions.
  - `app.js` - Core client state management and dashboard renderer.
  - `console.js` - Command interpreter and NLP routing manager.
  - `matchingAgent.js` - Computes compatibility metrics for representatives.
  - `schedulingAgent.js` - Evaluates route constraints and weekdays.
  - `analyticsAgent.js` - Runs ROI and priority optimization diagnostics.
  - `reportAgent.js` - Sales auditor generating download previews.
