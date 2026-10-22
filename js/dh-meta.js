/* 당현함 메타 픽셀 공용 부품 (2026-10-21 화면 508장에 복사돼 있던 것을 여기 한 곳으로 모음)
   · 화면마다 <script src="(../)js/dh-meta.js?v=N"></script> 한 줄로 부른다. 바꾸면 ?v= 판 번호를 올릴 것.
   · 로봇 막음(navigator.webdriver → window.fbq 빈 함수)은 화면 머리에서 먼저 돈다 — 아래 첫 줄이 fbq 가 이미 있으면 그냥 넘어간다.
   · 신청(Lead)·카톡/전화(Contact) 신호는 js/dh-track.js 가 fbq('track',…) 로 보내므로, 여기 init 된 픽셀 모두에 간다. */
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','4048280455303580');   /* 당현함 포트폴리오 「당현함 픽셀」 — 광고 계정 당현함 광고(1103190795798508)와 연결됨 */
fbq('track','PageView');
