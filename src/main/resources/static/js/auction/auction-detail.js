const auctionDetailWorkId = document.body?.dataset.workId;
const auctionMainMedia = document.getElementById("auctionMainMedia");
const auctionThumbStrip = document.getElementById("auctionThumbStrip");
const deleteWorkButton = document.getElementById("deleteWorkBtn");
const bidActionButton = document.getElementById("bidActionBtn");
const shareButton = document.getElementById("shareBtn");
const auctionShareModal = document.getElementById("workShareModal");
const auctionShareCloseButton = document.getElementById("auctionShareCloseButton");
const workShareSearchInput = document.getElementById("workShareSearchInput");
const workShareSelectedList = document.getElementById("workShareSelectedList");
const workShareRecipientList = document.getElementById("workShareRecipientList");
const workShareMessageInput = document.getElementById("workShareMessageInput");
const workShareSendButton = document.getElementById("workShareSendButton");

let auctionDetailState = {
    auction: null,
    work: null,
    selectedFileIndex: 0,
    currentMemberId: null,
    countdownTimerId: null,
    isBidSubmitting: false,
    shareRecipients: [],
    selectedShareRecipients: []
};

function showAuctionSnackbar(message, type = "auction", duration = 3000, action = null) {
    if (window.BideoSnackbar?.show) {
        window.BideoSnackbar.show(message, type, duration, action);
        return;
    }
    alert(message);
}

function confirmAuctionSnackbar(message, actionLabel = "확인", duration = 5000) {
    return new Promise((resolve) => {
        let resolved = false;

        const finish = (value) => {
            if (resolved) return;
            resolved = true;
            resolve(value);
        };

        showAuctionSnackbar(message, "auction", duration, {
            label: actionLabel,
            callback: () => finish(true)
        });

        window.setTimeout(() => finish(false), duration);
    });
}

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

function isImageFile(file) {
    const fileType = String(file?.fileType || "").toLowerCase();
    const fileUrl = String(file?.fileUrl || "").toLowerCase();
    return fileType.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileUrl);
}

function getShareUrl() {
    if (auctionDetailState.work?.id) {
        return `${window.location.origin}/auction/auction-detail/${auctionDetailState.work.id}`;
    }

    return window.location.href;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function mergeShareRecipients(...groups) {
    const unique = new Map();

    groups.flat().forEach((user, index) => {
        const id = String(user?.memberId ?? user?.id ?? `user_${index}`);
        if (unique.has(id)) return;

        const nickname = user?.nickname || `user_${index}`;
        unique.set(id, {
            id,
            username: nickname,
            realname: nickname,
            avatarText: (nickname || "U").trim().charAt(0).toUpperCase()
        });
    });

    return Array.from(unique.values());
}

async function loadShareRecipients() {
    if (!auctionDetailState.currentMemberId) {
        auctionDetailState.shareRecipients = [];
        return;
    }

    const [followersResponse, followingsResponse] = await Promise.all([
        fetch(`/api/members/${auctionDetailState.currentMemberId}/followers`),
        fetch(`/api/members/${auctionDetailState.currentMemberId}/followings`)
    ]);

    if (!followersResponse.ok || !followingsResponse.ok) {
        throw new Error("공유 대상을 불러오지 못했습니다.");
    }

    const [followers, followings] = await Promise.all([
        followersResponse.json(),
        followingsResponse.json()
    ]);

    auctionDetailState.shareRecipients = mergeShareRecipients(followers, followings);
}

function renderShareSelectedRecipients() {
    if (!workShareSelectedList) return;

    if (!auctionDetailState.selectedShareRecipients.length) {
        workShareSelectedList.innerHTML = "";
        return;
    }

    workShareSelectedList.innerHTML = auctionDetailState.selectedShareRecipients.map((recipient) => `
        <div class="work-share-chip">
          <span class="work-share-chip__text">${escapeHtml(recipient.username)}</span>
          <button class="work-share-chip__remove" type="button" data-share-remove="${escapeHtml(recipient.id)}" aria-label="${escapeHtml(recipient.username)} 삭제">
            <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
              <polyline fill="none" points="20.643 3.357 12 12 3.353 20.647" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"></polyline>
              <line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" x1="20.649" x2="3.354" y1="20.649" y2="3.354"></line>
            </svg>
          </button>
        </div>
    `).join("");
}

function renderShareRecipientList(filter = "") {
    if (!workShareRecipientList) return;

    const normalized = filter.trim().toLowerCase();
    const recipients = auctionDetailState.shareRecipients.filter((recipient) => {
        if (!normalized) return true;
        return recipient.username.toLowerCase().includes(normalized) || recipient.realname.toLowerCase().includes(normalized);
    }).slice(0, 20);

    if (!recipients.length) {
        workShareRecipientList.innerHTML = `
            <div class="work-share-empty">
              <div class="work-share-empty__title">검색 결과가 없습니다.</div>
              <div class="work-share-empty__copy">다른 사용자 이름으로 다시 검색해보세요.</div>
            </div>
        `;
        return;
    }

    workShareRecipientList.innerHTML = recipients.map((recipient) => {
        const isSelected = auctionDetailState.selectedShareRecipients.some((selected) => selected.id === recipient.id);
        return `
            <button class="work-share-recipient${isSelected ? " is-selected" : ""}" type="button" data-share-recipient="${escapeHtml(recipient.id)}">
              <div class="work-share-recipient__main">
                <div class="work-share-recipient__avatar">${escapeHtml(recipient.avatarText)}</div>
                <div class="work-share-recipient__copy">
                  <div class="work-share-recipient__username">${escapeHtml(recipient.username)}</div>
                  <div class="work-share-recipient__realname">${escapeHtml(recipient.realname)}</div>
                </div>
              </div>
              <div class="work-share-recipient__check${isSelected ? " is-selected" : ""}">
                ${isSelected ? '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><polyline fill="none" points="21.648 5.352 9.002 17.998 2.358 11.358" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"></polyline></svg>' : ""}
              </div>
            </button>
        `;
    }).join("");
}

function toggleShareRecipient(recipientId) {
    const target = auctionDetailState.shareRecipients.find((recipient) => recipient.id === recipientId);
    if (!target) return;

    const existingIndex = auctionDetailState.selectedShareRecipients.findIndex((recipient) => recipient.id === recipientId);
    if (existingIndex >= 0) {
        auctionDetailState.selectedShareRecipients.splice(existingIndex, 1);
    } else {
        auctionDetailState.selectedShareRecipients.push(target);
    }

    renderShareSelectedRecipients();
    renderShareRecipientList(workShareSearchInput?.value || "");
}

function removeShareRecipient(recipientId) {
    auctionDetailState.selectedShareRecipients = auctionDetailState.selectedShareRecipients.filter((recipient) => recipient.id !== recipientId);
    renderShareSelectedRecipients();
    renderShareRecipientList(workShareSearchInput?.value || "");
}

function renderMainMedia(file) {
    if (!auctionMainMedia) return;

    if (!file?.fileUrl) {
        auctionMainMedia.innerHTML = "";
        return;
    }

    const isImage = isImageFile(file);
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
        const isImage = isImageFile(file);
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
    syncDeleteButtonVisibility();
}

function syncDeleteButtonVisibility() {
    if (!deleteWorkButton) return;

    const currentMemberId = Number(auctionDetailState.currentMemberId || 0);
    const ownerMemberId = Number(auctionDetailState.work?.memberId || 0);
    const isOwner = currentMemberId > 0 && ownerMemberId > 0 && currentMemberId === ownerMemberId;

    deleteWorkButton.hidden = !isOwner;
}

async function loadCurrentMember() {
    try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
            auctionDetailState.currentMemberId = null;
            return;
        }

        const member = await response.json();
        auctionDetailState.currentMemberId = member?.id ?? null;
    } catch (error) {
        auctionDetailState.currentMemberId = null;
    }
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

    syncBidActionState();
    startCountdown(auction.closingAt);
}

function syncBidActionState() {
    if (!bidActionButton) return;

    const auction = auctionDetailState.auction;
    const work = auctionDetailState.work;
    const currentMemberId = auctionDetailState.currentMemberId;

    const isOwner = Boolean(currentMemberId && work?.memberId && currentMemberId === work.memberId);
    const isClosed = Boolean(auction?.closingAt && new Date(auction.closingAt).getTime() <= Date.now());

    if (isOwner) {
        bidActionButton.disabled = true;
        bidActionButton.textContent = "내 작품은 입찰 불가";
        return;
    }

    if (isClosed || auction?.status !== "ACTIVE") {
        bidActionButton.disabled = true;
        bidActionButton.textContent = "경매 종료";
        return;
    }

    bidActionButton.disabled = false;
    bidActionButton.textContent = "입찰하기";
}

function startCountdown(closingAt) {
    const endTime = new Date(closingAt);
    if (Number.isNaN(endTime.getTime())) {
        return;
    }

    if (auctionDetailState.countdownTimerId) {
        window.clearInterval(auctionDetailState.countdownTimerId);
    }

    const update = () => {
        const diff = endTime.getTime() - Date.now();
        if (diff <= 0) {
            ["cdDay", "cdHour", "cdMin", "cdSec"].forEach((id) => {
                document.getElementById(id).textContent = "00";
            });
            syncBidActionState();
            if (auctionDetailState.countdownTimerId) {
                window.clearInterval(auctionDetailState.countdownTimerId);
                auctionDetailState.countdownTimerId = null;
            }
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
    auctionDetailState.countdownTimerId = window.setInterval(update, 1000);
}

async function initializeAuctionDetail() {
    if (!auctionDetailWorkId) {
        showAuctionSnackbar("경매 작품 정보를 찾을 수 없습니다.", "error");
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

        await loadCurrentMember();

        auctionDetailState.work = work;
        auctionDetailState.auction = auction;

        renderWorkDetail(work);
        renderAuctionDetail(auction);
    } catch (error) {
        showAuctionSnackbar(error.message || "경매 상세를 불러오지 못했습니다.", "error");
    }
}

function changeBid(direction) {
    const step = Number(window.BID_UNIT || 0);
    if (!step) return;

    const next = window.bidVal + (step * direction);
    if (next < window.MIN_BID) return;
    window.bidVal = next;
    document.getElementById("bidDisplay").textContent = formatPrice(window.bidVal);
}

function openShareModal() {
    if (!auctionShareModal) return;

    auctionDetailState.selectedShareRecipients = [];
    renderShareSelectedRecipients();
    renderShareRecipientList("");

    if (workShareSearchInput) workShareSearchInput.value = "";
    if (workShareMessageInput) workShareMessageInput.value = "";

    auctionShareModal.hidden = false;
    window.setTimeout(() => workShareSearchInput?.focus(), 0);
}

function closeShareModal() {
    if (!auctionShareModal) return;
    auctionShareModal.hidden = true;
}

function submitWorkShare() {
    if (!auctionDetailState.selectedShareRecipients.length) {
        showAuctionSnackbar("공유할 대상을 1명 이상 선택해주세요.", "share");
        return;
    }

    const recipientsLabel = auctionDetailState.selectedShareRecipients.map((recipient) => recipient.username).join(", ");
    const message = workShareMessageInput?.value.trim() || "";
    const workTitle = auctionDetailState.work?.title || "게시물";
    const suffix = message ? ` 메시지: ${message}` : "";

    showAuctionSnackbar(`${workTitle}을(를) ${recipientsLabel}에게 공유했습니다.${suffix}`, "share", 4000);
    closeShareModal();
}

async function doBid() {
    if (!auctionDetailState.auction?.id) {
        showAuctionSnackbar("경매 정보를 찾을 수 없습니다.", "error");
        return;
    }
    if (!bidActionButton || bidActionButton.disabled) {
        return;
    }
    if (!auctionDetailState.currentMemberId) {
        showAuctionSnackbar("로그인 후 입찰할 수 있습니다.", "error");
        return;
    }
    if (auctionDetailState.isBidSubmitting) {
        return;
    }

    const confirmed = await confirmAuctionSnackbar(`${formatPrice(window.bidVal)}원으로 입찰하시겠습니까?`, "입찰");
    if (!confirmed) {
        return;
    }

    auctionDetailState.isBidSubmitting = true;
    bidActionButton.disabled = true;
    bidActionButton.textContent = "입찰 중...";

    try {
        const response = await fetch(`/api/auctions/${auctionDetailState.auction.id}/bids`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                bidPrice: window.bidVal
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "입찰에 실패했습니다.");
        }

        const result = await response.json();
        const nextPrice = Number(result?.bidPrice || window.bidVal);
        auctionDetailState.auction.currentPrice = nextPrice;
        auctionDetailState.auction.bidCount = Number(auctionDetailState.auction.bidCount || 0) + 1;
        renderAuctionDetail(auctionDetailState.auction);
        showAuctionSnackbar("입찰이 완료되었습니다.", "auction");
    } catch (error) {
        showAuctionSnackbar(error.message || "입찰에 실패했습니다.", "error");
        syncBidActionState();
    } finally {
        auctionDetailState.isBidSubmitting = false;
        if (!bidActionButton.disabled) {
            bidActionButton.textContent = "입찰하기";
        }
    }
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

async function deleteAuctionWork() {
    if (!auctionDetailState.work?.id) {
        showAuctionSnackbar("삭제할 작품 정보를 찾을 수 없습니다.", "error");
        return;
    }

    const confirmed = await confirmAuctionSnackbar("이 작품을 삭제하시겠습니까?", "삭제");
    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`/api/works/${auctionDetailState.work.id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "작품 삭제에 실패했습니다.");
        }

        showAuctionSnackbar("작품을 삭제했습니다.", "success");
        window.location.href = "/profile";
    } catch (error) {
        showAuctionSnackbar(error.message || "작품 삭제에 실패했습니다.", "error");
    }
}

initializeAuctionDetail();

shareButton?.addEventListener("click", async () => {
    try {
        if (!auctionDetailState.shareRecipients.length) {
            await loadShareRecipients();
        }
        openShareModal();
    } catch (error) {
        showAuctionSnackbar(error.message || "공유 대상을 불러오지 못했습니다.", "error");
    }
});
auctionShareCloseButton?.addEventListener("click", closeShareModal);
workShareSearchInput?.addEventListener("input", (event) => {
    renderShareRecipientList(event.target.value || "");
});

workShareSearchInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        const firstRecipient = workShareRecipientList?.querySelector("[data-share-recipient]");
        if (firstRecipient) {
            toggleShareRecipient(firstRecipient.dataset.shareRecipient);
        }
    }
});

workShareRecipientList?.addEventListener("click", (event) => {
    const recipientButton = event.target.closest("[data-share-recipient]");
    if (!recipientButton) return;
    toggleShareRecipient(recipientButton.dataset.shareRecipient);
});

workShareSelectedList?.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-share-remove]");
    if (!removeButton) return;
    removeShareRecipient(removeButton.dataset.shareRemove);
});

workShareSendButton?.addEventListener("click", submitWorkShare);

auctionShareModal?.addEventListener("click", (event) => {
    if (event.target === auctionShareModal) {
        closeShareModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && auctionShareModal && !auctionShareModal.hidden) {
        closeShareModal();
    }
});
