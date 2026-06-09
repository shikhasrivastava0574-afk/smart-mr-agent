/* js/data.js */

export const MR_DATA = [
  {
    id: "mr-01",
    name: "Priya Sharma",
    specialty: "Cardiology",
    experienceYears: 6,
    rating: 4.9,
    territory: "Lucknow",
    status: "Active",
    doctorRelationships: 48,
    monthlySales: 1024000, // INR (Rs.)
    email: "p.sharma@pharmalabs.co.in",
    phone: "+91 98765 01234",
    bio: "Specialist in cardiovascular therapies. Recognized for maintaining high physician retention rates in Lucknow Metro.",
    colorTheme: "var(--agent-matching)"
  },
  {
    id: "mr-02",
    name: "Rajesh Kumar",
    specialty: "Oncology",
    experienceYears: 8,
    rating: 4.8,
    territory: "Noida",
    status: "Active",
    doctorRelationships: 32,
    monthlySales: 1589000,
    email: "r.kumar@pharmalabs.co.in",
    phone: "+91 98765 05678",
    bio: "Oncology clinical background. Expertise in complex therapeutic sales, handling major hospital networks in Noida/NCR.",
    colorTheme: "var(--agent-report)"
  },
  {
    id: "mr-03",
    name: "Dr. Amit Patel",
    specialty: "Neurology",
    experienceYears: 5,
    rating: 4.9,
    territory: "Varanasi",
    status: "Busy",
    doctorRelationships: 42,
    monthlySales: 1145000,
    email: "a.patel@pharmalabs.co.in",
    phone: "+91 98765 09988",
    bio: "Former clinical neurologist. Transitions science into high-impact clinical conversations. Varanasi territory owner.",
    colorTheme: "var(--agent-scheduling)"
  },
  {
    id: "mr-04",
    name: "Vikram Singh",
    specialty: "Diabetes & Endocrinology",
    experienceYears: 4,
    rating: 4.7,
    territory: "Kanpur",
    status: "Active",
    doctorRelationships: 55,
    monthlySales: 898000,
    email: "v.singh@pharmalabs.co.in",
    phone: "+91 98765 04411",
    bio: "Strong background in insulin therapies and glucose monitoring tech. Broad reach in the Kanpur medical district.",
    colorTheme: "var(--agent-analytics)"
  },
  {
    id: "mr-05",
    name: "Ananya Gupta",
    specialty: "Pediatrics",
    experienceYears: 7,
    rating: 4.9,
    territory: "Gorakhpur",
    status: "Active",
    doctorRelationships: 60,
    monthlySales: 912000,
    email: "a.gupta@pharmalabs.co.in",
    phone: "+91 98765 03377",
    bio: "Pediatric product champion. Excellent record with independent clinics and vaccine rollouts in Gorakhpur.",
    colorTheme: "var(--agent-system)"
  },
  {
    id: "mr-06",
    name: "Rahul Verma",
    specialty: "Cardiology",
    experienceYears: 3,
    rating: 4.6,
    territory: "Noida",
    status: "Active",
    doctorRelationships: 25,
    monthlySales: 785000,
    email: "r.verma@pharmalabs.co.in",
    phone: "+91 98765 07766",
    bio: "Energetic newcomer with specialized training in electrophysiology products. Expanding quickly in Noida Sector 62.",
    colorTheme: "var(--agent-matching)"
  }
];

export const DOCTORS_DATA = [
  {
    id: "doc-01",
    name: "Dr. Alok Misra",
    clinicName: "Lucknow Cardiology Institute",
    specialty: "Cardiology",
    region: "Lucknow",
    address: "Hazratganj, Lucknow, UP",
    availability: ["Monday", "Wednesday", "Friday"],
    prescriptionPotential: "High",
    preferredTime: "Morning (09:00 - 12:00)",
    phone: "+91 99345 67890",
    email: "alok.misra@lucknowcardio.org"
  },
  {
    id: "doc-02",
    name: "Dr. Sunita Rao",
    clinicName: "Noida Cancer Care & Research",
    specialty: "Oncology",
    region: "Noida",
    address: "Sector 62, Noida, UP",
    availability: ["Tuesday", "Thursday"],
    prescriptionPotential: "High",
    preferredTime: "Afternoon (14:00 - 17:00)",
    phone: "+91 98123 45678",
    email: "sunita.rao@noidacancercare.com"
  },
  {
    id: "doc-03",
    name: "Dr. Rakesh Dwivedi",
    clinicName: "Kashi Neuro Center",
    specialty: "Neurology",
    region: "Varanasi",
    address: "Lanka, Varanasi, UP",
    availability: ["Monday", "Thursday", "Friday"],
    prescriptionPotential: "High",
    preferredTime: "Morning (08:30 - 11:30)",
    phone: "+91 97234 56789",
    email: "rakesh.dwivedi@kashineuro.in"
  },
  {
    id: "doc-04",
    name: "Dr. Vandana Asthana",
    clinicName: "Kanpur Endocrine Hospital",
    specialty: "Diabetes & Endocrinology",
    region: "Kanpur",
    address: "Swaroop Nagar, Kanpur, UP",
    availability: ["Tuesday", "Wednesday"],
    prescriptionPotential: "Medium",
    preferredTime: "Afternoon (13:00 - 16:00)",
    phone: "+91 96345 67890",
    email: "v.asthana@kanpurendocrine.com"
  },
  {
    id: "doc-05",
    name: "Dr. Harish Chandra",
    clinicName: "Gorakhpur Children's Hospital",
    specialty: "Pediatrics",
    region: "Gorakhpur",
    address: "Golghar, Gorakhpur, UP",
    availability: ["Wednesday", "Friday"],
    prescriptionPotential: "High",
    preferredTime: "Morning (10:00 - 12:00)",
    phone: "+91 95456 78901",
    email: "harish.c@gorakhpurchildren.org"
  },
  {
    id: "doc-06",
    name: "Dr. Neha Saxena",
    clinicName: "Awadh Heart Clinic",
    specialty: "Cardiology",
    region: "Lucknow",
    address: "Gomti Nagar, Lucknow, UP",
    availability: ["Tuesday", "Friday"],
    prescriptionPotential: "Medium",
    preferredTime: "Afternoon (15:00 - 17:00)",
    phone: "+91 94567 89012",
    email: "neha.saxena@awadhheart.com"
  },
  {
    id: "doc-07",
    name: "Dr. S. K. Pathak",
    clinicName: "Sangam Diagnostic Center",
    specialty: "Neurology",
    region: "Prayagraj",
    address: "Civil Lines, Prayagraj, UP",
    availability: ["Wednesday", "Thursday"],
    prescriptionPotential: "High",
    preferredTime: "Afternoon (14:00 - 16:30)",
    phone: "+91 93678 90123",
    email: "skpathak@sangamdiagnostics.co.in"
  }
];

export const MEETINGS_DATA = [
  {
    id: "meet-01",
    mrId: "mr-01",
    doctorId: "doc-01",
    date: "2026-06-12",
    time: "10:30",
    status: "scheduled",
    notes: "Introducing Cardiox-B beta-blockers clinical study results."
  },
  {
    id: "meet-02",
    mrId: "mr-02",
    doctorId: "doc-02",
    date: "2026-06-15",
    time: "15:00",
    status: "scheduled",
    notes: "Presenting oncology pipeline phase-3 clinical trial publications."
  },
  {
    id: "meet-03",
    mrId: "mr-03",
    doctorId: "doc-03",
    date: "2026-06-11",
    time: "09:30",
    status: "scheduled",
    notes: "Demonstrating new neuro-regenerative injector kits."
  },
  {
    id: "meet-04",
    mrId: "mr-04",
    doctorId: "doc-04",
    date: "2026-06-08",
    time: "14:00",
    status: "completed",
    notes: "Completed initial introduction of GlucoGuard 24hr monitoring. Doctor requested samples."
  }
];

export const TERRITORIES_DATA = [
  {
    id: "terr-01",
    name: "Lucknow",
    doctorsCount: 420,
    mrCount: 4,
    competitorStrength: "High",
    marketDemand: "High",
    estimatedROI: 85,
    topTherapeuticArea: "Cardiology",
    description: "Capital city, primary medical hub, highly saturated hospital systems, intense competition."
  },
  {
    id: "terr-02",
    name: "Noida",
    doctorsCount: 850,
    mrCount: 12,
    competitorStrength: "High",
    marketDemand: "High",
    estimatedROI: 92,
    topTherapeuticArea: "Oncology",
    description: "Rapidly expanding NCR zone, advanced cancer facilities, crucial corporate medical hub."
  },
  {
    id: "terr-03",
    name: "Kanpur",
    doctorsCount: 510,
    mrCount: 5,
    competitorStrength: "Medium",
    marketDemand: "High",
    estimatedROI: 78,
    topTherapeuticArea: "Diabetes & Endocrinology",
    description: "High density patient base, strong diabetic treatment demand, moderate competition."
  },
  {
    id: "terr-04",
    name: "Gorakhpur",
    doctorsCount: 480,
    mrCount: 3,
    competitorStrength: "Medium",
    marketDemand: "High",
    estimatedROI: 89,
    topTherapeuticArea: "Pediatrics",
    description: "Eastern UP focal hub, expanding public health setups, heavy child vaccine rollouts."
  },
  {
    id: "terr-05",
    name: "Varanasi",
    doctorsCount: 390,
    mrCount: 3,
    competitorStrength: "Medium",
    marketDemand: "Medium",
    estimatedROI: 74,
    topTherapeuticArea: "Neurology",
    description: "Concentration of heritage universities and diagnostic setups, early technology adopters."
  },
  {
    id: "terr-06",
    name: "Prayagraj",
    doctorsCount: 410,
    mrCount: 1, /* Underserved! */
    competitorStrength: "Low",
    marketDemand: "High",
    estimatedROI: 96, /* Extremely High ROI recommended by agent */
    topTherapeuticArea: "Cardiology",
    description: "High concentration of government health setups and private clinics, severe lack of direct MR presence."
  },
  {
    id: "terr-07",
    name: "Agra",
    doctorsCount: 320,
    mrCount: 0, /* Underserved! */
    competitorStrength: "Low",
    marketDemand: "Medium",
    estimatedROI: 82,
    topTherapeuticArea: "Diabetes & Endocrinology",
    description: "Developing private healthcare sectors, currently zero active MR coverage. Prime target."
  }
];

export const SALES_METRICS = {
  monthlyTotalSales: [5800000, 6100000, 6500000, 6900000, 7300000, 7800000], // INR
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  categoryShare: {
    "Cardiology": 35,
    "Oncology": 28,
    "Neurology": 18,
    "Diabetes": 12,
    "Pediatrics": 7
  }
};

export const PRODUCTS_DATA = [
  { id: "prod-01", name: "Cardiox-B", specialty: "Cardiology", description: "Beta-blocker for hypertension management." },
  { id: "prod-02", name: "OncoMed-3", specialty: "Oncology", description: "Targeted kinase inhibitor formulation." },
  { id: "prod-03", name: "GlucoGuard", specialty: "Diabetes & Endocrinology", description: "24-hour basal insulin profile." }
];
