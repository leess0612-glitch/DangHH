/* 제휴카드 — 브랜드별 파일을 읽어 모으는 공용 파일 (2026-10-02 만듦 · 2026-10-06 공개, 사장님 「공개해」)

   ★ 매달 고칠 곳은 **브랜드 파일 하나**뿐입니다 : js/card/<브랜드>.js
     (시험판은 js/card-test/ · water/제품/index-카드-test.html — gitignore)
     이 파일과 화면 400여 장은 건드리지 않습니다.

   ★ 판 번호(?v=)를 올리지 않아도 됩니다.
     브랜드 파일 주소 끝에 「지금 몇 시」를 붙여 부르므로, 고친 뒤 한 시간 안에
     모든 손님 화면에 새 값이 들어갑니다.

   ★ 「깎을돈」은 손으로 적지 않고 여기서 셉니다.
     전월 실적 **30만원 구간이 있는 카드** 가운데 「기본 + 프로모션」이 가장 큰 값입니다.
     (40만·50만원부터 시작하는 카드는 셈에서 뺍니다 — 실제로 쓰는 구간이 30만원이라서)

   ★ 프로모션 기간이 지나도 값은 그대로 둡니다(2026-10-02 사장님 지시 — 상담에서 안내).
     기간 안내 문구도 화면에 적지 않습니다.

   ★ 안내 창의 틀이 화면에 없으면 여기서 만들어 넣습니다(9/11 이후 화면에 빠져 있음). */
window.카드가림 = false;   /* true 로 바꾸면 9/11 처럼 「제휴카드 사용시 할인」 한 줄만 보입니다(가림판 사본: 작업 기록) */
window.제휴카드자료 = {};

(function () {
  var 브랜드들 = ['coway', 'sk', 'cuckoo', 'lg', 'chungho', 'qming', 'wells', 'ruhens'];

  function 돈(n) { return Number(n).toLocaleString('ko-KR'); }
  function 막(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* 브랜드 파일이 부르는 함수 */
  window.제휴카드넣기 = function (브랜드, 자료) {
    var 카드들 = (자료.카드 || []).map(function (c) {
      var 구간 = c.구간.map(function (g) {
        var 추가 = g[2] || 0;
        return { 실적: g[0], 기본: g[1], 추가: 추가, 합: g[1] + 추가 };
      });
      return { 이름: c.이름, 구간: 구간, 메모: c.메모 || '' };
    });

    var 깎을돈 = 0;
    카드들.forEach(function (c) {
      if (c.구간[0] && c.구간[0].실적 === 30) 깎을돈 = Math.max(깎을돈, c.구간[0].합);
    });
    /* 좋은 카드가 위로 — 30만원 구간 합계가 큰 순서, 30만원 구간이 없는 카드는 아래 */
    카드들.sort(function (a, b) {
      var x = a.구간[0].실적 === 30 ? a.구간[0].합 : -1;
      var y = b.구간[0].실적 === 30 ? b.구간[0].합 : -1;
      return y - x;
    });

    window.제휴카드자료[브랜드] = {
      깎을돈: 깎을돈,
      기준: '전월 30만원 이상',
      달: 자료.달,
      표: function () { return 표그리기(자료, 카드들); }
    };
  };

  function 표그리기(자료, 카드들) {
    var 머리 = '<p class="card-when">' + 막(자료.달) + ' 기준</p>';
    return '<div class="card-text">' + 머리 + 카드들.map(function (c) {
      var 추가있나 = c.구간.some(function (g) { return g.추가 > 0; });
      return '<div class="card-one">' +
        '<p class="card-name">' + 막(c.이름) + '</p>' +
        '<table><thead><tr><th scope="col">전월 실적</th>' +
          (추가있나 ? '<th scope="col">기본</th><th scope="col">프로모션</th>' : '') +
          '<th scope="col">월 할인</th></tr></thead><tbody>' +
        c.구간.map(function (g) {
          return '<tr><th scope="row">' + g.실적 + '만원 이상</th>' +
            (추가있나 ? '<td class="sub">' + 돈(g.기본) + '</td>' +
                        '<td class="sub">' + (g.추가 ? '+' + 돈(g.추가) : '–') + '</td>' : '') +
            '<td>' + 돈(g.합) + '원</td></tr>';
        }).join('') +
        '</tbody></table>' +
        (c.메모 ? '<p class="card-memo">' + 막(c.메모) + '</p>' : '') +
        '</div>';
    }).join('') +
    (자료.꼬리 ? '<p class="card-tail">' + 막(자료.꼬리) + '</p>' : '') +
    '</div>';
  }

  /* 부를 브랜드 — 제품 화면은 그 브랜드 하나, 목록·비교 화면은 전부 */
  var 길 = location.pathname.match(/\/water(?:-c)?\/([a-z]+)-/);
  var 부를 = (길 && 브랜드들.indexOf(길[1]) >= 0) ? [길[1]] : 브랜드들;
  var 나 = document.currentScript && document.currentScript.src;
  var 폴더 = 나 ? 나.replace(/[^\/]*$/, '') + 'card/' : 'js/card/';
  var 시각 = Math.floor(Date.now() / 3600000);
  부를.forEach(function (b) {
    document.write('<script src="' + 폴더 + b + '.js?h=' + 시각 + '"><\/script>');
  });

  /* 안내 창 틀 + 표 꾸밈 (라이브로 옮길 때 꾸밈은 css/dh-item3.css 로) */
  document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('카드창')) {
      var 틀 = document.createElement('div');
      틀.className = 'pop'; 틀.id = '카드창';
      틀.setAttribute('role', 'dialog'); 틀.setAttribute('aria-modal', 'true');
      틀.setAttribute('aria-labelledby', '카드제목');
      틀.innerHTML = '<div class="pop-box"><div class="pop-head"><div>' +
        '<h3 id="카드제목">제휴카드</h3><p id="카드모델"></p></div>' +
        '<button type="button" class="pop-close" id="카드닫기" aria-label="닫기">✕</button></div>' +
        '<div class="pop-body" id="카드몸통"></div>' +
        '<p class="pop-note">카드사·전월 실적에 따라 할인 금액이 다릅니다. 발급과 등록은 상담에서 도와드립니다.</p></div>';
      document.body.appendChild(틀);
    }
    var 꾸밈 = document.createElement('style');
    꾸밈.textContent =
      '.card-when{margin:0 0 16px;font-size:var(--t-min);color:var(--c-sub)}' +
      '.card-one{margin:0 0 24px}.card-one:last-of-type{margin-bottom:8px}' +
      '.card-one .card-name{margin-bottom:6px}' +
      '#카드몸통 .card-one tbody th[scope="row"]{width:auto}' +
      '#카드몸통 .card-text td{text-align:right;white-space:nowrap}' +
      '#카드몸통 .card-text thead th:not(:first-child){text-align:right}' +
      '#카드몸통 .card-text td.sub{font-weight:500;color:var(--c-sub)}' +
      '.card-memo{margin:6px 0 0;font-size:var(--t-min);line-height:var(--lh-min);color:var(--c-sub)}' +
      '#카드창 .pop-note{margin:0;padding:12px 20px 16px;border-top:1px solid var(--c-line);' +
        'font-size:var(--t-min);line-height:var(--lh-min);color:var(--c-sub)}';
    document.head.appendChild(꾸밈);
  });
})();
