(function () {
  'use strict';

  var site = window.HarvardLegalProject;
  if (!site) {
    return;
  }

  var scriptUrl = document.currentScript && document.currentScript.src ? document.currentScript.src : location.href;
  var projectBaseUrl = new URL('../', scriptUrl);

  function resolveProjectUrl(path) {
    return new URL(path, projectBaseUrl).href;
  }

  function getArticleFromQuery() {
    var params = new URLSearchParams(window.location.search);
    return site.getArticle(params.get('article'));
  }

  function linkedFaculty(text) {
    return site.linkFacultyNames(text);
  }

  function hasHeroVisual(article) {
    return Boolean(article.heroVisualId);
  }

  function applyInlineMarkdown(text) {
    var mapped = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, label, rawUrl) {
      var url = site.placeholderLinks[rawUrl] || rawUrl;
      var href = /^https?:/i.test(url) ? url : resolveProjectUrl(url);
      var external = /^https?:/i.test(url) ? ' target="_blank" rel="noopener"' : '';
      return '<a href="' + href + '"' + external + '>' + label + '</a>';
    });

    mapped = mapped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    mapped = mapped.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    return mapped;
  }

  function preprocessMarkdown(raw) {
    var lines = raw.replace(/\r\n?/g, '\n').split('\n');
    var started = false;
    var kept = [];

    lines.forEach(function (line) {
      var trimmed = line.trim();
      if (!started) {
        if (trimmed === '---') {
          started = true;
        }
        return;
      }

      if (!trimmed) {
        kept.push('');
        return;
      }

      if (/^!\[/.test(trimmed)) {
        return;
      }

      if (trimmed.indexOf('IMAGE_URL_HERE') !== -1 || trimmed.indexOf('INTERACTIVE_URL_HERE') !== -1) {
        return;
      }

      kept.push(line);
    });

    return kept.join('\n').trim();
  }

  function markdownToHtml(rawMarkdown) {
    var markdown = preprocessMarkdown(rawMarkdown);
    var lines = markdown.split('\n');
    var html = [];
    var paragraph = [];
    var listItems = [];

    function flushParagraph() {
      if (!paragraph.length) {
        return;
      }
      html.push('<p>' + applyInlineMarkdown(paragraph.join(' ')) + '</p>');
      paragraph = [];
    }

    function flushList() {
      if (!listItems.length) {
        return;
      }
      html.push('<ul>' + listItems.map(function (item) {
        return '<li>' + applyInlineMarkdown(item) + '</li>';
      }).join('') + '</ul>');
      listItems = [];
    }

    lines.forEach(function (line) {
      var trimmed = line.trim();

      if (!trimmed) {
        flushParagraph();
        flushList();
        return;
      }

      if (/^##\s+/.test(trimmed)) {
        flushParagraph();
        flushList();
        html.push('<h2>' + applyInlineMarkdown(trimmed.replace(/^##\s+/, '')) + '</h2>');
        return;
      }

      if (/^###\s+/.test(trimmed)) {
        flushParagraph();
        flushList();
        html.push('<h3>' + applyInlineMarkdown(trimmed.replace(/^###\s+/, '')) + '</h3>');
        return;
      }

      if (/^[-*]\s+/.test(trimmed)) {
        flushParagraph();
        listItems.push(trimmed.replace(/^[-*]\s+/, ''));
        return;
      }

      if (trimmed === '---') {
        flushParagraph();
        flushList();
        html.push('<hr class="article-divider">');
        return;
      }

      paragraph.push(trimmed);
    });

    flushParagraph();
    flushList();

    return html.join('');
  }

  function renderSidebar(activeArticle) {
    var visualSection = site.visualisations.map(function (visual) {
      var active = visual.articleId === activeArticle.id ? ' active' : '';
      return '' +
        '<a class="reader-list-item' + active + '" href="' + resolveProjectUrl(visual.path) + '" target="_blank" rel="noopener">' +
        '  <span>' + visual.title + '</span>' +
        '</a>';
    }).join('');

    var articleSection = site.articles.map(function (article, index) {
      var active = article.id === activeArticle.id ? ' active' : '';
      return '' +
        '<a class="reader-list-item' + active + '" href="' + resolveProjectUrl(site.getArticleUrl(article.id)) + '">' +
        '  <span class="reader-list-number">0' + (index + 1) + '</span>' +
        '  <span>' + (article.shortTitle || article.title) + '</span>' +
        '</a>';
    }).join('');

    return '' +
      '<div class="reader-sidebar-inner">' +
      '  <div class="sidebar-project-header">' +
      '    <a class="sidebar-classification sidebar-classification-link" href="' + site.clpUrl + '" target="_blank" rel="noopener">Center on the Legal Profession, Harvard Law School</a>' +
      '  </div>' +
      '  <hr class="sidebar-divider sidebar-header-divider">' +
      '  <div class="sidebar-page-title">' + activeArticle.title + '</div>' +
      '  <div class="sidebar-page-desc">' + activeArticle.excerpt + '</div>' +
      '  <div class="sidebar-page-author">By ' + linkedFaculty(activeArticle.authorsLabel) + '</div>' +
      '  <div class="sidebar-credit">' +
      '    <span class="sidebar-credit-label">Visuals and analysis created with</span>' +
      '    <a class="sidebar-credit-link" href="' + site.dragonflyUrl + '" target="_blank" rel="noopener" aria-label="Dragonfly Thinking">' +
      '      <img src="' + resolveProjectUrl('visualisations/styles/dt-logo-black.webp') + '" data-theme-logo="true" data-logo-dark="' + resolveProjectUrl('visualisations/styles/dt-logo-white.webp') + '" data-logo-light="' + resolveProjectUrl('visualisations/styles/dt-logo-black.webp') + '" alt="Dragonfly Thinking" class="sidebar-logo">' +
      '    </a>' +
      '  </div>' +
      '  <hr class="sidebar-divider">' +
      '  <div class="reader-sidebar-section">' +
      '    <div class="sidebar-section-label">Articles</div>' +
      articleSection +
      '  </div>' +
      '  <div class="reader-sidebar-section">' +
      '    <div class="sidebar-section-label">Visualisations</div>' +
      visualSection +
      '  </div>' +
      '</div>';
  }

  function renderHero(article) {
    if (!hasHeroVisual(article)) {
      return '';
    }
    var visual = site.getVisual(article.heroVisualId);
    return '' +
      '<section class="article-hero-embed">' +
      '  <div class="article-hero-header">' +
      '    <div>' +
      '      <h3>' + visual.title + '</h3>' +
      '    </div>' +
      '    <a class="button-secondary" href="' + resolveProjectUrl(visual.path) + '" target="_blank" rel="noopener">Open in new tab</a>' +
      '  </div>' +
      '  <p class="article-hero-text">' + article.heroCaption + '</p>' +
      '  <div class="article-hero-frame">' +
      '    <iframe src="' + resolveProjectUrl(visual.embedPath) + '" loading="lazy" title="' + visual.title + '"></iframe>' +
      '  </div>' +
      '</section>';
  }

  function renderArticle(article, htmlBody) {
    var relatedVisual = hasHeroVisual(article) ? site.getVisual(article.heroVisualId) : null;
    return '' +
      '<header class="article-header">' +
      '  <div class="article-header-kicker">' + site.shortTitle + '</div>' +
      '  <h1>' + article.title + '</h1>' +
      '  <div class="article-byline">By ' + linkedFaculty(article.authorsLabel) + '</div>' +
      '  <div class="article-meta">' +
      '    <span>' + article.dateLabel + '</span>' +
      '    <span>&middot;</span>' +
      '    <span>' + article.readTime + '</span>' +
      '  </div>' +
      '  <p class="article-excerpt">' + article.excerpt + '</p>' +
      '</header>' +
      renderHero(article) +
      '<section class="article-body">' + htmlBody + '</section>' +
      (relatedVisual ? '' +
        '<section class="article-tail-card">' +
        '  <div class="article-tail-eyebrow">Linked visual</div>' +
        '  <h3>' + relatedVisual.title + '</h3>' +
        '  <p>' + relatedVisual.description + '</p>' +
        '  <a class="button-primary" href="' + resolveProjectUrl(relatedVisual.path) + '" target="_blank" rel="noopener">Open full visualisation</a>' +
        '</section>' : '');
  }

  function renderPage() {
    var article = getArticleFromQuery();
    injectHarvardProjectNav({ currentSection: 'articles', currentArticleId: article.id });

    document.title = article.title + ' | ' + site.title;
    document.getElementById('readerSidebar').innerHTML = renderSidebar(article);

    fetch(resolveProjectUrl(article.markdownPath))
      .then(function (response) { return response.text(); })
      .then(function (markdown) {
        document.getElementById('readerArticle').innerHTML = renderArticle(article, markdownToHtml(markdown));
      });
  }

  window.addEventListener('DOMContentLoaded', renderPage);
})();
