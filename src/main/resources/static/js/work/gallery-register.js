const galleryUploadArea = document.getElementById("galleryUploadArea");
const galleryFileInput = document.getElementById("galleryFileInput");
const galleryPreviewImage = document.getElementById("galleryPreviewImage");
const galleryPublishButton = document.getElementById("publishBtn");
const galleryTitleInput = document.getElementById("galleryTitleInput");
const galleryDescriptionInput = document.getElementById("galleryDescriptionInput");

function setGalleryPreviewState(hasImage) {
    galleryUploadArea?.classList.toggle("has-image", hasImage);
}

function resetGalleryPreview() {
    if (galleryFileInput) {
        galleryFileInput.value = "";
    }
    if (galleryPreviewImage) {
        galleryPreviewImage.removeAttribute("src");
        galleryPreviewImage.style.display = "none";
    }
    setGalleryPreviewState(false);
}

function showGalleryPreview(file) {
    if (!file.type.startsWith("image/")) {
        alert("사진 파일만 업로드할 수 있습니다.");
        resetGalleryPreview();
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        galleryPreviewImage.src = event.target?.result;
        galleryPreviewImage.style.display = "block";
        setGalleryPreviewState(true);
    };
    reader.readAsDataURL(file);
}

async function submitGallery() {
    const title = galleryTitleInput?.value.trim();
    const description = galleryDescriptionInput?.value.trim();
    const coverFile = galleryFileInput?.files?.[0];

    if (!title) {
        alert("제목을 입력해주세요.");
        galleryTitleInput?.focus();
        return;
    }

    if (!coverFile) {
        alert("대표 사진을 먼저 업로드해주세요.");
        return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description || "");
    formData.append("allowComment", "true");
    formData.append("showSimilar", "true");
    formData.append("coverFile", coverFile);
    tags.forEach((tag) => {
        formData.append("tagNames", tag);
    });

    try {
        const response = await fetch("/api/galleries", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "예술관 등록에 실패했습니다.");
        }

        window.location.href = "/profile/profile";
    } catch (error) {
        alert(error.message || "예술관 등록에 실패했습니다.");
    }
}

galleryUploadArea?.addEventListener("click", () => galleryFileInput?.click());

galleryFileInput?.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) {
        resetGalleryPreview();
        return;
    }
    showGalleryPreview(file);
});

galleryUploadArea?.addEventListener("dragover", (event) => {
    event.preventDefault();
    galleryUploadArea.classList.add("dragover");
});

galleryUploadArea?.addEventListener("dragleave", () => {
    galleryUploadArea.classList.remove("dragover");
});

galleryUploadArea?.addEventListener("drop", (event) => {
    event.preventDefault();
    galleryUploadArea.classList.remove("dragover");
    const file = event.dataTransfer.files?.[0];
    if (!file) {
        return;
    }
    if (!file.type.startsWith("image/")) {
        alert("사진 파일만 업로드할 수 있습니다.");
        resetGalleryPreview();
        return;
    }
    showGalleryPreview(file);
});

galleryPublishButton?.addEventListener("click", submitGallery);

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

// More options toggle
const moreToggle = document.getElementById("moreToggle");
const moreContent = document.getElementById("moreContent");

moreToggle?.addEventListener("click", () => {
    moreToggle.classList.toggle("open");
    moreContent?.classList.toggle("visible");
});
