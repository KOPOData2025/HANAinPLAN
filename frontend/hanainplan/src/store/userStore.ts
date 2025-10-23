import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HealthInfo {
  recentMedicalAdvice: boolean;
  recentHospitalization: boolean;
  majorDisease: boolean;
  diseaseDetails: Array<{
    diseaseCode: string;
    diseaseName: string;
    diseaseCategory: string;
    riskLevel: string;
    severity: string;
    progressPeriod: string;
    isChronic: boolean;
    description?: string;
  }>;
  longTermMedication: boolean;
  disabilityRegistered: boolean;
  insuranceRejection: boolean;
}

export interface JobInfo {
  industryCode: string;
  industryName: string;
  careerYears: number;
  assetLevel: string;
}

export interface User {
  // userBasicInfo 필드들
  id: number;
  userId: number;
  name: string;  // userName을 name으로 매핑
  phoneNumber: string;
  email: string;
  userType: 'GENERAL' | 'COUNSELOR';
  gender: 'M' | 'F';
  birthDate: string;
  loginType: string;
  isPhoneVerified: boolean;
  isActive: boolean;
  createdDate: string;
  lastLoginDate: string;
  // customerDetailInfo 필드들
  customerDetailInfo?: {
    customerId: number;
    healthInfo: HealthInfo;
    jobInfo: JobInfo;
  };
}

interface UserStore {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      setUser: (user: User) => set({ user, isLoggedIn: true }),
      clearUser: () => set({ user: null, isLoggedIn: false }),
      updateUser: (updates: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user, isLoggedIn: state.isLoggedIn }),
    }
  )
);