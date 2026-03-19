// admin-service.js - 서버 API 통신 관련 스크립트 처리

const BIDEO_SERVICE = {
    // 문의 답변 등록 및 이메일 발송 API 호출
    sendInquiryAnswer: async (inquiryId, answerContent) => {
        console.log(`[API] 문의번호 #${inquiryId}에 대한 답변 등록 및 메일 발송 시작...`);
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const isSuccess = true;
                if (isSuccess) {
                    resolve({ success: true, message: "이메일이 성공적으로 발송되었습니다." });
                } else {
                    reject({ success: false, message: "이메일 발송에 실패했습니다. 다시 시도해 주세요." });
                }
            }, 1500);
        });
    }
};
