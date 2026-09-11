/* ══════════════════════════════════════════════════════════════════════
   아래 따라다니는 띠 (세 번째 판) · dh-bar3.js

   목록 화면과 상세 화면이 함께 씁니다.

   왜 만들었나
     지금까지는 아래 고정 막대와 오른쪽 아래 떠다니는 동그라미 두 개가 따로 놀아
     폰에서 오른쪽 아래가 늘 가려졌습니다. 전화·카톡을 이 띠 안으로 넣고
     동그라미는 없앱니다.

   두 가지 모습
     상세 화면 : 요금 세 줄 + 단추 줄 (2026-09-09 사장님 지시로 접지 않고 늘 펼쳐 둡니다)
     목록 화면 : 단추 줄만

   쓰는 법
     띠만들기({갈래:'상세'|'목록', 누르면:function(){...}})
     값바꾸기({정상:42900, 프로모션:21450, 카드:0, 딱지:'15개월 반값'})
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var 갈래 = '목록';

  function 돈(n) { return Number(n).toLocaleString('ko-KR'); }
  function 막(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ★ 아이콘은 **라이브 아래 막대(DangHH/index.html .mobile-cta-bar)** 것을 그대로 씁니다.
     같은 자리 같은 단추인데 견본만 다른 그림을 쓰고 있었습니다 (2026-09-11 사장님이 잡아내심).
     라이브 것을 고칠 일이 생기면 여기도 함께 맞춰야 합니다. */
  var 전화아이콘 =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 16.42V19.9561C21 20.4811 20.5941 20.9167 20.0705 20.9537C19.6331 20.9846 19.2763 21 19 21C10.1634 21 3 13.8366 3 5C3 4.72371 3.01545 4.36687 3.04635 3.9295C3.08337 3.40588 3.51894 3 4.04386 3H7.5801C7.83678 3 8.05176 3.19442 8.07753 3.4498C8.10067 3.67907 8.12218 3.86314 8.14207 4.00202C8.34435 5.41472 8.75753 6.75936 9.3487 8.00303C9.44359 8.20265 9.38171 8.44159 9.20185 8.57006L7.04355 10.1118C8.35752 13.1811 10.8189 15.6425 13.8882 16.9565L15.4271 14.8019C15.5572 14.6199 15.799 14.5573 16.001 14.6532C17.2446 15.2439 18.5891 15.6566 20.0016 15.8584C20.1396 15.8782 20.3225 15.8995 20.5502 15.9225C20.8056 15.9483 21 16.1633 21 16.42Z"/></svg>';
  var 카톡아이콘 =
    '<svg width="23" height="23" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.667 1.556 5.011 3.9 6.4L5 21l4.1-2.7c.94.2 1.91.3 2.9.3 5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/></svg>';

  /* ── 띠 만들기 ─────────────────────────────────────── */
  function 띠만들기(설정) {
    설정 = 설정 || {};
    갈래 = 설정.갈래 || '목록';
    var 옛 = document.getElementById('아래띠');
    if (옛) 옛.parentNode.removeChild(옛);

    var 요금칸 = 갈래 !== '상세' ? '' :
      '<div class="bar-money" id="띠요금">' +
        '<div class="bar-row bar-was"><span class="bar-key">정상가</span>' +
          '<span class="bar-val plain"><b id="띠정상">—</b>원</span></div>' +
        '<div class="bar-row bar-now"><span class="bar-key">프로모션가' +
          '<em class="bar-badge" id="띠딱지" hidden></em></span>' +
          '<span class="bar-val"><b id="띠프모">—</b>원</span></div>' +
        /* 2026-09-11 제휴카드 가림 — 스위치는 js/dh-card-benefit.js 맨 위에 있습니다.
           가릴 때는 값이 아니라 말이 들어오므로 요금 눈금(.pay)을 한 단 낮춥니다. */
        (window.카드가림
          ? '<div class="bar-row bar-pay" id="띠카드줄"><span class="bar-key">제휴카드</span>' +
              '<span class="bar-val pay 말">사용시 할인</span></div>'
          : '<div class="bar-row bar-pay" id="띠카드줄"><span class="bar-key">제휴카드가' +
              '<i class="bar-sub">(최소 실적 기준)</i></span>' +
              '<span class="bar-val pay"><b id="띠카드">—</b>원</span></div>') +
      '</div>';

    var 띠 = document.createElement('div');
    띠.className = 'bar3' + (갈래 === '상세' ? ' 상세' : '');
    띠.id = '아래띠';
    띠.innerHTML =
      요금칸 +
      '<div class="bar-acts">' +
        '<a class="bar-ico phone" href="tel:1600-4670" aria-label="전화 상담 1600-4670">' + 전화아이콘 + '</a>' +
        '<a class="bar-ico kakao" href="https://pf.kakao.com/_yxgTAs" target="_blank" rel="noopener" ' +
          'aria-label="카카오톡 상담">' + 카톡아이콘 + '</a>' +
        '<button type="button" class="bar-cta" id="띠단추">내 혜택 얼마인지 확인</button>' +
      '</div>';
    document.body.appendChild(띠);

    var 단추 = document.getElementById('띠단추');
    if (단추 && typeof 설정.누르면 === 'function') 단추.addEventListener('click', 설정.누르면);

    높이재기();
    window.addEventListener('resize', 높이재기);
    return 띠;
  }

  /* 띠에 가려 마지막 내용이 안 보이지 않도록 본문 아래 여백을 띠 높이만큼 줍니다 */
  function 높이재기() {
    var 띠 = document.getElementById('아래띠');
    if (!띠) return;
    document.documentElement.style.setProperty('--bar-h', 띠.offsetHeight + 'px');
  }

  /* ── 값 채우기 ─────────────────────────────────────── */
  function 값바꾸기(값) {
    if (갈래 !== '상세') return;
    값 = 값 || {};
    function 쓰기(id, 글) { var e = document.getElementById(id); if (e) e.textContent = 글; }

    var 같음 = (값.정상 != null && 값.정상 === 값.프로모션);
    var 정상줄 = document.getElementById('띠정상');
    if (정상줄) 정상줄.closest('.bar-row').hidden = 같음;

    쓰기('띠정상', 값.정상 != null ? 돈(값.정상) : '—');
    쓰기('띠프모', 값.프로모션 != null ? 돈(값.프로모션) : '—');

    /* 딱지 색은 뜻에 따라 갈립니다 — 디자인보드 5절(반값·요금할인·특가) */
    var 딱 = document.getElementById('띠딱지');
    if (딱) {
      딱.textContent = 값.딱지 || '';
      딱.hidden = !값.딱지;
      딱.className = 'bar-badge' +
        (값.딱지 && window.요금셈 ? ' ' + window.요금셈.딱지갈래(값.딱지) : '');
    }

    /* 가려 둘 때는 모든 제품에 같은 한 줄을 보입니다 (값은 적지 않습니다).
       가림을 풀면 예전처럼 카드 자료가 있는 브랜드에만 값과 함께 보입니다. */
    var 카줄 = document.getElementById('띠카드줄');
    if (window.카드가림) {
      if (카줄) 카줄.hidden = false;
    } else {
      if (카줄) 카줄.hidden = (값.카드 == null);
      if (값.카드 != null) 쓰기('띠카드', 돈(값.카드));
    }

    높이재기();
  }

  window.아래띠 = { 만들기: 띠만들기, 값바꾸기: 값바꾸기, 높이재기: 높이재기 };
})();
