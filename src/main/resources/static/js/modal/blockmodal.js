const modalOverlay = document.getElementById("modalOverlay");
const actionSheet = document.getElementById("actionSheet");
const reportBtn = document.getElementById("reportBtn");
const reportReason = document.getElementById("reportReason");
const reportComplete = document.getElementById("reportComplete");
const reasonCloseBtn = document.getElementById("reasonCloseBtn");
const closeCompleteBtn = document.getElementById("closeCompleteBtn");
const blockBtn = document.getElementById("blockBtn");
const blockConfirm = document.getElementById("blockConfirm");
const confirmBlockBtn = document.getElementById("confirmBlockBtn");
const blockCancelBtn = document.getElementById("blockCancelBtn");
const blockTargetName = document.getElementById("blockTargetName");
const blockDone = document.getElementById("blockDone");
const blockDoneName = document.getElementById("blockDoneName");
const blockDoneBtn = document.getElementById("blockDoneBtn");

// 1단계 취소 → 모달 닫기
document.getElementById("cancelBtn").addEventListener("click", () => {
    modalOverlay.style.display = "none";
});

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

// 사유 선택 시 → 신고 완료 화면으로 전환
document.querySelectorAll(".reason-item").forEach((item) => {
    item.addEventListener("click", () => {
        const reason = item.dataset.reason;
        console.log("신고 사유:", reason);
        // TODO: 신고 API 호출
        reportReason.classList.remove("active");
        reportComplete.classList.add("active");
    });
});

// 신고 완료 닫기 → 모달 닫기
closeCompleteBtn.addEventListener("click", () => {
    reportComplete.classList.remove("active");
    modalOverlay.style.display = "none";
});

// 차단 버튼 → 차단 확인 화면으로 전환
blockBtn.addEventListener("click", () => {
    actionSheet.style.display = "none";
    blockConfirm.classList.add("active");
});

// 차단 취소 → 1단계로 돌아가기
blockCancelBtn.addEventListener("click", () => {
    blockConfirm.classList.remove("active");
    actionSheet.style.display = "";
});

// 차단 확정 → 차단 완료 알림으로 전환
confirmBlockBtn.addEventListener("click", () => {
    const targetName = blockTargetName.textContent;
    blockDoneName.textContent = targetName;
    blockConfirm.classList.remove("active");
    blockDone.classList.add("active");
    console.log("차단 대상:", targetName);
    // TODO: 차단 API 호출
});

// 차단 완료 닫기 → 모달 닫기
blockDoneBtn.addEventListener("click", () => {
    blockDone.classList.remove("active");
    modalOverlay.style.display = "none";
});
