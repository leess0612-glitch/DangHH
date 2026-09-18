/* ══════════════════════════════════════════════════════════════════════
   발바닥(푸터) 공용 부품 · dh-footer.js   (2026-09-18 사장님 지시)
   ──────────────────────────────────────────────────────────────────────
   ⛔ 왜 만들었나
     발바닥 글이 화면 417장에 그대로 박혀 있어서, 한 줄을 고치려면 417장을 고쳐야 했습니다.
     게다가 화면마다 문장이 달랐습니다(첫 화면 쪽 / 렌탈·정수기 쪽).
     이제 **이 파일 한 곳만 고치면 모든 화면의 발바닥이 바뀝니다.**

   ★ 화면 html 에는 빈 자리만 둡니다 —  <footer data-dh-footer></footer>
     이 부품이 그 안을 채웁니다. 자리가 없으면 본문 끝에 새로 답니다.

   ★ 아래 고정 띠(신청 막대·비교함 띠)와 겹치지 않게, 띠 높이만큼 발바닥 아래 여백을 줍니다.
     띠는 화면마다 높이가 다르고 나중에 나타나기도 해서, 값을 재서 맞춥니다.

   ⚠ 정수기 화면은 js/dh-nocash.js 가 「사은품」을 「혜택」으로 바꿉니다.
     발바닥의 「코웨이는 사은품 등 별도 혜택으로 제공됩니다.」는 그 파일의 「그대로 둘 말」에
     넣어 두었습니다(2026-09-18 사장님 지시 — 첫 화면에 보이는 그대로).
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 여기만 고치면 모든 화면이 바뀝니다 ───────────────────────── */
  var 회사 = {
    이름: '유진텔레콤',
    대표: '조성현',
    등록번호: '291-40-00301',
    주소: '경상남도 함안군 산인면 송산로 122, 2층 201호(은혜벌)',
    전화: '1600-4670'
  };
  var 고지 = [
    '당현함은 KT, SKT, LG U+ 공식 파트너로서 인터넷 가입 및 가전렌탈 서비스를 제공합니다.',
    '제시된 요금 및 지원금은 약정 조건에 따라 변경될 수 있으며, 정확한 내용은 상담을 통해 안내드립니다.',
    '코웨이는 사은품 등 별도 혜택으로 제공됩니다.',
    '© 2026 당현함. All rights reserved.'
  ];

  function 막(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* 여기서 사이트 꼭대기까지 몇 단계인가 — /water/coway-x/ 면 '../../' */
  function 밑동() {
    var 조각 = (location.pathname || '/').replace(/^\/+/, '').split('/');
    var 끝 = 조각[조각.length - 1];
    if (끝 === '' || 끝.indexOf('.') >= 0) 조각.pop();
    return 조각.map(function () { return '../'; }).join('');
  }

  function 약관링크(글, 이름) {
    /* 개인정보처리방침·이용약관은 대부분 화면에서 창으로 뜹니다(js/dh-terms.js).
       그 부품이 없는 화면에서는 해당 화면으로 보냅니다. */
    if (typeof window[이름] === 'function') {
      return '<a href="javascript:void(0)" onclick="' + 이름 + '()">' + 막(글) + '</a>';
    }
    return '<a href="' + 밑동() + (이름 === 'openPrivacy' ? 'privacy.html' : 'terms.html') + '">' + 막(글) + '</a>';
  }

  function 속() {
    return '<div class="footer-inner">' +
      '<div class="footer-top">' +
        '<div class="footer-logo">' +
          '<svg class="footer-mark" width="21" height="14" viewBox="25.6 68 246.4 162.4" aria-hidden="true">' +
          '<use href="#dh-logo" fill="currentColor"/></svg><span>당현함</span>' +
        '</div>' +
        '<div class="footer-links">' +
          약관링크('개인정보처리방침', 'openPrivacy') +
          약관링크('서비스이용약관', 'openTerms') +
          '<a href="tel:' + 막(회사.전화) + '">' + 막(회사.전화) + '</a>' +
        '</div>' +
      '</div>' +
      '<div class="footer-info" style="font-size:13px;">' +
        '<strong style="color:rgba(255,255,255,0.8);">' + 막(회사.이름) + '</strong> | 대표: ' + 막(회사.대표) +
        ' | 사업자등록번호: ' + 막(회사.등록번호) + '<br>' +
        '주소: ' + 막(회사.주소) + ' | 대표번호: ' + 막(회사.전화) +
      '</div>' +
      '<div class="footer-disclaimer">' + 고지.map(막).join('<br>') + '</div>' +
    '</div>';
  }

  /* ── 아래 고정 띠와 겹치지 않게 ────────────────────────────────
     신청 막대(.mobile-cta-bar)·정수기 띠(.bar3)·비교함 띠(.cmp-bar)는 화면 아래에 떠 있습니다.
     발바닥 마지막 줄이 그 밑에 깔리지 않도록, 띠 높이만큼 발바닥 아래에 여백을 줍니다. */
  function 띠높이() {
    var 후보 = ['.mobile-cta-bar', '.bar3', '.cmp-bar', '.desk-cta-bar'];
    var 최대 = 0;
    for (var i = 0; i < 후보.length; i++) {
      var 들 = document.querySelectorAll(후보[i]);
      for (var j = 0; j < 들.length; j++) {
        var e = 들[j], s = window.getComputedStyle(e);
        if (s.display === 'none' || s.visibility === 'hidden' || s.position !== 'fixed') continue;
        var r = e.getBoundingClientRect();
        if (r.height > 최대 && r.bottom > window.innerHeight - 4) 최대 = r.height;
      }
    }
    return Math.round(최대);
  }

  function 여백맞추기(발) {
    var h = 띠높이();
    발.style.paddingBottom = h ? (h + 16) + 'px' : '';
  }

  function 그리기() {
    var 발 = document.querySelector('footer');
    if (!발) {
      발 = document.createElement('footer');
      document.body.appendChild(발);
    }
    발.innerHTML = 속();
    여백맞추기(발);
    window.addEventListener('resize', function () { 여백맞추기(발); });
    /* 띠는 스크롤 도중 나타나기도 합니다 — 몇 번 더 재 맞춥니다 */
    var n = 0;
    var 되풀이 = setInterval(function () {
      여백맞추기(발);
      if (++n > 6) clearInterval(되풀이);
    }, 700);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', 그리기);
  else 그리기();
})();
