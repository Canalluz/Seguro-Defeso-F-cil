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
