export type EmployeeStatus = 'active' | 'on_leave' | 'terminated' | 'probation';

export type Department =
  | 'Engineering'
  | 'Product'
  | 'Design'
  | 'Marketing'
  | 'Sales'
  | 'Human Resources'
  | 'Finance'
  | 'Operations';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: Department;
  status: EmployeeStatus;
  startDate: string;
  avatarUrl?: string;
  phone?: string;
  location?: string;
}
