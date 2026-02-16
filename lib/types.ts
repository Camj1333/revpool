export type UserRole = "rep" | "manager";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  participantId: number | null;
  createdAt: string;
}

export type CompetitionStatus = "active" | "completed" | "upcoming";

export interface Competition {
  id: string;
  name: string;
  leader: string;
  revenue: number;
  status: CompetitionStatus;
  prize: number;
  startDate: string;
  endDate: string;
  participants: number;
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  revenue: number;
  deals: number;
  rank: number;
  change: number; // positive = moved up, negative = moved down
}

export interface KPI {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface FundingTransaction {
  id: number;
  competitionId: number;
  userName: string;
  amount: number;
  createdAt: string;
}

export type WithdrawalStatus = "pending" | "approved" | "paid";

export interface PrizeWithdrawal {
  id: number;
  competitionId: number;
  userName: string;
  amount: number;
  status: WithdrawalStatus;
  createdAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Column<T = any> {
  key: keyof T & string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
}
