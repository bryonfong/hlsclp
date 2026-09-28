(() => {
  const families = [...document.querySelectorAll('.topic-family')];
  const themes = [...document.querySelectorAll('.topic-theme')];
  const input = document.getElementById('topic-filter');
  const unfold = document.getElementById('topic-unfold');
  const results = document.getElementById('topic-results');
  const aliases = {"family-01": "f-13360", "family-02": "f-13362", "family-03": "f-13364", "family-04": "f-13361", "family-05": "f-13363", "family-13360": "f-13360", "family-13362": "f-13362", "family-13364": "f-13364", "family-13361": "f-13361", "family-13363": "f-13363", "theme-13314": "t-13314", "theme-13315": "t-13315", "theme-13329": "t-13329", "theme-13357": "t-13357", "theme-13355": "t-13355", "theme-13356": "t-13356", "theme-13317": "t-13317", "theme-13318": "t-13318", "theme-13322": "t-13322", "theme-13324": "t-13324", "theme-13350": "t-13350", "theme-13351": "t-13351", "theme-13358": "t-13358", "theme-13349": "t-13349", "theme-13323": "t-13323", "theme-13341": "t-13341", "theme-13345": "t-13345", "theme-13321": "t-13321", "theme-13342": "t-13342", "theme-13359": "t-13359", "theme-13335": "t-13335", "theme-13325": "t-13325", "theme-13354": "t-13354", "theme-13336": "t-13336", "theme-13326": "t-13326", "theme-13337": "t-13337", "theme-13334": "t-13334", "theme-13353": "t-13353", "theme-13346": "t-13346", "theme-13348": "t-13348", "theme-13343": "t-13343", "theme-13340": "t-13340", "theme-13328": "t-13328", "theme-13319": "t-13319", "theme-13327": "t-13327", "theme-13331": "t-13331", "theme-13316": "t-13316", "theme-13338": "t-13338", "theme-13330": "t-13330", "theme-13320": "t-13320", "theme-13352": "t-13352", "theme-13344": "t-13344", "theme-13333": "t-13333", "theme-13347": "t-13347", "theme-13332": "t-13332", "theme-13339": "t-13339"};
  let allOpen = false;
  function filter() {
    const q = input.value.trim().toLowerCase();
    let count = 0, topics = 0;
    for (const family of families) {
      const familyMatch = q && family.querySelector('h2').textContent.toLowerCase().includes(q);
      for (const theme of family.querySelectorAll('.topic-theme')) {
        const themeMatch = !q || familyMatch || theme.dataset.themeSearch.includes(q);
        let found = 0;
        for (const row of theme.querySelectorAll('[data-topic-search]')) {
          row.hidden = !themeMatch && !row.dataset.topicSearch.includes(q);
          if (!row.hidden) found++;
        }
        theme.hidden = !found;
        if (found) {count++; topics += found;}
        theme.querySelector('details.topic-reading').open = !!q || allOpen;
      }
      family.hidden = [...family.querySelectorAll('.topic-theme')].every(t => t.hidden);
    }
    results.textContent = count + ' themes · ' + topics + ' topics' + (!count ? ' — no matches' : '');
  }
  input.addEventListener('input', filter);
  document.getElementById('topic-clear').addEventListener('click', () => {input.value='';filter();input.focus();});
  unfold.addEventListener('click', () => {
    allOpen=!allOpen;
    unfold.setAttribute('aria-pressed',String(allOpen));
    unfold.textContent=allOpen?'Fold every theme':'Unfold every theme';
    for(const theme of themes) theme.querySelector('details.topic-reading').open=allOpen;
  });
  function reveal() {
    let id=decodeURIComponent(location.hash.slice(1));
    if (aliases[id]) {id=aliases[id];history.replaceState(null,'','#'+id);}
    const target=document.getElementById(id);
    if (!target) return;
    if (input.value) {input.value='';filter();}
    for(let el=target.parentElement;el;el=el.parentElement) if(el.tagName==='DETAILS') el.open=true;
    target.scrollIntoView({block:'start'});
    if(id.startsWith('cluster-')) {
      const link=target.querySelector('a[data-cluster]');
      if(link) link.click();
    }
  }
  addEventListener('hashchange',reveal);
  reveal();
})();
