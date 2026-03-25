// Upload area - click & drag
const uploadArea = document.getElementById("uploadArea");
const fileInput = document.getElementById("fileInput");
const previewVideo = document.getElementById("previewVideo");
const previewImage = document.getElementById("previewImage");
const saveFromUrlButton = document.getElementById("saveFromUrl");
const uploadPlaceholder = uploadArea?.querySelector(".upload-placeholder");
const workPreviewModal = document.getElementById("workPreviewModal");
const workPreviewBackdrop = document.getElementById("workPreviewBackdrop");
const workPreviewClose = document.getElementById("workPreviewClose");
const workPreviewMedia = document.getElementById("workPreviewMedia");
const workPreviewTitle = document.getElementById("workPreviewTitle");
const workPreviewDescription = document.getElementById("workPreviewDescription");
const workPreviewTags = document.getElementById("workPreviewTags");
const workPreviewPrice = document.getElementById("workPreviewPrice");
const gallerySelect = document.getElementById("gallerySelect");
const gallerySelectWrap = document.getElementById("gallerySelectWrap");
const gallerySelectTrigger = document.getElementById("gallerySelectTrigger");
const gallerySelectTriggerText = gallerySelectTrigger?.querySelector(".gallery-select-trigger-text");
const gallerySelectList = document.getElementById("gallerySelectList");
const auctionStartingPriceInput = document.getElementById("auctionBidPriceInput");
const auctionDeadlineHoursInput = document.getElementById("auctionDeadlineHoursInput");
const formMode = window.workFormMode || { editMode: false, work: null };
let selectedMediaFile = null;
let selectedMediaType = null;
let existingMediaUrl = null;

uploadArea.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        validateAndPreviewMedia(file);
        return;
    }
    resetSelectedMedia();
});

saveFromUrlButton?.addEventListener("click", (event) => {
    event.preventDefault();
    const previewMediaUrl = selectedMediaFile
        ? URL.createObjectURL(selectedMediaFile)
        : existingMediaUrl;

    openPostPreview({
        title: titleInput.value.trim(),
        description: descriptionInput.value.trim(),
        tags,
        price: priceInput.value.trim(),
        mediaType: selectedMediaType,
        mediaUrl: previewMediaUrl
    });
});

uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("dragover");
});

uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("dragover");
});

uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith("video/") || file.type.startsWith("image/"))) {
        validateAndPreviewMedia(file);
    }
});

function validateAndPreviewMedia(file) {
    if (file.type.startsWith("image/")) {
        selectedMediaFile = file;
        selectedMediaType = "IMAGE";
        existingMediaUrl = null;
        showPreview(file, "IMAGE");
        return;
    }

    if (!file.type.startsWith("video/")) {
        alert("영상 또는 이미지 파일만 업로드할 수 있습니다.");
        resetSelectedMedia();
        return;
    }

    const url = URL.createObjectURL(file);
    const tempVideo = document.createElement("video");
    tempVideo.preload = "metadata";
    tempVideo.muted = true;
    tempVideo.playsInline = true;
    tempVideo.src = url;
    tempVideo.addEventListener("loadedmetadata", () => {
        const w = tempVideo.videoWidth;
        const h = tempVideo.videoHeight;
        URL.revokeObjectURL(url);
        if (w !== 1280 || h !== 720) {
            alert(`영상 해상도는 1280 × 720이어야 합니다.\n현재 해상도: ${w} × ${h}`);
            resetSelectedMedia();
            return;
        }
        selectedMediaFile = file;
        selectedMediaType = "VIDEO";
        existingMediaUrl = null;
        showPreview(file, "VIDEO");
    });
    tempVideo.addEventListener("error", () => {
        URL.revokeObjectURL(url);
        alert("영상 미리보기를 불러오지 못했습니다.");
        resetSelectedMedia();
    });
}

function setPreviewState(hasPreview) {
    uploadArea.classList.toggle("has-image", hasPreview);
    if (uploadPlaceholder) {
        uploadPlaceholder.style.display = hasPreview ? "none" : "flex";
    }
}

function showPreview(file, mediaType) {
    if (!file || !mediaType) {
        return;
    }

    if (mediaType === "IMAGE") {
        previewVideo.pause();
        previewVideo.removeAttribute("src");
        previewVideo.load();
        previewVideo.style.display = "none";

        const reader = new FileReader();
        reader.onload = (event) => {
            previewImage.src = event.target?.result;
            previewImage.style.display = "block";
            setPreviewState(true);
        };
        reader.readAsDataURL(file);
        return;
    }

    previewImage.removeAttribute("src");
    previewImage.style.display = "none";

    previewVideo.src = URL.createObjectURL(file);
    previewVideo.style.display = "block";
    previewVideo.controls = true;
    previewVideo.muted = true;
    previewVideo.loop = true;
    previewVideo.playsInline = true;
    previewVideo.load();
    previewVideo.play().catch(() => {});
    setPreviewState(true);
}

function showPreviewFromUrl(url, mediaType) {
    if (!url || !mediaType) {
        return;
    }

    if (mediaType === "IMAGE") {
        previewVideo.pause();
        previewVideo.removeAttribute("src");
        previewVideo.load();
        previewVideo.style.display = "none";

        previewImage.src = url;
        previewImage.style.display = "block";
        setPreviewState(true);
        return;
    }

    previewImage.removeAttribute("src");
    previewImage.style.display = "none";

    previewVideo.src = url;
    previewVideo.style.display = "block";
    previewVideo.controls = true;
    previewVideo.muted = true;
    previewVideo.loop = true;
    previewVideo.playsInline = true;
    previewVideo.load();
    previewVideo.play().catch(() => {});
    setPreviewState(true);
}

function resetSelectedMedia() {
    fileInput.value = "";
    selectedMediaFile = null;
    selectedMediaType = null;
    existingMediaUrl = null;
    previewVideo.pause();
    previewVideo.removeAttribute("src");
    previewVideo.load();
    previewVideo.style.display = "none";
    previewImage.removeAttribute("src");
    previewImage.style.display = "none";
    setPreviewState(false);
}

function openPostPreview({ title, description, tags: previewTags, price, mediaType, mediaUrl }) {
    if (!workPreviewModal || !workPreviewMedia) {
        return;
    }

    workPreviewTitle.textContent = title || "제목 없음";
    workPreviewDescription.textContent = description || "설명이 없습니다.";
    workPreviewTags.textContent = (previewTags || []).join(" ");
    workPreviewTags.style.display = previewTags?.length ? "block" : "none";
    workPreviewPrice.textContent = price ? `${price}${price.includes("원") ? "" : "원"}` : "";
    workPreviewPrice.style.display = price ? "block" : "none";

    if (!mediaUrl || !mediaType) {
        workPreviewMedia.innerHTML = `
            <div class="work-preview-empty">
                사진 또는 영상을 선택하면<br>이 위치에서 게시글 전체 미리보기가 보입니다.
            </div>
        `;
    } else if (mediaType === "IMAGE") {
        workPreviewMedia.innerHTML = `<img src="${mediaUrl}" alt="게시글 미리보기">`;
    } else {
        workPreviewMedia.innerHTML = `<video src="${mediaUrl}" controls autoplay muted loop playsinline></video>`;
    }

    workPreviewModal.style.display = "block";
}

function closePostPreview() {
    if (!workPreviewModal || !workPreviewMedia) {
        return;
    }
    workPreviewModal.style.display = "none";
    workPreviewMedia.innerHTML = "";
}

workPreviewBackdrop?.addEventListener("click", closePostPreview);
workPreviewClose?.addEventListener("click", closePostPreview);

// Tag input
const tagInput = document.getElementById("tagInput");
const tagWrapper = document.getElementById("tagWrapper");
let tags = [];

tagInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && tagInput.value.trim()) {
        e.preventDefault();
        addTag(tagInput.value.trim());
        tagInput.value = "";
    }
    if (e.key === "Backspace" && !tagInput.value && tags.length) {
        removeTag(tags.length - 1);
    }
});

function addTag(text) {
    const normalized = text.startsWith("#") ? text : `#${text}`;
    if (tags.includes(normalized)) {
        return;
    }
    tags.push(normalized);
    renderTags();
}

function removeTag(idx) {
    tags.splice(idx, 1);
    renderTags();
}

function renderTags() {
    const existing = tagWrapper.querySelectorAll(".tag-item");
    existing.forEach((el) => el.remove());

    tags.forEach((tag, i) => {
        const el = document.createElement("span");
        el.className = "tag-item";
        el.innerHTML = `${tag} <button class="remove-tag" data-idx="${i}">&times;</button>`;
        tagWrapper.insertBefore(el, tagInput);
    });

    tagWrapper.querySelector("label").textContent =
        `태그된 주제 (${tags.length}개)`;
}

tagWrapper.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-tag")) {
        removeTag(parseInt(e.target.dataset.idx));
    }
});

// Trade toggle - price input
const tradeToggle = document.getElementById("tradeToggle");
const priceInput = document.getElementById("priceInput");

function updatePriceInput() {
    const isPriceEnabled = tradeToggle.checked || auctionToggle.checked;
    priceInput.disabled = !isPriceEnabled;
    priceInput.style.opacity = isPriceEnabled ? "1" : "0.5";
    priceInput.style.cursor = isPriceEnabled ? "text" : "not-allowed";
    if (!isPriceEnabled) priceInput.value = "";
}

const auctionToggle = document.getElementById("auctionToggle");

tradeToggle.addEventListener("change", () => {
    if (tradeToggle.checked) {
        auctionToggle.checked = false;
    }
    updatePriceInput();
});

auctionToggle.addEventListener("change", () => {
    if (auctionToggle.checked) {
        tradeToggle.checked = false;
        updatePriceInput();
    }
});

updatePriceInput();

// More options toggle
const moreToggle = document.getElementById("moreToggle");
const moreContent = document.getElementById("moreContent");

moreToggle.addEventListener("click", () => {
    moreToggle.classList.toggle("open");
    moreContent.classList.toggle("visible");
});

function syncGallerySelectUI() {
    if (!gallerySelect || !gallerySelectTriggerText || !gallerySelectList) {
        return;
    }

    const selectedOption = gallerySelect.options[gallerySelect.selectedIndex];
    gallerySelectTriggerText.textContent = selectedOption?.textContent?.trim() || "선택 안 함";

    gallerySelectList.querySelectorAll(".gallery-select-option").forEach((optionElement) => {
        const isSelected = optionElement.dataset.value === gallerySelect.value;
        optionElement.classList.toggle("is-selected", isSelected);
        optionElement.setAttribute("aria-selected", isSelected ? "true" : "false");
    });
}

function closeGallerySelect() {
    if (!gallerySelectWrap || !gallerySelectTrigger) {
        return;
    }
    gallerySelectWrap.classList.remove("open");
    gallerySelectTrigger.setAttribute("aria-expanded", "false");
}

function openGallerySelect() {
    if (!gallerySelectWrap || !gallerySelectTrigger) {
        return;
    }
    gallerySelectWrap.classList.add("open");
    gallerySelectTrigger.setAttribute("aria-expanded", "true");
}

function initializeGallerySelect() {
    if (!gallerySelect || !gallerySelectWrap || !gallerySelectTrigger || !gallerySelectList) {
        return;
    }

    syncGallerySelectUI();

    gallerySelectTrigger.addEventListener("click", () => {
        if (gallerySelectWrap.classList.contains("open")) {
            closeGallerySelect();
            return;
        }
        openGallerySelect();
    });

    gallerySelectList.querySelectorAll(".gallery-select-option").forEach((optionElement) => {
        optionElement.addEventListener("click", () => {
            gallerySelect.value = optionElement.dataset.value || "";
            syncGallerySelectUI();
            closeGallerySelect();
        });
    });

    document.addEventListener("click", (event) => {
        if (!gallerySelectWrap.contains(event.target)) {
            closeGallerySelect();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeGallerySelect();
        }
    });
}

// Publish
const publishBtn = document.getElementById("publishBtn");
const titleInput = document.getElementById("titleInput");
const descriptionInput = document.getElementById("descriptionInput");

function initializeEditForm() {
    if (!formMode.editMode || !formMode.work) {
        syncGallerySelectUI();
        return;
    }

    const work = formMode.work;
    titleInput.value = work.title || "";
    descriptionInput.value = work.description || "";
    priceInput.value = work.price ? Number(work.price).toLocaleString("ko-KR") : "";
    tradeToggle.checked = !!work.isTradable || !!work.price;
    auctionToggle.checked = false;
    updatePriceInput();

    tags = (work.tags || []).map((tag) => `#${tag.tagName}`);
    renderTags();

    if (gallerySelect && work.galleryId) {
        gallerySelect.value = String(work.galleryId);
    }
    syncGallerySelectUI();

    const file = work.files?.[0];
    existingMediaUrl = file?.fileUrl || work.thumbnailUrl || null;
    selectedMediaType = work.category || (file?.fileType?.startsWith("image/") ? "IMAGE" : "VIDEO");
    if (existingMediaUrl && selectedMediaType) {
        showPreviewFromUrl(existingMediaUrl, selectedMediaType);
    }
}

initializeGallerySelect();
initializeEditForm();

publishBtn?.addEventListener("click", async () => {
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const rawPrice = priceInput.value.replace(/,/g, "").trim();

    if (!title) {
        alert("제목을 입력해주세요.");
        titleInput.focus();
        return;
    }

    if (!selectedMediaFile && !existingMediaUrl) {
        alert("사진 또는 영상을 먼저 업로드해주세요.");
        return;
    }

    if (!gallerySelect?.value) {
        alert("예술관을 선택해주세요.");
        gallerySelectTrigger?.focus();
        return;
    }

    if (tradeToggle.checked && !rawPrice) {
        alert("가격을 입력해주세요.");
        priceInput.focus();
        return;
    }

    const formData = new FormData();
    const workId = formMode.work?.id;
    const resolvedMediaType = selectedMediaType || formMode.work?.category || "VIDEO";
    formData.append("title", title);
    formData.append("category", resolvedMediaType);
    formData.append("description", description);
    if (rawPrice) {
        formData.append("price", Number(rawPrice));
    }
    formData.append("licenseType", "PERSONAL");
    formData.append("licenseTerms", "");
    formData.append("isTradable", tradeToggle.checked);
    formData.append("allowComment", true);
    formData.append("showSimilar", true);
    formData.append("linkUrl", "");
    if (gallerySelect?.value) {
        formData.append("galleryId", gallerySelect.value);
    }
    if (auctionToggle.checked) {
        const rawAuctionStartingPrice = auctionStartingPriceInput?.value.replace(/,/g, "").trim();
        const rawAuctionDeadlineHours = auctionDeadlineHoursInput?.value.trim();
        const resolvedAskingPrice = rawPrice ? Number(rawPrice) : Number(rawAuctionStartingPrice);

        if (!rawAuctionStartingPrice) {
            alert("입찰가를 입력해주세요.");
            auctionStartingPriceInput?.focus();
            return;
        }

        if (!rawAuctionDeadlineHours || Number(rawAuctionDeadlineHours) <= 0) {
            alert("입찰 마감기한을 선택해주세요.");
            return;
        }

        if (rawPrice && Number(rawAuctionStartingPrice) > Number(rawPrice)) {
            alert("입찰가는 작품 가격보다 클 수 없습니다.");
            auctionStartingPriceInput?.focus();
            return;
        }

        formData.append("auctionEnabled", "true");
        if (!rawPrice) {
            formData.append("price", resolvedAskingPrice);
        }
        formData.append("auctionStartingPrice", Number(rawAuctionStartingPrice));
        formData.append("auctionDeadlineHours", Number(rawAuctionDeadlineHours));
    }
    if (selectedMediaFile) {
        formData.append("mediaFile", selectedMediaFile);
    }
    tags.forEach((tag) => formData.append("tagNames", tag));

    try {
        const endpoint = formMode.editMode && workId
            ? `/api/works/${workId}/edit`
            : "/api/works";

        const response = await fetch(endpoint, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "작품 등록에 실패했습니다.");
        }

        window.location.href = "/profile/profile";
    } catch (error) {
        alert(error.message || "작품 등록에 실패했습니다.");
    }
});
