document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('consultation-form');
  const birthYearSelect = document.getElementById('birth-year');
  const togglePrivacy = document.getElementById('toggle-privacy');
  const privacyDetail = document.getElementById('privacy-detail');
  const successModal = document.getElementById('success-modal');
  const modalClose = document.getElementById('modal-close');
  const diseaseNone = document.getElementById('disease-none');

  // 출생연도 옵션 생성 (1940 ~ 2010)
  for (let year = 2010; year >= 1940; year--) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year + '년';
    birthYearSelect.appendChild(option);
  }

  // "없음" 체크박스 로직: "없음" 선택 시 다른 질병 해제, 질병 선택 시 "없음" 해제
  const diseaseCheckboxes = document.querySelectorAll('input[name="disease"]');
  diseaseCheckboxes.forEach(function (cb) {
    cb.addEventListener('change', function () {
      if (this.value === '없음' && this.checked) {
        diseaseCheckboxes.forEach(function (other) {
          if (other.value !== '없음') other.checked = false;
        });
      } else if (this.value !== '없음' && this.checked) {
        diseaseNone.checked = false;
      }
    });
  });

  // 개인정보 동의 토글
  togglePrivacy.addEventListener('click', function () {
    privacyDetail.classList.toggle('open');
    this.textContent = privacyDetail.classList.contains('open') ? '내용 닫기' : '내용 보기';
  });

  // 전화번호 자동 포맷
  var phoneInput = document.getElementById('phone');
  phoneInput.addEventListener('input', function () {
    var value = this.value.replace(/[^0-9]/g, '');
    if (value.length <= 3) {
      this.value = value;
    } else if (value.length <= 7) {
      this.value = value.slice(0, 3) + '-' + value.slice(3);
    } else {
      this.value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
    }
  });

  // 폼 유효성 검사
  function validateForm() {
    var isValid = true;

    // 이름
    var name = document.getElementById('name');
    var nameError = document.getElementById('name-error');
    if (!name.value.trim()) {
      nameError.textContent = '이름을 입력해주세요.';
      name.classList.add('invalid');
      isValid = false;
    } else {
      nameError.textContent = '';
      name.classList.remove('invalid');
    }

    // 연락처
    var phone = document.getElementById('phone');
    var phoneError = document.getElementById('phone-error');
    var phoneValue = phone.value.replace(/[^0-9]/g, '');
    if (!phoneValue || phoneValue.length < 10) {
      phoneError.textContent = '올바른 연락처를 입력해주세요.';
      phone.classList.add('invalid');
      isValid = false;
    } else {
      phoneError.textContent = '';
      phone.classList.remove('invalid');
    }

    // 성별
    var genderError = document.getElementById('gender-error');
    var genderSelected = document.querySelector('input[name="gender"]:checked');
    if (!genderSelected) {
      genderError.textContent = '성별을 선택해주세요.';
      isValid = false;
    } else {
      genderError.textContent = '';
    }

    // 출생연도
    var birthYear = document.getElementById('birth-year');
    var birthYearError = document.getElementById('birth-year-error');
    if (!birthYear.value) {
      birthYearError.textContent = '출생연도를 선택해주세요.';
      birthYear.classList.add('invalid');
      isValid = false;
    } else {
      birthYearError.textContent = '';
      birthYear.classList.remove('invalid');
    }

    // 지역
    var region = document.getElementById('region');
    var regionError = document.getElementById('region-error');
    if (!region.value) {
      regionError.textContent = '거주 지역을 선택해주세요.';
      region.classList.add('invalid');
      isValid = false;
    } else {
      regionError.textContent = '';
      region.classList.remove('invalid');
    }

    // 기존 질병
    var diseaseError = document.getElementById('disease-error');
    var diseaseChecked = document.querySelectorAll('input[name="disease"]:checked');
    if (diseaseChecked.length === 0) {
      diseaseError.textContent = '기존 질병을 선택해주세요. (없으면 "없음" 선택)';
      isValid = false;
    } else {
      diseaseError.textContent = '';
    }

    // 보험 종류
    var insuranceError = document.getElementById('insurance-type-error');
    var insuranceChecked = document.querySelectorAll('input[name="insuranceType"]:checked');
    if (insuranceChecked.length === 0) {
      insuranceError.textContent = '관심있는 보험 종류를 1개 이상 선택해주세요.';
      isValid = false;
    } else {
      insuranceError.textContent = '';
    }

    // 개인정보 동의
    var consent = document.getElementById('privacy-consent');
    var consentError = document.getElementById('consent-error');
    if (!consent.checked) {
      consentError.textContent = '개인정보 수집에 동의해주세요.';
      isValid = false;
    } else {
      consentError.textContent = '';
    }

    return isValid;
  }

  // 폼 제출
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateForm()) {
      // 첫 번째 에러 항목으로 스크롤
      var firstError = form.querySelector('.invalid, .error-msg:not(:empty)');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // 폼 데이터 수집
    var formData = {
      name: document.getElementById('name').value.trim(),
      phone: document.getElementById('phone').value,
      gender: document.querySelector('input[name="gender"]:checked').value,
      birthYear: document.getElementById('birth-year').value,
      region: document.getElementById('region').value,
      diseases: Array.from(document.querySelectorAll('input[name="disease"]:checked')).map(function (cb) {
        return cb.value;
      }),
      insuranceTypes: Array.from(document.querySelectorAll('input[name="insuranceType"]:checked')).map(function (cb) {
        return cb.value;
      }),
      submittedAt: new Date().toISOString()
    };

    // 콘솔에 데이터 출력 (실제 서비스에서는 서버로 전송)
    console.log('상담 신청 데이터:', JSON.stringify(formData, null, 2));

    // 성공 모달 표시
    successModal.classList.add('active');

    // 폼 초기화
    form.reset();
  });

  // 모달 닫기
  modalClose.addEventListener('click', function () {
    successModal.classList.remove('active');
  });

  successModal.addEventListener('click', function (e) {
    if (e.target === successModal) {
      successModal.classList.remove('active');
    }
  });
});
