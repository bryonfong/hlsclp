(function () {
  'use strict';

  var site = {
    title: 'AI, Complex Decision-Making and the Future of the Legal Profession',
    shortTitle: 'AI and the Legal Profession',
    subtitle: 'A project of the Center on the Legal Profession, Harvard Law School',
    clpUrl: 'https://clp.law.harvard.edu/',
    dragonflyUrl: 'https://dragonflythinking.com',
    facultyPages: {
      'Anthea Roberts': 'https://hls.harvard.edu/faculty/anthea-roberts/',
      'David Wilkins': 'https://hls.harvard.edu/faculty/david-b-wilkins/',
      'David B. Wilkins': 'https://hls.harvard.edu/faculty/david-b-wilkins/'
    },
    projectAuthorsLabel: 'David Wilkins and Anthea Roberts',
    homeDescription: 'Interactive essays and visualisations on how AI is reshaping legal services, professional judgment, and the future structure of the legal profession.',
    leadsLabel: 'Project leads',
    leads: [
      'David Wilkins',
      'Anthea Roberts'
    ],
    themeStorageKey: 'harvard-project-theme',
    overviewIntro: [
      'Artificial intelligence is not simply another technology being adopted by the legal profession. It is structurally reconfiguring the profession: how legal services are delivered, who delivers them, how lawyers are trained, and what it means to exercise professional judgment.',
      'This project brings together David Wilkins and Anthea Roberts to read that transformation through complementary lenses. One reads the legal profession as a century-long institutional system; the other reads these developments through AI and complex decision-making.'
    ],
    overviewNote: 'The first release pairs essays with interactive visualisations so the argument and the evidence architecture travel together.',
    articles: [
      {
        id: 'series-introduction',
        title: 'Series Introduction: AI, Complex Decision-Making and the Future of the Legal Profession',
        shortTitle: 'Series Introduction',
        dateLabel: '3 April 2026',
        authorsLabel: 'Anthea Roberts and David Wilkins',
        markdownPath: 'outputs/2026-04-07-1-series-introduction.md',
        excerpt: 'Why this series exists, what each of us brings to it, and how AI, complex decision-making, and the structure of the legal profession intersect.',
        sidebarNote: 'The series introduction sets up the analytical frame and explains why a multi-lens approach is needed.',
        heroVisualId: 'topic-network',
        heroCaption: 'The topic network maps 170 sources across 39 topics in 11 dimensions — the knowledge base underpinning this series.',
        readTime: '16 min',
        accent: '#A51C30'
      },
      {
        id: 'law-gateway',
        title: 'Law Is the Gateway Drug',
        shortTitle: 'Law as the Gateway',
        dateLabel: '3 April 2026',
        authorsLabel: 'Anthea Roberts and David Wilkins',
        markdownPath: 'outputs/2026-04-07-2-law-is-the-gateway-drug.md',
        excerpt: 'Why law sits at the centre of business, regulation, and governance, and why that structural position makes it the natural gateway for AI across professional services.',
        sidebarNote: 'Law\'s structural centrality explains why the serious early AI money is flowing into legal.',
        heroVisualId: 'law-gateway',
        heroCaption: 'A systems map of law\'s structural centrality and the expanding legalisation of everything.',
        readTime: '10 min',
        accent: '#A51C30'
      },
      {
        id: 'harvey',
        title: 'Harvey\'s Strategic Evolution',
        shortTitle: 'Harvey\'s Strategic Evolution',
        dateLabel: '3 April 2026',
        authorsLabel: 'Anthea Roberts and David Wilkins',
        markdownPath: 'outputs/2026-04-07-3-harveys-strategic-evolution.md',
        excerpt: 'A read of Harvey as a platform, infrastructure, and ecosystem play rather than a narrow legal chatbot story.',
        sidebarNote: 'Harvey matters less as a feature set than as an attempt to become the trust and coordination layer for AI-enabled professional services.',
        heroVisualId: 'harvey-evolution',
        heroCaption: 'A concentric-circles model of Harvey\'s expansion from assistant to ecosystem governor.',
        readTime: '11 min',
        accent: '#8b5cf6'
      },
      {
        id: 'getting-your-hands-dirty',
        title: 'Getting Your Hands Dirty',
        shortTitle: 'Getting Your Hands Dirty',
        dateLabel: '4 April 2026',
        authorsLabel: 'Anthea Roberts and David Wilkins',
        markdownPath: 'outputs/2026-04-07-4-getting-your-hands-dirty.md',
        excerpt: 'What it actually feels like to work with AI on complex intellectual tasks, and why the gap between talking about AI and using it matters so much.',
        sidebarNote: 'This essay turns inward, from system analysis to lived experience with AI tools and agents.',
        heroVisualId: 'director-coach-editor',
        heroCaption: 'The shift from doing to directing — Director, Coach, and Editor as the three modes of human-AI collaboration.',
        readTime: '18 min',
        accent: '#A51C30'
      },
    ],
    visualisations: [
      {
        id: 'topic-network',
        title: 'Topic Network',
        shortTitle: 'Topic Network',
        path: 'visualisations/topic-network.html',
        embedPath: 'visualisations/topic-network.html?embed=1',
        previewScale: '1.15',
        previewOffsetX: '0%',
        previewOffsetY: '-2%',
        dateLabel: '9 April 2026',
        articleId: 'series-introduction',
        description: 'How 170 sources connect across 39 topics in 11 dimensions — the knowledge base underpinning the series.',
        accent: '#A51C30'
      },
      {
        id: 'law-gateway',
        title: 'Law as the Gateway',
        shortTitle: 'Law as the Gateway',
        path: 'visualisations/law-gateway-systems.html',
        embedPath: 'visualisations/law-gateway-systems.html?embed=1',
        previewScale: '1.12',
        previewOffsetX: '0%',
        previewOffsetY: '-3%',
        dateLabel: '3 April 2026',
        articleId: 'law-gateway',
        description: 'Systems map of law\'s structural centrality and the widening legalisation of adjacent domains.',
        accent: '#A51C30'
      },
      {
        id: 'harvey-evolution',
        title: 'Harvey\'s Strategic Evolution',
        shortTitle: 'Harvey\'s Strategic Evolution',
        path: 'visualisations/harveys-strategic-evolution.html',
        embedPath: 'visualisations/harveys-strategic-evolution.html?embed=1',
        previewScale: '0.98',
        previewOffsetX: '0%',
        previewOffsetY: '0%',
        dateLabel: '3 April 2026',
        articleId: 'harvey',
        description: 'Concentric circles showing Harvey\'s move from broad assistant to infrastructure and ecosystem orchestration.',
        accent: '#8b5cf6'
      },
      {
        id: 'director-coach-editor',
        title: 'Directors, Coaches, and Editors',
        shortTitle: 'Directors, Coaches, Editors',
        path: 'visualisations/director-coach-editor.html',
        embedPath: 'visualisations/director-coach-editor.html?embed=1',
        previewScale: '1.0',
        previewOffsetX: '0%',
        previewOffsetY: '0%',
        dateLabel: '4 April 2026',
        articleId: 'getting-your-hands-dirty',
        description: 'The shift from doing to directing — and the iterating cycle of Director, Coach, and Editor roles.',
        accent: '#A51C30'
      },
    ],
    placeholderLinks: {
      'link-to-project-page': 'about/index.html',
      'link-to-introduction': 'articles/index.html?article=series-introduction',
      'link-to-gateway-drug': 'articles/index.html?article=law-gateway',
      'link-to-harvey-piece': 'articles/index.html?article=harvey',
      'link-to-hands-dirty': 'articles/index.html?article=getting-your-hands-dirty',
      'link-to-scrambled-map': 'articles/index.html?article=scrambled-map',
      'link-to-scrambled-map-piece': 'articles/index.html?article=scrambled-map',
      'link-to-training-crisis': 'articles/index.html?article=training-crisis',
      'link-to-training-crisis-piece': 'articles/index.html?article=training-crisis',
      'link-to-up-and-out': 'articles/index.html?article=up-and-out',
      'link-to-up-and-out-piece': 'articles/index.html?article=up-and-out',
      'link-to-series-introduction': 'articles/index.html?article=series-introduction',
      'link-to-four-ingredients': 'visualisations/four-ingredients.html',
      'IMAGE_URL_HERE': 'visualisations/harveys-strategic-evolution.html',
      'INTERACTIVE_URL_HERE': 'visualisations/harveys-strategic-evolution.html'
    }
  };

  site.getArticle = function (id) {
    return site.articles.find(function (article) { return article.id === id; }) || site.articles[0];
  };

  site.getVisual = function (id) {
    return site.visualisations.find(function (visual) { return visual.id === id; }) || site.visualisations[0];
  };

  site.getArticleUrl = function (id) {
    return 'articles/index.html?article=' + encodeURIComponent(id);
  };

  site.getVisualUrl = function (id) {
    return site.getVisual(id).path;
  };

  site.linkFacultyNames = function (text) {
    var output = text;
    Object.keys(site.facultyPages)
      .sort(function (a, b) { return b.length - a.length; })
      .forEach(function (name) {
        var href = site.facultyPages[name];
        output = output.replaceAll(name, '<a href="' + href + '" target="_blank" rel="noopener">' + name + '</a>');
      });
    return output;
  };

  window.HarvardLegalProject = site;
})();
