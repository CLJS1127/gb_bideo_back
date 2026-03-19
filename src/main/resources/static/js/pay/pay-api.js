let selectedPayMethod = null;

function selectPayMethod(method) {
    ["kakao"].forEach((m) => {
        const el = document.getElementById("method-" + m);
        if (el) el.classList.remove("selected");
    });
    const el = document.getElementById("method-" + method);
    if (el) el.classList.add("selected");
    selectedPayMethod = method;
}

// 기본 선택
selectPayMethod("kakao");

async function submitPayment() {
    const methodMap = {
        kakao: { pg: "kakao", method: "" },
    };
    const { pg, method } = methodMap[selectedPayMethod];

    const orderName =
        document.getElementById("productName")?.innerText || "상품";
    const priceText = document.getElementById("displayPrice")?.innerText || "0";
    const price = parseInt(priceText.replace(/[^0-9]/g, ""), 10) || 0;
    const orderId = "ORDER_" + Date.now();

    try {
        const response = await Bootpay.requestPayment({
            application_id: "69604c28b6279cebf60ad157",
            price,
            order_name: orderName,
            order_id: orderId,
            pg,
            method,
            tax_free: 0,
            user: { id: "", username: "", phone: "", email: "" },
            items: [{ id: "item_001", name: orderName, qty: 1, price }],
            extra: { open_type: "iframe", card_quota: "0,2,3", escrow: false },
        });

        switch (response.event) {
            case "issued":
                alert("가상계좌가 발급되었습니다.");
                break;
            case "done":
                alert("결제가 완료되었습니다!");
                console.log("결제 완료:", response);
                break;
            case "confirm":
                const confirmed = await Bootpay.confirm();
                if (confirmed.event === "done") {
                    alert("결제가 완료되었습니다!");
                }
                break;
        }
    } catch (e) {
        switch (e.event) {
            case "cancel":
                console.log("사용자 결제 취소");
                break;
            case "error":
                alert("결제 오류: " + e.message);
                console.error(e.error_code, e.message);
                break;
            default:
                console.error(e);
        }
    }
}
