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
  var 갈래아이콘 = {
    '전체': '<path d="M12 3c-3.5 4-6 7-6 10a6 6 0 0012 0c0-3-2.5-6-6-10z"/>',
    '얼음냉온정': '<path d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9"/>',
    /* 2026-09-11: 얼음은 있고 온수가 없는 갈래가 있습니다 (코웨이 CPI- · 청호 옴니 플러스).
       눈꽃은 그대로 두고 테두리를 옅게 해서 「온수 없음」을 알립니다. */
    '얼음냉정': '<path d="M12 6.5v11M7 9l10 6M17 9l-10 6"/>' +
                '<circle cx="12" cy="12" r="9"/>',
    '냉온정': '<path d="M12 3a9 9 0 000 18z" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="9"/>',
    /* 2026-09-11: 온수가 없는 「냉정」 갈래가 생겼습니다 (코웨이 CP- 모델) */
    '냉정': '<path d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9" opacity=".55"/><circle cx="12" cy="12" r="9"/>',
    /* 2026-09-11: 거꾸로 냉수가 없는 「온정」도 생겼습니다 (LG 라이트온) — 김 오르는 표 */
    '온정': '<path d="M9 3.5c0 1.9 1.6 1.9 1.6 3.8S9 9.2 9 11.1s1.6 1.9 1.6 3.8S9 16.8 9 18.7' +
            'M14.4 3.5c0 1.9 1.6 1.9 1.6 3.8s-1.6 1.9-1.6 3.8 1.6 1.9 1.6 3.8-1.6 1.9-1.6 3.8" ' +
            'opacity=".55"/><circle cx="12" cy="12" r="9"/>',
    '정수': '<circle cx="12" cy="12" r="9"/>'
  };

  function 고르개그리기() {
    var 칸 = document.getElementById('갈래고르개');
    if (칸) {
      var 갈래들 = ['얼음냉온정', '얼음냉정', '냉온정', '냉정', '온정', '정수'].filter(function (g) {
        return 모두.some(function (p) { return p.갈래 === g; });
      });
      칸.innerHTML = ['전체'].concat(갈래들).map(function (g) {
        return '<button type="button" class="pick-btn' + (g === 고른갈래 ? ' on' : '') +
          '" data-갈래="' + 막(g) + '" aria-pressed="' + (g === 고른갈래) + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
          'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          (갈래아이콘[g] || 갈래아이콘['전체']) + '</svg><b>' + 막(g) + '</b></button>';
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
      줄.innerHTML = 알약.map(function (a) {
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
        보임 = 처음보임; 고르개그리기(); 목록그리기(); 알약닫기(null); return;
      }

      var 알 = e.target.closest('.pill');
      if (알) {
        var 메뉴 = 알.nextElementSibling;
        var 열림 = !메뉴.hidden;
        알약닫기(열림 ? null : 메뉴);
        메뉴.hidden = 열림;
        알.setAttribute('aria-expanded', String(!열림));
        return;
      }

      var 항 = e.target.closest('.pill-item');
      if (항) {
        var 키 = 항.getAttribute('data-알약');
        var 값 = 항.getAttribute('data-값');
        if (키 === '정렬') 고른정렬 = 값; else 고른거름[키] = 값;
        보임 = 처음보임;
        고르개그리기(); 목록그리기(); 알약닫기(null);
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
