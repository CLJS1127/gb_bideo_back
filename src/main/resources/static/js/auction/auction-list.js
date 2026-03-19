// ── 경매 더미 데이터 ───────────────────────────────────
const AUCTION_DATA = [
    {
        id: 1,
        title: "무제 #7 — 딥 시네마 시리즈",
        author: "김민준 스튜디오",
        status: "live",
        price: 3200000,
        bids: 14,
        endTime: Date.now() + 1 * 3600 * 1000 + 42 * 60 * 1000,
        ratio: 0.75,
    },
    {
        id: 2,
        title: "빛의 잔상 — 한정판 프린트",
        author: "VISUAL.LAB",
        status: "live",
        price: 5405000,
        bids: 8,
        endTime: Date.now() + 4 * 3600 * 1000 + 16 * 60 * 1000,
        ratio: 1.3,
    },
    {
        id: 3,
        title: "그레이 무드 — 에디션 001",
        author: "GRAPHIC ROOM",
        status: "live",
        price: 190000,
        bids: 22,
        endTime: Date.now() + 7 * 3600 * 1000 + 8 * 60 * 1000,
        ratio: 0.65,
    },
    {
        id: 4,
        title: "화이트 시네마 캔버스 컬렉션",
        author: "CINEMA OBJECT",
        status: "live",
        price: 860000,
        bids: 5,
        endTime: Date.now() + 11 * 3600 * 1000 + 25 * 60 * 1000,
        ratio: 1.0,
    },
    {
        id: 5,
        title: "서울 스카이라인 — 야경 필름",
        author: "이수진",
        status: "upcoming",
        price: 500000,
        bids: 0,
        endTime: Date.now() + 2 * 24 * 3600 * 1000,
        ratio: 0.8,
    },
    {
        id: 6,
        title: "추상 레이어 — RGB 원본작",
        author: "ART_CORE",
        status: "upcoming",
        price: 1200000,
        bids: 0,
        endTime: Date.now() + 3 * 24 * 3600 * 1000,
        ratio: 1.2,
    },
    {
        id: 7,
        title: "사막의 파도 — 포토 에디션",
        author: "박지훈",
        status: "ended",
        price: 2800000,
        bids: 31,
        endTime: Date.now() - 2 * 3600 * 1000,
        ratio: 0.7,
    },
    {
        id: 8,
        title: "네온 시티 — 야간 촬영 원본",
        author: "NIGHT.FRAME",
        status: "ended",
        price: 980000,
        bids: 17,
        endTime: Date.now() - 5 * 3600 * 1000,
        ratio: 1.5,
    },
    {
        id: 9,
        title: "미니멀 건축 스터디 Vol.3",
        author: "최예원",
        status: "live",
        price: 450000,
        bids: 9,
        endTime: Date.now() + 0 * 3600 * 1000 + 38 * 60 * 1000,
        ratio: 0.9,
    },
    {
        id: 10,
        title: "감성 포트레이트 — 빛과 그림자",
        author: "STUDIO.H",
        status: "live",
        price: 720000,
        bids: 6,
        endTime: Date.now() + 2 * 3600 * 1000 + 5 * 60 * 1000,
        ratio: 1.1,
    },
    {
        id: 11,
        title: "빈티지 필름 — 35mm 원판",
        author: "정도윤",
        status: "upcoming",
        price: 350000,
        bids: 0,
        endTime: Date.now() + 5 * 24 * 3600 * 1000,
        ratio: 0.75,
    },
    {
        id: 12,
        title: "타이포 포스터 — 리미티드",
        author: "TYPE.WORKS",
        status: "ended",
        price: 1600000,
        bids: 24,
        endTime: Date.now() - 1 * 3600 * 1000,
        ratio: 1.4,
    },
    {
        id: 13,
        title: "드림 시퀀스 — 컬러 그레이딩 원본",
        author: "COLORIST.J",
        status: "live",
        price: 3950000,
        bids: 11,
        endTime: Date.now() + 3 * 3600 * 1000 + 12 * 60 * 1000,
        ratio: 0.6,
    },
    {
        id: 14,
        title: "모노크롬 스트리트 포토",
        author: "한승우",
        status: "live",
        price: 280000,
        bids: 4,
        endTime: Date.now() + 9 * 3600 * 1000 + 44 * 60 * 1000,
        ratio: 1.0,
    },
    {
        id: 15,
        title: "루프 애니메이션 — 1/1 에디션",
        author: "LOOP.STUDIO",
        status: "upcoming",
        price: 800000,
        bids: 0,
        endTime: Date.now() + 7 * 24 * 3600 * 1000,
        ratio: 0.8,
    },
    {
        id: 16,
        title: "레트로 도시 — 일본 여행 원본",
        author: "오가영",
        status: "ended",
        price: 540000,
        bids: 19,
        endTime: Date.now() - 3 * 3600 * 1000,
        ratio: 1.3,
    },
    {
        id: 17,
        title: "색면 추상 — 아크릴 on 캔버스",
        author: "CANVAS.KR",
        status: "live",
        price: 1100000,
        bids: 7,
        endTime: Date.now() + 5 * 3600 * 1000 + 50 * 60 * 1000,
        ratio: 0.7,
    },
    {
        id: 18,
        title: "하늘과 구름 — 드론 촬영본",
        author: "SKY.FRAME",
        status: "ended",
        price: 390000,
        bids: 12,
        endTime: Date.now() - 6 * 3600 * 1000,
        ratio: 0.65,
    },
];

// ── 유틸 ──────────────────────────────────────────────
const auctionPalettes = [
    ["#0f172a", "#1e3a5f", "#f59e0b"],
    ["#1a0533", "#6d28d9", "#f97316"],
    ["#0c1a0c", "#065f46", "#facc15"],
    ["#1a1a2e", "#16213e", "#e94560"],
    ["#0f1117", "#1a1f2e", "#60a5fa"],
    ["#2d1b00", "#7c3a00", "#fbbf24"],
    ["#0a0a0a", "#1c1c1c", "#a3e635"],
];

function encSvg(svg) {
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function makeThumb(item, w, h) {
    const p = auctionPalettes[item.id % auctionPalettes.length];
    const safe = item.title.replace(/[&<>"']/g, "").slice(0, 20);
    return encSvg(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
            w +
            " " +
            h +
            '">' +
            '<defs><linearGradient id="bg' +
            item.id +
            '" x1="0%" y1="0%" x2="100%" y2="100%">' +
            '<stop offset="0%" stop-color="' +
            p[0] +
            '"/>' +
            '<stop offset="55%" stop-color="' +
            p[1] +
            '"/>' +
            '<stop offset="100%" stop-color="' +
            p[2] +
            '"/>' +
            "</linearGradient></defs>" +
            '<rect width="' +
            w +
            '" height="' +
            h +
            '" fill="url(#bg' +
            item.id +
            ')"/>' +
            '<circle cx="' +
            Math.round(w * 0.8) +
            '" cy="' +
            Math.round(h * 0.2) +
            '" r="' +
            Math.round(Math.min(w, h) * 0.18) +
            '" fill="rgba(255,255,255,0.08)"/>' +
            '<path d="M0 ' +
            Math.round(h * 0.75) +
            " C" +
            Math.round(w * 0.3) +
            " " +
            Math.round(h * 0.6) +
            "," +
            Math.round(w * 0.6) +
            " " +
            Math.round(h * 0.9) +
            "," +
            w +
            " " +
            Math.round(h * 0.7) +
            " L" +
            w +
            " " +
            h +
            " L0 " +
            h +
            ' Z" fill="rgba(255,255,255,0.07)"/>' +
            '<text x="8%" y="88%" fill="rgba(255,255,255,0.55)" font-family="Arial,sans-serif" font-size="' +
            Math.max(14, Math.round(w * 0.045)) +
            '" font-weight="700">BIDEO AUCTION</text>' +
            '<text x="8%" y="72%" fill="#ffffff" font-family="Arial,sans-serif" font-size="' +
            Math.max(16, Math.round(w * 0.06)) +
            '" font-weight="800">' +
            safe +
            "</text>" +
            "</svg>",
    );
}

function makeAvatar(name, idx) {
    const p = auctionPalettes[idx % auctionPalettes.length];
    const ch = (name || "B").trim().charAt(0).toUpperCase();
    return encSvg(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">' +
            '<defs><linearGradient id="av' +
            idx +
            '" x1="0%" y1="0%" x2="100%" y2="100%">' +
            '<stop offset="0%" stop-color="' +
            p[0] +
            '"/><stop offset="100%" stop-color="' +
            p[1] +
            '"/>' +
            "</linearGradient></defs>" +
            '<rect width="80" height="80" rx="40" fill="url(#av' +
            idx +
            ')"/>' +
            '<text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="Arial,sans-serif" font-size="32" font-weight="700">' +
            ch +
            "</text>" +
            "</svg>",
    );
}

function formatPrice(n) {
    return n.toLocaleString("ko-KR") + "원";
}

function formatCountdown(ms) {
    if (ms <= 0) return "종료됨";
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h >= 24) {
        const d = Math.floor(h / 24);
        return d + "일 후 시작";
    }
    return (
        (h > 0 ? h + ":" : "") +
        String(m).padStart(2, "0") +
        ":" +
        String(sec).padStart(2, "0")
    );
}

function statusLabel(status) {
    if (status === "live")
        return { cls: "auction-card-status--live", text: "LIVE" };
    if (status === "upcoming")
        return { cls: "auction-card-status--upcoming", text: "예정" };
    return { cls: "auction-card-status--ended", text: "종료" };
}

// ── 카드 HTML 생성 ─────────────────────────────────────
function createAuctionCardHTML(item) {
    const W = 400;
    const H = Math.round(W * item.ratio);
    const imgSrc = makeThumb(item, W, H);
    const avatarSrc = makeAvatar(item.author, item.id);
    const st = statusLabel(item.status);
    const remaining = item.endTime - Date.now();
    const timeStr =
        item.status === "ended"
            ? "낙찰 완료"
            : item.status === "upcoming"
              ? formatCountdown(item.endTime - Date.now())
              : formatCountdown(remaining);
    const timeClass =
        item.status === "ended"
            ? "auction-card-time-val--ended"
            : remaining < 3600000
              ? ""
              : "auction-card-time-val--safe";
    const priceLabel =
        item.status === "ended"
            ? "최종 낙찰가"
            : item.status === "upcoming"
              ? "시작가"
              : "현재 입찰가";
    const priceClass =
        item.status === "ended" ? " auction-card-price--ended" : "";

    const bidBtnHtml =
        item.status === "live"
            ? '<button class="auction-overlay-bid-btn" onclick="event.stopPropagation()">지금 입찰하기</button>'
            : item.status === "upcoming"
              ? '<button class="auction-overlay-bid-btn" onclick="event.stopPropagation()">알림 받기</button>'
              : '<button class="auction-overlay-bid-btn auction-overlay-bid-btn--ended" onclick="event.stopPropagation()">경매 종료</button>';

    const timeRowHtml =
        item.status === "ended"
            ? ""
            : '<div class="auction-card-time"><span class="auction-card-time-label">' +
              (item.status === "upcoming" ? "시작까지" : "남은 시간") +
              '</span><span class="auction-card-time-val ' +
              timeClass +
              '" data-end="' +
              item.endTime +
              '" data-status="' +
              item.status +
              '">' +
              timeStr +
              "</span></div>";

    return (
        '<article class="art-gallery-card auction-masonry-card" data-status="' +
        item.status +
        '" style="margin-bottom:16px">' +
        '<div class="art-gallery-card__image-wrap" style="aspect-ratio:' +
        W +
        "/" +
        H +
        '">' +
        '<img class="art-gallery-card__image" src="' +
        imgSrc +
        '" alt="' +
        item.title +
        '" loading="lazy">' +
        '<span class="auction-card-status ' +
        st.cls +
        '">' +
        st.text +
        "</span>" +
        '<div class="art-gallery-card__overlay">' +
        '<div class="art-gallery-card__top-actions" style="justify-content:flex-end">' +
        '<button class="art-gallery-card__save-btn" onclick="event.stopPropagation()">찜</button>' +
        "</div>" +
        "<div>" +
        bidBtnHtml +
        "</div>" +
        "</div>" +
        "</div>" +
        '<div class="auction-card-info">' +
        '<div class="auction-card-author-row">' +
        '<img class="auction-card-avatar" src="' +
        avatarSrc +
        '" alt="">' +
        '<span class="auction-card-author-name">' +
        item.author +
        "</span>" +
        (item.bids > 0
            ? '<span class="auction-card-bid-count" style="margin-left:auto">입찰 ' +
              item.bids +
              "회</span>"
            : "") +
        "</div>" +
        '<p class="auction-card-title">' +
        item.title +
        "</p>" +
        '<div class="auction-card-meta">' +
        '<div class="auction-card-price-wrap">' +
        '<span class="auction-card-price-label">' +
        priceLabel +
        "</span>" +
        '<span class="auction-card-price' +
        priceClass +
        '">' +
        formatPrice(item.price) +
        "</span>" +
        "</div>" +
        timeRowHtml +
        "</div>" +
        "</div>" +
        "</article>"
    );
}

// ── 렌더링 ─────────────────────────────────────────────
let currentFilter = "all";

function renderAuctions(filter) {
    const masonry = document.getElementById("masonry");
    const items =
        filter === "all"
            ? AUCTION_DATA
            : AUCTION_DATA.filter(function (d) {
                  return d.status === filter;
              });
    masonry.innerHTML = items.map(createAuctionCardHTML).join("");
}

function filterAuctions(btn, filter) {
    document.querySelectorAll(".auction-filter-tab").forEach(function (el) {
        el.classList.remove("active");
    });
    btn.classList.add("active");
    currentFilter = filter;
    renderAuctions(filter);
}

// ── 카운트다운 업데이트 ────────────────────────────────
function tickCountdowns() {
    document.querySelectorAll(".auction-card-time-val").forEach(function (el) {
        const end = parseInt(el.dataset.end, 10);
        const status = el.dataset.status;
        if (!end || status === "ended") return;
        const ms = end - Date.now();
        el.textContent = formatCountdown(ms);
        if (ms < 3600000) {
            el.classList.remove("auction-card-time-val--safe");
        } else {
            el.classList.add("auction-card-time-val--safe");
        }
    });
}

// ── 초기화 ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
    renderAuctions("all");
    setInterval(tickCountdowns, 1000);
});
