import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getIrpTaxBenefits, type IrpTaxBenefitDto } from '../../api/irpApi';

interface IrpTaxBenefitsProps {
  customerId: number;
}

function IrpTaxBenefits({ customerId }: IrpTaxBenefitsProps) {
  const [taxBenefits, setTaxBenefits] = useState<IrpTaxBenefitDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTaxBenefits = async () => {
      try {
        setLoading(true);
        const data = await getIrpTaxBenefits(customerId);
        setTaxBenefits(data);
      } catch (err) {
        setError('세제혜택 정보를 불러오는데 실패했습니다.');
        console.error('IRP 세제혜택 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTaxBenefits();
  }, [customerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hana-green"></div>
        <span className="ml-2 text-gray-600">세제혜택 정보를 불러오는 중...</span>
      </div>
    );
  }

  if (error || !taxBenefits) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-2">오류가 발생했습니다</div>
        <p className="text-gray-600">{error || '세제혜택 정보를 불러올 수 없습니다.'}</p>
      </div>
    );
  }

  // 차트 데이터 준비
  const contributionData = [
    {
      name: '일반 계좌',
      value: 0,
      color: '#e5e7eb'
    },
    {
      name: 'IRP 계좌',
      value: taxBenefits.taxDeductionAmount,
      color: '#008485'
    }
  ];

  const pensionTaxRateData = [
    {
      age: '55-69세',
      rate: taxBenefits.pensionTaxRateTable.age55to69Rate,
      color: '#008485'
    },
    {
      age: '70-79세',
      rate: taxBenefits.pensionTaxRateTable.age70to79Rate,
      color: '#10b981'
    },
    {
      age: '80세+',
      rate: taxBenefits.pensionTaxRateTable.age80PlusRate,
      color: '#3b82f6'
    },
    {
      age: '일반 계좌',
      rate: taxBenefits.pensionTaxRateTable.normalAccountRate,
      color: '#ef4444'
    }
  ];

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h2 className="text-2xl font-hana-bold text-gray-900 mb-2">
          IRP 세제혜택 분석
        </h2>
        <p className="text-gray-600">
          연소득 {taxBenefits.isHighIncome ? '5,500만원 이상' : '5,500만원 미만'} 기준으로 계산된 세제혜택입니다.
        </p>
      </div>

      {/* 1단계: 납입 단계 세액공제 */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-hana-green/10 rounded-full flex items-center justify-center mr-4">
            <span className="text-hana-green font-hana-bold text-xl">1</span>
          </div>
          <div>
            <h3 className="text-xl font-hana-bold text-gray-900">납입 단계 세액공제</h3>
            <p className="text-gray-600">매년 납입할 때마다 받는 세액공제 혜택</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 세액공제 비교 차트 */}
          <div>
            <h4 className="font-hana-medium text-gray-900 mb-4">연간 세액공제 비교</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={contributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString()}원`, '세액공제액']}
                />
                <Bar dataKey="value" fill="#008485" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 세액공제 상세 정보 */}
          <div className="space-y-4">
            <div className="bg-hana-green/5 rounded-lg p-4">
              <div className="text-sm text-hana-green mb-1">연간 납입액</div>
              <div className="text-2xl font-hana-bold text-gray-900">
                {taxBenefits.annualContribution.toLocaleString()}원
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-700 mb-1">세액공제율</div>
              <div className="text-2xl font-hana-bold text-gray-900">
                {taxBenefits.taxDeductionRate}%
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {taxBenefits.isHighIncome ? '연소득 5,500만원 이상' : '연소득 5,500만원 미만'}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-700 mb-1">연간 세액공제액</div>
              <div className="text-2xl font-hana-bold text-gray-900">
                {taxBenefits.taxDeductionAmount.toLocaleString()}원
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2단계: 운용 단계 과세이연 */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-hana-green/10 rounded-full flex items-center justify-center mr-4">
            <span className="text-hana-green font-hana-bold text-xl">2</span>
          </div>
          <div>
            <h3 className="text-xl font-hana-bold text-gray-900">운용 단계 과세이연</h3>
            <p className="text-gray-600">운용 수익에 대한 세금을 나중에 내는 혜택</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 운용 수익 정보 */}
          <div className="space-y-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-700 mb-1">총 납입 원금</div>
              <div className="text-xl font-hana-bold text-gray-900">
                {taxBenefits.totalPrincipal.toLocaleString()}원
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-sm text-orange-700 mb-1">총 운용 수익</div>
              <div className="text-xl font-hana-bold text-gray-900">
                {taxBenefits.totalReturn.toLocaleString()}원
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-sm text-red-700 mb-1">일반 계좌 세금 (15.4%)</div>
              <div className="text-xl font-hana-bold text-gray-900">
                {taxBenefits.returnTaxAmount.toLocaleString()}원
              </div>
            </div>
          </div>

          {/* 과세이연 혜택 */}
          <div className="bg-gradient-to-r from-hana-green/10 to-hana-green/20 rounded-lg p-6">
            <h4 className="font-hana-medium text-gray-900 mb-4">과세이연 혜택</h4>
            <div className="text-center">
              <div className="text-3xl font-hana-bold text-hana-green mb-2">
                {taxBenefits.taxDeferredAmount.toLocaleString()}원
              </div>
              <p className="text-gray-600 text-sm">
                일반 계좌였다면 즉시 낸 세금을<br />
                연금 수령 시까지 미룰 수 있는 혜택
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3단계: 수령 단계 연금소득세 */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-hana-green/10 rounded-full flex items-center justify-center mr-4">
            <span className="text-hana-green font-hana-bold text-xl">3</span>
          </div>
          <div>
            <h3 className="text-xl font-hana-bold text-gray-900">수령 단계 연금소득세</h3>
            <p className="text-gray-600">연금 수령 시 낮은 세율로 세금을 내는 혜택</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 연금소득세율 비교 차트 */}
          <div>
            <h4 className="font-hana-medium text-gray-900 mb-4">연금소득세율 비교</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={pensionTaxRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, '세율']}
                />
                <Bar dataKey="rate" fill="#008485" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 연금소득세 상세 정보 */}
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-700 mb-1">현재 적용 세율 (55-69세)</div>
              <div className="text-xl font-hana-bold text-gray-900">
                {taxBenefits.pensionTaxRate}%
              </div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-sm text-red-700 mb-1">일반 계좌 세율</div>
              <div className="text-xl font-hana-bold text-gray-900">
                {taxBenefits.normalAccountTaxRate}%
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-700 mb-1">연간 절세액</div>
              <div className="text-xl font-hana-bold text-gray-900">
                {taxBenefits.pensionTaxSavings.toLocaleString()}원
              </div>
            </div>
          </div>
        </div>

        {/* 연금소득세율 표 */}
        <div className="mt-8">
          <h4 className="font-hana-medium text-gray-900 mb-4">연금소득세율 표</h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left font-hana-medium">구분</th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-hana-medium">세율</th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-hana-medium">비고</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">55-69세</td>
                  <td className="border border-gray-300 px-4 py-2 text-center font-hana-bold text-hana-green">
                    {taxBenefits.pensionTaxRateTable.age55to69Rate}%
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center text-sm text-gray-600">기본 세율</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">70-79세</td>
                  <td className="border border-gray-300 px-4 py-2 text-center font-hana-bold text-green-600">
                    {taxBenefits.pensionTaxRateTable.age70to79Rate}%
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center text-sm text-gray-600">고령자 할인</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">80세 이상</td>
                  <td className="border border-gray-300 px-4 py-2 text-center font-hana-bold text-blue-600">
                    {taxBenefits.pensionTaxRateTable.age80PlusRate}%
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center text-sm text-gray-600">초고령자 할인</td>
                </tr>
                <tr className="bg-red-50">
                  <td className="border border-gray-300 px-4 py-2 font-hana-medium">일반 계좌</td>
                  <td className="border border-gray-300 px-4 py-2 text-center font-hana-bold text-red-600">
                    {taxBenefits.pensionTaxRateTable.normalAccountRate}%
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center text-sm text-gray-600">즉시 과세</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 총 혜택 요약 */}
      <div className="bg-gradient-to-r from-hana-green/10 to-hana-green/20 rounded-2xl p-8">
        <h3 className="text-xl font-hana-bold text-gray-900 mb-6 text-center">총 세제혜택 요약</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-hana-bold text-hana-green mb-2">
              {taxBenefits.taxDeductionAmount.toLocaleString()}원
            </div>
            <div className="text-sm text-gray-600">연간 세액공제</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-hana-bold text-hana-green mb-2">
              {taxBenefits.taxDeferredAmount.toLocaleString()}원
            </div>
            <div className="text-sm text-gray-600">과세이연 혜택</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-hana-bold text-hana-green mb-2">
              {taxBenefits.pensionTaxSavings.toLocaleString()}원
            </div>
            <div className="text-sm text-gray-600">연금소득세 절세</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IrpTaxBenefits;
