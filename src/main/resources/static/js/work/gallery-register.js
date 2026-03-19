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

// More options toggle
const moreToggle = document.getElementById("moreToggle");
const moreContent = document.getElementById("moreContent");

moreToggle.addEventListener("click", () => {
    moreToggle.classList.toggle("open");
    moreContent.classList.toggle("visible");
});
