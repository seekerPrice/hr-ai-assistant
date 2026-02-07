export interface Employee {
  id: string;
  created_at: string;
  name: string;
  email: string;
  department: string;
  position: string;
  nationality: string;
}

export interface Document {
  id: string;
  created_at: string;
  employee_id: string;
  file_url: string;
  doc_type: 'mykad' | 'passport' | 'visa' | 'certificate';
  doc_number: string | null;
  expiry_date: string | null; // ISO date string
  issuing_country: string;
  is_verified: boolean;
  ocr_data: Record<string, unknown>;
}

export type DocumentWithEmployee = Document & {
  employee: Employee;
};
