/* ══════════════════════════════════════════════════════════════════════
   당현함 AI 상담 창 · js/dh-aichat.js  (2026-11-06 처음 만듦)

   정수기 화면에 「AI 상담」 단추를 띄우고, 누르면 대화창이 열립니다.
   부르는 법: <script src="../js/dh-aichat.js?v=3" defer></script>  (다른 공용 파일처럼 한 줄)
   ★ AI 열쇠는 여기 없습니다 — 중간 다리(danghh-ai.danghh.workers.dev)가 갖고 있습니다.
   ★ 요금 숫자는 AI 가 아니라 사이트 계산기(dh-calc3.js) 셈으로 미리 만든 자료에서 옵니다.
   ★ 크레딧 부족·하루 상한·장애 때는 다리가 {쉼, 말} 을 보내고, 여기서는 오류 글자 없이
     「상담원 연결」 단추만 보여 줍니다.
   ★ 질문마다 클라우드플레어 Turnstile(보이지 않는 사람 확인) 표를 받아 다리로 보냅니다. AI 답의 서명은 받은 그대로 돌려보냅니다.
   대화는 이 탭 안에서만 기억합니다(다른 정수기 화면으로 넘어가도 이어짐, 탭 닫으면 사라짐).
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__dhAiChat) return;
  window.__dhAiChat = true;

  var 다리 = 'https://danghh-ai.danghh.workers.dev/chat';
  var 카톡 = 'https://pf.kakao.com/_yxgTAs';
  var 전화 = '1600-4670';
  var 저장열쇠 = 'dh-aichat-v2';   /* v2: 화면 HTML 대신 글 자료로 저장(11/6) */

  /* ── 모양 ── 디자인보드 값 이름표(--c-*)를 쓰고, 없으면 같은 색으로 */
  var 모양 = [
    '.dhai-fab{position:fixed;right:16px;bottom:calc(16px + var(--dhai-bar,0px) + env(safe-area-inset-bottom,0px));z-index:960;display:flex;align-items:center;gap:7px;',
    'height:48px;padding:0 18px 0 14px;border:0;border-radius:999px;background:var(--c-strong,#1257C9);color:#fff;font:700 15px/1 inherit;font-family:inherit;',
    'box-shadow:0 8px 24px -6px rgba(18,87,201,.55);cursor:pointer;-webkit-tap-highlight-color:transparent}',
    '.dhai-fab:active{transform:scale(.97)}',
    '.dhai-fab svg{width:22px;height:22px;flex:none}',
    '.dhai-fab[hidden]{display:none}',
    '.dhai-panel{position:fixed;right:16px;bottom:calc(16px + var(--dhai-bar,0px));z-index:1000;width:400px;max-width:calc(100vw - 32px);height:min(640px,calc(100vh - 100px));',
    'margin:0;padding:0;box-sizing:border-box;background:#fff;border-radius:16px;box-shadow:0 18px 48px -12px rgba(15,23,42,.35);display:flex;flex-direction:column;overflow:hidden;color:var(--c-body,#191F28);font-family:inherit}',
    '.dhai-panel[hidden]{display:none}',
    '.dhai-panel *,.dhai-panel *::before,.dhai-panel *::after{box-sizing:border-box}',
    '@media (max-width:640px){.dhai-panel{right:0;left:0;bottom:0;top:0;width:auto;max-width:none;height:auto;border-radius:0}}',
    '.dhai-head{display:flex;align-items:center;gap:10px;padding:12px 12px 12px 16px;border-bottom:1px solid var(--c-line,#EEEFF3);flex:none}',
    '.dhai-face{width:32px;height:32px;border-radius:50%;background:var(--c-strong,#1257C9);color:#fff;font-weight:800;font-size:14px;display:flex;align-items:center;justify-content:center;flex:none}',
    '.dhai-title{flex:1;min-width:0}.dhai-title b{display:block;font-size:16px;color:var(--c-title,#191F28)}.dhai-title span{font-size:12px;color:var(--c-sub,#4E5968)}',
    '.dhai-hbtn{border:0;background:none;color:var(--c-sub,#4E5968);font:inherit;font-size:13px;padding:8px;border-radius:8px;cursor:pointer}',
    '.dhai-hbtn:hover{background:#F2F4F6}',
    '.dhai-x{font-size:22px;line-height:1;padding:4px 10px}',
    '.dhai-body{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:12px;background:#F7F8FA;overscroll-behavior:contain}',
    '.dhai-me{align-self:flex-end;max-width:85%;background:var(--c-strong,#1257C9);color:#fff;padding:10px 13px;border-radius:14px 14px 4px 14px;white-space:pre-wrap;word-break:keep-all;overflow-wrap:anywhere;font-size:15px;line-height:1.55}',
    '.dhai-ai{align-self:flex-start;max-width:100%;width:100%;background:#fff;border:1px solid var(--c-line,#EEEFF3);padding:12px 13px;border-radius:4px 14px 14px 14px;font-size:15px;line-height:1.65;word-break:keep-all;overflow-wrap:anywhere}',
    '.dhai-ai p{margin:0 0 7px}.dhai-ai p:last-child{margin-bottom:0}.dhai-ai ul{margin:4px 0 7px;padding-left:18px}.dhai-ai li{margin:2px 0}',
    '.dhai-ai a{color:var(--c-strong,#1257C9)}',
    '.dhai-ai table{border-collapse:collapse;margin:7px 0;font-size:13px;display:block;overflow-x:auto;max-width:100%}',
    '.dhai-ai th,.dhai-ai td{border:1px solid var(--c-line,#EEEFF3);padding:5px 7px;text-align:left;vertical-align:top;background:#fff}',
    '.dhai-ai th{background:var(--c-strong-bg,#EAF2FE);white-space:nowrap}',
    '.dhai-q{font-weight:700;margin:2px 0}.dhai-hint{font-size:13px;color:var(--c-sub,#4E5968);margin:2px 0 4px}.dhai-picked{font-size:13px;color:var(--c-sub,#4E5968);margin-bottom:6px}',
    '.dhai-chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px}',
    '.dhai-chips button{border:1px solid #D1D6DB;background:#fff;color:var(--c-body,#191F28);border-radius:999px;padding:8px 14px;font:inherit;font-size:14px;cursor:pointer}',
    '.dhai-chips button:hover{border-color:var(--c-strong,#1257C9);color:var(--c-strong,#1257C9)}',
    '.dhai-links{display:flex;gap:14px;margin-top:10px}.dhai-links button{border:0;background:none;padding:0;font:inherit;font-size:13px;color:var(--c-sub,#4E5968);text-decoration:underline;cursor:pointer}',
    '.dhai-wait{align-self:flex-start;background:#fff;border:1px solid var(--c-line,#EEEFF3);border-radius:4px 14px 14px 14px;padding:12px 14px;display:flex;align-items:center;gap:10px;font-size:14px;color:var(--c-strong,#1257C9);font-weight:700}',
    '.dhai-dots{display:inline-flex;gap:4px}.dhai-dots i{width:6px;height:6px;border-radius:50%;background:currentColor;animation:dhai-b 1s infinite ease-in-out}',
    '.dhai-dots i:nth-child(2){animation-delay:.15s}.dhai-dots i:nth-child(3){animation-delay:.3s}',
    '@keyframes dhai-b{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}',
    '@media (prefers-reduced-motion:reduce){.dhai-dots i{animation:none}}',
    '.dhai-cards{display:flex;gap:8px;overflow-x:auto;margin:10px -2px 2px;padding:0 2px 4px}',
    '.dhai-card{flex:none;width:176px;background:#fff;border:1px solid var(--c-line,#EEEFF3);border-radius:12px;overflow:hidden;display:flex;flex-direction:column}',
    '.dhai-card img{width:100%;height:118px;object-fit:contain;background:#fff;border-bottom:1px solid var(--c-line,#EEEFF3)}',
    '.dhai-cb{padding:8px 10px;display:flex;flex-direction:column;gap:2px;flex:1;font-size:13px;line-height:1.45}',
    '.dhai-brand{color:var(--c-sub,#4E5968);font-size:12px}.dhai-name{font-weight:700;word-break:keep-all}.dhai-model{color:var(--c-dim,#8B95A1);font-size:11px}',
    '.dhai-price{margin-top:4px;font-weight:800;color:var(--c-strong,#1257C9);font-size:15px}.dhai-price small{font-weight:400;color:var(--c-sub,#4E5968);font-size:11px}',
    '.dhai-opt{display:flex;flex-wrap:wrap;gap:3px;margin-top:4px}',
    '.dhai-opt button{border:1px solid var(--c-line,#EEEFF3);background:#fff;color:var(--c-sub,#4E5968);border-radius:5px;padding:2px 6px;font:inherit;font-size:11px;cursor:pointer}',
    '.dhai-opt button.on{border-color:var(--c-strong,#1257C9);background:var(--c-strong-bg,#EAF2FE);color:var(--c-strong,#1257C9);font-weight:700}',
    '.dhai-rounds{margin:5px 0 2px;border:1px solid var(--c-line,#EEEFF3);border-radius:6px;overflow:hidden;font-size:11.5px}',
    '.dhai-rounds div{display:flex;justify-content:space-between;gap:6px;padding:3px 7px}.dhai-rounds div+div{border-top:1px solid var(--c-line,#EEEFF3)}',
    '.dhai-rounds div:first-child{background:var(--c-strong-bg,#EAF2FE)}.dhai-rounds span{color:var(--c-sub,#4E5968);white-space:nowrap}.dhai-rounds b{white-space:nowrap}',
    '.dhai-note{color:var(--c-sub,#4E5968);font-size:11px}',
    '.dhai-cbtn{display:flex;flex-direction:column;gap:5px;padding:0 10px 10px}',
    '.dhai-cbtn a,.dhai-cbtn button{font:inherit;font-size:13px;border-radius:8px;padding:8px 0;text-align:center;cursor:pointer;text-decoration:none}',
    '.dhai-cbtn a{border:1px solid var(--c-line,#EEEFF3);color:var(--c-body,#191F28);background:#fff}',
    '.dhai-cbtn button{border:0;background:var(--c-strong,#1257C9);color:#fff;font-weight:700}',
    '.dhai-act{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}',
    '.dhai-act button,.dhai-act a{font:inherit;font-size:13.5px;font-weight:700;border-radius:8px;padding:9px 13px;text-decoration:none;cursor:pointer;border:0}',
    '.dhai-act .ap{background:var(--c-strong,#1257C9);color:#fff}.dhai-act .kk{background:var(--c-kakao,#FEE500);color:#191919}.dhai-act .tel{background:#fff;color:var(--c-body,#191F28);border:1px solid var(--c-line,#EEEFF3)}',
    '.dhai-warn{margin-top:8px;font-size:11.5px;line-height:1.5;color:var(--c-dim,#8B95A1)}',
    '.dhai-foot{flex:none;border-top:1px solid var(--c-line,#EEEFF3);padding:10px 12px calc(10px + env(safe-area-inset-bottom,0px));display:flex;gap:8px;background:#fff}',
    '.dhai-foot textarea{flex:1;resize:none;height:44px;max-height:110px;border:1px solid #D1D6DB;border-radius:10px;padding:11px 12px;font:inherit;font-size:16px;line-height:1.3;background:#fff;color:var(--c-body,#191F28)}',
    '.dhai-foot textarea:focus{outline:2px solid var(--c-strong,#1257C9);outline-offset:-1px;border-color:transparent}',
    '.dhai-send{flex:none;border:0;border-radius:10px;padding:0 16px;background:var(--c-strong,#1257C9);color:#fff;font:inherit;font-weight:700;font-size:15px;cursor:pointer}',
    '.dhai-send:disabled{background:#B0B8C1;cursor:default}'
  ].join('');

  function 이스케이프(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function 돈(n) { return Number(n).toLocaleString('ko-KR'); }
  function 줄꾸밈(s) {
    s = 이스케이프(s);
    /* 링크는 danghh.com 안쪽 주소만 — 「danghh.com.다른곳」「danghh.com@다른곳」은 링크로 안 만듦(11/6 보안 점검) */
    s = s.replace(/\[([^\]]+)\]\((https:\/\/danghh\.com(?:\/[^)\s]*)?)\)/g, '<a href="$2">$1</a>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    return s;
  }
  /* AI 답(마크다운 일부: 표·목록·굵게·제목)을 화면 글로 */
  function 꾸미기(글) {
    var 줄들 = String(글 || '').split('\n'), 밖 = [], i, 표, 목, 행;
    for (i = 0; i < 줄들.length; i++) {
      var 줄 = 줄들[i];
      if (/^\s*\|/.test(줄)) {
        표 = [];
        while (i < 줄들.length && /^\s*\|/.test(줄들[i])) 표.push(줄들[i++]);
        i--;
        행 = 표.filter(function (r) { return !/^\s*\|?\s*:?-{2,}/.test(r); }).map(function (r) {
          return r.trim().replace(/^\||\|$/g, '').split('|').map(function (c) { return 줄꾸밈(c.trim()); });
        });
        밖.push('<table>' + 행.map(function (r, n) { return '<tr>' + r.map(function (c) { return n ? '<td>' + c + '</td>' : '<th>' + c + '</th>'; }).join('') + '</tr>'; }).join('') + '</table>');
      } else if (/^\s*[-*]\s+/.test(줄)) {
        목 = [];
        while (i < 줄들.length && /^\s*[-*]\s+/.test(줄들[i])) 목.push(줄들[i++].replace(/^\s*[-*]\s+/, ''));
        i--;
        밖.push('<ul>' + 목.map(function (x) { return '<li>' + 줄꾸밈(x) + '</li>'; }).join('') + '</ul>');
      } else if (/^#{1,4}\s/.test(줄)) {
        밖.push('<p><b>' + 줄꾸밈(줄.replace(/^#+\s/, '')) + '</b></p>');
      } else if (줄.trim()) {
        밖.push('<p>' + 줄꾸밈(줄) + '</p>');
      }
    }
    return 밖.join('');
  }

  /* ── 상태 ── 탭 안에서만 기억(sessionStorage). 화면 HTML 이 아니라 「글 자료」만 저장했다가 다시 그립니다(11/6 보안 점검).
     기록 항목: {종류:'me', 글} · {종류:'ai', 답, 카드, 질문, 고름:[카드마다 고른 약정·관리]} · {종류:'쉼', 말, 질문} */
  function 새상태() { return { 대화: [], 기록: [], 도우미: { 답: {}, 끝: false }, 번호: Date.now().toString(36) + Math.random().toString(36).slice(2, 8) }; }
  var 상태 = 새상태();
  try { var 옛 = JSON.parse(sessionStorage.getItem(저장열쇠) || 'null'); if (옛 && Array.isArray(옛.대화) && Array.isArray(옛.기록)) 상태 = 옛; } catch (e) { /* 기억 없이 */ }
  function 기억() { try { sessionStorage.setItem(저장열쇠, JSON.stringify(상태)); } catch (e) { /* 무시 */ } }

  /* ── 사람 확인(Turnstile, 보이지 않음) ── 질문마다 새 표를 받아 다리에 같이 보냅니다 */
  var 시험설정 = window.DH_AICHAT_TEST || null;           /* 내 PC 시험 사이트만 넣어 줌. 라이브에는 없음 */
  var 사이트키 = 시험설정 ? 시험설정.사이트키 : '0x4AAAAAAF17Fb8QqLgCtfPz';
  var 표상자 = null, 표번호 = null, 표대기 = null, 표불러옴 = null;
  function 표장치() {
    if (표불러옴) return 표불러옴;
    표불러옴 = new Promise(function (풀, 막) {
      if (window.turnstile) return 풀();
      var s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true; s.onload = function () { 풀(); }; s.onerror = function () { 표불러옴 = null; 막(new Error('표 장치')); };
      document.head.appendChild(s);
    });
    return 표불러옴;
  }
  function 표받기() {
    return 표장치().then(function () {
      return new Promise(function (풀, 막) {
        var 시계 = setTimeout(function () { 표대기 = null; 막(new Error('표 시간 초과')); }, 15000);
        표대기 = function (표) { clearTimeout(시계); 표대기 = null; 풀(표); };
        if (표번호 == null) {
          표상자 = document.createElement('div'); 표상자.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden';
          document.body.appendChild(표상자);
          표번호 = window.turnstile.render(표상자, { sitekey: 사이트키, size: 'invisible', execution: 'execute',
            callback: function (t) { if (표대기) 표대기(t); },
            'error-callback': function (코드) { if (표대기) { clearTimeout(시계); 표대기 = null; var e = new Error('표 오류'); e.코드 = 코드; 막(e); } return true; } });
        } else {
          window.turnstile.reset(표번호);
        }
        window.turnstile.execute(표번호);
      });
    });
  }

  /* ── 처음 고르기 단추 ── AI 를 부르지 않습니다(비용 0). 다 고르면 한 문장으로 묶어 보냅니다 */
  var 물음 = {
    품목: { 물음: '어떤 상담이 필요하세요?', 고름: ['정수기', '인터넷·TV', '둘 다'] },
    기능: { 물음: '어떤 물이 필요하세요?', 고름: ['냉수·온수·정수', '냉수·정수', '정수만', '얼음까지', '잘 모르겠어요'] },
    관리: { 물음: '필터 관리는 어떻게 할까요?', 풀이: '방문 관리는 기사님이 주기마다 와서 갈아 드리고, 셀프 관리는 필터를 택배로 받아 직접 갈아요.', 고름: ['방문 관리', '셀프 관리', '상관없어요'] },
    타사: { 물음: '지금 다른 회사 정수기를 렌탈로 쓰고 계세요?', 풀이: '쓰고 계시면 타사보상 요금과도 비교해 드려요.', 고름: ['네, 쓰고 있어요', '아니요'] },
    통신사: { 물음: '휴대폰은 어느 통신사 쓰세요?', 풀이: '휴대폰과 같은 통신사로 묶으면 결합 할인이 붙을 수 있어요.', 고름: ['KT', 'SK', 'LG U+', '알뜰폰·기타'] },
    구성: { 물음: '무엇이 필요하세요?', 고름: ['인터넷만', '인터넷+TV'] }
  };
  function 순서(답) {
    var 순 = ['품목'];
    if (답.품목 && 답.품목 !== '인터넷·TV') 순.push('기능', '관리', '타사');
    if (답.품목 && 답.품목 !== '정수기') 순.push('통신사', '구성');
    return 순;
  }
  function 묶은글(답) {
    var 글 = [];
    if (답.품목 !== '인터넷·TV') {
      var 물 = { '냉수·온수·정수': '냉수·온수·정수 되는 걸로', '냉수·정수': '냉수·정수 되는 걸로', '정수만': '정수만 되는 걸로', '얼음까지': '얼음 나오는 걸로' }[답.기능];
      var 관 = { '방문 관리': '방문 관리 원해요.', '셀프 관리': '셀프 관리 원해요.', '상관없어요': '관리 방식은 상관없어요.' }[답.관리];
      글.push('정수기 찾고 있어요.', 물 ? 물 + ', ' + 관 : 관,
        답.타사 === '네, 쓰고 있어요' ? '지금 다른 회사 정수기를 렌탈로 쓰고 있어요.' : '지금 쓰는 렌탈 정수기는 없어요.');
    }
    if (답.품목 !== '정수기') {
      var 폰 = 답.통신사 === '알뜰폰·기타' ? '휴대폰은 알뜰폰(또는 기타 통신사)이고' : 답.통신사 + ' 휴대폰 쓰는데';
      글.push(폰 + ' ' + (답.구성 === '인터넷+TV' ? '인터넷이랑 TV 같이' : '인터넷만') + ' 알아보고 싶어요.');
    }
    글.push('맞는 걸로 추천해 주세요.');
    return 글.join(' ');
  }
  function 도우미글() {
    if (상태.도우미.끝 || 상태.기록.length) return '';
    var 답 = 상태.도우미.답, 다음 = 순서(답).filter(function (k) { return !(k in 답); })[0];
    if (!다음) return '';
    var q = 물음[다음], 고른 = Object.keys(답).map(function (k) { return 답[k]; });
    return '<div class="dhai-ai">' +
      (고른.length ? '<div class="dhai-picked">고른 것: ' + 고른.map(이스케이프).join(' · ') + '</div>'
                   : '<p>안녕하세요, 당현함 AI 상담이에요. 몇 가지만 고르시면 맞는 상품을 찾아 드려요. 궁금한 걸 바로 적으셔도 돼요.</p>' +
                     '<p class="dhai-hint">이름·전화번호 같은 개인정보는 적지 말아 주세요. 질문은 답을 만드는 데만 쓰고 30일 뒤 지웁니다. <a href="https://danghh.com/privacy.html" target="_blank" rel="noopener">개인정보처리방침</a></p>') +
      '<div class="dhai-q">' + 이스케이프(q.물음) + '</div>' + (q.풀이 ? '<div class="dhai-hint">' + 이스케이프(q.풀이) + '</div>' : '') +
      '<div class="dhai-chips">' + q.고름.map(function (x) { return '<button type="button" data-dhai-key="' + 다음 + '" data-dhai-val="' + 이스케이프(x) + '">' + 이스케이프(x) + '</button>'; }).join('') + '</div>' +
      '<div class="dhai-links">' + (고른.length ? '<button type="button" data-dhai-back>이전으로</button><button type="button" data-dhai-reset>처음부터</button>' : '') + '<button type="button" data-dhai-skip>직접 물어볼게요</button></div></div>';
  }

  /* ── 제품 카드 ── 약정·관리 단추로 회차별 월 요금 줄을 바꿔 봅니다. 고른 것은 기록 항목(고름)에 남아 다른 화면에서도 그대로 */
  var 카드보관 = {};
  function 짧은약정(s) { return String(s).replace(' 약정', ''); }
  function 답의약정(답) {
    var 수 = {}, m, re = /([3-7])\s*년/g;
    while ((m = re.exec(String(답 || '')))) 수[m[1] + '년 약정'] = (수[m[1] + '년 약정'] || 0) + 1;
    return Object.keys(수).sort(function (a, b) { return 수[b] - 수[a]; });
  }
  function 첫조합(c, 답, 관리무시) {
    var 조 = c.조합 || {}, 원약정 = 답의약정(답).filter(function (약) { return 조[약]; })[0];
    var 약정들 = 원약정 ? [원약정] : Object.keys(조);
    var 원관리 = 관리무시 ? null : { '방문 관리': /^방문/, '셀프 관리': /^셀프/ }[상태.도우미.답.관리];
    var 타사원함 = 상태.도우미.답.타사 === '네, 쓰고 있어요';
    var 고른 = null;
    약정들.forEach(function (약) {
      Object.keys(조[약]).forEach(function (관) {
        if (원관리 && !원관리.test(관)) return;
        var 가들 = 조[약][관], 가 = 타사원함 && 가들.타사보상 ? '타사보상' : '신규';
        if (!가들[가]) return;
        /* 첫 달이 아니라 의무약정 기간 전체로 고릅니다(화면에는 평균을 보이지 않음) */
        var 줄 = 가들[가].줄, 평균 = 줄.reduce(function (s, r) { return s + (r[1] - r[0] + 1) * r[2]; }, 0) / 줄[줄.length - 1][1];
        if (!고른 || 평균 < 고른.평균) 고른 = { 약정: 약, 관리: 관, 가입: 가, 평균: 평균 };
      });
    });
    if (!고른 && 원관리) return 첫조합(c, 답, true);
    return 고른 && { 약정: 고른.약정, 관리: 고른.관리, 가입: 고른.가입 };
  }
  function 카드요금(id) {
    var 보 = 카드보관[id], c = 보.c, 고 = 보.항목.고름[보.번];
    if (!고 || !c.조합 || !c.조합[고.약정] || !c.조합[고.약정][고.관리]) return c.가장싼 && c.가장싼.월 != null ? '<span class="dhai-price">월 ' + 돈(c.가장싼.월) + '원~</span>' : '';
    var 조 = c.조합, 관리들 = Object.keys(조[고.약정]), 칸 = 조[고.약정][고.관리][고.가입];
    function 단추(종류, 값, 글, 켬) { return '<button type="button" data-dhai-card="' + id + '" data-dhai-' + 종류 + '="' + 이스케이프(값) + '"' + (켬 ? ' class="on"' : '') + '>' + 이스케이프(글) + '</button>'; }
    return '<span class="dhai-price">월 ' + 돈(Math.min.apply(null, 칸.줄.map(function (r) { return r[2]; }))) + '원~ <small>' +
      이스케이프(짧은약정(고.약정)) + '·' + 이스케이프(고.관리) + (고.가입 === '타사보상' ? '·타사보상' : '') + '</small></span>' +
      '<div class="dhai-opt">' + Object.keys(조).map(function (약) { return 단추('y', 약, 짧은약정(약), 약 === 고.약정); }).join('') + '</div>' +
      (관리들.length > 1 ? '<div class="dhai-opt">' + 관리들.map(function (관) { return 단추('m', 관, 관, 관 === 고.관리); }).join('') + '</div>' : '') +
      '<div class="dhai-rounds" title="' + 이스케이프(짧은약정(고.약정)) + ' 의무약정 기간 동안 회차별 월 요금">' +
      칸.줄.map(function (r) { return '<div><span>' + (r[0] === r[1] ? r[0] : r[0] + '~' + r[1]) + '회차</span><b>' + 돈(r[2]) + '원</b></div>'; }).join('') + '</div>' +
      (칸.카드 != null ? '<span class="dhai-note">' + (칸.카드뒤 ? '이후 ' : '') + '제휴카드 쓰면 월 ' + 돈(칸.카드) + '원</span>' : '');
  }
  function 카드들(항목, k) {
    var 목록 = 항목.카드;
    if (!목록 || !목록.length) return '';
    항목.고름 = 항목.고름 || [];
    return '<div class="dhai-cards">' + 목록.map(function (c, i) {
      var id = 'dhai-c' + k + '-' + i;
      카드보관[id] = { c: c, 항목: 항목, 번: i };
      if (항목.고름[i] === undefined) 항목.고름[i] = 첫조합(c, 항목.답);
      var 품목 = c.브랜드 + ' ' + c.이름 + ' (' + c.모델 + ')';
      return '<div class="dhai-card"><img src="' + 이스케이프(c.사진) + '" alt="' + 이스케이프(c.이름) + '" loading="lazy" onerror="this.style.visibility=\'hidden\'">' +
        '<div class="dhai-cb"><span class="dhai-brand">' + 이스케이프(c.브랜드) + '</span><span class="dhai-name">' + 이스케이프(c.이름) + '</span>' +
        '<span class="dhai-model">' + 이스케이프(c.모델) + (c.크기mm ? ' · ' + 이스케이프(c.크기mm) + 'mm' : '') + '</span>' +
        '<div id="' + id + '">' + 카드요금(id) + '</div></div>' +
        '<div class="dhai-cbtn"><a href="' + 이스케이프(c.화면) + '">자세히 보기</a><button type="button" data-dhai-apply="' + 이스케이프(품목) + '" data-dhai-cardref="' + id + '">이 제품으로 상담 신청</button></div></div>';
    }).join('') + '</div>';
  }
  function 연결단추(질문) {
    return '<div class="dhai-act"><button type="button" class="ap" data-dhai-apply="' + 이스케이프(String(질문 || '').slice(0, 80)) + '">상담 신청</button>' +
      '<a class="kk" href="' + 카톡 + '" target="_blank" rel="noopener" data-dhai-ev="kakao">카톡 상담</a>' +
      '<a class="tel" href="tel:' + 전화 + '" data-dhai-ev="tel">전화 ' + 전화 + '</a></div>';
  }
  function 항목글(항목, k) {
    if (항목.종류 === 'me') return '<div class="dhai-me">' + 이스케이프(항목.글) + '</div>';
    if (항목.종류 === '쉼') return '<div class="dhai-ai"><p>' + 이스케이프(항목.말) + '</p>' + 연결단추(항목.질문) + '</div>';
    return '<div class="dhai-ai">' + 꾸미기(항목.답) + 카드들(항목, k) + 연결단추(항목.질문) +
      '<div class="dhai-warn">AI가 생성한 응답은 부정확할 수 있습니다. 정확한 요금과 혜택은 상담원이 확인해서 확정해 드려요.</div></div>';
  }

  /* ── 화면 만들기 ── */
  var 판, 몸, 입력, 보내기, 단추, 바쁨 = false;
  function 만들기() {
    var st = document.createElement('style'); st.textContent = 모양; document.head.appendChild(st);
    단추 = document.createElement('button');
    단추.type = 'button'; 단추.className = 'dhai-fab'; 단추.setAttribute('aria-label', 'AI 상담 열기');
    단추.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/></svg>AI 상담';
    판 = document.createElement('div');   /* section 은 사이트 모양(위아래 32px 여백)을 물려받아 div 로 */
    판.className = 'dhai-panel'; 판.hidden = true; 판.setAttribute('role', 'dialog'); 판.setAttribute('aria-label', '당현함 AI 상담');
    판.innerHTML = '<div class="dhai-head"><div class="dhai-face" aria-hidden="true">당</div><div class="dhai-title"><b>당현함 AI 상담</b><span>정수기·인터넷 요금 비교</span></div>' +
      '<button type="button" class="dhai-hbtn" data-dhai-new>새 대화</button><button type="button" class="dhai-hbtn dhai-x" data-dhai-close aria-label="닫기">×</button></div>' +
      '<div class="dhai-body" aria-live="polite"></div>' +
      '<div class="dhai-foot"><textarea rows="1" maxlength="500" placeholder="궁금한 걸 적어 주세요" aria-label="질문"></textarea><button type="button" class="dhai-send">보내기</button></div>';
    document.body.appendChild(단추); document.body.appendChild(판);
    몸 = 판.querySelector('.dhai-body'); 입력 = 판.querySelector('textarea'); 보내기 = 판.querySelector('.dhai-send');
    아래띠맞추기();
    window.addEventListener('resize', 아래띠맞추기);
    window.addEventListener('load', 아래띠맞추기);
    /* 아래 띠는 화면이 다 그려진 뒤 높이가 바뀌므로 크기 변화를 지켜봅니다 */
    var 띠 = document.querySelector('.bar3');
    if (띠 && window.ResizeObserver) new ResizeObserver(아래띠맞추기).observe(띠);
  }
  /* 정수기 화면의 아래 고정 띠(.bar3) 위로 단추를 올립니다 */
  function 아래띠맞추기() {
    var 띠 = document.querySelector('.bar3');
    var 높이 = 띠 && getComputedStyle(띠).display !== 'none' ? 띠.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty('--dhai-bar', Math.round(높이) + 'px');
  }
  /* 답이 오면 맨 아래로 내리지 않고 방금 보낸 질문이 맨 위에 오게 — 답을 첫 줄부터 읽게(11/6 사장님) */
  function 그리기(답부터) {
    카드보관 = {};
    몸.innerHTML = 상태.기록.map(항목글).join('') + 도우미글();
    var 내말 = 답부터 ? 몸.querySelectorAll('.dhai-me') : null;
    if (내말 && 내말.length) 몸.scrollTop = Math.max(0, 내말[내말.length - 1].offsetTop - 몸.offsetTop - 8);
    else 몸.scrollTop = 몸.scrollHeight;
  }
  function 열기() {
    판.hidden = false; 단추.hidden = true;
    그리기();
    표장치().catch(function () { /* 보낼 때 다시 시도 */ });
    if (window.matchMedia('(min-width:641px)').matches) 입력.focus();
    if (window.matchMedia('(max-width:640px)').matches) document.documentElement.style.overflow = 'hidden';
    통계('ai_chat_open');
  }
  function 닫기() {
    판.hidden = true; 단추.hidden = false;
    document.documentElement.style.overflow = '';
  }
  function 통계(이름, 덧) {
    try { if (window.gtag) window.gtag('event', 이름, 덧 || {}); } catch (e) { /* 무시 */ }
  }

  /* 상담 신청 — 사이트의 기존 신청창을 열고 요청사항 칸을 미리 채웁니다 */
  function 신청(품목글) {
    통계('ai_chat_apply');
    if (typeof window.신청창열기 !== 'function') { location.href = 'tel:' + 전화; return; }
    닫기();
    window.신청창열기();
    try { if (window.toggleService) window.toggleService('rental'); } catch (e) { /* 무시 */ }
    try {
      if (window.요청사항펴기) window.요청사항펴기();
      var 칸 = document.getElementById('inputMemo');
      if (칸) { 칸.value = ('AI 상담 문의: ' + 품목글).slice(0, 200); 칸.dispatchEvent(new Event('input', { bubbles: true })); }
    } catch (e) { /* 메모 칸이 없어도 신청은 됨 */ }
  }

  function 묻기(글) {
    글 = String(글 || '').trim();
    if (!글 || 바쁨) return;
    상태.도우미.끝 = true;
    상태.대화.push({ role: 'user', content: 글.slice(0, 500) });
    상태.기록.push({ 종류: 'me', 글: 글 });
    입력.value = '';
    바쁨 = true; 보내기.disabled = true;
    그리기();
    var 단계 = ['질문을 살피고 있어요', '맞는 제품을 추리고 있어요', '약정·관리별 요금을 맞춰 보고 있어요', '답을 정리하고 있어요'];
    몸.insertAdjacentHTML('beforeend', '<div class="dhai-wait" role="status"><span class="dhai-dots" aria-hidden="true"><i></i><i></i><i></i></span><span>' + 단계[0] + '</span></div>');
    몸.scrollTop = 몸.scrollHeight;
    var 시작 = Date.now(), 돌기 = setInterval(function () {
      var w = 몸.querySelector('.dhai-wait span:last-child'); if (!w) return;
      var n = Math.min(단계.length - 1, Math.floor((Date.now() - 시작) / 3500));
      w.textContent = (Date.now() - 시작 > 20000) ? '자료를 꼼꼼히 맞춰 보느라 조금 더 걸리고 있어요' : 단계[n];
    }, 500);
    통계('ai_chat_send');
    var 끝 = function (항목, 성공) {
      clearInterval(돌기);
      if (성공) 상태.대화.push({ role: 'assistant', content: 항목.답, 서명: 성공 }); else 상태.대화.pop();
      상태.기록.push(항목);
      if (상태.기록.length > 40) 상태.기록 = 상태.기록.slice(-40);
      if (상태.대화.length > 12) 상태.대화 = 상태.대화.slice(-12);
      while (상태.대화.length && 상태.대화[0].role !== 'user') 상태.대화.shift();
      바쁨 = false; 보내기.disabled = false;
      기억(); 그리기(true);
    };
    var 쉼 = function (말) {
      끝({ 종류: '쉼', 말: 말 || '지금은 AI 상담이 잠시 쉬고 있어요. 상담원이 직접 안내해 드릴게요.', 질문: 글 }, null);
    };
    var 머리 = { 'Content-Type': 'application/json' };
    if (시험설정 && 시험설정.시험키) 머리['X-DH-Test'] = 시험설정.시험키;
    var 멈춤 = typeof AbortController === 'function' ? new AbortController() : null;
    var 시계;
    /* 확인 장치가 이 기기에서 안 돌면(앱 속 브라우저 등) 「없음」 표로 보내 작은 몫으로라도 상담되게 합니다(11/6) */
    표받기().catch(function (e) { return '없음:' + String((e && e.코드) || (e && e.message) || 'x').slice(0, 40); }).then(function (표) {
      시계 = setTimeout(function () { if (멈춤) 멈춤.abort(); }, 60000);
      return fetch(다리, { method: 'POST', headers: 머리, signal: 멈춤 ? 멈춤.signal : undefined,
        body: JSON.stringify({ 대화: 상태.대화, 대화번호: 상태.번호, 표: 표 }) });
    })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        clearTimeout(시계);
        /* 다리 쪽 서명값이 바뀌어 지난 답이 안 맞으면(드묾) 대화 기억을 비우고 다시 묻게 합니다 */
        if (j && j.오류 === '서명') { 상태.대화 = []; return 쉼('대화가 오래되어 새로 시작했어요. 질문을 한 번만 다시 보내 주세요.'); }
        if (!j || j.쉼 || !j.답 || !j.서명) return 쉼(j && j.말);
        끝({ 종류: 'ai', 답: j.답, 카드: j.카드 || [], 질문: 글 }, j.서명);
      })
      .catch(function () { clearTimeout(시계); 쉼(); });
  }

  /* ── 누르기 ── */
  function 누름(e) {
    var t = e.target.closest ? e.target.closest('button, a') : null;
    if (!t || !판.contains(t)) return;
    if (t.hasAttribute('data-dhai-close')) return 닫기();
    if (t.hasAttribute('data-dhai-new')) {
      if (바쁨) return;
      상태 = 새상태(); 기억(); return 그리기();
    }
    if (t.hasAttribute('data-dhai-reset')) { 상태.도우미.답 = {}; return 그리기(); }
    /* 한 단계 앞 물음으로 — 마지막에 고른 답 하나만 지웁니다(11/6 사장님) */
    if (t.hasAttribute('data-dhai-back')) {
      var 고른것 = 순서(상태.도우미.답).filter(function (k) { return k in 상태.도우미.답; });
      if (고른것.length) delete 상태.도우미.답[고른것[고른것.length - 1]];
      return 그리기();
    }
    if (t.hasAttribute('data-dhai-skip')) { 상태.도우미.끝 = true; 기억(); 그리기(); return 입력.focus(); }
    if (t.hasAttribute('data-dhai-key')) {
      if (바쁨) return;
      상태.도우미.답[t.getAttribute('data-dhai-key')] = t.getAttribute('data-dhai-val');
      if (순서(상태.도우미.답).every(function (k) { return k in 상태.도우미.답; })) return 묻기(묶은글(상태.도우미.답));
      return 그리기();
    }
    if (t.hasAttribute('data-dhai-card')) {
      var id = t.getAttribute('data-dhai-card'), 보 = 카드보관[id]; if (!보) return;
      var 원 = 보.항목.고름[보.번]; if (!원) return;
      var 조 = 보.c.조합, 고 = { 약정: 원.약정, 관리: 원.관리, 가입: 원.가입 };
      if (t.hasAttribute('data-dhai-y')) 고.약정 = t.getAttribute('data-dhai-y');
      if (t.hasAttribute('data-dhai-m')) 고.관리 = t.getAttribute('data-dhai-m');
      if (!조[고.약정]) return;
      if (!조[고.약정][고.관리]) 고.관리 = Object.keys(조[고.약정])[0];
      if (!조[고.약정][고.관리][고.가입]) 고.가입 = '신규';
      보.항목.고름[보.번] = 고; 기억();
      var 칸 = document.getElementById(id); if (칸) 칸.innerHTML = 카드요금(id);
      return;
    }
    if (t.hasAttribute('data-dhai-apply')) {
      var 글 = t.getAttribute('data-dhai-apply'), 참 = t.getAttribute('data-dhai-cardref');
      var g = 참 && 카드보관[참] && 카드보관[참].항목.고름[카드보관[참].번];
      if (g) 글 += ' ' + 짧은약정(g.약정) + '·' + g.관리 + (g.가입 === '타사보상' ? '·타사보상' : '');
      return 신청(글);
    }
    if (t.hasAttribute('data-dhai-ev')) 통계('ai_chat_' + t.getAttribute('data-dhai-ev'));
  }

  function 시작() {
    만들기();
    단추.addEventListener('click', 열기);
    판.addEventListener('click', 누름);
    보내기.addEventListener('click', function () { 묻기(입력.value); });
    입력.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); 묻기(입력.value); }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !판.hidden) 닫기(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', 시작); else 시작();
})();
