/* ══════════════════════════════════════════════════════════════════
   요금표 모바일 카드형 — 라이브 (2026-09-15)
   폰(≤768px)에서는 '가로로 넓어 한 화면에 안 들어가는 표'를 카드형으로 바꾼다.
   · 메인 요금표(table.rate) : 상품 카드 + 속도별 블록(결합별 요금·사은품). 펼친 상태(접힘 없음).
   · 결합할인(bundle-tbl)·총액/약정·공유기 등 넓은 표(term-tbl.wide) : 줄마다 카드(항목: 값).
   · 좁아서 이미 들어가는 표(term-tbl.txt / vs / 2칸)는 그대로 둔다.
   PC는 원래 표 그대로. 요금표 5개 통신사 공통. 고치면 부르는 html 의 ?v= 를 올릴 것.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  var css = document.createElement('style');
  css.textContent = [
    '@media (max-width:768px){',
    '  .rc-hide{display:none !important;}',
    '  .rate-body .scroll-hint{display:none !important;}',   /* "표를 옆으로 밀면..." 안내 제거 */
    '  .term p.term-hint{display:none !important;}',          /* 넓은 표 안내도 제거(카드라 밀 필요 없음) */
    '  .rate-cards, .gc-cards{display:block;}',
    /* 좁은 숫자표는 카드 대신 '압축 표'로 한눈에 — 폰 폭에 다 들어가게 여백·글자·고정을 줄인다 */
    '  table.rc-compact{min-width:0 !important;table-layout:fixed;width:100%;}',
    '  table.rc-compact th, table.rc-compact td{padding:9px 4px !important;font-size:12.5px !important;min-width:0 !important;height:auto !important;white-space:normal;}',
    '  table.rc-compact th.rn{position:static !important;left:auto !important;width:34% !important;min-width:0 !important;padding-left:8px !important;text-align:left;box-shadow:none !important;}',
    /* 압축표 첫 칸(상품/항목 이름)은 줄바꿈 허용 + 왼쪽 정렬 + 조금 넓게 */
    '  table.rc-compact tbody tr > *:first-child{width:40%;text-align:left;padding-left:8px !important;word-break:keep-all;line-height:1.35;font-weight:700;}',
    '  table.rc-compact thead th:first-child{text-align:left;padding-left:8px !important;}',
    /* 표 머리(thead) 전부 회색 — 빨강은 탭·메인 요금카드에만 남긴다 */
    '  .term-tbl thead th{background:#EDEFF2 !important;color:var(--dark,#111) !important;}',
    /* 총액 결합 할인표 접기(아코디언) — 모바일 전용 */
    '  h4.rc-fold{cursor:pointer;display:flex;align-items:center;gap:8px;background:#EDEFF2;color:var(--dark,#111);padding:12px 15px;border-radius:12px;margin:14px 0 8px;-webkit-tap-highlight-color:transparent;}',
    '  h4.rc-fold .rc-arrow{margin-left:auto;flex:0 0 auto;width:0;height:0;border-top:6px solid transparent;border-bottom:6px solid transparent;border-left:8px solid #55585D;opacity:.8;transition:transform .22s ease;}',
    '  h4.rc-fold.rc-open .rc-arrow{transform:rotate(90deg);}',
    '  .gc-cards.gc-acc.rc-collapsed{display:none !important;}',
    /* 접기 머리만 빨강 → 그 안 속도 소제목은 회색으로 차분하게(빨강 제거) */
    '  .gc-cards.gc-acc .gc-title{background:#EDEFF2;color:var(--dark,#111);}',
    '}',
    '@media (min-width:769px){ .rate-cards, .gc-cards{display:none;} }',
    /* 메인 요금표 카드 */
    '.rate-cards{margin:8px 0 0;}',
    '.rc-card{border:1px solid var(--border,#E5E7EB);border-top:3px solid var(--head-bg,#D92D20);border-radius:14px;overflow:hidden;margin-bottom:16px;background:#fff;}',
    '.rc-head{background:#fff;color:var(--dark,#111);padding:14px 16px;border-bottom:1px solid #F0F1F3;}',
    '.rc-head .rc-best{display:inline-block;background:var(--head-bg,#D92D20);color:#fff;font-size:12px;font-weight:800;border-radius:999px;padding:2px 9px;margin-bottom:6px;}',
    '.rc-head .rc-name{display:block;font-size:17px;font-weight:800;letter-spacing:-0.3px;line-height:1.35;color:var(--dark,#111);}',
    '.rc-head .rc-ch{display:block;font-size:13px;font-weight:500;color:#55585D;margin-top:3px;}',
    '.rc-speed{padding:13px 16px;border-top:1px solid #F0F1F3;}',
    '.rc-speed:first-child{border-top:none;}',
    '.rc-speed-top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;}',
    '.rc-speed-name{font-size:15px;font-weight:800;color:var(--dark,#111);}',
    '.rc-gift{font-size:13px;font-weight:700;color:#D92D20;text-align:right;}',
    '.rc-fees{display:flex;flex-direction:column;gap:5px;}',
    '.rc-fee{display:flex;justify-content:space-between;align-items:center;font-size:14px;}',
    '.rc-fee .rc-kind{color:#55585D;font-weight:600;}',
    '.rc-fee .rc-won{font-weight:800;color:var(--dark,#111);}',
    /* 일반 표 카드(결합할인·약정·공유기 등) */
    '.gc-cards{margin:4px 0 0;}',
    '.gc-card{border:1px solid var(--border,#E5E7EB);border-radius:12px;margin-bottom:12px;background:#fff;overflow:hidden;}',
    /* 카드 제목 띠 — 빨강 대신 회색(빨강은 탭·메인 요금카드·접기머리에만). 위계를 낮춰 담백하게 */
    '.gc-title{background:#EDEFF2;color:var(--dark,#111);padding:11px 15px;font-size:15px;font-weight:800;line-height:1.35;}',
    '.gc-sub{padding:0 15px 4px;}',
    '.gc-sub + .gc-sub{border-top:7px solid #F3F4F6;}',
    '.gc-kv{display:flex;justify-content:space-between;gap:12px;padding:9px 2px;font-size:14px;line-height:1.5;border-top:1px solid #ECEEF1;}',
    '.gc-kv:first-child{border-top:none;}',
    '.gc-k{color:#55585D;font-weight:600;flex:0 0 auto;}',
    '.gc-v{font-weight:600;color:var(--dark,#111);text-align:right;word-break:keep-all;}',
    '.gc-v.gc-name{font-weight:800;}',   /* 상품 이름 값만 굵게(강조), 조건·금액 등은 보통 굵기 */
    /* 2칸짜리 표(항목|내용) : 카드 하나에 목록으로. 빨간 헤더 반복 안 함 */
    '.gc-2col{}',
    '.gc2-item{padding:12px 15px;border-top:1px solid #ECEEF1;}',
    '.gc2-item:first-child{border-top:none;}',
    '.gc2-k{font-size:13px;font-weight:700;color:#55585D;margin-bottom:4px;}',
    '.gc2-v{font-size:14px;font-weight:600;color:var(--dark,#111);line-height:1.6;word-break:keep-all;}',
    /* 셋톱박스별 지원 서비스(OTT) : 빨간 카드 여러 장 대신 회색 카드 한 장에 요약 줄 */
    '.sp-item{padding:12px 15px;border-top:1px solid #ECEEF1;}',
    '.sp-item:first-child{border-top:none;}',
    '.sp-names{font-weight:800;color:var(--dark,#111);font-size:14px;line-height:1.5;word-break:keep-all;}',
    '.sp-range{margin-top:3px;font-size:13px;color:#55585D;font-weight:600;line-height:1.5;word-break:keep-all;}'
  ].join('\n');
  document.head.appendChild(css);

  /* 표를 격자로 펼친다(rowspan/colspan 해결). 각 칸: {html,text,cls,first} */
  function grid(scope) {
    var g = [], rows = scope.querySelectorAll(':scope > tr, :scope tr');
    // tbody/thead 무관하게 전달받은 rows 를 쓰도록 아래에서 넘긴다
    return g;
  }
  function gridRows(rows) {
    var g = [];
    for (var r = 0; r < rows.length; r++) {
      if (!g[r]) g[r] = [];
      var c = 0, cells = rows[r].children;
      for (var i = 0; i < cells.length; i++) {
        while (g[r][c]) c++;
        var cell = cells[i], rs = cell.rowSpan || 1, cs = cell.colSpan || 1;
        for (var a = 0; a < rs; a++) for (var b = 0; b < cs; b++) {
          if (!g[r + a]) g[r + a] = [];
          g[r + a][c + b] = { html: cell.innerHTML, text: (cell.textContent || '').trim().replace(/\s+/g, ' '), cls: cell.className || '', first: (a === 0 && b === 0), tag: cell.tagName };
        }
        c += cs;
      }
    }
    return g;
  }

  /* ── 메인 요금표(table.rate) → 상품 카드 ── */
  function speeds(t) { return [].map.call(t.querySelectorAll('thead tr:first-child th.speed-head'), function (e) { return e.textContent.trim(); }); }
  function buildRate(t) {
    var sp = speeds(t); if (!sp.length) return null;
    var g = gridRows(t.querySelectorAll('tbody tr'));
    var box = document.createElement('div'); box.className = 'rate-cards';
    var cur = null;
    for (var r = 0; r < g.length; r++) {
      var row = g[r]; if (!row) continue;
      // 추가TV(셋톱 임대료) 안내 줄 등은 카드에서 뺀다 (사장님 지시)
      var skip = false;
      for (var k = 0; k < row.length; k++) { if (row[k] && /addtv-list/.test(row[k].cls)) { skip = true; break; } }
      if (skip) continue;
      var prod = row[0];
      if (prod && prod.first && /(^|\s)prod(\s|$)/.test(prod.cls)) {
        cur = document.createElement('div'); cur.className = 'rc-card';
        var head = document.createElement('div'); head.className = 'rc-head';
        head.innerHTML = prod.html.replace(/class="best"/g, 'class="rc-best"').replace(/class="pname"/g, 'class="rc-name"').replace(/class="ch"/g, 'class="rc-ch"');
        cur.appendChild(head);
        cur._fees = [];
        for (var s = 0; s < sp.length; s++) {
          var sd = document.createElement('div'); sd.className = 'rc-speed';
          var gift = row[3 + s * 2];
          sd.innerHTML = '<div class="rc-speed-top"><span class="rc-speed-name">' + sp[s] + '</span>' +
            (gift && gift.text ? '<span class="rc-gift">' + gift.html + '</span>' : '') + '</div><div class="rc-fees"></div>';
          cur._fees.push(sd.querySelector('.rc-fees'));
          cur.appendChild(sd);
        }
        box.appendChild(cur);
      }
      if (cur && row[1]) {
        var kind = row[1].text || '';
        for (var s2 = 0; s2 < sp.length; s2++) {
          var fee = row[2 + s2 * 2]; if (!fee) continue;
          var line = document.createElement('div'); line.className = 'rc-fee';
          line.innerHTML = '<span class="rc-kind">' + kind + '</span><span class="rc-won">' + fee.text + '</span>';
          if (cur._fees[s2]) cur._fees[s2].appendChild(line);
        }
      }
    }
    return box.children.length ? box : null;
  }

  /* ── 일반 넓은 표 → 줄마다 카드(항목: 값) ── */
  function headLabels(t) {
    var out = [], hr = t.querySelector('thead tr'); if (!hr) return out;
    [].forEach.call(hr.children, function (th) { for (var i = 0; i < (th.colSpan || 1); i++) out.push(th.textContent.trim()); });
    return out;
  }
  function buildGeneral(t) {
    var heads = headLabels(t); if (heads.length < 2) return null;
    var g = gridRows(t.querySelectorAll('tbody tr'));
    var box = document.createElement('div'); box.className = 'gc-cards';

    /* 2칸짜리 표(항목|내용) → 카드 하나에 목록. 줄마다 빨간 헤더 안 만든다 */
    if (heads.length === 2) {
      var card2 = document.createElement('div'); card2.className = 'gc-card gc-2col';
      for (var i2 = 0; i2 < g.length; i2++) {
        var row2 = g[i2]; if (!row2 || !row2[0] || row2[0].text === '') continue;
        var v2 = row2[1] ? row2[1].html : '';
        var it = document.createElement('div'); it.className = 'gc2-item';
        it.innerHTML = '<div class="gc2-k">' + row2[0].html + '</div><div class="gc2-v">' + v2 + '</div>';
        card2.appendChild(it);
      }
      if (card2.children.length) box.appendChild(card2);
      return box.children.length ? box : null;
    }

    var cur = null;
    for (var r = 0; r < g.length; r++) {
      var row = g[r]; if (!row || !row[0]) continue;
      if (row[0].first) {
        cur = document.createElement('div'); cur.className = 'gc-card';
        var title = document.createElement('div'); title.className = 'gc-title';
        title.innerHTML = row[0].html.replace(/<br\s*\/?>/gi, '·');   /* "500메가<br>1기가" → "500메가·1기가" */
        cur.appendChild(title);
        box.appendChild(cur);
      }
      if (!cur) continue;
      var sub = document.createElement('div'); sub.className = 'gc-sub'; var any = false;
      for (var c = 1; c < heads.length; c++) {
        var cell = row[c];
        if (cell && cell.first && cell.text !== '') {
          var vcls = /상품/.test(heads[c]) ? ' gc-name' : '';   // 상품 이름만 강조, 나머진 담백하게
          sub.innerHTML += '<div class="gc-kv"><span class="gc-k">' + heads[c] + '</span><span class="gc-v' + vcls + '">' + cell.html + '</span></div>';
          any = true;
        }
      }
      if (any) cur.appendChild(sub);
    }
    return box.children.length ? box : null;
  }

  /* ── 셋톱박스별 지원 서비스(OTT) 표 → 요약 카드 한 장 ──
     [항목 × 셋톱] 이든 [셋톱 × OTT] 이든, 지원 범위가 같은 줄끼리 묶어 한 줄로 적는다.
     대부분 전부 지원(O)이라 "모든 셋톱에서 됩니다"로 접어 빨강·반복을 없앤다. */
  function isSupportTable(t) {
    var el = t.closest('.term-scroll,.table-scroll');
    while (el) {   // 표 앞에 '옆으로 밀어서 보세요' 문단이 낄 수 있어, 제일 가까운 제목까지 거슬러 올라간다
      el = el.previousElementSibling; if (!el) break;
      if (/^H[34]$/.test(el.tagName)) return /지원 서비스/.test(el.textContent);
    }
    return false;
  }
  function buildSupport(t) {
    var heads = headLabels(t); if (heads.length < 2) return null;
    var cols = heads.slice(1);
    // 가로줄이 셋톱인지(머리[0]='항목') 아니면 OTT인지(머리[0]='구분')로 문구를 맞춘다
    var colsAreSettop = /항목/.test((heads[0] || '').replace(/\s/g, ''));
    var g = gridRows(t.querySelectorAll('tbody tr'));
    var groups = {}, order = [];
    for (var r = 0; r < g.length; r++) {
      var row = g[r]; if (!row || !row[0] || row[0].text === '') continue;
      var yes = [], sig = [];
      for (var i = 1; i < heads.length; i++) {
        var v = row[i] && row[i].text ? row[i].text.trim() : '';
        var ok = /^[oO0○◯]/.test(v) || v === '지원';
        sig.push(ok ? 1 : 0);
        if (ok) yes.push(cols[i - 1]);
      }
      var key = sig.join('');
      if (!groups[key]) { groups[key] = { names: [], yes: yes, all: yes.length === cols.length }; order.push(key); }
      groups[key].names.push(row[0].html);
    }
    if (!order.length) return null;
    var box = document.createElement('div'); box.className = 'gc-cards';
    var card = document.createElement('div'); card.className = 'gc-card gc-support';
    order.forEach(function (k) {
      var gr = groups[k];
      var range = gr.all ? (colsAreSettop ? '모든 셋톱에서 됩니다' : '모두 됩니다')
                : gr.yes.length ? gr.yes.join(' · ') + ' 지원'
                : '지원하지 않습니다';
      var it = document.createElement('div'); it.className = 'sp-item';
      it.innerHTML = '<div class="sp-names">' + gr.names.join(' · ') + '</div><div class="sp-range">' + range + '</div>';
      card.appendChild(it);
    });
    box.appendChild(card);
    return card.children.length ? box : null;
  }

  function wrapOf(t) { return t.closest('.rate-wrap') || t.closest('.table-scroll') || t.closest('.term-scroll') || t; }

  function convert(t, builder) {
    if (t.getAttribute('data-rc') === '1') return;
    var cards = builder(t); if (!cards) return;
    var w = wrapOf(t); w.classList.add('rc-hide');
    w.parentNode.insertBefore(cards, w.nextSibling);
    t.setAttribute('data-rc', '1');
  }

  function render() {
    // 이미 만든 카드/압축표시 지우고 다시(통신사 탭 변경 대비)
    [].forEach.call(document.querySelectorAll('.rate-cards, .gc-cards'), function (e) { e.remove(); });
    [].forEach.call(document.querySelectorAll('[data-rc]'), function (e) { e.removeAttribute('data-rc'); e.classList.remove('rc-hide'); });
    [].forEach.call(document.querySelectorAll('.rc-compact'), function (e) { e.classList.remove('rc-compact'); });
    // 메인 요금표 → 상품 카드
    [].forEach.call(document.querySelectorAll('table.rate'), function (t) { convert(t, buildRate); });
    // 넓은 표(결합할인·약정·공유기·총액·OTT 등)를 자동 분류:
    //  · 칸 5개 이하 + 값이 짧은 숫자표 → '압축 표'로 한눈에(약정·공유기 등)
    //  · 그 외(칸 많거나 글 긴 표) → 카드(결합할인·총액·OTT 등)
    [].forEach.call(document.querySelectorAll('table.bundle-tbl, table.term-tbl.wide'), function (t) {
      if (isSupportTable(t)) { convert(t, buildSupport); return; }   // OTT 지원 표는 요약 카드로
      if (isCompactable(t)) {
        t.classList.add('rc-compact');
        // 압축해도 폰 폭에 안 들어가면(칸이 많아 눌리면) 카드로 되돌린다
        var w = t.closest('.term-scroll,.table-scroll') || t.parentElement;
        if (window.innerWidth <= 768 && t.scrollWidth > w.clientWidth + 2) {
          t.classList.remove('rc-compact'); convert(t, buildGeneral);
        }
      } else convert(t, buildGeneral);
    });
    setupFold();
  }

  /* 총액 결합 할인표(제목 h4 "총액 결합 할인표")만 폰에서 접기 단추로 — 화살표가 돌아간다 */
  function setupFold() {
    var wrap = null, h4 = null;
    [].some.call(document.querySelectorAll('table.bundle-tbl'), function (t) {
      var w = t.closest('.table-scroll'), h = w && w.previousElementSibling;
      if (h && h.tagName === 'H4' && /총액\s*결합\s*할인표/.test(h.textContent)) { wrap = w; h4 = h; return true; }
      return false;
    });
    if (!wrap || !h4) return;
    var cards = wrap.nextElementSibling;
    if (!cards || !cards.classList.contains('gc-cards')) return;   // 카드가 없으면(PC) 접기 안 함
    cards.classList.add('gc-acc');
    if (!h4.querySelector('.rc-arrow')) {
      h4.classList.add('rc-fold');
      var a = document.createElement('span'); a.className = 'rc-arrow'; a.setAttribute('aria-hidden', 'true');
      h4.appendChild(a);
      h4.addEventListener('click', function () {
        var open = h4.classList.toggle('rc-open');
        var box = wrap.nextElementSibling;
        if (box && box.classList.contains('gc-cards')) box.classList.toggle('rc-collapsed', !open);
      });
    }
    // 카드는 render 때마다 새로 만들어지니 접힘 상태(h4의 rc-open)를 다시 반영. 기본은 접힘.
    cards.classList.toggle('rc-collapsed', !h4.classList.contains('rc-open'));
  }
  function isCompactable(t) {
    var cols = t.querySelectorAll('thead tr:first-child th').length;
    if (cols > 5 || cols < 3) return false;   // 2칸(항목|내용)은 압축표 말고 카드(2열 목록)로
    var ok = true;
    // 첫 칸(상품·항목 이름)은 줄바꿈 허용하니 길이를 안 본다. 값 칸만 짧은지 검사.
    [].forEach.call(t.querySelectorAll('tbody tr'), function (tr) {
      [].forEach.call(tr.children, function (c, i) {
        if (i === 0) return;
        if ((c.textContent || '').trim().length > 10) ok = false;   // 값 칸에 긴 글 있으면 압축표엔 안 맞음
      });
    });
    return ok;
  }

  var mo = null, targets = null;
  function observe() { if (mo && targets) [].forEach.call(targets, function (n) { mo.observe(n, { childList: true, subtree: true }); }); }
  function safeRender() {
    if (mo) mo.disconnect();     /* 내가 넣는 카드에 관찰자가 반응해 루프 도는 것을 막는다 */
    try { render(); } finally { observe(); }
  }
  function boot() {
    if (window.MutationObserver) {
      mo = new MutationObserver(function () { clearTimeout(boot._t); boot._t = setTimeout(safeRender, 80); });
      targets = document.querySelectorAll('.rate-body, #knowBox, .panel');
    }
    safeRender();
    window.addEventListener('resize', function () { clearTimeout(boot._r); boot._r = setTimeout(safeRender, 150); });
  }
  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot);
})();
