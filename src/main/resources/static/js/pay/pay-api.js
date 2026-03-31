const feeRate = 0.10;
const paymentState = {
    workId: null,
    work: null,
    order: null,
    payment: null,
    selectedPayMethod: "card",
    isSubmitting: false
};

const methodMap = {
    card: {
        payMethod: "CARD",
        bootpayMethod: "card",
        bootpayPg: "nicepay"
    },
    general: {
        payMethod: "GENERAL",
        bootpayMethod: "",
        bootpayPg: ""
    },
    bootpay: {
        payMethod: "BOOTPAY",
        bootpayMethod: "easy",
        bootpayPg: "nicepay"
    }
};

function formatPrice(value) {
    return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

function getQueryParam(key) {
    return new URLSearchParams(window.location.search).get(key);
}

function getPrimaryImage(files = []) {
    return files.find((file) => String(file?.fileType || "").startsWith("image/")) || files[0] || null;
}

function updatePaymentSummary() {
    const rawPrice = Number(paymentState.work?.price || 0);
    const fee = Math.round(rawPrice * feeRate);
    const total = rawPrice + fee;

    document.getElementById("displayOriginalPrice").textContent = formatPrice(rawPrice);
    document.getElementById("displayFeePrice").textContent = formatPrice(fee);
    document.getElementById("displayTotalPrice").textContent = formatPrice(total);
    document.getElementById("displayFeeCaption").textContent = `플랫폼 수수료 ${Math.round(feeRate * 100)}%`;
    document.getElementById("paySubmitLabel").textContent = `${formatPrice(total)} 결제하기`;
}

function renderWorkInfo(work) {
    const productImage = document.getElementById("productImage");
    const creatorName = document.getElementById("creatorName");
    const productName = document.getElementById("productName");
    const licenseTypeLabel = document.getElementById("licenseTypeLabel");
    const primaryImage = getPrimaryImage(work.files);

    creatorName.textContent = work.memberNickname || "작가";
    productName.textContent = work.title || "작품";
    licenseTypeLabel.textContent = work.licenseType || "라이선스 미정";

    if (primaryImage?.fileUrl) {
        productImage.src = primaryImage.fileUrl;
    }

    updatePaymentSummary();
}

function selectPayMethod(method) {
    Object.keys(methodMap).forEach((key) => {
        document.getElementById(`method-${key}`)?.classList.toggle("selected", key === method);
    });
    paymentState.selectedPayMethod = method;
}

async function loadWork() {
    const workId = Number(getQueryParam("workId") || 0);
    if (!workId) {
        throw new Error("작품 정보가 없습니다.");
    }

    paymentState.workId = workId;

    const response = await fetch(`/api/works/${workId}`, {
        credentials: "include"
    });
    if (!response.ok) {
        throw new Error("작품 정보를 불러오지 못했습니다.");
    }

    paymentState.work = await response.json();
    renderWorkInfo(paymentState.work);
}

async function ensureOrder() {
    if (paymentState.order?.orderCode) {
        return paymentState.order;
    }

    const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            workId: paymentState.workId,
            orderType: "DIRECT",
            licenseType: paymentState.work?.licenseType || null
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "주문 생성에 실패했습니다.");
    }

    paymentState.order = await response.json();
    return paymentState.order;
}

async function createPayment() {
    const order = await ensureOrder();
    const methodInfo = methodMap[paymentState.selectedPayMethod];

    const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            orderCode: order.orderCode,
            payMethod: methodInfo.payMethod,
            paymentPurpose: "WORK_PURCHASE"
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "결제 생성에 실패했습니다.");
    }

    paymentState.payment = await response.json();
    return paymentState.payment;
}

async function completePayment() {
    if (!paymentState.payment?.id) return;

    const response = await fetch(`/api/payments/${paymentState.payment.id}/complete`, {
        method: "PATCH",
        credentials: "include"
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "결제 완료 처리에 실패했습니다.");
    }

    return response.json();
}

async function submitPayment() {
    if (paymentState.isSubmitting) return;
    if (!paymentState.workId || !paymentState.work?.price) {
        alert("결제할 작품 정보가 없습니다.");
        return;
    }

    paymentState.isSubmitting = true;
    const paySubmitButton = document.getElementById("paySubmitButton");
    paySubmitButton.disabled = true;

    try {
        const payment = await createPayment();
        const methodInfo = methodMap[paymentState.selectedPayMethod];
        const totalPrice = Number(payment.totalPrice || 0);

        const response = await Bootpay.requestPayment({
            application_id: "69604c28b6279cebf60ad157",
            price: totalPrice,
            order_name: paymentState.work.title || "작품 결제",
            order_id: payment.paymentCode || payment.orderCode,
            pg: methodInfo.bootpayPg,
            method: methodInfo.bootpayMethod,
            tax_free: 0,
            user: {
                id: "",
                username: "",
                phone: "",
                email: ""
            },
            items: [{
                id: String(paymentState.work.id),
                name: paymentState.work.title || "작품",
                qty: 1,
                price: totalPrice
            }],
            extra: {
                open_type: "iframe",
                card_quota: "0,2,3",
                escrow: false
            }
        });

        if (response.event === "confirm") {
            const confirmed = await Bootpay.confirm();
            if (confirmed.event === "done") {
                await completePayment();
                alert("결제가 완료되었습니다.");
                window.location.href = "/payment/history";
                return;
            }
        }

        if (response.event === "done") {
            await completePayment();
            alert("결제가 완료되었습니다.");
            window.location.href = "/payment/history";
            return;
        }

        if (response.event === "issued") {
            alert("가상계좌가 발급되었습니다.");
        }
    } catch (error) {
        if (error?.event === "cancel") {
            return;
        }
        alert(error?.message || "결제 처리 중 오류가 발생했습니다.");
    } finally {
        paymentState.isSubmitting = false;
        paySubmitButton.disabled = false;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    selectPayMethod(paymentState.selectedPayMethod);

    try {
        await loadWork();
    } catch (error) {
        alert(error.message || "결제 정보를 준비하지 못했습니다.");
        history.back();
    }
});
