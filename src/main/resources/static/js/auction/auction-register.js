// ── 탭 전환 (판매 입찰 / 즉시 판매) ──
function switchTab(type) {
    const tabBid = document.getElementById("tabBid");
    const tabImmediate = document.getElementById("tabImmediate");
    const submitBtn = document.querySelector(".ar-submit-btn");

    if (type === "bid") {
        tabBid.classList.add("ar-action-tab--active");
        tabImmediate.classList.remove("ar-action-tab--active");
        submitBtn.textContent = "판매 입찰 계속";
    } else {
        tabImmediate.classList.add("ar-action-tab--active");
        tabBid.classList.remove("ar-action-tab--active");
        submitBtn.textContent = "즉시 판매 계속";
    }
    recalculate();
}

// ── 마감기한 누적 ──
let totalHours = 0;

function formatDeadline(hours) {
    if (hours <= 0) return "0시간";
    const months = Math.floor(hours / 720);
    const days = Math.floor((hours % 720) / 24);
    const h = hours % 24;
    return [
        months > 0 ? `${months}달` : "",
        days > 0 ? `${days}일` : "",
        h > 0 ? `${h}시간` : "",
    ]
        .filter(Boolean)
        .join(" ");
}

function selectDeadline(btn) {
    totalHours += parseInt(btn.dataset.hours);
    document.getElementById("deadlineSelected").textContent =
        formatDeadline(totalHours);

    // 클릭 피드백 애니메이션
    btn.classList.add("ar-deadline-btn--active");
    setTimeout(() => btn.classList.remove("ar-deadline-btn--active"), 300);
}

function resetDeadline() {
    totalHours = 0;
    document.getElementById("deadlineSelected").textContent = "0시간";
}

// ── 가격 입력 포맷 (천 단위 콤마) ──
function onPriceInput(input) {
    const raw = input.value.replace(/[^0-9]/g, "");
    input.value = raw ? Number(raw).toLocaleString() : "";
    recalculate();
}

// ── 정산금액 재계산 (수수료 10%) ──
function recalculate() {
    const input = document.getElementById("sellPrice");
    const raw = parseInt(input.value.replace(/[^0-9]/g, "")) || 0;

    const feeRate = 0.1;
    const fee = Math.round(raw * feeRate);
    const settlement = raw - fee;

    document.getElementById("feeAmount").textContent =
        fee > 0 ? `-${fee.toLocaleString()}원` : "0원";
    document.getElementById("settlementAmount").textContent =
        settlement > 0 ? `${settlement.toLocaleString()}원` : "0원";
}

// ── 제출 ──
function submitAuction() {
    const price = document
        .getElementById("sellPrice")
        .value.replace(/[^0-9]/g, "");
    if (!price || parseInt(price) <= 0) {
        alert("판매 희망가를 입력해주세요.");
        return;
    }
    if (totalHours <= 0) {
        alert("입찰 마감기한을 선택해주세요.");
        return;
    }
    alert(
        `판매 입찰이 등록되었습니다.\n희망가: ${parseInt(price).toLocaleString()}원 / 마감기한: ${formatDeadline(totalHours)}`,
    );
}

// ── 모달 닫기 ──
function closeModal() {
    const modal = document.getElementById("arModal");
    const backdrop = document.getElementById("arBackdrop");
    modal.style.animation = "none";
    modal.style.transform =
        window.innerWidth >= 641
            ? "translateX(-50%) translateY(calc(50% + 40px))"
            : "translateX(-50%) translateY(100%)";
    modal.style.opacity = "0";
    modal.style.transition =
        "transform 0.28s cubic-bezier(0.4,0,1,1), opacity 0.28s";
    backdrop.style.transition = "opacity 0.28s";
    backdrop.style.opacity = "0";
    setTimeout(() => {
        window.history.back();
    }, 280);
}

// ── 초기화 ──
document.addEventListener("DOMContentLoaded", () => {
    recalculate();
});
