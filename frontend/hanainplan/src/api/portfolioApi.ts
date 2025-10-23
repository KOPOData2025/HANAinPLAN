import { httpGet } from '../lib/http';

export interface PortfolioData {
  totalAssets?: number;
  deposits?: any[];
  funds?: any[];
  irp?: number;
  insurance?: number;
}

export interface IrpPortfolioSummary {
  customerId: number;
  irpAccountNumber: string;
  totalValue: number;
  totalReturn: number;
  totalReturnRate: number;
  lastSyncedAt: string;
  cash: {
    amount: number;
    weight: number;
    returnAmount: number;
    returnRate: number;
    lastUpdated: string;
  };
  deposit: {
    amount: number;
    weight: number;
    returnAmount: number;
    returnRate: number;
    lastUpdated: string;
    items: Array<{
      assetCode: string;
      assetName: string;
      amount: number;
      weight: number;
      interestRate: number;
      maturityDate: string;
      daysToMaturity: number;
      returnAmount: number;
      returnRate: number;
      status: string;
    }>;
  };
  fund: {
    amount: number;
    weight: number;
    returnAmount: number;
    returnRate: number;
    lastUpdated: string;
    items: Array<{
      assetCode: string;
      assetName: string;
      classCode: string;
      units: number;
      currentNav: number;
      purchaseNav: number;
      amount: number;
      weight: number;
      returnAmount: number;
      returnRate: number;
      riskLevel: string;
      fundType: string;
      status: string;
    }>;
  };
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
  return httpGet<PortfolioData>(`/portfolio/${customerId}`, {});
};

export const getIrpAccount = async (userId: number): Promise<IrpAccountInfo | null> => {
  try {
    const response = await httpGet<IrpAccountInfo>(`/banking/irp/account/user/${userId}`, {});
    return response;
  } catch (error) {
    return null;
  }
};

// IRP 포트폴리오 요약 정보 조회
export const getIrpPortfolioSummary = async (customerId: number): Promise<IrpPortfolioSummary> => {
  return httpGet<IrpPortfolioSummary>(`/irp/portfolio/${customerId}`, {});
};

// IRP 현금 잔액 조회
export const getIrpCashBalance = async (customerId: number): Promise<number> => {
  const response = await httpGet<{ balance: number }>(`/irp/portfolio/${customerId}/cash`, {});
  return response.balance;
};

// IRP 예금 잔액 조회
export const getIrpDepositBalance = async (customerId: number): Promise<number> => {
  const response = await httpGet<{ balance: number }>(`/irp/portfolio/${customerId}/deposit`, {});
  return response.balance;
};

// IRP 펀드 투자금액 조회
export const getIrpFundBalance = async (customerId: number): Promise<number> => {
  const response = await httpGet<{ balance: number }>(`/irp/portfolio/${customerId}/fund`, {});
  return response.balance;
};