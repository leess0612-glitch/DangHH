/* ══════════════════════════════════════════════════════════════════════
   폰 화면 — 햄버거 대신 머리띠 아래 메뉴 줄 (2026-09-18 라이브, 사장님 지시)
   ──────────────────────────────────────────────────────────────────────
   · 폭 768 이하에서만 켭니다. 컴퓨터 화면은 원래 머리띠 메뉴가 그대로 보입니다.
   · 줄의 항목은 **그 화면의 햄버거 메뉴를 그대로 옮겨** 만듭니다.
     그래서 화면마다 주소가 달라도(첫 화면·렌탈·코웨이 렌탈·요금표·정수기) 원래 가던 곳으로 갑니다.
     코웨이 문 기억(js/dh-inflow.js)이 메뉴 주소를 바꾸면 이 줄도 같이 바뀝니다(모든 링크를 고치므로).
   · 「무료상담」은 넣지 않습니다 — 아래 띠에 늘 있습니다.
   · 차례는 상품(인터넷·정수기)을 앞으로 뺍니다.
   · 줄은 화면 끝까지 뻗어 끝 항목이 잘려 보이게 합니다(거름 알약 줄과 같은 방식, 흐림·화살표 없음).
   · 머리띠 바로 아래에 늘 떠 있습니다. 붙는 줄(요금표 탭·정수기 기능 줄)은 이 줄 아래(머리띠+44)로 내려 붙습니다.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var 차례 = ['인터넷가입', '정수기렌탈', '혜택안내', '설치후기', '사은품지급명단', '자주묻는질문'];

  function 글(a) { return (a.textContent || '').replace(/\s+/g, '').trim(); }

  function 만들기() {
    if (document.getElementById('상단메뉴줄')) return;
    var 메뉴 = document.querySelector('#mobileMenu');
    var 머리 = document.querySelector('header');
    if (!메뉴 || !머리) return;
    var 링크들 = [].slice.call(메뉴.querySelectorAll('a')).filter(function (a) {
      var g = 글(a);
      return g && g.indexOf('무료상담') < 0;
    });
    링크들.sort(function (a, b) {
      var ia = 차례.indexOf(글(a)), ib = 차례.indexOf(글(b));
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    /* nav 요소로 만들면 각 화면 css 의 「폰에서는 nav 를 감춤」 규칙에 걸립니다 — div + 역할 표시로 만듭니다 */
    var 줄 = document.createElement('div');
    줄.id = '상단메뉴줄';
    줄.setAttribute('role', 'navigation');
    줄.setAttribute('aria-label', '주요 메뉴');
    var 안 = document.createElement('div');
    안.className = 'tn-row';
    var 지금 = location.pathname.replace(/index\.html$/, '');
    링크들.forEach(function (a) {
      var b = document.createElement('a');
      b.href = a.getAttribute('href');
      b.textContent = a.textContent.replace(/\s*→\s*$/, '').trim();
      /* 같은 화면 안의 칸으로 가는 링크(#…)는 원래 메뉴의 누름 동작(메뉴 닫기 등)이 필요 없습니다 */
      var 갈곳 = b.pathname.replace(/index\.html$/, '');
      if (!b.hash && 갈곳 === 지금) b.setAttribute('aria-current', 'page');
      안.appendChild(b);
    });
    줄.appendChild(안);
    document.body.appendChild(줄);
    document.documentElement.classList.add('tn-on');
    /* 2026-09-18 — 줄을 스크롤에 따라 감추지 않습니다.
       감추면 머리띠 아래 44px 이 비어, 그 사이로 본문이 지나가는 것이 보였습니다(사장님 지적).
       늘 떠 있게 두고, 아래에 붙는 줄들(요금표 탭·정수기 기능 줄)은 이 줄 아래로 내려 붙입니다. */
  }

  var 모양 = document.createElement('style');
  모양.textContent =
    '@media(max-width:768px){' +
    'html.tn-on body{padding-top:44px}' +
    'html.tn-on .hamburger{display:none!important}' +
    '#상단메뉴줄{position:fixed;left:0;right:0;top:var(--h-header, 56px);z-index:900;height:44px;background:#fff;' +
      'border-bottom:1px solid #E5E8EB;will-change:transform}' +
    '#상단메뉴줄 .tn-row{display:flex;gap:4px;height:100%;overflow-x:auto;scrollbar-width:none;' +
      '-webkit-overflow-scrolling:touch;padding-left:8px}' +
    '#상단메뉴줄 .tn-row::-webkit-scrollbar{display:none}' +
    '#상단메뉴줄 .tn-row::after{content:"";flex:0 0 8px}' +
    '#상단메뉴줄 a{flex:none;display:flex;align-items:center;padding:0 12px;height:100%;' +
      'font-size:15px;font-weight:600;color:#4E5968;text-decoration:none;white-space:nowrap;' +
      'border-bottom:2px solid transparent;box-sizing:border-box}' +
    '#상단메뉴줄 a[aria-current="page"]{color:#1257C9;border-bottom-color:#1257C9}' +
    '#상단메뉴줄 a[hidden]{display:none}' +
    /* 아래에 붙는 줄들이 이 줄에 가리지 않도록 그만큼 내려 붙입니다 */
    'html.tn-on .tabbar{top:calc(var(--h-header, 56px) + 44px)}' +
    'html.tn-on .filter-stick{top:calc(var(--h-header, 56px) + 44px)}' +
    'html.tn-on{scroll-padding-top:calc(var(--stick-h, 133px) + 44px)}' +
    '}' +
    '@media(min-width:769px){#상단메뉴줄{display:none}}';
  document.head.appendChild(모양);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', 만들기);
  else 만들기();
  /* 코웨이 문 기억이 load 때 한 번 더 고치므로, 감춤 표시만 다시 맞춥니다 */
  /* 코웨이 문 기억은 컴퓨터 메뉴(nav)의 항목에만 감춤 표시를 남기는 화면이 있습니다.
     어느 메뉴에서든 감춰진 글자는 이 줄에서도 감춥니다. */
  function 감춤맞추기() {
    var 줄 = document.getElementById('상단메뉴줄');
    if (!줄) return;
    var 감춘 = [].slice.call(document.querySelectorAll('nav a, #mobileMenu a')).filter(function (a) {
      return a.style.display === 'none' || a.getAttribute('data-coway-door') === 'hide';
    }).map(글);
    [].forEach.call(줄.querySelectorAll('a'), function (b) { b.hidden = 감춘.indexOf(글(b)) >= 0; });
  }
  window.addEventListener('load', 감춤맞추기);
  document.addEventListener('DOMContentLoaded', function () { setTimeout(감춤맞추기, 0); });
})();
