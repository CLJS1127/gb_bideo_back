window.addEventListener('load', function () {
    var workSelect = document.getElementById('workSelect');
    var entrySubmitBtn = document.getElementById('entrySubmitBtn');
    if (workSelect && entrySubmitBtn) {
        workSelect.addEventListener('change', function () {
            var selected = workSelect.value !== '';
            entrySubmitBtn.disabled = !selected;
            entrySubmitBtn.style.opacity = selected ? '1' : '0.5';
            entrySubmitBtn.style.cursor = selected ? 'pointer' : 'not-allowed';
        });
    }
});

function toggleScrap(btn) {
    btn.classList.toggle("active");
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(function () {
        alert("링크가 복사되었습니다.");
    });
}
