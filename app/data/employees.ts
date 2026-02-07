import { Employee } from '@/app/types/employee';
import { mockEmployees } from '@/lib/mock-data';

export async function getEmployees(): Promise<Employee[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockEmployees.sort((a, b) => a.lastName.localeCompare(b.lastName));
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockEmployees.find((emp) => emp.id === id) ?? null;
}

export async function createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const newEmployee: Employee = {
    ...employee,
    id: `emp-${String(mockEmployees.length + 1).padStart(3, '0')}`,
  };
  mockEmployees.push(newEmployee);
  return newEmployee;
}

export async function updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const index = mockEmployees.findIndex((emp) => emp.id === id);
  if (index === -1) return null;
  mockEmployees[index] = { ...mockEmployees[index], ...updates };
  return mockEmployees[index];
}

export async function deleteEmployee(id: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const index = mockEmployees.findIndex((emp) => emp.id === id);
  if (index === -1) return false;
  mockEmployees.splice(index, 1);
  return true;
}
