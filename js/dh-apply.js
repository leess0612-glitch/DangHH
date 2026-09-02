/* ===========================================================
   당현함 신청창(팝업) 공용 부품 (2026-09-02 새로 만듦)

   ★ 무엇을 하나
     요금표(plans.html)·사은품명단(gift.html)처럼 신청칸이 없던 페이지에서도
     메인과 똑같은 신청창이 '그 자리에서' 뜨게 한다.
     전에는 단추를 누르면 메인 주소(#apply-now)로 페이지를 통째로 갈아탔고,
     그래서 손님 화면이 메인 맨 위로 튀었다.

   ★ 쓰는 법 — 페이지에 이 한 줄만 넣으면 된다 (js/dh-terms.js 와 같은 방식)
       <script src="js/dh-apply.js?v=1"></script>
     그 뒤로 단추에 onclick="신청창열기()" 를 걸면 창이 뜬다.
     (창 모양 규칙도 창 상자도 이 파일이 알아서 만들어 붙인다)

   ★ 메인·렌탈은 건드리지 않는다
     페이지에 이미 id="applyOverlay" 상자가 있으면 그것을 그대로 쓰고,
     그 페이지가 자기 함수를 나중에 정의하면 그쪽이 이긴다.

   ★ 함께 봐야 하는 것
     - js/dh-inflow.js : 유입경로(광고 갈래) — dhInflow() 로 값을 받아 함께 보낸다
     - 구글 쪽 당현함_신청폼.gs : "같은 번호가 2분 안에 또 오면 무시" 규칙과 한 쌍이다.
       아래 '다시 보내기 3번'과 짝이므로 한쪽만 되돌리면 시트에 중복 줄이 생긴다.
   =========================================================== */
(function () {
  'use strict';

  var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxmkjm-U5m29WEkjKpAV8RovWAo9JMFJmR6t2BCgQPboPdpLSVwORTJ1_-kRXeCAeS84A/exec';

  var 고른서비스 = { internet: true, rental: false };
  var 기록넣음 = false;      // 뒤로가기용 빈 칸을 우리가 넣었는지
  var 스스로되돌림 = false;  // 우리가 직접 부른 되돌리기인지

  /* ───────────────────────────────────────────────────────────
     1) 창 모양 규칙 심기
     값은 index.html 것과 같다. 다만 바깥 페이지(요금표·명단)의 글자·표 모양을
     건드리지 않도록, 창 안쪽 규칙에는 전부 #applyOverlay 이름표를 붙였다.
     ─────────────────────────────────────────────────────────── */
  function 모양심기() {
    if (document.getElementById('dh-apply-style')) return;
    var st = document.createElement('style');
    st.id = 'dh-apply-style';
    st.textContent = [
      /* ===== 창(덮개) 자체 ===== */
      '#applyOverlay{position:fixed;inset:0;z-index:2100;background:rgba(6,18,54,.62);',
      'display:flex;align-items:flex-start;justify-content:center;padding:62px 16px 28px;',
      'overflow-y:auto;-webkit-overflow-scrolling:touch;opacity:0;visibility:hidden;',
      'transition:opacity .30s ease, visibility 0s linear .30s;}',
      '#applyOverlay.open{opacity:1;visibility:visible;transition:opacity .30s ease, visibility 0s linear 0s;}',
      '#applyOverlay .apply-modal{position:relative;width:100%;max-width:420px;margin:auto;',
      'transform:translateY(18px) scale(.985);transition:transform .34s cubic-bezier(.22,.72,.28,1);',
      'max-height:calc(100vh - 96px);max-height:calc(100dvh - 96px);}',
      '#applyOverlay.open .apply-modal{transform:none;}',
      '#applyOverlay .hero-form-wrap{flex:none;width:100%;}',
      /* 닫기(X) 단추가 화면 밖으로 밀리지 않도록 '창 안쪽'만 굴러가게 한다 */
      '#applyOverlay .form-card{background:#fff;border-radius:20px;padding:40px;max-width:100%;margin:0;',
      'box-shadow:0 30px 80px rgba(2,10,40,.55);',
      'max-height:calc(100vh - 96px);max-height:calc(100dvh - 96px);',
      'overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;}',
      '#applyOverlay .apply-close{position:absolute;top:-44px;right:0;width:36px;height:36px;padding:0;',
      'border:none;border-radius:50%;background:rgba(255,255,255,.92);color:#0f172a;font-size:15px;',
      'line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;',
      'box-shadow:0 4px 14px rgba(0,0,0,.28);font-family:\'SUIT\',sans-serif;}',
      '#applyOverlay .apply-close:hover{background:#fff;}',
      /* 창이 떠 있는 동안 뒷 페이지가 같이 밀리지 않게 */
      'body.apply-open{overflow:hidden;}',

      /* ===== 창 안 신청칸 ===== */
      '#applyOverlay .form-headline{font-size:17px;font-weight:800;color:var(--dark,#0f172a);',
      'text-align:center;margin:0 0 24px;}',
      '#applyOverlay .form-headline span{color:var(--primary,#1461F0);}',
      '#applyOverlay .service-tabs{display:flex;gap:12px;margin-bottom:0;}',
      '#applyOverlay .service-tab{flex:1;border:2px solid var(--border,#e2e8f0);border-radius:12px;',
      'padding:14px 10px;text-align:center;cursor:pointer;transition:all .2s;font-size:14px;',
      'font-weight:600;color:var(--gray,#64748b);background:#fff;user-select:none;}',
      '#applyOverlay .service-tab.active{border-color:var(--primary,#1461F0);background:#eff6ff;color:var(--primary,#1461F0);}',
      '#applyOverlay .service-tab:active{transform:scale(0.98);}',
      '#applyOverlay .service-tab-icon{font-size:24px;margin-bottom:4px;}',
      '#applyOverlay .usim-check{display:flex;align-items:flex-start;gap:10px;padding:13px 15px;',
      'background:#fffbeb;border:1px solid #fde68a;border-radius:10px;margin-bottom:16px;cursor:pointer;}',
      '#applyOverlay .usim-check input[type="checkbox"]{width:17px;height:17px;accent-color:var(--primary,#1461F0);',
      'flex-shrink:0;margin-top:2px;cursor:pointer;}',
      '#applyOverlay .usim-check label{font-size:13px;font-weight:500;color:#92400e;cursor:pointer;line-height:1.5;}',
      '#applyOverlay .form-group{margin-bottom:14px;}',
      '#applyOverlay .form-group label{display:block;font-size:13px;font-weight:600;color:var(--gray,#64748b);margin-bottom:5px;}',
      '#applyOverlay .form-group input{width:100%;padding:13px 16px;border:2px solid var(--border,#e2e8f0);',
      'border-radius:10px;font-size:15px;font-family:\'SUIT\',sans-serif;transition:border-color .2s;outline:none;}',
      '#applyOverlay .form-group input:focus{border-color:var(--primary,#1461F0);}',
      '#applyOverlay .form-group input::placeholder{color:#cbd5e1;}',
      '#applyOverlay .form-group textarea{width:100%;padding:13px 16px;border:2px solid var(--border,#e2e8f0);',
      'border-radius:10px;font-size:15px;font-family:\'SUIT\',sans-serif;transition:border-color .2s;outline:none;',
      'line-height:1.6;resize:vertical;min-height:84px;color:var(--dark,#0f172a);}',
      '#applyOverlay .form-group textarea:focus{border-color:var(--primary,#1461F0);}',
      '#applyOverlay .form-group textarea::placeholder{color:#cbd5e1;}',
      '#applyOverlay .memo-hint{font-size:12px;color:#94a3b8;line-height:1.65;margin-bottom:7px;}',
      '#applyOverlay .memo-count{text-align:right;font-size:12px;color:#94a3b8;margin-top:5px;}',
      '#applyOverlay .memo-count.over{color:#dc2626;font-weight:700;}',
      '#applyOverlay .memo-toggle{display:inline-flex;align-items:center;gap:6px;background:none;border:none;',
      'padding:14px 0;margin:-12px 0 0;font-family:\'SUIT\',sans-serif;font-size:13px;font-weight:600;',
      'color:var(--gray,#64748b);cursor:pointer;text-decoration:underline;text-underline-offset:3px;',
      'text-decoration-color:#cbd5e1;}',
      '#applyOverlay .memo-toggle:hover{color:var(--primary,#1461F0);text-decoration-color:var(--primary,#1461F0);}',
      '#applyOverlay .memo-toggle .plus{display:inline-flex;align-items:center;justify-content:center;',
      'width:16px;height:16px;border-radius:50%;background:var(--border,#e2e8f0);color:var(--gray,#64748b);',
      'font-size:12px;font-weight:800;line-height:1;text-decoration:none;}',
      '#applyOverlay .memo-toggle:hover .plus{background:#dbeafe;color:var(--primary,#1461F0);}',
      '#applyOverlay .memo-fold{display:none;}',
      '#applyOverlay .memo-fold.open{display:block;}',
      '#applyOverlay .form-urgency{text-align:center;font-size:13px;color:#dc2626;font-weight:700;',
      'margin-bottom:12px;background:#fff5f5;border-radius:8px;padding:8px 12px;}',
      '#applyOverlay .form-submit{width:100%;padding:18px;background:#1461F0;color:#fff;font-size:17px;',
      'font-weight:800;border:none;border-radius:12px;cursor:pointer;transition:all .2s;',
      'letter-spacing:-0.3px;font-family:\'SUIT\',sans-serif;}',
      '#applyOverlay .form-submit:hover{background:#0E48CC;transform:translateY(-1px);box-shadow:0 8px 24px rgba(20,97,240,0.4);}',
      '#applyOverlay .form-submit:disabled{background:#94a3b8;transform:none;box-shadow:none;cursor:not-allowed;}',
      '#applyOverlay .form-success{display:none;text-align:center;padding:40px 20px;}',
      '#applyOverlay .form-success .s-icon{font-size:56px;margin-bottom:16px;}',
      '#applyOverlay .form-success h3{font-size:22px;font-weight:800;margin-bottom:8px;color:var(--dark,#0f172a);}',
      '#applyOverlay .form-success p{color:var(--gray,#64748b);font-size:15px;line-height:1.8;}',
      '#applyOverlay .fold-br{display:none;}',
      /* 폰에서는 창 안쪽 여백을 줄인다 (메인과 같은 값) */
      '@media (max-width:768px){#applyOverlay .form-card{padding:24px 18px;}',
      '#applyOverlay .form-submit:hover{transform:none;box-shadow:none;}}',
      /* 아주 좁은 폰(폴드류)에서만 유심 안내 글을 두 줄로 */
      '@media (max-width:360px){#applyOverlay .fold-br{display:block;}}'
    ].join('');
    (document.head || document.documentElement).appendChild(st);
  }
  모양심기();

  /* ───────────────────────────────────────────────────────────
     2) 창 상자 만들기 (처음 열 때 한 번만)
     페이지에 이미 상자가 있으면(메인·렌탈) 그것을 그대로 쓴다.
     ─────────────────────────────────────────────────────────── */
  function 상자만들기() {
    var 이미 = document.getElementById('applyOverlay');
    if (이미) return 이미;
    if (!document.body) return null;

    var 덮개 = document.createElement('div');
    덮개.className = 'apply-overlay';
    덮개.id = 'applyOverlay';
    덮개.setAttribute('aria-hidden', 'true');
    덮개.innerHTML =
      '<div class="apply-modal" role="dialog" aria-modal="true" aria-label="놓친 지원금 무료 확인 신청">' +
        '<button type="button" class="apply-close" aria-label="닫기">&#10005;</button>' +
        '<div class="hero-form-wrap" id="applyForm">' +
          '<div class="form-card">' +
            '<div id="formContent">' +
              '<p class="form-headline"><span>내 지원금</span>이 얼마인지 확인해보세요</p>' +
              '<div class="service-tabs">' +
                '<div class="service-tab active" id="tab-internet"><div class="service-tab-icon">📡</div>인터넷</div>' +
                '<div class="service-tab" id="tab-rental"><div class="service-tab-icon">🏠</div>렌탈</div>' +
              '</div>' +
              '<p style="font-size:12px;color:var(--gray,#64748b);margin-top:0;margin-bottom:14px;text-align:center;">(둘 다 선택 가능)</p>' +
              '<div class="usim-check">' +
                '<input type="checkbox" id="usimCheck">' +
                '<label for="usimCheck">휴대폰 기종 변경 없이<br class="fold-br"> 통신사만 바꾸고 추가 현금 받기 <span style="white-space:nowrap;">(유심 번호이동)</span></label>' +
              '</div>' +
              '<div class="form-group">' +
                '<label for="inputName">이름 <span style="font-size:11px;color:#94a3b8;font-weight:500;">(선택)</span></label>' +
                '<input type="text" id="inputName" placeholder="이름을 입력해주세요" maxlength="20">' +
              '</div>' +
              '<div class="form-group">' +
                '<label for="inputPhone">휴대폰 번호 <span style="font-size:11px;color:#b0b8c1;font-weight:500;">(필수)</span></label>' +
                '<input type="tel" id="inputPhone" placeholder="휴대폰번호를 입력해주세요" maxlength="13">' +
              '</div>' +
              '<button type="button" class="memo-toggle" id="memoToggle"><span class="plus">+</span> 요청사항 남기기</button>' +
              '<div class="form-group memo-fold" id="memoFold">' +
                '<p class="memo-hint">예) 통화는 오후 2시 이후에 부탁드려요 · 지금 SK 쓰는데 KT로 바꾸면 얼마 받나요?</p>' +
                '<textarea id="inputMemo" maxlength="200" placeholder="남기실 말씀을 적어주세요"></textarea>' +
                '<div class="memo-count"><span id="memoCount">0</span> / 200자</div>' +
              '</div>' +
              '<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:18px;">' +
                '<input type="checkbox" id="c1" checked style="width:12px;height:12px;accent-color:#9ca3af;flex-shrink:0;margin-top:3px;cursor:pointer;opacity:0.7;">' +
                '<label for="c1" style="font-size:13px;color:var(--gray,#64748b);cursor:pointer;line-height:1.5;">개인정보 수집 및 활용동의 <a href="javascript:void(0)" onclick="openPrivacy()" style="color:var(--gray,#64748b);font-weight:600;font-size:12px;text-decoration:none;">›</a> <span style="color:#b0b8c1;font-weight:500;font-size:11px;">(필수)</span></label>' +
              '</div>' +
              '<p class="form-urgency">⏰ 오후 5:30 이전 설치 시 당일 현금 입금</p>' +
              '<button type="button" class="form-submit" id="submitBtn">놓친 지원금 무료 확인</button>' +
              '<p style="margin-top:10px;font-size:13px;color:var(--gray,#64748b);text-align:center;">타업체가 더 준다면? <strong style="color:var(--primary,#1461F0);">차액 120% 보상</strong></p>' +
            '</div>' +
            '<div class="form-success" id="formSuccess">' +
              '<div class="s-icon">✅</div>' +
              '<h3>신청이 완료되었습니다!</h3>' +
              '<p>담당 상담사가 빠른 시간 내에<br>연락드리겠습니다.<br><br>바로 문의하시려면<br><strong style="color:var(--primary,#1461F0);font-size:17px;">1600-4670</strong></p>' +
              '<button type="button" id="resetBtn" style="margin-top:16px;background:none;border:1px solid #d1d5db;border-radius:8px;padding:10px 20px;font-size:14px;color:var(--gray,#64748b);cursor:pointer;font-family:\'SUIT\',sans-serif;">다른 번호로 추가 신청</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(덮개);

    /* 누름·입력 동작 걸기 */
    덮개.addEventListener('click', function (e) { if (e.target === 덮개) 닫기(); });
    덮개.querySelector('.apply-close').addEventListener('click', function () { 닫기(); });
    document.getElementById('tab-internet').addEventListener('click', function () { window.toggleService('internet'); });
    document.getElementById('tab-rental').addEventListener('click', function () { window.toggleService('rental'); });
    document.getElementById('memoToggle').addEventListener('click', function () { window.요청사항펴기(); });
    document.getElementById('submitBtn').addEventListener('click', function () { window.submitForm(); });
    document.getElementById('resetBtn').addEventListener('click', function () { window.resetForm(); });

    /* 번호를 적는 대로 010-1234-5678 모양으로 다듬는다 */
    document.getElementById('inputPhone').addEventListener('input', function () {
      var v = this.value.replace(/\D/g, '');
      if (v.length > 11) v = v.slice(0, 11);
      if (v.length >= 8) v = v.slice(0, 3) + '-' + v.slice(3, 7) + '-' + v.slice(7);
      else if (v.length >= 4) v = v.slice(0, 3) + '-' + v.slice(3);
      this.value = v;
    });
    document.getElementById('inputMemo').addEventListener('input', function () {
      var 표시 = document.getElementById('memoCount');
      표시.textContent = this.value.length;
      표시.parentNode.classList.toggle('over', this.value.length >= 200);
    });
    return 덮개;
  }

  /* ───────────────────────────────────────────────────────────
     3) 열고 닫기
     ─────────────────────────────────────────────────────────── */
  function 열기() {
    var 창 = 상자만들기();
    if (!창 || 창.classList.contains('open')) return;
    창.classList.add('open');
    창.setAttribute('aria-hidden', 'false');
    document.body.classList.add('apply-open');
    /* 폰 뒤로가기로 '페이지를 떠나지 않고 창만' 닫히게 빈 칸을 하나 넣어 둔다 */
    if (!기록넣음) {
      try { history.pushState({ dh신청: 1 }, '', location.href); 기록넣음 = true; } catch (e) {}
    }
    if (typeof dhTrack === 'function') dhTrack('apply_open', { once: false });
    /* 컴퓨터에서만 번호 칸에 커서를 놓는다(폰은 자판이 갑자기 올라와 놀란다) */
    if (window.innerWidth > 768) {
      setTimeout(function () { var p = document.getElementById('inputPhone'); if (p) p.focus(); }, 340);
    }
  }

  /* 되돌리기=true 로 부르면 히스토리는 건드리지 않는다 (뒤로가기가 부른 경우) */
  function 닫기(되돌리기건드리지않기) {
    var 창 = document.getElementById('applyOverlay');
    if (!창 || !창.classList.contains('open')) return true;
    /* ★ 구글 시트로 신청을 보내는 중에는 닫지 않는다.
         보내기는 최대 45초까지 걸릴 수 있고, 화면에도 '닫지 말아 주세요'가 뜬다. */
    var 단추 = document.getElementById('submitBtn');
    var 성공 = document.getElementById('formSuccess');
    var 보내는중 = !!(단추 && 단추.disabled && 성공 && getComputedStyle(성공).display === 'none');
    if (보내는중) return false;

    창.classList.remove('open');
    창.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('apply-open');

    if (되돌리기건드리지않기 !== true && 기록넣음) {
      기록넣음 = false;
      스스로되돌림 = true;
      try { history.back(); } catch (e) { 스스로되돌림 = false; }
      setTimeout(function () { 스스로되돌림 = false; }, 600);   // 신호가 안 오는 경우 대비
    }
    return true;
  }

  /* 신청창 '위에' 개인정보처리방침·약관 창이 겹쳐 떠 있는지 본다.
     겹쳐 있을 때 뒤로가기·ESC 는 위에 있는 그 창만 닫아야 한다.
     (둘 다 닫히면 손님이 방금 읽던 신청칸까지 사라진다) */
  function 약관창열려있나() {
    var 이름 = ['privacyOverlay', 'termsOverlay'];
    for (var i = 0; i < 이름.length; i++) {
      var e = document.getElementById(이름[i]);
      if (e && e.classList.contains('open')) return 이름[i];
    }
    return null;
  }

  window.addEventListener('popstate', function () {
    if (스스로되돌림) { 스스로되돌림 = false; return; }
    var 창 = document.getElementById('applyOverlay');
    if (!창 || !창.classList.contains('open')) return;
    if (약관창열려있나()) {
      /* 위에 겹친 약관 창만 닫고, 신청창은 그대로 둔다 */
      if (약관창열려있나() === 'privacyOverlay') { if (typeof closePrivacy === 'function') closePrivacy(); }
      else if (typeof closeTerms === 'function') closeTerms();
      try { history.pushState({ dh신청: 1 }, '', location.href); 기록넣음 = true; } catch (e) {}
      return;
    }
    기록넣음 = false;                    // 빈 칸은 이미 스스로 물러났다
    if (닫기(true) === false) {
      /* 신청을 보내는 중이라 닫으면 안 되는 상황 — 빈 칸을 도로 넣어 제자리에 붙잡는다 */
      try { history.pushState({ dh신청: 1 }, '', location.href); 기록넣음 = true; } catch (e) {}
    }
  });

  /* ⚠ 마지막 인자 true(먼저 듣기)가 중요하다.
     약관 파일(js/dh-terms.js)도 ESC 를 듣는데, 그 파일이 먼저 실려 있어 그냥 두면
     약관 창이 닫힌 '뒤에' 이 코드가 돌아, 한 번의 ESC 로 신청창까지 같이 닫혔다. */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (약관창열려있나()) return;        // 위에 겹친 약관 창이 먼저 닫힌다
    var 창 = document.getElementById('applyOverlay');
    if (창 && 창.classList.contains('open')) 닫기();
  }, true);

  /* ───────────────────────────────────────────────────────────
     4) 신청 보내기 (실패하면 다시 시도)
     한 번에 40초까지 기다리고, 전체 45초에서 끊는다.
     ⚠ 구글 쪽 중복막기(같은 번호 120초)와 한 쌍이다 — 한쪽만 되돌리면 중복이 생긴다.
     ─────────────────────────────────────────────────────────── */
  function dhSend(payload, 상태알림) {
    var 최대횟수 = 3, 한번한도 = 40000, 전체한도 = 45000;
    var 시작 = Date.now();
    var 말하기 = function (문구) {
      if (typeof 상태알림 === 'function') { try { 상태알림(문구); } catch (e) {} }
    };

    function 한번(회, 마지막오류) {
      var 남은 = 전체한도 - (Date.now() - 시작);
      if (회 > 최대횟수 || 남은 <= 0) {
        return Promise.reject(마지막오류 || new Error('신청 전송 실패'));
      }
      var controller = new AbortController();
      var timeout = setTimeout(function () { controller.abort(); }, Math.min(한번한도, 남은));
      /* 오래 걸릴 때 화면이 멈춘 것처럼 보이지 않도록 문구를 단계별로 바꿔 준다 */
      var 단계알림 = [
        setTimeout(function () { 말하기('확인 중입니다...'); }, 8000),
        setTimeout(function () { 말하기('거의 다 됐어요. 화면을 닫지 말아 주세요'); }, 20000)
      ];
      var 치우기 = function () {
        clearTimeout(timeout);
        단계알림.forEach(function (t) { clearTimeout(t); });
      };
      return fetch(SCRIPT_URL, {
        method: 'POST', mode: 'no-cors', signal: controller.signal,
        body: JSON.stringify(payload)
      }).then(function () { 치우기(); }, function (err) {
        치우기();
        if (회 >= 최대횟수) return Promise.reject(err);
        말하기('연결이 느려요. 다시 시도 중...');
        return new Promise(function (r) { setTimeout(r, 회 * 1200); })
          .then(function () { return 한번(회 + 1, err); });
      });
    }
    return 한번(1, null);
  }

  /* ───────────────────────────────────────────────────────────
     5) 페이지 곳곳에서 부르는 이름들
     ─────────────────────────────────────────────────────────── */
  window.신청창열기 = 열기;
  window.신청창닫기 = function () { return 닫기(); };
  window.신청창바깥닫기 = function (e) { if (e && e.target && e.target.id === 'applyOverlay') 닫기(); };

  /* 인터넷·렌탈 탭 켜고 끄기 — 메인(index.html)과 똑같이 움직인다.
     둘 다 꺼도 막지 않는다. 그 상태로 보내기를 누르면 "하나 이상 선택" 알림이 뜬다. */
  window.toggleService = function (종류) {
    if (종류 !== 'internet' && 종류 !== 'rental') return;
    고른서비스[종류] = !고른서비스[종류];
    var 탭 = document.getElementById('tab-' + 종류);
    if (탭) 탭.classList.toggle('active', 고른서비스[종류]);
  };

  window.요청사항펴기 = function () {
    var 접힘 = document.getElementById('memoFold');
    var 단추 = document.getElementById('memoToggle');
    var 칸 = document.getElementById('inputMemo');
    if (접힘) 접힘.classList.add('open');
    if (단추) 단추.style.display = 'none';
    if (칸) 칸.focus();
  };

  window.submitForm = function () {
    var name = document.getElementById('inputName').value.trim();
    var phone = document.getElementById('inputPhone').value.trim();
    var memo = document.getElementById('inputMemo').value.trim();
    if (!고른서비스.internet && !고른서비스.rental) { alert('서비스를 하나 이상 선택해주세요.'); return; }
    if (!phone || phone.replace(/\D/g, '').length !== 11) {
      alert('휴대폰 번호 11자리를 정확히 입력해주세요.\n(예: 010-1234-5678)'); return;
    }
    if (!document.getElementById('c1').checked) { alert('개인정보 수집 및 이용에 동의해주세요.'); return; }

    var btn = document.getElementById('submitBtn');
    btn.disabled = true; btn.textContent = '신청 중...';
    if (typeof dhTrack === 'function') dhTrack('lead_submit', { once: false });   /* 입력 검사 통과 시점에 전환 집계 */

    var 이름표 = [];
    if (고른서비스.internet) 이름표.push('인터넷');
    if (고른서비스.rental) 이름표.push('가전렌탈');
    var 보낼값 = {
      name: name,
      phone: phone,
      usim: document.getElementById('usimCheck').checked ? 'Y' : 'N',
      service: 이름표.join('+'),
      memo: memo
    };
    if (typeof dhInflow === 'function') {
      try { 보낼값 = Object.assign(보낼값, dhInflow()); } catch (e) {}
    }

    dhSend(보낼값, function (문구) { btn.textContent = 문구; }).then(function () {
      document.getElementById('formContent').style.display = 'none';
      document.getElementById('formSuccess').style.display = 'block';
      if (typeof dhNaver === 'function') dhNaver('lead');   /* 네이버 전환: 진짜 접수된 뒤에만 */
    }, function () {
      alert('오류가 발생했습니다. 잠시 후 다시 시도하거나\n1600-4670으로 직접 문의해주세요.');
      btn.disabled = false; btn.textContent = '놓친 지원금 무료 확인';
    });
  };

  window.resetForm = function () {
    document.getElementById('formContent').style.display = 'block';
    document.getElementById('formSuccess').style.display = 'none';
    document.getElementById('inputName').value = '';
    document.getElementById('inputPhone').value = '';
    document.getElementById('usimCheck').checked = false;
    document.getElementById('inputMemo').value = '';
    document.getElementById('memoCount').textContent = '0';
    document.getElementById('memoCount').parentNode.classList.remove('over');
    document.getElementById('memoFold').classList.remove('open');
    document.getElementById('memoToggle').style.display = '';
    document.getElementById('c1').checked = true;
    고른서비스 = { internet: true, rental: false };
    document.getElementById('tab-internet').classList.add('active');
    document.getElementById('tab-rental').classList.remove('active');
    var btn = document.getElementById('submitBtn');
    btn.disabled = false; btn.textContent = '놓친 지원금 무료 확인';
  };

  /* ───────────────────────────────────────────────────────────
     6) 옛 주소로 들어온 손님 받아주기
     광고·즐겨찾기에 남아 있는 '주소#apply-now' 로 이 페이지에 오면 창을 바로 띄운다.
     자리표는 곧바로 지운다 — 그래야 새로고침할 때마다 창이 튀어나오지 않는다.
     (요금표의 #kt·#sk 같은 자리표는 건드리지 않는다)
     ─────────────────────────────────────────────────────────── */
  (function () {
    if (location.hash !== '#apply-now') return;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    var 띄우기 = function () { setTimeout(열기, 250); };
    if (document.readyState === 'complete') 띄우기();
    else window.addEventListener('load', 띄우기);
  })();
})();
