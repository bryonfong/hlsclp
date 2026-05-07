(function () {
  'use strict';

  var site = window.HarvardLegalProject;
  if (!site) {
    return;
  }

  function articleUrl(articleId) {
    return site.getArticleUrl(articleId);
  }

  function essayArticles() {
    return site.articles.filter(function (article) {
      return !article.intro;
    });
  }

  function renderPreview(article) {
    if (!article.heroVisualId) {
      return '' +
        '<div class="pair-card-preview pair-card-preview-copy">' +
        '  <div class="pair-card-preview-copy-inner">' +
        '    <div class="pair-card-preview-label">Essay</div>' +
        '    <div class="pair-card-preview-title">' + article.shortTitle + '</div>' +
        '  </div>' +
        '</div>';
    }

    var visual = site.getVisual(article.heroVisualId);
    var previewStyle = '--preview-scale:' + (visual.previewScale || '1') + ';--preview-shift-x:' + (visual.previewOffsetX || '0%') + ';--preview-shift-y:' + (visual.previewOffsetY || '0%') + ';';
    return '' +
      '<div class="pair-card-preview" style="' + previewStyle + '">' +
      '  <iframe class="pair-card-preview-frame" src="' + visual.embedPath + (visual.embedPath.indexOf('?') !== -1 ? '&' : '?') + 'preview=1" loading="lazy" title="' + visual.title + ' preview" tabindex="-1" aria-hidden="true"></iframe>' +
      '</div>';
  }

  function renderPair(article, pairIndex) {
    var inner = '' +
      renderPreview(article) +
      '  <div class="pair-card-top">' +
      '    <div class="pair-card-header">' +
      '      <div class="pair-card-eyebrow">Essay ' + (pairIndex + 1) + '</div>' +
      '      <span class="pair-card-meta">' + article.dateLabel + '</span>' +
      '    </div>' +
      '    <div class="pair-card-title-block">' +
      '      <h2>' + article.title + '</h2>' +
      '      <div class="pair-card-byline">By ' + article.authorsLabel + '</div>' +
      '    </div>' +
      '    <p class="pair-card-text">' + article.excerpt + '</p>' +
      '  </div>';

    return '' +
      '<a class="pair-card pair-card-link" href="' + articleUrl(article.id) + '">' +
      inner +
      '</a>';
  }

  function renderPage() {
    injectHarvardProjectNav({ currentSection: 'home' });
    var essays = essayArticles();
    var introArticle = site.articles.find(function (article) { return article.intro; }) || site.articles[0];

    var root = document.getElementById('projectHome');
    root.innerHTML = '' +
      '<div class="home-shell">' +
      '  <aside class="home-rail">' +
      '    <div class="sidebar-project-header">' +
      '      <a class="sidebar-classification sidebar-classification-link" href="' + site.clpUrl + '" target="_blank" rel="noopener">Center on the Legal Profession, Harvard Law School</a>' +
      '    </div>' +
      '    <hr class="sidebar-divider sidebar-header-divider">' +
      '    <div class="sidebar-section-label">About the Project</div>' +
      '    <div class="sidebar-page-title">' + site.title + '</div>' +
      '    <div class="sidebar-page-desc">' + site.homeDescription + '</div>' +
      '    <hr class="sidebar-divider">' +
      '    <div class="sidebar-section-label home-project-leads-label">Project Leads</div>' +
      '    <div class="home-project-leads">' +
      '      <a class="home-project-lead-link" href="' + site.facultyPages['David Wilkins'] + '" target="_blank" rel="noopener">David Wilkins</a>' +
      '      <a class="home-project-lead-link" href="' + site.facultyPages['Anthea Roberts'] + '" target="_blank" rel="noopener">Anthea Roberts</a>' +
      '    </div>' +
      '    <div class="sidebar-credit sidebar-credit-home">' +
      '      <span class="sidebar-credit-label">Visuals and analysis created with</span>' +
      '      <a class="sidebar-credit-link" href="' + site.dragonflyUrl + '" target="_blank" rel="noopener" aria-label="Dragonfly Thinking">' +
      '        <img src="visualisations/styles/dt-logo-black.webp" data-theme-logo="true" data-logo-dark="visualisations/styles/dt-logo-white.webp" data-logo-light="visualisations/styles/dt-logo-black.webp" alt="Dragonfly Thinking" class="sidebar-logo">' +
      '      </a>' +
      '    </div>' +
      '    <hr class="sidebar-divider">' +
      '    <div class="sidebar-section-label">Current sequence</div>' +
      '    <div class="home-rail-list">' +
      essays.map(function (e, i) {
        var num = (i + 1 < 10 ? '0' : '') + (i + 1);
        return '      <a class="home-rail-list-item" href="' + articleUrl(e.id) + '"><span class="home-rail-number">' + num + '</span><span>' + e.shortTitle + '</span></a>';
      }).join('\n') +
      '    </div>' +
      '  </aside>' +
      '  <main class="home-main">' +
      '    <section class="home-main-panel">' +
      '      <div class="section-heading-kicker">Project Overview</div>' +
      '      <div class="home-main-head">' +
      '        <h2>Why this project exists</h2>' +
      '        <div class="home-main-actions">' +
      '          <a class="button-primary" href="' + articleUrl(introArticle.id) + '">Read series introduction</a>' +
      '        </div>' +
      '      </div>' +
      '      <p class="home-main-summary">' + site.overviewIntro[0] + '</p>' +
      '      <p class="home-main-summary">' + site.overviewIntro[1] + '</p>' +
    '    </section>' +
      '    <section class="series-section" id="series">' +
      '      <div class="section-heading-row">' +
      '        <div>' +
      '          <div class="section-heading-kicker">Series Structure</div>' +
      '          <h2>Essays</h2>' +
        '        </div>' +
      '      </div>' +
      '      <div class="pair-grid">' +
      essays.map(renderPair).join('') +
      '      </div>' +
      '    </section>' +
      '  </main>' +
      '</div>';
  }

  window.addEventListener('DOMContentLoaded', renderPage);
})();
