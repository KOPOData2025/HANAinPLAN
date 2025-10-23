package com.hanainplan.domain.banking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IrpTaxBenefitDto {
    
    // 납입 단계 정보
    private BigDecimal annualContribution; // 연간 납입액
    private BigDecimal taxDeductionRate; // 세액공제율 (13.2% or 16.5%)
    private BigDecimal taxDeductionAmount; // 세액공제 금액
    private BigDecimal maxContributionLimit; // 최대 납입한도 (900만원)
    
    // 운용 단계 정보
    private BigDecimal totalPrincipal; // 총 납입 원금
    private BigDecimal totalReturn; // 총 운용 수익
    private BigDecimal returnTaxAmount; // 일반 계좌였다면 낸 세금 (15.4%)
    private BigDecimal taxDeferredAmount; // 과세이연 혜택
    
    // 수령 단계 정보
    private Integer expectedPensionAge; // 연금 수령 예상 나이 (55세)
    private BigDecimal pensionTaxRate; // 연금소득세율 (5.5%, 4.4%, 3.3%)
    private BigDecimal normalAccountTaxRate; // 일반 계좌 세율 (15.4%)
    private BigDecimal estimatedAnnualPension; // 연간 예상 연금 수령액
    private BigDecimal pensionTaxAmount; // 연금소득세액
    private BigDecimal normalAccountTaxAmount; // 일반 계좌 세액
    private BigDecimal pensionTaxSavings; // 연금소득세 절세액
    
    // 연금소득세율 표 정보
    private PensionTaxRateTable pensionTaxRateTable;
    
    // 사용자 정보
    private Long customerId;
    private String customerName;
    private Boolean isHighIncome; // 연소득 5,500만원 이상 여부
    private String irpAccountNumber;
    private LocalDate irpAccountOpenDate;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PensionTaxRateTable {
        private BigDecimal age55to69Rate; // 5.5%
        private BigDecimal age70to79Rate; // 4.4%
        private BigDecimal age80PlusRate; // 3.3%
        private BigDecimal disabledRate; // 3.3%
        private BigDecimal normalAccountRate; // 15.4%
    }
    
    // 정적 팩토리 메서드
    public static IrpTaxBenefitDto createEmpty(Long customerId) {
        return IrpTaxBenefitDto.builder()
                .customerId(customerId)
                .annualContribution(BigDecimal.ZERO)
                .taxDeductionRate(BigDecimal.ZERO)
                .taxDeductionAmount(BigDecimal.ZERO)
                .maxContributionLimit(new BigDecimal("9000000"))
                .totalPrincipal(BigDecimal.ZERO)
                .totalReturn(BigDecimal.ZERO)
                .returnTaxAmount(BigDecimal.ZERO)
                .taxDeferredAmount(BigDecimal.ZERO)
                .expectedPensionAge(55)
                .pensionTaxRate(new BigDecimal("5.5"))
                .normalAccountTaxRate(new BigDecimal("15.4"))
                .estimatedAnnualPension(BigDecimal.ZERO)
                .pensionTaxAmount(BigDecimal.ZERO)
                .normalAccountTaxAmount(BigDecimal.ZERO)
                .pensionTaxSavings(BigDecimal.ZERO)
                .pensionTaxRateTable(PensionTaxRateTable.builder()
                        .age55to69Rate(new BigDecimal("5.5"))
                        .age70to79Rate(new BigDecimal("4.4"))
                        .age80PlusRate(new BigDecimal("3.3"))
                        .disabledRate(new BigDecimal("3.3"))
                        .normalAccountRate(new BigDecimal("15.4"))
                        .build())
                .build();
    }
}



