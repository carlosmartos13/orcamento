export interface ClientInfo {
  name: string;
  companyName: string;
  cnpj: string;
  phone: string;
  email: string;
}

export interface MonthlySubscription {
  cloud: boolean;
  fiscal: boolean;
  inventory: boolean;
  financial: boolean;
  pdvCount: number;
}

export interface Additionals {
  legalLoyalty: boolean;
  delivery: 'none' | 'basic' | 'plus';
  selfServiceTerminals: number;
}

export interface Equipment {
  androidPdvGertec: number;
  androidPdvSunmi: number;
  selfServiceTotemGertec: number;
  networkKit: number;
  raspberryServer: number;
}

export interface FormData {
  clientInfo: ClientInfo;
  subscription: MonthlySubscription;
  additionals: Additionals;
  equipment: Equipment;
}