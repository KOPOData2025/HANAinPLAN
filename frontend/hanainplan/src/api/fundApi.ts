import { httpGet, httpPost } from '../lib/http';
import type {
  FundClassDetail,
  FundPurchaseRequest,
  FundPurchaseResponse,
  FundRedemptionRequest,
  FundRedemptionResponse,
  FundSubscription,
  FundTransaction,
  FundTransactionStats,
} from '../types/fund.types';

const BASE_URL = '/banking';

export const fundProductApi = {
  getAllFundClasses: async (): Promise<FundClassDetail[]> => {
    return await httpGet<FundClassDetail[]>(`${BASE_URL}/fund-classes`);
  },

  getFundClass: async (childFundCd: string): Promise<FundClassDetail> => {
    return await httpGet<FundClassDetail>(`${BASE_URL}/fund-classes/${childFundCd}`);
  },

  getFundClassesByMaster: async (fundCd: string): Promise<FundClassDetail[]> => {
    return await httpGet<FundClassDetail[]>(`${BASE_URL}/fund-classes/master/${fundCd}`);
  },

  getFundClassesByAssetType: async (assetType: string): Promise<FundClassDetail[]> => {
    return await httpGet<FundClassDetail[]>(`${BASE_URL}/fund-classes/asset-type/${assetType}`);
  },

  getFundClassesByClassCode: async (classCode: string): Promise<FundClassDetail[]> => {
    return await httpGet<FundClassDetail[]>(`${BASE_URL}/fund-classes/class-code/${classCode}`);
  },

  getFundClassesByMaxAmount: async (maxAmount: number): Promise<FundClassDetail[]> => {
    return await httpGet<FundClassDetail[]>(`${BASE_URL}/fund-classes/max-amount/${maxAmount}`);
  },
};

export const fundSubscriptionApi = {
  purchaseFund: async (request: FundPurchaseRequest): Promise<FundPurchaseResponse> => {
    return await httpPost<FundPurchaseResponse>(`${BASE_URL}/fund-subscription/purchase`, request);
  },

  redeemFund: async (request: FundRedemptionRequest): Promise<FundRedemptionResponse> => {
    return await httpPost<FundRedemptionResponse>(`${BASE_URL}/fund-subscription/redeem`, request);
  },

  getActiveSubscriptions: async (userId: number): Promise<FundSubscription[]> => {
    return await httpGet<FundSubscription[]>(`${BASE_URL}/fund-subscription/user/${userId}/active`);
  },
};

export const fundTransactionApi = {
  getUserTransactions: async (userId: number): Promise<FundTransaction[]> => {
    return await httpGet<FundTransaction[]>(`${BASE_URL}/fund-subscription/user/${userId}/transactions`);
  },

  getTransactionStats: async (userId: number): Promise<FundTransactionStats> => {
    return await httpGet<FundTransactionStats>(`${BASE_URL}/fund-subscription/user/${userId}/stats`);
  },
};

const HANA_BANK_BASE_URL = '/hana';

export const hanaBankFundApi = {
  getCustomerSubscriptions: async (customerCi: string): Promise<FundSubscription[]> => {
    return await httpGet<FundSubscription[]>(`${HANA_BANK_BASE_URL}/fund-subscription/customer/${customerCi}`);
  },

  getActiveSubscriptions: async (customerCi: string): Promise<FundSubscription[]> => {
    return await httpGet<FundSubscription[]>(`${HANA_BANK_BASE_URL}/fund-subscription/customer/${customerCi}/active`);
  },
};