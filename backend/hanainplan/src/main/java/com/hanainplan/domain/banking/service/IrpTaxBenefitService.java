package com.hanainplan.domain.banking.service;

import com.hanainplan.domain.banking.dto.AccountComparisonResult;
import com.hanainplan.domain.banking.dto.IrpTaxBenefitDto;
import com.hanainplan.domain.banking.dto.TaxBenefitResult;
import com.hanainplan.domain.banking.repository.DepositPortfolioRepository;
import com.hanainplan.domain.banking.repository.IrpAccountRepository;
import com.hanainplan.domain.user.entity.Customer;
import com.hanainplan.domain.user.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class IrpTaxBenefitService {

    private final CustomerRepository customerRepository;
    private final IrpAccountRepository irpAccountRepository;
    private final DepositPortfolioRepository depositPortfolioRepository;

    private static final BigDecimal DEDUCTION_LIMIT = new BigDecimal("9000000"); // IRP 최대 납입한도
    private static final BigDecimal HIGH_DEDUCTION_RATE = new BigDecimal("0.165"); // 16.5%
    private static final BigDecimal LOW_DEDUCTION_RATE = new BigDecimal("0.132"); // 13.2%
    private static final BigDecimal SALARY_THRESHOLD = new BigDecimal("55000000"); // 5,500만원
    
    private static final BigDecimal REGULAR_TAX_RATE = new BigDecimal("0.154"); // 15.4%
    private static final BigDecimal PENSION_TAX_RATE_55_69 = new BigDecimal("0.055"); // 5.5%
    private static final BigDecimal PENSION_TAX_RATE_70_79 = new BigDecimal("0.044"); // 4.4%
    private static final BigDecimal PENSION_TAX_RATE_80_PLUS = new BigDecimal("0.033"); // 3.3%

    public TaxBenefitResult calculateTaxBenefit(BigDecimal annualDeposit, BigDecimal annualSalary) {
        log.info("IRP 세액공제 계산 - 납입액: {}, 연봉: {}", annualDeposit, annualSalary);

        BigDecimal deductibleAmount = annualDeposit.min(DEDUCTION_LIMIT);

        BigDecimal deductionRate;
        String salaryBracket;
        
        if (annualSalary.compareTo(SALARY_THRESHOLD) <= 0) {
            deductionRate = HIGH_DEDUCTION_RATE;
            salaryBracket = "5,500만원 이하";
        } else {
            deductionRate = LOW_DEDUCTION_RATE;
            salaryBracket = "5,500만원 초과";
        }

        BigDecimal taxDeduction = deductibleAmount
                .multiply(deductionRate)
                .setScale(0, RoundingMode.DOWN);

        log.info("세액공제 계산 완료 - 공제 대상: {}, 공제율: {}%, 공제액: {}",
                deductibleAmount, deductionRate.multiply(BigDecimal.valueOf(100)), taxDeduction);

        return TaxBenefitResult.builder()
                .depositAmount(annualDeposit)
                .deductibleAmount(deductibleAmount)
                .deductionRate(deductionRate)
                .taxDeduction(taxDeduction)
                .effectiveSavings(taxDeduction)
                .salaryBracket(salaryBracket)
                .build();
    }

    public AccountComparisonResult compareAccounts(
            BigDecimal investmentAmount,
            BigDecimal expectedReturn,
            BigDecimal annualSalary) {
        
        log.info("일반계좌 vs IRP 비교 - 투자금: {}, 예상수익: {}, 연봉: {}",
                investmentAmount, expectedReturn, annualSalary);

        BigDecimal regularTax = expectedReturn
                .multiply(REGULAR_TAX_RATE)
                .setScale(0, RoundingMode.DOWN);
        BigDecimal regularNetReturn = expectedReturn.subtract(regularTax);

        TaxBenefitResult irpBenefit = calculateTaxBenefit(investmentAmount, annualSalary);
        
        BigDecimal pensionTax = expectedReturn
                .multiply(PENSION_TAX_RATE_55_69)
                .setScale(0, RoundingMode.DOWN);
        BigDecimal irpNetReturn = expectedReturn.subtract(pensionTax);

        BigDecimal taxSavingFromLowerRate = regularTax.subtract(pensionTax);
        BigDecimal totalIrpBenefit = irpBenefit.getTaxDeduction().add(taxSavingFromLowerRate);
        
        BigDecimal totalRegularNet = regularNetReturn;
        BigDecimal totalIrpNet = irpNetReturn.add(irpBenefit.getTaxDeduction());
        BigDecimal advantageAmount = totalIrpNet.subtract(totalRegularNet);
        
        BigDecimal advantageRate = BigDecimal.ZERO;
        if (investmentAmount.compareTo(BigDecimal.ZERO) > 0) {
            advantageRate = advantageAmount
                    .divide(investmentAmount, 4, RoundingMode.HALF_UP);
        }

        log.info("비교 결과 - 일반계좌 순이익: {}, IRP 순이익: {}, IRP 우위: {}",
                totalRegularNet, totalIrpNet, advantageAmount);

        return AccountComparisonResult.builder()
                .investmentAmount(investmentAmount)
                .expectedReturn(expectedReturn)
                .regularAccountTax(regularTax)
                .regularAccountNetReturn(regularNetReturn)
                .irpTaxDeduction(irpBenefit.getTaxDeduction())
                .irpPensionTax(pensionTax)
                .irpNetReturn(irpNetReturn)
                .totalIrpBenefit(totalIrpBenefit)
                .advantageAmount(advantageAmount)
                .advantageRate(advantageRate)
                .build();
    }

    /**
     * 고객의 IRP 세제혜택을 종합적으로 계산
     */
    public IrpTaxBenefitDto calculateComprehensiveTaxBenefit(Long customerId) {
        log.info("IRP 종합 세제혜택 계산 시작 - 고객 ID: {}", customerId);

        // 고객 정보 조회
        Optional<Customer> customerOpt = customerRepository.findById(customerId);
        if (customerOpt.isEmpty()) {
            log.warn("고객을 찾을 수 없습니다 - 고객 ID: {}", customerId);
            return IrpTaxBenefitDto.createEmpty(customerId);
        }

        Customer customer = customerOpt.get();

        // IRP 계좌 조회
        Optional<com.hanainplan.domain.banking.entity.IrpAccount> irpAccountOpt = 
                irpAccountRepository.findByCustomerIdAndAccountStatus(customerId, "ACTIVE");
        
        if (irpAccountOpt.isEmpty()) {
            log.warn("활성화된 IRP 계좌가 없습니다 - 고객 ID: {}", customerId);
            return IrpTaxBenefitDto.createEmpty(customerId);
        }

        com.hanainplan.domain.banking.entity.IrpAccount irpAccount = irpAccountOpt.get();

        // IRP 계좌의 총 납입액 계산 (deposit_portfolio 테이블에서)
        BigDecimal totalPrincipal = calculateTotalPrincipal(irpAccount.getAccountNumber());
        
        // 운용 수익 계산 (현재 잔액 - 총 납입액)
        BigDecimal currentBalance = irpAccount.getCurrentBalance() != null ? 
                irpAccount.getCurrentBalance() : BigDecimal.ZERO;
        BigDecimal totalReturn = currentBalance.subtract(totalPrincipal);

        // 연간 납입액 추정 (총 납입액을 계좌 개설 기간으로 나눔)
        BigDecimal annualContribution = calculateAnnualContribution(irpAccount.getAccountNumber());

        // 세액공제 계산
        BigDecimal taxDeductionRate = Boolean.TRUE.equals(customer.getIsHighIncome()) ? 
                LOW_DEDUCTION_RATE : HIGH_DEDUCTION_RATE;
        BigDecimal deductibleAmount = annualContribution.min(DEDUCTION_LIMIT);
        BigDecimal taxDeductionAmount = deductibleAmount.multiply(taxDeductionRate)
                .setScale(0, RoundingMode.DOWN);

        // 운용 단계 과세이연 혜택 계산
        BigDecimal returnTaxAmount = totalReturn.multiply(REGULAR_TAX_RATE)
                .setScale(0, RoundingMode.DOWN);
        BigDecimal taxDeferredAmount = returnTaxAmount; // 과세이연된 세금

        // 수령 단계 연금소득세 계산 (55세 기준)
        BigDecimal pensionTaxRate = PENSION_TAX_RATE_55_69; // 기본적으로 55-69세 세율 적용
        BigDecimal pensionTaxAmount = totalReturn.multiply(pensionTaxRate)
                .setScale(0, RoundingMode.DOWN);
        BigDecimal normalAccountTaxAmount = totalReturn.multiply(REGULAR_TAX_RATE)
                .setScale(0, RoundingMode.DOWN);
        BigDecimal pensionTaxSavings = normalAccountTaxAmount.subtract(pensionTaxAmount);

        // 연간 예상 연금 수령액 (총 자산을 20년으로 나눔)
        BigDecimal estimatedAnnualPension = currentBalance.divide(new BigDecimal("20"), 0, RoundingMode.DOWN);

        log.info("IRP 세제혜택 계산 완료 - 고객 ID: {}, 총 납입액: {}, 운용 수익: {}, 세액공제액: {}", 
                customerId, totalPrincipal, totalReturn, taxDeductionAmount);

        return IrpTaxBenefitDto.builder()
                .customerId(customerId)
                .customerName(customer.getCustomerId().toString()) // 실제로는 이름이 필요하지만 현재 구조상 ID 사용
                .isHighIncome(customer.getIsHighIncome())
                .irpAccountNumber(irpAccount.getAccountNumber())
                .irpAccountOpenDate(irpAccount.getOpenDate())
                .annualContribution(annualContribution)
                .taxDeductionRate(taxDeductionRate.multiply(new BigDecimal("100")))
                .taxDeductionAmount(taxDeductionAmount)
                .maxContributionLimit(DEDUCTION_LIMIT)
                .totalPrincipal(totalPrincipal)
                .totalReturn(totalReturn)
                .returnTaxAmount(returnTaxAmount)
                .taxDeferredAmount(taxDeferredAmount)
                .expectedPensionAge(55)
                .pensionTaxRate(pensionTaxRate.multiply(new BigDecimal("100")))
                .normalAccountTaxRate(REGULAR_TAX_RATE.multiply(new BigDecimal("100")))
                .estimatedAnnualPension(estimatedAnnualPension)
                .pensionTaxAmount(pensionTaxAmount)
                .normalAccountTaxAmount(normalAccountTaxAmount)
                .pensionTaxSavings(pensionTaxSavings)
                .pensionTaxRateTable(IrpTaxBenefitDto.PensionTaxRateTable.builder()
                        .age55to69Rate(PENSION_TAX_RATE_55_69.multiply(new BigDecimal("100")))
                        .age70to79Rate(PENSION_TAX_RATE_70_79.multiply(new BigDecimal("100")))
                        .age80PlusRate(PENSION_TAX_RATE_80_PLUS.multiply(new BigDecimal("100")))
                        .disabledRate(PENSION_TAX_RATE_80_PLUS.multiply(new BigDecimal("100")))
                        .normalAccountRate(REGULAR_TAX_RATE.multiply(new BigDecimal("100")))
                        .build())
                .build();
    }

    /**
     * IRP 계좌의 총 납입 원금 계산
     */
    private BigDecimal calculateTotalPrincipal(String irpAccountNumber) {
        // deposit_portfolio 테이블에서 해당 IRP 계좌의 모든 상품의 principalAmount 합계
        // 실제 구현에서는 repository를 통해 조회
        // 현재는 임시로 0 반환
        return BigDecimal.ZERO;
    }

    /**
     * 연간 납입액 계산
     */
    private BigDecimal calculateAnnualContribution(String irpAccountNumber) {
        // 실제로는 계좌 개설일부터 현재까지의 기간을 계산하여 연간 평균 납입액 산출
        // 현재는 임시로 300만원 반환
        return new BigDecimal("3000000");
    }
}

