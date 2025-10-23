package com.hanainplan.user.service;

import lombok.extern.slf4j.Slf4j;
import net.nurigo.sdk.NurigoApp;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.request.SingleMessageSendingRequest;
import net.nurigo.sdk.message.response.SingleMessageSentResponse;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Slf4j
@Service
public class SmsService {

    @Value("${coolsms.api-key}")
    private String apiKey;

    @Value("${coolsms.api-secret}")
    private String apiSecret;

    @Value("${coolsms.from-number}")
    private String fromNumber;

    @Value("${coolsms.test-number}")
    private String testNumber;

    private DefaultMessageService messageService;

    @PostConstruct
    public void init() {
        if (apiKey != null && !apiKey.isEmpty() && apiSecret != null && !apiSecret.isEmpty()) {
            this.messageService = NurigoApp.INSTANCE.initialize(apiKey, apiSecret, "https://api.coolsms.co.kr");
            log.info("CoolSMS SDK 초기화 완료");
        } else {
            log.warn("CoolSMS API 키가 설정되지 않았습니다. SMS 전송 기능이 비활성화됩니다.");
        }
    }

    /**
     * 인증번호를 SMS로 전송합니다.
     * 실제로는 하드코딩된 테스트 번호로만 전송됩니다.
     *
     * @param phoneNumber 사용자 전화번호 (실제로는 사용되지 않음)
     * @param verificationCode 인증번호
     * @return 전송 성공 여부
     */
    public boolean sendVerificationCode(String phoneNumber, String verificationCode) {
        try {
            Message message = new Message();
            message.setFrom(fromNumber);
            message.setTo(testNumber); // 하드코딩된 테스트 번호로 전송
            message.setText("[HANAinPLAN] 인증번호는 " + verificationCode + "입니다.");

            SingleMessageSentResponse response = this.messageService.sendOne(new SingleMessageSendingRequest(message));
            
            log.info("SMS 전송 성공: phoneNumber={}, testNumber={}, code={}, messageId={}", 
                    phoneNumber, testNumber, verificationCode, response.getMessageId());
            
            return true;

        } catch (Exception e) {
            log.error("SMS 전송 실패: phoneNumber={}, testNumber={}, code={}", 
                    phoneNumber, testNumber, verificationCode, e);
            return false;
        }
    }
}
