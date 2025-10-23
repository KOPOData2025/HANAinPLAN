package com.hanainplan.kookmin.account.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class TransactionRequestDto {

    @NotBlank(message = "계좌번호는 필수입니다.")
    private String accountNumber;

    @NotBlank(message = "거래유형은 필수입니다.")
    private String transactionType;

    @NotBlank(message = "거래카테고리는 필수입니다.")
    private String transactionCategory;

    @NotNull(message = "거래금액은 필수입니다.")
    @Positive(message = "거래금액은 양수여야 합니다.")
    private BigDecimal amount;

    @NotNull(message = "거래 후 잔액은 필수입니다.")
    private BigDecimal balanceAfter;

    @NotNull(message = "거래일시는 필수입니다.")
    private LocalDateTime transactionDatetime;

    private String description;

    private String branchName;
}



