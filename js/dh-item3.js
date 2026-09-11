/* ══════════════════════════════════════════════════════════════════════
   제품 상세 한 장 (세 번째 판) · dh-item3.js

   주소 : /water/{브랜드-모델}/  — 깃허브가 한글 폴더를 못 찾아 영문으로 바꿨습니다 (2026-09-10)
   껍데기 파일이 `window.이제품` 에 모델명을 적어 두면 여기서 찾아 그립니다.

   짜임
     사진 → 브랜드│모델 → 이름 → 색상 → 기능 → 제휴카드(접힘)
     → 계산기(약정·관리·타사보상) → 제품 상세 그림
     아래 따라다니는 띠가 요금 세 줄과 신청 단추를 맡습니다.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var 밑동 = '../../';          // 껍데기가 두 칸 아래에 있습니다
  var p = null, 자료 = null;
  var 셈부품 = window.요금셈;

  function 막(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function 넣기(id, 글) { var e = document.getElementById(id); if (e) e.textContent = 글; }

  var 기능색 = { '냉수': 'fn-cold', '온수': 'fn-hot', '정수': 'fn-pure',
                '얼음': 'fn-ice', '직수형': 'fn-direct', '나노필터': 'fn-pure' };

  /* 껍데기가 알려 준 제품을 자료에서 찾습니다.
     ⚠ 현대큐밍처럼 서로 다른 제품이 같은 모델명을 쓰는 경우가 있어
       사진 이름(제품마다 하나뿐)을 먼저 맞춰 보고, 없을 때만 모델명으로 찾습니다. */
  function 찾기() {
    var 시킴 = window.이제품;
    var 모델 = (시킴 && 시킴.모델) ? 시킴.모델 : 시킴;
    var 사진 = (시킴 && 시킴.사진) ? 시킴.사진 : null;
    var 답 = null;
    (window.브랜드모음 || []).forEach(function (자) {
      (자.제품 || []).forEach(function (x) {
        if (답) return;
        var 맞나 = 사진 ? (x.사진 === 사진) : (x.모델 === 모델);
        if (맞나) { x.코드 = 자.코드; x.브랜드 = 자.이름; 답 = x; 자료 = 자; }
      });
    });
    return 답;
  }

  /* ── 화면 그리기 ───────────────────────────────────── */
  function 그리기() {
    p = 찾기();
    var 몸 = document.getElementById('제품몸통');
    if (!p || !몸) {
      if (몸) 몸.innerHTML = '<p class="lead">제품을 찾지 못했습니다. ' +
        '<a href="../">목록으로 돌아가기</a></p>';
      return;
    }
    /* ⚠ 제목은 껍데기가 요금까지 넣어 적어 둡니다. 덮어쓰지 않습니다 (2026-09-10). */
    넣기('위제목', p.이름);

    var 기능 = (p.기능 || []).filter(function (k) { return k !== '탱크형'; })
      .map(function (k) {
        return '<span class="' + (기능색[k] || 'fn-etc') + '">' + 막(k) + '</span>';
      }).join('');

    var 색 = (p.색 || []).map(function (c, n) {
      return '<button type="button" class="it-color" aria-pressed="' + (n === 0) +
             '" data-이름="' + 막(c[0]) + '" aria-label="' + 막(c[0]) + '">' +
             '<i style="background:' + 막(c[1]) + '"></i></button>';
    }).join('');

    var 카 = (window.제휴카드자료 || {})[p.코드];
    var 첫 = 셈부품.첫조합(p);
    var 타사있나 = Object.keys(p.요금 || {}).some(function (k) { return p.요금[k].타사 != null; });

    몸.innerHTML =
      '<div class="it-photo"><img src="' + 밑동 + 'img/' + 막(p.사진) + '.jpg" alt="' +
        막(p.이름) + '" width="360" height="360"></div>' +

      '<div class="it-head">' +
        '<p class="it-brand">' + 막(p.브랜드) + ' <span>│ ' + 막(p.모델) + '</span></p>' +
        (window.비교함 ? window.비교함.단추(p) : '') +
      '</div>' +
      '<h1 class="it-name">' + 막(p.이름) + '</h1>' +

      (색 ? '<div class="it-row"><span class="it-label">색상 <em class="it-color-name"></em></span>' +
            '<div class="it-colors">' + 색 + '</div></div>'
          : (p.색상 ? '<div class="it-row"><span class="it-label">색상</span>' +
                     '<p class="it-color-text">' + 막(p.색상) + '</p></div>' : '')) +

      (기능 ? '<div class="it-fn">' + 기능 + '</div>' : '') +

      /* 2026-09-11 제휴카드 가림 — 스위치는 js/dh-card-benefit.js 맨 위에 있습니다.
         가려 둘 때는 이 단추를 아예 그리지 않습니다. 안내 창도 열 길이 없어집니다. */
      ((카 && !window.카드가림)
          ? '<button type="button" class="it-card-open" id="카드열기">' +
            '<span class="it-label">제휴카드</span>' +
            '<span class="it-card-sum">' + 막(카.기준) + ' 기준 최대 ' +
            셈부품.돈(카.깎을돈) + '원 할인</span>' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>' +
            '</button>' : '') +

      '<div class="it-calc">' +
        고르개('약정', p.열 || [], 첫.약정, false) +
        고르개('관리 방식', p.관리 || [], 첫.관리, (p.관리 || []).length === 2) +
        (타사있나 ? 고르개('지금 쓰는 정수기', ['없어요', '있어요'], '없어요', true) : '') +
      '</div>' +
      '<p class="it-after" id="설명"></p>' +

      ((p.상세 && p.상세.length)
        ? '<div class="it-detail"><h2>제품 상세</h2>' +
          p.상세.map(function (c, i) {
            var 번호 = (c[0] < 10 ? '0' : '') + c[0];
            return '<img src="' + 밑동 + 'img/detail/' + 막(p.사진) + '-' + 번호 + '.jpg"' +
                   ' width="' + c[1] + '" height="' + c[2] + '"' +
                   ' loading="' + (i < 1 ? 'eager' : 'lazy') + '"' +
                   ' alt="' + 막(p.이름 + ' 상세 안내 ' + (i + 1)) + '">';
          }).join('') + '</div>'
        : '') +

      /* 제품 규격 — 공홈과 같은 자리(상세 그림 다음)에 둡니다.
         그림이 아니라 글자로 넣었습니다. 폰에서 읽기 쉽고 검색에도 잡힙니다. */
      ((p.제원 && p.제원.length)
        ? '<div class="it-spec"><h2>제품 규격</h2><table><tbody>' +
          p.제원.map(function (r) {
            return '<tr><th scope="row">' + 막(r[0]) + '</th><td>' +
                   막(r[1]).replace(/ \/ /g, '<br>') + '</td></tr>';
          }).join('') +
          '</tbody></table>' +
          '<p class="it-spec-note">제조사가 밝힌 값입니다. ' +
          '제품이 나아지면서 겉모양과 규격은 바뀔 수 있습니다.</p></div>'
        : '');

    var 이름칸 = 몸.querySelector('.it-color-name');
    var 첫색 = 몸.querySelector('.it-color');
    if (이름칸 && 첫색) 이름칸.textContent = 첫색.getAttribute('data-이름');

    if (window.비교함) window.비교함.다시그리기();
    if (window.아래띠) {
      document.body.classList.add('bar3-on');
      window.아래띠.만들기({ 갈래: '상세', 누르면: 견적받기 });
    }
    다시셈();
    달기();
  }

  function 고르개(이름, 목, 고름, 두칸) {
    if (!목.length) return '';
    return '<div class="it-row"><span class="it-label">' + 막(이름) + '</span>' +
      '<div class="it-opts' + (두칸 ? ' two' : '') + '" data-고르개="' + 막(이름) + '">' +
      목.map(function (v) {
        return '<button type="button" class="it-opt" aria-pressed="' + (v === 고름) +
               '" data-값="' + 막(v) + '">' + 막(셈부품.짧게(v)) + '</button>';
      }).join('') + '</div></div>';
  }

  /* ── 값 다시 셈하기 ────────────────────────────────── */
  function 고름(이름) {
    var 칸 = document.querySelector('[data-고르개="' + 이름 + '"]');
    if (!칸) return null;
    var b = 칸.querySelector('[aria-pressed="true"]');
    return b ? (b.getAttribute('data-값') || b.textContent.trim()) : null;
  }

  function 다시셈() {
    var 결 = 셈부품.셈(p, 고름('약정'), 고름('관리 방식'), 고름('지금 쓰는 정수기') === '있어요');
    var 설 = document.getElementById('설명');
    if (!결) {
      if (설) 설.innerHTML = '이 조합은 없습니다. 다른 약정이나 관리 방식을 골라 주세요.';
      if (window.아래띠) window.아래띠.값바꾸기({});
      return;
    }
    if (설) 설.innerHTML = 결.말;
    if (window.아래띠) {
      window.아래띠.값바꾸기({
        정상: 결.기본, 프로모션: 결.값, 카드: 결.카드, 딱지: 결.딱글
      });
    }
  }

  /* ── 견적 받기 — 신청창을 열고 「선택한 상품」 칸에 이 제품을 담습니다 ──

     ⛔ 2026-09-10 바뀜 : 예전에는 제품 이름을 **요청사항 칸에 대신 적어** 두었습니다.
       손님이 하고 싶은 말을 적을 자리를 우리가 먼저 차지한 셈이었고,
       칸이 이미 펼쳐졌는데 「+ 요청사항 남기기」 단추가 그대로 남아 있었습니다.
       이제 고른 제품은 위에 접힌 칸으로 따로 보여 주고(js/dh-pick.js),
       요청사항은 손님 몫으로 비워 둡니다. 시트에는 보낼 때 한 칸에 함께 적힙니다. */
  function 견적받기() {
    if (typeof window.렌탈신청창열기 !== 'function') return;
    if (typeof window.고른제품담기 === 'function') {
      var 약 = 고름('약정'), 관 = 고름('관리 방식');
      var 결 = (약 && 관)
        ? 셈부품.셈(p, 약, 관, 고름('지금 쓰는 정수기') === '있어요') : null;
      window.고른제품담기([{
        사진: p.사진, 브랜드: p.브랜드, 이름: p.이름, 모델: p.모델,
        조건: [약 && 약.replace(' 약정', ''), 관 && 셈부품.짧게(관)].filter(Boolean).join(' · '),
        값: 결 ? { 기본: 결.기본, 프모: 결.값, 카드: 결.카드 } : {}
      }]);
    }
    window.렌탈신청창열기();
  }

  /* ── 제휴카드 창 ───────────────────────────────────── */
  var 만든카드창 = false;
  function 카드창열기() {
    var 카 = (window.제휴카드자료 || {})[p.코드];
    var 창 = document.getElementById('카드창'), 몸 = document.getElementById('카드몸통');
    if (!카 || !창 || !몸) return;
    넣기('카드제목', p.브랜드 + ' 제휴카드');
    넣기('카드모델', 카.기준 + ' 기준 최대 ' + 셈부품.돈(카.깎을돈) + '원 할인');
    if (!만든카드창) {
      /* 카드사 안내를 그림으로 받아 둔 브랜드는 그림을, 글자로 받아 둔 브랜드는
         글자 표를 보여 줍니다. 글자 쪽이 폰에서 읽기 편합니다. */
      몸.innerHTML = (카.그림 && 카.그림.length)
        ? 카.그림.map(function (c, i) {
            var 번호 = (c[0] < 10 ? '0' : '') + c[0];
            return '<img src="' + 밑동 + 'img/card/card-' + 막(p.코드) + '-' + 번호 + '.jpg"' +
                   ' width="' + c[1] + '" height="' + c[2] + '"' +
                   ' loading="' + (i < 1 ? 'eager' : 'lazy') + '"' +
                   ' alt="' + 막(p.브랜드 + ' 제휴카드 안내 ' + (i + 1)) + '">';
          }).join('')
        : 카드글표(카);
      만든카드창 = true;
    }
    몸.scrollTop = 0;
    창.classList.add('open');
    document.body.classList.add('pop-open');
    var 닫 = document.getElementById('카드닫기');
    if (닫) 닫.focus();
  }
  function 카드글표(카) {
    if (!카.줄 || !카.줄.length) return '';
    return '<div class="card-text">' +
      (카.카드 ? '<p class="card-name">' + 막(카.카드) + '</p>' : '') +
      '<table><thead><tr>' +
        (카.줄머리 || ['구분', '할인']).map(function (h) {
          return '<th scope="col">' + 막(h) + '</th>';
        }).join('') +
      '</tr></thead><tbody>' +
        카.줄.map(function (r) {
          return '<tr><th scope="row">' + 막(r[0]) + '</th><td>' + 막(r[1]) + '</td></tr>';
        }).join('') +
      '</tbody></table>' +
      (카.꼬리 ? '<p class="card-tail">' + 막(카.꼬리) + '</p>' : '') +
      '</div>';
  }

  function 카드창닫기() {
    var 창 = document.getElementById('카드창');
    if (창) 창.classList.remove('open');
    document.body.classList.remove('pop-open');
  }

  /* ── 눌림 받기 ─────────────────────────────────────── */
  function 달기() {
    document.addEventListener('click', function (e) {
      var 색 = e.target.closest('.it-color');
      if (색) {
        var 색칸 = 색.parentElement;
        [].forEach.call(색칸.children, function (x) {
          x.setAttribute('aria-pressed', x === 색 ? 'true' : 'false');
        });
        var 이름칸 = document.querySelector('.it-color-name');
        if (이름칸) 이름칸.textContent = 색.getAttribute('data-이름');
        return;
      }
      var 옵 = e.target.closest('.it-opt');
      if (옵) {
        var 옵칸 = 옵.parentElement;
        [].forEach.call(옵칸.children, function (x) {
          x.setAttribute('aria-pressed', x === 옵 ? 'true' : 'false');
        });
        다시셈();
        return;
      }
      if (e.target.closest('#카드열기')) { 카드창열기(); return; }
      if (e.target.closest('#카드닫기')) { 카드창닫기(); return; }
      var 카창 = document.getElementById('카드창');
      if (카창 && e.target === 카창) { 카드창닫기(); return; }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var 창 = document.getElementById('카드창');
      if (창 && 창.classList.contains('open')) 카드창닫기();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', 그리기);
  else 그리기();
})();
