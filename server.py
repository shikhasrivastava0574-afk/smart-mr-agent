# server.py
import http.server
import socketserver
import json
import os
from urllib.parse import urlparse

PORT = 8000
DB_FILE = 'database.json'

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
            "preferredTime": "Morning (09:00 - 12:00)"
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
            "preferredTime": "Afternoon (14:00 - 17:00)"
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
            "preferredTime": "Morning (08:30 - 11:30)"
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
            "preferredTime": "Afternoon (13:00 - 16:00)"
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
            "preferredTime": "Morning (10:00 - 12:00)"
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
            "preferredTime": "Afternoon (15:00 - 17:00)"
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
            "preferredTime": "Afternoon (14:00 - 16:30)"
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

def load_db():
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, 'w') as f:
            json.dump(DEFAULT_DATA, f, indent=4)
        return DEFAULT_DATA
    try:
        with open(DB_FILE, 'r') as f:
            return json.load(f)
    except Exception:
        return DEFAULT_DATA

def save_db(data):
    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=4)

class RESTRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Prevent browser caching of static resources
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        url = urlparse(self.path)
        if url.path == '/api/data':
            db = load_db()
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

        db = load_db()

        if url.path == '/api/products':
            new_prod = {
                "id": f"prod-{len(db['products']) + 1:02d}",
                "name": req_body.get("name"),
                "specialty": req_body.get("specialty"),
                "description": req_body.get("description")
            }
            while any(p["id"] == new_prod["id"] for p in db["products"]):
                suffix = int(new_prod["id"].split('-')[1]) + 1
                new_prod["id"] = f"prod-{suffix:02d}"
                
            db["products"].append(new_prod)
            save_db(db)
            
            self.send_response(201)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(db).encode('utf-8'))

        elif url.path == '/api/meetings':
            new_meet = {
                "id": f"meet-{len(db['meetings']) + 1:02d}",
                "mrId": req_body.get("mrId"),
                "doctorId": req_body.get("doctorId"),
                "date": req_body.get("date"),
                "time": req_body.get("time"),
                "status": "pending",
                "notes": req_body.get("notes", "")
            }
            while any(m["id"] == new_meet["id"] for m in db["meetings"]):
                suffix = int(new_meet["id"].split('-')[1]) + 1
                new_meet["id"] = f"meet-{suffix:02d}"
                
            db["meetings"].append(new_meet)
            save_db(db)

            self.send_response(201)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(db).encode('utf-8'))

        elif url.path == '/api/meetings/confirm':
            meet_id = req_body.get("meetingId")
            meet = next((m for m in db["meetings"] if m["id"] == meet_id), None)
            if meet:
                meet["status"] = "scheduled"
                save_db(db)
                self.send_response(200)
            else:
                self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(db).encode('utf-8'))

        elif url.path == '/api/meetings/complete':
            meet_id = req_body.get("meetingId")
            potential = req_body.get("potential", "Medium")
            deal_value = int(req_body.get("dealValue", 0))
            notes = req_body.get("notes", "")

            meet = next((m for m in db["meetings"] if m["id"] == meet_id), None)
            if meet:
                meet["status"] = "completed"
                meet["notes"] = f"[Prescription Potential: {potential}] {notes or 'Product presentation completed successfully.'}"
                
                mr = next((m for m in db["mrs"] if m["id"] == meet["mrId"]), None)
                if mr:
                    mr["monthlySales"] += deal_value
                
                db["salesMetrics"]["monthlyTotalSales"][5] += deal_value
                
                save_db(db)
                self.send_response(200)
            else:
                self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(db).encode('utf-8'))

        elif url.path == '/api/meetings/reschedule':
            meet_id = req_body.get("meetingId")
            new_time = req_body.get("time")
            meet = next((m for m in db["meetings"] if m["id"] == meet_id), None)
            if meet:
                meet["time"] = new_time
                meet["status"] = "scheduled"
                save_db(db)
                self.send_response(200)
            else:
                self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(db).encode('utf-8'))

        else:
            self.send_error(404, "Endpoint not found")

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), RESTRequestHandler) as httpd:
        print(f"Serving Smart MR Agent platform on port {PORT} with REST persistence.")
        httpd.serve_forever()
