/* ══════════════════════════════════════════════════════════════════════
   비교함 (세 번째 판) · dh-compare3.js

   목록에서도 상세에서도 제품을 담아 두었다가 나란히 비교합니다.
   담은 것은 이 브라우저에만 남고(localStorage), 화면을 옮겨도 따라갑니다.

   짜임
     담은 것이 있으면 아래 띠 **위에** 얇은 줄이 하나 더 붙습니다.
     「비교」를 누르면 표 창이 열립니다. 최대 네 개까지.

   쓰는 법
     비교함.단추(p)        → 카드·상세에 넣을 단추 HTML
     비교함.맞추기()       → 화면을 다시 그린 뒤 단추 눌림 상태를 맞춥니다
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var 곳간이름 = 'dh_비교함3';
  var 최대 = 4;
  var 담긴 = [];          // [{사진, 모델, 이름, 브랜드, 코드}]
  var 알림때 = null;

  function 막(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function 돈(n) { return Number(n).toLocaleString('ko-KR'); }
  /* 목록은 /water/ 에, 제품은 /water/{주소}/ 에 있습니다 (2026-09-10 자리 옮김) */
  function 밑동() { return (window.이제품 ? '../../' : '../'); }

  function 읽기() {
    try {
      var t = localStorage.getItem(곳간이름);
      var v = t ? JSON.parse(t) : [];
      return Array.isArray(v) ? v.slice(0, 최대) : [];
    } catch (e) { return []; }
  }
  function 쓰기() {
    try { localStorage.setItem(곳간이름, JSON.stringify(담긴)); } catch (e) {}
  }

  /* ── 담아 둔 값이 낡지 않게 ──────────────────────────────
     ⛔ 2026-09-11 고침 — 비교함은 담을 때의 요금을 통째로 베껴 둡니다.
        목록 화면은 브랜드 여덟 곳을 다 읽으므로 늘 지금 값으로 다시 그렸지만,
        제품 상세 화면은 그 브랜드 자료 하나만 읽습니다. 그래서 다른 브랜드에서
        담아 둔 제품은 **담던 날의 요금**이 표에 그대로 나왔고, 「내 혜택 확인」을
        누르면 그 옛 값이 신청 메모에까지 적혔습니다. 달이 바뀌어 요금을 갱신하면
        손님이 지난달 값을 보게 됩니다.
        → 담긴 제품의 브랜드 자료를 그때그때 더 불러와 값을 다시 셈합니다.
        → 자료에서 사라진 제품은 비교함에서 빼 줍니다. */
  var 판 = (function () {
    var s = document.currentScript && document.currentScript.src;
    var m = s && s.match(/[?&]v=([^&]+)/);
    return m ? m[1] : '';
  })();
  var 불러본 = {};

  function 실린브랜드() {
    return (window.브랜드모음 || []).map(function (자) { return 자.코드; });
  }

  /* 담긴 제품 가운데 이 화면에 자료가 없는 브랜드만 더 읽어 옵니다.
     담을 수 있는 것이 넷뿐이라 거의 언제나 한두 개, 대개는 하나도 없습니다. */
  function 모자란자료채우기(끝나면) {
    var 있음 = 실린브랜드();
    var 필요 = [];
    담긴.forEach(function (x) {
      if (x.코드 && 있음.indexOf(x.코드) < 0 &&
          !불러본[x.코드] && 필요.indexOf(x.코드) < 0) 필요.push(x.코드);
    });
    if (!필요.length) { 끝나면(false); return; }
    var 남 = 필요.length;
    필요.forEach(function (코드) {
      불러본[코드] = true;
      var s = document.createElement('script');
      s.src = 밑동() + 'js/data2-' + 코드 + '.js' + (판 ? '?v=' + 판 : '');
      s.onload = s.onerror = function () { if (--남 === 0) 끝나면(true); };
      document.head.appendChild(s);
    });
  }

  /* 자료가 읽힌 브랜드는 지금 값으로 다시 적습니다.
     ⚠ 자료를 못 읽은 브랜드는 건드리지 않습니다. 지우면 손님이 담아 둔 것이 날아갑니다. */
  function 값되살리기() {
    var 있음 = 실린브랜드();
    var 바뀜 = false;
    var 새목록 = [];
    담긴.forEach(function (x) {
      if (!x.코드 || 있음.indexOf(x.코드) < 0) { 새목록.push(x); return; }
      var 찾 = 찾기(x.사진);
      if (!찾) { 바뀜 = true; return; }            /* 자료에서 없어진 제품 */
      var 새 = 뜬것(찾.제품, 찾.브랜드, 찾.코드);
      if (JSON.stringify(새) !== JSON.stringify(x)) 바뀜 = true;
      새목록.push(새);
    });
    if (바뀜) { 담긴 = 새목록; 쓰기(); }
    return 바뀜;
  }

  /* 값을 맞춘 뒤에 할 일을 넘겨 줍니다 */
  function 값맞추고(할일) {
    모자란자료채우기(function () { 값되살리기(); 할일(); });
  }

  /* 담아 둔 것을 지금 화면의 자료에서 찾습니다.
     ⚠ 상세 화면은 그 브랜드 자료 하나만 읽습니다. 다른 브랜드에서 담은 제품은
       여기서 못 찾으므로, 담을 때 적어 둔 것(아래 뜬것 참고)으로 그립니다. */
  function 찾기(사진) {
    var 답 = null;
    (window.브랜드모음 || []).forEach(function (자) {
      (자.제품 || []).forEach(function (x) {
        if (x.사진 === 사진 && !답) {
          답 = { 제품: x, 코드: 자.코드, 브랜드: 자.이름 };
        }
      });
    });
    return 답;
  }

  /* 담을 때 표에 필요한 것을 함께 적어 둡니다.
     자료 파일이 없는 화면에서도 표를 그릴 수 있게 하려는 것입니다. */
  function 뜬것(p, 브랜드이름, 코드) {
    var q = { 코드: 코드 };
    for (var k in p) if (Object.prototype.hasOwnProperty.call(p, k)) q[k] = p[k];
    var 값 = (window.요금셈 && window.요금셈.가장싼값(q)) || {};
    return {
      사진: p.사진, 모델: p.모델, 이름: p.이름, 브랜드: 브랜드이름, 코드: 코드,
      기능: p.기능 || [], 곁: p.곁 || [], 열: p.열 || [], 관리: p.관리 || [],
      주소: (window.요금셈 && window.요금셈.제품주소(p)) || p.모델,
      /* 약정·관리도 함께 담습니다 — 신청창의 「선택한 상품」 칸이 조건까지 보여 줍니다 */
      값: { 기본: 값.기본, 프모: 값.프모, 카드: 값.카드, 약정: 값.약정, 관리: 값.관리 }
    };
  }

  function 담겼나(사진) {
    return 담긴.some(function (x) { return x.사진 === 사진; });
  }

  function 넣고빼기(p, 브랜드이름, 코드) {
    if (담겼나(p.사진)) { 빼기(p.사진); return false; }
    if (담긴.length >= 최대) {
      알림('비교함은 ' + 최대 + '개까지 담을 수 있습니다');
      return true;
    }
    담긴.push(뜬것(p, 브랜드이름, 코드));
    쓰기(); 다시그리기();
    return true;
  }
  function 빼기(사진) {
    담긴 = 담긴.filter(function (x) { return x.사진 !== 사진; });
    쓰기(); 다시그리기();
  }
  function 비우기() { 담긴 = []; 쓰기(); 다시그리기(); }

  function 알림(글) {
    var e = document.getElementById('비교알림');
    if (!e) {
      e = document.createElement('div');
      e.id = '비교알림'; e.className = 'cmp3-toast';
      document.body.appendChild(e);
    }
    e.textContent = 글;
    e.classList.add('on');
    clearTimeout(알림때);
    알림때 = setTimeout(function () { e.classList.remove('on'); }, 2600);
  }

  /* ── 카드·상세에 넣을 단추 ─────────────────────────── */
  function 단추(p) {
    return '<button type="button" class="cmp3-btn" data-비교="' + 막(p.사진) + '"' +
           ' aria-pressed="' + 담겼나(p.사진) + '">' +
           '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
           'stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
           '<path d="M20 6L9 17l-5-5"/></svg>' +
           '<span>비교</span></button>';
  }
  function 맞추기() {
    [].forEach.call(document.querySelectorAll('[data-비교]'), function (b) {
      b.setAttribute('aria-pressed', 담겼나(b.getAttribute('data-비교')));
    });
  }

  /* ── 아래 띠 위에 붙는 얇은 줄 ─────────────────────── */
  function 줄그리기() {
    var 줄 = document.getElementById('비교줄');
    if (!담긴.length) {
      if (줄) 줄.parentNode.removeChild(줄);
      document.documentElement.style.setProperty('--cmp-h', '0px');
      if (window.아래띠) window.아래띠.높이재기();
      return;
    }
    if (!줄) {
      줄 = document.createElement('div');
      줄.id = '비교줄'; 줄.className = 'cmp3-bar';
      document.body.appendChild(줄);
    }
    줄.innerHTML =
      '<div class="cmp3-inner">' +
        '<div class="cmp3-chips">' +
          담긴.map(function (x) {
            return '<span class="cmp3-chip">' + 막(x.이름) +
                   '<button type="button" class="cmp3-x" data-비교빼기="' + 막(x.사진) + '"' +
                   ' aria-label="' + 막(x.이름) + ' 빼기">✕</button></span>';
          }).join('') +
        '</div>' +
        '<button type="button" class="cmp3-open" id="비교열기">비교 ' + 담긴.length + '</button>' +
      '</div>';
    document.documentElement.style.setProperty('--cmp-h', 줄.offsetHeight + 'px');
    if (window.아래띠) window.아래띠.높이재기();
  }

  function 다시그리기() { 줄그리기(); 맞추기(); }

  /* ── 비교하는 표 ───────────────────────────────────── */
  function 창만들기() {
    if (document.getElementById('비교창3')) return;
    var 창 = document.createElement('div');
    창.className = 'pop'; 창.id = '비교창3';
    창.setAttribute('role', 'dialog');
    창.setAttribute('aria-modal', 'true');
    창.setAttribute('aria-labelledby', '비교제목3');
    창.innerHTML =
      '<div class="pop-box">' +
        '<div class="pop-head"><div>' +
          '<h3 id="비교제목3">제품 비교</h3>' +
          '<p>담아 두신 제품을 나란히 놓았습니다.</p>' +
        '</div>' +
        '<button type="button" class="pop-close" id="비교닫기3" aria-label="닫기">✕</button></div>' +
        '<div class="pop-body cmp3-body" id="비교몸통3"></div>' +
        '<div class="cmp3-foot">' +
          '<button type="button" class="cmp3-clear" id="비교비우기">모두 빼기</button>' +
          '<button type="button" class="cmp3-cta" id="비교신청">내 혜택 얼마인지 확인</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(창);
  }

  function 표만들기() {
    var 줄 = [];
    담긴.forEach(function (x) {
      /* 이 화면에 그 브랜드 자료가 있으면 지금 값으로 다시 셈하고,
         없으면(다른 브랜드에서 담은 것) 담을 때 적어 둔 값을 씁니다. */
      var 찾 = 찾기(x.사진);
      if (찾) {
        var q = { 코드: 찾.코드 };
        for (var k in 찾.제품) if (Object.prototype.hasOwnProperty.call(찾.제품, k)) q[k] = 찾.제품[k];
        줄.push({ p: 찾.제품, 브랜드: 찾.브랜드,
                  주소: window.요금셈.제품주소(찾.제품),
                  값: window.요금셈.가장싼값(q) || {} });
      } else {
        줄.push({ p: x, 브랜드: x.브랜드, 주소: x.주소 || x.모델, 값: x.값 || {} });
      }
    });
    if (!줄.length) return '<p class="lead" style="padding:20px">담긴 제품이 없습니다.</p>';

    function 칸(뽑기, 이름, 굵게) {
      return '<tr><th scope="row">' + 막(이름) + '</th>' +
        줄.map(function (r) {
          return '<td' + (굵게 ? ' class="big"' : '') + '>' + 뽑기(r) + '</td>';
        }).join('') + '</tr>';
    }
    var 밑 = 밑동();
    return '<table class="cmp3-table"><tbody>' +
      '<tr><th scope="row"><span class="sr">사진</span></th>' +
        줄.map(function (r) {
          return '<td><a class="cmp3-photo" href="' + 밑 + 'water/' +
            encodeURIComponent(r.주소) + '/">' +
            '<img src="' + 밑 + 'img/' + 막(r.p.사진) + '.jpg" alt="' + 막(r.p.이름) + '"></a></td>';
        }).join('') + '</tr>' +
      칸(function (r) { return 막(r.브랜드) + '<br><b>' + 막(r.p.이름) + '</b>'; }, '제품') +
      칸(function (r) { return 막(r.p.모델); }, '모델') +
      /* 좁은 칸에서 「월」과 「~」가 따로 떨어지지 않도록 한 덩어리로 둡니다 */
      칸(function (r) {
        return r.값.프모 != null ? (돈(r.값.프모) + '원~') : '—';
      }, '프로모션가', true) +
      칸(function (r) {
        return (r.값.기본 != null && r.값.기본 !== r.값.프모)
          ? ('<s>' + 돈(r.값.기본) + '원</s>') : '—';
      }, '정상가') +
      /* 2026-09-11 제휴카드 가림 — 스위치는 js/dh-card-benefit.js 맨 위에 있습니다.
         줄 이름과 칸을 이어 읽으면 「제휴카드 사용시 할인」이 됩니다. */
      칸(function (r) {
        if (window.카드가림) return '사용시 할인';
        return r.값.카드 != null ? (돈(r.값.카드) + '원') : '—';
      }, window.카드가림 ? '제휴카드' : '제휴카드가') +
      칸(function (r) {
        return (r.p.기능 || []).filter(function (k) { return k !== '탱크형'; }).join(' · ') || '—';
      }, '기능') +
      칸(function (r) { return (r.p.곁 || []).join(' · ') || '—'; }, '형태') +
      칸(function (r) {
        return (r.p.열 || []).map(window.요금셈.짧게).join(' · ') || '—';
      }, '약정') +
      칸(function (r) {
        return (r.p.관리 || []).map(window.요금셈.짧게).join('<br>') || '—';
      }, '관리 방식') +
      '</tbody></table>' +
      '<p class="cmp3-note">프로모션가는 약정·관리 방식 가운데 가장 낮은 값입니다. ' +
      (window.카드가림
        ? '제휴카드 할인 조건은 상담에서 안내해 드립니다.'
        : '제휴카드가는 전월 실적을 채웠을 때의 값입니다.') + '</p>';
  }

  function 창열기() {
    창만들기();
    var 창 = document.getElementById('비교창3');
    var 몸 = document.getElementById('비교몸통3');
    몸.innerHTML = 표만들기();
    몸.scrollTop = 0;
    창.classList.add('open');
    document.body.classList.add('pop-open');
    var 닫 = document.getElementById('비교닫기3');
    if (닫) 닫.focus();
    /* 아직 못 읽은 브랜드가 있으면 읽어 온 뒤 표를 다시 그립니다.
       시작할 때 이미 맞춰 두므로 여기서 다시 그릴 일은 거의 없습니다. */
    값맞추고(function () {
      if (창.classList.contains('open')) { 몸.innerHTML = 표만들기(); 다시그리기(); }
    });
  }
  function 창닫기() {
    var 창 = document.getElementById('비교창3');
    if (창) 창.classList.remove('open');
    document.body.classList.remove('pop-open');
  }

  /* ── 눌림 받기 ─────────────────────────────────────── */
  function 달기() {
    document.addEventListener('click', function (e) {
      var 담 = e.target.closest('[data-비교]');
      if (담) {
        e.preventDefault(); e.stopPropagation();
        var 찾 = 찾기(담.getAttribute('data-비교'));
        if (찾) 넣고빼기(찾.제품, 찾.브랜드, 찾.코드);
        return;
      }
      var 뺌 = e.target.closest('[data-비교빼기]');
      if (뺌) { 빼기(뺌.getAttribute('data-비교빼기')); return; }
      if (e.target.closest('#비교열기')) { 창열기(); return; }
      if (e.target.closest('#비교닫기3')) { 창닫기(); return; }
      if (e.target.closest('#비교비우기')) { 비우기(); 창닫기(); return; }
      if (e.target.closest('#비교신청')) {
        창닫기();
        /* 비교함에 담은 제품을 신청창의 「선택한 상품」 칸에 그대로 넘깁니다.
           2026-09-10 전에는 여기서 아무것도 넘기지 않아, 비교하고 신청하면
           **어떤 제품을 보고 있었는지 시트에 한 줄도 남지 않았습니다.** */
        if (typeof window.고른제품담기 === 'function') {
          window.고른제품담기(담긴.map(function (x) {
            return {
              사진: x.사진, 브랜드: x.브랜드, 이름: x.이름, 모델: x.모델,
              조건: [x.값 && x.값.약정 && String(x.값.약정).replace(' 약정', ''),
                     x.값 && x.값.관리 && window.요금셈.짧게(x.값.관리)]
                    .filter(Boolean).join(' · '),
              값: x.값 || {}
            };
          }));
        }
        if (typeof window.렌탈신청창열기 === 'function') window.렌탈신청창열기();
        return;
      }
      var 창 = document.getElementById('비교창3');
      if (창 && e.target === 창) { 창닫기(); return; }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var 창 = document.getElementById('비교창3');
      if (창 && 창.classList.contains('open')) 창닫기();
    });
    window.addEventListener('resize', 줄그리기);
  }

  담긴 = 읽기();
  window.비교함 = { 단추: 단추, 맞추기: 맞추기, 다시그리기: 다시그리기, 담겼나: 담겼나 };

  /* 화면이 열리면 곧바로 담긴 값을 지금 요금으로 맞춥니다.
     담긴 것이 없으면 아무 파일도 더 읽지 않습니다. */
  function 시작() {
    달기();
    다시그리기();
    값맞추고(다시그리기);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', 시작);
  } else { 시작(); }
})();
