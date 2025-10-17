import { httpGet, httpPost } from '../lib/http';

const BASE_URL = '/banking';

export interface FundPurchaseRequest {
  userId: number;
  childFundCd: string;
  purchaseAmount: number;
}

export interface FundPurchaseResponse {
  success: boolean;
  subscriptionId?: number;
  purchaseAmount?: number;
  purchaseUnits?: number;
  message?: string;
  errorMessage?: string;
}

export interface FundRedemptionRequest {
  userId: number;
  subscriptionId: number;
  sellUnits?: number;
  sellAll?: boolean;
}

export interface FundRedemptionResponse {
  success: boolean;
  sellUnits?: number;
  netAmount?: number;
  profit?: number;
  message?: string;
  errorMessage?: string;
}

export interface FundPortfolio {
  subscriptionId: number;
  childFundCd: string;
  fundName: string;
  totalUnits: number;
  averagePrice: number;
  currentValue: number;
  profit: number;
  profitRate: number;
}

export const purchaseFund = async (request: FundPurchaseRequest): Promise<FundPurchaseResponse> => {
  return await httpPost<FundPurchaseResponse>(`${BASE_URL}/fund-subscription/purchase`, request);
};

export const redeemFund = async (request: FundRedemptionRequest): Promise<FundRedemptionResponse> => {
  return await httpPost<FundRedemptionResponse>(`${BASE_URL}/fund-subscription/redeem`, request);
};

export const getActiveFundSubscriptions = async (userId: number): Promise<FundPortfolio[]> => {
  return await httpGet<FundPortfolio[]>(`${BASE_URL}/fund-subscription/user/${userId}/active`);
};