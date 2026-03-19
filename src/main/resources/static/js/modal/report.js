const actionSheet = document.getElementById("actionSheet");
const reportReason = document.getElementById("reportReason");
const reportComplete = document.getElementById("reportComplete");
const reportBtn = document.getElementById("reportBtn");
const reasonCloseBtn = document.getElementById("reasonCloseBtn");
const closeCompleteBtn = document.getElementById("closeCompleteBtn");

// 신고 버튼 → 사유 선택 화면으로 전환
reportBtn.addEventListener("click", () => {
    actionSheet.style.display = "none";
    reportReason.classList.add("active");
});

// X 버튼 → 1단계로 돌아가기
reasonCloseBtn.addEventListener("click", () => {
    reportReason.classList.remove("active");
    actionSheet.style.display = "";
});

// 사유 선택 시 → 3단계 신고 완료 화면으로 전환
document.querySelectorAll(".reason-item").forEach((item) => {
    item.addEventListener("click", () => {
        const reason = item.dataset.reason;
        console.log("신고 사유:", reason);
        // TODO: 신고 API 호출
        reportReason.classList.remove("active");
        reportComplete.classList.add("active");
    });
});

// 닫기 버튼 → 모달 전체 닫기
closeCompleteBtn.addEventListener("click", () => {
    reportComplete.classList.remove("active");
    actionSheet.style.display = "";
    // TODO: 모달 오버레이 닫기 처리
});
