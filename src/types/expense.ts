export type ExpenseStatus = 'paid' | 'planned'; 
export type Expense = {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  status: ExpenseStatus;
};