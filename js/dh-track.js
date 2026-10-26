/* ══════════════════════════════════════════════════════════════════
   전환추적 공용 부품 · dh-track.js   (2026-09-28 만듦)
   화면 425장이 머리 부분에 똑같이 복사해 갖고 있던 코드를 한 곳으로 모은 것입니다.
   ★ 화면마다 다른 것은 「이 화면을 통계에서 부를 이름」 한 줄뿐입니다.
     화면 쪽에 이렇게 남겨 두고, 이 파일보다 **먼저** 읽히게 둡니다:
         <script>var DH_PAGE = 'danghh-xxx';</script>
   ★ 이 파일을 고치면 부르는 화면 전부의 ?v= 번호도 함께 올리세요.
   ★ 구글·메타 조각 바로 뒤, 다른 코드가 dhTrack 을 쓰기 전에 읽혀야 합니다(자리를 옮기지 마세요).
   ══════════════════════════════════════════════════════════════════ */
/* 네이버 전환추적 공통키(AccountId) — 2026-08-28 발급받아 채움.
   홈페이지 소스에 그대로 드러나는 공개값이라 가려 둘 필요가 없다(구글 측정번호와 같은 성격) */
var DH_NAVER_ID = window.DH_BOT ? '' : 's_2e8bfd0103db';

/* 같은 방문에서 한 번만 세도록 막는 장치 */
function dhOnce(key){
  try{
    if(sessionStorage.getItem('dh_'+key)) return false;
    sessionStorage.setItem('dh_'+key,'1'); return true;
  }catch(e){ return true; }
}

/* 네이버 전환 한 건 보내기 (2026-08-28)
   공통키(AccountId) s_2e8bfd0103db · 설치 가이드 https://navercts.gitbook.io/guide
   전환 종류 - lead=신청 완료 / custom001=카카오톡 상담 / custom002=전화 걸기
   ※ custom001·002 는 네이버 광고 화면에서 '사용자 정의' 전환으로 신청돼 있어야 집계된다 */
function dhNaver(종류){
  try{
    if(!DH_NAVER_ID || !window.wcs || typeof wcs.trans !== 'function') return;
    if(!window.wcs_add) window.wcs_add = {};
    wcs_add['wa'] = DH_NAVER_ID;
    var _conv = {};
    _conv.type = 종류;
    wcs.trans(_conv);
  }catch(e){ /* 추적이 실패해도 신청 접수는 절대 방해하지 않음 */ }
}

/* SNS 광고 기록 (2026-10-26) — 인스타·유튜브 등 SNS 꼬리표로 들어온 손님의 방문과 카톡·전화·신청서 제출을
   당현함 SNS 통계 창고로 보낸다(보는 곳: 성지똑똑 관리자 화면 「당현함」 탭).
   · 주소의 utm_source 가 SNS 일 때만 「방문」 한 줄 + 이 방문 꼬리표를 창 저장소(dh_sns)에 둔다.
     같은 창에서 다른 화면으로 옮겨 다녀도 누른 것은 이 꼬리표로 이어 센다. SNS 가 아닌 꼬리표로 다시 들어오면 지운다.
   · 로봇(DH_BOT)·?test 가 붙은 방문(그 창이 닫힐 때까지)·danghh.com 이 아닌 곳(내 컴퓨터 시험본 등)은 보내지 않는다.
   · 개인정보는 보내지 않는다. 실패해도 화면·신청은 막지 않는다. */
var DH_SNS_URL = 'https://danghh-sns-stats.danghh.workers.dev/e';
var dhSns = (function(){
  try{
    if(window.DH_BOT || !/(^|\.)danghh\.com$/.test(location.hostname) || !window.sessionStorage) return null;
    var q = new URLSearchParams(location.search);
    if(q.has('test')) sessionStorage.setItem('dh_sns_test', '1');
    if(sessionStorage.getItem('dh_sns_test')) return null;
    var 새표 = function(){ return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).slice(2, 12)); };
    var 사람 = localStorage.getItem('dh_uid');
    if(!사람){ 사람 = 새표(); localStorage.setItem('dh_uid', 사람); }
    var 출처 = (q.get('utm_source') || '').trim();
    if(출처){
      if(/^(instagram|ig|facebook|fb|meta|youtube|yt|tiktok|threads)$/i.test(출처)){
        var 표 = { s: 출처, md: q.get('utm_medium') || '', c: q.get('utm_campaign') || '', ct: q.get('utm_content') || '', u: 사람, v: 새표() };
        sessionStorage.setItem('dh_sns', JSON.stringify(표));
        dhSnsSend('visit', '', 표);
        return 표;
      }
      sessionStorage.removeItem('dh_sns');
      return null;
    }
    return JSON.parse(sessionStorage.getItem('dh_sns') || 'null');
  }catch(e){ return null; }
})();
function dhSnsSend(k, m, 표){
  try{
    표 = 표 || dhSns;
    if(!표) return;
    var 몸 = JSON.stringify({ k: k, m: m, s: 표.s, md: 표.md, c: 표.c, ct: 표.ct, u: 표.u, v: 표.v, p: window.DH_PAGE || '' });
    if(navigator.sendBeacon && navigator.sendBeacon(DH_SNS_URL, 몸)) return;
    fetch(DH_SNS_URL, { method: 'POST', body: 몸, keepalive: true, mode: 'no-cors' });
  }catch(e){}
}

/* 전환 1건을 구글·메타·네이버에 동시에 알림 (개인정보는 보내지 않음) */
function dhTrack(action, opts){
 try{
  opts = opts || {};
  /* SNS 통계는 누를 때마다 센다(한 번만 세기 장치보다 먼저) — 신청은 입력검사를 통과해 보낼 때(lead_submit) */
  var sns메뉴 = { kakao_click: 'kakao', phone_click: 'phone', lead_submit: 'apply' }[action];
  if(sns메뉴) dhSnsSend('click', sns메뉴);
  if(opts.once !== false && !dhOnce(action)) return;

  /* 1) 구글 애널리틱스 */
  if(typeof gtag === 'function'){
    gtag('event', action, { dh_page: DH_PAGE });
  }
  /* 2) 메타 픽셀 */
  if(typeof fbq === 'function'){
    var metaName = { lead_submit:'Lead', kakao_click:'Contact', phone_click:'Contact' }[action];
    if(metaName) fbq('track', metaName, { content_name: DH_PAGE + '/' + action });
    else fbq('trackCustom', action, { content_name: DH_PAGE });
  }
  /* 3) 네이버 (ID를 채운 경우에만)
     2026-08-28 : 옛 방식 wcs.cnv 는 전환을 번호로만 구분해 신청·카톡·전화가 한 덩어리로 뭉쳤다.
     가이드가 시키는 wcs.trans 로 바꿔 종류를 나눈다.
     신청(lead)은 여기서 안 쏜다 — 이 자리는 '보내기 직전'이라 실패한 신청까지 세어진다.
     진짜 접수된 뒤(성공 화면이 뜰 때) dhNaver('lead') 를 따로 부른다. */
  var 네이버종류 = { kakao_click:'custom001', phone_click:'custom002' }[action];
  if(네이버종류) dhNaver(네이버종류);
 }catch(e){ /* 추적이 실패해도 신청 접수는 절대 방해하지 않음 */ }
}

/* 네이버 스크립트는 ID가 채워졌을 때만 불러옴 */
(function(){
  if(!DH_NAVER_ID) return;
  var s=document.createElement('script'); s.async=true; s.src='//wcs.naver.net/wcslog.js';
  s.onload=function(){
    try{
      if(!window.wcs_add) window.wcs_add={};
      wcs_add['wa']=DH_NAVER_ID;
      if(!window._nasa) window._nasa={};
      if(window.wcs) wcs.inflow();
      wcs_do();   /* 네이버가 발급한 안내문과 같은 형태로 맞춤 (2026-08-28) */
    }catch(e){}
  };
  document.head.appendChild(s);
})();

/* 전화·카카오 링크 클릭 자동 감지 (버튼이 몇 개든 자동으로 잡힘) */
document.addEventListener('click', function(e){
  var a = e.target && e.target.closest ? e.target.closest('a') : null;
  if(!a) return;
  var href = a.getAttribute('href') || '';
  if(href.indexOf('tel:') === 0) dhTrack('phone_click');
  else if(href.indexOf('pf.kakao.com') > -1) dhTrack('kakao_click');
}, true);

/* 페이지를 절반 이상 읽었는지 */
window.addEventListener('scroll', function(){
  var h = document.documentElement.scrollHeight - window.innerHeight;
  if(h > 0 && (window.scrollY / h) >= 0.5) dhTrack('scroll_50');
}, { passive: true });
