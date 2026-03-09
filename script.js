document.addEventListener('DOMContentLoaded', function () {
  var totalSteps = 7;
  var currentStep = 1;
  var formData = {};

  var dots = document.querySelectorAll('#progress-dots .dot');
  var stepLabel = document.getElementById('step-label');
  var backBtn = document.getElementById('back-btn');
  var birthYearInput = document.getElementById('birth-year');
  var togglePrivacy = document.getElementById('toggle-privacy');
  var privacyDetail = document.getElementById('privacy-detail');
  var successModal = document.getElementById('success-modal');
  var modalClose = document.getElementById('modal-close');

  var stepLabels = ['', '성별 선택', '출생연도', '거주 지역', '질병 여부', '보험 선택', '연락처 입력'];

  // ===== 경고 팝업 모달 =====
  var alertModal = document.getElementById('alert-modal');
  var alertModalTitle = document.getElementById('alert-modal-title');
  var alertModalMsg = document.getElementById('alert-modal-msg');
  var alertModalClose = document.getElementById('alert-modal-close');

  function showAlert(title, msg) {
    alertModalTitle.textContent = title;
    alertModalMsg.textContent = msg;
    alertModal.classList.add('active');
  }

  alertModalClose.addEventListener('click', function () { alertModal.classList.remove('active'); });
  alertModal.addEventListener('click', function (e) {
    if (e.target === alertModal) alertModal.classList.remove('active');
  });

  // ===== 스텝 이동 =====
  function goToStep(step) {
    if (step < 1 || step > totalSteps) return;
    document.querySelectorAll('.step').forEach(function (s) { s.classList.remove('active'); });
    var target = document.querySelector('.step[data-step="' + step + '"]');
    if (target) target.classList.add('active');
    currentStep = step;

    // 프로그레스 도트 업데이트
    dots.forEach(function (d, i) {
      d.classList.remove('active', 'done');
      if (i < step - 1) d.classList.add('done');
      if (i === step - 1) d.classList.add('active');
    });

    stepLabel.textContent = stepLabels[step - 1] || '';
    backBtn.style.display = step > 1 ? 'block' : 'none';
    document.querySelector('.form-float').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ===== 이전 버튼 =====
  backBtn.addEventListener('click', function () {
    goToStep(currentStep - 1);
  });

  // ===== 단일 선택 (pick-card & pick-chip 단일) =====
  document.querySelectorAll('.pick-card:not(.multi), .pick-chip:not(.multi)').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var name = this.getAttribute('data-name');
      var value = this.getAttribute('data-value');
      var parent = this.closest('.pick-row');
      parent.querySelectorAll('.pick-card, .pick-chip').forEach(function (b) {
        b.classList.remove('selected');
      });
      this.classList.add('selected');
      formData[name] = value;
      var next = currentStep + 1;
      setTimeout(function () { goToStep(next); }, 200);
    });
  });

  // ===== 복수 선택 (multi) =====
  var diseaseEtc = document.getElementById('disease-etc');
  var insuranceEtc = document.getElementById('insurance-etc');

  document.querySelectorAll('.pick-chip.multi').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var name = this.getAttribute('data-name');
      var value = this.getAttribute('data-value');
      var parent = this.closest('.pick-row');

      if (name === 'disease') {
        if (value === '없음') {
          parent.querySelectorAll('.pick-chip').forEach(function (b) { b.classList.remove('selected'); });
          this.classList.add('selected');
        } else {
          parent.querySelector('[data-value="없음"]').classList.remove('selected');
          this.classList.toggle('selected');
        }
      } else {
        this.classList.toggle('selected');
      }

      var selected = [];
      parent.querySelectorAll('.pick-chip.selected').forEach(function (b) {
        selected.push(b.getAttribute('data-value'));
      });
      formData[name] = selected;

      // 기타 메모 토글
      if (name === 'disease') {
        var hasEtc = selected.indexOf('기타') !== -1;
        diseaseEtc.style.display = hasEtc ? 'block' : 'none';
        if (!hasEtc) document.getElementById('disease-etc-input').value = '';
      }
      if (name === 'insuranceType') {
        var hasEtc2 = selected.indexOf('기타') !== -1;
        insuranceEtc.style.display = hasEtc2 ? 'block' : 'none';
        if (!hasEtc2) document.getElementById('insurance-etc-input').value = '';
      }

      var nextBtnId = name === 'disease' ? 'disease-next' : 'insurance-next';
      var nextBtn = document.getElementById(nextBtnId);
      if (nextBtn) nextBtn.disabled = selected.length === 0;
    });
  });

  // ===== 출생연도 직접 입력 =====
  var birthYearErr = document.getElementById('birth-year-error');

  birthYearInput.addEventListener('input', function () {
    this.value = this.value.replace(/[^0-9]/g, '');
    var v = this.value;
    var yearNum = parseInt(v);
    var currentYear = new Date().getFullYear();
    var valid = v.length === 4 && yearNum >= 1940 && yearNum <= currentYear;

    if (valid) {
      formData.birthYear = v;
      birthYearErr.textContent = '';
      birthYearInput.classList.remove('invalid');
      document.getElementById('birth-year-next').disabled = false;
    } else {
      document.getElementById('birth-year-next').disabled = true;
      if (v.length === 4) {
        birthYearErr.textContent = '1940년 ~ ' + currentYear + '년 사이로 입력해주세요.';
        birthYearInput.classList.add('invalid');
      } else {
        birthYearErr.textContent = '';
        birthYearInput.classList.remove('invalid');
      }
    }
  });

  // ===== 다음 버튼 =====
  document.querySelectorAll('[data-next]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      if (this.disabled) return;
      if (this.type === 'submit') return; // form submit 은 별도 처리
      var next = parseInt(this.getAttribute('data-next'));
      goToStep(next);
    });
  });

  // ===== 전화번호 자동 포맷 =====
  var phoneInput = document.getElementById('phone');
  phoneInput.addEventListener('input', function () {
    var v = this.value.replace(/[^0-9]/g, '');
    if (v.length <= 3) this.value = v;
    else if (v.length <= 7) this.value = v.slice(0, 3) + '-' + v.slice(3);
    else this.value = v.slice(0, 3) + '-' + v.slice(3, 7) + '-' + v.slice(7, 11);
  });

  // ===== 개인정보 토글 =====
  togglePrivacy.addEventListener('click', function () {
    privacyDetail.classList.toggle('open');
    this.textContent = privacyDetail.classList.contains('open') ? '닫기' : '상세';
  });

  // ===== 최종 제출 =====
  document.getElementById('final-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;
    var alertMsg = '';
    var nameInput = document.getElementById('name');
    var nameErr = document.getElementById('name-error');

    if (!nameInput.value.trim()) {
      nameErr.textContent = '이름을 입력해주세요.';
      nameInput.classList.add('invalid');
      valid = false;
      if (!alertMsg) alertMsg = '이름을 입력해주세요.';
    } else {
      nameErr.textContent = '';
      nameInput.classList.remove('invalid');
    }

    var phoneRegex = /^010-\d{4}-\d{4}$/;
    var phoneErr = document.getElementById('phone-error');
    if (!phoneRegex.test(phoneInput.value)) {
      phoneErr.textContent = '전화번호는 010-0000-0000 형식으로 입력해주세요.';
      phoneInput.classList.add('invalid');
      valid = false;
      if (!alertMsg) alertMsg = '전화번호는 010-0000-0000 형식으로 입력해주세요.';
    } else {
      phoneErr.textContent = '';
      phoneInput.classList.remove('invalid');
    }

    var consent = document.getElementById('privacy-consent');
    var consentErr = document.getElementById('consent-error');
    if (!consent.checked) {
      consentErr.textContent = '개인정보 수집에 동의해주세요.';
      valid = false;
      if (!alertMsg) alertMsg = '개인정보 수집 및 이용에 동의해주세요.';
    } else {
      consentErr.textContent = '';
    }

    if (!valid) {
      showAlert('입력 확인', alertMsg);
      return;
    }

    formData.name = nameInput.value.trim();
    formData.phone = phoneInput.value;
    var diseaseEtcVal = document.getElementById('disease-etc-input').value.trim();
    if (diseaseEtcVal) formData.diseaseEtc = diseaseEtcVal;
    var insuranceEtcVal = document.getElementById('insurance-etc-input').value.trim();
    if (insuranceEtcVal) formData.insuranceTypeEtc = insuranceEtcVal;
    formData.submittedAt = new Date().toISOString();
    console.log('상담 신청 데이터:', JSON.stringify(formData, null, 2));

    successModal.classList.add('active');
    this.reset();
    goToStep(1);
    formData = {};
  });

  // ===== 모달 =====
  modalClose.addEventListener('click', function () { successModal.classList.remove('active'); });
  successModal.addEventListener('click', function (e) {
    if (e.target === successModal) successModal.classList.remove('active');
  });

  // ===== 노하우 카드 3D 틸트 효과 =====
  document.querySelectorAll('[data-tilt]').forEach(function (card) {
    var shine = card.querySelector('.tip-shine');

    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var centerX = rect.width / 2;
      var centerY = rect.height / 2;
      var rotateX = (y - centerY) / centerY * -12;
      var rotateY = (x - centerX) / centerX * 12;

      card.style.transform = 'perspective(600px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.03, 1.03, 1.03)';

      // 빛 반사 위치
      var mx = (x / rect.width * 100).toFixed(1);
      var my = (y / rect.height * 100).toFixed(1);
      if (shine) {
        shine.style.setProperty('--mx', mx + '%');
        shine.style.setProperty('--my', my + '%');
      }
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.transition = 'transform 0.5s ease, box-shadow 0.25s';
    });

    card.addEventListener('mouseenter', function () {
      card.style.transition = 'box-shadow 0.25s';
    });
  });

  // ===== 실시간 신청현황 =====
  var surnames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '홍', '전', '문', '배', '노'];
  var tbody = document.getElementById('status-tbody');

  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function randomName() { return surnames[rand(0, surnames.length - 1)] + '**'; }
  function randomPhone() { return '010-****-**' + String(rand(10, 99)); }

  function addRow() {
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td>' + randomName() + '</td>' +
      '<td>' + randomPhone() + '</td>' +
      '<td><span class="badge-done">접수완료</span></td>';
    tbody.insertBefore(tr, tbody.firstChild);
    while (tbody.children.length > 7) tbody.removeChild(tbody.lastChild);
  }

  for (var i = 0; i < 5; i++) addRow();

  function scheduleRow() {
    setTimeout(function () {
      addRow();
      scheduleRow();
    }, rand(4000, 12000));
  }
  scheduleRow();
});
