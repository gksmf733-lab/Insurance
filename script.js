document.addEventListener('DOMContentLoaded', function () {
  var totalSteps = 7;
  var currentStep = 1;
  var formData = {};

  var progressFill = document.getElementById('progress-fill');
  var stepIndicator = document.getElementById('step-indicator');
  var backBtn = document.getElementById('back-btn');
  var birthYearSelect = document.getElementById('birth-year');
  var togglePrivacy = document.getElementById('toggle-privacy');
  var privacyDetail = document.getElementById('privacy-detail');
  var successModal = document.getElementById('success-modal');
  var modalClose = document.getElementById('modal-close');

  // ===== 출생연도 옵션 생성 =====
  for (var y = 2010; y >= 1940; y--) {
    var opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y + '년';
    birthYearSelect.appendChild(opt);
  }

  // ===== 스텝 이동 =====
  function goToStep(step) {
    if (step < 1 || step > totalSteps) return;
    var steps = document.querySelectorAll('.step');
    steps.forEach(function (s) { s.classList.remove('active'); });
    var target = document.querySelector('.step[data-step="' + step + '"]');
    if (target) target.classList.add('active');
    currentStep = step;
    progressFill.style.width = (step / totalSteps * 100) + '%';
    stepIndicator.textContent = step + ' / ' + totalSteps + ' 단계';
    backBtn.style.display = step > 1 ? 'inline-flex' : 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ===== 이전 버튼 =====
  backBtn.addEventListener('click', function () {
    goToStep(currentStep - 1);
  });

  // ===== 단일 선택 버튼 (성별, 지역) =====
  document.querySelectorAll('.choice-btn:not(.multi)').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var name = this.getAttribute('data-name');
      var value = this.getAttribute('data-value');
      // 같은 그룹에서 선택 해제
      this.closest('.choice-grid').querySelectorAll('.choice-btn').forEach(function (b) {
        b.classList.remove('selected');
      });
      this.classList.add('selected');
      formData[name] = value;
      // 자동 다음 단계
      var nextStep = currentStep + 1;
      setTimeout(function () { goToStep(nextStep); }, 250);
    });
  });

  // ===== 복수 선택 버튼 (질병, 보험종류) =====
  document.querySelectorAll('.choice-btn.multi').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var name = this.getAttribute('data-name');
      var value = this.getAttribute('data-value');
      var grid = this.closest('.choice-grid');

      // "없음" 로직
      if (name === 'disease') {
        if (value === '없음') {
          grid.querySelectorAll('.choice-btn').forEach(function (b) {
            b.classList.remove('selected');
          });
          this.classList.add('selected');
        } else {
          grid.querySelector('[data-value="없음"]').classList.remove('selected');
          this.classList.toggle('selected');
        }
      } else {
        this.classList.toggle('selected');
      }

      // 데이터 수집
      var selected = [];
      grid.querySelectorAll('.choice-btn.selected').forEach(function (b) {
        selected.push(b.getAttribute('data-value'));
      });
      formData[name] = selected;

      // 다음 버튼 활성화
      var nextBtnId = name === 'disease' ? 'disease-next' : 'insurance-next';
      var nextBtn = document.getElementById(nextBtnId);
      if (nextBtn) nextBtn.disabled = selected.length === 0;
    });
  });

  // ===== 출생연도 선택 =====
  birthYearSelect.addEventListener('change', function () {
    formData.birthYear = this.value;
    var nextBtn = document.getElementById('birth-year-next');
    nextBtn.disabled = !this.value;
  });

  // ===== 다음 버튼 클릭 =====
  document.querySelectorAll('.next-btn[data-next]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (this.disabled) return;
      var next = parseInt(this.getAttribute('data-next'));
      goToStep(next);
    });
  });

  // ===== 전화번호 자동 포맷 =====
  var phoneInput = document.getElementById('phone');
  phoneInput.addEventListener('input', function () {
    var v = this.value.replace(/[^0-9]/g, '');
    if (v.length <= 3) {
      this.value = v;
    } else if (v.length <= 7) {
      this.value = v.slice(0, 3) + '-' + v.slice(3);
    } else {
      this.value = v.slice(0, 3) + '-' + v.slice(3, 7) + '-' + v.slice(7, 11);
    }
  });

  // ===== 개인정보 동의 토글 =====
  togglePrivacy.addEventListener('click', function () {
    privacyDetail.classList.toggle('open');
    this.textContent = privacyDetail.classList.contains('open') ? '닫기' : '보기';
  });

  // ===== 최종 폼 제출 =====
  var finalForm = document.getElementById('final-form');
  finalForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;

    var nameInput = document.getElementById('name');
    var nameError = document.getElementById('name-error');
    if (!nameInput.value.trim()) {
      nameError.textContent = '이름을 입력해주세요.';
      nameInput.classList.add('invalid');
      valid = false;
    } else {
      nameError.textContent = '';
      nameInput.classList.remove('invalid');
    }

    var phoneVal = phoneInput.value.replace(/[^0-9]/g, '');
    var phoneError = document.getElementById('phone-error');
    if (!phoneVal || phoneVal.length < 10) {
      phoneError.textContent = '올바른 연락처를 입력해주세요.';
      phoneInput.classList.add('invalid');
      valid = false;
    } else {
      phoneError.textContent = '';
      phoneInput.classList.remove('invalid');
    }

    var consent = document.getElementById('privacy-consent');
    var consentError = document.getElementById('consent-error');
    if (!consent.checked) {
      consentError.textContent = '개인정보 수집에 동의해주세요.';
      valid = false;
    } else {
      consentError.textContent = '';
    }

    if (!valid) return;

    formData.name = nameInput.value.trim();
    formData.phone = phoneInput.value;
    formData.submittedAt = new Date().toISOString();

    console.log('상담 신청 데이터:', JSON.stringify(formData, null, 2));

    successModal.classList.add('active');
    finalForm.reset();
    goToStep(1);
    formData = {};
  });

  // ===== 모달 닫기 =====
  modalClose.addEventListener('click', function () {
    successModal.classList.remove('active');
  });
  successModal.addEventListener('click', function (e) {
    if (e.target === successModal) successModal.classList.remove('active');
  });

  // ===== 실시간 신청현황 =====
  var surnames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '홍'];
  var tbody = document.getElementById('status-tbody');
  var maxRows = 8;

  function randomPhone() {
    var last2 = String(Math.floor(Math.random() * 100)).padStart(2, '0');
    return '010-****-**' + last2;
  }

  function randomName() {
    var s = surnames[Math.floor(Math.random() * surnames.length)];
    return s + '**';
  }

  function addRow() {
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td>' + randomName() + '</td>' +
      '<td>' + randomPhone() + '</td>' +
      '<td><span class="status-badge">접수완료</span></td>';
    tbody.insertBefore(tr, tbody.firstChild);

    // 최대 행 수 유지
    while (tbody.children.length > maxRows) {
      tbody.removeChild(tbody.lastChild);
    }
  }

  // 초기 5개 행 즉시 표시
  for (var i = 0; i < 5; i++) {
    addRow();
  }

  // 랜덤 간격으로 새 행 추가 (5~15초)
  function scheduleNextRow() {
    var delay = 5000 + Math.floor(Math.random() * 10000);
    setTimeout(function () {
      addRow();
      scheduleNextRow();
    }, delay);
  }
  scheduleNextRow();
});
