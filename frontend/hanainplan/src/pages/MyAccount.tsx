import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import AccountInfo from '../components/account/AccountInfo';
import TransactionHistory from '../components/account/TransactionHistory';
import TransferModal from '../components/account/TransferModal';
import CreateAccountModal from '../components/account/CreateAccountModal';
import { useUserStore } from '../store/userStore';
import { useAccountStore } from '../store/accountStore';
import { getAllAccounts } from '../api/bankingApi';
import { getRiskProfile } from '../api/productApi';
import type { RiskProfileResponse } from '../api/productApi';

function MyAccount() {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [riskProfile, setRiskProfile] = useState<RiskProfileResponse | null>(null);

  const { user } = useUserStore();
  const { accounts, setAllAccountsData, setLoading, clearAccounts } = useAccountStore();

  useEffect(() => {
    const loadAccounts = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setLoading(true);
        const allAccountsResponse = await getAllAccounts(user.userId);
        setAllAccountsData(allAccountsResponse);

        // 리스크 프로파일 가져오기
        try {
          const riskProfileResponse = await getRiskProfile(user.userId);
          setRiskProfile(riskProfileResponse);
        } catch (error) {
          // 리스크 프로파일이 없으면 null 유지
        }
      } catch (error) {
        setAllAccountsData({
          bankingAccounts: [],
          totalBankingBalance: 0,
          totalIrpBalance: 0,
          totalBalance: 0
        });
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    loadAccounts();
  }, [user, setAllAccountsData, setLoading]);

  useEffect(() => {
    return () => {
      clearAccounts();
    };
  }, [clearAccounts]);

  const handleAccountCreated = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const allAccountsResponse = await getAllAccounts(user.userId);
      setAllAccountsData(allAccountsResponse);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-4 lg:p-8 w-full flex justify-center">
          <div className="max-w-4xl bg-white w-full h-[600px] rounded-lg flex flex-col items-center justify-center p-8 shadow-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hana-green mx-auto mb-4"></div>
              <p className="text-lg text-gray-600 font-hana-medium">계좌 정보를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (user && accounts.length === 0) {
    return (
      <>
        <Layout>
          <div className="p-4 lg:p-8 w-full flex justify-center">
            <div className="max-w-4xl bg-white w-full h-[600px] rounded-lg flex flex-col items-center justify-center p-8 shadow-lg">
                <div className="mb-8">
                  <img
                    src="/images/noAccount.png"
                    alt="계좌 없음"
                    className="w-56 h-56 object-contain"
                  />
                </div>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-hana-medium text-gray-800 mb-4">
                    아직 등록된 계좌가 없어요.
                  </h3>
                  <p className="text-lg text-gray-600 font-hana-regular">
                    하나인플랜의 계좌를 만들어 볼까요?
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateAccountModalOpen(true)}
                  className="bg-hana-green text-white px-10 py-4 rounded-lg font-hana-medium hover:bg-hana-green/80 transition-colors text-xl"
                >
                  계좌 생성하기
                </button>
            </div>
          </div>

        </Layout>

        {}
        {isCreateAccountModalOpen && user && (
          <CreateAccountModal
            isOpen={isCreateAccountModalOpen}
            onClose={() => setIsCreateAccountModalOpen(false)}
            userId={user.userId}
            onAccountCreated={handleAccountCreated}
          />
        )}
      </>
    );
  }

  return (
    <Layout>
      <div className="p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {}
          <div className="hidden lg:grid lg:grid-cols-5 lg:gap-4">
            {}
            <div className="space-y-4 col-span-2">
              {user ? (
                <AccountInfo
                  onTransferClick={() => setIsTransferModalOpen(true)}
                  riskProfile={riskProfile}
                  key={refreshTrigger}
                />
              ) : (
                <div className="bg-gray-100 w-full h-[240px] rounded-lg flex items-center justify-center">
                  <div className="text-gray-600 font-hana-medium">사용자 정보를 불러오는 중...</div>
                </div>
              )}
            </div>

            {}
            {accounts.length > 0 && (
              <div className="space-y-4 col-span-3">
                <TransactionHistory refreshTrigger={refreshTrigger} />
              </div>
            )}
          </div>

          {}
          <div className="lg:hidden space-y-6">
            {user ? (
              <AccountInfo
                onTransferClick={() => setIsTransferModalOpen(true)}
                riskProfile={riskProfile}
                key={refreshTrigger}
              />
            ) : (
              <div className="bg-gray-100 w-full h-[240px] rounded-lg flex items-center justify-center">
                <div className="text-gray-600 font-hana-medium">사용자 정보를 불러오는 중...</div>
              </div>
            )}
            {accounts.length > 0 && (
              <TransactionHistory refreshTrigger={refreshTrigger} />
            )}
          </div>
        </div>
      </div>

      {}
      {isTransferModalOpen && (
        <TransferModal
          onClose={() => setIsTransferModalOpen(false)}
          onTransferComplete={handleAccountCreated}
        />
      )}

      {}
      {isCreateAccountModalOpen && user && (
        <CreateAccountModal
          isOpen={isCreateAccountModalOpen}
          onClose={() => setIsCreateAccountModalOpen(false)}
          userId={user.userId}
          onAccountCreated={handleAccountCreated}
        />
      )}
    </Layout>
  );
}

export default MyAccount;