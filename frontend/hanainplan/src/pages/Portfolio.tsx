import { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import Layout from '../components/layout/Layout';
import IrpProductsPortfolio from '../components/portfolio/IrpProductsPortfolio';
import IrpRebalancing from '../components/portfolio/IrpRebalancing';
import IrpTaxBenefits from '../components/portfolio/IrpTaxBenefits';
import { getAllAccounts, type AllAccountsResponse } from '../api/bankingApi';
import { getRiskProfile } from '../api/productApi';

interface PortfolioData {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  savings: {
    general: number;
    irp: number;
  };
  insurance: {
    total: number;
    monthly: number;
  };
  expenses: {
    monthly: number;
    categories: {
      living: number;
      medical: number;
      entertainment: number;
      others: number;
    };
  };
}

function Portfolio() {
  const { user } = useUserStore();
  const [userRiskProfile, setUserRiskProfile] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'portfolio' | 'benefits'>('portfolio');
  const [_portfolioData, setPortfolioData] = useState<PortfolioData>({
    totalAssets: 0,
    totalLiabilities: 45000000,
    netWorth: 0,
    savings: {
      general: 0,
      irp: 0,
    },
    insurance: {
      total: 20000000,
      monthly: 150000,
    },
    expenses: {
      monthly: 2500000,
      categories: {
        living: 1200000,
        medical: 300000,
        entertainment: 500000,
        others: 500000,
      },
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [allAccountsData, setAllAccountsData] = useState<AllAccountsResponse | null>(null);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const accountsResponse = await getAllAccounts(user.id);
        setAllAccountsData(accountsResponse);

        // 사용자 리스크 프로파일 가져오기
        try {
          const riskProfileResponse = await getRiskProfile(user.id);
          const riskType = riskProfileResponse.riskProfileType;
          if (riskType === 'STABLE') setUserRiskProfile('안정형');
          else if (riskType === 'STABLE_PLUS') setUserRiskProfile('안정추구형');
          else if (riskType === 'NEUTRAL') setUserRiskProfile('중립형');
          else if (riskType === 'AGGRESSIVE') setUserRiskProfile('적극형');
        } catch (error) {
          // 리스크 프로파일이 없으면 기본값 사용
          setUserRiskProfile('미측정');
        }

        const { totalBankingBalance, totalIrpBalance, totalBalance } = accountsResponse;

        setPortfolioData(prev => ({
          ...prev,
          totalAssets: totalBalance + 20000000,
          netWorth: totalBalance + 20000000 - prev.totalLiabilities,
          savings: {
            general: totalBankingBalance,
            irp: totalIrpBalance,
          },
        }));

      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolioData();
  }, [user?.id]);

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-hana-bold text-gray-800 mb-4">로그인이 필요합니다</h2>
            <p className="text-gray-600">포트폴리오를 확인하려면 먼저 로그인해주세요.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hana-green mx-auto mb-4"></div>
            <p className="text-gray-600">포트폴리오 정보를 불러오는 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {}
          <div className="mb-8">
            <h1 className="text-3xl font-hana-bold text-gray-900 mb-2">
            {user?.name}님의 IRP 포트폴리오
            </h1>
            
            {/* 탭 네비게이션 */}
            <div className="flex space-x-1 mt-6">
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`px-6 py-3 rounded-lg font-hana-medium transition-colors ${
                  activeTab === 'portfolio'
                    ? 'bg-hana-green text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                포트폴리오 상세
              </button>
              <button
                onClick={() => setActiveTab('benefits')}
                className={`px-6 py-3 rounded-lg font-hana-medium transition-colors ${
                  activeTab === 'benefits'
                    ? 'bg-hana-green text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                내가 받을 혜택
              </button>
            </div>
          </div>

          {}

          {/* 탭 내용 */}
          {activeTab === 'portfolio' && (
            <>
              {}
              {allAccountsData?.irpAccount && (
                <div className="mb-8">
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-hana-bold text-gray-900">IRP 계좌 상세 정보</h2>
                      <div className="flex items-center">
                        <img src="/bank/081.png" alt="하나은행" className="w-8 h-8 mr-2" />
                        <span className="text-lg font-hana-medium text-gray-800">하나은행</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-r from-hana-green/10 to-hana-green/20 rounded-xl p-6 border border-hana-green/30">
                        <div className="text-sm text-hana-green mb-1">계좌번호</div>
                        <div className="text-xl font-hana-bold text-gray-900">{allAccountsData.irpAccount.accountNumber}</div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                        <div className="text-sm text-blue-700 mb-1">현재 잔액</div>
                        <div className="text-xl font-hana-bold text-gray-900">
                          {(allAccountsData.irpAccount.currentBalance || 0).toLocaleString()}원
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                        <div className="text-sm text-purple-700 mb-1">총 납입금</div>
                        <div className="text-xl font-hana-bold text-gray-900">
                          {(allAccountsData.irpAccount.totalContribution || 0).toLocaleString()}원
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-hana-medium text-gray-900 mb-3">투자 정보</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">투자 성향:</span>
                            <span className="font-medium">
                              {userRiskProfile || '미측정'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">개설일:</span>
                            <span className="font-medium">{allAccountsData.irpAccount.openDate}</span>
                          </div>
                          {allAccountsData.irpAccount.maturityDate && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">만기일:</span>
                              <span className="font-medium">{allAccountsData.irpAccount.maturityDate}</span>
                            </div>
                          )}
                        </div>
                      </div>

                    
                    </div>
                  </div>
                </div>
              )}

              {}
              {allAccountsData?.irpAccount && (
                <div className="mb-8">
                  <IrpProductsPortfolio irpAccountNumber={allAccountsData.irpAccount.accountNumber} />
                </div>
              )}

              {}
              {allAccountsData?.irpAccount && user?.id && (
                <div className="mb-8">
                  <IrpRebalancing 
                    customerId={user.id} 
                    irpAccountNumber={allAccountsData.irpAccount.accountNumber} 
                  />
                </div>
              )}

              {}
              {!allAccountsData?.irpAccount && (
                <div className="mb-8">
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-hana-bold text-orange-800 mb-2">IRP 계좌를 개설해보세요</h3>
                      <p className="text-orange-700 mb-6">
                        개인형퇴직연금으로 세제혜택을 받으며 안전한 노후를 준비하세요
                      </p>
                      <button
                        onClick={() => window.location.href = '/products/irp'}
                        className="bg-orange-600 text-white px-6 py-3 rounded-lg font-hana-bold hover:bg-orange-700 transition-colors"
                      >
                        IRP 계좌 개설하기
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'benefits' && user?.id && (
            <IrpTaxBenefits customerId={user.id} />
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Portfolio;