window.onload = () => {
    const contestCards = document.querySelectorAll(".contest-item");

    if (!contestCards.length) {
        return;
    }

    contestCards.forEach(function (card) {
        card.style.cursor = "pointer";

        card.addEventListener("click", function () {
            const detailUrl = card.getAttribute("href") || card.dataset.detailUrl;
            if (detailUrl) {
                window.location.href = detailUrl;
            }
        });
    });
};
