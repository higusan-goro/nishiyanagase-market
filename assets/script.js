document.documentElement.classList.add('js');

// スマホ幅の「メニュー」ボタン
(function(){
  var nav=document.querySelector('.gnav'), btn=nav&&nav.querySelector('.gnav-toggle');
  if(!btn) return;
  btn.addEventListener('click',function(){
    var open=nav.classList.toggle('is-open');
    btn.setAttribute('aria-expanded',open?'true':'false');
  });
  nav.querySelectorAll('.gnav-pill a').forEach(function(a){
    a.addEventListener('click',function(){ nav.classList.remove('is-open'); btn.setAttribute('aria-expanded','false'); });
  });
})();

// 画面に入ったとき一度だけ、下からふわっと出す
(function(){
  var items=document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){ items.forEach(function(el){el.classList.add('is-in');}); return; }
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('is-in'); io.unobserve(e.target); } });
  },{rootMargin:'0px 0px -10% 0px'});
  items.forEach(function(el){io.observe(el);});
})();

// 画像を押すと大きく表示する
(function(){
  var box=document.getElementById('lightbox');
  if(!box) return;
  var img=document.getElementById('lightboxImg'),
      cap=document.getElementById('lightboxCap'),
      closeBtn=document.getElementById('lightboxClose'),
      opener=null;
  function open(btn){
    var src=btn.querySelector('img');
    img.src=src.src; img.alt=src.alt;
    cap.textContent=btn.dataset.caption||'';
    box.setAttribute('open-state','on');
    document.body.style.overflow='hidden';
    opener=btn; closeBtn.focus();
  }
  function close(){
    box.removeAttribute('open-state');
    document.body.style.overflow='';
    img.src=''; if(opener){opener.focus(); opener=null;}
  }
  document.querySelectorAll('.zoom').forEach(function(b){
    b.addEventListener('click',function(){open(b);});
  });
  closeBtn.addEventListener('click',close);
  box.addEventListener('click',function(e){ if(e.target===box||e.target.tagName==='FIGURE') close(); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&box.getAttribute('open-state')) close(); });
})();

// 知り合いに教える:スマホは共有の画面を開き、パソコンはリンクをコピーする
(function(){
  var btn=document.querySelector('.share-native'), msg=document.querySelector('.share-msg');
  if(!btn) return;
  btn.addEventListener('click',function(){
    var url=btn.dataset.url, title=btn.dataset.title;
    if(navigator.share){ navigator.share({title:title,url:url}).catch(function(){}); return; }
    if(navigator.clipboard){
      navigator.clipboard.writeText(url).then(function(){ msg.textContent='このページのアドレスをコピーしました。LINEやメールに貼り付けて送れます。'; });
    } else { msg.textContent='このページのアドレス:'+url; }
  });
})();

// 写真の帯:途切れずに流れるよう、同じ写真をもう1組つなげる(動きを減らす設定では流さない)
(function(){
  var list=document.querySelector('.walk-list');
  if(!list||window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  Array.prototype.slice.call(list.children).forEach(function(li){
    var c=li.cloneNode(true); c.setAttribute('aria-hidden','true'); c.querySelector('img').alt=''; list.appendChild(c);
  });
})();

// スズラン灯:読み進めた割合に応じて、左右の灯りを上から1つずつともす
(function(){
  // 灯りの形(昭和3年のスズラン灯:乳白色のホヤ7個を鈴蘭の花のようにつけた街路灯)と、左右の置き場所を作る
  var NS='http://www.w3.org/2000/svg';
  document.body.insertAdjacentHTML('afterbegin',
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="suzuran" viewBox="0 0 80 120">'+
    '<g stroke="#221e1a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M40 22V118"/><path d="M8 40Q40 4 72 40"/><path d="M28 118h24"/></g>'+
    '<g stroke="#221e1a" stroke-width="2.5" stroke-linejoin="round">'+
    ['M2 50','M14 36','M27 28','M41 28','M54 36','M66 50','M34 56'].map(function(m){return '<path d="'+m+'q0-10 6-10q6 0 6 10l-3 2-3-2-3 2z"/>';}).join('')+
    '</g></symbol></svg><div class="lamps lamps-l" aria-hidden="true"></div><div class="lamps lamps-r" aria-hidden="true"></div>');
  var sides=document.querySelectorAll('.lamps');
  var per=6, lamps=[];
  sides.forEach(function(side){
    for(var i=0;i<per;i++){
      var svg=document.createElementNS(NS,'svg');
      svg.setAttribute('viewBox','0 0 80 120');
      var use=document.createElementNS(NS,'use');
      use.setAttribute('href','#suzuran'); svg.appendChild(use); side.appendChild(svg);
    }
  });
  // 左右で同じ高さの灯りを組にする
  for(var i=0;i<per;i++){ lamps.push([sides[0].children[i], sides[1]&&sides[1].children[i]]); }
  var hero=document.querySelector('.hero');
  function update(){
    // 看板の文字と重ならないよう、看板を過ぎてから灯りを出す
    var shown=!hero||scrollY>hero.offsetHeight*0.7;
    sides.forEach(function(side){ side.classList.toggle('is-shown',shown); });
    var max=document.documentElement.scrollHeight-innerHeight;
    var p=max>0?scrollY/max:1, n=Math.round(p*per);
    lamps.forEach(function(pair,i){ pair.forEach(function(el){ if(el) el.classList.toggle('on', i<n); }); });
  }
  addEventListener('scroll',update,{passive:true}); update();
})();

// ページの上へ戻るボタン(どのページにも出す)
(function(){
  var a=document.createElement('a');
  a.href='#'; a.className='to-top'; a.textContent='上へ'; a.setAttribute('aria-label','ページのいちばん上へ戻る');
  a.addEventListener('click',function(e){ e.preventDefault(); scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}); });
  document.body.appendChild(a);
  function update(){ a.classList.toggle('is-shown', scrollY>innerHeight*0.6); }
  addEventListener('scroll',update,{passive:true}); update();
})();
