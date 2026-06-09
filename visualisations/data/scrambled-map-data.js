/**
 * The Scrambled Competitive Map — Actor Network Data
 *
 * Source of truth: outputs/2026-04-07-5-the-scrambled-map.md
 * (canonical Piece 5 — David Wilkins' edits accepted, 2026-06-05 fact-check applied).
 * Every label, statistic, and quote in this file traces to that essay unless
 * explicitly drawn from the project's source corpus.
 *
 * 2026-06-05 platform-layer update: the essay expanded the platform-owner section
 * from Anthropic-only to all three model providers (Anthropic, Microsoft, OpenAI) —
 * "within roughly six weeks all three planted a flag in legal". Microsoft added here.
 * The deployment-firm apparatus (ANTHROPIC_JV, ODC, Tomoro, strategy-houses-take-equity)
 * is retained as cross-series context but is now *developed* in Piece 7, not Piece 5.
 *
 * v5 recut the essay from four temporal "generations" to a taxonomy of player
 * TYPES; this data follows that frame. Hand-positioned actors on a 1200x800
 * canvas, with edges across five competitive-dynamic types and swing actors
 * whose stance changes depending on which arrow you trace. Read down the canvas
 * for the structural story (upstream capital and models → deployment/JV vehicles
 * → tool vendors → AI-native firms → adaptive + legacy incumbents + buyers).
 * Read across the canvas for the scrambling story.
 *
 * Player types (v5): tool vendors · AI-native firms · platform owners ·
 * adaptive incumbents · deployment firms · capital (incl. capital that has
 * become the provider) · legacy incumbents · demand-side.
 *
 * Edge taxonomy
 * ─────────────
 *   capital            — investment / equity / round participation
 *   distribution       — A is a channel into B's stack, or B's platform runs A
 *   cannibalisation    — A's product erases B's category positioning
 *   absorption         — talent or equity defection from B's side to A's
 *   disintermediation  — A routes around B as middleman
 *
 * Direction convention: source is the actor doing the action; target is the
 * actor being acted upon. Visual arrowheads land at the target.
 */

window.SCRAMBLED_MAP_DATA = (function () {
  'use strict';

  const typeColors = {
    incumbent:           '#A51C30',                  // Harvard crimson — the fortress
    'adaptive-incumbent':'var(--df-risk-high)',      // strong orange — incumbents adopting challenger attributes
    'legal-ai-vendor':   'var(--df-cat-social)',     // purple — the tool-vendor / platform layer
    'ai-native':         'var(--df-lens-sky)',       // blue — the AI-native challengers
    foundation:          'var(--df-lens-red)',       // orange-red — the platform-owner substrate
    'consulting-jv':     'var(--df-risk-moderate)',  // amber — the deployment vehicles
    'strategy-consulting': 'var(--df-slate-600)',    // neutral — the absorbed players
    capital:             'var(--df-risk-extreme)',   // deep red — capital flowing across layers (incl. capital-as-provider)
    demand:              'var(--df-risk-low)'        // green — GCs not waiting
  };

  const typeLabels = {
    incumbent:             'Legacy incumbent',
    'adaptive-incumbent':  'Adaptive incumbent',
    'legal-ai-vendor':     'Tool vendor',
    'ai-native':           'AI-native firm',
    foundation:            'Platform owner',
    'consulting-jv':       'Deployment firm',
    'strategy-consulting': 'Strategy consultancy',
    capital:               'Capital',
    demand:                'Demand-side / GCs'
  };

  // ── Edge type styling ─────────────────────────────────────────────────
  const edgeTypes = {
    capital: {
      label: 'Capital flow',
      color: 'var(--df-risk-extreme)',
      dash:  'none',
      family: 'supportive'
    },
    distribution: {
      label: 'Distribution / partnership',
      color: 'var(--df-primary)',
      dash:  'none',
      family: 'supportive'
    },
    cannibalisation: {
      label: 'Cannibalisation',
      color: 'var(--df-risk-high)',
      dash:  '7,5',
      family: 'competitive'
    },
    absorption: {
      label: 'Absorption / defection',
      color: 'var(--df-cat-social)',
      dash:  '2,4',
      family: 'competitive'
    },
    disintermediation: {
      label: 'Disintermediation',
      color: 'var(--df-slate-500)',
      dash:  '5,3',
      family: 'competitive'
    }
  };

  const ABBR = {
    AM_LAW:        'AL',
    MIDSIZE:       'MS',
    BIG_FOUR:      'B4',
    ADAPTIVE:      'AD',
    HARVEY:        'HV',
    LEGORA:        'LG',
    LEGAL_TECH:    'LT',
    CROSBY:        'CR',
    NORM_AI:       'NA',
    MANIFEST:      'MF',
    ANTHROPIC:     'AN',
    MICROSOFT:     'MS',
    OPENAI:        'OA',
    ANTHROPIC_JV:  'AJV',
    ODC:           'ODC',
    STRATEGY:      'SC',
    SEQUOIA:       'SQ',
    BLACKSTONE:    'BX',
    CARTA:         'CA',
    IN_HOUSE:      'GC'
  };

  // Swing actors: stance changes depending on which arrow you trace.
  // Carta joins the set in v5 — capital that has crossed over into being the provider.
  const swingActors = ['HARVEY', 'SEQUOIA', 'BLACKSTONE', 'STRATEGY', 'CARTA'];

  // ---- Actors (hand-positioned on a 1200x800 canvas) ----
  const actors = [
    // ── Top band: capital + foundation models (the upstream) ──────────────
    {
      id: 'SEQUOIA',
      label: 'Sequoia',
      subtitle: 'Venture capital — funds every player type',
      type: 'capital',
      x: 160, y: 110,
      description: 'The capital signal that the market hasn’t picked a winner. Sequoia funds tool vendors (Harvey), AI-native firms (Crosby), platform owners (Anthropic), and deployment firms (Anthropic’s services JV) simultaneously — every layer of the new stack at once.',
      position: 'Cross-type backer. Holds positions on multiple, structurally contradictory sides of the same market. The single clearest expression of the "capital flows ignore every old boundary" claim.',
      power: 'Very high — agenda-setting capital with seats on the cap tables that decide which player type gets oxygen. Julien Bek’s "copilot vs autopilot" frame is itself a Sequoia thesis statement.',
      metrics: [
        'Co-led Harvey’s $11B March 2026 round with GIC',
        'Led Crosby’s June 2025 seed; participated in the $20M Series A (Index Ventures led)',
        'Co-lead of Anthropic’s current $30B round at a $900B valuation',
        'Named investor in the $1.5B Anthropic Services JV (May 4)'
      ],
      dataPoints: [
        'Julien Bek (Sequoia partner): "A copilot sells the tool. An autopilot sells the work."',
        'The only single actor with capital edges into tool vendors, AI-native firms, platform owners, AND deployment firms simultaneously',
        'The copilot-vs-autopilot frame that dominated 2024–25 industry discourse is itself a Sequoia thesis statement'
      ]
    },
    {
      id: 'ANTHROPIC',
      label: 'Anthropic',
      subtitle: 'Foundation model — Claude for Legal',
      type: 'foundation',
      x: 360, y: 110,
      description: 'The platform-owner substrate. Claude for Legal launched May 12, 2026 — twelve practice-area plugins, more than twenty MCP connectors, a Microsoft-365 agent. Twenty thousand legal professionals registered for the April webinar. Live customers on launch day: Freshfields (5,700 users across 33 offices), Quinn Emanuel, Holland & Knight, and Crosby Legal.',
      position: 'Platform owner — off the copilot/autopilot binary entirely. Read the connector list carefully: Harvey, Thomson Reuters/CoCounsel and LexisNexis are integrations into Claude, not platforms above it.',
      power: 'Substrate-layer. The Feb 2026 plugin announcement erased roughly $285B in software and professional-services market value in a single move — RELX -14%, Wolters Kluwer -13% — before the May 12 launch confirmed the read.',
      metrics: [
        'Claude for Legal: 12 practice-area plugins, 20+ MCP connectors, MS-365 agent',
        '20,000 legal professionals registered for April webinar',
        'Claude Opus 4.7 scored 90.9% on Harvey’s BigLaw Bench',
        '$900B valuation in current $30B round'
      ],
      dataPoints: [
        'Marc Nachmann (Goldman, on the Services JV): the vehicle will "democratise access to forward-deployed engineers"',
        'Harvey, Thomson Reuters/CoCounsel and LexisNexis are listed as integrations into Claude — not as platforms above it',
        'Claude Opus 4.7 outperforming the vertical layer built on top of it (90.9% on Harvey’s own benchmark) is the substrate-versus-plugin story made measurable',
        '20K registrations for the April webinar was the largest single gathering of legal AI users to date'
      ]
    },
    {
      id: 'MICROSOFT',
      label: 'Microsoft',
      subtitle: 'Platform owner — Word Legal Agent',
      type: 'foundation',
      x: 560, y: 110,
      description: 'The third platform owner to plant a flag in legal. On April 30, 2026 Microsoft shipped a Legal Agent directly inside Word — a purpose-built agent for playbook-driven clause review and tracked-change redlining, not a general copilot pointed at a contract. It was built by the engineering team Microsoft acqui-hired in January 2026 from Robin AI, the venture-backed legal-tech vendor that collapsed in late 2025 after failing to close its funding round. A tool vendor did not become a plugin on the platform; it died, and its engineers became the platform’s legal feature.',
      position: 'Platform owner embedded in the application surface. Its Word Legal Agent competes with the vertical contract-AI vendors directly, while Anthropic’s Claude for Legal reaches lawyers through a Microsoft-365 agent — so substrate and application now compete inside the same Word document.',
      power: 'Very high — distribution is the moat. The legal agent rides the installed base of Word and Microsoft-365, the surface where clause work and redlining already happen, with no adoption hurdle for the lawyer.',
      metrics: [
        'Word Legal Agent shipped April 30, 2026 — playbook clause review + tracked-change redlining',
        'Built by the team acqui-hired from Robin AI (~Jan 2026; ~18 staff incl. ex-CTO)',
        'Robin AI was a venture-backed vendor that collapsed late 2025 after failing to close its round',
        'Distributed inside Word / Microsoft-365 — no separate adoption step for the lawyer'
      ],
      dataPoints: [
        'A tool vendor did not become a plugin on the platform — it died, and its engineers became the platform’s legal feature',
        'Claude for Legal reaches lawyers through a Microsoft-365 agent even as Microsoft ships a legal agent of its own — substrate and application competing inside the same Word document',
        'Within roughly six weeks (Apr 30 → Jun 1) Microsoft, Anthropic and OpenAI each planted a flag in legal — the platform tier is contested, not held by one company'
      ]
    },
    {
      id: 'OPENAI',
      label: 'OpenAI',
      subtitle: 'Platform owner — legal vertical + deployment co.',
      type: 'foundation',
      x: 735, y: 110,
      description: 'The other model provider to plant a flag in legal. On June 1, 2026 OpenAI stood up a dedicated legal vertical and hired Jason Boehmig — the former Fenwick lawyer who co-founded contract-management company Ironclad and built it to a $3.2B valuation — to lead it. Separately, on the deployment side, February’s Frontier Alliances framework named BCG, McKinsey, Accenture and Capgemini as distribution partners, and by May 11 OpenAI had stood up the OpenAI Deployment Company — moving that layer from "partner" to "subsidiary with equity from the big strategy houses".',
      position: 'Platform owner (legal vertical) and deployment-vehicle operator at once. The legal vertical is the Piece-5 platform-tier move; the Tomoro acquisition (May 11) gives the ODC a UK applied-AI consultancy of ~150 forward-deployed engineers — built the in-game support agent serving Supercell’s 110M+ users — and is taken up in the final piece.',
      power: 'Foundation-layer + deployment-layer dominance. One of three model providers now competing for the platform tier in legal; also backstops the McKinsey/Bain/Capgemini bet that the consulting houses can’t stay outside the platform.',
      metrics: [
        'June 1, 2026: dedicated legal vertical, led by Jason Boehmig (Ironclad co-founder)',
        'OpenAI Deployment Company: $4B initial capital, $10B entity valuation',
        '19 partner firms led by TPG; Advent, Bain Capital, Brookfield as co-leads',
        'McKinsey, Bain & Company, Capgemini named as equity investors',
        'Acquired Tomoro (~150 FDEs; Supercell 110M-user agent)',
        'Feb 2026 Frontier Alliances: BCG, McKinsey, Accenture, Capgemini as distribution partners'
      ],
      dataPoints: [
        'Jason Boehmig built Ironclad to a $3.2B valuation before joining OpenAI to lead its legal vertical — incumbent legal-tech founder crossing to the platform layer',
        'Within roughly six weeks all three major model providers (Anthropic May 12, Microsoft Apr 30, OpenAI Jun 1) planted a flag in legal',
        'Same Tomoro team built Supercell’s in-game support agent — at 110M+ users, the largest single FDE deployment outside Palantir’s portfolio',
        'Frontier Alliances → ODC equity is a textbook structural absorption — distribution partners became owners in the deal that disintermediates them'
      ]
    },
    {
      id: 'STRATEGY',
      label: 'Strategy\nConsultants',
      subtitle: 'McKinsey, Bain & Company, Capgemini, BCG',
      type: 'strategy-consulting',
      x: 920, y: 110,
      description: 'February 2026 distribution partners of the foundation models. May 11 equity investors in the JV that disintermediates traditional consulting. They didn’t beat the foundation models — the ones that took the move seriously took equity and will now sell their methodology, branded as someone else’s product, with the foundation-model company keeping ownership of the model underneath.',
      position: 'Swing actor #1. February Frontier Alliances: BCG, McKinsey, Accenture, Capgemini as OpenAI distribution partners. May 11: McKinsey, Bain & Company, Capgemini move from partner to equity investor in OpenAI Deployment Company. Different constituent firms across the two announcements; the structural move is what counts.',
      power: 'Compressing fast. The original "Big Four absorb the Am Law market" forecast assumed strategy houses were the long-run winners; the deployment-firm move inverts that — they now sell from inside a foundation-model JV rather than against it.',
      metrics: [
        'Feb 2026: distribution partners under Frontier Alliances framework',
        'May 11: equity investors in OpenAI Deployment Company ($10B valuation)',
        'McKinsey + Capgemini in both rounds; Bain & Company joined at the equity stage'
      ],
      dataPoints: [
        'Three-month structural flip: Feb distribution partner → May equity investor in the same counterparty’s vehicle',
        'McKinsey and Capgemini appear in both rounds; Bain & Company appears only in May — different firms picked different moments to move',
        'BCG was in the Feb alliance but not the May equity round — the most exposed strategy house with the least skin in the game'
      ]
    },
    {
      id: 'BLACKSTONE',
      label: 'Blackstone',
      subtitle: 'Capital — client + investor + JV co-founder',
      type: 'capital',
      x: 1080, y: 110,
      description: 'Swing actor #2. Three simultaneously active positions on the same map. Major law firm client (the work feeds Am Law top-line). $50M investor in Norm AI (whose product is built to replace exactly that work). And $300M co-founder of Anthropic’s Services JV (which sells deployment to the firms Blackstone owns and advises).',
      position: 'Capital with portfolio interests on every side of the disruption. The clearest expression of "when the capital markets can’t decide which model wins, they fund all of them".',
      power: 'Very high. Co-anchor of the largest deployment vehicle, biggest single-name investor in the most-talked-about AI-native entrant, and a buyer of legal services at the volume that moves Am Law’s P&L.',
      metrics: [
        '$50M investment in Norm AI; helped attract Schmidtberger to chair Norm Law',
        '$300M co-founder of the $1.5B Anthropic Services JV (May 4)',
        'Anchor client of multiple Am Law 100 firms across deal, fund, and dispute work'
      ],
      dataPoints: [
        'Three positions held simultaneously: client of Am Law firms, $50M investor in Norm AI, $300M co-founder of the Anthropic Services JV',
        'The $50M Norm AI stake helped attract Schmidtberger out of Sidley Austin — capital that buys leadership defection, not just equity',
        'The Anthropic JV investor list (Blackstone, Goldman, H&F, Apollo, General Atlantic, Leonard Green, GIC, Sequoia) reads as a who’s who of firms that fund the legal industry’s largest clients'
      ]
    },
    {
      id: 'CARTA',
      label: 'Carta /\nCarta Law',
      subtitle: 'Capital that became the provider',
      type: 'capital',
      x: 1090, y: 300,
      description: 'The sharpest new move in v5: capital stops funding law firms and starts being one. On May 13, 2026 Carta — the cap-table software company that reached ~$500M in annual recurring revenue — acquired Avantia, an SRA-regulated AI-native law firm serving 200+ asset managers and, on its own account, 30% of the world’s largest funds across ~$15 trillion in assets — and launched Carta Law.',
      position: 'Swing actor. Begins as software/capital and crosses over into the provider layer. The venture-world inversion the essay calls "service as software" turned inside out — and the most extreme example of it so far.',
      power: 'Rising and structurally novel. Because Avantia already served private-equity clients, owning it lets Carta insert itself directly into those clients’ workflows, with an obvious path to move up from routine work into the higher-value advice that has always been the incumbents’ fortress.',
      metrics: [
        'May 13, 2026: acquired Avantia, launched Carta Law',
        'Carta: ~$500M annual recurring revenue (end-2025)',
        'Avantia: SRA-regulated; 200+ asset managers; ~30% of the world’s largest funds; ~$15T AUM (Avantia’s own figures)'
      ],
      dataPoints: [
        'Henry Ward (Carta CEO): "The largest PE firms in the world are paying top-tier law firms for high-volume, ultimately routine legal work, and they shouldn’t have to."',
        'James Sutton (Avantia founder): "We founded Avantia in 2019 on a contrarian bet — that AI could deliver legal and compliance outcomes, not just assist with them."',
        'The funder has stopped funding law firms and started being one — capital crossing the regulatory line into the provider’s chair',
        'Cross-sector echo (not on this map): Corgi, an AI-native insurance carrier, went Series A → $1.3B in ~4 months, then ~$2.6B weeks later — the same pattern wherever a regulated service can be rebuilt AI-first'
      ]
    },

    // ── Upper-mid: deployment / AI-consulting JV vehicles ─────────────────
    {
      id: 'ANTHROPIC_JV',
      label: 'Anthropic\nServices JV',
      subtitle: 'May 4 — $1.5B enterprise services vehicle',
      type: 'consulting-jv',
      x: 400, y: 280,
      description: 'Announced May 4, 2026. $1.5B AI-native enterprise services firm with Blackstone, Hellman & Friedman, and Goldman Sachs as co-founders; additional backing from Apollo, General Atlantic, Leonard Green, GIC, and Sequoia. Goldman’s Marc Nachmann framed it as "democratising access to forward-deployed engineers" — companies that couldn’t historically afford Big Three consulting fees now get a foundation-model-backed alternative.',
      position: 'Deployment vehicle. Off the copilot/autopilot binary. Operating model is Palantir’s: FDEs parachute into client organisations and live inside the legacy infrastructure, compliance and permissions complexity rather than shipping software and walking away.',
      power: 'High — and rising. The investor list (Blackstone, Goldman, H&F, Apollo, General Atlantic, Leonard Green, GIC, Sequoia) reads as a who’s who of firms that fund and serve the legal industry’s largest clients.',
      metrics: [
        '$1.5B in announced capital',
        'Co-founders: Blackstone ($300M), Hellman & Friedman, Goldman Sachs',
        'Additional backers: Apollo, General Atlantic, Leonard Green, GIC, Sequoia',
        'Operating partner: Anthropic (Claude as platform)'
      ],
      dataPoints: [
        'Operating model is Palantir’s — FDEs parachute into client organisations and live inside the complexity rather than shipping software and walking away',
        'Marc Nachmann (Goldman): the JV "democratises access to forward-deployed engineers" — companies that couldn’t afford Big Three fees now have a foundation-model-backed alternative',
        'Anthropic operates; Anthropic keeps ownership of the model underneath — the consulting houses don’t — which is the structural inversion'
      ]
    },
    {
      id: 'ODC',
      label: 'OpenAI Deployment\nCompany',
      subtitle: 'May 11 — $4B capital, $10B valuation',
      type: 'consulting-jv',
      x: 820, y: 280,
      description: 'OpenAI’s formal deployment vehicle. $4B initial capital, $10B entity valuation, 19 partner firms led by TPG with Advent, Bain Capital and Brookfield as co-leads. McKinsey, Bain & Company and Capgemini took equity. Tomoro acquired the same day to staff it from day one — UK-based applied-AI consultancy with roughly 150 forward-deployed engineers, including the team that built Supercell’s in-game support agent for 110M+ users.',
      position: 'Deployment vehicle. Inverts the February Frontier Alliances arrangement: strategy houses moved from distribution partners to equity investors. They now sell their methodology branded as OpenAI’s product, with OpenAI keeping ownership of the model underneath.',
      power: 'High. Largest single deployment-vehicle capital base by entity valuation; broadest LP base (19 named partners).',
      metrics: [
        '$4B initial capital; $10B entity valuation',
        '19 partner firms; TPG lead, Advent / Bain Capital / Brookfield co-lead',
        'McKinsey, Bain & Company, Capgemini as equity investors',
        'Tomoro acquired: ~150 FDEs; built Supercell’s 110M-user in-game agent'
      ],
      dataPoints: [
        'Broadest LP base of any deployment vehicle (19 partner firms)',
        'Tomoro acquired on the same day as the entity launch — ODC was operational with ~150 FDEs from day one',
        'Combined disclosed capital across the dual deployment JVs (ODC + Anthropic Services) was ~$5.5B in a single week of May 2026'
      ]
    },

    // ── Middle: tool-vendor layer ──────────────────────────────────────────
    {
      id: 'HARVEY',
      label: 'Harvey',
      subtitle: 'Tool vendor — and a plugin on the platform',
      type: 'legal-ai-vendor',
      x: 200, y: 440,
      description: 'Swing actor #3. Tool vendor that now occupies three structurally contradictory positions at once. Sells into Am Law incumbents. Runs Shared Spaces, which puts law firms and their corporate clients in the same AI-powered workspace. And is now a plugin on a platform owner (Claude) that competes with the vertical legal-AI category directly.',
      position: 'Supplier to incumbents, infrastructure for clients trying to disintermediate them, and distribution channel on a platform that competes with it. All at once.',
      power: 'High inside the firm-services layer, structurally compressed from above. The tool-vendor category that the May 12 launch reframed as a plugin layer.',
      metrics: [
        '~$11B valuation in March 2026 round (Sequoia + GIC co-led)',
        'Combined Harvey + Legora private value exceeded $16B by early 2026',
        'Majority of the Am Law 100 are Harvey customers',
        'Plugin on Claude for Legal at the May 12 launch',
        'Claude Opus 4.7 scored 90.9% on Harvey’s BigLaw Bench'
      ],
      dataPoints: [
        'Harvey’s corporate revenue shifted from 4% to 33% in under a year — GC demand-pull, not law-firm-led adoption',
        'Shared Spaces puts law firms and corporate clients in the same AI workspace — collaboration infrastructure that doubles as disintermediation infrastructure',
        'Pierson Ferdinand launched with 130+ partners (now 270+) and near-zero juniors, using Harvey for the work associates would have done — the purest expression of the AI-native obelisk model'
      ]
    },
    {
      id: 'LEGORA',
      label: 'Legora',
      subtitle: 'Tool vendor — Europe-led legal AI',
      type: 'legal-ai-vendor',
      x: 400, y: 440,
      description: 'European legal-AI platform, the second pole of the tool-vendor leader pair. Combined private value of Harvey + Legora exceeded $16B by early 2026 — Legora alone reached a $5.6B valuation. Deloitte partnership extends its distribution into the established-challenger channel.',
      position: 'Tool vendor with a regional anchor. Same structural compression as Harvey from the platform owner above; differentiated distribution through the Big Four partnership.',
      power: 'High in Europe, narrower in the US. Distribution alliance with Deloitte gives it a route into Big Four legal arms.',
      metrics: [
        '$5.6B private valuation',
        'Deloitte partnership for joint distribution',
        'Combined Harvey + Legora private value > $16B by early 2026'
      ],
      dataPoints: [
        'Distribution strategy is the mirror image of Harvey’s — Big Four (Deloitte) instead of Am Law',
        'Built on Anthropic Claude — same platform-dependency risk as Harvey, but the Deloitte distribution channel may absorb the squeeze differently',
        'Combined Harvey + Legora private value (~$16.55B) suggests two roughly equal-sized tool-vendor leader poles with structurally different distribution bets'
      ]
    },
    {
      id: 'LEGAL_TECH',
      label: 'Legal Tech\nIncumbents',
      subtitle: 'RELX / Thomson Reuters / Wolters Kluwer',
      type: 'legal-ai-vendor',
      x: 620, y: 440,
      description: 'The legacy legal-publishing and workflow incumbents (RELX/LexisNexis, Thomson Reuters/CoCounsel, Wolters Kluwer). Their categorical claim was that vertical legal data + legal workflow software equals durable platform value. The Feb 2026 sell-off was the market’s early read on what May 12 confirmed: that bundle is now a plugin on the platform-owner substrate.',
      position: 'Tool vendor by category — now plugin layer. RELX and LexisNexis are integrations into Claude, not platforms above it. Thomson Reuters carries the largest war chest to respond ($10B+).',
      power: 'High in installed base, structurally compressed from above. The Feb 2026 sell-off erased roughly $285B in market value across the segment.',
      metrics: [
        'Feb 2026 plugin announcement: RELX -14%, Wolters Kluwer -13%',
        '~$285B in software + professional-services market value erased',
        'Thomson Reuters: ~$10B war chest for response',
        'KPMG holds the Arizona license that breaches Rule 5.4 for one Big Four firm'
      ],
      dataPoints: [
        'Thomson Reuters’ ~$10B war chest is the largest single response budget of any legal-tech incumbent',
        'Proprietary legal data may be the last defensible moat now that workflow software runs as a plugin on the foundation-model layer',
        'The Feb 2026 sell-off was the market pricing-in May 12 three months early'
      ]
    },

    // ── Lower-mid: AI-native firms ───────────────────────────────────────
    {
      id: 'CROSBY',
      label: 'Crosby',
      subtitle: 'AI-native — contract autopilot',
      type: 'ai-native',
      x: 820, y: 470,
      description: 'Sequoia-backed at seed (June 2025), Cooley-backed (the rare case of an Am Law firm investing in a potential AI-native competitor), and a $20M Series A led by Index Ventures. Crosby Legal was a launch customer of Claude for Legal — an AI-native firm built on top of a platform owner, not against it.',
      position: 'AI-native firm — Bek’s "sells the work" pole. Rebuilds legal delivery from scratch around contract autopilot. Cost curve: technology costs scale logarithmically, human labour scales linearly.',
      power: 'Emerging. Punches above its weight via brand-name capital (Sequoia, Cooley) and proof-of-platform endorsement (live Claude for Legal customer at launch).',
      metrics: [
        '$20M Series A — Index Ventures led; Cooley and Sequoia participated',
        'Sequoia led the June 2025 seed',
        'Launch customer of Claude for Legal (May 12)',
        'Cooley invests in Crosby — an Am Law firm hedging into an AI-native firm'
      ],
      dataPoints: [
        'Reduced contract review from 173 days to 3 weeks at the same volume — order-of-magnitude productivity, not incremental',
        'Cooley — an Am Law firm — invested in a potential competitor; the only visible Am Law hedge into an AI-native firm',
        'Sister category: Covenant delivers LP-agreement reviews at ~90% below traditional pricing with a 6-lawyer team — the same cost-curve story as Crosby but on a different work type'
      ]
    },
    {
      id: 'NORM_AI',
      label: 'Norm AI',
      subtitle: 'AI-native — parent of Norm Law',
      type: 'ai-native',
      x: 1020, y: 470,
      description: 'Parent entity behind Norm Law, the AI-native legal services firm. Raised more than $140M from Bain Capital, Blackstone, Vanguard, Citi and Marc Benioff — Blackstone’s $50M investment helped attract Mike Schmidtberger, who chaired Sidley Austin’s executive committee for seven years, to chair the new entity. When the person who ran one of the largest traditional firms walked through the doors of a two-month-old AI-native platform, he told Bloomberg Law he "confronted the future".',
      position: 'AI-native firm — Bek’s "sells the work" pole, now with senior-incumbent leadership defection (Schmidtberger). Other AI-native entrants in this category: Covenant (fund formation, 6 lawyers, ~90% below traditional pricing on LP-agreement reviews), Garfield AI, Pierson Ferdinand.',
      power: 'High for a young entrant. Capital base (>$140M) and senior-incumbent leadership give it credibility that purely engineering-led AI-native startups lack.',
      metrics: [
        'Raised > $140M (Bain Capital, Blackstone, Vanguard, Citi, Marc Benioff)',
        'Blackstone’s $50M investment specifically anchored the Schmidtberger recruit',
        'Schmidtberger chairs Norm Law after 7 years chairing Sidley Austin’s executive committee'
      ],
      dataPoints: [
        'Schmidtberger (ex-Sidley): "confronted the future" when he walked through the doors — leadership defection, not junior disaffection',
        'Arizona ABS framework enabled the non-lawyer-ownership structure that Rule 5.4 historically blocked',
        'Blackstone is simultaneously client (of Am Law firms), investor (in Norm AI), and architect of its own supplier’s replacement — a position with no precedent in the profession’s competitive history'
      ]
    },
    {
      id: 'MANIFEST',
      label: 'Manifest OS',
      subtitle: 'AI-native — builds and runs its own firms',
      type: 'ai-native',
      x: 920, y: 590,
      description: 'AI-native firm that raised a $60M Series A at a $750M valuation and refuses to sell software to incumbents — it builds and runs its own AI-native firms instead (firms operate under Manifest Law). The clearest statement of the "sells the work, not the tool" type: it owns the client relationship and the full fee, not a subscription.',
      position: 'AI-native firm on the "sells the work" pole. Same cost-curve logic as Crosby and Covenant — technology costs scale logarithmically while human labour scales linearly — built into the business model rather than retrofitted.',
      power: 'Emerging but well-capitalised. The $60M Series A was billed as the largest in legal-tech history (a company claim); investors include Menlo Ventures, Kleiner Perkins, First Round and Quiet Capital.',
      metrics: [
        '$60M Series A at a $750M valuation',
        'Operates its own AI-native firms (Manifest Law), rather than selling tools',
        'Investors: Menlo, Kleiner Perkins, First Round, Quiet Capital'
      ],
      dataPoints: [
        'Dan Mishin (CEO): "We made the hard choice to not sell our AI software to existing law firms who are often beholden to billing customers more hours as a means to better compensation."',
        'Build-and-operate model is the structural opposite of the tool vendors — Manifest captures the full fee and the client relationship, not a seat licence',
        '"Largest legal-tech Series A in history" is a company-asserted superlative, not an audited ranking'
      ]
    },

    // ── Bottom band: adaptive + legacy incumbents + demand side ───────────
    {
      id: 'AM_LAW',
      label: 'Am Law 100',
      subtitle: 'Incumbents — the fortress',
      type: 'incumbent',
      x: 170, y: 660,
      description: 'The fortress. Am Law 100 firms are simultaneously raising rates on captive, bet-the-company work and recruiting first-year law students before they’ve taken an exam — while in-house departments quietly build the infrastructure to bypass them. Record profits and a client base packing bags are both true at the same time, in the same market.',
      position: 'Pre-AI incumbent. The side of the line every other player type’s investment thesis is built against. Cooley’s investment in Crosby is the visible exception: an Am Law firm hedging into an AI-native firm.',
      power: 'Very high on captive, high-stakes work where reputation matters and the opinion letter still carries institutional weight. Margins are compressing on routine and moderately complex work where the work can leave.',
      metrics: [
        'Profits per lawyer up ~54% since 2019',
        'Couldn’t crack 2% demand growth late 2025; midsize firms surged to ~5%',
        '15+ firms paying $50K bonuses to 1L summer students for second-summer commitments',
        'Cooley invests in Crosby — Am Law hedging into an AI-native competitor'
      ],
      dataPoints: [
        '15+ firms paying first-year law students $50K to spend their 1L summer doing public-interest work in exchange for a second-summer commitment — recruiting before students have taken an exam',
        '90% of legal dollars still flow through hourly billing — the captive-rate fortress is real',
        'Margins peak just before the structural break — record profits and a client base packing bags are both true at the same time',
        'Cooley — an Am Law firm — invested in Crosby; the only visible Am Law hedge into an AI-native firm'
      ]
    },
    {
      id: 'MIDSIZE',
      label: 'Midsize\nFirms',
      subtitle: 'Incumbents — the squeezed middle',
      type: 'incumbent',
      x: 350, y: 660,
      description: 'The category that is gaining where Am Law 100 is stalling. Midsize firms surged to nearly 5% demand growth in late 2025 while Am Law couldn’t crack 2% — GCs are shifting routine and increasingly moderately complex work down-market. But the squeeze is bidirectional: Am Law absorbs lower-margin work from above when it has to, and AI-native cost curves compress from below.',
      position: 'Mid-market incumbent. The structural beneficiary of GCs choosing to shift work downstream rather than pay Am Law’s rising captive rates. Also the most exposed category to AI-native cost-curve compression.',
      power: 'Rising in the near term — capturing the work Am Law has priced itself out of. Structurally fragile in the medium term — sits directly in the path of autopilot pricing from below.',
      metrics: [
        '~5% demand growth in late 2025 (vs Am Law 100 at <2%)',
        'Beneficiary of GC down-shifting on routine and moderately complex work',
        'Squeezed from above (Am Law absorbing lower-margin work) and below (AI-native economics)'
      ],
      dataPoints: [
        'The category that resolves the Thomson Reuters / Harbor "paradox" — record top-end profits and quietly bypassed top-end firms can coexist because the work is moving sideways and down, not disappearing',
        'GCs shifting "routine work — and increasingly even moderately complex work — downstream" is the demand-side mechanism Am Law cannot directly counter without abandoning the captive-rate strategy',
        'AI-native cost curves (Crosby, Covenant) compete most directly with midsize on contract review, LP agreements, and other routine-and-moderately-complex work types'
      ]
    },
    {
      id: 'BIG_FOUR',
      label: 'Big Four',
      subtitle: 'PwC, Deloitte, EY, KPMG',
      type: 'incumbent',
      x: 540, y: 660,
      description: 'The established challengers. By 2012 PwC was promoting legal services in 124 countries; the Big Four weren’t trying to be law firms but to build integrated solutions combining legal, consulting, tax, technology and project management. KPMG holds the Arizona license that breached Rule 5.4 for one of them. When law firms tried to adopt the integrated model, lawyers constituted 10% or less of the billable project work.',
      position: 'Pre-AI established challenger. Tracey Yurko’s assessment: "On balance, I have to give the advantage to the Big Four if (and for now that is an if) regulations change and allow them to practice law... they can deliver a more integrated type of service."',
      power: 'High — distribution reach, integrated-services capability, regulatory openings via Arizona/Utah. Now squeezed from above by deployment vehicles that sell deployment more directly than Big Four consulting historically did.',
      metrics: [
        'PwC: legal services in 124 countries by 2012',
        'KPMG: Arizona license (Rule 5.4 breach)',
        'Lawyers ≤ 10% of billable work when law firms attempted the integrated model'
      ],
      dataPoints: [
        'Tracey Yurko (Bridgewater): "advantage goes to the Big Four if (and for now that is an if) regulations change... they can deliver a more integrated type of service"',
        'On Big Four projects, lawyers constitute ≤10% of billable work — fundamentally different bundle than the partnership model, not just a cheaper version of it',
        'KPMG’s Arizona law license under the ABS framework is the visible regulatory wedge — Rule 5.4 isn’t as airtight as it used to be',
        'PwC is Harvey’s Shared Spaces design partner — Big Four are natural Harvey distribution nodes given existing client relationships'
      ]
    },
    {
      id: 'ADAPTIVE',
      label: 'Adaptive\nIncumbents',
      subtitle: 'Freshfields · Kirkland',
      type: 'adaptive-incumbent',
      x: 690, y: 600,
      description: 'The category the standard disruption story leaves out: incumbents that survive by adopting the challengers’ attributes. Christensen saw only incumbents and challengers; he had no room for the incumbent that adapts. Freshfields went firm-wide on Claude (5,700 users across 33 offices). Kirkland & Ellis is building — and owning — its own AI outright, on the theory that at the top of the market the technology is too central to rent.',
      position: 'Incumbents pulling away from the legacy band by adopting challenger attributes. Most incumbents will not do this; a core of them will, and they will not look like the firms they are today.',
      power: 'High and self-directed. Kirkland’s owned-infrastructure bet (~$500M, funded from the firm’s own revenue) is the most aggressive version; Freshfields’ firm-wide platform adoption is the partnership version.',
      metrics: [
        'Kirkland & Ellis: ~$500M to build proprietary AI it owns outright (>$100M this year; 180 technologists; trained on 250 of its own lawyers)',
        'Freshfields: Claude firm-wide — 5,700 users across 33 offices',
        'Funded from firm revenue, not licensed from a vendor'
      ],
      dataPoints: [
        'Kirkland is the world’s highest-grossing firm — raising rates on captive work while betting half a billion of its own revenue that today’s model will not hold',
        '"Adaptive incumbent" is the missing Christensen category — neither static fortress nor disrupted casualty',
        'Owning the infrastructure (Kirkland) vs going firm-wide on a platform (Freshfields) are two routes across the same gap'
      ]
    },
    {
      id: 'IN_HOUSE',
      label: 'In-house / GCs',
      subtitle: 'Demand side — not waiting',
      type: 'demand',
      x: 820, y: 660,
      description: 'The demand side has stopped waiting for the supply side to settle. Eric Dodson Greenberg (Cox Media Group): "Every contract, negotiation, and filing feeds a system that captures not just what was done, but how it was approached... that knowledge compounds independently of any individual lawyer. And crucially, it belongs to — and resides with — the client, not the firm." Bjarne Tellmann (former Pearson GC): clients have spent fifty years trying to get out from under the stranglehold; AI gives them the tools.',
      position: 'Demand-side independence. The flywheel that makes every supply-side debate moot if it keeps spinning. Tracey Yurko’s Bridgewater "virtual law firm" — segmenting work by complexity, partnering with PwC, cutting costs > 50% — is the archetype.',
      power: 'Structurally rising. Deployment vehicles give the demand side a parallel supply channel that didn’t exist a quarter ago (Goldman’s Nachmann: "democratising access to forward-deployed engineers").',
      metrics: [
        '65% of corporate legal departments actively insourcing work (Harbor 2025)',
        '64% expect AI to reduce reliance on outside counsel',
        '85% have dedicated AI resources or governance committees',
        'In-house gen-AI use more than doubled: 23% → 52% in a single year',
        'Expectations of increased outside-counsel spending dropped 58% → 37%'
      ],
      dataPoints: [
        'Eric Dodson Greenberg (Cox Media): "Every contract, negotiation, and filing feeds a system that captures not just what was done, but how it was approached — the reasoning, the tradeoffs, the institutional logic. That knowledge compounds independently of any individual lawyer. And crucially, it belongs to — and resides with — the client, not the firm."',
        'Bjarne Tellmann (former Pearson GC): "Clients have spent fifty years trying to figure out how to get out from under the stranglehold. AI gives them tools to do it."',
        'Tracey Yurko’s Bridgewater "virtual law firm" — segmenting work by complexity, partnering with PwC, cutting costs > 50% — is the archetype of the demand-side independence model',
        'Ratchet effect: once AI infrastructure is built in-house, it persists — there’s no clean way to reverse the insourcing once the institutional knowledge has compounded'
      ]
    }
  ];

  // ---- Edges across five competitive dynamics --------------------------
  // Note: Anthropic↔Harvey appears twice on purpose — once as distribution
  // (Harvey is a plugin on Claude for Legal) and once as cannibalisation
  // (the same launch reframed Harvey as a plugin layer on a platform that
  // competes with the vertical legal-AI category directly). That double-
  // edged status is the whole point of marking Harvey as a swing actor.
  const edges = [
    // ── Capital flows (red, solid) ────────────────────────────────────
    {
      source: 'SEQUOIA', target: 'HARVEY', type: 'capital',
      label: 'Sequoia backs Harvey',
      description: 'GIC and Sequoia co-led Harvey’s March 2026 round at a ~$11B valuation. The tool-vendor leg of Sequoia’s every-type thesis.'
    },
    {
      source: 'SEQUOIA', target: 'CROSBY', type: 'capital',
      label: 'Sequoia backs Crosby',
      description: 'Sequoia led the June 2025 seed and participated in the $20M Series A (Index Ventures led). The AI-native leg of Sequoia’s every-type thesis.'
    },
    {
      source: 'SEQUOIA', target: 'ANTHROPIC', type: 'capital',
      label: 'Sequoia backs Anthropic',
      description: 'Co-lead of Anthropic’s current $30B round at a $900B valuation. The platform-owner leg of Sequoia’s every-type thesis — the substrate Harvey and Crosby now run on.'
    },
    {
      source: 'SEQUOIA', target: 'ANTHROPIC_JV', type: 'capital',
      label: 'Sequoia backs the Anthropic Services JV',
      description: 'Named investor in the May 4 $1.5B Anthropic Services JV. The deployment-firm leg — completing positions in every layer of the new stack simultaneously.'
    },
    {
      source: 'BLACKSTONE', target: 'NORM_AI', type: 'capital',
      label: 'Blackstone backs Norm AI',
      description: '$50M investment in Norm AI (parent of Norm Law) as a lead investor. The capital that helped attract Schmidtberger out of Sidley Austin to chair the new entity.'
    },
    {
      source: 'BLACKSTONE', target: 'ANTHROPIC_JV', type: 'capital',
      label: 'Blackstone co-founds the Anthropic Services JV',
      description: '$300M co-founder of the May 4 $1.5B vehicle, alongside Hellman & Friedman and Goldman Sachs. Blackstone simultaneously buys legal services, owns Norm AI, and now co-owns the JV that sells deployment.'
    },

    // ── Distribution / partnership (blue, solid) ──────────────────────
    {
      source: 'ANTHROPIC', target: 'ANTHROPIC_JV', type: 'distribution',
      label: 'Anthropic operates the Services JV',
      description: 'Claude is the platform; Anthropic keeps ownership of the model underneath. Operating model borrowed from Palantir — FDEs parachute into client organisations and live inside the complexity rather than shipping software and walking away.'
    },
    {
      source: 'OPENAI', target: 'ODC', type: 'distribution',
      label: 'OpenAI operates ODC',
      description: 'OpenAI Deployment Company is OpenAI’s formal deployment vehicle. Tomoro acquired the same day (May 11) to staff FDE delivery from day one.'
    },
    {
      source: 'ANTHROPIC', target: 'HARVEY', type: 'distribution',
      label: 'Harvey ships as a Claude for Legal plugin',
      description: 'Harvey is a launch integration on Claude for Legal. Distribution alliance and category compression at the same time — the alliance side of the swing.'
    },

    // ── Absorption / defection (purple, dot-dash) ─────────────────────
    {
      source: 'STRATEGY', target: 'ODC', type: 'absorption',
      label: 'Strategy consultants flip to ODC equity',
      description: 'February: distribution partners under Frontier Alliances. May 11: McKinsey, Bain & Company and Capgemini take equity in the OpenAI Deployment Company. The same firms that were distribution arms three months earlier are now owners on the foundation-model side of the deal.'
    },
    {
      source: 'NORM_AI', target: 'AM_LAW', type: 'absorption',
      label: 'Schmidtberger defects to Norm Law',
      description: 'Mike Schmidtberger — seven years chairing Sidley Austin’s executive committee — left to chair Norm Law, the AI-native firm Norm AI is parent of. He told Bloomberg Law he "confronted the future" when he walked through the door.'
    },

    // ── Cannibalisation (orange, dashed wide) ─────────────────────────
    {
      source: 'CROSBY', target: 'AM_LAW', type: 'cannibalisation',
      label: 'Autopilot pricing erases partnership rates',
      description: 'AI-native cost curve: technology costs scale logarithmically, human labour scales linearly. Sister-firm Covenant delivers LP-agreement reviews at roughly 90% below traditional pricing on related work; Crosby targets the same delta on contract autopilot.'
    },
    {
      source: 'ANTHROPIC', target: 'LEGAL_TECH', type: 'cannibalisation',
      label: 'Feb 2026 plugin sell-off',
      description: 'Anthropic’s February plugin announcement erased ~$285B in software and professional-services market value in a single move. RELX -14%, Wolters Kluwer -13% — the market’s early read on what May 12 confirmed.'
    },
    {
      source: 'ANTHROPIC', target: 'HARVEY', type: 'cannibalisation',
      label: 'Claude for Legal compresses the vertical layer',
      description: 'The May 12 launch reframed Harvey as a plugin layer on a platform that competes with the vertical legal-AI category directly. Distribution alliance and category compression in one move — the tension side of the swing.'
    },
    {
      source: 'ANTHROPIC_JV', target: 'STRATEGY', type: 'cannibalisation',
      label: 'JV deployment undercuts consulting fees',
      description: 'Deployment firms sell deployment directly to enterprise. Nachmann: "democratising access to forward-deployed engineers" — companies that couldn’t afford Big Three fees now have a foundation-model-backed alternative.'
    },
    {
      source: 'MIDSIZE', target: 'AM_LAW', type: 'cannibalisation',
      label: 'Mid-market captures down-shifted work',
      description: 'Midsize surged to ~5% demand growth in late 2025 while Am Law 100 couldn’t crack 2%. GCs shift routine and increasingly moderately complex work downstream — the work that fled Am Law’s rising captive rates landed at midsize, not nowhere.'
    },

    // ── Disintermediation (grey, dashed narrow) ───────────────────────
    {
      source: 'BIG_FOUR', target: 'AM_LAW', type: 'disintermediation',
      label: 'Integrated solutions route around partnership delivery',
      description: 'Big Four sell integrated solutions where lawyers constitute ≤ 10% of the billable project work — a structurally different bundle that routes around the partnership model.'
    },
    {
      source: 'IN_HOUSE', target: 'AM_LAW', type: 'disintermediation',
      label: 'Insourcing reduces outside counsel',
      description: '65% of GCs actively insourcing; 64% expect AI to reduce reliance on outside counsel. Greenberg (Cox): "The knowledge belongs to the client, not the firm." The fortress is real; the bags being packed are also real.'
    },
    {
      source: 'IN_HOUSE', target: 'BIG_FOUR', type: 'disintermediation',
      label: 'In-house orchestration vs integrated solutions',
      description: 'In-house gen-AI use doubled from 23% to 52% in a year; 85% have dedicated AI governance committees. GCs increasingly build their own orchestration capability rather than outsourcing the integrated bundle.'
    },

    // ── v5 additions: adaptive incumbents + capital-as-provider + Manifest ─
    {
      source: 'ANTHROPIC', target: 'ADAPTIVE', type: 'distribution',
      label: 'Freshfields goes firm-wide on Claude',
      description: 'The adaptive-incumbent move via partnership: Freshfields deployed Claude firm-wide (5,700 users across 33 offices). Kirkland takes the other route — building and owning its own AI rather than running on a vendor’s.'
    },
    {
      source: 'CARTA', target: 'AM_LAW', type: 'cannibalisation',
      label: 'Capital becomes the provider, moves up the value chain',
      description: 'Carta acquired Avantia (which already served PE clients) and launched Carta Law. Because it owns the client workflow, it has an obvious path up from routine work into the bet-the-company advice that has always been the incumbents’ fortress. Henry Ward: "The largest PE firms… are paying top-tier law firms for high-volume, ultimately routine legal work, and they shouldn’t have to."'
    },
    {
      source: 'MANIFEST', target: 'AM_LAW', type: 'cannibalisation',
      label: 'AI-native firm sells the work, not the tool',
      description: 'Manifest OS builds and runs its own AI-native firms rather than selling software to incumbents. Dan Mishin: "We made the hard choice to not sell our AI software to existing law firms who are often beholden to billing customers more hours as a means to better compensation." Same cost-curve compression on the incumbents as Crosby.'
    },

    // ── 2026-05-31 connectivity pass: connect orphan/thin nodes (all evidenced) ─
    // Tool vendors run ON the platform owner AND are reframed as plugins by it —
    // the same double-edged status already marked for Harvey, now for Legora and the legal-tech incumbents.
    {
      source: 'ANTHROPIC', target: 'LEGORA', type: 'distribution',
      label: 'Legora is built on Claude',
      description: 'Legora is built on Anthropic Claude (it is a launch integration on Claude for Legal), making the platform owner its supplier — the same dependency Harvey carries.'
    },
    {
      source: 'ANTHROPIC', target: 'LEGORA', type: 'cannibalisation',
      label: 'Claude for Legal compresses the vertical layer',
      description: 'Legora runs on Claude yet competes with the platform owner’s own legal offering — the same platform-layer exposure (the February SaaSpocalypse) that reframed the vertical vendors as plugins. Anthropic "has demonstrated willingness to launch competing legal products."'
    },
    {
      source: 'LEGORA', target: 'BIG_FOUR', type: 'distribution',
      label: 'Legora distributes through Deloitte',
      description: 'Legora’s September 2025 Deloitte partnership routes it into corporate legal via a Big Four channel — the mirror image of Harvey’s Am Law distribution. Deloitte’s consulting relationships give Legora the in-house market without direct sales.'
    },
    {
      source: 'OPENAI', target: 'STRATEGY', type: 'distribution',
      label: 'Frontier Alliances: consultancies as OpenAI channel',
      description: 'OpenAI’s February 2026 Frontier Alliances named McKinsey, BCG, Accenture and Capgemini as multi-year distribution partners for its frontier-agent platform — the arrangement that, by May, flipped to equity in the OpenAI Deployment Company.'
    },
    {
      source: 'ANTHROPIC', target: 'CROSBY', type: 'distribution',
      label: 'Crosby is a launch customer of Claude for Legal',
      description: 'Crosby Legal was a launch customer of Claude for Legal — an AI-native firm built on top of the platform owner, not against it. The clearest case of the AI-native layer running on the substrate.'
    },
    {
      source: 'ANTHROPIC', target: 'LEGAL_TECH', type: 'distribution',
      label: 'CoCounsel/LexisNexis become connectors into Claude',
      description: 'Thomson Reuters/CoCounsel and LexisNexis appear on the Claude for Legal connector list as integrations into Claude — the legacy vendors became distribution partners on the platform that cannibalised their category (the double-edged status).'
    },
    {
      source: 'ANTHROPIC_JV', target: 'IN_HOUSE', type: 'distribution',
      label: 'Deployment JV sells forward-deployed engineers to GCs',
      description: 'The Anthropic Services JV is built to reach enterprises that historically could not afford Big Three consulting fees. Goldman’s Marc Nachmann calls it "democratising access" to forward-deployed engineers — a parallel supply channel straight to the demand side.'
    },
    {
      source: 'ODC', target: 'IN_HOUSE', type: 'distribution',
      label: 'Deployment company sells deployment to enterprise',
      description: 'The OpenAI Deployment Company sells deployment to enterprise buyers — the same foundation-model-backed channel that gives in-house teams an alternative to the Big Three consulting houses.'
    },
    {
      source: 'HARVEY', target: 'AM_LAW', type: 'distribution',
      label: 'Harvey sells into Am Law incumbents',
      description: 'Harvey sells into the Am Law incumbents — the tool-vendor relationship that "enhances the lawyer and preserves the firm". The supplier leg of Harvey’s three simultaneous positions.'
    },
    {
      source: 'AM_LAW', target: 'CROSBY', type: 'capital',
      label: 'Cooley (an Am Law firm) invests in Crosby',
      description: 'Cooley, an Am Law firm, invested in Crosby’s Series A — an incumbent hedging into a potential AI-native replacement. The only visible Am Law hedge into the AI-native layer.'
    },
    {
      source: 'ADAPTIVE', target: 'HARVEY', type: 'disintermediation',
      label: 'Kirkland builds its own, routing around the vendors',
      description: 'Rather than license what everyone else licenses, Kirkland is building and owning its own AI infrastructure (~$500M, funded from firm revenue) — an adaptive incumbent routing around the tool-vendor layer entirely.'
    },
    {
      source: 'CROSBY', target: 'MIDSIZE', type: 'cannibalisation',
      label: 'AI-native cost curve undercuts the squeezed middle',
      description: 'AI-native cost curves (Crosby, Covenant) compete most directly with midsize firms on contract review, LP agreements and other routine-and-moderately-complex work — the categories midsize lives on.'
    },
    {
      source: 'MANIFEST', target: 'MIDSIZE', type: 'cannibalisation',
      label: 'Build-and-operate model erodes midsize work',
      description: 'Manifest’s build-and-operate AI-native firms run on the same logarithmic cost curve, competing for the routine and moderately complex work (immigration, tax) that the squeezed middle depends on.'
    },

    // ── 2026-06-05 platform-layer additions: three model providers contest the tier ─
    // Anthropic↔Microsoft is a double edge on purpose — Claude rides the MS-365 agent
    // (distribution) while Microsoft’s own Word agent competes with it (cannibalisation):
    // "substrate and application compete inside the same Word document". The mirror
    // cannibalisation edges from Microsoft and OpenAI into the vendor layer make the
    // "all three planted a flag" point structurally, alongside the existing Anthropic→Harvey one.
    {
      source: 'MICROSOFT', target: 'ANTHROPIC', type: 'distribution',
      label: 'Claude rides the Microsoft-365 agent',
      description: 'Claude for Legal reaches lawyers through a Microsoft-365 agent that carries context across Word, Outlook, Excel and PowerPoint — the substrate distributing through Microsoft’s application surface. The alliance side of the platform contest.'
    },
    {
      source: 'MICROSOFT', target: 'ANTHROPIC', type: 'cannibalisation',
      label: 'Microsoft’s Word agent competes with Claude',
      description: 'Microsoft ships its own Word Legal Agent even as Claude reaches lawyers through a Microsoft-365 agent — so the substrate and the application now compete inside the same Word document. The tension side of the same relationship.'
    },
    {
      source: 'MICROSOFT', target: 'HARVEY', type: 'cannibalisation',
      label: 'Word Legal Agent compresses the vertical layer',
      description: 'Microsoft’s purpose-built clause-review and tracked-change redline agent competes head-on with the vertical contract-AI vendors — built on the engineers it absorbed from the collapsed Robin AI, the same vendor layer it now compresses.'
    },
    {
      source: 'OPENAI', target: 'HARVEY', type: 'cannibalisation',
      label: 'OpenAI’s legal vertical compresses the tool vendors',
      description: 'OpenAI stood up a dedicated legal vertical (June 1, led by Ironclad’s Jason Boehmig) — the third model provider to move directly on legal, compressing the vertical tool-vendor layer the same way Anthropic’s Claude for Legal did.'
    }
  ];

  return {
    typeColors: typeColors,
    typeLabels: typeLabels,
    edgeTypes: edgeTypes,
    abbreviations: ABBR,
    swingActors: swingActors,
    actors: actors,
    edges: edges
  };
})();
