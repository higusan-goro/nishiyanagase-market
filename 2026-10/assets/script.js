(function(){
  var box=document.getElementById('lightbox'),
      img=document.getElementById('lightboxImg'),
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
