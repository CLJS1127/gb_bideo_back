const auctionDetailWorkId = document.body?.dataset.workId;
const auctionMainMedia = document.getElementById("auctionMainMedia");
const auctionThumbStrip = document.getElementById("auctionThumbStrip");

let auctionDetailState = {
    auction: null,
    work: null,
    selectedFileIndex: 0
};

function formatPrice(value) {
    return Number(value || 0).toLocaleString("ko-KR");
}

function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("ko-KR");
}

function formatDeadlineLabel(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return `마감 ${date.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    })}`;
}

function getCreatorInitial(name) {
    return (name || "B").trim().charAt(0).toUpperCase();
}

function renderMainMedia(file) {
    if (!auctionMainMedia) return;

    if (!file?.fileUrl) {
        auctionMainMedia.innerHTML = "";
        return;
    }

    const isImage = (file.fileType || "").startsWith("image/");
    auctionMainMedia.innerHTML = isImage
        ? `<img id="mainPlayer" src="${file.fileUrl}" alt="경매 작품">`
        : `
            <video id="mainPlayer" controls muted playsinline>
                <source src="${file.fileUrl}" type="${file.fileType || "video/mp4"}">
            </video>
        `;
}

function switchMedia(index) {
    auctionDetailState.selectedFileIndex = index;
    const files = auctionDetailState.work?.files || [];
    renderMainMedia(files[index]);
    document.querySelectorAll(".thumb-card").forEach((card, cardIndex) => {
        card.classList.toggle("active", cardIndex === index);
    });
}

function renderThumbnails(files) {
    if (!auctionThumbStrip) return;

    if (!files?.length) {
        auctionThumbStrip.innerHTML = "";
        return;
    }

    auctionThumbStrip.innerHTML = files.map((file, index) => {
        const isImage = (file.fileType || "").startsWith("image/");
        return `
            <div class="thumb-card${index === auctionDetailState.selectedFileIndex ? " active" : ""}" data-index="${index}">
                ${isImage
                    ? `<img src="${file.fileUrl}" alt="썸네일 ${index + 1}">`
                    : `<video src="${file.fileUrl}" muted playsinline></video>`}
            </div>
        `;
    }).join("");

    auctionThumbStrip.querySelectorAll(".thumb-card").forEach((card) => {
        card.addEventListener("click", () => {
            switchMedia(Number(card.dataset.index || 0));
        });
    });
}

function renderWorkDetail(work) {
    const tags = work.tags || [];
    document.getElementById("auctionWorkTitle").textContent = work.title || "작품 제목";
    document.getElementById("auctionUploadDate").textContent = `${formatDate(work.createdDatetime) || "-"} 업로드`;
    document.getElementById("auctionViewCount").textContent = `조회수 ${(work.viewCount || 0).toLocaleString("ko-KR")}회`;
    document.getElementById("likeCount").textContent = (work.likeCount || 0).toLocaleString("ko-KR");
    document.getElementById("auctionCreatorAvatar").textContent = getCreatorInitial(work.memberNickname);
    document.getElementById("auctionCreatorName").textContent = work.memberNickname || "작가명";
    document.getElementById("auctionCreatorSub").textContent = "경매 진행 중";
    document.getElementById("auctionDescription").textContent = work.description || "작품 설명이 없습니다.";
    document.getElementById("auctionCreatorTags").innerHTML = tags.map((tag) =>
        `<span class="creator-tag">#${tag.tagName}</span>`
    ).join("");

    const files = work.files || [];
    auctionDetailState.selectedFileIndex = 0;
    renderMainMedia(files[0]);
    renderThumbnails(files);
}

function renderAuctionDetail(auction) {
    const resolvedCurrentPrice = auction.currentPrice || auction.startingPrice || 0;
    const bidIncrement = auction.bidIncrement || 10000;
    const bidCount = auction.bidCount || 0;
    const estimateText = auction.estimateLow && auction.estimateHigh
        ? ` · 추정가 ${formatPrice(auction.estimateLow)}원~${formatPrice(auction.estimateHigh)}원`
        : "";

    document.getElementById("auctionDeadlineDate").textContent = formatDeadlineLabel(auction.closingAt);
    document.getElementById("curPrice").textContent = formatPrice(resolvedCurrentPrice);
    document.getElementById("bidCount").textContent = bidCount.toLocaleString("ko-KR");
    document.getElementById("auctionBidMeta").innerHTML = `현재 입찰 <strong id="bidCount">${bidCount.toLocaleString("ko-KR")}</strong>명${estimateText}`;
    document.getElementById("auctionBidUnit").innerHTML = `입찰 단위 <strong>${formatPrice(bidIncrement)}원</strong>`;

    window.bidVal = resolvedCurrentPrice + bidIncrement;
    window.BID_UNIT = bidIncrement;
    window.MIN_BID = resolvedCurrentPrice + bidIncrement;
    document.getElementById("bidDisplay").textContent = formatPrice(window.bidVal);

    startCountdown(auction.closingAt);
}

function startCountdown(closingAt) {
    const endTime = new Date(closingAt);
    if (Number.isNaN(endTime.getTime())) {
        return;
    }

    const update = () => {
        const diff = endTime.getTime() - Date.now();
        if (diff <= 0) {
            ["cdDay", "cdHour", "cdMin", "cdSec"].forEach((id) => {
                document.getElementById(id).textContent = "00";
            });
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
    };

    update();
    window.setInterval(update, 1000);
}

async function initializeAuctionDetail() {
    if (!auctionDetailWorkId) {
        alert("경매 작품 정보를 찾을 수 없습니다.");
        return;
    }

    try {
        const [workResponse, auctionResponse] = await Promise.all([
            fetch(`/api/works/${auctionDetailWorkId}`),
            fetch(`/api/auctions/by-work/${auctionDetailWorkId}`)
        ]);

        if (!workResponse.ok) {
            throw new Error("작품 정보를 불러오지 못했습니다.");
        }
        if (!auctionResponse.ok) {
            throw new Error("경매 정보를 불러오지 못했습니다.");
        }

        const [work, auction] = await Promise.all([
            workResponse.json(),
            auctionResponse.json()
        ]);

        auctionDetailState.work = work;
        auctionDetailState.auction = auction;

        renderWorkDetail(work);
        renderAuctionDetail(auction);
    } catch (error) {
        alert(error.message || "경매 상세를 불러오지 못했습니다.");
    }
}

function changeBid(delta) {
    const next = window.bidVal + delta;
    if (next < window.MIN_BID) return;
    window.bidVal = next;
    document.getElementById("bidDisplay").textContent = formatPrice(window.bidVal);
}

function doBid() {
    alert("입찰 기능은 아직 연결되지 않았습니다.");
}

function toggleLike(btn) {
    const liked = btn.dataset.liked === "1";
    const countEl = document.getElementById("likeCount");
    const currentCount = parseInt(countEl.textContent.replace(/,/g, ""), 10) || 0;

    if (!liked) {
        btn.dataset.liked = "1";
        btn.style.color = "#e03e3e";
        btn.style.borderColor = "#f5b5b5";
        countEl.textContent = (currentCount + 1).toLocaleString("ko-KR");
        return;
    }

    btn.dataset.liked = "";
    btn.style.color = "";
    btn.style.borderColor = "";
    countEl.textContent = Math.max(0, currentCount - 1).toLocaleString("ko-KR");
}

initializeAuctionDetail();
