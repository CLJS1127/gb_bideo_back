package com.app.bideo.controller.member;

import com.app.bideo.domain.member.MemberVO;
import com.app.bideo.dto.member.EmailVerificationConfirmRequestDTO;
import com.app.bideo.dto.member.EmailVerificationSendRequestDTO;
import com.app.bideo.dto.member.MemberSignupRequestDTO;
import com.app.bideo.dto.member.PasswordResetRequestDTO;
import com.app.bideo.dto.member.PhoneVerificationConfirmRequestDTO;
import com.app.bideo.dto.member.PhoneVerificationSendRequestDTO;
import com.app.bideo.service.member.AuthService;
import com.app.bideo.service.member.MailService;
import com.app.bideo.service.member.SmsService;
import com.app.bideo.service.member.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final SmsService smsService;
    private final MailService mailService;
    private final VerificationService verificationService;

    // 회원가입 처리
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody MemberSignupRequestDTO requestDTO) {
        MemberVO memberVO = authService.signup(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", memberVO.getId(),
                "email", memberVO.getEmail(),
                "nickname", memberVO.getNickname()
        ));
    }

    // 휴대폰 인증번호 전송
    @PostMapping("/verification/phone/send")
    public ResponseEntity<?> sendPhoneVerificationCode(@RequestBody PhoneVerificationSendRequestDTO requestDTO) {
        try {
            verificationService.sendPhoneVerificationCode(requestDTO.getPhoneNumber(), smsService);
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of(
                    "message", "문자 인증번호 전송에 실패했습니다. 잠시 후 다시 시도해 주세요."
            ));
        }
        return ResponseEntity.ok(Map.of("message", "인증번호를 전송했습니다."));
    }

    // 휴대폰 인증번호 확인
    @PostMapping("/verification/phone/confirm")
    public ResponseEntity<?> confirmPhoneVerificationCode(@RequestBody PhoneVerificationConfirmRequestDTO requestDTO) {
        verificationService.verifyPhoneCode(requestDTO.getPhoneNumber(), requestDTO.getVerificationCode());
        MemberVO memberVO = authService.findActiveMemberByPhoneNumber(requestDTO.getPhoneNumber());
        return ResponseEntity.ok(Map.of(
                "message", "전화번호 인증이 완료되었습니다.",
                "email", memberVO.getEmail()
        ));
    }

    // 이메일 인증번호 전송
    @PostMapping("/verification/email/send")
    public ResponseEntity<?> sendEmailVerificationCode(@RequestBody EmailVerificationSendRequestDTO requestDTO) {
        authService.findActiveMemberByEmail(requestDTO.getEmail());
        try {
            verificationService.sendEmailVerificationCode(requestDTO.getEmail(), mailService);
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of(
                    "message", "이메일 인증번호 전송에 실패했습니다. 잠시 후 다시 시도해 주세요."
            ));
        }
        return ResponseEntity.ok(Map.of("message", "인증번호를 전송했습니다."));
    }

    // 이메일 인증번호 확인
    @PostMapping("/verification/email/confirm")
    public ResponseEntity<?> confirmEmailVerificationCode(@RequestBody EmailVerificationConfirmRequestDTO requestDTO) {
        authService.findActiveMemberByEmail(requestDTO.getEmail());
        verificationService.verifyEmailCode(requestDTO.getEmail(), requestDTO.getVerificationCode());
        return ResponseEntity.ok(Map.of("message", "이메일 인증이 완료되었습니다."));
    }

    // 이메일 인증 후 비밀번호 재설정
    @PostMapping("/password/reset")
    public ResponseEntity<?> resetPassword(@RequestBody PasswordResetRequestDTO requestDTO) {
        verificationService.verifyEmailCode(requestDTO.getEmail(), requestDTO.getVerificationCode());
        authService.resetPasswordByEmail(requestDTO.getEmail(), requestDTO.getNewPassword(), requestDTO.getConfirmPassword());
        verificationService.clearEmailCode(requestDTO.getEmail());
        return ResponseEntity.ok(Map.of("message", "비밀번호가 변경되었습니다."));
    }
}
