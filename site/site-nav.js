(function () {
  'use strict';

  var scriptUrl = document.currentScript && document.currentScript.src ? document.currentScript.src : location.href;
  var projectBaseUrl = new URL('../', scriptUrl);

  function resolveProjectUrl(path) {
    return new URL(path, projectBaseUrl).href;
  }

  function currentTheme() {
    var stored;
    try { stored = localStorage.getItem('harvard-project-theme'); } catch (e) {}
    return stored === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    var resolved = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', resolved);
    try {
      localStorage.setItem('harvard-project-theme', resolved);
      localStorage.setItem('harvard-viz-theme', resolved);
    } catch (e) {}
    var isLight = resolved === 'light';
    var logos = Array.prototype.slice.call(document.querySelectorAll('[data-theme-logo]'));
    logos.forEach(function (logo) {
      var nextSrc = isLight ? logo.getAttribute('data-logo-light') : logo.getAttribute('data-logo-dark');
      if (nextSrc) {
        logo.setAttribute('src', nextSrc);
      }
    });
  }

  function updateThemeLogos() {
    applyTheme(currentTheme());
  }

  window.injectHarvardProjectNav = function (options) {
    var config = options || {};
    var site = window.HarvardLegalProject;
    if (!site || document.documentElement.classList.contains('embed-mode') || document.body.classList.contains('embed-mode')) {
      return;
    }

    var currentSection = config.currentSection || '';
    var currentArticleId = config.currentArticleId || '';
    var currentVisualId = config.currentVisualId || '';

    var articleItems = site.articles.map(function (article) {
      var active = article.id === currentArticleId ? ' active' : '';
      return '<a class="nav-dropdown-item' + active + '" href="' + resolveProjectUrl(site.getArticleUrl(article.id)) + '">' + article.title + '</a>';
    }).join('');

    var visualItems = site.visualisations.map(function (visual) {
      var active = visual.id === currentVisualId ? ' active' : '';
      return '<a class="nav-dropdown-item' + active + '" href="' + resolveProjectUrl(visual.path) + '">' + visual.title + '</a>';
    }).join('');

    var html = '' +
      '<nav class="project-nav" id="projectNav">' +
      '  <a class="project-nav-brand" href="' + resolveProjectUrl('index.html') + '" aria-label="Project home">' +
      '    <span class="project-nav-brand-icon" aria-hidden="true">' +
      '      <svg viewBox="0 0 20 20" fill="none" focusable="false">' +
      '        <path d="M3.5 8.5L10 3.5L16.5 8.5V16H12.25V11.75H7.75V16H3.5V8.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>' +
      '      </svg>' +
      '    </span>' +
      '    <span class="project-nav-brand-text">' + site.title + '</span>' +
      '  </a>' +
      '  <div class="project-nav-links">' +
      '    <div class="project-nav-dropdown">' +
      '      <button class="project-nav-link project-nav-trigger' + (currentSection === 'articles' ? ' active' : '') + '" type="button" data-menu="articles" aria-expanded="false">Articles &#x25BE;</button>' +
      '      <div class="project-nav-menu" data-menu-panel="articles">' + articleItems + '</div>' +
      '    </div>' +
      '    <div class="project-nav-dropdown">' +
      '      <button class="project-nav-link project-nav-trigger' + (currentSection === 'visualisations' ? ' active' : '') + '" type="button" data-menu="visualisations" aria-expanded="false">Visualisations &#x25BE;</button>' +
      '      <div class="project-nav-menu" data-menu-panel="visualisations">' + visualItems + '</div>' +
      '    </div>' +
      '  </div>' +
      '</nav>';

    document.body.insertAdjacentHTML('afterbegin', html);
    document.body.classList.add('has-project-nav');

    updateThemeLogos();

    var triggers = Array.prototype.slice.call(document.querySelectorAll('.project-nav-trigger'));
    var dropdowns = Array.prototype.slice.call(document.querySelectorAll('.project-nav-dropdown'));

    function closeMenus() {
      triggers.forEach(function (trigger) {
        trigger.setAttribute('aria-expanded', 'false');
      });
      dropdowns.forEach(function (dropdown) {
        dropdown.classList.remove('open');
      });
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function (event) {
        event.stopPropagation();
        var dropdown = trigger.parentElement;
        var isOpen = dropdown.classList.contains('open');
        closeMenus();
        if (!isOpen) {
          dropdown.classList.add('open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });

    document.addEventListener('click', function (event) {
      if (!event.target.closest('.project-nav-dropdown')) {
        closeMenus();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeMenus();
      }
    });
  };
})();
