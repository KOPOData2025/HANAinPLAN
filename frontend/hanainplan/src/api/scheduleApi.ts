import { httpGet, httpPost, httpPatch, httpDelete } from '../lib/http';

const BASE_URL = '/consultant/schedules';

export interface ScheduleEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  clientName?: string;
  type: 'consultation' | 'meeting' | 'other';
}

const getConsultantId = (): number => {
  const userStorage = localStorage.getItem('user-storage');
  if (!userStorage) {
    throw new Error('로그인이 필요합니다.');
  }

  try {
    const userData = JSON.parse(userStorage);
    const userId = userData?.state?.user?.userId;

    if (!userId) {
      throw new Error('사용자 정보를 찾을 수 없습니다.');
    }

    return userId;
  } catch (error) {
    throw new Error('사용자 정보를 읽을 수 없습니다.');
  }
};

export const fetchSchedules = async (): Promise<ScheduleEvent[]> => {
  try {
    const consultantId = getConsultantId();

    const response = await httpGet<any[]>(BASE_URL, { consultantId });

    return response.map((schedule: any) => ({
      id: schedule.id || String(schedule.scheduleId),
      title: schedule.title,
      start: schedule.start || schedule.startTime,
      end: schedule.end || schedule.endTime,
      description: schedule.description,
      clientName: schedule.clientName,
      type: (schedule.type || schedule.scheduleType || 'other').toLowerCase()
    }));
  } catch (error) {
    throw error;
  }
};

export const createSchedule = async (event: Omit<ScheduleEvent, 'id'>): Promise<ScheduleEvent> => {
  try {
    const consultantId = getConsultantId();

    const requestData = {
      title: event.title,
      description: event.description,
      scheduleType: event.type.toUpperCase(),
      clientName: event.clientName,
      startTime: event.start,
      endTime: event.end,
      isAllDay: false
    };

    const response = await httpPost<any>(BASE_URL, requestData, {
      params: { consultantId }
    });

    const schedule = response;
    return {
      id: schedule.id || String(schedule.scheduleId),
      title: schedule.title,
      start: schedule.start || schedule.startTime,
      end: schedule.end || schedule.endTime,
      description: schedule.description,
      clientName: schedule.clientName,
      type: (schedule.type || schedule.scheduleType || 'other').toLowerCase() as 'consultation' | 'meeting' | 'other'
    };
  } catch (error) {
    throw error;
  }
};

export const updateSchedule = async (eventId: string, event: Partial<ScheduleEvent>): Promise<ScheduleEvent> => {
  try {
    const consultantId = getConsultantId();

    const requestData: any = {};
    if (event.title) requestData.title = event.title;
    if (event.description) requestData.description = event.description;
    if (event.type) requestData.scheduleType = event.type.toUpperCase();
    if (event.clientName) requestData.clientName = event.clientName;
    if (event.start) requestData.startTime = event.start;
    if (event.end) requestData.endTime = event.end;

    const response = await httpPatch<any>(`${BASE_URL}/${eventId}`, requestData, {
      params: { consultantId }
    });

    const schedule = response;
    return {
      id: schedule.id || String(schedule.scheduleId),
      title: schedule.title,
      start: schedule.start || schedule.startTime,
      end: schedule.end || schedule.endTime,
      description: schedule.description,
      clientName: schedule.clientName,
      type: (schedule.type || schedule.scheduleType || 'other').toLowerCase() as 'consultation' | 'meeting' | 'other'
    };
  } catch (error) {
    throw error;
  }
};

export const deleteSchedule = async (eventId: string): Promise<void> => {
  try {
    const consultantId = getConsultantId();

    await httpDelete(`${BASE_URL}/${eventId}`, { consultantId });
  } catch (error) {
    throw error;
  }
};

export const fetchAvailableConsultantsAtTime = async (
  startTime: string,
  endTime: string
): Promise<number[]> => {
  try {
    const response = await httpGet<any[]>('/consultants/available-at-time', {
      startTime,
      endTime
    });

    return response.map((consultant: any) => consultant.consultantId);
  } catch (error) {
    throw error;
  }
};