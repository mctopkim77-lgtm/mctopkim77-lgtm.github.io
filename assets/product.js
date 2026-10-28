/* Atelier Line — product detail pages (shared) */
(function(){
  // reviews: show only cards whose text has been filled in; stars come from the number typed in .rv-stars
  var PH = '여기에 실제 후기를 입력하세요.';
  var sec = document.querySelector('.reviews');
  if(!sec) return;
  function rating(el){
    var t = (el && el.textContent || '').trim();
    var n = parseFloat(t);
    if(isNaN(n)) n = (t.match(/★/g) || []).length || 5;
    return Math.max(1, Math.min(5, n));
  }
  function starsEl(r){
    var s = document.createElement('span');
    s.className = 'rv-sum-stars';
    s.style.setProperty('--r', r);
    s.setAttribute('aria-hidden', 'true');
    return s;
  }
  function render(){
    var filled = 0, sum = 0;
    sec.querySelectorAll('.rv-card').forEach(function(c){
      var q = c.querySelector('.rv-quote');
      var empty = !q || !q.textContent.trim() || q.textContent.trim() === PH;
      var st = c.querySelector('.rv-stars'), r = rating(st);
      if(st){ st.style.setProperty('--r', r); st.setAttribute('aria-label', '별점 5점 만점에 ' + r + '점'); }
      var b = c.querySelector('.rv-badge');
      if(b) b.classList.toggle('is-free', b.textContent.indexOf('무료') > -1);
      c.classList.toggle('is-empty', empty);
      if(!empty){ filled++; sum += r; }
    });
    sec.classList.toggle('has-reviews', filled > 0);

    // average summary (buy box + review heading), only once there are 3+ reviews
    document.querySelectorAll('.rv-sum').forEach(function(x){ x.remove(); });
    if(filled < 3) return;
    var avg = (Math.round(sum / filled * 10) / 10).toFixed(1);
    function summary(tag, extra){
      var el = document.createElement(tag);
      el.className = 'rv-sum' + extra;
      el.setAttribute('data-noedit', '');
      el.setAttribute('aria-label', '평균 별점 ' + avg + '점, 후기 ' + filled + '개');
      el.appendChild(starsEl(avg));
      var sc = document.createElement('b'); sc.textContent = avg; el.appendChild(sc);
      var ct = document.createElement('span'); ct.className = 'rv-sum-count'; ct.textContent = '후기 ' + filled + '개'; el.appendChild(ct);
      return el;
    }
    var h1 = document.querySelector('.buybox h1');
    if(h1){ var a = summary('a', ''); a.href = '#reviews'; h1.insertAdjacentElement('afterend', a); }
    var lead = sec.querySelector('.lead');
    if(lead) lead.insertAdjacentElement('afterend', summary('div', ' rv-sum-lg'));
  }
  render();
  sec.addEventListener('input', function(){ clearTimeout(render.t); render.t = setTimeout(render, 400); });
})();


(function(){
  // photo switcher (thumbnails are built from the photos, so editor changes carry over)
  var shots = Array.prototype.slice.call(document.querySelectorAll('.ch-shot'));
  var thumbs = document.querySelector('.ch-thumbs');
  if(thumbs && shots.length > 1){
    shots.forEach(function(sh, i){
      var img = sh.querySelector('img');
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', (img && img.alt) || ('사진 ' + (i + 1)));
      if(i === 0) b.classList.add('is-on');
      var t = document.createElement('img');
      t.src = img ? img.getAttribute('src') : ''; t.alt = '';
      b.appendChild(t);
      b.addEventListener('click', function(){
        shots.forEach(function(x, k){ x.classList.toggle('is-on', k === i); });
        Array.prototype.forEach.call(thumbs.children, function(x, k){ x.classList.toggle('is-on', k === i); });
      });
      thumbs.appendChild(b);
    });
  }

  // option -> price on every buy button and the sticky bar
  function fmt(n){ return '₩' + Number(n).toLocaleString('ko-KR'); }
  var mainBtn = document.querySelector('.buybox [data-buy]');
  var barPrice = document.querySelector('.ch-bar-p');
  var barBtn = document.querySelector('.ch-bar-btn');
  var selLine = document.querySelector('.ch-sel');
  var customBox = document.querySelector('.ch-custom');
  function isCustom(){ var g = document.querySelector('.gaps input:checked'); return !!(g && g.hasAttribute('data-custom')); }

  // buy buttons in custom-order mode open the order box instead of checkout
  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('[data-buy]');
    if(!b || !isCustom() || document.documentElement.classList.contains('ed-on')) return;
    e.preventDefault(); e.stopPropagation();
    if(customBox) customBox.scrollIntoView({behavior:'smooth', block:'center'});
  }, true);

  // order by mail (pre-filled) or on the board
  function note(msg){
    var t = document.querySelector('.toast'); if(!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(note.t); note.t = setTimeout(function(){ t.classList.remove('show'); }, 2600);
  }
  if(customBox){
    customBox.addEventListener('click', function(e){
      var a = e.target.closest('a'); if(!a || document.documentElement.classList.contains('ed-on')) return;
      var cfg = window.ATELIER_CONTACT || {};
      var en = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
      var say = cfg.notify || note;
      if(a.classList.contains('cu-mail')){
        var to = cfg.orderEmail || customBox.getAttribute('data-order-email');
        if(!to){ e.preventDefault(); say(en ? 'Order email is coming soon.' : '주문 메일 주소를 준비 중입니다.'); return; }
        var sel = document.querySelector('.options input:checked');
        var kind = sel ? txt(sel.closest('.opt'), '.t').replace(txt(sel.closest('.opt'), '.ch-pick'), '').trim() : '';
        var g = document.querySelector('.gaps input:checked');
        var gap = g ? txt(g.closest('.gap'), '.t') : '';
        var product = customBox.getAttribute('data-product') || document.title.split('—')[0].trim();
        var subject = (en ? '[Custom order] ' : '[커스텀 주문] ') + product + ' ' + gap;
        var body = en
          ? 'Product: ' + product + '\nStitch spacing: ' + gap + '\nOption: ' + kind + '\n\nName:\nEmail:\nLug width (20mm / 22mm):\nNotes:\n'
          : '제품: ' + product + '\n그리프 간격: ' + gap + '\n구성: ' + kind + '\n\n이름:\n받으실 메일 주소:\n러그 폭 (20mm / 22mm):\n요청 사항:\n';
        a.setAttribute('href', 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body));
      } else if(a.classList.contains('cu-board')){
        var url = (cfg.inquiryUrl && cfg.inquiryUrl()) || customBox.getAttribute('data-board-url');
        if(!url){ e.preventDefault(); say(en ? 'Instagram is coming soon. Please order by email.' : '카카오톡 채널을 준비 중입니다. 메일로 주문해 주세요.'); return; }
        a.setAttribute('href', url); a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener');
      }
    });
  }
  var barName = document.querySelector('.ch-bar-n');
  var baseName = barName ? barName.textContent : '';
  function txt(el, q){ var n = el && el.querySelector(q); return n ? n.textContent.trim() : ''; }
  function sync(){
    var sel = document.querySelector('.options input:checked');
    if(!sel) return;
    var acrylic = sel.getAttribute('data-kind') === 'acrylic';
    var gapInput = document.querySelector('.gaps input:checked');
    var custom = !!(gapInput && gapInput.hasAttribute('data-custom'));
    var label = custom ? '커스텀 주문하기' : (acrylic ? '주문하기' : '지금 바로 받기');
    if(customBox) customBox.classList.toggle('show', custom);
    var gap = gapInput ? txt(gapInput.closest('.gap'), '.t') : '';
    var kind = txt(sel.closest('.opt'), '.t').replace(txt(sel.closest('.opt'), '.ch-pick'), '').trim();
    if(mainBtn) mainBtn.textContent = custom ? label : fmt(sel.value) + ' · ' + label;
    if(selLine){
      selLine.innerHTML = '';
      var b1 = document.createElement('b'); b1.textContent = kind;
      selLine.appendChild(b1);
      if(gap){
        selLine.appendChild(document.createTextNode(' · 그리프 '));
        var b2 = document.createElement('b'); b2.textContent = gap;
        selLine.appendChild(b2);
      }
      if(custom) selLine.appendChild(document.createTextNode(' (커스텀 주문)'));
      else if(freeShip(sel)) selLine.appendChild(document.createTextNode(' · 무료 배송'));
    }
    if(barPrice) barPrice.textContent = custom ? '커스텀 주문' : fmt(sel.value);
    if(barBtn) barBtn.textContent = label;
    if(barName) barName.textContent = gap ? baseName + ' · ' + gap : baseName;
  }
  // free shipping on physical items of ₩50,000 and up (badge lives in the price cell, outside editable text)
  var FREE_SHIP = 50000;
  function freeShip(input){ return input && input.getAttribute('data-kind') === 'acrylic' && Number(input.value) >= FREE_SHIP; }
  document.querySelectorAll('.options input').forEach(function(i){
    var cell = i.closest('.opt') && i.closest('.opt').querySelector('.p');
    if(cell && freeShip(i) && !cell.querySelector('.ch-free')){
      var b = document.createElement('span'); b.className = 'ch-free'; b.textContent = '무료 배송';
      cell.appendChild(b);
    }
  });
  document.querySelectorAll('.options input, .gaps input').forEach(function(i){ i.addEventListener('change', sync); });
  sync();

  // sticky buy bar once the main buy button scrolls away
  var bar = document.querySelector('.ch-bar');
  if(bar && mainBtn && 'IntersectionObserver' in window){
    var finalSec = document.querySelector('.ch-final');
    var mainVisible = true, finalVisible = false;
    function upd(){ bar.classList.toggle('show', !mainVisible && !finalVisible); }
    new IntersectionObserver(function(e){ mainVisible = e[0].isIntersecting; upd(); }).observe(mainBtn);
    if(finalSec) new IntersectionObserver(function(e){ finalVisible = e[0].isIntersecting; upd(); }).observe(finalSec);
  }
})();
