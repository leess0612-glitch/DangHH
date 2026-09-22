/* ══════════════════════════════════════════════════════════════════════
   신청칸 「통화 희망 시간」 · dh-callhope.js  (2026-09-21 새로 만듦)

   ★ 무엇을 하나
     ① 신청칸의 「+ 요청사항 남기기」 바로 위에 통화 희망 시간 고르기(드롭다운)를 끼워 넣습니다.
        안 고르면(「가능한 빨리」) 지금까지와 똑같이 접수됩니다.
     ② 고른 시간은 시트 「요청사항」 칸 **맨 윗줄**에 이렇게 적힙니다.
          [통화] 9/22(화) 오후 3시 30분~4시 30분
          (그 아래에 제품 줄 [선택]·손님 글 [요청]이 옵니다)
        「직접 적기」를 고르고 글을 쓰면 맨 윗줄은 [통화] 요청사항 참고 가 됩니다(2026-09-21 v2).
        ★손님 글에는 **늘** [요청] 이 붙습니다(v2). 알림톡 프로그램이 [통화]·[선택] 줄을 읽는데,
          손님이 "[선택] 아무거나"라고 써도 사이트가 적은 줄과 헷갈리지 않게 하려는 것입니다.
          읽는 쪽 규칙: 맨 위에서부터 [요청] 줄이 나오기 전까지만 사이트가 적은 줄이다.
     ③ 신청이 끝나면 완료창 문구를 바꿉니다 — "○○에 1600-4670 번호로 전화드립니다".
        업무시간 밖이면 다음 영업일 여는 시각을 알려 줍니다.

   ⛔ 왜 만들었나 (2026-09-21 사장님과 분석)
     홈페이지 신청 손님은 부재가 33%(카톡 5%·전화 6%). 업무시간 밖 신청은 47%.
     손님들이 요청사항에 "통화는 5시 이후에"처럼 직접 적어 오는데, 칸이 접혀 있어 거의 안 쓰였다.

   ★ 시간표 — 사장님 확인(2026-09-21)
     평일 9:00~18:00, 점심 12:30~13:30 / 토 10:00~14:00, 점심 없음 / 일·공휴일 쉼
     고를 수 있는 구간은 1시간 단위이고, 마감 무렵 약속은 어기기 쉬워 평일은 17:30 에서 끊었다.
     ⚠ 이 시간이 바뀌면 아래 「구간」 표를 고칩니다. 문자 프로그램(이삭줍기발송\schedule.py)과는 별개입니다.

   ★ 공휴일 — 안티그라비티\공휴일저장.json (매일 새로 받는 것)의 2026·2027년을 옮겨 적었다.
     ⚠ 2027년 12월 전에 2028년을 넣어야 합니다. 없으면 2028년 공휴일에도 "내일 전화드립니다"가 뜹니다.

   ★ 네 신청칸(메인·렌탈·코웨이용 렌탈·공용 js/dh-apply.js)이 이 파일의 이름 넷을 부릅니다.
       dh통화칸넣기()      칸을 끼워 넣거나, 이미 있으면 목록을 지금 시각으로 새로 만든다
       dh통화붙이기(memo)  보내기 직전 요청사항 글 앞에 [통화] 줄을 붙여 돌려준다
       dh통화완료()        완료창 문구를 바꾼다
       dh통화비우기()      「다른 번호로 추가 신청」 때 처음 상태로 돌린다
     이 파일이 안 실려도 네 신청칸은 예전 그대로 움직입니다(이름이 없으면 건너뜀).

   ★ 렌탈·코웨이용 렌탈 화면의 컴퓨터 아래 입력칸 띠는 이름 셋을 따로 부릅니다 (2026-09-22 더함).
       dh통화띠넣기()      띠의 고르기 칸(#deskCallTime, 화면 HTML 에 이미 있음)에 시간 목록을 채운다
       dh통화띠줄()        보낼 [통화] 줄. 안 골랐거나 「가능한 빨리」면 빈 글
                           — 그때 띠는 요청사항을 아예 보내지 않는다(예전과 같은 접수)
       dh통화띠완료()      띠의 완료 문구(#deskSuccess)를 바꾼다
     띠에는 요청사항 칸이 없어 「직접 적기」를 넣지 않고, 칸 이름표 대신 회색 「통화 희망 시간 (선택)」이 보입니다.
     띠 목록에서는 모레 이후 날짜를 「10/12(월)」처럼 짧게 적습니다(칸 폭을 줄이려고, 2026-09-22 사장님 지시).
     「오늘」·「내일(수)」와 완료 문구는 위 신청칸과 같은 모양 그대로입니다.
     시간 목록·완료 문구는 위 신청칸과 **같은 함수**(목록글·안내줄)로 만듭니다 — 한 곳만 고치면 둘 다 바뀝니다.

   ⚠ 구글 쪽(당현함_신청폼.gs)이 요청사항을 자르는 선: 2026-09-21 저녁부터 **1,000자**(전에는 200자).
     손님 글은 홈페이지에서 200자로 막고, 이 부품도 합친 글을 1,000자에서 끊습니다(v3).
     ⚠ 구글 쪽을 다시 200자로 되돌리면 이 부품도 v2 로 되돌려야 손님 글 끝이 안 잘립니다.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var 전체한도 = 1000;   // 구글 쪽 요청사항_최대 와 같게

  var 번호 = '1600-4670';

  /* 요일별 통화 구간 — [시작 분, 끝 분]. 0=일 … 6=토 */
  var 평일구간 = [[540, 600], [600, 660], [660, 750], [810, 870], [870, 930], [930, 990], [990, 1050]];
  var 구간 = { 0: [], 1: 평일구간, 2: 평일구간, 3: 평일구간, 4: 평일구간, 5: 평일구간,
               6: [[600, 660], [660, 720], [720, 780], [780, 840]] };
  /* 상담을 받는 시간(완료창 '곧 전화드립니다' 판정용) */
  var 여는시간 = { 1: [540, 1080], 2: [540, 1080], 3: [540, 1080], 4: [540, 1080], 5: [540, 1080], 6: [600, 840] };
  var 앞당김 = 30;   // 지금부터 30분 안에 시작하는 구간은 목록에서 뺀다(「가능한 빨리」가 대신한다)

  var 공휴일 = {
    '20260101':1,'20260216':1,'20260217':1,'20260218':1,'20260301':1,'20260302':1,'20260501':1,'20260505':1,
    '20260524':1,'20260525':1,'20260603':1,'20260606':1,'20260717':1,'20260815':1,'20260817':1,'20260924':1,
    '20260925':1,'20260926':1,'20261003':1,'20261005':1,'20261009':1,'20261225':1,
    '20270101':1,'20270206':1,'20270207':1,'20270208':1,'20270209':1,'20270301':1,'20270501':1,'20270503':1,
    '20270505':1,'20270513':1,'20270606':1,'20270717':1,'20270719':1,'20270815':1,'20270816':1,'20270914':1,
    '20270915':1,'20270916':1,'20271003':1,'20271004':1,'20271009':1,'20271011':1,'20271225':1,'20271227':1
  };
  var 요일글 = ['일', '월', '화', '수', '목', '금', '토'];

  /* ── 한국 시각 — 손님 폰의 시간대 설정과 상관없이 한국 시각으로 셉니다 ── */
  function 지금() {
    var d = new Date(Date.now() + 9 * 3600 * 1000);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), w: d.getUTCDay(),
             분: d.getUTCHours() * 60 + d.getUTCMinutes() };
  }
  function 날짜더하기(날, 일수) {
    var d = new Date(Date.UTC(날.y, 날.m - 1, 날.d + 일수));
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), w: d.getUTCDay() };
  }
  function 날열쇠(날) { return '' + 날.y + (날.m < 10 ? '0' : '') + 날.m + (날.d < 10 ? '0' : '') + 날.d; }
  function 쉬는날(날) { return 날.w === 0 || !!공휴일[날열쇠(날)]; }
  function 다음영업일(날) {
    for (var i = 1; i <= 14; i++) {
      var 다음 = 날짜더하기(날, i);
      if (!쉬는날(다음)) return { 날: 다음, 며칠뒤: i };
    }
    return null;
  }

  /* ── 글자 만들기 ── */
  function 때글(분, 앞때) {
    var h = Math.floor(분 / 60), m = 분 % 60;
    var 때 = h < 12 ? '오전' : (h === 12 ? '낮' : '오후');
    var 시 = h > 12 ? h - 12 : h;
    var 글 = 시 + '시' + (m ? ' ' + m + '분' : '');
    return (때 === 앞때 ? '' : 때 + ' ') + 글;
  }
  function 때이름(분) { var h = Math.floor(분 / 60); return h < 12 ? '오전' : (h === 12 ? '낮' : '오후'); }
  function 구간글(칸) { return 때글(칸[0]) + '~' + 때글(칸[1], 때이름(칸[0])); }
  function 날부름(날, 며칠뒤) {
    if (며칠뒤 === 0) return '오늘';
    if (며칠뒤 === 1) return '내일(' + 요일글[날.w] + ')';
    return 날.m + '월 ' + 날.d + '일(' + 요일글[날.w] + ')';
  }
  function 시트날글(날) { return 날.m + '/' + 날.d + '(' + 요일글[날.w] + ')'; }

  /* ── 목록 만들기: 오늘 남은 구간 + 다음 영업일 구간 전부 ── */
  function 목록() {
    var 오늘 = 지금();
    var 줄 = [];
    if (!쉬는날(오늘)) {
      (구간[오늘.w] || []).forEach(function (칸) {
        if (칸[0] >= 오늘.분 + 앞당김) 줄.push({ 날: 오늘, 며칠뒤: 0, 칸: 칸 });
      });
    }
    var 다음 = 다음영업일(오늘);
    if (다음) {
      (구간[다음.날.w] || []).forEach(function (칸) { 줄.push({ 날: 다음.날, 며칠뒤: 다음.며칠뒤, 칸: 칸 }); });
    }
    return 줄;
  }
  function 값만들기(x) { return 날열쇠(x.날) + '-' + x.칸[0] + '-' + x.칸[1]; }
  function 값풀기(값) {
    var m = /^(\d{4})(\d{2})(\d{2})-(\d+)-(\d+)$/.exec(값 || '');
    if (!m) return null;
    var 날 = { y: +m[1], m: +m[2], d: +m[3] };
    날.w = new Date(Date.UTC(날.y, 날.m - 1, 날.d)).getUTCDay();
    return { 날: 날, 칸: [+m[4], +m[5]] };
  }
  /* 고른 구간이 이미 끝났나 (창을 열어 두고 한참 뒤에 누른 경우) */
  function 지났나(x) {
    var 오늘 = 지금(), 가 = 날열쇠(x.날), 나 = 날열쇠(오늘);
    if (가 !== 나) return 가 < 나;
    return x.칸[1] <= 오늘.분;
  }
  function 며칠뒤(날) {
    var 오늘 = 지금();
    for (var i = 0; i <= 14; i++) { if (날열쇠(날짜더하기(오늘, i)) === 날열쇠(날)) return i; }
    return 99;
  }

  /* ── 모양 — 위 이름·번호 칸과 똑같이 맞춘다 ── */
  function 모양넣기() {
    if (document.getElementById('dhCallStyle')) return;
    var s = document.createElement('style');
    s.id = 'dhCallStyle';
    s.textContent =
      '.form-group select.dh-call{width:100%;height:48px;padding:0 40px 0 16px;border:2px solid var(--border,#e5e7eb);' +
      'border-radius:8px;font-size:15px;font-family:"Pretendard Variable",Pretendard,sans-serif;color:var(--dark,#0F172A);' +
      'background:#fff url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%278%27%3E%3Cpath d=%27M1 1l5 5 5-5%27 fill=%27none%27 stroke=%27%23465368%27 stroke-width=%271.8%27/%3E%3C/svg%3E") no-repeat right 16px center;' +
      '-webkit-appearance:none;appearance:none;outline:none;cursor:pointer;transition:border-color .2s}' +
      '.form-group select.dh-call:focus{border-color:var(--primary,#1257C9)}' +
      '.dh-call-done{font-size:13px;color:var(--gray,#465368);margin-top:8px}';
    document.head.appendChild(s);
  }

  function 칸() { return document.getElementById('inputCallTime'); }

  /* 고르기 칸 안의 목록 글 — 위 신청칸과 아래 띠(2026-09-22)가 함께 쓴다.
     짧게 = 모레 이후 날짜를 「10/12(월)」로(아래 띠 전용 — 칸 폭을 줄이려고). 오늘·내일은 그대로 */
  function 목록글(처음, 직접포함, 짧게) {
    var html = 처음;
    목록().forEach(function (x) {
      var 날글 = (짧게 && x.며칠뒤 >= 2) ? 시트날글(x.날) : 날부름(x.날, x.며칠뒤);
      html += '<option value="' + 값만들기(x) + '">' + 날글 + ' ' + 구간글(x.칸) + '</option>';
    });
    if (직접포함) html += '<option value="write">직접 적기</option>';
    return html;
  }

  function 목록채우기() {
    var 고름 = 칸();
    if (!고름) return;
    var 전 = 고름.value;
    var html = 목록글('<option value="">가능한 빨리</option>', true);
    /* 목록이 그대로면 손대지 않는다 — 폰 선택창이 열리는 순간 바꾸면 깜빡이거나 닫힐 수 있다 */
    if (고름.__목록 === html) { 글자한도맞추기(); return; }
    고름.__목록 = html;
    고름.innerHTML = html;
    /* 전에 고른 것이 아직 목록에 있으면 그대로 둔다 */
    고름.value = 전;
    if (고름.value !== 전) 고름.value = '';
    글자한도맞추기();
  }

  var 직접표시 = '[통화] 요청사항 참고';
  var 요청머리 = '[요청] ';

  /* 고른 시간 → 시트에 적을 줄. 안 골랐거나 지났으면 빈 글.
     「직접 적기」는 손님이 요청사항에 글을 썼을 때만 표시를 남긴다(안 썼으면 거짓 표시가 되므로) */
  function 통화줄(고름, 손님글있음) {
    if (!고름) return '';
    if (고름.value === 'write') return 손님글있음 ? 직접표시 : '';
    var x = 값풀기(고름.value);
    if (!x || 지났나(x)) return '';
    return '[통화] ' + 시트날글(x.날) + ' ' + 구간글(x.칸);
  }
  /* 제품 고르기 부품(dh-pick.js)이 이번 신청에 제품 줄을 붙이는가 */
  function 제품있음() {
    try { return typeof window.고른제품 === 'function' && window.고른제품().length > 0; } catch (e) { return false; }
  }

  /* 손님 글은 늘 200자까지 (v3, 2026-09-21 저녁).
     v1·v2 는 구글이 요청사항 전체를 200자에서 잘라서, 시간을 고르면 손님 글 한도를 그만큼 줄여 보여 줬다.
     구글 한도를 1,000자로 올린 뒤로는 [통화]·[선택] 줄이 붙어도 손님 글이 잘리지 않으므로 줄이지 않는다. */
  var 손님글한도 = 200;
  function 글자한도맞추기() {
    var 글칸 = document.getElementById('inputMemo');
    var 셈 = document.getElementById('memoCount');
    if (!글칸) return;
    var 한도 = 손님글한도;
    글칸.maxLength = 한도;
    if (셈 && 셈.parentNode) {
      var 끝 = 셈.nextSibling;
      if (끝 && 끝.nodeType === 3) 끝.nodeValue = ' / ' + 한도 + '자';
      셈.textContent = 글칸.value.length;
      셈.parentNode.classList.toggle('over', 글칸.value.length >= 한도);
    }
  }

  window.dh통화칸넣기 = function () {
    if (칸()) { 목록채우기(); return; }
    var 기준 = document.getElementById('memoToggle');
    if (!기준 || !기준.parentNode) return;
    모양넣기();
    var 묶음 = document.createElement('div');
    묶음.className = 'form-group';
    묶음.id = 'callGroup';
    묶음.innerHTML = '<label for="inputCallTime">통화 희망 시간 <span style="font-size:12px;color:#8A9099;font-weight:600;">(선택)</span></label>' +
                     '<select id="inputCallTime" class="dh-call"></select>';
    기준.parentNode.insertBefore(묶음, 기준);
    var 고름 = 칸();
    /* 창을 열어 둔 채 시간이 흘러도 누르는 순간의 시각으로 목록을 다시 만든다 */
    ['focus', 'mousedown', 'touchstart'].forEach(function (e) {
      고름.addEventListener(e, 목록채우기, { passive: true });
    });
    고름.addEventListener('change', function () {
      if (고름.value === 'write') {
        if (typeof window.요청사항펴기 === 'function') window.요청사항펴기();
        var 글칸 = document.getElementById('inputMemo');
        if (글칸) { if (!글칸.value) 글칸.placeholder = '원하시는 통화 시간을 적어주세요'; 글칸.focus(); }
      }
      글자한도맞추기();
    });
    var 글칸 = document.getElementById('inputMemo');
    if (글칸) 글칸.addEventListener('input', 글자한도맞추기);
    목록채우기();
  };

  window.dh통화붙이기 = function (memo) {
    memo = String(memo == null ? '' : memo).trim();
    /* 제품 부품이 이미 [선택]·[요청] 으로 나눠 둔 글인가 — 부품에게 직접 물어서 가린다.
       (글이 [선택] 으로 시작하는지만 보면, 손님이 그렇게 쓴 글을 사이트 줄로 믿게 된다) */
    var 나눠짐 = 제품있음() && /^\[선택\]/.test(memo);
    var 몸 = 나눠짐 ? memo : (memo ? 요청머리 + memo : '');
    var 손님글있음 = 나눠짐 ? /(^|\n)\[요청\] \S/.test(memo) : !!memo;
    var 줄 = 통화줄(칸(), 손님글있음);
    var 합친 = 줄 ? (몸 ? 줄 + '\n' + 몸 : 줄) : 몸;
    return 합친.length > 전체한도 ? 합친.slice(0, 전체한도) : 합친;
  };

  /* 완료 안내 글 — 고른 시간(고름)을 보고 만든다. 줄바꿈 자리는 <br>.
     위 신청칸과 아래 띠(2026-09-22)가 함께 쓴다. 직접글있음 = 「직접 적기」를 고르고 요청사항을 썼나 */
  function 안내줄(고름, 직접글있음, 번호글) {
    var x = 고름 ? 값풀기(고름.value) : null;
    if (x && !지났나(x)) {
      return 날부름(x.날, 며칠뒤(x.날)) + ' ' + 구간글(x.칸) + '에<br>' + 번호글 + ' 번호로 전화드립니다.';
    }
    if (고름 && 고름.value === 'write' && 직접글있음) {
      return '남기신 시간에<br>' + 번호글 + ' 번호로 전화드립니다.';
    }
    var 오늘 = 지금(), 문 = 여는시간[오늘.w];
    if (!쉬는날(오늘) && 문 && 오늘.분 >= 문[0] && 오늘.분 < 문[1] - 30) {
      return 번호글 + ' 번호로<br>곧 전화드립니다.';
    }
    /* 업무시간 밖: 오늘 아직 안 열었으면 오늘, 아니면 다음 영업일 */
    var 날 = null, 뒤 = 0;
    if (!쉬는날(오늘) && 문 && 오늘.분 < 문[0]) { 날 = 오늘; 뒤 = 0; }
    else { var 다음 = 다음영업일(오늘); if (다음) { 날 = 다음.날; 뒤 = 다음.며칠뒤; } }
    return 날
      ? '지금은 상담 시간이 아닙니다.<br>' + 날부름(날, 뒤) + ' ' + 때글(여는시간[날.w][0]) + ' 이후<br>' + 번호글 + ' 번호로 전화드립니다.'
      : 번호글 + ' 번호로 전화드립니다.';
  }

  window.dh통화완료 = function () {
    var 문단 = document.querySelector('#formSuccess p');
    if (!문단) return;
    var 번호글 = '<strong style="color:var(--primary,#1257C9);font-size:17px;">' + 번호 + '</strong>';
    var 첫줄 = 안내줄(칸(), !!(document.getElementById('inputMemo') || {}).value, 번호글);
    문단.innerHTML = 첫줄 + '<span class="dh-call-done" style="display:block;">먼저 연락하셔도 됩니다.</span>';
  };

  window.dh통화비우기 = function () {
    var 고름 = 칸();
    if (고름) 고름.value = '';
    var 글칸 = document.getElementById('inputMemo');
    if (글칸) 글칸.placeholder = '남기실 말씀을 적어주세요';
    글자한도맞추기();
  };

  /* ══ 렌탈 화면 컴퓨터 아래 입력칸 띠 (2026-09-22 더함) ══
     띠에는 칸 이름표가 없어서, 고르기 전에는 옆 칸들처럼 회색 「통화 희망 시간 (선택)」이 보인다
     (그 줄은 목록을 펼치면 숨는다 — hidden). 고를 수 있는 시간은 위 신청칸과 같다.
     「가능한 빨리」는 값이 'asap' 이다 — 빈 값('')인 회색 줄과 구별해야, 목록을 새로 만들 때
     손님이 고른 「가능한 빨리」가 회색 줄로 되돌아가지 않는다. 둘 다 시트에는 아무것도 안 적힌다. */
  var 띠처음 = '<option value="" disabled hidden selected>통화 희망 시간 (선택)</option><option value="asap">가능한 빨리</option>';
  function 띠칸() { return document.getElementById('deskCallTime'); }
  function 띠빈칸표시(고름) { 고름.classList.toggle('dh-call-empty', !고름.value); }
  function 띠목록채우기() {
    var 고름 = 띠칸();
    if (!고름) return;
    var 전 = 고름.value;
    var html = 목록글(띠처음, false, true);
    /* 목록이 그대로면 손대지 않는다 — 선택창이 열리는 순간 바꾸면 깜빡이거나 닫힐 수 있다 */
    if (고름.__목록 !== html) {
      고름.__목록 = html;
      고름.innerHTML = html;
      고름.value = 전;
      if (고름.value !== 전) 고름.value = '';
    }
    띠빈칸표시(고름);
  }

  window.dh통화띠넣기 = function () {
    var 고름 = 띠칸();
    if (!고름) return;
    if (!고름.__이음) {
      고름.__이음 = true;
      /* 창을 열어 둔 채 시간이 흘러도 누르는 순간의 시각으로 목록을 다시 만든다 */
      ['focus', 'mousedown', 'touchstart'].forEach(function (e) {
        고름.addEventListener(e, 띠목록채우기, { passive: true });
      });
      고름.addEventListener('change', function () { 띠빈칸표시(고름); });
    }
    띠목록채우기();
  };

  window.dh통화띠줄 = function () {
    return 통화줄(띠칸(), false);
  };

  window.dh통화띠완료 = function () {
    var 문구칸 = document.getElementById('deskSuccess');
    if (!문구칸) return;
    var 줄 = 안내줄(띠칸(), false, '<strong>' + 번호 + '</strong>').replace(/<br>/g, ' ');
    문구칸.innerHTML = '✅ 신청 완료! ' + 줄 + ' <span class="dh-call-desk-more">먼저 연락하셔도 됩니다.</span>';
  };

  /* 신청칸이 이미 화면에 있으면(메인·렌탈) 바로 끼워 넣는다.
     공용 신청창(dh-apply.js)은 창을 처음 열 때 만들어지므로 그쪽에서 dh통화칸넣기()를 부른다. */
  window.dh통화칸넣기();
  window.dh통화띠넣기();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.dh통화칸넣기);
    document.addEventListener('DOMContentLoaded', window.dh통화띠넣기);
  }
})();
