/* 글 화면용 따라다니는 상담 단추 — 가이드(/guide/)·설치 후기(/reviews/) 공용 부품 (2026-11-03 사장님 지시)
   ⛔ 글을 읽는 화면이라 본문을 가리는 아래 띠(desk-cta-bar)는 쓰지 않는다.
   · 넓은 PC: 오른쪽에 「무료 상담 신청 · 전화 · 카톡」 상자 하나 (아정당 방식).
       화면마다 본문(main) 오른쪽 끝을 재서, 상자가 본문을 덮지 않을 만큼 자리가 있을 때만 띄운다
       (가이드 글 폭 760 은 약 1260 부터, 후기 목록 폭 960 은 약 1420 부터).
       사이트 공용 상담 패널(.consult-panel, 1600~)이 같은 화면에 있으면 숨긴다(중복).
   · 그보다 좁은 PC(769~): 오른쪽 아래 「+」 단추 하나 — 누르면 세 단추가 펼쳐진다.
   · 폰(768 이하): 아무것도 안 띄운다. 화면 아래 고정 신청 막대(.mobile-cta-bar)가 맡는다.
   · PC 의 동그란 전화·카톡 단추(.floating-btns)는 위 둘과 겹치므로 숨긴다.
   · 화면 맨 아래 상담 상자([data-follow-stop], .gd-cta, .rv-cta)나 발바닥이 보이면 잠시 숨긴다.
   · 신청 단추는 신청창열기()(dh-apply.js) — 없으면 첫 화면 신청 자리로.
   쓰는 법: <script src="/js/dh-follow.js?v=2" defer></script> 한 줄. 렌탈 화면은 body·main 등에 data-follow-kind="rental". */
(function () {
  if (window.__dhFollow) return;
  window.__dhFollow = true;

  var css = [
    '.dhf-box,.dhf-fab{display:none;font-family:"Pretendard Variable",Pretendard,"Noto Sans KR",sans-serif;}',
    '@media (min-width:769px){.floating-btns{display:none!important;}}',
    'html.dhf-wide .consult-panel{display:none!important;}',
    '@media (min-width:769px){',
    ' html.dhf-wide .dhf-box{display:flex;flex-direction:column;gap:8px;position:fixed;right:14px;top:50%;transform:translateY(-50%);z-index:900;width:216px;padding:16px 12px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 8px 32px rgba(11,46,92,.16);transition:opacity .2s;}',
    '}',
    '@media (min-width:769px){',
    ' html:not(.dhf-wide) .dhf-fab{display:flex;flex-direction:column;align-items:flex-end;gap:10px;position:fixed;right:20px;bottom:24px;z-index:900;transition:opacity .2s;}',
    '}',
    '.dhf-off{opacity:0!important;pointer-events:none!important;}',
    'body.apply-open .dhf-box,body.apply-open .dhf-fab{display:none!important;}',
    '.dhf-b{display:flex;align-items:center;justify-content:center;width:100%;min-height:44px;padding:0 10px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;color:#0f172a;font:inherit;font-size:15px;font-weight:700;letter-spacing:-.3px;text-decoration:none;cursor:pointer;box-sizing:border-box;}',
    '.dhf-b:hover{border-color:var(--c-strong,#1257C9);color:var(--c-strong,#1257C9);}',
    '.dhf-apply{background:var(--c-strong,#1257C9);border-color:var(--c-strong,#1257C9);color:#fff;}',
    '.dhf-apply:hover{background:var(--c-strong-press,#0e45a0);color:#fff;}',
    '.dhf-kakao{background:#FEE500;border-color:#FEE500;color:#191919;}',
    '.dhf-kakao:hover{color:#191919;border-color:#e6cf00;}',
    '.dhf-h{margin:4px 0 0;padding-top:10px;border-top:1px solid #eef2f7;font-size:12px;line-height:1.6;color:#7b8b99;text-align:center;}',
    '.dhf-fab .dhf-menu{display:none;flex-direction:column;align-items:flex-end;gap:8px;}',
    '.dhf-fab.open .dhf-menu{display:flex;}',
    '.dhf-fab .dhf-b{width:auto;min-height:44px;padding:0 18px;border-radius:22px;box-shadow:0 4px 12px rgba(0,0,0,.10);}',
    '.dhf-plus{width:56px;height:56px;border:0;border-radius:50%;background:var(--c-strong,#1257C9);color:#fff;font-size:30px;line-height:1;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.18);transition:transform .2s;}',
    '.dhf-plus:hover{background:var(--c-strong-press,#0e45a0);}',
    '.dhf-fab.open .dhf-plus{transform:rotate(45deg);}'
  ].join('\n');

  // 화면에 data-follow-kind="rental" 이 있으면(정수기·가전 후기, 렌탈 글) 신청창을 「렌탈」만 골라 둔 채로 연다
  function 신청() {
    if (typeof window.신청창열기 !== 'function') { location.href = '/#apply'; return; }
    window.신청창열기();
    if (!document.querySelector('[data-follow-kind="rental"]') || typeof window.toggleService !== 'function') return;
    var 렌 = document.getElementById('tab-rental'), 인 = document.getElementById('tab-internet');
    if (렌 && !렌.classList.contains('active')) window.toggleService('rental');
    if (인 && 인.classList.contains('active')) window.toggleService('internet');
  }

  function 단추들() {
    return '<button type="button" class="dhf-b dhf-apply">무료 상담 신청</button>' +
      '<a class="dhf-b" href="tel:1600-4670">전화 1600-4670</a>' +
      '<a class="dhf-b dhf-kakao" href="https://pf.kakao.com/_yxgTAs">카카오톡 상담</a>';
  }

  function 시작() {
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    var box = document.createElement('div');
    box.className = 'dhf-box';
    box.setAttribute('role', 'complementary');
    box.setAttribute('aria-label', '상담');
    box.innerHTML = 단추들() + '<p class="dhf-h">평일 9시~18시 · 토 10시~14시</p>';

    var fab = document.createElement('div');
    fab.className = 'dhf-fab';
    fab.innerHTML = '<div class="dhf-menu">' + 단추들() + '</div>' +
      '<button type="button" class="dhf-plus" aria-expanded="false" aria-label="상담 단추 펼치기">+</button>';

    document.body.appendChild(box);
    document.body.appendChild(fab);

    [box, fab].forEach(function (el) {
      el.querySelector('.dhf-apply').addEventListener('click', 신청);
    });
    var plus = fab.querySelector('.dhf-plus');
    plus.addEventListener('click', function () {
      var o = fab.classList.toggle('open');
      plus.setAttribute('aria-expanded', o);
    });

    var 멈춤 = document.querySelectorAll('[data-follow-stop], .gd-cta, .rv-cta, footer');
    // 본문 오른쪽 끝 + 16 이 상자 왼쪽(화면 폭 - 14 - 216)보다 안쪽이면 넓은 모드
    var 본문 = document.querySelector('main') || document.body;
    function 폭재기() {
      var 끝 = 0, k = 본문.children;
      for (var i = 0; i < k.length; i++) {
        var r = k[i].getBoundingClientRect();
        if (r.width && r.right > 끝) 끝 = r.right;
      }
      var 넓음 = 끝 > 0 && 끝 + 16 <= document.documentElement.clientWidth - 14 - 216;
      document.documentElement.classList.toggle('dhf-wide', 넓음);
      if (넓음) { fab.classList.remove('open'); plus.setAttribute('aria-expanded', false); }
    }

    function 살피기() {
      var h = window.innerHeight, off = false;
      for (var i = 0; i < 멈춤.length; i++) {
        var r = 멈춤[i].getBoundingClientRect();
        if (r.top < h && r.bottom > 0) { off = true; break; }
      }
      box.classList.toggle('dhf-off', off);
      fab.classList.toggle('dhf-off', off);
      if (off) { fab.classList.remove('open'); plus.setAttribute('aria-expanded', false); }
    }
    window.addEventListener('scroll', 살피기, { passive: true });
    window.addEventListener('resize', function () { 폭재기(); 살피기(); });
    window.addEventListener('load', 폭재기);
    // 창 크기 신호가 안 오는 경우(확대·축소, 일부 브라우저)도 메운다
    if (window.ResizeObserver) new ResizeObserver(function () { 폭재기(); 살피기(); }).observe(document.documentElement);
    폭재기();
    살피기();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', 시작);
  else 시작();
})();
