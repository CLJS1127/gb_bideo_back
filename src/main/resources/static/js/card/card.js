const cardModal = document.querySelector("[data-card-modal]");
const openButton = document.querySelector("[data-card-open]");
const closeButtons = document.querySelectorAll("[data-card-close]");
const cardForm = document.querySelector("[data-card-form]");
const basicCard = document.querySelector("[data-basic-card]");

// 모달 열림/닫힘 상태를 제어합니다.
const setModalOpen = (isOpen) => {
    if (!cardModal) {
        return;
    }

    cardModal.classList.toggle("is-open", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
};

if (openButton) {
    openButton.addEventListener("click", (event) => {
        event.preventDefault();
        setModalOpen(true);
    });
}

closeButtons.forEach((button) => {
    button.addEventListener("click", () => setModalOpen(false));
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        setModalOpen(false);
    }
});

// 선택한 등록 카드를 상단 기본 결제 카드 영역에 반영합니다.
const syncBasicCard = (sourceItem) => {
    if (!basicCard || !sourceItem) {
        return;
    }

    basicCard.dataset.cardKey = sourceItem.dataset.cardKey ?? "";

    const sourceBadge = sourceItem.querySelector(".card-company-badge");
    const sourceNum = sourceItem.querySelector(".card_num");
    const basicBadge = basicCard.querySelector(".card-company-badge");
    const basicNum = basicCard.querySelector(".card_num");

    if (basicBadge && sourceBadge) {
        basicBadge.textContent = sourceBadge.textContent;
    }

    if (basicNum && sourceNum) {
        basicNum.innerHTML = sourceNum.innerHTML;
        const basicMark = basicNum.querySelector(".mark");
        if (basicMark) {
            basicMark.hidden = false;
        }
    }
};

// 기본 결제 표시와 버튼 노출 상태를 함께 맞춥니다.
const syncDefaultMarks = (selectedKey) => {
    document.querySelectorAll(".my_item.other").forEach((item) => {
        const mark = item.querySelector(".mark");
        const setDefaultButton = item.querySelector("[data-card-set-default]");

        if (!mark) {
            return;
        }

        mark.hidden = item.dataset.cardKey !== selectedKey;

        if (setDefaultButton) {
            setDefaultButton.hidden = item.dataset.cardKey === selectedKey;
        }
    });
};

// 카드 목록의 버튼 동작은 이벤트 위임으로 처리합니다.
document.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-card-delete]");
    if (deleteButton) {
        event.preventDefault();
        const cardItem = deleteButton.closest(".my_item");
        const cardKey = cardItem?.dataset.cardKey;

        if (!cardItem) {
            return;
        }

        if (cardItem.classList.contains("basic") && cardKey) {
            document.querySelectorAll(`.my_item[data-card-key="${cardKey}"]`).forEach((item) => item.remove());
            return;
        }

        cardItem.remove();
        return;
    }

    const setDefaultButton = event.target.closest("[data-card-set-default]");
    if (setDefaultButton) {
        event.preventDefault();
        const cardItem = setDefaultButton.closest(".my_item.other");
        const cardKey = cardItem?.dataset.cardKey;

        if (!cardItem || !cardKey) {
            return;
        }

        syncBasicCard(cardItem);
        syncDefaultMarks(cardKey);
    }
});

const digitsOnly = (value) => value.replace(/\D/g, "");

// 각 입력 필드별 유효성 검사 규칙입니다.
const validators = {
    birthDate: (value) => {
        const normalized = digitsOnly(value);

        if (normalized.length !== 8) {
            return "생년월일 올바르지 않습니다.";
        }

        const year = Number(normalized.slice(0, 4));
        const month = Number(normalized.slice(4, 6));
        const day = Number(normalized.slice(6, 8));

        if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900) {
            return "올바른 생년월일 형식이 아닙니다.";
        }

        return "";
    },
    expiryDate: (value) => {
        const normalized = digitsOnly(value);

        if (normalized.length !== 4) {
            return "유효기간 4자리를 입력해 주세요.";
        }

        const month = Number(normalized.slice(0, 2));

        if (month < 1 || month > 12) {
            return "유효한 월(MM)을 입력해 주세요.";
        }

        return "";
    },
    cardPassword: (value) => {
        if (digitsOnly(value).length !== 2) {
            return "비밀번호 앞 2자리를 입력해 주세요.";
        }

        return "";
    },
    cardNumber: (values) => {
        const isValid = values.every((value) => digitsOnly(value).length === 4);
        return isValid ? "" : "카드 번호 16자리를 모두 입력해 주세요.";
    }
};

// 안내 문구 위치에 검증 메시지를 바로 교체해서 보여줍니다.
const setFieldError = (fieldName, message) => {
    const messageElement = document.querySelector(`[data-message-for="${fieldName}"]`);
    const group = messageElement?.closest("[data-field-group]");

    if (messageElement) {
        const defaultMessage = messageElement.dataset.defaultMessage ?? "";
        messageElement.textContent = message || defaultMessage;
    }

    if (group) {
        group.classList.toggle("is-invalid", Boolean(message));
    }
};

// 입력 중인 값을 화면 형식에 맞게 정리합니다.
const formatters = {
    birthDate: (input) => {
        const normalized = digitsOnly(input.value).slice(0, 8);
        const parts = [];

        if (normalized.length > 0) parts.push(normalized.slice(0, 4));
        if (normalized.length > 4) parts.push(normalized.slice(4, 6));
        if (normalized.length > 6) parts.push(normalized.slice(6, 8));

        input.value = parts.join("/");
    },
    expiryDate: (input) => {
        const normalized = digitsOnly(input.value).slice(0, 4);
        if (normalized.length <= 2) {
            input.value = normalized;
            return;
        }

        input.value = `${normalized.slice(0, 2)}/${normalized.slice(2, 4)}`;
    },
    numeric: (input) => {
        input.value = digitsOnly(input.value).slice(0, input.maxLength || 999);
    }
};

if (cardForm) {
    const birthDateInput = cardForm.querySelector('[name="birthDate"]');
    const expiryDateInput = cardForm.querySelector('[name="expiryDate"]');
    const passwordInput = cardForm.querySelector('[name="cardPassword"]');
    const cardNumberInputs = Array.from(cardForm.querySelectorAll('.card-number__input'));

    birthDateInput?.addEventListener("input", () => {
        formatters.birthDate(birthDateInput);
        setFieldError("birthDate", "");
    });

    expiryDateInput?.addEventListener("input", () => {
        formatters.expiryDate(expiryDateInput);
        setFieldError("expiryDate", "");
    });

    passwordInput?.addEventListener("input", () => {
        formatters.numeric(passwordInput);
        setFieldError("cardPassword", "");
    });

    cardNumberInputs.forEach((input, index) => {
        input.addEventListener("input", () => {
            formatters.numeric(input);
            setFieldError("cardNumber", "");

            // 카드 번호 4자리를 채우면 다음 칸으로 자동 이동합니다.
            if (input.value.length === 4 && index < cardNumberInputs.length - 1) {
                cardNumberInputs[index + 1].focus();
            }
        });
    });

    // 모든 입력값이 규칙을 통과할 때만 제출되도록 막습니다.
    cardForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const errors = {
            birthDate: validators.birthDate(birthDateInput?.value ?? ""),
            expiryDate: validators.expiryDate(expiryDateInput?.value ?? ""),
            cardPassword: validators.cardPassword(passwordInput?.value ?? ""),
            cardNumber: validators.cardNumber(cardNumberInputs.map((input) => input.value))
        };

        setFieldError("birthDate", errors.birthDate);
        setFieldError("expiryDate", errors.expiryDate);
        setFieldError("cardPassword", errors.cardPassword);
        setFieldError("cardNumber", errors.cardNumber);

        const firstErrorEntry = Object.entries(errors).find(([, message]) => message);

        if (firstErrorEntry) {
            const [fieldName] = firstErrorEntry;
            const target =
                fieldName === "cardNumber"
                    ? cardNumberInputs[0]
                    : cardForm.querySelector(`[name="${fieldName}"]`);

            target?.focus();
            return;
        }

        window.alert("카드가 등록되었습니다.");
        cardForm.reset();
    });
}
