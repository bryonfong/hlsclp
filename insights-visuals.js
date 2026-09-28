(() => {
  for (const diagram of document.querySelectorAll('.st-svg')) {
    const branches=[...diagram.querySelectorAll('.st-branch')];
    const highlight=target=>{
      const selected=target?.closest('.st-branch');
      for(const branch of branches){branch.classList.toggle('is-hot',branch===selected);branch.classList.toggle('is-dim',!!selected&&branch!==selected);}
    };
    diagram.addEventListener('pointerover',e=>highlight(e.target));
    diagram.addEventListener('focusin',e=>highlight(e.target));
    diagram.addEventListener('pointerleave',()=>highlight(null));
    diagram.addEventListener('focusout',e=>highlight(e.relatedTarget));
  }
  for(const sky of document.querySelectorAll('.insight-visual .cst')){
    const figure=sky.closest('figure');
    let output=figure.querySelector('.v-star-label');
    if(!output){output=document.createElement('output');output.className='v-star-label';output.setAttribute('aria-live','polite');output.textContent='Explore a star to see its topic';figure.append(output);}
    const show=e=>{const star=e.target.closest('[data-visual-label]');if(star)output.textContent=star.dataset.visualLabel;};
    sky.addEventListener('pointerover',show);sky.addEventListener('focusin',show);
    sky.addEventListener('pointerleave',()=>{output.textContent='Explore a star to see its topic';});
  }
  for(const group of document.querySelectorAll('.v-topic-figures')){
    const mark=target=>{
      const href=target?.closest('a[href]')?.getAttribute('href')||'';
      for(const star of group.querySelectorAll('.cst-star'))star.classList.toggle('is-active',!!href&&star.getAttribute('href')===href);
      for(const row of group.querySelectorAll('.rb-row'))row.classList.toggle('is-active',!!href&&row.querySelector('a')?.getAttribute('href')===href);
    };
    group.addEventListener('pointerover',e=>mark(e.target));
    group.addEventListener('focusin',e=>mark(e.target));
    group.addEventListener('pointerleave',()=>mark(null));
    group.addEventListener('focusout',e=>mark(e.relatedTarget));
  }
})();
