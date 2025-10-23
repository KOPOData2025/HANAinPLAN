import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import NotesTab from './NotesTab';
import { getIrpPortfolioSummary } from '../../api/portfolioApi';
import IrpRebalancing from '../portfolio/IrpRebalancing';
import SimpleDepositPortfolio from './SimpleDepositPortfolio';
import type { RebalancingSimulationResponse } from '../../api/rebalancingApi';

interface AssetConsultationProps {
  consultationInfo: {
    id?: string;
    type: string;
    detail?: string;
  };
  customerId: number;
  currentUserId: number;
  currentUserRole: 'customer' | 'counselor';
  targetUserId: number;
  isInCall: boolean;
  proposedSimulation?: RebalancingSimulationResponse | null;
  onSimulationProposed?: (simulation: RebalancingSimulationResponse) => void;
  onSimulationApproved?: (jobId: number) => void;
  onSimulationRejected?: (jobId: number) => void;
}

const AssetConsultation: React.FC<AssetConsultationProps> = ({
  consultationInfo,
  customerId,
  currentUserId,
  currentUserRole,
  targetUserId,
  isInCall
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rebalancing' | 'notes'>('overview');

  // IRP 계좌 정보 조회 (리밸런싱 탭과 자산 현황 탭에서 사용)
  const { data: irpPortfolioSummary } = useQuery({
    queryKey: ['irpPortfolioSummary', customerId],
    queryFn: () => getIrpPortfolioSummary(customerId),
    enabled: !!customerId && (activeTab === 'rebalancing' || activeTab === 'overview')
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">💰</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">자산 관리 상담</h2>
          <p className="text-sm text-gray-600">고객 포트폴리오 및 자산 현황</p>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          자산 현황
        </button>
        <button
          onClick={() => setActiveTab('rebalancing')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'rebalancing'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          포트폴리오 리밸런싱
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'notes'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          상담 기록
        </button>
      </div>

      {/* 상담 상세 정보 */}
      {consultationInfo.detail && (
        <div className="mb-4">
          <div className="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
            {consultationInfo.detail}
          </div>
        </div>
      )}

      {/* 탭별 내용 */}
      <div className="flex-1 flex flex-col">
        {activeTab === 'overview' && (
          <div className="flex-1">
            {irpPortfolioSummary?.irpAccountNumber ? (
              <SimpleDepositPortfolio irpAccountNumber={irpPortfolioSummary.irpAccountNumber} />
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600 text-sm">IRP 계좌 정보가 없습니다</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'rebalancing' && irpPortfolioSummary && (
          <div className="flex-1">
            <IrpRebalancing
              customerId={customerId}
              irpAccountNumber={irpPortfolioSummary.irpAccountNumber || ''}
            />
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="flex-1 flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              상담 기록
            </h3>

            <div className="flex-1">
              <NotesTab
                consultationId={consultationInfo.id || ''}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                targetUserId={targetUserId}
              />
            </div>

            {isInCall && (
              <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-800">
                  ✅ 상담 진행 중 - 자산 관리 전략 및 조언 기록 가능
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetConsultation;