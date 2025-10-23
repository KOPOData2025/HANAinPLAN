import { httpGet, httpPost, httpPatch } from '../lib/http';

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
  const response = await httpPost<{ success: boolean; consultation: ConsultationResponse; message?: string }>('/consultations', request);
  
  if (response.success) {
    return response.consultation;
  } else {
    throw new Error(response.message || '상담 신청에 실패했습니다.');
  }
};

export const getCustomerConsultations = async (customerId: number): Promise<ConsultationResponse[]> => {
  return httpGet<ConsultationResponse[]>(`/consultations/customer/${customerId}`);
};

export const getConsultantConsultations = async (consultantId: number): Promise<ConsultationResponse[]> => {
  return httpGet<ConsultationResponse[]>(`/consultations/consultant/${consultantId}`);
};

export const getTodayConsultations = async (consultantId: number): Promise<ConsultationResponse[]> => {
  return httpGet<ConsultationResponse[]>(`/consultations/consultant/${consultantId}/today`);
};

export const getConsultationRequests = async (consultantId: number): Promise<ConsultationResponse[]> => {
  return httpGet<ConsultationResponse[]>(`/consultations/consultant/${consultantId}/requests`);
};

export const updateConsultationStatus = async (consultId: string, status: string): Promise<ConsultationResponse> => {
  const response = await httpPatch<{ success: boolean; consultation: ConsultationResponse; message?: string }>(
    `/consultations/${consultId}/status`,
    null,
    { params: { status } }
  );

  if (response.success) {
    return response.consultation;
  } else {
    throw new Error(response.message || '상담 상태 변경에 실패했습니다.');
  }
};

export const cancelConsultation = async (consultId: string, customerId: number): Promise<ConsultationResponse> => {
  const response = await httpPost<{ success: boolean; consultation: ConsultationResponse; message?: string }>(
    `/consultations/${consultId}/cancel`,
    null,
    { params: { customerId } }
  );

  if (response.success) {
    return response.consultation;
  } else {
    throw new Error(response.message || '상담 취소에 실패했습니다.');
  }
};

export const getConsultationDetails = async (consultId: string): Promise<ConsultationResponse> => {
  return httpGet<ConsultationResponse>(`/consultations/${consultId}/details`);
};

export const joinConsultationRoom = async (consultationId: string, userId: number): Promise<any> => {
  const response = await httpPost<{ success: boolean; message?: string } & any>(
    `/webrtc/consultation/${consultationId}/join`,
    { userId }
  );

  if (response.success) {
    return response;
  } else {
    throw new Error(response.message || '상담 방 입장에 실패했습니다.');
  }
};

export interface Counselor {
  consultantId: number;
  userName: string;
  department: string;
  position: string;
  branchName: string;
  specialization: string;
  consultationRating: number;
  totalConsultations: number;
  workEmail: string;
  phoneNumber: string;
  experienceYears: string;
  consultationStatus: string;
  workStatus: string;
}

export const getConsultants = async (): Promise<Counselor[]> => {
  return httpGet<Counselor[]>('/consultants');
};