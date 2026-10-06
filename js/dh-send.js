/* ══════════════════════════════════════════════════════════════════
   신청 보내는 기계 · dh-send.js   (2026-09-29 만듦)
   랜딩 3장(첫 화면·렌탈·코웨이용 렌탈)이 화면마다 한 벌씩 갖고 있던 코드를 한 곳으로 모았습니다.
   ★ 화면 쪽에 남는 설정 세 줄을 보내는 순간에 읽습니다(이 파일을 먼저 부르든 나중에 부르든 됩니다):
         const SCRIPT_URL = '…';   구글 웹앱 주소 — **화면마다 다릅니다**
         const DH_접수처  = '…';   클라우드플레어 중간 접수처
         const DH_갈래    = 'main' 또는 'rental';
   ★ 통계·유입경로는 이 파일이 손대지 않습니다 — 화면 쪽 신청서 코드가 맡습니다
     (dhTrack('lead_submit') · dhNaver('lead') · dhInflow()).
   ★ 이 파일을 고치면 세 장의 ?v= 번호도 함께 올리세요.
   ══════════════════════════════════════════════════════════════════ */
/* ===== 신청 보내기 (실패하면 다시 시도) =====
   구글이 잠깐 흔들리면 신청이 그대로 사라지던 문제를 막는다.
   8초 안에 대답이 없거나 연결이 안 되면 잠깐 쉬었다 다시 보낸다(최대 3번).
   ⚠ 다시 보내도 시트에 두 줄이 되지 않는 이유: 구글 쪽 당현함_신청폼.gs 가
      "같은 번호가 2분 안에 또 오면 무시" 규칙을 갖고 있다. 둘은 한 쌍이므로
      한쪽만 되돌리면 중복이 생긴다. (2026-08-07) */
/* ===== 신청 중간 접수처 (2026-09-17) =====
   신청을 먼저 클라우드플레어 접수처로 보낸다. 접수처는 창고에 넣고 0.1초 안에 "받았다"고 답한 뒤,
   뒤에서 구글시트로 넘긴다(구글이 느리거나 실패하면 5분마다 다시 보낸다).
   ★신청번호(req_id): 손님이 신청을 한 번 누를 때마다 새로 만든다. 같은 신청을 여러 번 보내도
     구글이 같은 신청번호는 한 번만 적는다. 손님이 다시 누르면 새 번호라 새 줄로 적힌다.
   ★비상구: 접수처가 3초 안에 답하지 않으면(2번까지) 예전처럼 구글로 직접 보낸다 — 아래 dh구글직접().
     같은 신청번호를 그대로 쓰므로 접수처가 나중에 넘겨도 두 줄이 되지 않는다.
   ★같은 번호로 사람이 누를 수 없는 속도(10분 20번)면 접수처가 막는다(429). 그때는 구글 직접으로 돌리지 않는다.
   ⚠ 짝: 안티그라비티\신청중간접수처\src\index.js · 구글스크립트정리\당현함_신청폼.gs */

function dh신청번호() {
  try { if (window.crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12) + '-' + Math.random().toString(36).slice(2, 12);
}

async function dhSend(payload, 상태알림) {
  const 보낼것 = Object.assign({}, payload, { req_id: dh신청번호(), req_target: DH_갈래 });
  for (let 회 = 1; 회 <= 2; 회++) {
    const controller = new AbortController();
    const 시간끝 = setTimeout(() => controller.abort(), 3000);
    try {
      const r = await fetch(DH_접수처, {
        method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify(보낼것), signal: controller.signal
      });
      clearTimeout(시간끝);
      if (r.status === 429) { const 막힘 = new Error('too_many'); 막힘.막힘 = true; throw 막힘; }
      if (r.ok) { const 답 = await r.json().catch(() => null); if (답 && 답.ok) return; }
    } catch (err) {
      clearTimeout(시간끝);
      if (err && err.막힘) throw err;
    }
  }
  if (typeof 상태알림 === 'function') { try { 상태알림('연결이 느려요. 다시 시도 중...'); } catch (e) {} }
  return dh구글직접(보낼것, 상태알림);
}

/* 비상구: 구글로 직접 보내기 (예전 dhSend 그대로, 이름만 바꿈) */
async function dh구글직접(payload, 상태알림) {
  /* ===== 2026-08-21 고침 =====
     전에는 8초 안에 대답이 없으면 '실패'로 보고 다시 보냈다. 그런데 구글이 느릴 때는
     30~57초까지 걸린다(8/19 실측). 그래서 **접수는 됐는데 손님 화면엔 '오류'** 가 뜨고,
     다시 보낸 요청도 전부 도착해 한 신청이 여러 줄로 쌓였다(8/21 실측: 2번 제출 → 5줄).
     → 한 번 시도에 40초까지 기다린다. 대답이 오면 그 즉시 끝나므로 평소(2~4초)는 그대로다.
     → 다만 손님을 무한정 붙잡지 않도록 전체 45초에서 끊는다.
     ※ 다시 보내기 3번은 그대로 둔다. 그건 '보내기 자체가 실패'할 때 듣는 약이라 여전히 필요하다
       (인터넷이 끊기면 기다림 없이 즉시 실패하므로 40초를 채우지 않는다).
     ⚠ 구글 쪽 중복막기(같은 번호 120초)와 한 쌍이다 — 한쪽만 되돌리면 중복이 생긴다 */
  const 최대횟수 = 3;
  const 한번한도 = 40000;   // 한 번 시도에 기다려 주는 최대 시간
  const 전체한도 = 45000;   // 손님을 붙잡아 두는 전체 최대 시간
  const 시작 = Date.now();
  const 말하기 = function (문구) {
    if (typeof 상태알림 === 'function') { try { 상태알림(문구); } catch (e) {} }
  };
  let 마지막오류 = null;

  for (let 회 = 1; 회 <= 최대횟수; 회++) {
    const 남은 = 전체한도 - (Date.now() - 시작);
    if (남은 <= 0) break;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Math.min(한번한도, 남은));
    /* 오래 걸릴 때 화면이 멈춘 것처럼 보이지 않도록 문구를 단계별로 바꿔 준다 */
    const 단계알림 = [
      setTimeout(function () { 말하기('확인 중입니다...'); }, 8000),
      setTimeout(function () { 말하기('거의 다 됐어요. 화면을 닫지 말아 주세요'); }, 20000)
    ];
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST', mode: 'no-cors', signal: controller.signal,
        body: JSON.stringify(payload)
      });
      clearTimeout(timeout); 단계알림.forEach(clearTimeout);
      return;
    } catch (err) {
      clearTimeout(timeout); 단계알림.forEach(clearTimeout);
      마지막오류 = err;
      if (회 < 최대횟수) {
        말하기('연결이 느려요. 다시 시도 중...');
        await new Promise(r => setTimeout(r, 회 * 1200));
      }
    }
  }
  throw 마지막오류 || new Error('신청 전송 실패');
}

/* 옮겨 온 이력 한 줄 — 렌탈 화면에만 적혀 있던 메모입니다(2026-09-29 이 파일로 합칠 때 옮김):
   「이 쪽(렌탈)은 원래 시간 제한조차 없어서 "신청 중..."에서 멈추기도 했다.」 */

/* ── 본문 신청서 보내기 (2026-09-29 세 장에서 합침) ─────────────────
   화면마다 다른 것은 **서비스 갈래 이름 한 줄**뿐입니다:
       var DH_서비스이름 = { internet:'인터넷', rental:'가전렌탈' };   ← 첫 화면
       var DH_서비스이름 = { water:'정수기',  rental:'가전렌탈' };   ← 렌탈 2장
   · 유심 칸은 **있으면 그 값, 없으면 'N'** (렌탈 2장에는 그 칸이 없습니다)
   · 단추 글자는 **처음 글자를 기억해 되돌립니다**(화면마다 글자가 달라도 그대로)
   · 통계·유입경로는 여기서 부르지만 만드는 곳은 공용 부품입니다
     (dhTrack=js/dh-track.js · dhInflow=js/dh-inflow.js · dhNaver=js/dh-track.js) */
/* ── 이름 칸 거르기 (2026-10-06 사장님 「이름칸에 특수문자 못넣게 막아」) ──
   이름에는 한글·영문·띄어쓰기만 받는다. '=' '+' '-' '@' 로 시작하는 글을 구글 시트가
   계산식으로 읽는 것을 막는 뜻. 입력할 때 바로 빼고, 보내기 직전에 한 번 더 거른다.
   js/dh-apply.js 에도 같은 것이 있고, 한 화면에 둘 다 있어도 한 번만 설치된다. */
window.dh이름거르기 = window.dh이름거르기 || function (s) {
  return String(s || '').replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z\s]/g, '').replace(/\s+/g, ' ').trim();
};
if (!window.__dh이름막기) {
  window.__dh이름막기 = true;
  const 이름칸거르기 = function (e) {
    const t = e.target;
    if (!t || (t.id !== 'inputName' && t.id !== 'deskName') || e.isComposing) return;   /* 한글 조합 중엔 건드리지 않음 */
    const 걸러짐 = t.value.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z\s]/g, '');
    if (걸러짐 !== t.value) t.value = 걸러짐;
  };
  document.addEventListener('input', 이름칸거르기);
  document.addEventListener('compositionend', 이름칸거르기);
}

async function submitForm() {
  const name = window.dh이름거르기(document.getElementById('inputName').value);
  const phone = document.getElementById('inputPhone').value.trim();
  let memo = document.getElementById('inputMemo').value.trim();
  if (selectedServices.size === 0) { alert('서비스를 하나 이상 선택해주세요.'); return; }
  if (!phone || phone.replace(/\D/g,'').length !== 11) { alert('휴대폰 번호 11자리를 정확히 입력해주세요.\n(예: 010-1234-5678)'); return; }
  if (!document.getElementById('c1').checked) {
    alert('개인정보 수집 및 이용에 동의해주세요.'); return;
  }
  const btn = document.getElementById('submitBtn');
  const 본래글자 = btn.textContent;                 /* 화면마다 다른 글자를 그대로 되돌리려고 기억 */
  btn.disabled = true; btn.textContent = '신청 중...';
  dhTrack('lead_submit', { once: false });   /* 입력 검사 통과 시점에 전환 집계 */

  const serviceMap = (typeof DH_서비스이름 !== 'undefined') ? DH_서비스이름 : {};
  const serviceText = [...selectedServices].map(s => serviceMap[s]).join('+');
  const usimEl = document.getElementById('usimCheck');
  const usim = usimEl ? (usimEl.checked ? 'Y' : 'N') : 'N';   /* 칸이 없는 화면(렌탈 2장)은 'N' */

  try {
    if (window.dh통화붙이기) memo = window.dh통화붙이기(memo);   /* 통화 희망 시간 줄 (js/dh-callhope.js, 2026-09-21) */
    await dhSend(Object.assign({ name, phone, usim, service: serviceText, memo }, dhInflow()),
                 (문구) => { btn.textContent = 문구; });
    document.getElementById('formContent').style.display = 'none';
    document.getElementById('formSuccess').style.display = 'block';
    if (window.dh통화완료) window.dh통화완료();   /* 완료창에 전화 드릴 때를 적는다 */
    dhNaver('lead');   /* 네이버 전환: 진짜 접수된 뒤에만 (2026-08-28) */
  } catch(e) {
    alert('오류가 발생했습니다. 잠시 후 다시 시도하거나\n1600-4670으로 직접 문의해주세요.');
    btn.disabled = false; btn.textContent = 본래글자;
  }
}

/* ── 컴퓨터 입력칸 띠에서 보내기 (렌탈 2장에만 있는 띠. 그 칸이 없는 화면에서는 불리지 않습니다) ── */
async function submitDeskForm() {
  const name = window.dh이름거르기(document.getElementById('deskName').value);
  const phone = document.getElementById('deskPhone').value.trim();
  /* 희망 제품은 필수로 받는다 (2026-09-02) */
  const 희망제품 = (document.getElementById('deskService') || { value: '' }).value.trim();
  if (!희망제품) { alert('희망 제품을 적어주세요.\n(예: 정수기, 비데, 매트리스)'); return; }
  if (!phone || phone.replace(/\D/g,'').length !== 11) { alert('휴대폰 번호 11자리를 정확히 입력해주세요.\n(예: 010-1234-5678)'); return; }
  dhTrack('lead_submit', { once: false });   /* 입력 검사 통과 시점에 전환 집계 */
  /* 보내는 동안 버튼을 잠근다. 안 잠그면 느릴 때(최대 27초) 손님이 여러 번 누른다 */
  const btn = document.querySelector('.desk-cta-bar-btn');
  const 본래글자 = btn ? btn.textContent : '';
  if (btn) { btn.disabled = true; btn.textContent = '신청 중...'; }
  try {
    /* 통화 희망 시간 (js/dh-callhope.js, 2026-09-22) — 골랐을 때만 요청사항 칸에 [통화] 줄을 보낸다.
       안 골랐으면 예전과 똑같이 요청사항 없이 보낸다. */
    const 통화줄 = window.dh통화띠줄 ? window.dh통화띠줄() : '';
    await dhSend(Object.assign({ name, phone, usim: '미지정', service: 희망제품 }, 통화줄 ? { memo: 통화줄 } : {}, dhInflow()),
                 (문구) => { if (btn) btn.textContent = 문구; });
    /* 하단 바에서 완료 메시지만 남기고 입력칸·버튼은 정리.
       요소가 없어도 오류 나지 않도록 있는 것만 건드림 */
    const deskInner = document.querySelector('.desk-cta-bar-inner');
    if (deskInner) [...deskInner.children].forEach(el => {
      if (el.id !== 'deskSuccess') el.style.display = 'none';
    });
    const deskOk = document.getElementById('deskSuccess');
    if (deskOk) deskOk.style.display = 'block';
    if (window.dh통화띠완료) window.dh통화띠완료();   /* 완료 문구에 전화 드릴 때를 적는다 (2026-09-22) */
      dhNaver('lead');   /* 네이버 전환: 진짜 접수된 뒤에만 (2026-08-28) */
    const deskC = document.getElementById('deskConsent');
    if (deskC) deskC.style.display = 'none';
  } catch(e) {
    if (btn) { btn.disabled = false; btn.textContent = 본래글자; }
    alert('오류가 발생했습니다. 1600-4670으로 문의해주세요.');
  }
}
