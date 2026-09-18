/* ══════════════════════════════════════════════════════════════════════
   머리띠 로고 옆 검색칸 · dh-find.js  (2026-09-18 라이브, 인잘알 방식)
   ──────────────────────────────────────────────────────────────────────
   햄버거를 없애며 머리띠 오른쪽이 비었습니다. 그 자리를 검색칸이 꽉 채웁니다.
   · 폰(폭 768 이하)에서만 나옵니다. 컴퓨터는 지금처럼 메뉴가 그 자리를 씁니다.
   · 회색 둥근 칸 + 왼쪽 돋보기 + 글씨가 있으면 오른쪽에 지우기(✕) — 인잘알과 같은 모양입니다.
   · 정수기 목록에서는 치는 대로 걸러집니다(199개 전부에서 찾습니다 — 「더 보기」를 먼저 다 펼칩니다).
   · 다른 화면에서 엔터를 치면 정수기 목록으로 넘어가 그 검색어로 걸러집니다.
     (인터넷 요금제까지 찾게 하려면 규칙을 더 정해야 합니다 — 지금은 정수기만)
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var 모양 =
    '#찾기칸{display:none}' +
    '@media(max-width:768px){' +
      '#찾기칸{display:block;position:relative;flex:1 1 auto;min-width:0;margin-left:10px}' +
      '#찾기칸 input{width:100%;height:36px;border:0;border-radius:999px;background:#F1F3F5;' +
        'padding:0 32px 0 34px;font:600 14px/1 "Pretendard Variable",Pretendard,system-ui,sans-serif;' +
        'color:#191F28;outline:none;box-sizing:border-box}' +
      '#찾기칸 input::placeholder{color:#8A9099;font-weight:500}' +
      '#찾기칸 input:focus{background:#fff;box-shadow:0 0 0 1.5px #1257C9 inset}' +
      '#찾기칸 .돋보기{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:#8A9099;' +
        'pointer-events:none;display:flex}' +
      '#찾기칸 .지우기{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:20px;height:20px;' +
        'border:0;border-radius:999px;background:#C6CBD2;color:#fff;font:700 11px/1 inherit;cursor:pointer;' +
        'display:none;align-items:center;justify-content:center;padding:0}' +
      '#찾기칸.글씨있음 .지우기{display:flex}' +
      /* 로고는 줄지 않고, 검색칸이 남은 폭을 다 가져갑니다 */
      'header .header-inner .logo{flex:none}' +
    '}';

  function 물칸() { return location.pathname.indexOf('/water-c/') >= 0 ? 'water-c/' : 'water/'; }

  /* ── 찾는 말이 어느 화면으로 가야 하는가 (2026-09-18 사장님 지시) ──────────
     ★ 제품군 화면이 새로 생기면 **이 표에 한 줄만 더하면** 됩니다.
       예) 공기청정기 목록이 /aircleaner/ 로 생기면 맨 위에 이렇게 넣습니다
           { 곳: 'aircleaner/', 낱말: ['공기청정기', '청정기', '공청기'] }
       위에서부터 찾으므로 **좁은 것을 위에** 둡니다. 지금은 가전이 한 덩어리라 한 줄뿐입니다.
     ★ 표에 없는 말은 지금까지처럼 정수기 목록으로 갑니다. */
  var 갈곳표 = [
    { 곳: 'appliance/', 낱말: [
      '공기청정기', '청정기', '공청기', '비데', '매트리스', '침대', '안마의자', '마사지',
      '에어컨', '냉난방', 'tv', '티비', '텔레비전', '냉장고', '세탁기', '건조기', '청소기',
      '전기레인지', '인덕션', '하이라이트', '식기세척기', '의류관리기', '스타일러', '제습기',
      '음식물', '커피', '제빙기', '보일러', '신발', '오븐', '연수기', '가전'
    ] }
  ];
  function 갈곳(말) {
    var s = String(말 == null ? '' : 말).replace(/\s+/g, '').toLowerCase();
    if (!s) return 물칸();
    for (var i = 0; i < 갈곳표.length; i++) {
      for (var j = 0; j < 갈곳표[i].낱말.length; j++) {
        if (s.indexOf(갈곳표[i].낱말[j]) >= 0) return 갈곳표[i].곳;
      }
    }
    return 물칸();
  }
  function 밑동() {
    var 조각 = (location.pathname || '/').replace(/^\/+/, '').split('/');
    var 끝 = 조각[조각.length - 1];
    if (끝 === '' || 끝.indexOf('.') >= 0) 조각.pop();
    return 조각.map(function () { return '../'; }).join('');
  }

  function 목록거르기(말) {
    var 칸 = document.getElementById('제품칸');
    if (!칸) return;
    var 찾 = 말.replace(/\s+/g, '').toLowerCase();
    var 줄들 = 칸.querySelectorAll('.li-item');
    for (var i = 0; i < 줄들.length; i++) {
      var t = (줄들[i].textContent || '').replace(/\s+/g, '').toLowerCase();
      줄들[i].style.display = (!찾 || t.indexOf(찾) >= 0) ? '' : 'none';
    }
  }

  /* 목록은 처음에 24개만 뿌려집니다 — 찾을 때는 「더 보기」가 사라질 때까지 눌러 다 펼친 뒤 거릅니다 */
  function 펼치고찾기(말, 남은) {
    var 더 = document.getElementById('더보기');
    if (더 && !더.hidden && 남은 > 0) {
      더.click();
      setTimeout(function () { 펼치고찾기(말, 남은 - 1); }, 40);
      return;
    }
    목록거르기(말);
  }

  /* 찾을 때 「더 보기」를 다 눌러 199개를 펼칩니다. 지우면 처음처럼 24개만 보이게 되돌립니다. */
  function 처음차림() {
    var 칸 = document.getElementById('제품칸');
    var 더 = document.getElementById('더보기');
    if (!칸) return;
    var 줄들 = 칸.querySelectorAll('.li-item');
    if (줄들.length <= 24) return;
    for (var i = 24; i < 줄들.length; i++) 줄들[i].style.display = 'none';
    if (더) {
      더.hidden = false;
      더.textContent = '더 보기 (' + (줄들.length - 24) + '개 남음)';
      더.onclick = function () {
        for (var j = 0; j < 줄들.length; j++) 줄들[j].style.display = '';
        더.hidden = true;
      };
    }
  }

  function 달기() {
    var 속 = document.querySelector('header .header-inner');
    if (!속 || document.getElementById('찾기칸')) return;
    var st = document.createElement('style'); st.textContent = 모양; document.head.appendChild(st);

    var 칸 = document.createElement('div');
    칸.id = '찾기칸';
    칸.innerHTML =
      '<span class="돋보기"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/>' +
        '<path d="M20 20l-3.6-3.6"/></svg></span>' +
      '<input type="text" placeholder="제품·모델명 검색" aria-label="제품 찾기">' +
      '<button type="button" class="지우기" aria-label="지우기">✕</button>';

    /* 로고 바로 다음 자리 — 로고는 왼쪽, 검색칸이 남은 폭 전부 */
    var 로고 = 속.querySelector('.logo');
    if (로고 && 로고.nextSibling) 속.insertBefore(칸, 로고.nextSibling);
    else 속.appendChild(칸);

    var 입력 = 칸.querySelector('input'), 지움 = 칸.querySelector('.지우기');
    function 상태() { 칸.classList.toggle('글씨있음', !!입력.value); }
    입력.addEventListener('input', function () { 상태(); 펼치고찾기(입력.value, 12); });
    입력.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      if (document.getElementById('제품칸')) { 펼치고찾기(입력.value, 12); return; }
      location.href = 밑동() + 물칸() + '?q=' + encodeURIComponent(입력.value);
    });
    지움.addEventListener('click', function () {
      입력.value = ''; 상태(); 목록거르기('');
      처음차림();   /* 찾느라 다 펼쳐 둔 목록을 처음 차림(24개 + 「더 보기」)으로 되돌립니다 */
      입력.focus();
    });

    var m = /[?&]q=([^&]*)/.exec(location.search);
    if (m && document.getElementById('제품칸')) {
      입력.value = decodeURIComponent(m[1]); 상태();
      setTimeout(function () { 펼치고찾기(입력.value, 12); }, 800);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(달기, 50); });
  else setTimeout(달기, 50);
})();
