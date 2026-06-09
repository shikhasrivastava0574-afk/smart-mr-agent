/* js/app.js */



import { MR_DATA, DOCTORS_DATA, MEETINGS_DATA, TERRITORIES_DATA, SALES_METRICS, PRODUCTS_DATA } from './data.js';
import { AgentConsole } from './console.js';

class App {
  constructor() {
    this.currentDate = new Date(2026, 5, 9); // June 2026 for simulation sync
    this.charts = {};

    this.init();
  }

  async syncWithServer(updatedDb = null) {
    try {
      let db = updatedDb;
      if (!db) {
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error('Failed to fetch database from server');
        db = await response.json();
      }

      if (db.mrs) {
        MR_DATA.length = 0;
        MR_DATA.push(...db.mrs);
      }
      if (db.doctors) {
        DOCTORS_DATA.length = 0;
        DOCTORS_DATA.push(...db.doctors);
      }
      if (db.meetings) {
        MEETINGS_DATA.length = 0;
        MEETINGS_DATA.push(...db.meetings);
      }
      if (db.territories) {
        TERRITORIES_DATA.length = 0;
        TERRITORIES_DATA.push(...db.territories);
      }
      if (db.salesMetrics) {
        Object.assign(SALES_METRICS, db.salesMetrics);
      }
      if (db.products) {
        PRODUCTS_DATA.length = 0;
        PRODUCTS_DATA.push(...db.products);
      }

      if (document.getElementById("doctors-grid")) {
        this.renderDoctorDirectory();
      }

      this.renderRouteMap();

      return true;
    } catch (err) {
      console.error('Error syncing with server:', err);
      return false;
    }
  }

  async init() {
    // Sync state with server before rendering
    await this.syncWithServer();

    // Initialize agents and console controller
    this.console = new AgentConsole(this);

    // Render baseline listings
    this.renderMRDirectory();
    this.renderCalendar();
    this.initDropdowns();
    this.renderAnalytics();
    this.renderReport(this.console.reportAgent.generateReportData("All"));

    // Initialize phone select
    const phoneSelector = document.getElementById("phone-mr-selector");
    if (phoneSelector) {
      phoneSelector.innerHTML = MR_DATA.map(m => `<option value="${m.id}">${m.name}</option>`).join("");
    }
    this.renderPhoneAgenda();
    this.updateSimulatorLayout();

    // Event listeners
    this.initEvents();
    
    // Icon refresh
    lucide.createIcons();
  }

  initEvents() {
    // 1. Sidebar tab switching
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
      item.addEventListener("click", () => {
        navItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");
        
        const targetView = item.dataset.target;
        this.switchTab(targetView);
      });
    });

    // 2. Matchmaker form submit
    const matchForm = document.getElementById("matchmaker-form");
    matchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const productId = document.getElementById("match-product-selector").value;
      const product = PRODUCTS_DATA.find(p => p.id === productId);
      const region = document.getElementById("match-region").value;
      
      if (product) {
        this.console.handleCommand(`/match "${product.specialty}" ${region}`);
      }
    });

    // 3. Scheduler form submit
    const schedForm = document.getElementById("auto-schedule-form");
    schedForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const mrId = document.getElementById("sched-mr").value;
      const docId = document.getElementById("sched-doctor").value;
      const date = document.getElementById("sched-date").value;
      const time = document.getElementById("sched-time").value;
      const productId = document.getElementById("sched-product").value;
      const product = PRODUCTS_DATA.find(p => p.id === productId);
      
      const notes = product ? `Presenting product formulation: ${product.name} (${product.specialty})` : "General product audit visit.";

      this.console.handleCommand(`/schedule ${mrId} ${docId} ${date} ${time} "${notes}"`);
    });

    // 4. Report generator form submit
    const reportForm = document.getElementById("report-generator-form");
    reportForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const territory = document.getElementById("report-territory").value;
      this.console.handleCommand(`/report ${territory}`);
    });

    // 5. Download buttons
    document.getElementById("download-pdf-btn").addEventListener("click", () => this.downloadPDF());
    document.getElementById("download-csv-btn").addEventListener("click", () => this.downloadCSV());

    // 6. Calendar navigation
    document.getElementById("cal-prev").addEventListener("click", () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.renderCalendar();
    });
    document.getElementById("cal-next").addEventListener("click", () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.renderCalendar();
    });

    // 7. Phone Panel toggle listeners
    const toggleBtn = document.getElementById("toggle-phone-btn");
    const phonePanel = document.getElementById("phone-simulator-panel");
    const waPanel = document.getElementById("whatsapp-simulator-panel");
    if (toggleBtn && phonePanel) {
      toggleBtn.addEventListener("click", () => {
        if (!phonePanel.classList.contains("active") && waPanel) {
          waPanel.classList.remove("active");
        }
        phonePanel.classList.toggle("active");
        this.renderPhoneAgenda();
        this.renderRouteMap();
        this.updateSimulatorLayout();
      });
    }

    const closeBtn = document.getElementById("close-phone-btn");
    if (closeBtn && phonePanel) {
      closeBtn.addEventListener("click", () => {
        phonePanel.classList.remove("active");
        this.updateSimulatorLayout();
      });
    }

    // Phone profile select change
    const phoneSelector = document.getElementById("phone-mr-selector");
    if (phoneSelector) {
      phoneSelector.addEventListener("change", (e) => {
        const mrId = e.target.value;
        const mr = MR_DATA.find(m => m.id === mrId);
        if (mr) {
          const avatar = document.getElementById("phone-avatar-text");
          if (avatar) avatar.textContent = mr.name.split(" ").map(n => n[0]).join("");
        }
        // Reset active tab to List View on representative switch
        const tabListBtn = document.getElementById("phone-tab-list-btn");
        const tabMapBtn = document.getElementById("phone-tab-map-btn");
        const agendaListEl = document.getElementById("phone-agenda-list");
        const routeMapViewEl = document.getElementById("phone-route-map-view");
        if (tabListBtn && tabMapBtn && agendaListEl && routeMapViewEl) {
          tabListBtn.classList.add("active");
          tabMapBtn.classList.remove("active");
          agendaListEl.style.display = "flex";
          routeMapViewEl.style.display = "none";
        }
        this.renderPhoneAgenda();
        this.renderRouteMap();
      });
    }

    // Phone List vs Route Map tab switcher
    const tabListBtn = document.getElementById("phone-tab-list-btn");
    const tabMapBtn = document.getElementById("phone-tab-map-btn");
    const agendaListEl = document.getElementById("phone-agenda-list");
    const routeMapViewEl = document.getElementById("phone-route-map-view");

    if (tabListBtn && tabMapBtn && agendaListEl && routeMapViewEl) {
      tabListBtn.addEventListener("click", () => {
        tabListBtn.classList.add("active");
        tabMapBtn.classList.remove("active");
        agendaListEl.style.display = "flex";
        routeMapViewEl.style.display = "none";
      });

      tabMapBtn.addEventListener("click", () => {
        tabMapBtn.classList.add("active");
        tabListBtn.classList.remove("active");
        agendaListEl.style.display = "none";
        routeMapViewEl.style.display = "block";
        this.renderRouteMap();
      });
    }

    // Phone Route Optimizer button
    const optimizeBtn = document.getElementById("phone-route-optimize-btn");
    if (optimizeBtn) {
      optimizeBtn.addEventListener("click", () => {
        this.optimizeRoute();
      });
    }

    // Phone visit form return to agenda
    const backBtn = document.getElementById("phone-back-to-agenda");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        document.getElementById("phone-screen-agenda").classList.add("active");
        document.getElementById("phone-screen-visit").classList.remove("active");
      });
    }

    // Phone visit form submit
    const phoneForm = document.getElementById("phone-visit-form");
    if (phoneForm) {
      phoneForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.submitPhoneVisit();
      });
    }

    // 8. Doctor WhatsApp Simulator toggle listeners
    const toggleWaBtn = document.getElementById("toggle-whatsapp-btn");
    if (toggleWaBtn && waPanel) {
      toggleWaBtn.addEventListener("click", () => {
        if (!waPanel.classList.contains("active") && phonePanel) {
          phonePanel.classList.remove("active");
        }
        waPanel.classList.toggle("active");
        this.updateSimulatorLayout();
      });
    }

    const closeWaBtn = document.getElementById("close-whatsapp-btn");
    const waBackArrow = document.querySelector(".whatsapp-back-arrow");
    const closeWaAction = () => {
      if (waPanel) {
        waPanel.classList.remove("active");
        this.updateSimulatorLayout();
      }
    };
    if (closeWaBtn) {
      closeWaBtn.addEventListener("click", closeWaAction);
    }
    if (waBackArrow) {
      waBackArrow.addEventListener("click", closeWaAction);
    }

    // Doctor WhatsApp message input/send buttons
    const waSendBtn = document.getElementById("whatsapp-send-btn");
    const waInput = document.getElementById("whatsapp-message-input");
    if (waSendBtn && waInput) {
      waSendBtn.addEventListener("click", () => {
        const text = waInput.value.trim();
        if (text) {
          waInput.value = "";
          this.handleDoctorWhatsAppReply(text);
        }
      });
      waInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          const text = waInput.value.trim();
          if (text) {
            waInput.value = "";
            this.handleDoctorWhatsAppReply(text);
          }
        }
      });
    }

    // 9. Product Manager form submit
    const prodForm = document.getElementById("product-manager-form");
    if (prodForm) {
      prodForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("new-prod-name").value.trim();
        const specialty = document.getElementById("new-prod-specialty").value;
        const desc = document.getElementById("new-prod-desc").value.trim();
        
        if (name && desc) {
          try {
            const response = await fetch('/api/products', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, specialty, description: desc })
            });
            if (!response.ok) throw new Error('Failed to register product on server');
            const updatedDb = await response.json();
            await this.syncWithServer(updatedDb);
            
            // Reset form inputs
            document.getElementById("new-prod-name").value = "";
            document.getElementById("new-prod-desc").value = "";
            
            // Log agent terminal message
            this.console.writeLog("System", `New product registered: ${name} (${specialty}). Updating matching catalogs...`, "sender-system");
            
            // Re-render
            this.renderProducts();
            
            // Confetti spark!
            if (window.confetti) {
              window.confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
            }
          } catch (err) {
            this.console.writeLog("System", `Error registering product: ${err.message}`, "sender-system");
          }
        }
      });
    }

    // 10. Doctor Directory - Search & Filter
    const docSearch = document.getElementById("doctor-search-input");
    const docRegionFilter = document.getElementById("doctor-region-filter");
    
    if (docSearch) {
      docSearch.addEventListener("input", () => this.renderDoctorDirectory());
    }
    if (docRegionFilter) {
      docRegionFilter.addEventListener("change", () => this.renderDoctorDirectory());
    }

    // 11. Doctor Directory - Form Reset / Cancel
    const docCancelBtn = document.getElementById("doc-cancel-btn");
    if (docCancelBtn) {
      docCancelBtn.addEventListener("click", () => this.resetDoctorEditor());
    }

    // 12. Doctor Directory - Deletion
    const docDeleteBtn = document.getElementById("doc-delete-btn");
    if (docDeleteBtn) {
      docDeleteBtn.addEventListener("click", async () => {
        const docId = document.getElementById("edit-doctor-id").value;
        if (!docId) return;

        if (confirm("Are you sure you want to delete this physician? This will cancel all associated scheduled and pending visits.")) {
          try {
            const response = await fetch('/api/doctors/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: docId })
            });
            if (!response.ok) throw new Error('Failed to delete physician on server');
            const updatedDb = await response.json();
            
            // Sync and refresh
            await this.syncWithServer(updatedDb);
            this.resetDoctorEditor();

            this.console.writeLog("System", `Physician account removed from CRM registry. Resetting routes.`, "sender-system");

            // Refresh other views
            this.renderCalendar();
            this.initDropdowns(); // updates scheduler select list!
            this.renderPhoneAgenda();

            if (window.confetti) {
              window.confetti({ particleCount: 50, spread: 40, colors: ['#ff4444', '#ff8888'] });
            }
          } catch (err) {
            this.console.writeLog("System", `Error deleting physician: ${err.message}`, "sender-system");
          }
        }
      });
    }

    // 13. Doctor Directory - Submit Form (Create / Update)
    const docForm = document.getElementById("doctor-editor-form");
    if (docForm) {
      docForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const docId = document.getElementById("edit-doctor-id").value;
        const name = document.getElementById("doc-name").value.trim();
        const clinicName = document.getElementById("doc-clinic").value.trim();
        const specialty = document.getElementById("doc-specialty").value;
        const region = document.getElementById("doc-region").value;
        const address = document.getElementById("doc-address").value.trim();
        const phone = document.getElementById("doc-phone").value.trim();
        const email = document.getElementById("doc-email").value.trim();
        const potential = document.getElementById("doc-potential").value;
        const preferredTime = document.getElementById("doc-preferred-time").value;

        // Get availability checkboxes
        const checkedBoxes = document.querySelectorAll("#doc-availability-checkboxes input:checked");
        const availability = Array.from(checkedBoxes).map(cb => cb.value);

        if (availability.length === 0) {
          alert("Please select at least one day of availability.");
          return;
        }

        const payload = { name, clinicName, specialty, region, address, phone, email, availability, prescriptionPotential: potential, preferredTime };

        try {
          let response;
          if (docId) {
            // Update operation
            payload.id = docId;
            response = await fetch('/api/doctors/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          } else {
            // Create operation
            response = await fetch('/api/doctors', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          }

          if (!response.ok) throw new Error('Failed to save physician profile on server');
          const updatedDb = await response.json();
          await this.syncWithServer(updatedDb);

          this.resetDoctorEditor();

          const logMsg = docId ? `Updated physician profile: ${name}.` : `Registered new physician profile: ${name} (${specialty}).`;
          this.console.writeLog("System", logMsg, "sender-system");

          // Refresh dropdown lists & calendar views
          this.initDropdowns();
          this.renderCalendar();
          this.renderPhoneAgenda();

          if (window.confetti) {
            window.confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
          }
        } catch (err) {
          this.console.writeLog("System", `Error saving physician: ${err.message}`, "sender-system");
        }
      });
    }

    // 14. Representative Territory Reassignment
    const reassignForm = document.getElementById("mr-reassign-form");
    if (reassignForm) {
      reassignForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const mrId = document.getElementById("reassign-mr-select").value;
        const territory = document.getElementById("reassign-territory-select").value;
        
        const mr = MR_DATA.find(m => m.id === mrId);
        const oldTerritory = mr?.territory || "Unassigned";

        if (oldTerritory === territory) {
          alert(`Representative is already assigned to ${territory}.`);
          return;
        }

        try {
          const response = await fetch('/api/mrs/reassign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mrId, territory })
          });
          
          if (!response.ok) throw new Error('Failed to reassign representative on server');
          const updatedDb = await response.json();
          await this.syncWithServer(updatedDb);

          // Log terminal message
          this.console.writeLog("System", `Re-allocating representative ${mr?.name} from ${oldTerritory} to ${territory}.`, "sender-system");
          this.console.writeLog("Analytics Agent", `Recalculating demographic density grids and ROI recommendation metrics...`, "sender-analytics");

          // Refresh other views
          this.renderMRDirectory();
          this.renderCalendar();
          this.initDropdowns();
          this.renderAnalytics(); // Re-runs Analytics Agent!
          this.renderReport(this.console.reportAgent.generateReportData("All"));
          this.renderPhoneAgenda();

          if (window.confetti) {
            window.confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
          }
        } catch (err) {
          this.console.writeLog("System", `Error reassigning representative: ${err.message}`, "sender-system");
        }
      });
    }
  }

  updateSimulatorLayout() {
    const phonePanel = document.getElementById("phone-simulator-panel");
    const waPanel = document.getElementById("whatsapp-simulator-panel");
    const mainContent = document.querySelector("main.main-content");
    
    if (!phonePanel || !waPanel || !mainContent) return;
    
    const isPhoneActive = phonePanel.classList.contains("active");
    const isWaActive = waPanel.classList.contains("active");
    
    // Manage header button active states
    const phoneBtn = document.getElementById("toggle-phone-btn");
    const waBtn = document.getElementById("toggle-whatsapp-btn");
    
    if (phoneBtn) {
      if (isPhoneActive) {
        phoneBtn.style.background = "hsl(var(--agent-system))";
        phoneBtn.style.borderColor = "hsl(var(--agent-system))";
        phoneBtn.style.color = "#000";
      } else {
        phoneBtn.style.background = "hsla(var(--agent-system), 0.1)";
        phoneBtn.style.borderColor = "hsla(var(--agent-system), 0.3)";
        phoneBtn.style.color = "";
      }
    }
    
    if (waBtn) {
      if (isWaActive) {
        waBtn.style.background = "#25D366";
        waBtn.style.borderColor = "#25D366";
        waBtn.style.color = "#000";
      } else {
        waBtn.style.background = "rgba(37, 211, 102, 0.1)";
        waBtn.style.borderColor = "rgba(37, 211, 102, 0.3)";
        waBtn.style.color = "";
      }
    }

    if (isPhoneActive || isWaActive) {
      mainContent.classList.add("simulator-open");
    } else {
      mainContent.classList.remove("simulator-open");
    }
  }

  switchTab(viewId) {
    // Hide all views
    const views = document.querySelectorAll(".dashboard-view");
    views.forEach(v => v.classList.remove("active"));

    // Find and show target view
    let realViewId = viewId;
    if (viewId.endsWith("-tab")) {
      realViewId = viewId.replace("-tab", "-view");
    }
    const target = document.getElementById(realViewId);
    if (target) {
      target.classList.add("active");
    }

    // Update Top Header Title Text
    const headerTitle = document.getElementById("page-title-text");
    const navItem = document.querySelector(`.nav-item[data-target="${realViewId}"]`);
    if (navItem && headerTitle) {
      headerTitle.textContent = navItem.querySelector("span").textContent;
      
      // Update sidebar nav active classes in case tab was switched programmatically
      const navItems = document.querySelectorAll(".nav-item");
      navItems.forEach(i => i.classList.remove("active"));
      navItem.classList.add("active");
    }
  }

  initDropdowns() {
    const mrSelect = document.getElementById("sched-mr");
    const docSelect = document.getElementById("sched-doctor");
    const reassignMrSelect = document.getElementById("reassign-mr-select");
    const reassignTerrSelect = document.getElementById("reassign-territory-select");

    if (mrSelect) {
      mrSelect.innerHTML = MR_DATA.map(m => `<option value="${m.id}">${m.name} (${m.specialty})</option>`).join("");
    }
    if (docSelect) {
      docSelect.innerHTML = DOCTORS_DATA.map(d => `<option value="${d.id}">${d.name} (${d.specialty} - ${d.region})</option>`).join("");
    }
    if (reassignMrSelect) {
      reassignMrSelect.innerHTML = MR_DATA.map(m => `<option value="${m.id}">${m.name} (${m.territory})</option>`).join("");
    }
    if (reassignTerrSelect) {
      reassignTerrSelect.innerHTML = TERRITORIES_DATA.map(t => `<option value="${t.name}">${t.name}</option>`).join("");
    }
    this.renderProducts();
  }

  // --- Rendering UI Panels ---

  renderMRDirectory() {
    const grid = document.getElementById("mr-directory-grid");
    if (!grid) return;

    grid.innerHTML = MR_DATA.map(mr => `
      <div class="glass-panel mr-card" style="--mr-theme: ${mr.colorTheme}">
        <div class="mr-card-header">
          <div class="mr-avatar">${mr.name.split(" ").map(n => n[0]).join("")}</div>
          <div class="mr-meta">
            <span class="mr-name">${mr.name}</span>
            <span class="mr-rating">
              <i data-lucide="star" style="width: 12px; height: 12px; fill: currentColor;"></i>
              <span>${mr.rating} (${mr.experienceYears}y exp)</span>
            </span>
          </div>
        </div>
        <div class="tag-list">
          <span class="tag tag-accent-matching">${mr.specialty}</span>
          <span class="tag">${mr.territory}</span>
        </div>
        <p style="font-size: 0.8rem; color: hsl(var(--text-secondary)); margin-bottom: 12px; line-height: 1.4;">
          ${mr.bio}
        </p>
        <div class="mr-stats">
          <div>Relation index: <span class="stat-val">${mr.doctorRelationships} docs</span></div>
          <div>Sales: <span class="stat-val">₹${(mr.monthlySales / 1000).toFixed(0)}k</span></div>
        </div>
      </div>
    `).join("");
    lucide.createIcons();
  }

  renderMatches(matches, specialty, region) {
    const resultsPanel = document.getElementById("matching-results-output");
    if (!resultsPanel) return;

    resultsPanel.innerHTML = `
      <div style="border-bottom: 1px solid var(--glass-border); padding-bottom: 12px; margin-bottom: 4px;">
        <h4 style="font-weight:600; font-size:0.95rem; color:hsl(var(--agent-matching));">Target Specialty: ${specialty}</h4>
        <span style="font-size:0.8rem; color:hsl(var(--text-secondary));">Region: ${region}</span>
      </div>
      
      <div style="display:flex; flex-direction:column; gap:12px;">
        ${matches.map((match, idx) => `
          <div class="match-item" style="${idx === 0 ? 'border-color: hsla(var(--agent-matching), 0.4); background: hsla(var(--agent-matching), 0.02)' : ''}">
            <div class="mr-avatar" style="width:36px; height:36px; font-size:0.9rem;">${match.mr.name.split(" ").map(n => n[0]).join("")}</div>
            <div class="match-progress">
              <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom: 4px;">
                <span style="font-weight:600; color:#fff;">${match.mr.name}</span>
                <span style="color:hsl(var(--text-secondary));">${match.mr.specialty} (${match.mr.territory})</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${match.score}%; ${idx === 0 ? 'background: linear-gradient(to right, hsl(var(--agent-matching)), #fff)' : ''}"></div>
              </div>
            </div>
            <span class="match-score">${match.score}%</span>
          </div>
          ${idx === 0 ? `
            <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: 8px; border: 1px solid var(--glass-border);">
              <span style="font-size:0.75rem; font-weight:700; color:hsl(var(--agent-matching)); text-transform:uppercase; letter-spacing:0.5px;">MATCHING AGENT RECOMMENDATION</span>
              <ul class="reasoning-list" style="margin-top: 8px;">
                ${match.reasoning.map(line => `<li>${line}</li>`).join("")}
              </ul>
            </div>
          ` : ''}
        `).join("")}
      </div>
    `;
    lucide.createIcons();
  }

  renderCalendar() {
    const container = document.getElementById("calendar-days-container");
    const monthYearLabel = document.getElementById("calendar-month-year");
    if (!container || !monthYearLabel) return;

    container.innerHTML = "";

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    monthYearLabel.textContent = this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Days calculation
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Infill previous month spacing
    for (let i = 0; i < firstDayIndex; i++) {
      const cell = document.createElement("div");
      cell.className = "calendar-day empty";
      container.appendChild(cell);
    }

    // Render current month days
    for (let day = 1; day <= totalDays; day++) {
      const cell = document.createElement("div");
      cell.className = "calendar-day";

      // Mark today simulated
      if (day === 9 && month === 5 && year === 2026) {
        cell.classList.add("today");
      }

      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Inject day number
      const dayNum = document.createElement("span");
      dayNum.className = "calendar-day-num";
      dayNum.textContent = day;
      cell.appendChild(dayNum);

      // Fetch meetings scheduled for this day
      const dayMeetings = MEETINGS_DATA.filter(meet => meet.date === dateStr);
      
      if (dayMeetings.length > 0) {
        const eventsContainer = document.createElement("div");
        eventsContainer.className = "calendar-events";

        dayMeetings.forEach(meet => {
          const mr = MR_DATA.find(m => m.id === meet.mrId);
          const doc = DOCTORS_DATA.find(d => d.id === meet.doctorId);

          const eventDiv = document.createElement("div");
          eventDiv.className = "calendar-event";
          
          if (meet.status === "pending") {
            eventDiv.style.background = "rgba(234, 179, 8, 0.15)";
            eventDiv.style.borderLeft = "2px dashed #eab308";
            eventDiv.style.color = "#fbbf24";
          }
          
          eventDiv.title = `Status: ${meet.status.toUpperCase()}\nTime: ${meet.time}\nMR: ${mr?.name}\nDoctor: ${doc?.name}\nNotes: ${meet.notes}`;
          eventDiv.textContent = `${meet.time} - ${doc?.name.split(" ")[1]}`;
          
          eventsContainer.appendChild(eventDiv);
        });

        cell.appendChild(eventsContainer);
      }

      container.appendChild(cell);
    }
  }

  renderAnalytics(diagnostics = null) {
    // 1. Calculate diagnostics if not provided
    if (!diagnostics) {
      diagnostics = this.console.analyticsAgent.analyzeTerritories();
    }

    // 2. Render Optimal Recommendations
    const recContainer = document.getElementById("territory-recommendations-list");
    if (recContainer) {
      recContainer.innerHTML = diagnostics.map(diag => `
        <div class="recommendation-card" style="${diag.priorityScore > 85 ? 'border-color: hsla(var(--agent-analytics), 0.4); background: hsla(var(--agent-analytics), 0.02);' : ''}">
          <div style="display:flex; flex-direction:column; gap:4px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="rec-title">${diag.name}</span>
              ${diag.priorityScore > 85 ? `<span class="tag tag-accent-matching" style="background:hsla(var(--agent-analytics), 0.1); color:hsl(var(--agent-analytics)); border-color:hsla(var(--agent-analytics), 0.2);">High Priority</span>` : ''}
            </div>
            <span class="rec-meta">Top Demand Area: ${diag.topTherapeuticArea} | Active coverage: ${diag.activeMRs} reps</span>
            <p style="font-size:0.75rem; color:hsl(var(--text-secondary)); margin-top:6px; font-style:italic;">
              ${diag.actionRecommendation}
            </p>
          </div>
          <div>
            <div class="rec-roi">${diag.priorityScore}%</div>
            <div class="rec-roi-label">Priority Score</div>
          </div>
        </div>
      `).join("");
    }

    // 3. Render Coverage Grid Table
    const tableBody = document.getElementById("territory-coverage-table-body");
    if (tableBody) {
      tableBody.innerHTML = TERRITORIES_DATA.map(terr => {
        const mrCount = MR_DATA.filter(mr => mr.territory.toLowerCase() === terr.name.toLowerCase()).length;
        
        return `
          <tr>
            <td style="font-weight:600; color:#fff;">${terr.name}</td>
            <td style="text-align: right;">${terr.doctorsCount}</td>
            <td style="text-align: right; ${mrCount === 0 ? 'color:hsl(var(--color-danger)); font-weight:700;' : ''}">${mrCount}</td>
            <td style="text-align: right; color: ${terr.marketDemand === 'High' ? 'hsl(var(--agent-analytics))' : 'inherit'}; font-weight: 500;">
              ${terr.marketDemand}
            </td>
          </tr>
        `;
      }).join("");
    }

    // 4. Draw Charts
    this.drawCharts();
  }

  drawCharts() {
    // Destroy existing charts to prevent overlaps
    if (this.charts.sales) this.charts.sales.destroy();
    if (this.charts.share) this.charts.share.destroy();
    if (this.charts.compliance) this.charts.compliance.destroy();

    const salesCtx = document.getElementById("salesTrendChart");
    const shareCtx = document.getElementById("categoryShareChart");
    const complianceCtx = document.getElementById("mrComplianceChart");
    if (!salesCtx || !shareCtx) return;

    // Set standard Chart typography styles
    Chart.defaults.font.family = "'Outfit', sans-serif";
    Chart.defaults.color = 'rgba(255, 255, 255, 0.6)';

    // Sales Trend Chart (Line chart)
    this.charts.sales = new Chart(salesCtx, {
      type: 'line',
      data: {
        labels: SALES_METRICS.months,
        datasets: [{
          label: 'Pharma MR Direct Sales (₹)',
          data: SALES_METRICS.monthlyTotalSales,
          borderColor: 'hsl(250, 95%, 68%)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: 'hsl(180, 100%, 45%)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false } },
          y: { 
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              callback: function(value) {
                return '₹' + (value / 100000) + 'L';
              }
            }
          }
        }
      }
    });

    // Category Share Chart (Doughnut chart)
    const shareKeys = Object.keys(SALES_METRICS.categoryShare);
    const shareVals = Object.values(SALES_METRICS.categoryShare);

    this.charts.share = new Chart(shareCtx, {
      type: 'doughnut',
      data: {
        labels: shareKeys,
        datasets: [{
          data: shareVals,
          backgroundColor: [
            'hsl(180, 100%, 45%)', // Matching (Cyan)
            'hsl(300, 95%, 60%)',  // Reports (Fuchsia)
            'hsl(250, 95%, 68%)',  // Scheduling (Indigo)
            'hsl(150, 90%, 50%)',  // Analytics (Emerald)
            'hsl(217, 91%, 60%)'   // System (Blue)
          ],
          borderWidth: 1,
          borderColor: 'rgba(6, 8, 20, 0.9)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 12,
              padding: 10,
              font: { size: 10 }
            }
          }
        }
      }
    });

    // Compliance Chart (Grouped Bar chart)
    const TARGET_FREQUENCIES = {
      "mr-01": 8, // Priya Sharma
      "mr-02": 6, // Rajesh Kumar
      "mr-03": 8, // Dr. Amit Patel
      "mr-04": 5, // Vikram Singh
      "mr-05": 10, // Ananya Gupta
      "mr-06": 4  // Rahul Verma
    };

    const mrLabels = MR_DATA.map(mr => mr.name);
    const targetData = MR_DATA.map(mr => TARGET_FREQUENCIES[mr.id] || 5);
    const completedData = MR_DATA.map(mr => MEETINGS_DATA.filter(m => m.mrId === mr.id && m.status === "completed").length);
    const scheduledData = MR_DATA.map(mr => MEETINGS_DATA.filter(m => m.mrId === mr.id && (m.status === "scheduled" || m.status === "pending")).length);

    if (complianceCtx) {
      this.charts.compliance = new Chart(complianceCtx, {
        type: 'bar',
        data: {
          labels: mrLabels,
          datasets: [
            {
              label: 'Target Visits',
              data: targetData,
              backgroundColor: 'hsla(250, 95%, 68%, 0.2)',
              borderColor: 'hsl(250, 95%, 68%)',
              borderWidth: 1
            },
            {
              label: 'Completed Visits',
              data: completedData,
              backgroundColor: 'hsla(150, 90%, 50%, 0.5)',
              borderColor: 'hsl(150, 90%, 50%)',
              borderWidth: 1
            },
            {
              label: 'Scheduled Visits',
              data: scheduledData,
              backgroundColor: 'hsla(180, 100%, 45%, 0.4)',
              borderColor: 'hsl(180, 100%, 45%)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 12,
                padding: 10,
                font: { size: 10 }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const mrIndex = context.dataIndex;
                  const target = targetData[mrIndex];
                  const completed = completedData[mrIndex];
                  const ratio = ((completed / target) * 100).toFixed(0);
                  
                  if (context.datasetIndex === 0) {
                    return `Target Frequency: ${target}`;
                  } else if (context.datasetIndex === 1) {
                    return `Completed: ${completed} (${ratio}% Compliance)`;
                  } else {
                    return `Scheduled: ${scheduledData[mrIndex]}`;
                  }
                }
              }
            }
          },
          scales: {
            x: { grid: { display: false } },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { stepSize: 2 }
            }
          }
        }
      });
    }
  }

  renderReport(reportData) {
    const preview = document.getElementById("report-preview-element");
    if (!preview) return;

    this.currentReport = reportData; // store reference for exporter

    preview.innerHTML = `
      <div class="report-header">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <h2>${reportData.title}</h2>
            <div class="report-date">Generated: ${reportData.date} | Audit Scope: ${reportData.period}</div>
          </div>
          <span style="font-size:0.75rem; font-weight:700; border:1px solid #cbd5e1; padding:4px 8px; border-radius:4px; text-transform:uppercase; color:#475569; letter-spacing:0.5px;">PharmaMR System Audited</span>
        </div>
      </div>

      <div style="background:#f8fafc; border-left:4px solid #6366f1; padding:12.5px; border-radius:4px; margin-bottom:24px; font-size:0.85rem; line-height:1.4; color:#334155;">
        <strong>Executive Summary:</strong> ${reportData.executiveSummary}
      </div>

      <div class="report-kpis">
        <div class="report-kpi">
          <div class="report-kpi-label">Active Representatives</div>
          <div class="report-kpi-value">${reportData.kpis.totalMRs}</div>
        </div>
        <div class="report-kpi">
          <div class="report-kpi-label">Total Visits Logged</div>
          <div class="report-kpi-value">${reportData.kpis.totalMeetings}</div>
        </div>
        <div class="report-kpi">
          <div class="report-kpi-label">Region Sales Volume</div>
          <div class="report-kpi-value">${reportData.kpis.totalSales}</div>
        </div>
      </div>

      <h3>Representative Activity Details</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Specialty</th>
            <th>Territory</th>
            <th style="text-align:right;">Meetings (Sched/Done)</th>
            <th style="text-align:right;">Monthly Revenue</th>
          </tr>
        </thead>
        <tbody>
          ${reportData.tableData.map(row => `
            <tr>
              <td style="font-weight:600; color:#0f172a;">${row.name}</td>
              <td>${row.specialty}</td>
              <td>${row.territory}</td>
              <td style="text-align:right; font-family: monospace;">${row.scheduledCount} / ${row.completedCount}</td>
              <td style="text-align:right; font-weight:600; color:#0f172a;">₹${row.sales.toLocaleString('en-IN')}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div class="report-footer">
        <span>PharmaMR Analytics Platform - Secure Cryptographic Audit Record</span>
        <span>Page 1 of 1</span>
      </div>
    `;
  }

  downloadPDF() {
    const element = document.getElementById("report-preview-element");
    if (!element) return;

    this.console.writeSystemLog("PDF compilation triggered. Assembling document layers...");
    
    const opt = {
      margin:       0.3,
      filename:     `PharmaMR_Sales_Audit_${this.currentReport.title.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // run html2pdf exporter
    html2pdf().from(element).set(opt).save()
      .then(() => {
        this.console.writeLog("Report Agent", "PDF Document downloaded successfully.", "sender-report");
      })
      .catch((err) => {
        this.console.writeLog("Report Agent", `[ERROR] PDF Generation failed: ${err.message}`, "sender-report");
      });
  }

  downloadCSV() {
    if (!this.currentReport) return;
    this.console.writeSystemLog("CSV spreadsheet conversion triggered...");

    const csvContent = this.console.reportAgent.convertToCSV(this.currentReport);
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `PharmaMR_Data_${this.currentReport.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    
    link.click();
    document.body.removeChild(link);
    
    this.console.writeLog("Report Agent", "CSV Spreadsheet downloaded successfully.", "sender-report");
  }

  // --- Phone Simulator Methods ---

  getDoctorCoordinates(doc) {
    // Deterministic lookup based on doctor ID/name to keep placements beautiful
    const coordsMap = {
      "doc-01": { x: 60, y: 50 },   // Lucknow Cardiology Institute
      "doc-02": { x: 70, y: 40 },   // Noida Cancer Care & Research
      "doc-03": { x: 170, y: 150 }, // Kashi Neuro Center
      "doc-04": { x: 95, y: 115 },  // Kanpur Endocrine Hospital
      "doc-05": { x: 150, y: 50 },  // Gorakhpur Children's Hospital
      "doc-06": { x: 110, y: 90 },  // Awadh Heart Clinic (Lucknow)
      "doc-07": { x: 130, y: 130 }  // Sangam Diagnostic Center (Prayagraj)
    };

    if (coordsMap[doc.id]) {
      return coordsMap[doc.id];
    }

    // Hash doctor ID or name for deterministic custom doctor coords inside 30-210 (x), 30-170 (y)
    let hash = 0;
    const key = doc.id + (doc.name || "");
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    const x = 30 + Math.abs(hash % 180);
    const y = 30 + Math.abs((hash >> 8) % 140);
    return { x, y };
  }

  renderRouteMap(optimizedSequence = null) {
    const mapContainer = document.getElementById("phone-map-canvas-container");
    const mrId = document.getElementById("phone-mr-selector")?.value;
    if (!mapContainer || !mrId) return;

    const mr = MR_DATA.find(m => m.id === mrId);
    if (!mr) return;

    // Filter meetings for today/current
    let mrMeetings = MEETINGS_DATA.filter(m => m.mrId === mrId);

    // If an optimized sequence is provided, use that order. Otherwise, sort by scheduled time.
    if (optimizedSequence) {
      mrMeetings = optimizedSequence;
    } else {
      mrMeetings.sort((a, b) => a.time.localeCompare(b.time));
    }

    // Check if meetings are chronological
    let isOutOfOrder = false;
    for (let i = 0; i < mrMeetings.length - 1; i++) {
      if (mrMeetings[i].time.localeCompare(mrMeetings[i + 1].time) > 0) {
        isOutOfOrder = true;
        break;
      }
    }

    const warningEl = document.getElementById("route-optimize-warning");
    if (warningEl) {
      if (isOutOfOrder) {
        warningEl.style.display = "flex";
        document.getElementById("route-optimize-warning-text").textContent = "Warning: Optimized path has chronological conflicts.";
      } else {
        warningEl.style.display = "none";
      }
    }

    // Base coordinate
    const baseCoord = { x: 30, y: 170 }; // Start bottom-left

    if (mrMeetings.length === 0) {
      mapContainer.innerHTML = `
        <div style="text-align: center; color: #64748b; padding: 60px 0; font-size: 0.8rem;">
          <i data-lucide="map" style="width: 28px; height: 28px; margin-bottom: 8px; opacity: 0.5; display: inline-block;"></i>
          <p>No map route. No visits scheduled.</p>
        </div>
      `;
      lucide.createIcons();
      // Reset stats
      document.getElementById("route-stat-distance").textContent = "0.0 km";
      document.getElementById("route-stat-duration").textContent = "0 min";
      document.getElementById("route-stat-carbon").textContent = "0.0 kg";
      return;
    }

    // Generate points
    const points = [baseCoord];
    const meetingDetails = [];

    mrMeetings.forEach(meet => {
      const doc = DOCTORS_DATA.find(d => d.id === meet.doctorId);
      if (doc) {
        const coords = this.getDoctorCoordinates(doc);
        points.push(coords);
        meetingDetails.push({
          meet,
          doc,
          coords
        });
      }
    });

    // Compute total distance (scaled Euclidean distance)
    let totalDistVal = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const pixelDist = Math.sqrt(dx * dx + dy * dy);
      // Let's scale: 10 pixels = 1.5 km
      totalDistVal += pixelDist * 0.15;
    }

    // Add return trip to base for round trip distance calculation
    if (points.length > 1) {
      const lastPt = points[points.length - 1];
      const dx = lastPt.x - baseCoord.x;
      const dy = lastPt.y - baseCoord.y;
      totalDistVal += Math.sqrt(dx * dx + dy * dy) * 0.15;
    }

    const distanceStr = totalDistVal.toFixed(1) + " km";
    const durationMins = Math.round(totalDistVal * 3); // Approx 3 mins per km in city traffic
    const durationStr = durationMins + " mins";
    const co2SavedVal = totalDistVal * 0.12;
    const carbonStr = co2SavedVal.toFixed(1) + " kg";

    document.getElementById("route-stat-distance").textContent = distanceStr;
    document.getElementById("route-stat-duration").textContent = durationStr;
    document.getElementById("route-stat-carbon").textContent = carbonStr;

    // Generate SVG path line coordinate string
    let pathD = `M ${baseCoord.x} ${baseCoord.y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }
    // Return path
    pathD += ` L ${baseCoord.x} ${baseCoord.y}`;

    // SVG elements
    const width = 240;
    const height = 200;

    // Generate background grids
    let gridsHtml = "";
    for (let i = 20; i < width; i += 20) {
      gridsHtml += `<line class="map-grid-line" x1="${i}" y1="0" x2="${i}" y2="${height}" />`;
    }
    for (let i = 20; i < height; i += 20) {
      gridsHtml += `<line class="map-grid-line" x1="0" y1="${i}" x2="${width}" y2="${i}" />`;
    }

    // Generate background roads (aesthetic grid of streets)
    const roads = [
      { x1: 10, y1: 30, x2: 230, y2: 30 },
      { x1: 10, y1: 100, x2: 230, y2: 100 },
      { x1: 10, y1: 170, x2: 230, y2: 170 },
      { x1: 40, y1: 10, x2: 40, y2: 190 },
      { x1: 120, y1: 10, x2: 120, y2: 190 },
      { x1: 190, y1: 10, x2: 190, y2: 190 }
    ];

    let roadsHtml = roads.map(r => `
      <line class="map-road" x1="${r.x1}" y1="${r.y1}" x2="${r.x2}" y2="${r.y2}" />
      <line class="map-road-inner" x1="${r.x1}" y1="${r.y1}" x2="${r.x2}" y2="${r.y2}" />
    `).join("");

    // Generate stop pins
    const pinsHtml = meetingDetails.map((det, index) => {
      const isCompleted = det.meet.status === "completed";
      const isCancelled = det.meet.status === "cancelled";
      
      let dotColor = "#00f0ff";
      let pulseColor = "rgba(0, 240, 255, 0.4)";

      if (isCompleted) {
        dotColor = "#25D366";
        pulseColor = "rgba(37, 211, 102, 0.4)";
      } else if (isCancelled) {
        dotColor = "#718096";
        pulseColor = "rgba(113, 128, 150, 0.2)";
      } else if (index === 0) {
        // Next active visit glows gold
        dotColor = "#f59e0b";
        pulseColor = "rgba(245, 158, 11, 0.5)";
      }

      return `
        <g style="cursor: pointer;" onclick="window.appInstance.beginPhoneVisit('${det.meet.id}')">
          <!-- Pulse animation ring -->
          <circle class="map-pin-pulse" cx="${det.coords.x}" cy="${det.coords.y}" r="8" fill="${pulseColor}" />
          <!-- Pin body -->
          <circle cx="${det.coords.x}" cy="${det.coords.y}" r="6" fill="${dotColor}" stroke="#fff" stroke-width="1.5" />
          <!-- Stop number -->
          <text x="${det.coords.x}" y="${det.coords.y - 10}" fill="#fff" font-size="8" font-weight="700" text-anchor="middle" style="text-shadow: 0 1px 3px #000;">
            Stop ${index + 1}
          </text>
          <!-- Tooltip label -->
          <title>${det.doc.name} (${det.meet.time}) - ${det.doc.clinicName}</title>
        </g>
      `;
    }).join("");

    // Base point rendering
    const basePinHtml = `
      <g>
        <circle cx="${baseCoord.x}" cy="${baseCoord.y}" r="8" fill="hsl(var(--agent-system))" stroke="#fff" stroke-width="1.5" />
        <path d="M ${baseCoord.x - 4} ${baseCoord.y + 2} L ${baseCoord.x} ${baseCoord.y - 4} L ${baseCoord.x + 4} ${baseCoord.y + 2} Z" fill="#fff" />
        <text x="${baseCoord.x}" y="${baseCoord.y - 12}" fill="hsl(var(--agent-system))" font-size="8" font-weight="700" text-anchor="middle" style="text-shadow: 0 1px 3px #000;">
          HQ Base
        </text>
        <title>MR Home Base</title>
      </g>
    `;

    mapContainer.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" class="phone-map-svg">
        <defs>
          <radialGradient id="mapBgGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#1e293b" />
            <stop offset="100%" stop-color="#0b0f19" />
          </radialGradient>
        </defs>
        
        <!-- Map Background -->
        <rect width="100%" height="100%" fill="url(#mapBgGrad)" />
        
        <!-- Grid -->
        ${gridsHtml}
        
        <!-- Roads -->
        ${roadsHtml}
        
        <!-- Route Line (Base Path) -->
        <path class="map-route-line" d="${pathD}" />
        
        <!-- Route Traffic Animation Flow -->
        <path class="map-route-flow" d="${pathD}" />
        
        <!-- Base Marker -->
        ${basePinHtml}
        
        <!-- Clinic Markers -->
        ${pinsHtml}
      </svg>
    `;

    // Make appInstance globally accessible in window so SVG onclick works
    window.appInstance = this;
    lucide.createIcons();
  }

  optimizeRoute() {
    const mrId = document.getElementById("phone-mr-selector")?.value;
    if (!mrId) return;

    const mr = MR_DATA.find(m => m.id === mrId);
    if (!mr) return;

    let mrMeetings = MEETINGS_DATA.filter(m => m.mrId === mrId);
    if (mrMeetings.length <= 1) {
      alert("At least 2 scheduled visits are required to perform path optimization.");
      return;
    }

    // Log terminal messages
    this.console.writeLog("System", `Optimizing route matrix for representative ${mr.name}...`, "sender-system");
    this.console.writeLog("Scheduling Agent", `Analyzing clinic travel coordinates and road traffic vectors...`, "sender-scheduling");

    // Perform Traveling Salesperson (Nearest Neighbor) from base coordinate (30, 170)
    const baseCoord = { x: 30, y: 170 };
    
    // Create copy of meetings to sort
    const unvisited = mrMeetings.map(meet => {
      const doc = DOCTORS_DATA.find(d => d.id === meet.doctorId);
      const coords = this.getDoctorCoordinates(doc);
      return { meet, coords };
    });

    const optimized = [];
    let currentCoord = baseCoord;

    while (unvisited.length > 0) {
      // Find nearest neighbor
      let minIndex = 0;
      let minDistance = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const dx = unvisited[i].coords.x - currentCoord.x;
        const dy = unvisited[i].coords.y - currentCoord.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance) {
          minDistance = dist;
          minIndex = i;
        }
      }

      // Add to optimized list
      const nextNode = unvisited.splice(minIndex, 1)[0];
      optimized.push(nextNode.meet);
      currentCoord = nextNode.coords;
    }

    // Log sequence
    const stopNames = optimized.map((meet, idx) => {
      const doc = DOCTORS_DATA.find(d => d.id === meet.doctorId);
      return `Stop ${idx + 1}: ${doc?.name || 'Unknown'}`;
    }).join(" -> ");
    
    this.console.writeLog("Scheduling Agent", `Calculated optimal sequence: Base -> ${stopNames}. Commute overhead minimized.`, "sender-scheduling");

    // Re-render map using the optimized sequence
    this.renderRouteMap(optimized);

    // Visual feedback
    if (window.confetti) {
      window.confetti({ particleCount: 40, spread: 30, origin: { y: 0.8 } });
    }
  }

  renderPhoneAgenda() {
    const agendaList = document.getElementById("phone-agenda-list");
    const mrId = document.getElementById("phone-mr-selector")?.value;
    if (!agendaList || !mrId) return;

    agendaList.innerHTML = "";

    // Filter meetings for this MR
    const mrMeetings = MEETINGS_DATA.filter(m => m.mrId === mrId);

    if (mrMeetings.length === 0) {
      agendaList.innerHTML = `
        <div style="text-align: center; color: #64748b; padding: 40px 0; font-size: 0.8rem;">
          <i data-lucide="calendar" style="width: 28px; height: 28px; margin-bottom: 8px; opacity: 0.5; display: inline-block;"></i>
          <p>No visits scheduled for today.</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    agendaList.innerHTML = mrMeetings.map(meet => {
      const doc = DOCTORS_DATA.find(d => d.id === meet.doctorId);
      const isCompleted = meet.status === "completed";
      
      return `
        <div class="phone-agenda-card ${isCompleted ? 'completed' : ''}">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="phone-card-time">${meet.time}</span>
            ${isCompleted ? '<span style="font-size:0.65rem; font-weight:700; color:hsl(var(--color-success));">COMPLETED</span>' : ''}
          </div>
          <div class="phone-card-doctor">${doc?.name || 'Unknown Doctor'}</div>
          <div class="phone-card-clinic">${doc?.clinicName || 'Unknown Clinic'}</div>
          
          ${!isCompleted ? `
            <div class="phone-card-action">
              <button class="btn btn-accent-matching phone-btn-action" data-meet-id="${meet.id}" style="padding: 4px 10px; font-size: 0.75rem; border-radius: 4px; color: #000;">
                Begin Visit
              </button>
            </div>
          ` : ''}
        </div>
      `;
    }).join("");

    // Wire up "Begin Visit" button event listeners
    const buttons = agendaList.querySelectorAll(".phone-btn-action");
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const meetId = btn.dataset.meetId;
        this.beginPhoneVisit(meetId);
      });
    });

    lucide.createIcons();
  }

  beginPhoneVisit(meetId) {
    const meet = MEETINGS_DATA.find(m => m.id === meetId);
    if (!meet) return;

    const doc = DOCTORS_DATA.find(d => d.id === meet.doctorId);
    if (!doc) return;

    // Populate Doctor Card
    const docCard = document.getElementById("phone-visit-doctor-card");
    if (docCard) {
      docCard.innerHTML = `
        <div class="phone-visit-doctor-name">${doc.name}</div>
        <div class="phone-visit-doctor-sub">
          <span><strong>Clinic:</strong> ${doc.clinicName}</span>
          <span><strong>Address:</strong> ${doc.address}</span>
          <span><strong>Preferred Time:</strong> ${doc.preferredTime}</span>
        </div>
      `;
    }

    // Set Hidden Inputs
    document.getElementById("phone-visit-meet-id").value = meetId;
    document.getElementById("phone-visit-potential").value = doc.prescriptionPotential;
    document.getElementById("phone-visit-notes").value = "";

    // Set sample deal value based on potential
    const dealInput = document.getElementById("phone-visit-deal");
    if (dealInput) {
      if (doc.prescriptionPotential === "High") {
        dealInput.value = Math.floor(Math.random() * (150000 - 90000 + 1) + 90000);
      } else {
        dealInput.value = Math.floor(Math.random() * (90000 - 40000 + 1) + 40000);
      }
    }

    // Swap Views
    document.getElementById("phone-screen-agenda").classList.remove("active");
    document.getElementById("phone-screen-visit").classList.add("active");
    
    lucide.createIcons();
  }

  async submitPhoneVisit() {
    const meetId = document.getElementById("phone-visit-meet-id").value;
    const potential = document.getElementById("phone-visit-potential").value;
    const dealValue = parseInt(document.getElementById("phone-visit-deal").value) || 0;
    const notes = document.getElementById("phone-visit-notes").value;

    const meet = MEETINGS_DATA.find(m => m.id === meetId);
    if (!meet) return;

    const mr = MR_DATA.find(m => m.id === meet.mrId);

    try {
      const response = await fetch('/api/meetings/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId: meetId, potential, dealValue, notes })
      });
      if (!response.ok) throw new Error('Failed to complete meeting on server');
      const updatedDb = await response.json();
      await this.syncWithServer(updatedDb);

      // 3. Log simulated Agent communications
      this.console.writeLog("Scheduling Agent", `Doctor visit logged by representative ${mr?.name}. Meeting status set to COMPLETED.`, "sender-scheduling");
      this.console.writeLog("Analytics Agent", `Recalculating territory analytics. Deal closed: ₹${dealValue.toLocaleString('en-IN')}.`, "sender-analytics");
      this.console.writeLog("System", "Re-compiling performance dashboard states...", "sender-system");

      // 4. Update the desktop dashboards
      this.renderMRDirectory();
      this.renderCalendar();
      this.renderAnalytics();
      this.renderReport(this.console.reportAgent.generateReportData("All"));

      // 5. Success Confetti!
      if (window.confetti) {
        window.confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
    } catch (err) {
      this.console.writeLog("System", `Error completing visit: ${err.message}`, "sender-system");
    }

    // 6. Return to phone agenda screen
    document.getElementById("phone-screen-agenda").classList.add("active");
    document.getElementById("phone-screen-visit").classList.remove("active");
    this.renderPhoneAgenda();
  }

  // --- Doctor WhatsApp Simulator Methods ---

  /**
   * Triggers a simulated WhatsApp conversation from the Communication Agent to the doctor
   * @param {Object} meeting 
   */
  async triggerDoctorWhatsApp(meeting) {
    this.pendingMeeting = meeting;
    this.activeWhatsAppDoctor = DOCTORS_DATA.find(d => d.id === meeting.doctorId);
    const mr = MR_DATA.find(m => m.id === meeting.mrId);
    
    if (!this.activeWhatsAppDoctor || !mr) return;

    // Update WhatsApp screen details
    const docNameHeader = document.getElementById("whatsapp-doctor-name");
    if (docNameHeader) docNameHeader.textContent = this.activeWhatsAppDoctor.name;

    const thread = document.getElementById("whatsapp-chat-thread");
    if (!thread) return;

    // Clear previous chat
    thread.innerHTML = `
      <div style="text-align: center; color: #8696a0; font-size: 0.65rem; margin-bottom: 12px; background: #182229; padding: 4px 10px; border-radius: 4px; align-self: center;">
        Messages are secured with end-to-end encryption.
      </div>
    `;

    // Slide-out the WhatsApp simulator automatically to show the action!
    const waPanel = document.getElementById("whatsapp-simulator-panel");
    const phonePanel = document.getElementById("phone-simulator-panel");
    if (phonePanel) {
      phonePanel.classList.remove("active");
    }
    if (waPanel) {
      waPanel.classList.add("active");
    }
    this.updateSimulatorLayout();

    // Toggle communication agent active state in terminal nodes
    this.console.setAgentNodeActive("comm", true);
    
    // Simulate sending time delays
    await new Promise(r => setTimeout(r, 800));
    
    // Add WhatsApp bubble (Incoming prompt)
    this.addWhatsAppBubble("received", `Hello ${this.activeWhatsAppDoctor.name}, this is the PharmaMR AI coordinator assistant. Representative <strong>${mr.name}</strong> would like to schedule a visit to present <strong>${mr.specialty}</strong> clinical studies.<br><br>📅 <strong>Date:</strong> ${meeting.date}<br>⏰ <strong>Time Slot:</strong> ${meeting.time}<br><br>Reply <strong>1</strong> to Confirm, or <strong>2</strong> to Reschedule.`);
    
    // Render Quick Action Buttons
    this.renderWhatsAppActionChips();

    // Log terminal communications
    this.console.writeLog("Communication Agent", `Dispatching WhatsApp scheduling invite to ${this.activeWhatsAppDoctor.name} (+91 98765 XXXXX).`, "sender-comm");
    this.console.setAgentNodeActive("comm", false);
  }

  addWhatsAppBubble(type, message) {
    const thread = document.getElementById("whatsapp-chat-thread");
    if (!thread) return;

    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    const bubble = document.createElement("div");
    bubble.className = `wa-bubble ${type}`;
    bubble.innerHTML = `
      <span>${message}</span>
      <span class="wa-time">${timeStr}</span>
    `;

    thread.appendChild(bubble);
    thread.scrollTop = thread.scrollHeight;
  }

  renderWhatsAppActionChips() {
    const actionsRow = document.getElementById("whatsapp-quick-actions");
    if (!actionsRow) return;

    actionsRow.innerHTML = `
      <div class="wa-chip" id="wa-chip-confirm">Confirm Visit [1]</div>
      <div class="wa-chip" id="wa-chip-resched">Suggest 3:00 PM [2]</div>
    `;

    // Action clicks
    document.getElementById("wa-chip-confirm").addEventListener("click", () => {
      this.handleDoctorWhatsAppReply("1");
    });
    document.getElementById("wa-chip-resched").addEventListener("click", () => {
      this.handleDoctorWhatsAppReply("2");
    });
  }

  clearWhatsAppActionChips() {
    const actionsRow = document.getElementById("whatsapp-quick-actions");
    if (actionsRow) actionsRow.innerHTML = "";
  }

  async handleDoctorWhatsAppReply(text) {
    if (!this.pendingMeeting) return;

    this.addWhatsAppBubble("sent", text);
    this.clearWhatsAppActionChips();

    // AI Communication Agent processing reply...
    this.console.setAgentNodeActive("comm", true);
    await new Promise(r => setTimeout(r, 1000));
    
    if (text === "1" || text.toLowerCase().includes("confirm") || text.toLowerCase().includes("yes")) {
      try {
        const response = await fetch('/api/meetings/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meetingId: this.pendingMeeting.id })
        });
        if (!response.ok) throw new Error('Failed to confirm meeting on server');
        const updatedDb = await response.json();
        
        const mrName = MR_DATA.find(m => m.id === this.pendingMeeting.mrId)?.name || "representative";
        const meetingDate = this.pendingMeeting.date;
        const meetingTime = this.pendingMeeting.time;

        await this.syncWithServer(updatedDb);
        
        // 1. Bot Confirmation
        this.addWhatsAppBubble("received", `Thank you! Your visit with rep <strong>${mrName}</strong> has been successfully booked on ${meetingDate} at ${meetingTime}. A calendar invite has been sent to your clinic.`);
        
        // 3. Log agent logs
        this.console.writeLog("Communication Agent", `WhatsApp confirmation received from ${this.activeWhatsAppDoctor.name}. Dispatching calendar tokens...`, "sender-comm");
        this.console.writeLog("Scheduling Agent", `Doctor approved pending booking. Status synchronized to SCHEDULED.`, "sender-scheduling");
        
        // Refresh views
        this.renderCalendar();
        this.renderPhoneAgenda(); // Synced to rep phone!
        
        // Burst confetti!
        if (window.confetti) {
          window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }

        this.pendingMeeting = null; // reset
      } catch (err) {
        this.addWhatsAppBubble("received", `Sorry, there was an error confirming this booking on the server.`);
      }
    } 
    else if (text === "2" || text.toLowerCase().includes("reschedule") || text.toLowerCase().includes("3") || text.toLowerCase().includes("3:00")) {
      // 1. Bot Rescheduling
      const newTime = "15:00";
      
      this.addWhatsAppBubble("received", `Received reschedule request for <strong>3:00 PM (15:00)</strong>. Checking scheduling coordinator...`);
      await new Promise(r => setTimeout(r, 1200));

      // Check conflict for new time
      const mrId = this.pendingMeeting.mrId;
      const date = this.pendingMeeting.date;
      
      const timeThresholdMins = 60;
      const newDateTime = new Date(`${date}T${newTime}:00`);

      const hasConflict = MEETINGS_DATA.some(meet => {
        if (meet.mrId === mrId && meet.date === date && meet.id !== this.pendingMeeting.id && meet.status !== "cancelled") {
          const existingDateTime = new Date(`${meet.date}T${meet.time}:00`);
          const diffMs = Math.abs(newDateTime - existingDateTime);
          const diffMins = diffMs / 1000 / 60;
          return diffMins < timeThresholdMins;
        }
        return false;
      });

      if (hasConflict) {
        this.addWhatsAppBubble("received", `Sorry, representative is already booked near 3:00 PM in another sector. Keep the original slot or suggest another day?`);
        this.renderWhatsAppActionChips();
      } else {
        try {
          const response = await fetch('/api/meetings/reschedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meetingId: this.pendingMeeting.id, time: newTime })
          });
          if (!response.ok) throw new Error('Failed to reschedule meeting on server');
          const updatedDb = await response.json();
          await this.syncWithServer(updatedDb);

          this.addWhatsAppBubble("received", `Conflict check cleared. Representative has been rerouted. Rescheduled to <strong>${newTime}</strong> on ${date}. Confirmed!`);
          
          this.console.writeLog("Scheduling Agent", `Rerouting scheduled paths. Meeting date confirmed at adjusted slot: ${newTime}.`, "sender-scheduling");

          this.renderCalendar();
          this.renderPhoneAgenda();

          if (window.confetti) {
            window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          }

          this.pendingMeeting = null; // reset
        } catch (err) {
          this.addWhatsAppBubble("received", `Sorry, there was an error rescheduling this booking on the server.`);
        }
      }
    } 
    else {
      // NLP chat fallback
      this.addWhatsAppBubble("received", `I'm an automated assistant. Please reply with:<br><strong>1</strong> - Confirm Visit<br><strong>2</strong> - Reschedule to 3:00 PM`);
      this.renderWhatsAppActionChips();
    }

    this.console.setAgentNodeActive("comm", false);
  }

  // --- Product Manager Methods ---

  renderProducts() {
    const tableBody = document.getElementById("product-inventory-table-body");
    const matchSelector = document.getElementById("match-product-selector");
    const schedSelector = document.getElementById("sched-product");

    if (tableBody) {
      tableBody.innerHTML = PRODUCTS_DATA.map(p => `
        <tr>
          <td style="font-weight:600; color:#fff;">${p.name}</td>
          <td><span class="tag tag-accent-matching" style="font-size:0.7rem;">${p.specialty}</span></td>
          <td style="font-size:0.75rem; color:hsl(var(--text-secondary));">${p.description}</td>
        </tr>
      `).join("");
    }

    if (matchSelector) {
      matchSelector.innerHTML = PRODUCTS_DATA.map(p => `
        <option value="${p.id}">${p.name} (${p.specialty})</option>
      `).join("");
    }

    if (schedSelector) {
      schedSelector.innerHTML = PRODUCTS_DATA.map(p => `
        <option value="${p.id}">${p.name} (${p.specialty})</option>
      `).join("");
    }
  }

  // --- Doctor Directory Methods ---

  renderDoctorDirectory() {
    const grid = document.getElementById("doctors-grid");
    if (!grid) return;

    const query = (document.getElementById("doctor-search-input")?.value || "").toLowerCase().trim();
    const region = document.getElementById("doctor-region-filter")?.value || "All";

    const filtered = DOCTORS_DATA.filter(doc => {
      const matchQuery = !query || 
        doc.name.toLowerCase().includes(query) || 
        doc.clinicName.toLowerCase().includes(query) || 
        doc.specialty.toLowerCase().includes(query);
      const matchRegion = region === "All" || doc.region.toLowerCase() === region.toLowerCase();
      return matchQuery && matchRegion;
    });

    const activeEditId = document.getElementById("edit-doctor-id")?.value || "";

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: hsl(var(--text-secondary)); padding: 40px; font-size: 0.85rem;">
          <i data-lucide="info" style="width: 24px; height: 24px; margin-bottom: 8px; opacity: 0.5;"></i>
          <div>No physicians match the search filters.</div>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    grid.innerHTML = filtered.map(doc => {
      const initials = doc.name.replace("Dr. ", "").split(" ").map(n => n[0]).join("");
      const availabilityStr = doc.availability.join(", ");
      const potentialClass = doc.prescriptionPotential.toLowerCase();
      const isSelected = doc.id === activeEditId ? "selected" : "";

      return `
        <div class="doc-card ${isSelected}" data-doc-id="${doc.id}">
          <span class="badge-potential ${potentialClass}">${doc.prescriptionPotential}</span>
          <div class="doc-card-header">
            <div class="doc-avatar">${initials}</div>
            <div class="doc-meta">
              <span class="doc-name">${doc.name}</span>
              <span class="doc-clinic">${doc.clinicName}</span>
            </div>
          </div>
          <div class="tag-list" style="margin-bottom: 8px;">
            <span class="tag tag-accent-matching" style="font-size:0.7rem;">${doc.specialty}</span>
            <span class="tag" style="font-size:0.7rem;">${doc.region}</span>
          </div>
          <ul class="doc-details-list">
            <li><i data-lucide="map-pin"></i> <span>${doc.address}</span></li>
            <li><i data-lucide="calendar-clock"></i> <span>${availabilityStr}</span></li>
            <li><i data-lucide="phone"></i> <span>${doc.phone || 'No Phone'}</span></li>
            <li><i data-lucide="mail"></i> <span>${doc.email || 'No Email'}</span></li>
          </ul>
        </div>
      `;
    }).join("");

    lucide.createIcons();

    // Bind card select click handlers
    const cards = grid.querySelectorAll(".doc-card");
    cards.forEach(card => {
      card.addEventListener("click", () => {
        const docId = card.dataset.docId;
        this.selectDoctorForEdit(docId);
      });
    });
  }

  selectDoctorForEdit(docId) {
    const doc = DOCTORS_DATA.find(d => d.id === docId);
    if (!doc) return;

    // Highlight card
    const cards = document.querySelectorAll(".doc-card");
    cards.forEach(c => c.classList.remove("selected"));
    const selectedCard = document.querySelector(`.doc-card[data-doc-id="${docId}"]`);
    if (selectedCard) selectedCard.classList.add("selected");

    // Populate form inputs
    document.getElementById("edit-doctor-id").value = doc.id;
    document.getElementById("doc-name").value = doc.name;
    document.getElementById("doc-clinic").value = doc.clinicName;
    document.getElementById("doc-specialty").value = doc.specialty;
    document.getElementById("doc-region").value = doc.region;
    document.getElementById("doc-address").value = doc.address;
    document.getElementById("doc-phone").value = doc.phone || "";
    document.getElementById("doc-email").value = doc.email || "";
    document.getElementById("doc-potential").value = doc.prescriptionPotential;
    document.getElementById("doc-preferred-time").value = doc.preferredTime || "Morning (09:00 - 12:00)";

    // Set checkboxes
    const checkboxes = document.querySelectorAll("#doc-availability-checkboxes input");
    checkboxes.forEach(cb => {
      cb.checked = doc.availability.includes(cb.value);
    });

    // Update UI headers and display delete button
    document.getElementById("doctor-editor-title").textContent = "Edit Physician Profile";
    document.getElementById("doc-delete-btn").style.display = "flex";
  }

  resetDoctorEditor() {
    // Clear select styling
    const cards = document.querySelectorAll(".doc-card");
    cards.forEach(c => c.classList.remove("selected"));

    // Reset inputs
    document.getElementById("edit-doctor-id").value = "";
    document.getElementById("doctor-editor-form").reset();

    // Reset checkboxes to checked by default
    const checkboxes = document.querySelectorAll("#doc-availability-checkboxes input");
    checkboxes.forEach(cb => {
      cb.checked = cb.value !== "Saturday";
    });

    // Update UI headers
    document.getElementById("doctor-editor-title").textContent = "Register New Physician";
    document.getElementById("doc-delete-btn").style.display = "none";
  }
}

// Instantiate on load
window.addEventListener("DOMContentLoaded", () => {
  new App();
});
