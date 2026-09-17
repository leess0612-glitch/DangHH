/* ══════════════════════════════════════════════════════════════════════
   정수기 목록 한 장 (세 번째 판) · dh-list3.js

   두 번째 판과 다른 점
     1. 브랜드 여덟 곳을 한 목록에 모읍니다 (브랜드는 거르개로 고릅니다)
     2. 목록에는 계산기가 없습니다 — 카드를 누르면 상세 화면으로 갑니다
     3. 거르개를 눌러 펼치는 알약으로 바꿨습니다 (조건이 많아도 한 줄)
     4. 정렬 — 인기순 · 낮은 요금순 · 높은 요금순
   ⛔ 「○종」 같은 개수는 어디에도 넣지 않습니다 (사장님 지시)
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* 제품이 201종이라 12개씩 끊으면 「더 보기」를 열여섯 번 눌러야 했습니다.
     24개씩으로 늘리고, 더 보기는 남은 개수를 함께 적어 줍니다. */
  var 처음보임 = 24, 더보기묶음 = 24;
  var 보임 = 처음보임;
  var 고른갈래 = '전체';
  var 고른거름 = { 브랜드: '전체', 형태: '전체', 정수: '전체', 관리: '전체' };
  var 고른정렬 = '인기순';
  var 모두 = [];

  function 막(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function 돈(n) { return Number(n).toLocaleString('ko-KR'); }
  function 넣기(id, 글) { var e = document.getElementById(id); if (e) e.textContent = 글; }

  var 기능색 = { '냉수': 'fn-cold', '온수': 'fn-hot', '정수': 'fn-pure',
                '얼음': 'fn-ice', '직수형': 'fn-direct', '나노필터': 'fn-pure' };

  /* 브랜드를 늘어놓는 차례 — 두 번째 판 위쪽 단추와 같은 순서입니다 */
  var 브랜드차례목록 = ['coway', 'sk', 'cuckoo', 'lg', 'chungho', 'wells', 'ruhens', 'qming'];
  function 브랜드차례(코드) {
    var i = 브랜드차례목록.indexOf(코드);
    return i < 0 ? 99 : i;
  }

  /* ── 자료 모으기 ────────────────────────────────────── */
  function 모으기() {
    var 목 = [];
    /* 2026-09-11 — 「전체 · 인기순」 맨 앞줄은 js/dh-popular.js 의 인기앞줄이 정합니다.
       거기 없는 제품은 아래 인기(브랜드별 차례)로 갈립니다. */
    var 앞줄 = window.인기앞줄 || [];
    (window.브랜드모음 || []).forEach(function (자료) {
      var 순 = (window.인기순서 || {})[자료.코드] || [];
      (자료.제품 || []).forEach(function (p, i) {
        p.코드 = 자료.코드;
        p.브랜드 = 자료.이름;
        var 자리 = 순.indexOf(p.모델);
        /* 인기 목록에 적힌 것은 앞에, 나머지는 자료에 적힌 차례대로 그 뒤에 */
        p.인기 = (자리 >= 0) ? 자리 : (순.length + i);
        p.앞자리 = 9999;
        for (var k = 0; k < 앞줄.length; k++) {
          if (앞줄[k][0] === 자료.코드 && 앞줄[k][1] === p.모델) { p.앞자리 = k; break; }
        }
        목.push(p);
      });
    });
    return 목;
  }

  /* ── 제품 하나의 「가장 싼 값」 ───────────────────────
     목록에는 계산기가 없으므로 대표 값 하나를 골라 보여 줍니다.
     ★ 셈하는 규칙은 공용 부품(js/dh-calc3.js) 한 곳에만 둡니다.
       목록과 상세가 다른 값을 내놓는 일을 막으려는 것입니다. */
  function 대표값(p) { return window.요금셈.가장싼값(p); }

  /* ── 거르기 ────────────────────────────────────────── */
  function 거른목록() {
    return 모두.filter(function (p) {
      if (고른갈래 !== '전체' && p.갈래 !== 고른갈래) return false;
      if (고른거름.브랜드 !== '전체' && p.브랜드 !== 고른거름.브랜드) return false;
      if (고른거름.형태 !== '전체' && (p.곁 || []).indexOf(고른거름.형태) < 0) return false;
      if (고른거름.정수 !== '전체') {
        var 직수 = (p.기능 || []).indexOf('직수형') >= 0;
        if (고른거름.정수 === '직수형' && !직수) return false;
        if (고른거름.정수 === '저수조형' && 직수) return false;
      }
      if (고른거름.관리 !== '전체') {
        var 셀프 = (p.관리 || []).some(function (g) { return /셀프|자가/.test(g); });
        var 방문 = (p.관리 || []).some(function (g) { return /방문/.test(g); });
        if (고른거름.관리 === '셀프·자가관리' && !셀프) return false;
        if (고른거름.관리 === '방문관리' && !방문) return false;
      }
      return true;
    });
  }

  function 줄세우기(목) {
    var ㄱ = 목.slice();
    if (고른정렬 === '낮은 요금순') {
      ㄱ.sort(function (a, b) { return (대표값(a) || {}).프모 - (대표값(b) || {}).프모; });
    } else if (고른정렬 === '높은 요금순') {
      ㄱ.sort(function (a, b) { return (대표값(b) || {}).프모 - (대표값(a) || {}).프모; });
    } else {
      /* 인기순 — ①사장님이 정한 앞줄이 맨 먼저
                  ②그 뒤는 브랜드마다 정한 자리를 번갈아 섞어 한 브랜드가 몰리지 않게
                  ③자리가 같으면 브랜드 차례(코웨이 → SK매직 → …)로 가릅니다 */
      ㄱ.sort(function (a, b) {
        if (a.앞자리 !== b.앞자리) return a.앞자리 - b.앞자리;
        if (a.인기 !== b.인기) return a.인기 - b.인기;
        return 브랜드차례(a.코드) - 브랜드차례(b.코드);
      });
    }
    return ㄱ;
  }

  /* ── 카드 한 장 ────────────────────────────────────── */
  function 카드만들기(p) {
    var 값 = 대표값(p);
    if (!값) return '';
    var 기능 = (p.기능 || []).filter(function (k) { return k !== '탱크형'; })
      .map(function (k) {
        return '<span class="' + (기능색[k] || 'fn-etc') + '">' + 막(k) + '</span>';
      }).join('');
    /* 딱지는 「신규로 가입할 때 실제로 붙는 프로모션」 하나만 적습니다.
       ⛔ 타사보상은 상세 화면 계산기에서 손님이 고르는 것이라 목록에 적지 않습니다
         (사장님 지시 2026-09-09). */
    var 딱지 = 값.딱글
      ? '<span class="li-tag ' + window.요금셈.딱지갈래(값.딱글) + '">' + 막(값.딱글) + '</span>'
      : '';

    /* 담기 단추는 링크(<a>) 안에 넣을 수 없어 카드를 한 겹 감쌉니다 */
    return '<div class="li-item">' +
      '<a class="li-card" href="' + 막(상세주소(p)) + '">' +
      '<div class="li-photo"><img src="' + 밑동() + 'img/' + 막(p.사진) + '.jpg" alt="' + 막(p.이름) +
        '" loading="lazy" width="112" height="112"></div>' +
      '<div class="li-info">' +
        (딱지 ? '<div class="li-tags">' + 딱지 + '</div>' : '') +
        '<p class="li-brand">' + 막(p.브랜드) + ' <span>│ ' + 막(p.모델) + '</span></p>' +
        '<h3 class="li-name">' + 막(p.이름) + '</h3>' +
        (기능 ? '<div class="li-fn">' + 기능 + '</div>' : '') +
        /* 정상가는 한 줄 위, 그 아래에 실제로 낼 값을 크게 둡니다 */
        (값.기본 !== 값.프모
          ? '<p class="li-was">월 ' + 돈(값.기본) + '원</p>' : '') +
        '<div class="li-price">' +
          '<b class="li-now">월 ' + 돈(값.프모) + '원~</b>' +
        '</div>' +
        /* 2026-09-11 제휴카드 가림 — 스위치는 js/dh-card-benefit.js 맨 위에 있습니다.
           ⚠ 브랜드를 가리지 않고 모든 제품에 같은 한 줄을 답니다.
             여덟 곳 모두 제휴카드가 있습니다(사장님 확인). 자료만 두 곳이 비어 있습니다. */
        (window.카드가림
          ? '<p class="li-card-line">제휴카드 사용시 할인</p>'
          : (값.카드 != null
              ? '<p class="li-card-line">제휴카드 쓰면 <b>월 ' + 돈(값.카드) + '원~</b></p>' : '')) +
      '</div></a>' +
      (window.비교함 ? window.비교함.단추(p) : '') +
      '</div>';
  }

  /* 상세 화면 주소 — 규칙은 공용 부품(js/dh-calc3.js)에 있습니다 */
  /* 목록은 /water/ 안에 있습니다 — 그림·자료는 한 칸 위에 있습니다 (2026-09-11) */
  function 밑동() { return '../'; }

  function 상세주소(p) {
    /* 목록이 /water/ 안에 있으므로 제품은 바로 아래 칸입니다 (2026-09-10) */
    return window.요금셈.제품주소(p) + '/';
  }

  /* ── 고르개 그리기 ──────────────────────────────────── */
  /* ── 기능 그림 (2026-09-17 사장님 결정: 대안 다섯 중 ②「색 그림 나열」) ──────────────
     화면에서는 「갈래」가 아니라 **「기능」** 이라 부릅니다(사장님 지시). 코드 속 이름(갈래)은 자료와 맞물려 그대로 둡니다.
     기능은 얼음·냉수·온수·정수 네 가지의 조합이라, 든 것만 색 그림으로 늘어놓습니다.
       얼음 = 하늘색 얼음 조각 · 냉수 = 파란 물방울 · 온수 = 빨간 불꽃 · 정수 = 초록 물방울
     「전체」는 얼음냉온정과 같은 그림이 되면 구분이 안 되므로 네 칸 격자(모두 보기)로 둡니다.
     ⚠ 색은 디자인보드 「기능 딱지 색」과 같은 뜻입니다. 얼음만 보드 값(#0E45A0)이 냉수와 거의 같아
       하늘색 #5AB4E5 로 따로 잡았습니다 — 보드에도 적어 두었습니다. */
  var 갈래기능 = {
    '얼음냉온정': ['얼음', '냉', '온', '정'], '얼음냉정': ['얼음', '냉', '정'],
    '냉온정': ['냉', '온', '정'], '냉정': ['냉', '정'], '온정': ['온', '정'], '정수': ['정']
  };
  var 기능색 = { '얼음': '#5AB4E5', '냉': '#1257C9', '온': '#D2463A', '정': '#13A172' };
  var 조각 = {
    얼음: function (c) { return '<rect x="5" y="5" width="14" height="14" rx="3.5" fill="' + c + '"/>' +
      '<path d="M8.5 9.5l2.5-2" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>'; },
    냉: function (c) { return '<path d="M12 3c-3.5 4-6 7-6 10a6 6 0 0012 0c0-3-2.5-6-6-10z" fill="' + c + '"/>'; },
    온: function (c) { return '<path d="M12.5 2.5c.8 3.4 5 5.3 5 10.5a5.5 5.5 0 01-11 0c0-2.3 1.1-4 2.3-5 .3 2 1.3 3 2.4 3.4-.6-3.3.1-6.3 1.3-8.9z" fill="' + c + '"/>'; },
    정: function (c) { return '<path d="M12 3c-3.5 4-6 7-6 10a6 6 0 0012 0c0-3-2.5-6-6-10z" fill="' + c + '"/>' +
      '<path d="M9.2 13.5a3 3 0 002.3 2.8" stroke="#fff" stroke-width="1.6" stroke-linecap="round" fill="none"/>'; }
  };
  function 갈래그림(g) {
    if (!갈래기능[g]) {
      return '<svg class="g-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">' +
        '<rect x="4" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8"/>' +
        '<rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8"/></svg>';
    }
    var 든 = 갈래기능[g];
    return '<svg class="g-ico wide" viewBox="0 0 ' + (든.length * 24) + ' 24" style="width:' + (든.length * 17) + 'px" aria-hidden="true">' +
      든.map(function (k, i) { return '<g transform="translate(' + (i * 24) + ' 0)">' + 조각[k](기능색[k]) + '</g>'; }).join('') + '</svg>';
  }

  function 고르개그리기() {
    var 칸 = document.getElementById('갈래고르개');
    if (칸) {
      var 갈래들 = ['얼음냉온정', '얼음냉정', '냉온정', '냉정', '온정', '정수'].filter(function (g) {
        return 모두.some(function (p) { return p.갈래 === g; });
      });
      칸.innerHTML = ['전체'].concat(갈래들).map(function (g) {
        return '<button type="button" class="pick-btn' + (g === 고른갈래 ? ' on' : '') +
          '" data-갈래="' + 막(g) + '" aria-pressed="' + (g === 고른갈래) + '">' +
          갈래그림(g) + '<b>' + 막(g) + '</b></button>';
      }).join('');
    }

    var 브랜드들 = [];
    (window.브랜드모음 || []).forEach(function (자료) {
      if (브랜드들.indexOf(자료.이름) < 0) 브랜드들.push(자료.이름);
    });
    var 형태들 = ['데스크형', '스탠드형', '언더싱크', '지하수용'].filter(function (f) {
      return 모두.some(function (p) { return (p.곁 || []).indexOf(f) >= 0; });
    });

    var 알약 = [
      ['브랜드', ['전체'].concat(브랜드들)],
      ['형태', ['전체'].concat(형태들)],
      ['정수 방식', ['전체', '직수형', '저수조형'], '정수'],
      ['관리 유형', ['전체', '방문관리', '셀프·자가관리'], '관리']
    ];
    var 줄 = document.getElementById('거르개');
    if (줄) {
      /* 방식 C — 붙었을 때 큰 기능 칸 대신 쓰는 「기능」 알약. 평소에는 css 가 감춥니다. */
      var 갈래목록 = ['전체', '얼음냉온정', '얼음냉정', '냉온정', '냉정', '온정', '정수'].filter(function (g) {
        return g === '전체' || 모두.some(function (p) { return p.갈래 === g; });
      });
      var 갈래알약 = '<div class="pill-wrap g-pill"><button type="button" class="pill' + (고른갈래 !== '전체' ? ' on' : '') +
        '" data-알약="갈래" aria-expanded="false">' + (고른갈래 === '전체' ? '기능 전체' : 막(고른갈래)) +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' +
        '</button><div class="pill-menu" hidden>' + 갈래목록.map(function (g) {
          return '<button type="button" class="pill-item g-item' + (g === 고른갈래 ? ' on' : '') +
            '" data-알약="갈래" data-값="' + 막(g) + '"><span class="g-slot">' + 갈래그림(g) + '</span><span>' + 막(g) + '</span></button>';
        }).join('') + '</div></div>';
      줄.innerHTML = 갈래알약 + 알약.map(function (a) {
        var 키 = a[2] || a[0];
        var 값 = 고른거름[키];
        var 켬 = 값 !== '전체';
        return '<div class="pill-wrap"><button type="button" class="pill' + (켬 ? ' on' : '') +
          '" data-알약="' + 막(키) + '" aria-expanded="false">' +
          막(켬 ? 값 : a[0]) +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
          'stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' +
          '</button><div class="pill-menu" hidden>' +
          a[1].map(function (v) {
            return '<button type="button" class="pill-item' + (v === 값 ? ' on' : '') +
              '" data-알약="' + 막(키) + '" data-값="' + 막(v) + '">' + 막(v) + '</button>';
          }).join('') + '</div></div>';
      }).join('');
    }

    var 정 = document.getElementById('정렬칸');
    if (정) {
      정.innerHTML = '<div class="pill-wrap"><button type="button" class="pill sort" ' +
        'data-알약="정렬" aria-expanded="false">' + 막(고른정렬) +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' +
        '</button><div class="pill-menu right" hidden>' +
        ['인기순', '낮은 요금순', '높은 요금순'].map(function (v) {
          return '<button type="button" class="pill-item' + (v === 고른정렬 ? ' on' : '') +
            '" data-알약="정렬" data-값="' + 막(v) + '">' + 막(v) + '</button>';
        }).join('') + '</div></div>';
    }
  }

  /* ── 목록 그리기 ────────────────────────────────────── */
  function 목록그리기() {
    var 목 = 줄세우기(거른목록());
    var 칸 = document.getElementById('제품칸');
    if (!칸) return;
    칸.innerHTML = 목.slice(0, 보임).map(카드만들기).join('') ||
      '<p class="lead">고르신 조건에 맞는 제품이 없습니다. 전화 주시면 찾아 드리겠습니다.</p>';
    if (window.비교함) window.비교함.맞추기();
    var 더 = document.getElementById('더보기');
    if (더) {
      더.hidden = !(목.length > 보임);
      더.textContent = '더 보기 (' + Math.max(0, 목.length - 보임) + '개 남음)';
    }
  }

  /* ── 좁은 화면에서 옆으로 미는 줄 (2026-09-17) ────────────────
     폰에서만 옆으로 밉니다. 흐림도 화살표도 없이, 줄을 화면 양끝까지 뻗어 칸이 화면 끝에서 잘리게 합니다
     (아정당 방식 — 사장님 결정 2026-09-17, 모양은 dh-list3.css).
     can-l / can-r 는 지금은 모양에 쓰지 않지만, 어느 쪽에 더 있는지 알려 주는 표시로 남겨 둡니다. */
  function 밀줄만들기(줄, 덧이름) {
    if (!줄 || 줄.parentNode.classList.contains('slide-wrap')) return;
    var 감쌈 = document.createElement('div');
    감쌈.className = 'slide-wrap' + (덧이름 ? ' ' + 덧이름 : '');
    줄.parentNode.insertBefore(감쌈, 줄);
    감쌈.appendChild(줄);
    function 맞추기() {
      var 끝 = 줄.scrollWidth - 줄.clientWidth;
      감쌈.classList.toggle('can-l', 끝 > 4 && 줄.scrollLeft > 4);
      감쌈.classList.toggle('can-r', 끝 > 4 && 줄.scrollLeft < 끝 - 4);
    }
    /* 줄이 밀리면 열린 메뉴도 알약을 따라갑니다 (닫아 버리면 누르자마자 닫히는 일이 생깁니다) */
    줄.addEventListener('scroll', function () { 맞추기(); 열린메뉴따라가기(); }, { passive: true });
    window.addEventListener('resize', 맞추기);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(맞추기);
    감쌈.맞추기 = 맞추기;
    맞추기();
  }

  /* 미는 줄 안의 메뉴는 줄 밖에 띄웁니다.
     줄은 넘침을 감추고 양끝을 흐리게(mask) 하므로, 줄 안에 있는 메뉴는 잘리고 흐려집니다.
     그래서 좁은 화면에서는 메뉴 내용을 화면 맨 위층의 칸(#알약띄움)에 옮겨 적어 알약 바로 아래에 띄웁니다.
     칸 안의 항목도 같은 pill-item 이라 누르면 원래대로 걸러집니다. */
  function 미는줄인가(알) {
    return !!(알 && 알.closest('.slide-wrap') && window.matchMedia('(max-width:560px)').matches);
  }
  function 메뉴자리(알, 메뉴) {
    if (!미는줄인가(알)) return;
    var 띄움 = document.getElementById('알약띄움');
    if (!띄움) {
      띄움 = document.createElement('div');
      띄움.id = '알약띄움';
      띄움.className = 'pill-menu';
      document.body.appendChild(띄움);
    }
    if (메뉴) {
      띄움.innerHTML = 메뉴.innerHTML;
      메뉴.hidden = true;
      띄움.hidden = false;
    }
    var r = 알.getBoundingClientRect();
    띄움.style.position = 'fixed';
    띄움.style.top = Math.round(r.bottom + 6) + 'px';
    var 폭 = 띄움.offsetWidth || 150;
    띄움.style.left = Math.round(Math.min(Math.max(8, r.left), window.innerWidth - 폭 - 8)) + 'px';
  }
  function 열린메뉴따라가기() {
    var 띄움 = document.getElementById('알약띄움');
    if (!띄움 || 띄움.hidden) return;
    var 알 = document.querySelector('.slide-wrap .pill[aria-expanded="true"]');
    if (알) 메뉴자리(알, null); else 띄움.hidden = true;
  }
  /* 알약 줄 — 화면 끝에 걸리는 알약이 반쯤 보이도록 알약 안쪽 여백을 고릅니다 (2026-09-17)
     알약은 글자 길이가 제각각이라, 폰 폭에 따라 알약이 화면 끝에 딱 맞게 끝나 버리면
     옆에 더 있다는 게 안 보입니다(폭 390 에서 실제로 그랬습니다).
     10~18px 을 차례로 넣어 보고, 걸린 알약이 보이는 비율이 45% 에 가장 가까운 값을 씁니다.
     줄을 밀어 둔 상태여도 되도록 밀린 양(scrollLeft)을 더해 처음 자리로 셉니다. */
  function 알약여백맞추기() {
    var 줄 = document.querySelector('.slide-wrap .filter-row');
    if (!줄) return;
    if (!window.matchMedia('(max-width:560px)').matches) { 줄.style.removeProperty('--pill-px'); return; }
    var 화면끝 = 줄.getBoundingClientRect().right;
    /* 기본 여백(14px)으로 다 들어가면 손대지 않습니다 */
    줄.style.setProperty('--pill-px', '14px');
    if (줄.scrollWidth <= 줄.clientWidth + 1) return;
    var 가장 = 14, 가장차이 = 9;
    for (var px = 10; px <= 18; px++) {
      줄.style.setProperty('--pill-px', px + 'px');
      var 알들 = 줄.querySelectorAll('.pill');
      var 비율 = null;
      for (var i = 0; i < 알들.length; i++) {
        var r = 알들[i].getBoundingClientRect();
        var 왼 = r.left + 줄.scrollLeft, 오 = r.right + 줄.scrollLeft;
        if (오 > 화면끝 + 0.5) { 비율 = Math.max(0, 화면끝 - 왼) / r.width; break; }
      }
      if (비율 === null) continue;   /* 이 여백에선 넘치지 않음 — 걸린 알약이 없어 고르지 않습니다 */
      var 차이 = Math.abs(비율 - 0.45);
      if (차이 < 가장차이) { 가장차이 = 차이; 가장 = px; }
    }
    줄.style.setProperty('--pill-px', 가장 + 'px');
  }
  function 밀줄맞추기() {
    알약여백맞추기();
    [].forEach.call(document.querySelectorAll('.slide-wrap'), function (w) { if (w.맞추기) w.맞추기(); });
  }

  /* 거름을 바꾼 뒤 — 묶음이 머리띠 아래에 붙어 있을 만큼 내려와 있었다면 목록 맨 위로 올립니다.
     목록이 짧아지면 빈 곳에 머물러 「결과가 없다」로 보였습니다(2026-09-17 실측).
     부드럽게 움직이지 않고 바로 옮깁니다(화면이 안 뜬 검사창에서 smooth 가 멈추는 함정). */
  function 목록위로() {
    var 묶음 = document.querySelector('.filter-stick.stuck');
    var 칸 = document.getElementById('제품칸');
    if (!묶음 || !칸) return;
    var 머 = document.querySelector('header');
    var 위 = (머 ? 머.getBoundingClientRect().bottom : 0) + 묶음.offsetHeight + 8;
    window.scrollTo(0, Math.max(0, window.pageYOffset + 칸.getBoundingClientRect().top - 위));
  }

  /* ── 눌림 받기 ─────────────────────────────────────── */
  function 알약닫기(빼고) {
    [].forEach.call(document.querySelectorAll('.pill-menu'), function (m) {
      if (m !== 빼고) { m.hidden = true; }
    });
    [].forEach.call(document.querySelectorAll('.pill'), function (b) {
      b.setAttribute('aria-expanded', 'false');
    });
  }

  function 달기() {
    document.addEventListener('click', function (e) {
      var 갈 = e.target.closest('[data-갈래]');
      if (갈) {
        고른갈래 = 갈.getAttribute('data-갈래');
        보임 = 처음보임; 고르개그리기(); 목록그리기(); 알약닫기(null); 밀줄맞추기(); 목록위로(); return;
      }

      var 알 = e.target.closest('.pill');
      if (알) {
        var 메뉴 = 알.nextElementSibling;
        var 열림 = 알.getAttribute('aria-expanded') === 'true';
        알약닫기(열림 ? null : 메뉴);
        메뉴.hidden = 열림;
        if (!열림) 메뉴자리(알, 메뉴);
        알.setAttribute('aria-expanded', String(!열림));
        return;
      }

      var 항 = e.target.closest('.pill-item');
      if (항) {
        var 키 = 항.getAttribute('data-알약');
        var 값 = 항.getAttribute('data-값');
        if (키 === '정렬') 고른정렬 = 값; else if (키 === '갈래') 고른갈래 = 값; else 고른거름[키] = 값;
        보임 = 처음보임;
        고르개그리기(); 목록그리기(); 알약닫기(null); 밀줄맞추기(); 목록위로();
        return;
      }

      if (e.target.closest('#더보기')) { 보임 += 더보기묶음; 목록그리기(); return; }
      알약닫기(null);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') 알약닫기(null);
    });
  }

  function 그리기() {
    모두 = 모으기();
    if (!모두.length) {
      var 칸0 = document.getElementById('제품칸');
      if (칸0) 칸0.innerHTML = '<p class="lead">제품 정보를 불러오지 못했습니다. ' +
        '전화 주시면 바로 안내해 드리겠습니다.</p>';
      return;
    }
    /* ⚠ 제목은 껍데기(만들기/화면만들기.js)가 적어 둔 것을 그대로 둡니다.
       여기서 덮어쓰면 검색용 제목이 사라집니다 (2026-09-10 고침). */
    넣기('기준', (window.브랜드모음[0] || {}).기준 || '');

    /* 붙는 머리 높이를 재 둡니다 (거르개가 그 아래 붙습니다) */
    function 붙는높이재기() {
      var 머 = document.querySelector('header'), 탭 = document.querySelector('.tabbar');
      var h = (머 ? 머.offsetHeight : 0) + (탭 ? 탭.offsetHeight : 0);
      document.documentElement.style.setProperty('--stick-h', h + 'px');
    }
    window.addEventListener('resize', 붙는높이재기);
    붙는높이재기();

    고르개그리기();
    목록그리기();
    달기();
    밀줄만들기(document.getElementById('갈래고르개'));
    밀줄만들기(document.querySelector('.filter-row'), 'pill-slide');
    /* 거름 묶음 고정 — 갈래 칸과 알약 줄을 한 칸으로 감싸 머리띠 아래에 붙입니다(모양은 dh-list3.css) */
    (function () {
      var 갈 = document.getElementById('갈래고르개'), 알 = document.querySelector('.filter-row');
      var 위 = 갈 && 갈.parentNode, 아래 = 알 && 알.parentNode;
      if (!위 || !아래 || 위.parentNode !== 아래.parentNode || 위.parentNode.classList.contains('filter-stick')) return;
      var 묶음 = document.createElement('div');
      묶음.className = 'filter-stick';
      var 표지 = document.createElement('div');
      표지.className = 'filter-stick-mark';
      위.parentNode.insertBefore(표지, 위);
      위.parentNode.insertBefore(묶음, 위);
      묶음.appendChild(위);
      묶음.appendChild(아래);
      /* 붙어 있을 때만 아래 그림자를 줍니다 */
      /* 방식 C — 묶음 앞 표지가 머리띠 밑으로 들어가면 「붙음」. 붙으면 큰 기능 칸 줄을 접고
         알약 줄 맨 앞에 「기능」 알약을 보입니다. 접힌 높이만큼 아래 여백을 줘 목록이 덜컥 뛰지 않게 합니다. */
      function 붙음보기() {
        var 머 = document.querySelector('header');
        var 높이 = 머 ? 머.getBoundingClientRect().bottom : 0;
        var 폰 = window.matchMedia('(max-width:560px)').matches;
        var 붙음 = 폰 && 표지.getBoundingClientRect().top <= 높이 + 0.5;
        if (붙음 === 묶음.classList.contains('stuck')) return;
        if (붙음) {
          var 전 = 묶음.offsetHeight;
          묶음.classList.add('stuck', 'mini');
          /* 바로 아래 목록의 위 여백(16)과 겹쳐 사라지지 않도록 그만큼 더합니다 */
          var 다음 = 묶음.nextElementSibling;
          var 겹침 = 다음 ? parseFloat(getComputedStyle(다음).marginTop) || 0 : 0;
          묶음.style.marginBottom = (전 - 묶음.offsetHeight + 겹침) + 'px';
        } else {
          묶음.classList.remove('stuck', 'mini');
          묶음.style.marginBottom = '';
        }
        알약닫기(null);
        밀줄맞추기();
      }
      window.addEventListener('scroll', 붙음보기, { passive: true });
      window.addEventListener('resize', 붙음보기);
      붙음보기();
    })();
    밀줄맞추기();
    window.addEventListener('resize', 알약여백맞추기);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(밀줄맞추기);
    window.addEventListener('scroll', 열린메뉴따라가기, { passive: true });

    if (window.아래띠) {
      document.body.classList.add('bar3-on');
      window.아래띠.만들기({
        갈래: '목록',
        누르면: function () { if (typeof window.렌탈신청창열기 === 'function') window.렌탈신청창열기(); }
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', 그리기);
  else 그리기();
})();
