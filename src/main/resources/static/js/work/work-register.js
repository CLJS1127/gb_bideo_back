// Upload area - click & drag
const uploadArea = document.getElementById("uploadArea");
const fileInput = document.getElementById("fileInput");
const previewVideo = document.getElementById("previewVideo");

uploadArea.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) validateAndPreview(file);
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
    if (file && file.type.startsWith("video/")) validateAndPreview(file);
});

function validateAndPreview(file) {
    const url = URL.createObjectURL(file);
    const tempVideo = document.createElement("video");
    tempVideo.src = url;
    tempVideo.addEventListener("loadedmetadata", () => {
        const w = tempVideo.videoWidth;
        const h = tempVideo.videoHeight;
        URL.revokeObjectURL(url);
        if (w !== 1920 || h !== 1080) {
            alert(`영상 해상도는 1920 × 1080이어야 합니다.\n현재 해상도: ${w} × ${h}`);
            fileInput.value = "";
            return;
        }
        previewVideo.src = URL.createObjectURL(file);
        uploadArea.classList.add("has-image");
    });
}

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
    tags.push(text);
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
    priceInput.disabled = !tradeToggle.checked;
    priceInput.style.opacity = tradeToggle.checked ? "1" : "0.5";
    priceInput.style.cursor = tradeToggle.checked ? "text" : "not-allowed";
    if (!tradeToggle.checked) priceInput.value = "";
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
