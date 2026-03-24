window.addEventListener('load', function () {
    var uploadArea = document.getElementById('uploadArea');
    var fileInput = document.getElementById('fileInput');
    var previewImage = document.getElementById('previewImage');
    var publishBtn = document.getElementById('publishBtn');
    var formSubmitBtn = document.getElementById('formSubmitBtn');

    var selectedFile = null;

    // ── 수정 모드: 기존 커버 이미지 표시 ──
    if (window.EXISTING_COVER) {
        previewImage.src = window.EXISTING_COVER;
        previewImage.style.display = 'block';
        uploadArea.classList.add('has-image');
    }

    // ── 업로드 영역 클릭 → 파일 선택 ──
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', function () {
            fileInput.click();
        });
    }

    // ── 파일 선택 ──
    if (fileInput) {
        fileInput.addEventListener('change', function (e) {
            var file = e.target.files[0];
            if (file) {
                handleFile(file);
            }
        });
    }

    // ── 드래그 앤 드롭 ──
    if (uploadArea) {
        uploadArea.addEventListener('dragover', function (e) {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        uploadArea.addEventListener('dragleave', function () {
            uploadArea.classList.remove('dragover');
        });
        uploadArea.addEventListener('drop', function (e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            var file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                handleFile(file);
            }
        });
    }

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드할 수 있습니다.');
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            alert('20MB 이하의 파일만 업로드할 수 있습니다.');
            return;
        }
        selectedFile = file;
        var reader = new FileReader();
        reader.onload = function (ev) {
            previewImage.src = ev.target.result;
            previewImage.style.display = 'block';
            uploadArea.classList.add('has-image');
        };
        reader.readAsDataURL(file);
    }

    // ── 게시 버튼 (헤더 + 폼 하단 둘 다) ──
    function submitContest() {
        var title = document.getElementById('title');
        var organizer = document.getElementById('organizer');
        var category = document.getElementById('category');
        var entryStart = document.getElementById('startDate') || document.getElementById('entryStart');
        var entryEnd = document.getElementById('endDate') || document.getElementById('entryEnd');
        var resultDate = document.getElementById('resultDate');
        var description = document.getElementById('description');
        var prizeInfo = document.getElementById('prizeInfo');
        var price = document.getElementById('price');

        if (!title || !title.value.trim()) {
            alert('제목을 입력해주세요.');
            if (title) title.focus();
            return;
        }
        if (!organizer || !organizer.value.trim()) {
            alert('기관을 입력해주세요.');
            if (organizer) organizer.focus();
            return;
        }
        if (!entryStart || !entryStart.value || !entryEnd || !entryEnd.value) {
            alert('접수 시작일과 마감일을 입력해주세요.');
            return;
        }

        var formData = new FormData();
        formData.append('title', title.value.trim());
        formData.append('organizer', organizer.value.trim());
        if (category && category.value.trim()) formData.append('category', category.value.trim());
        formData.append('entryStart', entryStart.value);
        formData.append('entryEnd', entryEnd.value);
        if (resultDate && resultDate.value) formData.append('resultDate', resultDate.value);
        if (description && description.value.trim()) formData.append('description', description.value.trim());
        if (prizeInfo && prizeInfo.value.trim()) formData.append('prizeInfo', prizeInfo.value.trim());
        if (price && price.value) formData.append('price', price.value);

        if (selectedFile) {
            formData.append('coverFile', selectedFile);
        }

        var isEdit = window.CONTEST_EDIT === true;
        var contestId = window.CONTEST_ID;
        var endpoint = isEdit && contestId
            ? '/contest/api/' + contestId + '/edit'
            : '/contest/api/register';

        fetch(endpoint, { method: 'POST', body: formData })
            .then(function (res) {
                if (!res.ok) return res.text().then(function (t) { throw new Error(t || '등록에 실패했습니다.'); });
                return res.json();
            })
            .then(function (data) {
                window.location.href = '/contest/detail/' + data.contestId;
            })
            .catch(function (err) {
                alert(err.message || '공모전 등록에 실패했습니다.');
            });
    }

    if (publishBtn) {
        publishBtn.addEventListener('click', submitContest);
    }
    if (formSubmitBtn && formSubmitBtn !== publishBtn) {
        formSubmitBtn.addEventListener('click', submitContest);
    }
});

// ── 날짜 유효성 검증 (HTML onclick에서 호출) ──
function checkDate() {
    var startDate = document.getElementById('startDate') || document.getElementById('entryStart');
    var endDate = document.getElementById('endDate') || document.getElementById('entryEnd');
    var resultDate = document.getElementById('resultDate');

    if (!startDate || !startDate.value) {
        alert('접수 시작일을 입력해주세요.');
        return;
    }
    if (!endDate || !endDate.value) {
        alert('접수 마감일을 입력해주세요.');
        return;
    }
    if (startDate.value > endDate.value) {
        alert('접수 시작일이 마감일보다 늦을 수 없습니다.');
        return;
    }
    if (resultDate && resultDate.value && resultDate.value < endDate.value) {
        alert('결과 발표일이 접수 마감일보다 빠를 수 없습니다.');
        return;
    }
    alert('날짜가 정상적으로 설정되었습니다.');
}
