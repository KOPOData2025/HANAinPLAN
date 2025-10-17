import { httpGet, httpPost, httpPatch } from '../lib/http';
import type {
  InsuranceProduct,
  InsuranceApplication,
  PremiumCalculationRequest,
  PremiumCalculationResponse,
  PersonalInfo
} from '../types/insurance';

const BASE_URL = '/insurance';

export const getInsuranceProducts = async (category?: string): Promise<InsuranceProduct[]> => {
  return await httpGet<InsuranceProduct[]>(`${BASE_URL}/products`, category ? { category } : {});
};

export const getInsuranceProduct = async (productId: string): Promise<InsuranceProduct> => {
  return await httpGet<InsuranceProduct>(`${BASE_URL}/products/${productId}`);
};

export const calculatePremium = async (request: PremiumCalculationRequest): Promise<PremiumCalculationResponse> => {
  return await httpPost<PremiumCalculationResponse>(`${BASE_URL}/premium/calculate`, request);
};

export const submitInsuranceApplication = async (application: InsuranceApplication): Promise<{ success: boolean; applicationId: string; policyNumber?: string }> => {
  return await httpPost<{ success: boolean; applicationId: string; policyNumber?: string }>(`${BASE_URL}/applications`, application);
};

export const getInsuranceApplication = async (applicationId: string): Promise<InsuranceApplication> => {
  return await httpGet<InsuranceApplication>(`${BASE_URL}/applications/${applicationId}`);
};

export const validatePersonalInfo = async (personalInfo: PersonalInfo): Promise<{ valid: boolean; errors: string[] }> => {
  return await httpPost<{ valid: boolean; errors: string[] }>(`${BASE_URL}/validate/personal-info`, personalInfo);
};

export const checkResidentNumberDuplicate = async (residentNumber: string): Promise<{ duplicate: boolean }> => {
  return await httpPost<{ duplicate: boolean }>(`${BASE_URL}/validate/resident-number`, { residentNumber });
};

export const validateBankAccount = async (bankAccount: { bankCode: string; accountNumber: string; accountHolder: string }): Promise<{ valid: boolean; message: string }> => {
  return await httpPost<{ valid: boolean; message: string }>(`${BASE_URL}/validate/bank-account`, bankAccount);
};

export const updateApplicationStatus = async (applicationId: string, status: string): Promise<{ success: boolean }> => {
  return await httpPatch<{ success: boolean }>(`${BASE_URL}/applications/${applicationId}/status`, { status });
};

export const getInsuranceHistory = async (userId: string): Promise<InsuranceApplication[]> => {
  return await httpGet<InsuranceApplication[]>(`${BASE_URL}/applications/user/${userId}`);
};