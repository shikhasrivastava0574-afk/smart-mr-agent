# server.py
import http.server
import socketserver
import json
import os
import sqlite3
from urllib.parse import urlparse

PORT = 8000
DB_FILE = 'database.db'

# Default baseline dataset (matching js/data.js)
DEFAULT_DATA = {
    "mrs": [
        {
            "id": "mr-01",
            "name": "Priya Sharma",
            "specialty": "Cardiology",
            "experienceYears": 6,
            "rating": 4.9,
            "territory": "Lucknow",
            "status": "Active",
            "doctorRelationships": 48,
            "monthlySales": 1024000,
            "email": "p.sharma@pharmalabs.co.in",
            "phone": "+91 98765 01234",
            "bio": "Specialist in cardiovascular therapies. Recognized for maintaining high physician retention rates in Lucknow Metro.",
            "colorTheme": "var(--agent-matching)"
        },
        {
            "id": "mr-02",
            "name": "Rajesh Kumar",
            "specialty": "Oncology",
            "experienceYears": 8,
            "rating": 4.8,
            "territory": "Noida",
            "status": "Active",
            "doctorRelationships": 32,
            "monthlySales": 1589000,
            "email": "r.kumar@pharmalabs.co.in",
            "phone": "+91 98765 05678",
            "bio": "Oncology clinical background. Expertise in complex therapeutic sales, handling major hospital networks in Noida/NCR.",
            "colorTheme": "var(--agent-report)"
        },
        {
            "id": "mr-03",
            "name": "Dr. Amit Patel",
            "specialty": "Neurology",
            "experienceYears": 5,
            "rating": 4.9,
            "territory": "Varanasi",
            "status": "Busy",
            "doctorRelationships": 42,
            "monthlySales": 1145000,
            "email": "a.patel@pharmalabs.co.in",
            "phone": "+91 98765 09988",
            "bio": "Former clinical neurologist. Transitions science into high-impact clinical conversations. Varanasi territory owner.",
            "colorTheme": "var(--agent-scheduling)"
        },
        {
            "id": "mr-04",
            "name": "Vikram Singh",
            "specialty": "Diabetes & Endocrinology",
            "experienceYears": 4,
            "rating": 4.7,
            "territory": "Kanpur",
            "status": "Active",
            "doctorRelationships": 55,
            "monthlySales": 898000,
            "email": "v.singh@pharmalabs.co.in",
            "phone": "+91 98765 04411",
            "bio": "Strong background in insulin therapies and glucose monitoring tech. Broad reach in the Kanpur medical district.",
            "colorTheme": "var(--agent-analytics)"
        },
        {
            "id": "mr-05",
            "name": "Ananya Gupta",
            "specialty": "Pediatrics",
            "experienceYears": 7,
            "rating": 4.9,
            "territory": "Gorakhpur",
            "status": "Active",
            "doctorRelationships": 60,
            "monthlySales": 912000,
            "email": "a.gupta@pharmalabs.co.in",
            "phone": "+91 98765 03377",
            "bio": "Pediatric product champion. Excellent record with independent clinics and vaccine rollouts in Gorakhpur.",
            "colorTheme": "var(--agent-system)"
        },
        {
            "id": "mr-06",
            "name": "Rahul Verma",
            "specialty": "Cardiology",
            "experienceYears": 3,
            "rating": 4.6,
            "territory": "Noida",
            "status": "Active",
            "doctorRelationships": 25,
            "monthlySales": 785000,
            "email": "r.verma@pharmalabs.co.in",
            "phone": "+91 98765 07766",
            "bio": "Energetic newcomer with specialized training in electrophysiology products. Expanding quickly in Noida Sector 62.",
            "colorTheme": "var(--agent-matching)"
        }
    ],
    "doctors": [
        {
            "id": "doc-01",
            "name": "Dr. Alok Misra",
            "clinicName": "Lucknow Cardiology Institute",
            "specialty": "Cardiology",
            "region": "Lucknow",
            "address": "Hazratganj, Lucknow, UP",
            "availability": ["Monday", "Wednesday", "Friday"],
            "prescriptionPotential": "High",
            "preferredTime": "Morning (09:00 - 12:00)",
            "phone": "+91 99345 67890",
            "email": "alok.misra@lucknowcardio.org"
        },
        {
            "id": "doc-02",
            "name": "Dr. Sunita Rao",
            "clinicName": "Noida Cancer Care & Research",
            "specialty": "Oncology",
            "region": "Noida",
            "address": "Sector 62, Noida, UP",
            "availability": ["Tuesday", "Thursday"],
            "prescriptionPotential": "High",
            "preferredTime": "Afternoon (14:00 - 17:00)",
            "phone": "+91 98123 45678",
            "email": "sunita.rao@noidacancercare.com"
        },
        {
            "id": "doc-03",
            "name": "Dr. Rakesh Dwivedi",
            "clinicName": "Kashi Neuro Center",
            "specialty": "Neurology",
            "region": "Varanasi",
            "address": "Lanka, Varanasi, UP",
            "availability": ["Monday", "Thursday", "Friday"],
            "prescriptionPotential": "High",
            "preferredTime": "Morning (08:30 - 11:30)",
            "phone": "+91 97234 56789",
            "email": "rakesh.dwivedi@kashineuro.in"
        },
        {
            "id": "doc-04",
            "name": "Dr. Vandana Asthana",
            "clinicName": "Kanpur Endocrine Hospital",
            "specialty": "Diabetes & Endocrinology",
            "region": "Kanpur",
            "address": "Swaroop Nagar, Kanpur, UP",
            "availability": ["Tuesday", "Wednesday"],
            "prescriptionPotential": "Medium",
            "preferredTime": "Afternoon (13:00 - 16:00)",
            "phone": "+91 96345 67890",
            "email": "v.asthana@kanpurendocrine.com"
        },
        {
            "id": "doc-05",
            "name": "Dr. Harish Chandra",
            "clinicName": "Gorakhpur Children's Hospital",
            "specialty": "Pediatrics",
            "region": "Gorakhpur",
            "address": "Golghar, Gorakhpur, UP",
            "availability": ["Wednesday", "Friday"],
            "prescriptionPotential": "High",
            "preferredTime": "Morning (10:00 - 12:00)",
            "phone": "+91 95456 78901",
            "email": "harish.c@gorakhpurchildren.org"
        },
        {
            "id": "doc-06",
            "name": "Dr. Neha Saxena",
            "clinicName": "Awadh Heart Clinic",
            "specialty": "Cardiology",
            "region": "Lucknow",
            "address": "Gomti Nagar, Lucknow, UP",
            "availability": ["Tuesday", "Friday"],
            "prescriptionPotential": "Medium",
            "preferredTime": "Afternoon (15:00 - 17:00)",
            "phone": "+91 94567 89012",
            "email": "neha.saxena@awadhheart.com"
        },
        {
            "id": "doc-07",
            "name": "Dr. S. K. Pathak",
            "clinicName": "Sangam Diagnostic Center",
            "specialty": "Neurology",
            "region": "Prayagraj",
            "address": "Civil Lines, Prayagraj, UP",
            "availability": ["Wednesday", "Thursday"],
            "prescriptionPotential": "High",
            "preferredTime": "Afternoon (14:00 - 16:30)",
            "phone": "+91 93678 90123",
            "email": "skpathak@sangamdiagnostics.co.in"
        }
    ],
    "meetings": [
        {
            "id": "meet-01",
            "mrId": "mr-01",
            "doctorId": "doc-01",
            "date": "2026-06-12",
            "time": "10:30",
            "status": "scheduled",
            "notes": "Introducing Cardiox-B beta-blockers clinical study results."
        },
        {
            "id": "meet-02",
            "mrId": "mr-02",
            "doctorId": "doc-02",
            "date": "2026-06-15",
            "time": "15:00",
            "status": "scheduled",
            "notes": "Presenting oncology pipeline phase-3 clinical trial publications."
        },
        {
            "id": "meet-03",
            "mrId": "mr-03",
            "doctorId": "doc-03",
            "date": "2026-06-11",
            "time": "09:30",
            "status": "scheduled",
            "notes": "Demonstrating new neuro-regenerative injector kits."
        },
        {
            "id": "meet-04",
            "mrId": "mr-04",
            "doctorId": "doc-04",
            "date": "2026-06-08",
            "time": "14:00",
            "status": "completed",
            "notes": "Completed initial introduction of GlucoGuard 24hr monitoring. Doctor requested samples."
        }
    ],
    "territories": [
        {
            "id": "terr-01",
            "name": "Lucknow",
            "doctorsCount": 420,
            "mrCount": 4,
            "competitorStrength": "High",
            "marketDemand": "High",
            "estimatedROI": 85,
            "topTherapeuticArea": "Cardiology",
            "description": "Capital city, primary medical hub, highly saturated hospital systems, intense competition."
        },
        {
            "id": "terr-02",
            "name": "Noida",
            "doctorsCount": 850,
            "mrCount": 12,
            "competitorStrength": "High",
            "marketDemand": "High",
            "estimatedROI": 92,
            "topTherapeuticArea": "Oncology",
            "description": "Rapidly expanding NCR zone, advanced cancer facilities, crucial corporate medical hub."
        },
        {
            "id": "terr-03",
            "name": "Kanpur",
            "doctorsCount": 510,
            "mrCount": 5,
            "competitorStrength": "Medium",
            "marketDemand": "High",
            "estimatedROI": 78,
            "topTherapeuticArea": "Diabetes & Endocrinology",
            "description": "High density patient base, strong diabetic treatment demand, moderate competition."
        },
        {
            "id": "terr-04",
            "name": "Gorakhpur",
            "doctorsCount": 480,
            "mrCount": 3,
            "competitorStrength": "Medium",
            "marketDemand": "High",
            "estimatedROI": 89,
            "topTherapeuticArea": "Pediatrics",
            "description": "Eastern UP focal hub, expanding public health setups, heavy child vaccine rollouts."
        },
        {
            "id": "terr-05",
            "name": "Varanasi",
            "doctorsCount": 390,
            "mrCount": 3,
            "competitorStrength": "Medium",
            "marketDemand": "Medium",
            "estimatedROI": 74,
            "topTherapeuticArea": "Neurology",
            "description": "Concentration of heritage universities and diagnostic setups, early technology adopters."
        },
        {
            "id": "terr-06",
            "name": "Prayagraj",
            "doctorsCount": 410,
            "mrCount": 1,
            "competitorStrength": "Low",
            "marketDemand": "High",
            "estimatedROI": 96,
            "topTherapeuticArea": "Cardiology",
            "description": "High concentration of government health setups and private clinics, severe lack of direct MR presence."
        },
        {
            "id": "terr-07",
            "name": "Agra",
            "doctorsCount": 320,
            "mrCount": 0,
            "competitorStrength": "Low",
            "marketDemand": "Medium",
            "estimatedROI": 82,
            "topTherapeuticArea": "Diabetes & Endocrinology",
            "description": "Developing private healthcare sectors, currently zero active MR coverage. Prime target."
        }
    ],
    "salesMetrics": {
        "monthlyTotalSales": [5800000, 6100000, 6500000, 6900000, 7300000, 7800000],
        "months": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        "categoryShare": {
            "Cardiology": 35,
            "Oncology": 28,
            "Neurology": 18,
            "Diabetes": 12,
            "Pediatrics": 7
        }
    },
    "products": [
        { "id": "prod-01", "name": "Cardiox-B", "specialty": "Cardiology", "description": "Beta-blocker for hypertension management." },
        { "id": "prod-02", "name": "OncoMed-3", "specialty": "Oncology", "description": "Targeted kinase inhibitor formulation." },
        { "id": "prod-03", "name": "GlucoGuard", "specialty": "Diabetes & Endocrinology", "description": "24-hour basal insulin profile." }
    ]
}

def init_db():
    if not os.path.exists(DB_FILE):
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # 1. Create tables
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS mrs (
                id TEXT PRIMARY KEY,
                name TEXT,
                specialty TEXT,
                experienceYears INTEGER,
                rating REAL,
                territory TEXT,
                status TEXT,
                doctorRelationships INTEGER,
                monthlySales INTEGER,
                email TEXT,
                phone TEXT,
                bio TEXT,
                colorTheme TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS doctors (
                id TEXT PRIMARY KEY,
                name TEXT,
                clinicName TEXT,
                specialty TEXT,
                region TEXT,
                address TEXT,
                availability TEXT, -- JSON array
                prescriptionPotential TEXT,
                preferredTime TEXT,
                phone TEXT,
                email TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS meetings (
                id TEXT PRIMARY KEY,
                mrId TEXT,
                doctorId TEXT,
                date TEXT,
                time TEXT,
                status TEXT,
                notes TEXT,
                FOREIGN KEY (mrId) REFERENCES mrs (id),
                FOREIGN KEY (doctorId) REFERENCES doctors (id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS territories (
                id TEXT PRIMARY KEY,
                name TEXT,
                doctorsCount INTEGER,
                mrCount INTEGER,
                competitorStrength TEXT,
                marketDemand TEXT,
                estimatedROI INTEGER,
                topTherapeuticArea TEXT,
                description TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT,
                specialty TEXT,
                description TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sales_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                monthlyTotalSales TEXT, -- JSON array
                months TEXT, -- JSON array
                categoryShare TEXT -- JSON object
            )
        ''')
        
        # 2. Seed default data
        for mr in DEFAULT_DATA["mrs"]:
            cursor.execute('''
                INSERT INTO mrs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (mr["id"], mr["name"], mr["specialty"], mr["experienceYears"], mr["rating"], 
                  mr["territory"], mr["status"], mr["doctorRelationships"], mr["monthlySales"], 
                  mr["email"], mr["phone"], mr["bio"], mr["colorTheme"]))
            
        for doc in DEFAULT_DATA["doctors"]:
            cursor.execute('''
                INSERT INTO doctors VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (doc["id"], doc["name"], doc["clinicName"], doc["specialty"], doc["region"], 
                  doc["address"], json.dumps(doc["availability"]), doc["prescriptionPotential"], 
                  doc["preferredTime"], doc["phone"], doc["email"]))
            
        for m in DEFAULT_DATA["meetings"]:
            cursor.execute('''
                INSERT INTO meetings VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (m["id"], m["mrId"], m["doctorId"], m["date"], m["time"], m["status"], m["notes"]))
            
        for t in DEFAULT_DATA["territories"]:
            cursor.execute('''
                INSERT INTO territories VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (t["id"], t["name"], t["doctorsCount"], t["mrCount"], t["competitorStrength"], 
                  t["marketDemand"], t["estimatedROI"], t["topTherapeuticArea"], t["description"]))
            
        for p in DEFAULT_DATA["products"]:
            cursor.execute('''
                INSERT INTO products VALUES (?, ?, ?, ?)
            ''', (p["id"], p["name"], p["specialty"], p["description"]))
            
        metrics = DEFAULT_DATA["salesMetrics"]
        cursor.execute('''
            INSERT INTO sales_metrics (monthlyTotalSales, months, categoryShare) VALUES (?, ?, ?)
        ''', (json.dumps(metrics["monthlyTotalSales"]), json.dumps(metrics["months"]), json.dumps(metrics["categoryShare"])))
        
        conn.commit()
        conn.close()
        print("SQLite database created and seeded successfully.")

def get_full_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Fetch MRs
    cursor.execute("SELECT * FROM mrs")
    mrs = [dict(row) for row in cursor.fetchall()]
    
    # Fetch Doctors
    cursor.execute("SELECT * FROM doctors")
    doctors = []
    for row in cursor.fetchall():
        d = dict(row)
        d["availability"] = json.loads(d["availability"])
        doctors.append(d)
        
    # Fetch Meetings
    cursor.execute("SELECT * FROM meetings")
    meetings = [dict(row) for row in cursor.fetchall()]
    
    # Fetch Territories
    cursor.execute("SELECT * FROM territories")
    territories = [dict(row) for row in cursor.fetchall()]
    
    # Fetch Products
    cursor.execute("SELECT * FROM products")
    products = [dict(row) for row in cursor.fetchall()]
    
    # Fetch Sales Metrics
    cursor.execute("SELECT * FROM sales_metrics ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    sales_metrics = {}
    if row:
        r = dict(row)
        sales_metrics = {
            "monthlyTotalSales": json.loads(r["monthlyTotalSales"]),
            "months": json.loads(r["months"]),
            "categoryShare": json.loads(r["categoryShare"])
        }
        
    conn.close()
    
    return {
        "mrs": mrs,
        "doctors": doctors,
        "meetings": meetings,
        "territories": territories,
        "products": products,
        "salesMetrics": sales_metrics
    }

class RESTRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        url = urlparse(self.path)
        if url.path == '/api/data':
            db = get_full_db()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(db).encode('utf-8'))
        else:
            super().do_GET()

    def do_POST(self):
        url = urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length).decode('utf-8')
        
        try:
            req_body = json.loads(post_data) if post_data else {}
        except Exception:
            self.send_error(400, "Invalid JSON body")
            return

        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()

        if url.path == '/api/products':
            # Get existing product count to generate ID
            cursor.execute("SELECT count(*) FROM products")
            count = cursor.fetchone()[0]
            prod_id = f"prod-{count + 1:02d}"
            
            # Ensure unique ID
            while True:
                cursor.execute("SELECT id FROM products WHERE id = ?", (prod_id,))
                if cursor.fetchone() is None:
                    break
                suffix = int(prod_id.split('-')[1]) + 1
                prod_id = f"prod-{suffix:02d}"
                
            cursor.execute('''
                INSERT INTO products (id, name, specialty, description)
                VALUES (?, ?, ?, ?)
            ''', (prod_id, req_body.get("name"), req_body.get("specialty"), req_body.get("description")))
            conn.commit()
            
            self.send_response(201)

        elif url.path == '/api/meetings':
            # Get existing meeting count to generate ID
            cursor.execute("SELECT count(*) FROM meetings")
            count = cursor.fetchone()[0]
            meet_id = f"meet-{count + 1:02d}"
            
            # Ensure unique ID
            while True:
                cursor.execute("SELECT id FROM meetings WHERE id = ?", (meet_id,))
                if cursor.fetchone() is None:
                    break
                suffix = int(meet_id.split('-')[1]) + 1
                meet_id = f"meet-{suffix:02d}"
                
            cursor.execute('''
                INSERT INTO meetings (id, mrId, doctorId, date, time, status, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (meet_id, req_body.get("mrId"), req_body.get("doctorId"), 
                  req_body.get("date"), req_body.get("time"), "pending", req_body.get("notes", "")))
            conn.commit()
            
            self.send_response(201)

        elif url.path == '/api/meetings/confirm':
            meet_id = req_body.get("meetingId")
            cursor.execute("SELECT id FROM meetings WHERE id = ?", (meet_id,))
            if cursor.fetchone():
                cursor.execute("UPDATE meetings SET status = 'scheduled' WHERE id = ?", (meet_id,))
                conn.commit()
                self.send_response(200)
            else:
                self.send_response(404)

        elif url.path == '/api/meetings/reschedule':
            meet_id = req_body.get("meetingId")
            new_time = req_body.get("time")
            cursor.execute("SELECT id FROM meetings WHERE id = ?", (meet_id,))
            if cursor.fetchone():
                cursor.execute("UPDATE meetings SET time = ?, status = 'scheduled' WHERE id = ?", (new_time, meet_id))
                conn.commit()
                self.send_response(200)
            else:
                self.send_response(404)

        elif url.path == '/api/meetings/complete':
            meet_id = req_body.get("meetingId")
            potential = req_body.get("potential", "Medium")
            deal_value = int(req_body.get("dealValue", 0))
            notes = req_body.get("notes", "")

            cursor.execute("SELECT mrId, doctorId FROM meetings WHERE id = ?", (meet_id,))
            meeting_row = cursor.fetchone()
            
            if meeting_row:
                mr_id = meeting_row[0]
                notes_compiled = f"[Prescription Potential: {potential}] {notes or 'Product presentation completed successfully.'}"
                
                # Update meeting status
                cursor.execute("UPDATE meetings SET status = 'completed', notes = ? WHERE id = ?", (notes_compiled, meet_id))
                
                # Update representative sales
                cursor.execute("UPDATE mrs SET monthlySales = monthlySales + ? WHERE id = ?", (deal_value, mr_id))
                
                # Update global sales metrics
                cursor.execute("SELECT id, monthlyTotalSales, months, categoryShare FROM sales_metrics ORDER BY id DESC LIMIT 1")
                metrics_row = cursor.fetchone()
                if metrics_row:
                    metrics_id = metrics_row[0]
                    sales = json.loads(metrics_row[1])
                    sales[5] += deal_value # June index
                    
                    cursor.execute("UPDATE sales_metrics SET monthlyTotalSales = ? WHERE id = ?", (json.dumps(sales), metrics_id))
                
                conn.commit()
                self.send_response(200)
            else:
                self.send_response(404)

        elif url.path == '/api/doctors':
            cursor.execute("SELECT count(*) FROM doctors")
            count = cursor.fetchone()[0]
            doc_id = f"doc-{count + 1:02d}"
            
            while True:
                cursor.execute("SELECT id FROM doctors WHERE id = ?", (doc_id,))
                if cursor.fetchone() is None:
                    break
                suffix = int(doc_id.split('-')[1]) + 1
                doc_id = f"doc-{suffix:02d}"
                
            cursor.execute('''
                INSERT INTO doctors (id, name, clinicName, specialty, region, address, availability, prescriptionPotential, preferredTime, phone, email)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (doc_id, req_body.get("name"), req_body.get("clinicName"), req_body.get("specialty"), 
                  req_body.get("region"), req_body.get("address"), json.dumps(req_body.get("availability", [])), 
                  req_body.get("prescriptionPotential", "Medium"), req_body.get("preferredTime"), 
                  req_body.get("phone", ""), req_body.get("email", "")))
            conn.commit()
            self.send_response(201)

        elif url.path == '/api/doctors/update':
            doc_id = req_body.get("id")
            cursor.execute("SELECT id FROM doctors WHERE id = ?", (doc_id,))
            if cursor.fetchone():
                cursor.execute('''
                    UPDATE doctors 
                    SET name=?, clinicName=?, specialty=?, region=?, address=?, availability=?, prescriptionPotential=?, preferredTime=?, phone=?, email=?
                    WHERE id=?
                ''', (req_body.get("name"), req_body.get("clinicName"), req_body.get("specialty"), 
                      req_body.get("region"), req_body.get("address"), json.dumps(req_body.get("availability", [])), 
                      req_body.get("prescriptionPotential"), req_body.get("preferredTime"), 
                      req_body.get("phone"), req_body.get("email"), doc_id))
                conn.commit()
                self.send_response(200)
            else:
                self.send_response(404)

        elif url.path == '/api/doctors/delete':
            doc_id = req_body.get("id")
            cursor.execute("SELECT id FROM doctors WHERE id = ?", (doc_id,))
            if cursor.fetchone():
                cursor.execute("DELETE FROM doctors WHERE id = ?", (doc_id,))
                
                # Cascade cancellations
                cursor.execute('''
                    UPDATE meetings 
                    SET status = 'cancelled', notes = '[System Alert] Meeting cancelled due to physician removal from CRM registry.'
                    WHERE doctorId = ? AND status IN ('pending', 'scheduled')
                ''', (doc_id,))
                
                conn.commit()
                self.send_response(200)
            else:
                self.send_response(404)

        elif url.path == '/api/mrs/reassign':
            mr_id = req_body.get("mrId")
            new_territory = req_body.get("territory")
            
            cursor.execute("SELECT territory FROM mrs WHERE id = ?", (mr_id,))
            row = cursor.fetchone()
            if row:
                old_territory = row[0]
                
                # Update MR's territory assignment
                cursor.execute("UPDATE mrs SET territory = ? WHERE id = ?", (new_territory, mr_id))
                
                # Update territories MR count
                cursor.execute("UPDATE territories SET mrCount = mrCount - 1 WHERE name = ?", (old_territory,))
                cursor.execute("UPDATE territories SET mrCount = mrCount + 1 WHERE name = ?", (new_territory,))
                
                conn.commit()
                self.send_response(200)
            else:
                self.send_response(404)

        else:
            self.send_response(404)
            self.end_headers()
            conn.close()
            return

        conn.close()
        
        # Build and send full updated database
        db = get_full_db()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(db).encode('utf-8'))

if __name__ == '__main__':
    init_db()
    with socketserver.TCPServer(("", PORT), RESTRequestHandler) as httpd:
        print(f"Serving Smart MR Agent platform on port {PORT} with SQLite persistence.")
        httpd.serve_forever()
