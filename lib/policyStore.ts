export interface PolicyClause {
  id: string;
  text: string;
  source: string;
  page?: number;
}

export interface PolicyDocument {
  id: string;
  title: string;
  clauses: PolicyClause[];
}

const defaultPolicies: PolicyDocument[] = [
  {
    id: "expense-policy",
    title: "Expense Policy",
    clauses: [
      {
        id: "expense-coworking",
        text:
          "Coworking space fees are reimbursable up to $350 per month when pre-approved by a manager and supported by a receipt.",
        source: "Expense Policy · Section 4.2 · Workspace Expenses",
        page: 6,
      },
      {
        id: "expense-travel",
        text:
          "Employees must submit travel receipts within 10 business days of the trip for reimbursement processing.",
        source: "Expense Policy · Section 5.1 · Travel",
        page: 8,
      },
    ],
  },
  {
    id: "remote-work-policy",
    title: "Remote Work Policy",
    clauses: [
      {
        id: "remote-eligibility",
        text:
          "Remote work is available up to 3 days per week for eligible roles with director approval.",
        source: "Remote Work Policy · Section 2.1 · Eligibility",
        page: 2,
      },
      {
        id: "remote-equipment",
        text:
          "The company provides a one-time stipend of $500 for home office equipment and ergonomic setup.",
        source: "Remote Work Policy · Section 3.3 · Equipment",
        page: 4,
      },
    ],
  },
];

let policyStore: PolicyDocument[] = [...defaultPolicies];

export function listPolicies() {
  return policyStore;
}

export function ingestPolicyDocuments(documents: PolicyDocument[]) {
  const byId = new Map(policyStore.map((doc) => [doc.id, doc]));
  documents.forEach((doc) => {
    byId.set(doc.id, doc);
  });
  policyStore = Array.from(byId.values());
  return policyStore;
}

export function searchPolicyClauses(query: string, limit = 3) {
  const tokens = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  const scored = policyStore.flatMap((doc) =>
    doc.clauses.map((clause) => {
      const text = clause.text.toLowerCase();
      const score = tokens.reduce((acc, token) => acc + (text.includes(token) ? 1 : 0), 0);
      return { clause, score, title: doc.title };
    })
  );

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => ({
      ...item.clause,
      title: item.title,
    }));
}
