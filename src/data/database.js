// Generated from vyaparmitra-database.xlsx (the backend workbook) on 2026-09-20.
// Regenerate rather than hand-editing: every value below is copied verbatim from a sheet.
// All GSTINs in the workbook are fictitious.

/** Sheet: Customers — one row per MSME tenant on the platform. */
export const customers = [
  {
    "name": "Ramesh Auto Components",
    "vendorId": "VM-0001",
    "gstin": "27AAECR1234R1Z5",
    "serviceStart": "2026-03-15",
    "nextBilling": "2026-10-15",
    "totalBilled": 36000,
    "plan": "Standard"
  },
  {
    "name": "Shakti Textiles",
    "vendorId": "VM-0002",
    "gstin": "24AAFCS5678T1Z8",
    "serviceStart": "2026-05-01",
    "nextBilling": "2026-10-01",
    "totalBilled": 10000,
    "plan": "Basic"
  },
  {
    "name": "Deccan Pipes & Fittings",
    "vendorId": "VM-0003",
    "gstin": "36AAGCD9012P1Z3",
    "serviceStart": "2026-04-10",
    "nextBilling": "2026-10-10",
    "totalBilled": 27000,
    "plan": "Standard"
  }
];

/** Sheet: Users — login key is the PAIR vendorId + employeeId; ADMIN rows have global scope. */
export const users = [
  {
    "vendorId": "VM-0001",
    "employeeId": "E001",
    "name": "Ramesh Patel",
    "role": "Owner"
  },
  {
    "vendorId": "VM-0001",
    "employeeId": "E002",
    "name": "Suresh Kadam",
    "role": "Billing Clerk"
  },
  {
    "vendorId": "VM-0001",
    "employeeId": "E003",
    "name": "Anita Joshi",
    "role": "Warehouse Clerk"
  },
  {
    "vendorId": "VM-0001",
    "employeeId": "E004",
    "name": "Deepak Rao",
    "role": "Finance"
  },
  {
    "vendorId": "VM-0002",
    "employeeId": "E001",
    "name": "Kavita Shah",
    "role": "Owner"
  },
  {
    "vendorId": "VM-0002",
    "employeeId": "E002",
    "name": "Rohit Mehta",
    "role": "Billing Clerk"
  },
  {
    "vendorId": "VM-0002",
    "employeeId": "E003",
    "name": "Meena Desai",
    "role": "Warehouse Clerk"
  },
  {
    "vendorId": "VM-0003",
    "employeeId": "E001",
    "name": "Venkat Rao",
    "role": "Owner"
  },
  {
    "vendorId": "VM-0003",
    "employeeId": "E002",
    "name": "Priya Nair",
    "role": "Billing Clerk"
  },
  {
    "vendorId": "VM-0003",
    "employeeId": "E003",
    "name": "Anand Kumar",
    "role": "Finance"
  },
  {
    "vendorId": "ADMIN",
    "employeeId": "B001",
    "name": "Pratik Singh",
    "role": "Backend (global access)"
  },
  {
    "vendorId": "ADMIN",
    "employeeId": "B002",
    "name": "Ops Admin",
    "role": "Backend (global access)"
  }
];

/** Sheets: Cust{1,2,3}_Vendors — suppliers, keyed by tenant.
 *  Near-duplicate rows (same GSTIN, different supplier id) are kept on purpose: the workbook
 *  flags them as de-duplication test data. */
export const suppliersByVendor = {
  "VM-0001": [
    {
      "name": "Pune Steel Traders",
      "supplierId": "SUP-0001",
      "gstin": "27AABFP1234K1Z2",
      "category": "Raw Material – Steel",
      "paymentTermsDays": 60
    },
    {
      "name": "Deccan Fasteners",
      "supplierId": "SUP-0002",
      "gstin": "27AACFD5678L1Z9",
      "category": "Components – Fasteners",
      "paymentTermsDays": 45
    },
    {
      "name": "Bharat Rubber Works",
      "supplierId": "SUP-0003",
      "gstin": "27AADFB9012M1Z4",
      "category": "Raw Material – Rubber",
      "paymentTermsDays": 30
    },
    {
      "name": "Maharashtra Paints & Coatings",
      "supplierId": "SUP-0004",
      "gstin": "27AAEFM3456N1Z7",
      "category": "Consumables – Paint",
      "paymentTermsDays": 30
    },
    {
      "name": "Pune Steel Trader",
      "supplierId": "SUP-0005",
      "gstin": "27AABFP1234K1Z2",
      "category": "Raw Material – Steel",
      "paymentTermsDays": 60
    },
    {
      "name": "Sahyadri Logistics",
      "supplierId": "SUP-0006",
      "gstin": "27AAFFS7890P1Z1",
      "category": "Services – Transport",
      "paymentTermsDays": 15
    }
  ],
  "VM-0002": [
    {
      "name": "Surat Yarn Mills",
      "supplierId": "SUP-0001",
      "gstin": "24AABFS1111A1Z3",
      "category": "Raw Material – Yarn",
      "paymentTermsDays": 45
    },
    {
      "name": "Gujarat Dyes & Chemicals",
      "supplierId": "SUP-0002",
      "gstin": "24AACFG2222B1Z6",
      "category": "Raw Material – Dyes",
      "paymentTermsDays": 30
    },
    {
      "name": "Silk Route Traders",
      "supplierId": "SUP-0003",
      "gstin": "24AADFS3333C1Z9",
      "category": "Raw Material – Silk",
      "paymentTermsDays": 60
    },
    {
      "name": "Western Packaging Co",
      "supplierId": "SUP-0004",
      "gstin": "24AAEFW4444D1Z2",
      "category": "Consumables – Packaging",
      "paymentTermsDays": 30
    },
    {
      "name": "Surat Yarn Mill",
      "supplierId": "SUP-0005",
      "gstin": "24AABFS1111A1Z3",
      "category": "Raw Material – Yarn",
      "paymentTermsDays": 45
    }
  ],
  "VM-0003": [
    {
      "name": "Telangana Polymers",
      "supplierId": "SUP-0001",
      "gstin": "36AABFT1111E1Z5",
      "category": "Raw Material – PVC Resin",
      "paymentTermsDays": 60
    },
    {
      "name": "South Metal Works",
      "supplierId": "SUP-0002",
      "gstin": "36AACFS2222F1Z8",
      "category": "Raw Material – Metal",
      "paymentTermsDays": 45
    },
    {
      "name": "Godavari Chemicals",
      "supplierId": "SUP-0003",
      "gstin": "36AADFG3333G1Z1",
      "category": "Consumables – Adhesive",
      "paymentTermsDays": 30
    },
    {
      "name": "Charminar Transport",
      "supplierId": "SUP-0004",
      "gstin": "36AAEFC4444H1Z4",
      "category": "Services – Transport",
      "paymentTermsDays": 15
    }
  ]
};

/** Sheets: Cust{1,2,3}_Items — goods sold, keyed by tenant. gstRate is a fraction (0.28 = 28%). */
export const itemsByVendor = {
  "VM-0001": [
    {
      "name": "Brake Disc",
      "code": "ITM-0001",
      "unit": "Nos",
      "unitPrice": 850,
      "hsn": "8708",
      "gstRate": 0.28
    },
    {
      "name": "Control Arm",
      "code": "ITM-0002",
      "unit": "Nos",
      "unitPrice": 1250,
      "hsn": "8708",
      "gstRate": 0.28
    },
    {
      "name": "Suspension Bracket",
      "code": "ITM-0003",
      "unit": "Nos",
      "unitPrice": 480,
      "hsn": "8708",
      "gstRate": 0.28
    },
    {
      "name": "Steering Knuckle",
      "code": "ITM-0004",
      "unit": "Nos",
      "unitPrice": 2100,
      "hsn": "8708",
      "gstRate": 0.28
    },
    {
      "name": "Wheel Hub Assembly",
      "code": "ITM-0005",
      "unit": "Nos",
      "unitPrice": 1650,
      "hsn": "8708",
      "gstRate": 0.28
    }
  ],
  "VM-0002": [
    {
      "name": "Cotton Fabric Roll",
      "code": "ITM-0001",
      "unit": "Mtr",
      "unitPrice": 120,
      "hsn": "5208",
      "gstRate": 0.05
    },
    {
      "name": "Polyester Blend Roll",
      "code": "ITM-0002",
      "unit": "Mtr",
      "unitPrice": 95,
      "hsn": "5407",
      "gstRate": 0.05
    },
    {
      "name": "Silk Fabric Roll",
      "code": "ITM-0003",
      "unit": "Mtr",
      "unitPrice": 340,
      "hsn": "5007",
      "gstRate": 0.05
    },
    {
      "name": "Printed Cotton Roll",
      "code": "ITM-0004",
      "unit": "Mtr",
      "unitPrice": 160,
      "hsn": "5208",
      "gstRate": 0.05
    },
    {
      "name": "Denim Roll",
      "code": "ITM-0005",
      "unit": "Mtr",
      "unitPrice": 210,
      "hsn": "5209",
      "gstRate": 0.05
    }
  ],
  "VM-0003": [
    {
      "name": "PVC Pipe 4 inch",
      "code": "ITM-0001",
      "unit": "Mtr",
      "unitPrice": 180,
      "hsn": "3917",
      "gstRate": 0.18
    },
    {
      "name": "CPVC Pipe 1 inch",
      "code": "ITM-0002",
      "unit": "Mtr",
      "unitPrice": 95,
      "hsn": "3917",
      "gstRate": 0.18
    },
    {
      "name": "Elbow Joint 90deg",
      "code": "ITM-0003",
      "unit": "Nos",
      "unitPrice": 35,
      "hsn": "3917",
      "gstRate": 0.18
    },
    {
      "name": "T-Joint",
      "code": "ITM-0004",
      "unit": "Nos",
      "unitPrice": 42,
      "hsn": "3917",
      "gstRate": 0.18
    },
    {
      "name": "Ball Valve",
      "code": "ITM-0005",
      "unit": "Nos",
      "unitPrice": 220,
      "hsn": "8481",
      "gstRate": 0.18
    }
  ]
};

/** Sheet: Master_Score — the backend weighted model.
 *  Held as data only: the MSME-facing UI shows a readiness STATUS, never this number. */
export const scoreModel = {
  "weights": {
    "onTime": 0.35,
    "verified": 0.25,
    "volume": 0.2,
    "diversification": 0.2
  },
  "volumeTargetLakh": 50,
  "thresholds": {
    "strong": 75,
    "improving": 50
  },
  "perCustomer": [
    {
      "vendorId": "VM-0001",
      "onTimeShare": 0.88,
      "verifiedShare": 0.82,
      "monthlyVolumeLakh": 42,
      "buyerConcentration": 0.35,
      "weightedScore": 81.1,
      "readinessBand": "Strong"
    },
    {
      "vendorId": "VM-0002",
      "onTimeShare": 0.48,
      "verifiedShare": 0.4,
      "monthlyVolumeLakh": 14,
      "buyerConcentration": 0.65,
      "weightedScore": 39.4,
      "readinessBand": "Needs Attention"
    },
    {
      "vendorId": "VM-0003",
      "onTimeShare": 0.72,
      "verifiedShare": 0.68,
      "monthlyVolumeLakh": 30,
      "buyerConcentration": 0.42,
      "weightedScore": 65.8,
      "readinessBand": "Improving"
    }
  ]
};

/** Single-tenant prototype: the plant this build is signed in as. */
export const ACTIVE_VENDOR_ID = 'VM-0001';

export const activeCustomer = customers.find((c) => c.vendorId === ACTIVE_VENDOR_ID);
export const activeUsers = users.filter((u) => u.vendorId === ACTIVE_VENDOR_ID);
export const activeSuppliers = suppliersByVendor[ACTIVE_VENDOR_ID];
export const activeItems = itemsByVendor[ACTIVE_VENDOR_ID];
