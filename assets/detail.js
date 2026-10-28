(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ----- Pattern "drawing" + scroll reveal -----
  if(!reduce){
    document.querySelectorAll('.draw-on .cut').forEach(function(el){
      try{
        var len = el.getTotalLength();
        el.style.strokeDasharray = len;
        el.style.strokeDashoffset = len;
        el.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.65,0,.35,1) .25s';
      }catch(e){}
    });
  }
  function show(el){
    el.classList.add('in');
    if(el.classList.contains('draw-on')){
      el.querySelectorAll('.cut').forEach(function(c){ c.style.strokeDashoffset = 0; });
    }
  }
  var items = document.querySelectorAll('.reveal');
  if(reduce || !('IntersectionObserver' in window)){ items.forEach(show); }
  else{
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ show(e.target); io.unobserve(e.target); }
      });
    }, {threshold:.12, rootMargin:'0px 0px -40px 0px'});
    items.forEach(function(el){ io.observe(el); });
  }

  // ----- File option -> price -----
  var priceEl = document.querySelector('[data-price]');
  var buyBtn = document.querySelector('[data-buy]');
  function fmt(n){ return '₩' + Number(n).toLocaleString('ko-KR'); }
  function update(){
    var sel = document.querySelector('.options input:checked');
    if(!sel) return;
    if(priceEl) priceEl.firstChild.nodeValue = fmt(sel.value);
    if(buyBtn) buyBtn.textContent = fmt(sel.value) + ' 구매하기';
  }
  document.querySelectorAll('.options input').forEach(function(i){ i.addEventListener('change', update); });
  update();

  // ----- Buy (checkout not connected yet) -----
  var toast = document.querySelector('.toast');
  var t;
  document.querySelectorAll('[data-buy]').forEach(function(b){
    b.addEventListener('click', function(e){
      e.preventDefault();
      if(!toast) return;
      toast.textContent = '결제 기능은 준비 중입니다.';
      toast.classList.add('show');
      clearTimeout(t); t = setTimeout(function(){ toast.classList.remove('show'); }, 2200);
    });
  });
})();
