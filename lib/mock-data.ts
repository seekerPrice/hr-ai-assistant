import { Employee } from '@/app/types/employee';

// Document types (for later use)
export interface Document {
  id: string;
  created_at: string;
  employee_id: string;
  file_url: string;
  doc_type: 'mykad' | 'passport' | 'visa' | 'certificate';
  doc_number: string | null;
  expiry_date: string | null;
  issuing_country: string;
  is_verified: boolean;
  ocr_data: Record<string, unknown>;
}

// Mock employees matching app/types/employee.ts
export const mockEmployees: Employee[] = [
  {
    id: 'emp-001',
    firstName: 'Ahmad',
    lastName: 'Ibrahim',
    email: 'ahmad.ibrahim@company.com',
    role: 'Senior Developer',
    department: 'Engineering',
    status: 'active',
    startDate: '2024-01-15',
    phone: '+60 12-345 6789',
    location: 'Kuala Lumpur',
  },
  {
    id: 'emp-002',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@company.com',
    role: 'Financial Analyst',
    department: 'Finance',
    status: 'active',
    startDate: '2024-02-20',
    phone: '+60 12-987 6543',
    location: 'Kuala Lumpur',
  },
  {
    id: 'emp-003',
    firstName: 'Wei Ming',
    lastName: 'Tan',
    email: 'weiming.tan@company.com',
    role: 'Marketing Manager',
    department: 'Marketing',
    status: 'active',
    startDate: '2024-03-10',
    phone: '+60 11-222 3333',
    location: 'Petaling Jaya',
  },
  {
    id: 'emp-004',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@company.com',
    role: 'Tech Lead',
    department: 'Engineering',
    status: 'active',
    startDate: '2024-04-05',
    phone: '+60 17-888 9999',
    location: 'Kuala Lumpur',
  },
  {
    id: 'emp-005',
    firstName: 'Nurul',
    lastName: 'Aisyah',
    email: 'nurul.aisyah@company.com',
    role: 'HR Executive',
    department: 'Human Resources',
    status: 'active',
    startDate: '2024-05-12',
    phone: '+60 19-555 4444',
    location: 'Cyberjaya',
  },
  {
    id: 'emp-006',
    firstName: 'Raj',
    lastName: 'Kumar',
    email: 'raj.kumar@company.com',
    role: 'Product Manager',
    department: 'Product',
    status: 'on_leave',
    startDate: '2023-08-01',
    phone: '+60 16-111 2222',
    location: 'Kuala Lumpur',
  },
  {
    id: 'emp-007',
    firstName: 'Sarah',
    lastName: 'Lee',
    email: 'sarah.lee@company.com',
    role: 'UX Designer',
    department: 'Design',
    status: 'probation',
    startDate: '2025-01-10',
    phone: '+60 18-777 6666',
    location: 'Bangsar',
  },
];

export const mockDocuments: Document[] = [
  // Ahmad - MyKad (no expiry)
  {
    id: 'doc-001',
    created_at: '2024-01-15T08:30:00Z',
    employee_id: 'emp-001',
    file_url: '/mock/mykad-ahmad.pdf',
    doc_type: 'mykad',
    doc_number: '880515-14-5678',
    expiry_date: null,
    issuing_country: 'MYS',
    is_verified: true,
    ocr_data: {
      address: '123 Jalan Bukit Bintang, 55100 Kuala Lumpur',
      race: 'Malay',
      religion: 'Islam',
    },
  },
  // Priya - Passport (expiring soon!)
  {
    id: 'doc-002',
    created_at: '2024-02-20T10:00:00Z',
    employee_id: 'emp-002',
    file_url: '/mock/passport-priya.pdf',
    doc_type: 'passport',
    doc_number: 'K1234567',
    expiry_date: '2025-03-15',
    issuing_country: 'IND',
    is_verified: true,
    ocr_data: {
      birthplace: 'Mumbai, India',
      father_name: 'Raj Sharma',
    },
  },
  // Priya - Work Visa (expiring in 30 days!)
  {
    id: 'doc-003',
    created_at: '2024-02-21T09:00:00Z',
    employee_id: 'emp-002',
    file_url: '/mock/visa-priya.pdf',
    doc_type: 'visa',
    doc_number: 'V-2024-98765',
    expiry_date: '2025-03-01',
    issuing_country: 'MYS',
    is_verified: true,
    ocr_data: {
      visa_type: 'Employment Pass',
      employer: 'TechCorp Sdn Bhd',
    },
  },
  // Wei Ming - MyKad (unverified)
  {
    id: 'doc-004',
    created_at: '2024-03-10T10:30:00Z',
    employee_id: 'emp-003',
    file_url: '/mock/mykad-weiming.pdf',
    doc_type: 'mykad',
    doc_number: '900822-08-1234',
    expiry_date: null,
    issuing_country: 'MYS',
    is_verified: false,
    ocr_data: {
      address: '45 Jalan SS2/55, 47300 Petaling Jaya, Selangor',
      race: 'Chinese',
    },
  },
  // John - Passport & Visa
  {
    id: 'doc-005',
    created_at: '2024-04-05T11:30:00Z',
    employee_id: 'emp-004',
    file_url: '/mock/passport-john.pdf',
    doc_type: 'passport',
    doc_number: '567890123',
    expiry_date: '2028-06-20',
    issuing_country: 'USA',
    is_verified: true,
    ocr_data: {
      birthplace: 'California, USA',
    },
  },
  {
    id: 'doc-006',
    created_at: '2024-04-06T08:00:00Z',
    employee_id: 'emp-004',
    file_url: '/mock/visa-john.pdf',
    doc_type: 'visa',
    doc_number: 'V-2024-11111',
    expiry_date: '2026-04-05',
    issuing_country: 'MYS',
    is_verified: true,
    ocr_data: {
      visa_type: 'Employment Pass',
      employer: 'TechCorp Sdn Bhd',
    },
  },
  // Nurul - MyKad + Certificate
  {
    id: 'doc-007',
    created_at: '2024-05-12T14:30:00Z',
    employee_id: 'emp-005',
    file_url: '/mock/mykad-nurul.pdf',
    doc_type: 'mykad',
    doc_number: '950310-14-9876',
    expiry_date: null,
    issuing_country: 'MYS',
    is_verified: true,
    ocr_data: {
      address: '78 Jalan Ampang, 50450 Kuala Lumpur',
      race: 'Malay',
      religion: 'Islam',
    },
  },
  {
    id: 'doc-008',
    created_at: '2024-05-13T09:00:00Z',
    employee_id: 'emp-005',
    file_url: '/mock/cert-nurul.pdf',
    doc_type: 'certificate',
    doc_number: 'HRDF-2024-001',
    expiry_date: '2025-05-13',
    issuing_country: 'MYS',
    is_verified: false,
    ocr_data: {
      certificate_name: 'HRDF Certified Trainer',
      issuing_body: 'Human Resources Development Fund',
    },
  },
];

// Helper functions
export function getDocumentsWithEmployees() {
  return mockDocuments.map((doc) => ({
    ...doc,
    employee: mockEmployees.find((emp) => emp.id === doc.employee_id)!,
  }));
}

export function getExpiringDocuments(withinDays: number = 30) {
  const today = new Date();
  const futureDate = new Date(today.getTime() + withinDays * 24 * 60 * 60 * 1000);

  return getDocumentsWithEmployees().filter((doc) => {
    if (!doc.expiry_date) return false;
    const expiryDate = new Date(doc.expiry_date);
    return expiryDate <= futureDate && expiryDate >= today;
  });
}

export function getUnverifiedDocuments() {
  return getDocumentsWithEmployees().filter((doc) => !doc.is_verified);
}

export function getDocumentsByEmployee(employeeId: string) {
  return mockDocuments.filter((doc) => doc.employee_id === employeeId);
}
