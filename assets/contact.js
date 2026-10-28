/* =========================================================
   Atelier Line — 연락처 설정 (Contact settings)

   아래 네 줄의 따옴표 안에 주소를 넣으면, 모든 페이지의
   주문·문의 버튼, 아래쪽 '문의하기'·'인스타그램' 링크,
   상품 페이지의 '후기 남기기' 버튼이 자동으로 연결됩니다.
   비워 두면 "준비 중" 안내가 뜹니다.

   한국어 페이지(lang="ko"): 주문 = 메일, 문의 = 카카오톡 채널
   영문 페이지(lang="en")  : 주문 = 메일, 문의 = 인스타그램 DM
   ========================================================= */
window.ATELIER_CONTACT = {
  // 1. 주문 메일 주소            예) atelierline.order@gmail.com
  orderEmail: '',

  // 2. 카카오톡 채널 채팅 주소    예) http://pf.kakao.com/_xxxxx/chat
  kakaoChannel: '',

  // 3. 인스타그램 주소            예) https://www.instagram.com/atelierline
  instagram: '',

  // 4. 후기 작성 양식 주소        예) 구글 폼·네이버 폼 링크 https://forms.gle/xxxxx
  reviewForm: ''
};

(function(){
  var cfg = window.ATELIER_CONTACT;
  function isEn(){ return (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0; }
  var en = isEn();

  // where "문의하기 / Contact" goes for this language
  cfg.inquiryUrl = function(){ return isEn() ? cfg.instagram : cfg.kakaoChannel; };

  cfg.notify = function(msg){
    var t = document.querySelector('.toast');
    if(!t){
      t = document.createElement('div');
      t.className = 'toast';
      t.setAttribute('role', 'status');
      t.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);background:rgba(29,29,31,.92);color:#fff;font-size:14px;padding:12px 20px;border-radius:980px;z-index:100;opacity:0;transition:opacity .3s;pointer-events:none;max-width:calc(100% - 32px);text-align:center;';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show'); t.style.opacity = '1';
    clearTimeout(cfg.notify.t);
    cfg.notify.t = setTimeout(function(){ t.classList.remove('show'); t.style.opacity = ''; }, 2600);
  };

  cfg.soon = en ? 'Coming soon. Please check back later.' : '준비 중입니다. 조금만 기다려 주세요.';

  // footer links: <a data-contact="inquiry"> / <a data-contact="instagram">
  function resolve(kind){
    if(kind === 'instagram') return cfg.instagram;
    if(kind === 'review') return cfg.reviewForm;
    if(kind === 'inquiry') return cfg.inquiryUrl();
    if(kind === 'email') return cfg.orderEmail ? 'mailto:' + cfg.orderEmail : '';
    return '';
  }
  function wire(){
    document.querySelectorAll('a[data-contact]').forEach(function(a){
      if(document.documentElement.classList.contains('ed-on')) return;
      var url = resolve(a.getAttribute('data-contact'));
      if(url){
        a.setAttribute('href', url);
        if(url.indexOf('http') === 0){ a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
      }
    });
  }
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[data-contact]');
    if(!a || document.documentElement.classList.contains('ed-on')) return;
    if(!resolve(a.getAttribute('data-contact'))){ e.preventDefault(); cfg.notify(cfg.soon); }
  });
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire); else wire();
})();
