/* ══════════════════════════════════════════════════════════════════════
   검색칸 · dh-find.js  (2026-09-18 라이브, 인잘알 방식)
   ──────────────────────────────────────────────────────────────────────
   2026-09-28 — 사장님 지시로 **컴퓨터에서도** 나오게 했습니다. 자리가 둘입니다.

     · 폰(폭 768 이하)  → **로고 오른쪽** (2026-09-18부터 쓰던 자리)
     · 컴퓨터(769 이상) → **거르개 줄 가운데** (「관리 유형」과 「인기순」 사이)
     · 창 폭이 바뀌면 그때그때 알맞은 자리로 **옮겨 다닙니다**
     · 거르개 줄(.filter-row)이 없는 화면에서는 컴퓨터일 때 **안 나옵니다**
       (메인·렌탈처럼 메뉴가 그 자리를 쓰는 화면입니다)

   ⚠ 칸은 **하나만** 만들고 자리를 옮깁니다. 두 개를 만들면 한쪽에 친 글자가
     다른 쪽에 안 남아 손님이 헷갈립니다.
   ⚠ 컴퓨터 쪽 높이 44 는 알약(--h-touch)과 **같은 값**입니다. 다르게 두면 줄이 삐뚤어집니다.

   그 밖의 동작(2026-09-18부터 그대로)
   · 회색 둥근 칸 + 왼쪽 돋보기 + 글씨가 있으면 오른쪽에 지우기(✕) — 인잘알과 같은 모양입니다.
   · 정수기 목록에서는 치는 대로 걸러집니다(198개 전부에서 찾습니다 — 「더 보기」를 먼저 다 펼칩니다).
   · 다른 화면에서 엔터를 치면 그 말에 맞는 화면으로 넘어갑니다
       비데·공기청정기 같은 가전 낱말 -> 가전 렌탈 화면(/appliance/)
       그 밖의 말                     -> 정수기 목록(지금까지와 같음)
     어느 말이 어디로 가는지는 아래 「갈곳표」 한 곳에 있습니다.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var 모양 =
    /* 공통 — 어느 자리에 있든 같은 모양입니다 */
    '#찾기칸{display:none;position:relative;min-width:0}' +
    '#찾기칸 input{width:100%;border:0;border-radius:999px;background:#F1F3F5;' +
      'font-family:"Pretendard Variable",Pretendard,system-ui,sans-serif;font-weight:600;line-height:1;' +
      'color:#0F172A;outline:none;box-sizing:border-box}' +   /* 2026-09-23 보드 값으로 맞춤 */
    '#찾기칸 input::placeholder{color:#8A9099;font-weight:500}' +
    '#찾기칸 input:focus{background:#fff;box-shadow:0 0 0 1.5px #1257C9 inset}' +
    '#찾기칸 .돋보기{position:absolute;top:50%;transform:translateY(-50%);color:#8A9099;' +
      'pointer-events:none;display:flex}' +
    '#찾기칸 .지우기{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:20px;height:20px;' +
      'border:0;border-radius:999px;background:#C6CBD2;color:#fff;font:700 11px/1 inherit;cursor:pointer;' +
      'display:none;align-items:center;justify-content:center;padding:0}' +
    '#찾기칸.글씨있음 .지우기{display:flex}' +

    /* ① 폰 — 로고 오른쪽. 로고는 줄지 않고 검색칸이 남은 폭을 다 가져갑니다 */
    '@media(max-width:768px){' +
      '#찾기칸.머리자리{display:block;flex:1 1 auto;margin-left:10px}' +
      '#찾기칸.머리자리 input{height:36px;padding:0 32px 0 34px;font-size:14px}' +
      '#찾기칸.머리자리 .돋보기{left:11px}' +
      'header .header-inner .logo{flex:none}' +
    '}' +

    /* ② 컴퓨터 — 거르개 줄 가운데.
       ⚠ 최소 폭 180 을 두어, 좁은 노트북에서는 눌리지 않고 아랫줄로 내려가게 했습니다. */
    '@media(min-width:769px){' +
      '#찾기칸.거르개자리{display:block;flex:1 1 180px;max-width:320px;margin:0 8px}' +
      '#찾기칸.거르개자리 input{height:44px;padding:0 36px 0 40px;font-size:15px}' +
      '#찾기칸.거르개자리 .돋보기{left:14px}' +
    '}';

  /* 정수기 목록은 두 벌입니다 — 일반(water/)과 코웨이판(water-c/).
     ⚠ 지금 화면 주소만 보면 안 됩니다. 사은품명단처럼 어느 쪽도 아닌 화면에서 찾으면
       코웨이 문으로 들어온 손님도 일반 목록으로 빠졌습니다(2026-09-18 실측).
       그래서 들어온 문 기억(js/dh-inflow.js)도 함께 봅니다.
       ※ dh-inflow.js 를 먼저 부르므로 window.dhDoor 가 이미 있습니다. 없으면 그냥 일반으로 갑니다. */
  function 물칸() {
    if (location.pathname.indexOf('/water-c/') >= 0) return 'water-c/';
    try { if (window.dhDoor && window.dhDoor.지금() === 'coway') return 'water-c/'; } catch (e) {}
    return 'water/';
  }

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

  /* ══════════════ 목록에서 찾기 (2026-09-28 사장님 지시로 고침) ══════════════

     ① 무엇을 보고 찾는가
        ⛔ **요금 글자는 보지 않습니다.** 요금에 든 숫자 때문에 「아이콘3」이
          거의 모든 제품에 걸렸습니다. 보는 곳은 네 군데뿐입니다.
            .li-tags  반값 배지      .li-brand  브랜드·모델
            .li-name  제품 이름      .li-fn     기능
          (짜임새가 바뀌어 네 곳을 못 찾으면 예전처럼 줄 전체 글자를 봅니다)

     ② 어떻게 맞다고 보는가 — 셋 중 하나만 맞으면 나옵니다
          ㉮ 글자가 붙어 있음            「아이콘」 → 아이콘 정수기 3
          ㉯ 낱말을 건너뛰며 이어 붙임   「아이콘3」 → 아이콘 (정수기) 3
          ㉰ 딴이름표로 한글↔영어        「메가아이스」 → MEGA ICE
        ㉮ 는 예전 방식 그대로입니다. 지금 되던 것은 그대로 됩니다.
     ════════════════════════════════════════════════════════════════════ */
  var 볼곳 = '.li-tags,.li-brand,.li-name,.li-fn';

  /* ── 딴이름표 : 화면에 영어로 적힌 이름을 한글로도 찾게 합니다 ──────────
     ★ 영어가 든 제품 이름이 198종 가운데 51종입니다.
       새 제품에 영어 이름이 생기면 **이 표에 한 줄만** 더하면 됩니다.
         [ 화면에 적힌 영어, [ 손님이 칠 법한 한글… ] ]
       맨 앞 한글이 대표입니다(낱말 잇기에 씁니다). 나머지는 붙여 찾기에만 씁니다.
     ⚠ **긴 것을 위에** 둡니다. 'tota max' 가 'tota' 보다, 'ais' 가 'ai' 보다 위여야 합니다.
     ⚠ 낱말 통째로 맞을 때만 바꿉니다. 그러지 않으면 모델명 속 글자까지 바뀝니다. */
  var 딴이름 = [
    ['mega ice', ['메가아이스', '메가']],
    ['tota max', ['토타맥스']],
    ['tota r',   ['토타알']],
    ['annie',    ['애니']],
    ['green41',  ['그린41']],
    ['the m',    ['더엠', '디엠']],
    ['tidy',     ['타이디']],
    ['lite',     ['라이트']],
    ['plus',     ['플러스']],
    ['mini',     ['미니']],
    ['ais',      ['아이스']],
    ['ice',      ['아이스']],
    ['new',      ['뉴']],
    ['psg',      ['피에스지']],
    ['tota',     ['토타']],
    ['ro',       ['알오', '역삼투']],
    ['uf',       ['유에프']],
    ['uv',       ['유브이', '자외선']],
    ['ai',       ['에이아이']],
    ['fs',       ['에프에스']]
  ];
  var 딴이름칼 = 딴이름.map(function (짝) {
    return { 자: new RegExp('(^|[^a-z0-9])' + 짝[0] + '([^a-z0-9]|$)', 'g'), 영: 짝[0], 한: 짝[1] };
  });

  /* ── 브랜드 딴이름 : 「엘지」·「쿠쿠」처럼 손님이 부르는 말로도 찾게 합니다 ──────
     ★ 화면에 이 말이 있으면 오른쪽 말들을 **덧붙여** 둡니다. 브랜드가 늘면 한 줄 더합니다.
     ⚠ 위 딴이름표와 달리 **낱말 통째**가 아니라 글자만 들어 있으면 됩니다(브랜드라 헷갈릴 일이 적습니다). */
  var 브랜드딴이름 = [
    ['코웨이',  ['coway', '코웨이']],
    ['sk매직',  ['skmagic', '에스케이매직', '에스케이', '매직']],
    ['쿠쿠',    ['cuckoo', '쿠쿠']],
    ['lg',      ['엘지', 'lg']],
    ['청호',    ['chungho', '청호']],
    ['웰스',    ['wells', '웰스']],
    ['루헨스',  ['ruhens', '루헨스']],
    ['큐밍',    ['qming', 'hyundai', '큐밍']]
  ];

  /* ── 숫자를 한글로도 읽습니다 (2026-09-28) ────────────────────────────
     「제로100」을 손님은 「제로백」이라고 부릅니다. 「스팀100」도 「스팀백」입니다.
     ★ 숫자만으로 된 낱말에만 씁니다. 모델명 속 숫자(7220 등)는 표에 없어 그대로 둡니다.
     ★ 새로 필요한 읽기가 생기면 이 표에 한 줄 더하면 됩니다. */
  var 숫자읽기 = {
    '100': '백', '200': '이백', '300': '삼백', '400': '사백', '450': '사백오십',
    '500': '오백', '550': '오백오십', '600': '육백', '700': '칠백', '1000': '천',
    '2': '투', '3': '쓰리', '15': '십오', '41': '사십일'
  };

  /* 글을 낱말로 쪼갭니다.
     ⚠ 빈칸·괄호뿐 아니라 **글씨 갈래가 바뀌는 곳**도 끊습니다.
       · 영어↔한글 — 「SK매직」이 한 덩이로 남으면 「sk 메가」를 못 찾습니다
       · 영어↔숫자 — 「제로100S」를 「제로 100 s」로 끊어야 「제로백」이 걸립니다
       (둘 다 2026-09-28 시험에서 잡은 것입니다) */
  function 쪼개기(글) {
    return 글.replace(/([0-9a-z])([가-힣])/g, '$1 $2')
             .replace(/([가-힣])([0-9a-z])/g, '$1 $2')
             .replace(/([0-9])([a-z])/g, '$1 $2')
             .replace(/([a-z])([0-9])/g, '$1 $2')
             .split(/[^0-9a-z가-힣]+/)
             .filter(function (x) { return x; });
  }

  /* 숫자 낱말 뒤에 한글 읽기를 끼워 넣습니다 — 「제로 100 백 s」처럼 둘 다 남깁니다 */
  function 숫자도한글로(말들) {
    var 새 = [], 바뀜 = false;
    for (var i = 0; i < 말들.length; i++) {
      새.push(말들[i]);
      var 읽 = 숫자읽기[말들[i]];
      if (읽) { 새.push(읽); 바뀜 = true; }
    }
    return 바뀜 ? 새 : null;
  }

  /* ── 색깔별 모델코드 : 견적서에 적힌 코드로도 찾게 합니다 (2026-09-29) ──────
     LG 는 **같은 제품이라도 색깔마다 코드가 다릅니다**. 뒤에 붙는 글자가 색입니다
     (WD724R + K=블랙 / H=화이트 / E=베이지). 화면에는 공통 토막만 적으므로,
     손님이 견적서의 `WD724RK` 를 그대로 치면 아무것도 안 나왔습니다.
     ★ 왼쪽 = 화면에 적힌 코드, 오른쪽 = **우리가 파는 색**의 실제 코드.
       안 파는 색은 넣지 않습니다(엉뚱한 색을 파는 것처럼 보이면 안 됩니다).
       근거 : 2026년 9월 LG 구독전문점 정책 파일. 새 달 파일에서 코드가 바뀌면 여기도 고칩니다.
     ⚠ 짝짓기는 화면에 적힌 코드가 **통째로 맞을 때만** 합니다(.li-brand 의 맨 끝).
       그러지 않으면 WU923A 표가 WU923AS(다른 제품)에도 붙습니다. */
  var 색깔코드 = [
    ['wd724r',   'wd724rk|wd724rh|wd724re'],
    ['wd723r',   'wd723rk|wd723re'],
    ['wd722r',   'wd722rk|wd722rh|wd722re'],
    ['wu923a',   'wu923acb|wu923awb|wu923anb|wu923abb'],
    ['wu523a',   'wu523acb|wu523awb'],
    ['wd524v',   'wd524vct|wd524vht|wd524vst'],
    ['wd523v',   'wd523vct|wd523vht'],
    ['wd525a',   'wd525acb|wd525agb'],
    /* WD323AWB · WD520VCT 는 파는 색이 하나뿐이라 **화면에 온전한 코드를 적었습니다.**
       그래서 따로 딴이름을 둘 것이 없습니다 (2026-09-29 표기 통일). */
    ['wd220m',   'wd220mcb|wd220mnb|wd221mcb|wd221mnb'],
    ['wd120m',   'wd120mcb|wd120mnb|wd121mcb|wd121mnb']
  ];

  /* 이 줄이 어느 제품인지 보고, 그 제품의 색깔별 코드를 덧붙여 줍니다 */
  function 색깔코드덧(줄) {
    var 브칸 = 줄.querySelector && 줄.querySelector('.li-brand');
    if (!브칸) return '';
    var 적힌 = (브칸.textContent || '').toLowerCase().replace(/[^0-9a-z]/g, '');
    for (var c = 0; c < 색깔코드.length; c++) {
      var 끝 = 색깔코드[c][0];
      if (적힌.length >= 끝.length && 적힌.slice(-끝.length) === 끝) return '|' + 색깔코드[c][1];
    }
    return '';
  }

  /* 줄 하나의 「찾을 거리」를 한 번만 만들어 둡니다 — 한 글자 칠 때마다 다시 만들지 않습니다 */
  function 찾을거리(줄) {
    if (줄.dh찾) return 줄.dh찾;
    var 칸들 = 줄.querySelectorAll(볼곳), 글 = '';
    if (칸들.length) {
      for (var i = 0; i < 칸들.length; i++) 글 += ' ' + (칸들[i].textContent || '');
    } else {
      글 = 줄.textContent || '';
    }
    var 소 = 글.toLowerCase();
    var 말들 = 쪼개기(소);

    var 한 = 소, 덤 = [];
    for (var j = 0; j < 딴이름칼.length; j++) {
      var ㅈ = 딴이름칼[j];
      ㅈ.자.lastIndex = 0;
      if (!ㅈ.자.test(한)) continue;
      ㅈ.자.lastIndex = 0;
      /* ⚠ 한글만 남기면 「엘지 AI」처럼 **한글과 영어를 섞어 치는 것**을 못 찾습니다.
         한글을 앞에 두고 영어도 함께 남깁니다 (2026-09-28 시험에서 잡음). */
      한 = 한.replace(ㅈ.자, (function (한글, 영어) {
        return function (m, 앞, 뒤) { return 앞 + ' ' + 한글 + ' ' + 영어 + ' ' + 뒤; };
      })(ㅈ.한.join(' '), ㅈ.영));
      for (var k = 1; k < ㅈ.한.length; k++) 덤.push(ㅈ.한[k]);
    }
    var 한글말들 = (한 === 소) ? null : 쪼개기(한);

    /* 브랜드 딴이름은 **맨 앞**에 붙입니다 — 화면에서도 브랜드가 맨 앞이라
       「엘지 오브제」처럼 이어 붙여 찾을 때 차례가 맞습니다 */
    var 앞 = [];
    for (var b = 0; b < 브랜드딴이름.length; b++) {
      if (소.indexOf(브랜드딴이름[b][0]) >= 0) 앞 = 앞.concat(브랜드딴이름[b][1]);
    }
    if (앞.length) 한글말들 = 앞.concat(한글말들 || 말들);

    /* 숫자 한글 읽기 — 「제로100」을 「제로백」으로도 찾게 합니다 */
    var 숫한 = 숫자도한글로(한글말들 || 말들);
    if (숫한) 한글말들 = 숫한;

    /* 붙여 찾기용 — 덩이를 막대로 끊어 이어 붙입니다(덩이를 걸치는 헛맞음을 막습니다) */
    줄.dh찾 = {
      붙은: 말들.join('') + '|' + (한글말들 ? 한글말들.join('') : '') + '|' + 덤.join('') + 색깔코드덧(줄),
      말들: 말들,
      한글말들: 한글말들
    };
    return 줄.dh찾;
  }

  /* 낱말을 건너뛰며 이어 붙여 봅니다 — 「아이콘3」이 「아이콘 정수기 3」에 걸립니다.
     ⚠ 낱말의 **처음부터** 맞을 때만 인정합니다. 가운데부터는 붙여 찾기로만 걸립니다
       (그러지 않으면 「이콘」 같은 조각이 아무 데나 걸려 목록이 헐렁해집니다). */
  function 이어맞나(찾, 말들) {
    var i = 0;
    for (var w = 0; w < 말들.length && i < 찾.length; w++) {
      var 낱 = 말들[w];
      if (찾.indexOf(낱, i) === i) { i += 낱.length; continue; }
      if (낱.indexOf(찾.slice(i)) === 0) return true;   /* 마지막 조각이 낱말 앞부분과 맞음 */
    }
    return i >= 찾.length;
  }

  function 걸리나(찾, 거리) {
    if (거리.붙은.indexOf(찾) >= 0) return true;
    if (이어맞나(찾, 거리.말들)) return true;
    return !!(거리.한글말들 && 이어맞나(찾, 거리.한글말들));
  }

  function 목록거르기(말) {
    var 칸 = document.getElementById('제품칸');
    if (!칸) return;
    /* ⚠ 찾는 말도 낱말 쪼개기와 **같은 잣대**로 다듬습니다.
       빈칸만 지우던 예전 방식으로 두었더니 「CHP-7220」의 줄표가 남아
       되던 모델명 찾기가 안 됐습니다 (2026-09-28 시험에서 잡음). */
    var 찾 = 말.toLowerCase().replace(/[^0-9a-z가-힣]+/g, '');
    var 줄들 = 칸.querySelectorAll('.li-item');
    for (var i = 0; i < 줄들.length; i++) {
      줄들[i].style.display = (!찾 || 걸리나(찾, 찾을거리(줄들[i]))) ? '' : 'none';
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

  /* ── 자리 옮기기 (2026-09-28) ─────────────────────────────────────────
     ⚠ 옮길 때 글자와 기능은 그대로 따라갑니다(같은 칸을 움직이는 것이라).
       다만 글자 깜빡이는 자리(포커스)는 풀립니다 — 창 폭을 바꿀 때만이라 괜찮습니다. */
  var 폰 = window.matchMedia('(max-width:768px)');

  function 자리잡기() {
    var 칸 = document.getElementById('찾기칸');
    if (!칸) return;
    var 거르개줄 = document.querySelector('.filter-row');
    var 머리 = document.querySelector('header .header-inner');

    if (!폰.matches && 거르개줄) {
      if (칸.parentNode !== 거르개줄) {
        var 정렬 = 거르개줄.querySelector('.sort-box');   /* 「인기순」 바로 앞에 끼웁니다 */
        if (정렬) 거르개줄.insertBefore(칸, 정렬);
        else 거르개줄.appendChild(칸);
      }
      칸.classList.remove('머리자리');
      칸.classList.add('거르개자리');
    } else if (머리) {
      if (칸.parentNode !== 머리) {
        var 로고 = 머리.querySelector('.logo');
        if (로고 && 로고.nextSibling) 머리.insertBefore(칸, 로고.nextSibling);
        else 머리.appendChild(칸);
      }
      칸.classList.remove('거르개자리');
      칸.classList.add('머리자리');
    }
  }

  function 달기() {
    var 머리 = document.querySelector('header .header-inner');
    if (!머리 || document.getElementById('찾기칸')) return;
    var st = document.createElement('style'); st.textContent = 모양; document.head.appendChild(st);

    var 칸 = document.createElement('div');
    칸.id = '찾기칸';
    칸.innerHTML =
      '<span class="돋보기"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/>' +
        '<path d="M20 20l-3.6-3.6"/></svg></span>' +
      '<input type="text" placeholder="제품·모델명 검색" aria-label="제품 찾기">' +
      '<button type="button" class="지우기" aria-label="지우기">✕</button>';
    머리.appendChild(칸);
    자리잡기();

    /* 창 폭이 바뀌면 자리를 다시 잡습니다 (폰을 돌려 세울 때도 걸립니다)
       ⚠ 두 가지를 함께 듣습니다. matchMedia 의 change 만 걸어 두면 **안 걸리는 경우가 있습니다**
         (2026-09-28 시험 중 실제로 놓쳤습니다). 창 크기 바뀜도 같이 듣습니다.
         자리잡기()는 이미 제자리면 아무것도 안 하므로 여러 번 불려도 괜찮습니다. */
    if (폰.addEventListener) 폰.addEventListener('change', 자리잡기);
    else if (폰.addListener) 폰.addListener(자리잡기);
    var 기다림 = 0;
    window.addEventListener('resize', function () {
      clearTimeout(기다림);
      기다림 = setTimeout(자리잡기, 120);
    });

    var 입력 = 칸.querySelector('input'), 지움 = 칸.querySelector('.지우기');
    function 상태() { 칸.classList.toggle('글씨있음', !!입력.value); }
    입력.addEventListener('input', function () { 상태(); 펼치고찾기(입력.value, 12); });
    입력.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      if (document.getElementById('제품칸')) { 펼치고찾기(입력.value, 12); return; }
      location.href = 밑동() + 갈곳(입력.value) + '?q=' + encodeURIComponent(입력.value);
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
