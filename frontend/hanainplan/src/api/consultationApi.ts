import { httpGet, httpPost, httpPatch } from '../lib/http';

const BASE_URL = '/consultations';

export interface ConsultationRequest {
  customerId: number;
  consultantId: number;
  consultationType: string;
  reservationDatetime: string;
  detail?: string;
}

export interface ConsultationResponse {
  consultId: string;
  consultType: string;
  reservationDatetime: string;
  consultDatetime?: string;
  consultStatus: string;
  qrCode?: string;
  consultUrl?: string;
  detail?: string;
  consultResult?: string;
  branchCode?: string;
  customerId: string;
  consultantId: string;
  customerName?: string;
  consultantName?: string;
  consultantDepartment?: string;
}

export const createConsultation = async (request: ConsultationRequest): Promise<ConsultationResponse> => {
  try {
    const response = await httpPost<{ success: boolean; consultation: ConsultationResponse; message?: string }>(BASE_URL, request);
    
    if (response.success) {
      return response.consultation;
    } else {
      throw new Error(response.message || '상담 신청에 실패했습니다.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || '상담 신청에 실패했습니다.');
  }
};

export const getCustomerConsultations = async (customerId: number): Promise<ConsultationResponse[]> => {
  try {
    return await httpGet<ConsultationResponse[]>(`${BASE_URL}/customer/${customerId}`);
  } catch (error) {
    throw error;
  }
};

export const getConsultantConsultations = async (consultantId: number): Promise<ConsultationResponse[]> => {
  try {
    return await httpGet<ConsultationResponse[]>(`${BASE_URL}/consultant/${consultantId}`);
  } catch (error) {
    throw error;
  }
};

export const getTodayConsultations = async (consultantId: number): Promise<ConsultationResponse[]> => {
  try {
    return await httpGet<ConsultationResponse[]>(`${BASE_URL}/consultant/${consultantId}/today`);
  } catch (error) {
    throw error;
  }
};

export const getConsultationRequests = async (consultantId: number): Promise<ConsultationResponse[]> => {
  try {
    return await httpGet<ConsultationResponse[]>(`${BASE_URL}/consultant/${consultantId}/requests`);
  } catch (error) {
    throw error;
  }
};

export const updateConsultationStatus = async (consultId: string, status: string): Promise<ConsultationResponse> => {
  try {
    const response = await httpPatch<{ success: boolean; consultation: ConsultationResponse; message?: string }>(`${BASE_URL}/${consultId}/status`, null, {
      params: { status }
    });

    if (response.success) {
      return response.consultation;
    } else {
      throw new Error(response.message || '상담 상태 변경에 실패했습니다.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || '상담 상태 변경에 실패했습니다.');
  }
};

export const cancelConsultation = async (consultId: string, customerId: number): Promise<ConsultationResponse> => {
  try {
    const response = await httpPost<{ success: boolean; consultation: ConsultationResponse; message?: string }>(`${BASE_URL}/${consultId}/cancel`, null, {
      params: { customerId }
    });

    if (response.success) {
      return response.consultation;
    } else {
      throw new Error(response.message || '상담 취소에 실패했습니다.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || '상담 취소에 실패했습니다.');
  }
};

export const getConsultationDetails = async (consultId: string): Promise<ConsultationResponse> => {
  try {
    return await httpGet<ConsultationResponse>(`${BASE_URL}/${consultId}/details`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || '상담 상세 정보 조회에 실패했습니다.');
  }
};

export const joinConsultationRoom = async (consultationId: string, userId: number): Promise<any> => {
  try {
    const response = await httpPost<{ success: boolean; message?: string }>(`/webrtc/consultation/${consultationId}/join`, { userId });

    if (response.success) {
      return response;
    } else {
      throw new Error(response.message || '상담 방 입장에 실패했습니다.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || '상담 방 입장에 실패했습니다.');
  }
};