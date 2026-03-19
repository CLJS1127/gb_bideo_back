/* ── 마감 카운트다운 ── */
const END_TIME = new Date("2026-03-28T16:00:00");
function tick() {
    const diff = END_TIME - Date.now();
    if (diff <= 0) {
        ["cdDay", "cdHour", "cdMin", "cdSec"].forEach(
            (id) => (document.getElementById(id).textContent = "00"),
        );
        return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    document.getElementById("cdDay").textContent = String(d).padStart(2, "0");
    document.getElementById("cdHour").textContent = String(h).padStart(2, "0");
    document.getElementById("cdMin").textContent = String(m).padStart(2, "0");
    document.getElementById("cdSec").textContent = String(s).padStart(2, "0");
}
tick();
setInterval(tick, 1000);

/* ── 입찰 금액 조절 ── */
let bidVal = 5500000;
const BID_UNIT = 500000;
const MIN_BID = 5500000;

function changeBid(delta) {
    const next = bidVal + delta;
    if (next < MIN_BID) return;
    bidVal = next;
    document.getElementById("bidDisplay").textContent =
        bidVal.toLocaleString("ko-KR");
}

/* ── 입찰하기 ── */
function doBid() {
    const priceEl = document.getElementById("curPrice");
    const countEl = document.getElementById("bidCount");
    priceEl.textContent = bidVal.toLocaleString("ko-KR");
    countEl.textContent = parseInt(countEl.textContent) + 1;
    bidVal += BID_UNIT;
    document.getElementById("bidDisplay").textContent =
        bidVal.toLocaleString("ko-KR");
    // 간단한 시각 피드백
    priceEl.style.color = "#c8a020";
    setTimeout(() => (priceEl.style.color = ""), 600);
}

/* ── 썸네일 전환 ── */
function switchMedia(el, idx) {
    document
        .querySelectorAll(".thumb-card")
        .forEach((c) => c.classList.remove("active"));
    el.classList.add("active");
    // 실제 서비스에서는 src를 교체
    const player = document.getElementById("mainPlayer");
    player.load();
}

/* ── 좋아요 토글 ── */
function toggleLike(btn) {
    const liked = btn.dataset.liked === "1";
    const countEl = document.getElementById("likeCount");
    let n = parseInt(countEl.textContent);
    if (!liked) {
        btn.dataset.liked = "1";
        btn.style.color = "#e03e3e";
        btn.style.borderColor = "#f5b5b5";
        countEl.textContent = n + 1;
    } else {
        btn.dataset.liked = "";
        btn.style.color = "";
        btn.style.borderColor = "";
        countEl.textContent = n - 1;
    }
}
