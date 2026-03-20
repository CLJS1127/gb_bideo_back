window.onload = () => {
    var contestCards = document.querySelectorAll(".contest-item");

    if (!contestCards.length) {
        return;
    }

    contestCards.forEach(function (card) {
        card.style.cursor = "pointer";

        card.addEventListener("click", function () {
            var detailUrl = card.getAttribute("href") || card.dataset.detailUrl;
            if (detailUrl) {
                window.location.href = detailUrl;
            }
        });
    });
};
