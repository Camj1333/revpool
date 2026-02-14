export type CompetitionStatus = "active" | "completed" | "upcoming";

export interface Competition {
  id: string;
  name: string;
  leader: string;
  revenue: number;
  status: CompetitionStatus;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Column<T = any> {
  key: keyof T & string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
}
