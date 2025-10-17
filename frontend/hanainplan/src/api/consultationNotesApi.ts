import { httpGet, httpPost } from '../lib/http';

const BASE_URL = '/consultation';

export interface ConsultationNote {
  noteId?: number;
  consultId: string;
  userId: number;
  noteType: 'PERSONAL' | 'SHARED';
  content: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface SaveConsultationNoteRequest {
  consultId: string;
  userId: number;
  noteType: 'PERSONAL' | 'SHARED';
  content: string;
}

export const saveConsultationNote = async (request: SaveConsultationNoteRequest): Promise<ConsultationNote> => {
  return await httpPost<ConsultationNote>(`${BASE_URL}/notes`, request);
};

export const getConsultationNotes = async (consultId: string): Promise<ConsultationNote[]> => {
  return await httpGet<ConsultationNote[]>(`${BASE_URL}/${consultId}/notes`);
};

export const getUserNote = async (consultId: string, userId: number, noteType: 'PERSONAL' | 'SHARED'): Promise<ConsultationNote | null> => {
  try {
    return await httpGet<ConsultationNote>(`${BASE_URL}/${consultId}/notes/user/${userId}/type/${noteType}`);
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const getSharedNotes = async (consultId: string): Promise<ConsultationNote[]> => {
  return await httpGet<ConsultationNote[]>(`${BASE_URL}/${consultId}/notes/shared`);
};

export const getSharedNote = async (consultId: string): Promise<ConsultationNote | null> => {
  try {
    const sharedNotes = await getSharedNotes(consultId);
    return sharedNotes && sharedNotes.length > 0 ? sharedNotes[0] : null;
  } catch (error) {
    return null;
  }
};