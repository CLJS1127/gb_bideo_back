const blockBtn = document.getElementById("blockBtn");
const blockConfirm = document.getElementById("blockConfirm");
const confirmBlockBtn = document.getElementById("confirmBlockBtn");
const blockCancelBtn = document.getElementById("blockCancelBtn");
const blockTargetName = document.getElementById("blockTargetName");

// 차단 버튼 → 차단 확인 화면으로 전환
blockBtn.addEventListener("click", () => {
    actionSheet.style.display = "none";
    blockConfirm.classList.add("active");
});

// 취소 → 1단계로 돌아가기
blockCancelBtn.addEventListener("click", () => {
    blockConfirm.classList.remove("active");
    actionSheet.style.display = "";
});

const blockDone = document.getElementById("blockDone");
const blockDoneName = document.getElementById("blockDoneName");
const blockDoneBtn = document.getElementById("blockDoneBtn");

// 차단 확정 → 3단계 완료 알림으로 전환
confirmBlockBtn.addEventListener("click", () => {
    const targetName = blockTargetName.textContent;
    blockDoneName.textContent = targetName;
    blockConfirm.classList.remove("active");
    blockDone.classList.add("active");
    console.log("차단 대상:", targetName);
    // TODO: 차단 API 호출
});

// 닫기 → 모달 종료
blockDoneBtn.addEventListener("click", () => {
    blockDone.classList.remove("active");
    // TODO: 모달 닫기 또는 페이지 이동
});
