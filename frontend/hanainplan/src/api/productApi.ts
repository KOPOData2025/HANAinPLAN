import { httpGet, httpPost, httpPatch, httpDelete } from '../lib/http';

const BASE_URL = '/v1/irp-integration';
const BANKING_BASE_URL = '/banking';

export interface IrpAccountOpenRequest {
  customerId: number;
  initialDeposit: number;
  monthlyDeposit?: number;
  isAutoDeposit: boolean;
  depositDay: number;
  investmentStyle: 'CONSERVATIVE' | 'MODERATE_CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  linkedMainAccount: string;
}

export interface IrpAccountOpenResponse {
  accountNumber: string;
  accountStatus: string;
  initialDeposit: number;
  monthlyDeposit?: number;
  investmentStyle: string;
  openDate: string;
  createdAt: string;
  message: string;
  success: boolean;
}

export interface IrpAccountInfo {
  irpAccountId: number;
  customerCi: string;
  accountNumber: string;
  accountStatus: string;
  initialDeposit: number;
  monthlyDeposit: number;
  currentBalance: number;
  investmentStyle: string;
  productCode?: string;
  openDate: string;
  lastContributionDate: string;
  totalContribution: number;
  totalReturn: number;
  returnRate: number;
  managementFee: number;
  isAutoDeposit: boolean;
  depositDay: number;
  linkedMainAccount: string;
  taxBenefitYear: number;
  maturityDate?: string;
  isMatured: boolean;
  penaltyAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IrpAccountStatusResponse {
  customerCi: string;
  hasIrpAccount: boolean;
  message: string;
}

export const openIrpAccount = async (request: IrpAccountOpenRequest): Promise<IrpAccountOpenResponse> => {
  try {
    return await httpPost<IrpAccountOpenResponse>(`${BASE_URL}/accounts/open`, request);
  } catch (error) {
    throw error;
  }
};

export const getIrpAccount = async (customerId: number): Promise<IrpAccountInfo> => {
  try {
    return await httpGet<IrpAccountInfo>(`${BASE_URL}/accounts/customer/${customerId}`);
  } catch (error) {
    throw error;
  }
};

export const checkIrpAccountStatus = async (customerId: number): Promise<IrpAccountStatusResponse> => {
  try {
    return await httpGet<IrpAccountStatusResponse>(`${BASE_URL}/accounts/check/${customerId}`);
  } catch (error) {
    throw error;
  }
};

export const syncIrpAccountWithHanaInPlan = async (customerId: number): Promise<{ syncSuccess: boolean; message: string }> => {
  try {
    return await httpPost<{ syncSuccess: boolean; message: string }>(`${BASE_URL}/sync/customer/${customerId}`);
  } catch (error) {
    throw error;
  }
};

export const closeIrpAccount = async (accountNumber: string): Promise<{ accountNumber: string; message: string }> => {
  try {
    return await httpDelete<{ accountNumber: string; message: string }>(`/v1/irp/close/${accountNumber}`);
  } catch (error) {
    throw error;
  }
};

export interface InterestRateInfo {
  bankCode: string;
  bankName: string;
  productCode: string;
  productName: string;
  maturityPeriod: string;
  interestRate: number;
  interestType: string;
}

export interface DepositProduct {
  depositCode: string;
  name: string;
  bankCode: string;
  bankName: string;
  description: string;
  rateInfo: string;
}

export const getAllInterestRates = async (): Promise<InterestRateInfo[]> => {
  try {
    return await httpGet<InterestRateInfo[]>(`${BANKING_BASE_URL}/interest-rates/all`);
  } catch (error) {
    throw error;
  }
};

export interface OptimalDepositRecommendation {
  depositCode: string;
  depositName: string;
  bankCode: string;
  bankName: string;
  productType: number;
  productTypeName: string;
  contractPeriod: number;
  contractPeriodUnit: string;
  maturityPeriod: string;
  depositAmount: number;
  appliedRate: number;
  expectedInterest: number;
  expectedMaturityAmount: number;
  expectedMaturityDate: string;
  recommendationReason: string;
  yearsToRetirement: number;
  currentIrpBalance: number;
}

export interface DepositSubscriptionRequest {
  userId: number;
  bankCode: string;
  irpAccountNumber: string;
  linkedAccountNumber: string;
  depositCode: string;
  productType: number;
  contractPeriod: number;
  subscriptionAmount: number;
}

export const getAllDepositProducts = async (): Promise<{ success: boolean; count: number; products: DepositProduct[] }> => {
  try {
    return await httpGet<{ success: boolean; count: number; products: DepositProduct[] }>(`${BANKING_BASE_URL}/deposit-products`);
  } catch (error) {
    throw error;
  }
};

export const getDepositProductsByBank = async (bankCode: string): Promise<{ success: boolean; bankCode: string; count: number; products: DepositProduct[] }> => {
  try {
    return await httpGet<{ success: boolean; bankCode: string; count: number; products: DepositProduct[] }>(`${BANKING_BASE_URL}/deposit-products/bank/${bankCode}`);
  } catch (error) {
    throw error;
  }
};

export interface DepositRecommendationRequest {
  userId: number;
  retirementDate: string;
  depositAmount: number;
}

export const getOptimalDepositRecommendation = async (request: DepositRecommendationRequest): Promise<{ success: boolean; message: string; recommendation: OptimalDepositRecommendation }> => {
  try {
    return await httpPost<{ success: boolean; message: string; recommendation: OptimalDepositRecommendation }>(`${BANKING_BASE_URL}/deposit-products/recommend`, request);
  } catch (error) {
    throw error;
  }
};

export const subscribeDeposit = async (request: DepositSubscriptionRequest): Promise<any> => {
  try {
    return await httpPost<any>(`${BANKING_BASE_URL}/deposit/subscribe`, request);
  } catch (error) {
    throw error;
  }
};