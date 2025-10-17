import { httpGet } from '../lib/http';

const BASE_URL = '/api/portfolio';
const BANKING_BASE_URL = '/banking';

export interface PortfolioData {
  totalAssets?: number;
  deposits?: any[];
  funds?: any[];
  irp?: number;
  insurance?: number;
}

export interface IrpAccountInfo {
  irpAccountId: number;
  customerId: number;
  customerCi: string;
  bankCode: string;
  accountNumber: string;
  accountStatus: string;
  currentBalance: number;
  totalContribution: number;
  totalReturn: number;
  returnRate: number;
  productName: string;
  bankName: string;
  displayAccountNumber: string;
  openDate: string;
  createdDate: string;
  investmentStyle?: string;
  investmentStyleDisplay?: string;
}

export const getPortfolio = async (customerId: number): Promise<PortfolioData> => {
  return await httpGet<PortfolioData>(`${BASE_URL}/${customerId}`);
};

export const getIrpAccount = async (userId: number): Promise<IrpAccountInfo | null> => {
  try {
    const response = await httpGet<IrpAccountInfo>(`${BANKING_BASE_URL}/irp/account/user/${userId}`);

    if (response) {
      return response;
    }

    return null;
  } catch (error) {
    return null;
  }
};