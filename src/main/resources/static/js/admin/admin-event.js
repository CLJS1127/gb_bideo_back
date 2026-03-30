document.addEventListener("DOMContentLoaded", () => {
    if (typeof BIDEO_LAYOUT !== "undefined") {
        BIDEO_LAYOUT.initIcons();
    }

    document.querySelectorAll(".modal-overlay").forEach((modal) => modal.classList.remove("show"));

    initCommonUi();
    initMemberStatusActions();
    initInquiryReplyAction();
    initRestrictionActions();
    initDynamicButtons();
});

function initCommonUi() {
    document.addEventListener("click", (event) => {
        const target = event.target;

        const navItem = target.closest(".nav-item");
        if (navItem) {
            const group = navItem.closest(".nav-group");
            const hasSubmenu = !!group?.querySelector(".nav-submenu");
            if (hasSubmenu) {
                event.preventDefault();
                document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
                navItem.classList.add("active");
                const targetSubmenu = group.querySelector(".nav-submenu");
                document.querySelectorAll(".nav-submenu").forEach((submenu) => {
                    if (submenu !== targetSubmenu) submenu.classList.remove("show");
                });
                targetSubmenu.classList.toggle("show");
                return;
            }
        }

        const subItem = target.closest(".nav-sub-item");
        if (subItem && typeof BIDEO_LAYOUT !== "undefined") {
            BIDEO_LAYOUT.updateHeader(subItem.textContent.trim());
            return;
        }

        const selectTrigger = target.closest(".custom-select-trigger");
        if (selectTrigger) {
            selectTrigger.closest(".custom-select-wrapper")?.classList.toggle("open");
            return;
        }

        const option = target.closest(".custom-option");
        if (option) {
            const wrapper = option.closest(".custom-select-wrapper");
            const triggerText = wrapper?.querySelector(".selected-text");
            const hiddenInput = wrapper?.querySelector("input[type='hidden']");
            if (triggerText) triggerText.textContent = option.textContent.trim();
            if (hiddenInput) hiddenInput.value = option.getAttribute("data-value") || "";
            wrapper?.querySelectorAll(".custom-option").forEach((item) => item.classList.remove("active"));
            option.classList.add("active");
            wrapper?.classList.remove("open");
            return;
        }

        if (!target.closest(".custom-select-wrapper")) {
            document.querySelectorAll(".custom-select-wrapper.open").forEach((wrapper) => wrapper.classList.remove("open"));
        }

        if (target.matches("[data-modal-close='confirm']") || target.closest("[data-modal-close='confirm']")) {
            closeConfirmModal();
            return;
        }

        if (target.matches("[data-modal-close='restriction']") || target.closest("[data-modal-close='restriction']")) {
            closeBlockModal();
            return;
        }

        if (target.closest(".modal-close") || target.classList.contains("modal-overlay")) {
            closeCuratorModal();
            closeBlockModal();
            closeConfirmModal();
            closeImageModal();
        }
    });

    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
        sidebar.addEventListener("mouseenter", () => {
            sidebar.style.boxShadow = "4px 0 20px rgba(0,0,0,0.04)";
        });
        sidebar.addEventListener("mouseleave", () => {
            sidebar.style.boxShadow = "none";
        });
    }
}

function initDynamicButtons() {
    document.addEventListener("click", (event) => {
        const actionBtn = event.target.closest(".dynamic-btn, .btn-success, .btn-danger");
        const hasCustomHandler = actionBtn?.matches(".btn-release-restriction");
        const isExcluded = !actionBtn || actionBtn.closest(".list-controls") || actionBtn.closest(".nav-group") || actionBtn.closest(".search-wrapper");

        if (!actionBtn || isExcluded || hasCustomHandler) {
            return;
        }

        const btnText = actionBtn.textContent.trim();
        const isDanger = btnText.includes("삭제") || btnText.includes("중단") || btnText.includes("반려") || btnText.includes("거부") || btnText.includes("경매 종료");
        const isApprove = btnText.includes("승인") || btnText.includes("확인") || btnText.includes("전시") || btnText.includes("다시 노출") || btnText.includes("적용");
        const isSave = btnText.includes("저장") || btnText.includes("등록") || btnText.includes("수정");

        let message = "";
        let type = "success";
        if (isDanger) {
            message = "처리가 완료되었습니다.";
            type = "error";
        } else if (isApprove) {
            message = "정상적으로 처리되었습니다.";
        } else if (isSave) {
            message = "변경 사항이 저장되었습니다.";
        }

        const executeCommon = () => {
            const originalInner = actionBtn.innerHTML;
            actionBtn.disabled = true;
            setTimeout(() => {
                if (typeof BIDEO_LAYOUT !== "undefined" && message) {
                    BIDEO_LAYOUT.showSnackbar(message, type);
                }
                actionBtn.disabled = false;
                actionBtn.innerHTML = originalInner;
            }, 300);
        };

        if (isDanger) {
            openConfirmModal("작업 확인", `정말 ${btnText}하시겠습니까?`, executeCommon);
        } else if (message) {
            executeCommon();
        }
    });
}

function initMemberStatusActions() {
    document.querySelectorAll(".btn-member-status-toggle").forEach((button) => {
        button.addEventListener("click", () => {
            const memberId = button.dataset.memberId;
            const nextStatus = button.dataset.nextStatus;
            const actionLabel = button.dataset.actionLabel || "상태 변경";

            openConfirmModal("작업 확인", `정말 ${actionLabel}하시겠습니까?`, async () => {
                try {
                    await BIDEO_SERVICE.updateMemberStatus(memberId, nextStatus);
                    if (typeof BIDEO_LAYOUT !== "undefined") {
                        BIDEO_LAYOUT.showSnackbar(`${actionLabel} 처리되었습니다.`, "success");
                    }
                    window.location.reload();
                } catch (error) {
                    if (typeof BIDEO_LAYOUT !== "undefined") {
                        BIDEO_LAYOUT.showSnackbar(error.message, "error");
                    }
                }
            });
        });
    });
}

function initInquiryReplyAction() {
    const submitButton = document.getElementById("btn-submit-answer");
    const textarea = document.getElementById("answer-content");
    if (!submitButton || !textarea) {
        return;
    }

    submitButton.addEventListener("click", () => {
        const inquiryId = submitButton.dataset.inquiryId || textarea.dataset.inquiryId;
        const content = textarea.value.trim();
        if (!content) {
            if (typeof BIDEO_LAYOUT !== "undefined") {
                BIDEO_LAYOUT.showSnackbar("답변 내용을 입력해주세요.", "error");
            }
            return;
        }

        openConfirmModal("답변 등록", "작성한 답변을 저장하시겠습니까?", async () => {
            try {
                await BIDEO_SERVICE.replyInquiry(inquiryId, content);
                if (typeof BIDEO_LAYOUT !== "undefined") {
                    BIDEO_LAYOUT.showSnackbar("답변이 저장되었습니다.", "success");
                }
                window.location.assign("/admin/inquiries");
            } catch (error) {
                if (typeof BIDEO_LAYOUT !== "undefined") {
                    BIDEO_LAYOUT.showSnackbar(error.message, "error");
                }
            }
        });
    });
}

function initRestrictionActions() {
    const createButton = document.getElementById("btn-open-create-restriction");
    const saveButton = document.getElementById("btn-save-restriction");
    const memberKeywordInput = document.getElementById("restriction-member-keyword");
    const restrictionType = document.getElementById("restriction-type");

    createButton?.addEventListener("click", () => openRestrictionCreateModal());
    saveButton?.addEventListener("click", saveRestriction);
    restrictionType?.addEventListener("change", syncRestrictionEndDatetimeField);

    document.querySelectorAll(".btn-edit-restriction").forEach((button) => {
        button.addEventListener("click", () => openRestrictionEditModal(button.dataset));
    });

    document.querySelectorAll(".btn-release-restriction").forEach((button) => {
        button.addEventListener("click", () => {
            const restrictionId = button.dataset.restrictionId;
            const label = button.dataset.releaseLabel || "제한 해제";
            openConfirmModal("작업 확인", `정말 ${label}하시겠습니까?`, async () => {
                try {
                    await BIDEO_SERVICE.releaseRestriction(restrictionId);
                    if (typeof BIDEO_LAYOUT !== "undefined") {
                        BIDEO_LAYOUT.showSnackbar(`${label} 처리되었습니다.`, "success");
                    }
                    window.location.reload();
                } catch (error) {
                    if (typeof BIDEO_LAYOUT !== "undefined") {
                        BIDEO_LAYOUT.showSnackbar(error.message, "error");
                    }
                }
            });
        });
    });

    if (memberKeywordInput) {
        let debounceTimer = null;
        memberKeywordInput.addEventListener("input", () => {
            const keyword = memberKeywordInput.value.trim();
            const memberIdInput = document.getElementById("restriction-member-id");
            if (memberIdInput) {
                memberIdInput.value = "";
            }

            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
            if (keyword.length < 2 || memberKeywordInput.dataset.locked === "true") {
                renderMemberSearchResults([]);
                return;
            }

            debounceTimer = setTimeout(async () => {
                try {
                    const members = await BIDEO_SERVICE.searchMembers(keyword);
                    renderMemberSearchResults(members);
                } catch (error) {
                    renderMemberSearchResults([]);
                    if (typeof BIDEO_LAYOUT !== "undefined") {
                        BIDEO_LAYOUT.showSnackbar(error.message, "error");
                    }
                }
            }, 250);
        });
    }
}

function renderMemberSearchResults(members) {
    const results = document.getElementById("restriction-member-results");
    if (!results) {
        return;
    }

    results.innerHTML = "";
    if (!members || members.length === 0) {
        return;
    }

    members.forEach((member) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn-secondary w-100 mb-8";
        button.textContent = `${member.nickname} (${member.email})`;
        button.addEventListener("click", () => {
            const memberIdInput = document.getElementById("restriction-member-id");
            const memberKeywordInput = document.getElementById("restriction-member-keyword");
            if (memberIdInput) {
                memberIdInput.value = member.id;
            }
            if (memberKeywordInput) {
                memberKeywordInput.value = `${member.nickname} (${member.email})`;
            }
            results.innerHTML = "";
        });
        results.appendChild(button);
    });
}

async function saveRestriction() {
    const restrictionId = document.getElementById("restriction-id")?.value;
    const memberId = document.getElementById("restriction-member-id")?.value;
    const restrictionType = document.getElementById("restriction-type")?.value;
    const reason = document.getElementById("edit-block-reason")?.value.trim();
    const endDatetime = document.getElementById("edit-block-date")?.value;

    if (!memberId) {
        BIDEO_LAYOUT?.showSnackbar("대상자를 선택해주세요.", "error");
        return;
    }
    if (!restrictionType) {
        BIDEO_LAYOUT?.showSnackbar("제한 종류를 선택해주세요.", "error");
        return;
    }
    if (!reason) {
        BIDEO_LAYOUT?.showSnackbar("제한 사유를 입력해주세요.", "error");
        return;
    }
    if (restrictionType === "LIMIT" && !endDatetime) {
        BIDEO_LAYOUT?.showSnackbar("제한 종료일을 입력해주세요.", "error");
        return;
    }

    const payload = {
        memberId: Number(memberId),
        restrictionType,
        reason,
        endDatetime: restrictionType === "LIMIT" ? endDatetime : null
    };

    try {
        if (restrictionId) {
            await BIDEO_SERVICE.updateRestriction(restrictionId, payload);
        } else {
            await BIDEO_SERVICE.createRestriction(payload);
        }
        closeBlockModal();
        BIDEO_LAYOUT?.showSnackbar("이용 제한 정보가 저장되었습니다.", "success");
        window.location.reload();
    } catch (error) {
        BIDEO_LAYOUT?.showSnackbar(error.message, "error");
    }
}

function openRestrictionCreateModal() {
    const modalTitle = document.getElementById("restriction-modal-title");
    const restrictionId = document.getElementById("restriction-id");
    const memberId = document.getElementById("restriction-member-id");
    const memberKeyword = document.getElementById("restriction-member-keyword");
    const restrictionType = document.getElementById("restriction-type");
    const endDatetime = document.getElementById("edit-block-date");
    const reason = document.getElementById("edit-block-reason");
    const results = document.getElementById("restriction-member-results");

    if (modalTitle) modalTitle.textContent = "이용 제한 등록";
    if (restrictionId) restrictionId.value = "";
    if (memberId) memberId.value = "";
    if (memberKeyword) {
        memberKeyword.value = "";
        memberKeyword.disabled = false;
        memberKeyword.dataset.locked = "false";
    }
    if (restrictionType) restrictionType.value = "BLOCK";
    if (endDatetime) endDatetime.value = "";
    if (reason) reason.value = "";
    if (results) results.innerHTML = "";
    syncRestrictionEndDatetimeField();
    openBlockModal();
}

function openRestrictionEditModal(dataset) {
    const modalTitle = document.getElementById("restriction-modal-title");
    const restrictionId = document.getElementById("restriction-id");
    const memberId = document.getElementById("restriction-member-id");
    const memberKeyword = document.getElementById("restriction-member-keyword");
    const restrictionType = document.getElementById("restriction-type");
    const endDatetime = document.getElementById("edit-block-date");
    const reason = document.getElementById("edit-block-reason");
    const results = document.getElementById("restriction-member-results");

    if (modalTitle) modalTitle.textContent = "이용 제한 정보 수정";
    if (restrictionId) restrictionId.value = dataset.restrictionId || "";
    if (memberId) memberId.value = dataset.memberId || "";
    if (memberKeyword) {
        memberKeyword.value = dataset.memberLabel || "";
        memberKeyword.disabled = true;
        memberKeyword.dataset.locked = "true";
    }
    if (restrictionType) {
        restrictionType.value = dataset.restrictionType || "LIMIT";
        restrictionType.disabled = true;
    }
    if (endDatetime) endDatetime.value = dataset.endDatetime || "";
    if (reason) reason.value = dataset.reason || "";
    if (results) results.innerHTML = "";
    syncRestrictionEndDatetimeField();
    openBlockModal();
}

function syncRestrictionEndDatetimeField() {
    const restrictionType = document.getElementById("restriction-type");
    const endDatetime = document.getElementById("edit-block-date");
    if (!restrictionType || !endDatetime) {
        return;
    }

    const isLimit = restrictionType.value === "LIMIT";
    endDatetime.disabled = !isLimit;
    if (!isLimit) {
        endDatetime.value = "";
    }
}

function openCuratorModal(mode = "registration") {
    const modal = document.getElementById("curator-modal");
    if (modal) {
        const title = document.getElementById("modal-title");
        if (title) title.textContent = mode === "edit" ? "큐레이터 정보 수정" : "새 큐레이터 등록";
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
    }
}

function closeCuratorModal() {
    const modal = document.getElementById("curator-modal");
    if (modal) {
        modal.classList.remove("show");
        document.body.style.overflow = "";
    }
}

function openConfirmModal(title, message, onExecute) {
    const modal = document.getElementById("confirm-modal");
    if (!modal) return;

    document.getElementById("confirm-title").textContent = title;
    document.getElementById("confirm-message").textContent = message;

    const executeButton = document.getElementById("btn-confirm-execute");
    const newButton = executeButton.cloneNode(true);
    executeButton.parentNode.replaceChild(newButton, executeButton);
    newButton.addEventListener("click", async () => {
        closeConfirmModal();
        if (onExecute) {
            await onExecute();
        }
    });

    modal.classList.add("show");
    document.body.style.overflow = "hidden";
}

function closeConfirmModal() {
    const modal = document.getElementById("confirm-modal");
    if (modal) {
        modal.classList.remove("show");
        document.body.style.overflow = "";
    }
}

function openBlockModal() {
    const modal = document.getElementById("block-modal");
    if (modal) {
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
    }
}

function closeBlockModal() {
    const modal = document.getElementById("block-modal");
    if (modal) {
        modal.classList.remove("show");
        document.body.style.overflow = "";
    }
    const memberKeyword = document.getElementById("restriction-member-keyword");
    const restrictionType = document.getElementById("restriction-type");
    if (memberKeyword) {
        memberKeyword.disabled = false;
        memberKeyword.dataset.locked = "false";
    }
    if (restrictionType) {
        restrictionType.disabled = false;
    }
}

function openImageModal(src) {
    let modal = document.getElementById("image-preview-modal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "image-preview-modal";
        modal.className = "modal-overlay image-preview";

        const container = document.createElement("div");
        container.className = "modal-container image-only";

        const closeBtn = document.createElement("button");
        closeBtn.className = "modal-close";
        closeBtn.addEventListener("click", closeImageModal);
        closeBtn.innerHTML = '<i data-lucide="x"></i>';

        const wrapper = document.createElement("div");
        wrapper.className = "modal-image-wrapper";

        const img = document.createElement("img");
        img.alt = "Preview";
        img.src = src;

        wrapper.appendChild(img);
        container.appendChild(closeBtn);
        container.appendChild(wrapper);
        modal.appendChild(container);
        document.body.appendChild(modal);
        if (typeof BIDEO_LAYOUT !== "undefined") {
            BIDEO_LAYOUT.initIcons();
        }
    } else {
        modal.querySelector("img").src = src;
    }
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
    modal.onclick = (event) => {
        if (event.target === modal) {
            closeImageModal();
        }
    };
}

function closeImageModal() {
    const modal = document.getElementById("image-preview-modal");
    if (modal) {
        modal.classList.remove("show");
        document.body.style.overflow = "";
    }
}
