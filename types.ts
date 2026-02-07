
export interface FisherData {
  name: string;
  hasRight: boolean;
  rgp: string;
  region: string;
}

export interface DefesoInfo {
  species: string;
  startDate: string;
  daysRemaining: number;
}

export interface DefesoRecord {
  id: string;
  species: string;
  region: string;
  startDate: string;
  endDate: string;
  hasRightToInsurance: boolean;
  status: 'upcoming' | 'ongoing' | 'finished';
  daysRemaining?: number;
}
