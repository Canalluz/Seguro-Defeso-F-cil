export interface FisherData {
  name: string;
  hasRight: boolean;
  rgp: string;
  region: string;
  cpf?: string;
  securityMode?: 'biometric' | 'pin';
  pin?: string;
}

export interface DefesoInfo {
  species: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  hasRight: boolean;
  region: string;
  description: string;
  status: 'upcoming' | 'ongoing' | 'finished';
  history?: DefesoRecord[];
}

export interface DefesoRecord {
  id: string;
  species: string;
  region: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'finished';
  paymentStatus?: 'paid' | 'scheduled' | 'processing' | 'denied';
  paymentDate?: string;
}

export interface ReapReport {
  id: string;
  startDate: string;
  endDate: string;
  type: 'mar' | 'rio' | 'lagoa';
  mode: 'embarcado' | 'terra';
  quantity: string;
  status: 'analysis' | 'approved' | 'pending';
  photoUrl?: string; // Base64 or Blob URL
  createdAt: number;
}

export interface InssContribution {
  id: string;
  month: string;
  year: number;
  income: number;
  contributionValue: number;
  status: 'paid' | 'pending' | 'generated';
  createdAt: number;
}
