/* ══════════════════════════════════════════════════════════════════════
   신청창 안 「선택한 상품」 · dh-pick.js  (2026-09-10 새로 만듦)

   ★ 무엇을 하나
     ① 손님이 고른 제품을 신청창 안에 **접힌 채로** 보여 줍니다(아정당 방식).
     ② 신청을 보낼 때 **요청사항 칸 하나에** 「[선택]…」 줄과 「[요청]…」 줄을 함께 적습니다.
        신청 시트에 제품을 적을 칸이 따로 없어 한 칸을 나눠 쓰는 것입니다.

   ⛔ 왜 만들었나 — 예전에는 제품 이름을 **요청사항 칸에 대신 적어** 두었습니다.
     손님이 하고 싶은 말을 적을 자리를 우리가 먼저 차지했고, 칸이 이미 펼쳐졌는데도
     「+ 요청사항 남기기」 단추가 안 눌린 모습으로 남아 있었습니다.

   ★ 공용 신청창(js/dh-apply.js)은 **한 줄도 손대지 않습니다.**
     그 파일은 메인·요금표·사은품명단이 함께 쓰기 때문입니다.
     여기서는 창이 열리면 칸을 끼워 넣고, 보내기를 감싸서 글만 합쳐 줍니다.
     이 파일을 부르지 않는 화면은 지금까지와 똑같이 움직입니다.

   쓰는 법 :  window.고른제품담기([{사진,브랜드,이름,모델,조건,값:{기본,프모,카드}}, ...])
              window.고른제품비우기()
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var 고른 = [];

  function 막(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function 돈(n) { return Number(n).toLocaleString('ko-KR'); }

  /* 목록은 /water/ 에, 제품은 /water/{주소}/ 에 있습니다 */
  function 밑동() { return window.이제품 ? '../../' : '../'; }

  /* ── 한 줄 그리기 ─────────────────────────────────── */
  function 줄(x) {
    var 값 = x.값 || {};
    var 사진 = x.사진 ? ('<img src="' + 밑동() + 'img/' + 막(x.사진) + '.jpg" alt="" loading="lazy">')
                      : '<span class="pick-noimg" aria-hidden="true"></span>';
    var 값칸 = '';
    if (값.프모 != null) {
      값칸 = '<div class="pick-money"><div class="pick-won">월 ' + 돈(값.프모) + '원</div>' +
             /* 2026-09-11 제휴카드 가림 — 스위치는 js/dh-card-benefit.js 맨 위에 있습니다 */
             (window.카드가림
               ? '<div class="pick-card">제휴카드 사용시 할인</div>'
               : (값.카드 != null
                   ? '<div class="pick-card">카드할인시 ' + 돈(값.카드) + '원</div>' : '')) +
             '</div>';
    }
    return '<div class="pick-row">' + 사진 +
      '<div class="pick-text">' +
        '<div class="pick-brand">' + 막(x.브랜드 || '') + '</div>' +
        /* 현대큐밍처럼 모델명이 곧 제품명인 곳이 있습니다 — 두 번 적지 않습니다 */
        '<div class="pick-name">' + 막(x.이름 || '') +
          ((x.모델 && x.모델 !== x.이름) ? ' <span>(' + 막(x.모델) + ')</span>' : '') + '</div>' +
        (x.조건 ? '<div class="pick-cond">' + 막(x.조건) + '</div>' : '') +
      '</div>' + 값칸 + '</div>';
  }

  /* ── 신청창 안에 칸 끼워 넣기 ─────────────────────── */
  function 그리기() {
    var 폼 = document.getElementById('formContent');
    if (!폼) return;                                   /* 아직 신청창이 안 만들어졌습니다 */
    var 상자 = document.getElementById('고른상자');

    if (!고른.length) { if (상자) 상자.remove(); return; }

    if (!상자) {
      상자 = document.createElement('div');
      상자.className = 'pick-box';
      상자.id = '고른상자';
      /* 휴대폰 번호 칸 바로 아래, 「+ 요청사항 남기기」 위에 놓습니다 */
      var 앞 = document.getElementById('memoToggle');
      if (앞 && 앞.parentNode) 앞.parentNode.insertBefore(상자, 앞);
      else 폼.appendChild(상자);
    }

    상자.innerHTML =
      '<button type="button" class="pick-head" id="고른단추" aria-expanded="false" aria-controls="고른몸">' +
        '<span class="pick-title">선택한 상품 보기' +
          (고른.length > 1 ? ' <em class="pick-count">' + 고른.length + '</em>' : '') + '</span>' +
        '<svg class="pick-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
          'stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M6 9l6 6 6-6"/></svg>' +
      '</button>' +
      '<div class="pick-body" id="고른몸">' + 고른.map(줄).join('') + '</div>';

    상자.querySelector('#고른단추').addEventListener('click', function () {
      var 폄 = 상자.classList.toggle('open');
      this.setAttribute('aria-expanded', 폄 ? 'true' : 'false');
    });
  }

  /* ── 보낼 글 만들기 ───────────────────────────────
     시트의 「요청사항」 한 칸에 이렇게 들어갑니다
       [선택] 코웨이 아이콘 정수기 3 (CHP-7220N) / 7년 · 자가관리 / 월 13,450원
       [요청] 통화는 오후 2시 이후에 부탁드려요                                  */
  function 합친글(손님글) {
    var 줄들 = 고른.map(function (x) {
      var 값 = x.값 || {};
      var t = '[선택] ' + [x.브랜드, x.이름].filter(Boolean).join(' ');
      if (x.모델 && x.모델 !== x.이름) t += ' (' + x.모델 + ')';
      if (x.조건) t += ' / ' + x.조건;
      if (값.프모 != null) t += ' / 월 ' + 돈(값.프모) + '원';
      return t;
    });
    if (손님글) 줄들.push('[요청] ' + 손님글);
    return 줄들.join('\n');
  }

  /* ── 공용 신청창을 감쌉니다 (원본은 손대지 않습니다) ── */
  function 감싸기() {
    if (typeof window.신청창열기 === 'function' && !window.신청창열기.__pick) {
      var 옛열기 = window.신청창열기;
      window.신청창열기 = function () {
        var r = 옛열기.apply(this, arguments);
        그리기();
        return r;
      };
      window.신청창열기.__pick = true;
    }

    if (typeof window.submitForm === 'function' && !window.submitForm.__pick) {
      var 옛보내기 = window.submitForm;
      window.submitForm = function () {
        var 칸 = document.getElementById('inputMemo');
        if (칸 && 고른.length) {
          /* ⚠ 손님이 직접 쓴 글은 200자까지입니다. 제품 줄은 그 위에서 따로 붙이므로
             합친 글이 200자를 넘어도 그대로 보냅니다(시트 한 칸은 5만 자까지 들어갑니다).
             maxlength 는 사람이 칠 때만 막고, 프로그램이 넣는 값은 잘리지 않습니다. */
          칸.value = 합친글(칸.value.trim());
        }
        return 옛보내기.apply(this, arguments);
      };
      window.submitForm.__pick = true;
    }
  }

  /* dh-apply.js 가 나중에 실려도 놓치지 않도록 몇 번 더 살펴봅니다 */
  감싸기();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', 감싸기);
  }
  window.addEventListener('load', 감싸기);

  window.고른제품담기 = function (목록) {
    고른 = (목록 || []).filter(Boolean);
    감싸기();
    그리기();
  };
  window.고른제품비우기 = function () { 고른 = []; 그리기(); };
  window.고른제품 = function () { return 고른.slice(); };
})();
