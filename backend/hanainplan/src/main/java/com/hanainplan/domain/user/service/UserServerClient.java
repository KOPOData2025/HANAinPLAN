package com.hanainplan.domain.user.service;

import com.hanainplan.domain.user.dto.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
public class UserServerClient {

    private final RestTemplate restTemplate;
    private final String userServerUrl;

    public UserServerClient(RestTemplate restTemplate, @Value("${user.server.url:https://user-production-3188.up.railway.app}") String userServerUrl) {
        this.restTemplate = restTemplate;
        this.userServerUrl = userServerUrl;
    }

    public PhoneVerificationResponseDto sendVerificationCode(String phoneNumber) {
        try {
            String url = userServerUrl + "/api/user/phone/send";

            // 전화번호 형식 변환 (01012345678 -> 010-1234-5678)
            String formattedPhoneNumber = formatPhoneNumber(phoneNumber);
            PhoneVerificationRequestDto request = new PhoneVerificationRequestDto(formattedPhoneNumber);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<PhoneVerificationRequestDto> entity = new HttpEntity<>(request, headers);

            ResponseEntity<PhoneVerificationResponseDto> response = restTemplate.postForEntity(
                url, entity, PhoneVerificationResponseDto.class);

            log.info("인증번호 발송 요청 성공: phoneNumber={}, response={}", phoneNumber, response.getBody());
            return response.getBody();

        } catch (Exception e) {
            log.error("인증번호 발송 요청 실패: phoneNumber={}", phoneNumber, e);
            return new PhoneVerificationResponseDto(false, "인증번호 발송에 실패했습니다.", null);
        }
    }

    public VerifyCodeResponseDto verifyCode(String phoneNumber, String verificationCode) {
        try {
            String url = userServerUrl + "/api/user/phone/verify";

            // 전화번호 형식 변환 (01012345678 -> 010-1234-5678)
            String formattedPhoneNumber = formatPhoneNumber(phoneNumber);
            VerifyCodeRequestDto request = new VerifyCodeRequestDto(formattedPhoneNumber, verificationCode);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<VerifyCodeRequestDto> entity = new HttpEntity<>(request, headers);

            ResponseEntity<VerifyCodeResponseDto> response = restTemplate.postForEntity(
                url, entity, VerifyCodeResponseDto.class);

            log.info("인증번호 검증 요청 성공: phoneNumber={}, verified={}", phoneNumber, response.getBody().isVerified());
            return response.getBody();

        } catch (Exception e) {
            log.error("인증번호 검증 요청 실패: phoneNumber={}, verificationCode={}", phoneNumber, verificationCode, e);
            return new VerifyCodeResponseDto(false, "인증번호 검증에 실패했습니다.", false);
        }
    }

    public VerifyCodeResponseDto checkVerificationStatus(String phoneNumber) {
        try {
            // 전화번호 형식 변환 (01012345678 -> 010-1234-5678)
            String formattedPhoneNumber = formatPhoneNumber(phoneNumber);
            String url = userServerUrl + "/api/user/phone/status/" + formattedPhoneNumber;

            ResponseEntity<VerifyCodeResponseDto> response = restTemplate.getForEntity(
                url, VerifyCodeResponseDto.class);

            log.info("인증 상태 확인 요청 성공: phoneNumber={}, verified={}", phoneNumber, response.getBody().isVerified());
            return response.getBody();

        } catch (Exception e) {
            log.error("인증 상태 확인 요청 실패: phoneNumber={}", phoneNumber, e);
            return new VerifyCodeResponseDto(false, "인증 상태 확인에 실패했습니다.", false);
        }
    }

    private String formatPhoneNumber(String phoneNumber) {
        if (phoneNumber == null) {
            return null;
        }
        
        // 하이픈 제거
        String cleaned = phoneNumber.replaceAll("-", "");
        
        // 010으로 시작하는 11자리 숫자인지 확인
        if (cleaned.matches("^010\\d{8}$")) {
            return cleaned.substring(0, 3) + "-" + cleaned.substring(3, 7) + "-" + cleaned.substring(7);
        }
        
        // 이미 올바른 형식인 경우 그대로 반환
        if (cleaned.matches("^010-\\d{4}-\\d{4}$")) {
            return phoneNumber;
        }
        
        return phoneNumber;
    }
}