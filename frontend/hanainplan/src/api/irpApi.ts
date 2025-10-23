import axios from 'axios';

// IRP 세제혜택 정보 인터페이스
export interface IrpTaxBenefitDto {
  // 납입 단계 정보
  annualContribution: number; // 연간 납입액
  taxDeductionRate: number; // 세액공제율 (13.2% or 16.5%)
  taxDeductionAmount: number; // 세액공제 금액
  maxContributionLimit: number; // 최대 납입한도 (900만원)
  
  // 운용 단계 정보
  totalPrincipal: number; // 총 납입 원금
  totalReturn: number; // 총 운용 수익
  returnTaxAmount: number; // 일반 계좌였다면 낸 세금 (15.4%)
  taxDeferredAmount: number; // 과세이연 혜택
  
  // 수령 단계 정보
  expectedPensionAge: number; // 연금 수령 예상 나이 (55세)
  pensionTaxRate: number; // 연금소득세율 (5.5%, 4.4%, 3.3%)
  normalAccountTaxRate: number; // 일반 계좌 세율 (15.4%)
  estimatedAnnualPension: number; // 연간 예상 연금 수령액
  pensionTaxAmount: number; // 연금소득세액
  normalAccountTaxAmount: number; // 일반 계좌 세액
  pensionTaxSavings: number; // 연금소득세 절세액
  
  // 연금소득세율 표 정보
  pensionTaxRateTable: PensionTaxRateTable;
  
  // 사용자 정보
  customerId: number;
  customerName: string;
  isHighIncome: boolean; // 연소득 5,500만원 이상 여부
  irpAccountNumber: string;
  irpAccountOpenDate: string;
}

export interface PensionTaxRateTable {
  age55to69Rate: number; // 5.5%
  age70to79Rate: number; // 4.4%
  age80PlusRate: number; // 3.3%
  disabledRate: number; // 3.3%
  normalAccountRate: number; // 15.4%
}

/**
 * 고객의 IRP 세제혜택 정보를 조회합니다.
 * @param customerId 고객 ID
 * @returns IRP 세제혜택 정보
 */
export const getIrpTaxBenefits = async (customerId: number): Promise<IrpTaxBenefitDto> => {
  try {
    const response = await axios.get(`/api/v1/irp-integration/tax-benefits/${customerId}`);
    return response.data;
  } catch (error) {
    console.error('IRP 세제혜택 조회 실패:', error);
    throw error;
  }
};



