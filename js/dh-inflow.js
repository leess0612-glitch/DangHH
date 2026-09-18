/* ===================================================================
   당현함 유입경로 공용 부품  —  dh-inflow.js
   (2026-08-20 신설 / 같은 날 v2 · v3 / 2026-09-03 v4 : gclid 안전망 · v5 : 안 채워진 빈칸 걸러내기)

   ■ 무슨 일을 하나
     "이 손님이 어디서 왔는지"를 알아내 손님 브라우저에 7일 동안 기억해 두고,
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

   ⚠ 이 파일을 고치면 이 파일을 부르는 모든 화면의 ?v= 숫자를 같이 올려야 한다.
     안 올리면 전에 와 본 손님의 브라우저가 옛 파일을 그대로 쓴다.
     처음 오는 손님만 새 것을 보게 돼서, 같은 화면을 둘이 다르게 보는 상태가 된다.
     (설명 글만 고쳤을 때는 안 올려도 된다 — 화면 동작이 그대로이기 때문이다)
     지금 부르는 곳: 13곳. 찾는 법(DangHH 폴더에서):  grep -l "dh-inflow.js" *.html

   ■ 파일을 고친 뒤에는
     html 의 <script src="js/dh-inflow.js?v=5"> 에서 v 숫자를 하나 올린다.
     그래야 방문자 브라우저가 옛 파일을 재활용하지 않고 새로 받아 간다.
     ⚠개수를 여기 적힌 숫자로 믿지 말고 셀 때마다 직접 셀 것 —
       DangHH 폴더에서  grep -l "dh-inflow.js" *.html
     2026-09-07 기준 15개다. 라이브 12개(index · gift · rental · rental-c · plans ·
     plans-kt · plans-sk · plans-lg · plans-sky · plans-hello · privacy · terms)
     + 시험본 3개. 예전에 '여섯 개'라고 적혀 있었는데 그 사이 아홉 개가 늘었다.
     그 숫자를 믿고 여섯 개만 고치면 나머지는 옛 부품을 계속 쓰게 된다.
=================================================================== */
(function (global) {
'use strict';

var 보관일수 = 7;   /* 2026-09-04 : 30 -> 7. 인터넷·렌탈은 이사·약정만료처럼 날짜가 정해진 일이라
                       마음먹으면 며칠 안에 끝난다. 30일은 옛 기록이 오래 남아 이번 방문과 어긋났다.
                       (코웨이 전용 페이지가 생기면서 "어느 페이지에서 왔나"가 중요해진 것이 계기) */
var 저장이름 = 'dh_in';

/* -- 이름표 1 : 매체 (어느 회사에서 왔나) ------------------------ */
var 매체이름 = {
  naver:'네이버', google:'구글', daum:'다음', bing:'빙',
  instagram:'인스타', facebook:'페이스북', threads:'스레드',
  youtube:'유튜브', tiktok:'틱톡', band:'밴드',
  kakao:'카카오', daangn:'당근', tistory:'티스토리',
  x:'엑스', twitter:'엑스', linkedin:'링크드인', pinterest:'핀터레스트', line:'라인'
};

/* -- 이름표 2 : 방식 (어떤 형태의 광고·링크인가) ------------------ */
var 방식이름 = {
  cpc:'검색광고', display:'배너광고',
  /* paid_social 은 예전에 '릴스·피드광고' 였는데 인스타 기준이라 페북·틱톡·유튜브에 붙으면
     어색했다. '광고' 로 줄이니 어느 매체에 붙여도 자연스럽다 (2026-08-20).
     릴스인지 피드인지는 소재(utm_content) 칸에 적으면 된다.
     video 도 같은 이유로 '광고' 로 통일 — 유튜브·틱톡은 매체 이름만으로 영상인 걸 안다 */
  paid_social:'광고', video:'광고',
  sponsored_blog:'블로그 의뢰',
  /* 대행사에 링크를 넘길 때 쓴다. 대행사가 카페에 넣든 블로그에 넣든
     실제로 거쳐 온 곳은 아래 '경유' 로 따로 적히므로 이 이름은 그대로 둔다 */
  sponsored:'대행사 글',
  profile:'프로필', message:'메시지',
  social:'소셜', organic:'검색', referral:'링크',
  email:'메일', sms:'문자', affiliate:'제휴'
};

/* -- 이름표 3 : 조합만으로는 이름이 어색한 것만 따로 --------------
   열쇠는 [매체|방식|소재] 또는 [매체|방식] 이다.
   여기 없으면 '매체이름 + 방식이름' 으로 자동 조합한다.
   (예: instagram+profile -> "인스타 프로필", naver+display -> "네이버 배너광고") */
var 특별조합 = {
  'naver|cpc|powerlink'     : '네이버 파워링크',
  'naver|cpc|powercontents' : '네이버 파워컨텐츠',
  'daangn|display'          : '당근 지역광고'
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
  ['tv.naver.',     '네이버TV',          'naver'],
  ['clip.naver.',   '네이버 클립',       'naver'],
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
  ['perplexity.',   '퍼플렉시티',        'perplexity'],
  ['x.com',         '엑스',              'x'],
  ['twitter.',      '엑스',              'x'],
  ['t.co',          '엑스',              'x'],
  ['linkedin.',     '링크드인',          'linkedin'],
  ['pinterest.',    '핀터레스트',        'pinterest']
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

/* -- 채워지지 않은 빈칸인지 보기 ---------------------------------
   광고 회사에 "여기에 손님이 검색한 낱말을 넣어 주세요" 하고 부탁하는 자리는
   보통 {keyword} 처럼 중괄호로 감싸 적는다. 광고 회사가 그 부탁을 모르면
   글자가 그대로 넘어오는데, 그걸 시트에 적으면 지저분해지므로 버린다. */
function 안채워진빈칸(값) {
  return !값 || /^[{\[<].*[}\]>]$/.test(String(값).trim());
}

/* -- 네이버가 스스로 붙여 주는 검색어 읽기 (2026-08-20 추가) --------
   네이버 검색광고는 주소 뒤에 자기 표시를 붙여 주는 것으로 알려져 있다.
   붙는 이름이 설정에 따라 다를 수 있어 아래 목록에 후보를 적어 둔다.

   ■ 안전한 이유
     - utm_term 이 비었거나 안 채워진 빈칸일 때만 이걸 대신 쓴다
     - 채워 넣는 곳은 시트의 '소재·검색어' 칸 하나뿐이다.
       "어느 광고에서 왔나"를 가리는 판정은 전혀 건드리지 않는다
     - 이름이 안 맞으면 아무 일도 일어나지 않는다. 손해 볼 것이 없다
   ■ 이름이 다른 것으로 밝혀지면 아래 목록에 한 줄만 더하면 된다 */
var 검색어이름 = ['n_query', 'n_keyword'];
function 네이버검색어() {
  var 뒷부분 = location.search.replace(/^\?/, '');
  if (!뒷부분) return '';
  var 찾음 = '';
  뒷부분.split('&').forEach(function (한칸) {
    if (찾음) return;
    var 자리 = 한칸.indexOf('=');
    if (자리 < 1) return;
    if (검색어이름.indexOf(한칸.slice(0, 자리)) < 0) return;
    var 값 = 한칸.slice(자리 + 1);
    try { 값 = decodeURIComponent(값.replace(/\+/g, ' ')); } catch (e) {}
    if (!안채워진빈칸(값)) 찾음 = 값;
  });
  return 찾음;
}

/* -- 구글 광고가 스스로 붙이는 표시 읽기 (2026-09-03 추가) ----------
   구글 검색광고를 누르면 주소 뒤에 gclid=... 가 붙는다. 구글이 자동으로 붙이는 것이라
   광고를 대신 돌리는 대행사가 아무 설정을 안 해도 붙는다.
   이 표시가 있으면 그 손님은 '구글 광고를 눌러 들어온 것'이 확실하다.

   ■ 왜 넣었나 (2026-09-02 상황)
     구글 검색광고를 대행사 계정으로 돌리게 되면서, 우리가 꼬리표를 붙이려면
     대행사에 부탁해야 하는 처지가 됐다. 대행사가 안 붙이거나 나중에 실수로 지우면
     광고 손님이 그냥 구글에서 검색해 들어온 손님과 똑같이 '구글 검색'으로 적힌다.
     그러면 광고비를 얼마 써서 신청 몇 건을 얻었는지 알 수 없다.

   ■ 안전한 이유
     - utm_ 꼬리표가 있으면 그쪽이 이긴다. 여기는 꼬리표가 없을 때만 본다
     - 지금까지 '구글 검색'으로 뭉뚱그려 적히던 것을 '구글 검색광고'로 바로잡을 뿐,
       없어지는 자료가 없다
     - 표시가 없으면 아무 일도 일어나지 않는다 (예전과 똑같이 굴러간다)

   ■ 한계
     gclid 에는 낱말이 들어 있지 않다. 어느 키워드로 들어왔는지는
     여전히 utm_content 가 있어야 알 수 있다. 이것은 꼬리표를 대신하는 게 아니라
     꼬리표가 없을 때를 받쳐 주는 안전망이다.

   ■ gbraid·wbraid 는 무엇인가
     아이폰처럼 개인정보 보호가 걸린 환경에서 구글이 gclid 대신 붙이는 표시다.
     셋 다 뜻은 같으므로 함께 본다. */
var 구글광고표시이름 = ['gclid', 'gbraid', 'wbraid'];
function 구글광고인가() {
  var 뒷부분 = location.search.replace(/^\?/, '');
  if (!뒷부분) return false;
  var 찾음 = false;
  뒷부분.split('&').forEach(function (한칸) {
    if (찾음) return;
    var 자리 = 한칸.indexOf('=');
    if (자리 < 1) return;
    if (구글광고표시이름.indexOf(한칸.slice(0, 자리)) < 0) return;
    /* 값이 변환된 채로 올 수 있으므로(%7Bgclid%7D) 되돌려서 본다.
       그래야 안 채워진 빈칸 {gclid} 를 제대로 걸러낸다 */
    var 값 = 한칸.slice(자리 + 1);
    try { 값 = decodeURIComponent(값.replace(/\+/g, ' ')); } catch (e) {}
    if (!안채워진빈칸(값)) 찾음 = true;
  });
  return 찾음;
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
    /* ★2026-08-20 : 꼬리표가 있어도 '실제로 어느 사이트에서 눌렀는지' 를 같이 적는다.
       예전에는 꼬리표가 있으면 이걸 버렸다. 그 바람에 대행사에 링크를 넘길 때
       "이건 카페용, 이건 블로그용" 하고 미리 나눠 줘야 했는데, 대행사는 노출될 때까지
       여러 곳에 반복해 올리므로 애초에 나눌 수가 없었다.
       이제 링크는 대행사마다 하나만 주면 되고, 카페냐 블로그냐는 여기서 갈린다.
       인스타처럼 중간에 링크스토리를 거치는 경우도 '(링크스토리 경유)' 로 드러나
       중간에서 얼마나 새는지 신청 단위로 보인다. */
    var 경유 = 넘어온곳찾기();
    var 경유말 = (경유 && !경유.직접) ? ' (' + 경유.summary + ' 경유)' : '';
    /* 손님이 검색한 낱말 : utm_term 이 제대로 채워졌으면 그것을 쓰고,
       비었거나 {keyword} 처럼 안 채워진 빈칸이면 네이버가 붙여 준 것을 쓴다 */
    var 검색낱말 = 안채워진빈칸(꼬리표.term) ? 네이버검색어() : 꼬리표.term;

    /* ★2026-09-03 : 소재·묶음도 '안 채워진 빈칸'을 걸러낸다.
       예전에는 검색어(utm_term) 한 곳만 걸렀다. 소재·묶음에는 사람이 직접 적은 값만
       들어온다고 봤기 때문이다. 그런데 구글 검색광고를 쓰면서 소재 자리에
       {keyword} 를 넣게 됐다 — 구글더러 낱말을 채워 달라는 표시다.
       구글이 못 채우면 그 글자가 그대로 넘어와 시트에 '{keyword}' 라고 적힌다.
       실제로 그렇게 적히는 것을 확인하고 막았다. 묶음(campaign)도 광고사가 채워 주는
       표시를 넣을 수 있어 같이 거른다. */
    var 소재 = 안채워진빈칸(꼬리표.content)  ? '' : 꼬리표.content;
    var 묶음 = 안채워진빈칸(꼬리표.campaign) ? '' : 꼬리표.campaign;

    저장하기({
      summary : [이름만들기(꼬리표.source, 꼬리표.medium, 소재), 묶음]
                  .filter(Boolean).join(' / ') + 경유말,
      source  : 꼬리표.source || '',
      campaign: 묶음,
      detail  : [소재, 검색낱말].filter(Boolean).join(' / '),
      page    : location.pathname || '/'
    });
    return;
  }

  /* 꼬리표는 없는데 구글 광고 표시만 붙어 있는 경우 (2026-09-03)
     꼬리표보다는 아래, 넘어온 곳 판단보다는 위에 둔다.
     구글에서 넘어온 것은 맞지만 '검색'이 아니라 '광고'라는 것을 여기서 가려낸다 */
  if (구글광고인가()) {
    저장하기({
      summary : 이름만들기('google', 'cpc', ''),
      source  : 'google',
      campaign: '',
      detail  : '',
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

/* ══════════════════════════════════════════════════════════════════════
   들어온 문 기억 · 2026-09-18 (2026-09-16 「코웨이 문 기억」을 넓힌 것)
   ──────────────────────────────────────────────────────────────────────
   ⛔ 왜 필요한가
     손님이 들어오는 문이 셋입니다.
       · 당현함 첫화면 (danghh.com)   — 인터넷 가입
       · 렌탈 메인 (rental.html)       — 정수기·가전 렌탈
       · 코웨이 렌탈 (rental-c.html)   — 코웨이 광고 전용

     그런데 요금표·사은품명단·셋톱·약관처럼 **문이 하나뿐인 화면**은 [혜택안내]가
     늘 당현함 첫화면으로 가 있었습니다. 렌탈로 들어온 손님이 사은품명단에
     들렀다가 렌탈로 못 돌아왔습니다 (2026-09-18 사장님 지적).
     2026-09-16 에 정한 세 갈래 규칙 중 ③번(들어온 문을 따라간다)이
     코웨이에만 만들어져 있고 첫화면·렌탈 구분은 빠져 있었습니다.

   ★ 무엇을 하나
     ① 문 셋 중 어디에 닿았는지 기억합니다.
     ② 그 뒤로는 어느 화면에서든 메뉴와 로고가 그 문의 집을 가리킵니다.
     ③ 정수기도 함께 갈립니다 — 코웨이 문이면 water-c/, 아니면 water/.

   ★ 기억이 바뀌는 자리 — 지금 보고 있는 화면이 정합니다
     · 당현함 첫화면        -> 첫화면
     · 렌탈 메인            -> 렌탈
     · 코웨이 렌탈·코웨이 정수기 -> 코웨이
     · 그 밖(**일반 정수기**·요금표·사은품명단·셋톱·약관·가전) -> 바꾸지 않고 따라만 갑니다
       (A안 · 2026-09-18 사장님 결정 — 정수기는 갈래를 바꾸지 않습니다)

   ★ 기억이 **없으면 아무것도 바꾸지 않습니다.**
     광고나 검색으로 사은품명단에 바로 들어온 손님은 화면에 적힌 그대로 다닙니다.

   ★ 기억은 sessionStorage 입니다 — 창을 닫으면 잊습니다. 탭마다 따로입니다.
     주소에 표시를 붙이지 않으므로 카톡으로 퍼지거나 검색에 걸리지 않습니다.

   ⚠ 검색엔진은 이 기억을 쓰지 않습니다. 크롤러에게는 화면에 적힌 원래 주소가
     그대로 보입니다. water-c/ 는 noindex 이므로 영향 없습니다.

   ※ 2026-09-18 — 정수기 화면 200장에 따로 있던 로고용 기억(dh_정수기_들어온문)을
     없애고 이 기억 하나로 합쳤습니다. 같은 일을 하는 기억이 둘이면 한쪽만 고쳤을 때
     조용히 어긋나기 때문입니다 (사장님 지적).
   ══════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var 열쇠 = 'dh_door';            /* 'index' | 'rental' | 'coway' */
  var 옛열쇠 = 'dh_coway_door';    /* 2026-09-16 판. 옛 판을 쓰던 창에서 넘어오면 옮겨 읽습니다 */

  var 집주소 = { index: '/index.html', rental: '/rental.html', coway: '/rental-c.html' };

  function 길() {
    try { return decodeURIComponent(global.location.pathname || '/'); }
    catch (e) { return global.location.pathname || '/'; }
  }

  function 기억읽기() {
    try {
      var v = global.sessionStorage.getItem(열쇠);
      if (v === 'index' || v === 'rental' || v === 'coway') return v;
      if (global.sessionStorage.getItem(옛열쇠) === '1') return 'coway';
    } catch (e) {}
    return null;
  }
  function 기억쓰기(값) {
    try {
      if (값) global.sessionStorage.setItem(열쇠, 값);
      else global.sessionStorage.removeItem(열쇠);
      global.sessionStorage.removeItem(옛열쇠);
    } catch (e) {}
  }

  /* 지금 화면이 정하는 집. null 이면 이 화면은 집을 바꾸지 않습니다.
     ⚠ 일반 정수기(/water/)도 **집을 바꾸지 않습니다** (2026-09-18 사장님 결정).
       처음엔 「코웨이만 벗긴다」로 두었는데, 그러면 코웨이 문으로 들어온 손님이
       일반 정수기에 한 번 닿는 것만으로 메뉴가 렌탈 메인을 가리켰습니다.
       ① 「들어온 문을 끝까지 유지한다」는 지시와 어긋나고
       ② 렌탈 메인·첫화면에는 손님 눈에 보이는 「현금」이 23번씩 있습니다.
          코웨이 화면만 0번으로 맞춰 둔 까닭(코웨이 정책)이 무너집니다.
       두 목록은 제품 199장이 똑같으므로 코웨이 문을 그대로 둬도 손님이 보는 것은 같고,
       거기서 제품을 누르면 코웨이판(/water-c/…)으로 저절로 돌아옵니다. */
  function 이화면의집(p) {
    if (/\/rental-c\.html$/.test(p) || /\/water-c(\/|$)/.test(p)) return 'coway';
    if (/\/rental\.html$/.test(p)) return 'rental';
    if (/\/index\.html$/.test(p) || /^\/?$/.test(p)) return 'index';
    return null;
  }

  /* 자리표는 세 집에 모두 있습니다 (compare · reviews · faq · apply).
     #apply-now 와 #applyForm 은 첫화면만 아는 신호라 다른 집에서는 #apply 로 옮깁니다. */
  var 옮길자리 = { '#apply-now': '#apply', '#applyForm': '#apply' };
  function 자리옮김(자리, 집) {
    if (!자리) return '';
    if (집 === 'index') return 자리;
    return 옮길자리[자리] || 자리;
  }

  /* ── 주소를 보고 바꾼다 (메뉴 글자가 아니라) ─────────────────────
     글자로 고르면 화면마다 메뉴 이름이 달라 빠지는 곳이 생깁니다.
     ⚠ 일반 정수기 상세의 [정수기렌탈] 메뉴는 '../' 라서 'water' 라는 글자가
       아예 없습니다(2026-09-16 전수 훑기가 잡아낸 결함). 그래서 지금 화면을
       기준으로 주소를 **펼쳐서** 어디로 가는지 봅니다. */
  function 바꾼주소(h, 집) {
    if (!h) return null;
    if (h.charAt(0) === '#') return null;
    if (/^(https?:|tel:|mailto:|javascript:|data:)/i.test(h)) return null;

    var 펼침;
    try { 펼침 = new URL(h, global.location.href); } catch (e) { return null; }
    if (펼침.origin !== global.location.origin) return null;

    var 속 = 펼침.pathname, 자리 = 펼침.hash || '', 찾기 = 펼침.search || '';

    /* ① 정수기 — 코웨이 문이면 water-c/, 아니면 water/ */
    if (/^\/water(-c)?\//.test(속)) {
      var 바랄 = (집 === 'coway') ? '/water-c/' : '/water/';
      var 새속 = 속.replace(/^\/water(-c)?\//, 바랄);
      return (새속 === 속) ? null : 새속 + 찾기 + 자리;
    }

    /* ② 집 — 기억한 문의 집으로 (로고도 이 규칙을 탑니다) */
    if (/^\/(index\.html)?$/.test(속) || /^\/rental\.html$/.test(속) || /^\/rental-c\.html$/.test(속)) {
      var 새집 = 집주소[집];
      var 새자리 = 자리옮김(자리, 집);
      var 그대로 = (속 === 새집) || (집 === 'index' && /^\/$/.test(속));
      if (그대로 && 새자리 === 자리) return null;
      return 새집 + 찾기 + 새자리;
    }

    return null;
  }

  function 고치기() {
    var 집 = 기억읽기();
    if (!집) return;                       /* 기억이 없으면 화면에 적힌 그대로 둡니다 */
    var 링크 = global.document.querySelectorAll('a[href]');
    for (var i = 0; i < 링크.length; i++) {
      var a = 링크[i];
      var 새주소 = 바꾼주소(a.getAttribute('href'), 집);
      if (새주소) { a.setAttribute('href', 새주소); a.setAttribute('data-coway-door', '1'); }
    }
  }

  /* ── 실행 ─────────────────────────────────────────────────────── */
  function 돌기() {
    /* 집을 정하는 화면은 셋뿐입니다 — 첫화면 · 렌탈 메인 · 코웨이 렌탈(그리고 코웨이 정수기).
       그 밖 화면(요금표·사은품명단·약관·셋톱·가전·**일반 정수기**)은 따라만 갑니다.
       기억이 아예 없으면 만들지도 않습니다 — 화면에 적힌 그대로 다닙니다. */
    var 이집 = 이화면의집(길());
    if (이집) 기억쓰기(이집);
    고치기();
  }

  try { 돌기(); } catch (e) {}

  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', function () {
      try { 고치기(); } catch (e) {}
    });
  }

  /* 뒤로가기로 되살아난 화면(bfcache)에서도 다시 맞춘다 */
  global.addEventListener('pageshow', function (e) {
    if (e && e.persisted) { try { 돌기(); } catch (err) {} }
  });

  /* 폰 메뉴가 나중에 만들어지는 화면이 있어 한 번 더 늦게 맞춘다 */
  global.addEventListener('load', function () { try { 고치기(); } catch (e) {} });

  /* ── 누를 때 한 번 더 잡는 그물 ─────────────────────────────
     화면이 다 뜬 뒤에 자바스크립트가 새로 만들어 붙이는 링크(비교함 사진 등)는
     위 고치기()가 지나간 뒤에 생깁니다. 그래서 누르는 순간에 한 번 더 봅니다. */
  global.document.addEventListener('click', function (e) {
    var 집 = 기억읽기();
    if (!집) return;
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var 새주소 = 바꾼주소(a.getAttribute('href'), 집);
    if (새주소) { a.setAttribute('href', 새주소); a.setAttribute('data-coway-door', 'click'); }
  }, true);

  /* 밖에서 들여다보거나 지울 수 있게 열어 둡니다 */
  global.dhDoor = {
    지금: 기억읽기,
    바꾸기: function (값) { 기억쓰기(값); 고치기(); },
    지우기: function () { 기억쓰기(null); }
  };
  /* 2026-09-16 판 이름도 그대로 둡니다 — 다른 데서 부르고 있을 수 있습니다 */
  global.dhCowayDoor = {
    켜짐: function () { return 기억읽기() === 'coway'; },
    지우기: function () { if (기억읽기() === 'coway') 기억쓰기('rental'); }
  };

})(window);
