/* ===================================================================
   당현함 유입경로 공용 부품  —  dh-inflow.js  (2026-08-20 신설)

   ■ 무슨 일을 하나
     "이 손님이 어디서 왔는지"를 알아내 손님 브라우저에 30일 동안 기억해 두고,
     신청서를 보낼 때 같이 실어 보낸다. (구글 시트 '당현함_신청DB' G~K 5칸)

   ■ 왜 파일로 뺐나
     예전에는 이 코드가 index·internet·rental·gift 네 파일에 통째로 복사돼 있었다.
     광고 갈래 하나를 늘리려면 네 곳을 똑같이 고쳐야 했고, 한 곳만 빠뜨려도
     페이지마다 결과가 달라졌다. 이제 이 파일 하나만 고치면 네 곳에 같이 적용된다.

   ■ 고칠 일이 생기면 (아래 표에 한 줄씩만 넣으면 된다)
     - 새 광고 매체(예: 틱톡)       -> '매체이름'
     - 새 광고 방식(예: 문자발송)   -> '방식이름'
     - 조합만으로 이름이 안 예쁠 때 -> '특별조합'
     - 새 유입처(예: 네이버 밴드)   -> '넘어온곳'
     표에 없는 값이 와도 버리지 않고 원래 값을 그대로 남기므로,
     당장 안 고쳐도 자료를 잃지는 않는다.

   ■ 파일을 고친 뒤에는
     네 개 html 의 <script src="js/dh-inflow.js?v=1"> 에서 v 숫자를 하나 올린다.
     그래야 방문자 브라우저가 옛 파일을 재활용하지 않고 새로 받아 간다.
=================================================================== */
(function (global) {
'use strict';

var 보관일수 = 30;
var 저장이름 = 'dh_in';

/* -- 이름표 1 : 매체 (어느 회사에서 왔나) ------------------------ */
var 매체이름 = {
  naver:'네이버', google:'구글', daum:'다음', bing:'빙',
  instagram:'인스타', facebook:'페이스북', threads:'스레드',
  youtube:'유튜브', tiktok:'틱톡', band:'밴드',
  kakao:'카카오', daangn:'당근', tistory:'티스토리'
};

/* -- 이름표 2 : 방식 (어떤 형태의 광고·링크인가) ------------------ */
var 방식이름 = {
  cpc:'검색광고', display:'배너광고', paid_social:'릴스·피드광고',
  sponsored_blog:'블로그 의뢰', profile:'프로필', message:'메시지',
  social:'소셜', organic:'검색', referral:'링크',
  email:'메일', sms:'문자', video:'영상광고', affiliate:'제휴'
};

/* -- 이름표 3 : 조합만으로는 이름이 어색한 것만 따로 --------------
   열쇠는 [매체|방식|소재] 또는 [매체|방식] 이다.
   여기 없으면 '매체이름 + 방식이름' 으로 자동 조합한다.
   (예: instagram+profile -> "인스타 프로필", naver+display -> "네이버 배너광고") */
var 특별조합 = {
  'naver|cpc|powerlink' : '네이버 파워링크',
  'daangn|display'      : '당근 지역광고'
};

/* -- 이름표 4 : 꼬리표 없이 넘어왔을 때, 어느 사이트에서 왔나 ------
   [주소 조각, 사람이 읽을 이름, 매체]  -  위에서부터 먼저 맞는 것을 쓴다.
   그래서 자세한 것(cafe.naver.)을 뭉뚱그린 것(naver.)보다 위에 둔다.
   목록에 없는 곳은 주소를 그대로 적으므로 새 유입처도 저절로 구분된다. */
var 넘어온곳 = [
  ['cafe.naver.',   '네이버 카페',       'naver'],
  ['blog.naver.',   '네이버 블로그',     'naver'],
  ['post.naver.',   '네이버 포스트',     'naver'],
  ['in.naver.',     '네이버 인플루언서', 'naver'],
  ['search.naver.', '네이버 검색',       'naver'],
  ['naver.',        '네이버',            'naver'],
  ['google.',       '구글 검색',         'google'],
  ['bing.',         '빙 검색',           'bing'],
  ['daum.',         '다음 검색',         'daum'],
  ['tistory.',      '티스토리 블로그',   'tistory'],
  ['instagram.',    '인스타그램',        'instagram'],
  ['threads.',      '스레드',            'threads'],
  ['facebook.',     '페이스북',          'facebook'],
  ['youtube.',      '유튜브',            'youtube'],
  ['youtu.be',      '유튜브',            'youtube'],
  ['tiktok.',       '틱톡',              'tiktok'],
  ['band.us',       '네이버 밴드',       'band'],
  ['kakao.',        '카카오',            'kakao'],
  ['daangn.',       '당근',              'daangn'],
  ['linkstory.',    '링크스토리',        'linkstory'],
  ['chatgpt.',      'ChatGPT',           'chatgpt'],
  ['gemini.',       '제미나이',          'gemini'],
  ['perplexity.',   '퍼플렉시티',        'perplexity']
];

/* -- 사람이 읽을 이름 만들기 ------------------------------------- */
function 이름만들기(매체, 방식, 소재) {
  var 열쇠셋 = [매체, 방식, 소재].filter(Boolean).join('|');
  var 열쇠둘 = [매체, 방식].filter(Boolean).join('|');
  if (특별조합[열쇠셋]) return 특별조합[열쇠셋];
  if (특별조합[열쇠둘]) return 특별조합[열쇠둘];
  var 앞 = 매체 ? (매체이름[매체] || 매체) : '';
  var 뒤 = 방식 ? (방식이름[방식] || 방식) : '';
  return [앞, 뒤].filter(Boolean).join(' ');
}

/* -- 주소 뒤에 붙은 꼬리표(utm_) 읽기 ---------------------------- */
function 꼬리표읽기() {
  var 결과 = {}, 뒷부분 = location.search.replace(/^\?/, '');
  if (!뒷부분) return 결과;
  뒷부분.split('&').forEach(function (한칸) {
    var 자리 = 한칸.indexOf('=');
    if (자리 < 1) return;
    var 이름 = 한칸.slice(0, 자리), 값 = 한칸.slice(자리 + 1);
    try { 값 = decodeURIComponent(값.replace(/\+/g, ' ')); } catch (e) {}
    if (이름.indexOf('utm_') === 0) 결과[이름.slice(4)] = 값;
  });
  return 결과;
}

/* -- 꼬리표가 없을 때, 어디서 넘어왔는지 보기 ---------------------
   돌려주는 값
     null                -> 우리 페이지끼리 이동 (아무것도 건드리지 않는다)
     { 직접:true }       -> 어디서 왔는지 알 수 없다 (주소 직접 입력·앱에서 열기)
     { summary, source } -> 다른 사이트에서 넘어왔다                    */
function 넘어온곳찾기() {
  var 주소 = document.referrer || '';
  if (!주소) return { 직접: true };
  var 집 = '';
  try { 집 = new URL(주소).hostname.replace(/^www\./, ''); }
  catch (e) { return { 직접: true }; }
  if (집 === location.hostname) return null;
  for (var i = 0; i < 넘어온곳.length; i++) {
    if (집.indexOf(넘어온곳[i][0]) > -1) {
      return { summary: 넘어온곳[i][1], source: 넘어온곳[i][2] };
    }
  }
  return { summary: 집 + ' 링크', source: 집 };
}

/* -- 기억해 두기 / 꺼내 보기 ------------------------------------- */
function 저장하기(값) {
  try {
    값.until = Date.now() + 보관일수 * 86400000;
    localStorage.setItem(저장이름, JSON.stringify(값));
  } catch (e) {}
}
function 불러오기() {
  try {
    var 값 = JSON.parse(localStorage.getItem(저장이름) || 'null');
    if (!값) return null;
    if (값.until && Date.now() > 값.until) { localStorage.removeItem(저장이름); return null; }
    return 값;
  } catch (e) { return null; }
}

/* -- 페이지가 열릴 때 한 번만 판단한다 ----------------------------
   덮어쓰기 규칙
     1) 광고 꼬리표를 달고 왔다   -> 항상 덮어쓴다
     2) 다른 사이트에서 넘어왔다  -> 덮어쓴다      ★2026-08-20 고친 부분
     3) 우리 페이지끼리 이동      -> 그대로 둔다
     4) 어디서 왔는지 알 수 없다  -> 기존 기록이 있으면 그대로 둔다

   ★2번을 왜 고쳤나
     예전에는 기록이 하나라도 있으면 새 유입을 무시했다. 그 바람에 한 번
     인스타로 들어온 손님은 그 뒤 네이버 블로그를 통해 다시 와서 신청해도
     30일 동안 계속 "인스타"로 찍혔다. 블로그 성과가 통째로 인스타 몫이 됐다.
     이제는 마지막에 거쳐 온 곳이 이긴다(광고업계 기본인 '마지막 클릭' 방식).

   ★4번은 왜 그대로 두나
     광고를 보고 며칠 뒤 주소를 직접 쳐서 찾아온 손님을 광고 성과로 세기 위해서다.
     그래서 테스트할 때는 시크릿 창으로 열거나 dhInflowReset() 을 쓴다.      */
function 지금판단() {
  var 꼬리표 = 꼬리표읽기();

  if (꼬리표.source || 꼬리표.medium || 꼬리표.campaign) {
    저장하기({
      summary : [이름만들기(꼬리표.source, 꼬리표.medium, 꼬리표.content), 꼬리표.campaign]
                  .filter(Boolean).join(' / '),
      source  : 꼬리표.source || '',
      campaign: 꼬리표.campaign || '',
      detail  : [꼬리표.content, 꼬리표.term].filter(Boolean).join(' / '),
      page    : location.pathname || '/'
    });
    return;
  }

  var 어디 = 넘어온곳찾기();
  if (어디 === null) return;

  if (!어디.직접) {
    저장하기({
      summary : 어디.summary, source: 어디.source,
      campaign: '', detail: '', page: location.pathname || '/'
    });
    return;
  }

  if (불러오기()) return;
  저장하기({
    summary : '직접방문', source: '(direct)',
    campaign: '', detail: '', page: location.pathname || '/'
  });
}

/* -- 신청서를 보낼 때 같이 실어 보낼 내용 ------------------------- */
function dhInflow() {
  try {
    var 값 = 불러오기() || {};
    return {
      in_summary : 값.summary  || '직접방문',
      in_source  : 값.source   || '(direct)',
      in_campaign: 값.campaign || '',
      in_detail  : 값.detail   || '',
      in_page    : 값.page     || (location.pathname || '/')
    };
  } catch (e) { return {}; }
}

/* -- 테스트용 : 기억을 지우고 새 손님처럼 만든다 ------------------
   개발자도구 콘솔에 dhInflowReset() 을 치면 된다. 시크릿 창과 같은 효과. */
function dhInflowReset() {
  try { localStorage.removeItem(저장이름); } catch (e) {}
  지금판단();
  return dhInflow();
}

try { 지금판단(); } catch (e) {}

global.dhInflow = dhInflow;
global.dhInflowReset = dhInflowReset;

})(window);
