/* ══════════════════════════════════════════════════════════════════════
   정수기 화면에서 「현금」 계열 낱말을 없앱니다 · dh-nocash.js  (2026-09-10)

   ⛔⛔ 왜 필요한가 — 코웨이 정책 (2026-09 수수료 정책 엑셀 맨 윗줄)
       「온라인 상, 현금 키워드 관련 노출된 내용 적발시 수수료는 지급되지 않습니다.
         (상시 모니터링)」
     정수기 목록에는 코웨이 42종이 이름·모델·사진까지 눈에 보이게 나옵니다.
     같은 화면에 현금 낱말이 있으면 그대로 걸립니다.

   ★ 그래서 정수기 화면(/water/)만 **현금 낱말 0** 으로 갑니다.
     인터넷 쪽(메인·요금표)은 지금처럼 현금을 그대로 씁니다.
     코웨이 전용 페이지(rental-c.html)가 이미 이 방식입니다 — 현금 계열 낱말 0번.

   ★ 공용 부품(js/dh-apply.js · js/dh-terms.js)은 **한 줄도 손대지 않습니다.**
     여기서는 창이 만들어진 뒤 **글자만 바꿔 끼웁니다.**
     이 파일을 부르지 않는 화면은 지금까지와 똑같이 움직입니다.

   ⚠ 막아야 할 낱말 15개 (렌탈대본 감시와 같은 목록)
     현금 지원금 지원비 상품권 페이백 캐시백 캐시 환급 사은금
     축하금 보상금 장려금 리베이트 입금 계좌이체
     「설치 당일」은 코웨이 페이지도 쓰는 말이라 그대로 둡니다.
   ★ 2026-09-11 — 「사은품」도 **「혜택」으로 통일**하라는 지시가 있었습니다.
     금지어라서가 아니라 정수기 화면의 말투를 하나로 맞추기 위해서입니다.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* 긴 말부터 바꿉니다 — 짧은 낱말을 먼저 바꾸면 문장이 어색해집니다 */
  var 바꿈표 = [
    ['놓친 지원금 무료 확인', '놓친 내 혜택 무료 확인'],   /* rental-c.html 이 쓰는 문구와 같게 */
    ['내 지원금', '내 혜택'],
    ['제시된 지원금', '제시된 혜택'],
    ['당일 현금 입금', '당일 혜택 지급'],
    ['추가 현금 받기', '추가 혜택 받기'],
    ['현금 사은품', '혜택'],
    ['지원금', '혜택'],
    ['지원비', '혜택'],
    ['현금', '혜택'],
    ['캐시백', '적립 혜택'],
    ['페이백', '적립 혜택'],
    ['캐시', '적립 혜택'],
    ['환급', '돌려드림'],
    ['상품권', '혜택'],
    ['사은금', '혜택'],
    ['축하금', '혜택'],
    ['보상금', '혜택'],
    ['장려금', '혜택'],
    ['리베이트', '혜택'],
    ['계좌이체', '지급'],
    ['입금', '지급'],
    /* ★ 2026-09-11 사장님 지시 — 「사은품」도 「혜택」으로 통일합니다 */
    ['사은품', '혜택'],
  ];
  /* 남아 있는지 검사할 때 쓰는 목록 */
  var 금지 = ['현금', '지원금', '지원비', '상품권', '페이백', '캐시백', '캐시', '환급',
              '사은금', '축하금', '보상금', '장려금', '리베이트', '입금', '계좌이체',
              '사은품'];   /* 사은품은 금지어가 아니라 사장님이 「혜택」으로 통일하신 말 */

  /* ★ 그대로 두어야 하는 말 — 바꾸기 전에 잠가 두었다가 끝나면 되돌립니다.
     ① 「사은품 혜택」을 그냥 두면 「사은품」→「혜택」 규칙에 걸려 **「혜택 혜택」**이 됩니다.
        사장님이 목록 화면에 그대로 쓰라고 하신 글이라 지켜야 합니다.
     ② ⛔⛔ 「코웨이는 현금지급을 하지 않습니다.」 — 목록 맨 아래 한 줄입니다.
        **현금이라는 낱말을 일부러 살려 둡니다.** 2026-09-11 사장님 지시이고,
        예전에 이 문장으로 해결해 보신 방법입니다.
        여기서 빼면 「코웨이는 사은품지급을 하지 않습니다」가 되어 **뜻이 뒤집힙니다**
        (코웨이도 사은품은 줍니다). 지우지 마십시오. */
  var 그대로 = ['사은품 혜택', '코웨이는 현금지급을 하지 않습니다'];
  var 자물쇠앞 = '\uE000', 자물쇠뒤 = '\uE001';

  function 고친글(s) {
    var t = s, i;
    for (i = 0; i < 그대로.length; i++) {
      if (t.indexOf(그대로[i]) >= 0) t = t.split(그대로[i]).join(자물쇠앞 + i + 자물쇠뒤);
    }
    for (i = 0; i < 바꿈표.length; i++) {
      if (t.indexOf(바꿈표[i][0]) >= 0) t = t.split(바꿈표[i][0]).join(바꿈표[i][1]);
    }
    for (i = 0; i < 그대로.length; i++) {
      t = t.split(자물쇠앞 + i + 자물쇠뒤).join(그대로[i]);
    }
    return t;
  }

  var 볼속성 = ['aria-label', 'placeholder', 'title', 'alt', 'value', 'content'];

  function 고치기(뿌리) {
    if (!뿌리 || !뿌리.nodeType) return;

    /* ① 글자 마디 */
    var 훑 = document.createTreeWalker(뿌리, NodeFilter.SHOW_TEXT, null);
    var 마디, 바꿀 = [];
    while ((마디 = 훑.nextNode())) {
      var 새 = 고친글(마디.nodeValue);
      if (새 !== 마디.nodeValue) 바꿀.push([마디, 새]);
    }
    바꿀.forEach(function (x) { x[0].nodeValue = x[1]; });

    /* ② 속성 (단추 이름표·안내 글 등) */
    var 것들 = 뿌리.querySelectorAll ? 뿌리.querySelectorAll('*') : [];
    [].forEach.call(것들, function (e) {
      볼속성.forEach(function (a) {
        var v = e.getAttribute && e.getAttribute(a);
        if (!v) return;
        var 새2 = 고친글(v);
        if (새2 !== v) e.setAttribute(a, 새2);
      });
    });
  }

  /* 창은 눌러야 만들어지고, 보내는 도중에 단추 글자가 바뀝니다.
     그래서 한 번 고치고 끝내지 않고 **바뀔 때마다** 다시 고칩니다. */
  var 예약 = null;
  function 곧고치기() {
    if (예약) return;
    예약 = setTimeout(function () { 예약 = null; 고치기(document.body); }, 0);
  }

  function 켜기() {
    고치기(document.body);
    if (!window.MutationObserver) return;
    new MutationObserver(function (기록) {
      for (var i = 0; i < 기록.length; i++) {
        var r = 기록[i];
        if (r.type === 'characterData' || r.addedNodes.length) { 곧고치기(); return; }
      }
    }).observe(document.body, {
      childList: true, subtree: true, characterData: true,
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', 켜기);
  } else { 켜기(); }

  /* 점검용 — 화면 어딘가에 금지 낱말이 남았는지 세어 봅니다.
     검사 프로그램이 부릅니다. 손님 화면에서는 아무 일도 하지 않습니다. */
  window.현금낱말검사 = function () {
    var 글 = document.body ? document.body.innerText : '';
    그대로.forEach(function (w) { 글 = 글.split(w).join(''); });   /* 지킨 말은 세지 않습니다 */
    var 남 = [];
    금지.forEach(function (w) {
      var n = 글.split(w).length - 1;
      if (n) 남.push(w + '×' + n);
    });
    return 남;
  };
})();
