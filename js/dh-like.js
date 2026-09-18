/* ══════════════════════════════════════════════════════════════════════
   [시험 중] 제품 상세 맨 아래 「비슷한 다른 제품」 칸 · 2026-09-18
   ※ 지금은 /lab/ 시험 화면 2장에서만 부릅니다. 손님 화면(199장)에는 아직 안 붙였습니다.
   ──────────────────────────────────────────────────────────────────────
   · 라이브 화면 그대로 위에 얹어서 봅니다 — 위쪽(사진·요금·제품 규격)은 손대지 않습니다.
   · 카드는 목록 화면 카드와 같은 재료로 만듭니다 — 사진 · 브랜드│모델 · 이름 · 월 요금.
   · 고른 기준(2026-09-18 개정): 같은 기능에서 **요금이 가까운** 다른 브랜드 넷 + 같은 브랜드 둘.
     옛 기준(브랜드별 인기 1위)은 199개 중 30개만 돌려 써서 168개가 한 번도 안 나왔습니다 → 지금은 196개가 나옵니다.
     코웨이 전용 화면에서는 같은 브랜드를 앞에 세웁니다.
   · 폰에서는 화살표 없이 화면 끝에서 잘리게, 컴퓨터에서는 마우스용 화살표를 답니다.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function 막(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function 돈(n) { return Number(n).toLocaleString('ko-KR'); }

  /* 제품 한 장 = /water/<주소>/ 이므로 여기서 사이트 꼭대기는 두 단계 위입니다 */
  function 밑동() { return '../../'; }

  /* 지금 화면의 제품 주소 (…/water/coway-chp-7211n/) */
  function 이제품() {
    var 조각 = location.pathname.replace(/\/+$/, '').split('/');
    return 조각[조각.length - 1];
  }

  /* 사진 이름은 제품 자료(data2-*.js)에서 찾습니다 */
  function 제품찾기(주소) {
    var 모음 = window.브랜드모음 || [];
    for (var i = 0; i < 모음.length; i++) {
      var 목록 = 모음[i].제품 || [];
      for (var j = 0; j < 목록.length; j++) {
        var p = 목록[j];
        var 주 = window.요금셈 && window.요금셈.제품주소 ? window.요금셈.제품주소(p) : null;
        if (주 === 주소) { p.__브랜드 = 모음[i].이름; return p; }
      }
    }
    return null;
  }

  var 모양 =
    '.it-like{margin-top:32px;padding-top:24px;border-top:1px solid var(--c-line)}' +
    '.it-like h2{margin:0 0 4px;font-size:var(--t-h2);line-height:var(--lh-h2);font-weight:800;' +
      'letter-spacing:var(--ls-sub);color:var(--c-title)}' +
    '.it-like-note{margin:0 0 14px;font-size:var(--t-min);color:var(--c-sub)}' +
    '.it-like-wrap{position:relative}' +
    '.it-like-list{display:flex;gap:10px;overflow-x:auto;list-style:none;margin:0;padding:2px 0 10px;' +
      'scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch;scrollbar-width:none}' +
    '.it-like-list::-webkit-scrollbar{display:none}' +
    '.it-like-list li{flex:0 0 156px;scroll-snap-align:start}' +
    '.it-like-list a{display:block;height:100%;padding:12px;border:1px solid var(--c-line);' +
      'border-radius:var(--r-card);text-decoration:none;background:var(--c-card)}' +
    '.it-like-list a:hover{border-color:var(--c-strong)}' +
    '.it-like-photo{display:flex;align-items:center;justify-content:center;height:112px;margin-bottom:10px}' +
    '.it-like-photo img{max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain}' +
    '.it-like-brand{display:block;font-size:var(--t-min);font-weight:700;color:var(--c-sub)}' +
    '.it-like-name{display:block;margin-top:4px;font-size:var(--t-sub);line-height:20px;font-weight:700;' +
      'color:var(--c-title);word-break:keep-all}' +
    '.it-like-price{display:block;margin-top:8px;font-size:var(--t-sub);font-weight:800;color:var(--c-title)}' +
    '.it-like-price em{font-style:normal;font-weight:600;font-size:var(--t-min);color:var(--c-sub)}' +
    /* 폰 — 화면 끝까지 뻗어 끝 카드가 반쯤 잘리게, 화살표 없음 (거름 칸과 같은 방식) */
    '@media(max-width:560px){' +
      '.it-like-wrap{margin-left:calc(-1 * var(--pad-screen));margin-right:calc(-1 * var(--pad-screen))}' +
      '.it-like-list{padding-left:var(--pad-screen);padding-right:0;scroll-padding-left:var(--pad-screen)}' +
      '.it-like-list::after{content:"";flex:0 0 6px}' +
      '.it-like-list li{flex:0 0 calc((100% - 10px) / 1.5)}' +
      '.it-like-nav{display:none!important}' +
    '}' +
    /* 컴퓨터 — 마우스로는 밀 수 없으므로 화살표를 답니다 */
    '.it-like-nav{position:absolute;top:96px;transform:translateY(-50%);z-index:3;width:32px;height:32px;' +
      'padding:0;border-radius:999px;display:none;align-items:center;justify-content:center;cursor:pointer;' +
      'background:var(--c-card);border:1px solid var(--c-line);color:var(--c-sub);box-shadow:0 2px 8px rgba(15,42,90,.14)}' +
    '.it-like-nav.l{left:0}.it-like-nav.r{right:0}' +
    '.it-like-wrap.can-l .it-like-nav.l,.it-like-wrap.can-r .it-like-nav.r{display:flex}';

  function 그리기() {
    var 목록 = (window.비슷한제품 || {})[이제품()];
    /* 코웨이 전용 화면에서는 같은 브랜드(코웨이)를 앞에 세웁니다 — 그 손님이 코웨이를 보러 오셨기 때문입니다 */
    if (목록 && location.pathname.indexOf('/water-c/') >= 0) {
      목록 = 목록.slice().sort(function (a, b) { return (b[6] || 0) - (a[6] || 0); });
    }
    var 몸통 = document.getElementById('제품몸통');
    if (!목록 || !목록.length || !몸통) return;

    var st = document.createElement('style');
    st.textContent = 모양;
    document.head.appendChild(st);

    var 화살 = function (방향, 길) {
      return '<button type="button" class="it-like-nav ' + 방향 + '" aria-label="' +
        (방향 === 'l' ? '앞 제품 보기' : '다음 제품 보기') + '">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + 길 + '"/></svg></button>';
    };

    var 칸 = document.createElement('div');
    칸.className = 'it-like';
    칸.innerHTML =
      '<h2>비슷한 다른 제품</h2>' +
      '<p class="it-like-note">같은 기능에서 요금대가 비슷한 제품을 모았습니다.</p>' +
      '<div class="it-like-wrap">' +
        화살('l', 'M15 18l-6-6 6-6') + 화살('r', 'M9 18l6-6-6-6') +
        '<ul class="it-like-list">' +
        목록.map(function (x) {
          var 주소 = x[0], 브랜드 = x[1], 이름 = x[2], 요금 = x[3];
          /* 사진·모델은 색인에 함께 들어 있습니다 — 상세 화면은 자기 브랜드 자료만 읽기 때문입니다 */
          var p = x[4] ? null : 제품찾기(주소);
          var 사진이름 = x[4] || (p && p.사진) || '';
          var 사진 = 사진이름 ? 밑동() + 'img/' + 막(사진이름) + '.jpg' : '';
          var 모델 = x[5] || (p && p.모델) || '';
          return '<li><a href="' + 밑동() + (location.pathname.indexOf('/water-c/') >= 0 ? 'water-c/' : 'water/') + 막(주소) + '/">' +
            (사진 ? '<span class="it-like-photo"><img src="' + 사진 + '" alt="' + 막(이름) + '" loading="lazy"></span>' : '') +
            '<span class="it-like-brand">' + 막(브랜드) + (모델 ? ' │ ' + 막(모델) : '') + '</span>' +
            '<span class="it-like-name">' + 막(이름) + '</span>' +
            '<span class="it-like-price">월 ' + 돈(요금) + '원~</span>' +
            '</a></li>';
        }).join('') +
        '</ul>' +
      '</div>';
    몸통.parentNode.insertBefore(칸, 몸통.nextSibling);

    /* 화살표·끝 흐림 표시 */
    var 감쌈 = 칸.querySelector('.it-like-wrap'), 줄 = 칸.querySelector('.it-like-list');
    function 맞추기() {
      var 끝 = 줄.scrollWidth - 줄.clientWidth;
      감쌈.classList.toggle('can-l', 끝 > 4 && 줄.scrollLeft > 4);
      감쌈.classList.toggle('can-r', 끝 > 4 && 줄.scrollLeft < 끝 - 4);
    }
    function 밀기(방향) {
      var 목표 = 줄.scrollLeft + 방향 * Math.max(160, 줄.clientWidth * 0.7);
      try { 줄.scrollTo({ left: 목표, behavior: 'smooth' }); } catch (e) { 줄.scrollLeft = 목표; }
    }
    칸.querySelector('.it-like-nav.l').addEventListener('click', function () { 밀기(-1); });
    칸.querySelector('.it-like-nav.r').addEventListener('click', function () { 밀기(1); });
    줄.addEventListener('scroll', 맞추기, { passive: true });
    window.addEventListener('resize', 맞추기);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(맞추기);
    맞추기();
  }

  /* 제품 몸통은 js/dh-item3.js 가 나중에 그립니다 — 다 그려진 뒤에 답니다 */
  function 기다렸다가(남은) {
    var 몸통 = document.getElementById('제품몸통');
    if (몸통 && 몸통.children.length && window.비슷한제품) return 그리기();
    if (남은 <= 0) return;
    setTimeout(function () { 기다렸다가(남은 - 1); }, 200);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { 기다렸다가(25); });
  } else 기다렸다가(25);
})();
