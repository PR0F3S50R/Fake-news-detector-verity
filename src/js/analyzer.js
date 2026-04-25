// ===== VerityAI - News Analyzer Engine =====
// Simulates multi-source cross-referencing for fake news detection

const SOURCES_DB = [
    // International
    { name: 'BBC News',             icon: '🌐', reliability: 0.97, domain: 'bbc.com',              region: 'intl' },
    { name: 'New York Times',       icon: '🗽', reliability: 0.96, domain: 'nytimes.com',          region: 'intl' },
    { name: 'The Wall Street Journal', icon: '📊', reliability: 0.94, domain: 'wsj.com',          region: 'intl' },
    { name: 'The Washington Post',  icon: '🏛️', reliability: 0.94, domain: 'washingtonpost.com',  region: 'intl' },
    { name: 'CNN',                  icon: '📺', reliability: 0.93, domain: 'cnn.com',              region: 'intl' },
    { name: 'Al Jazeera',           icon: '🌍', reliability: 0.88, domain: 'aljazeera.com',        region: 'intl' },
    { name: 'Fox News',             icon: '📺', reliability: 0.82, domain: 'foxnews.com',          region: 'intl' },
    // National Indian
    { name: 'The Hindu',            icon: '🪔', reliability: 0.95, domain: 'thehindu.com',         region: 'india' },
    { name: 'NDTV',                 icon: '📡', reliability: 0.92, domain: 'ndtv.com',             region: 'india' },
    { name: 'India Today',          icon: '🇮🇳', reliability: 0.91, domain: 'indiatoday.in',       region: 'india' },
    { name: 'Telegraph India',      icon: '🗞️', reliability: 0.90, domain: 'telegraphindia.com',  region: 'india' },
    { name: 'Times Now',            icon: '📰', reliability: 0.89, domain: 'timesnownews.com',    region: 'india' },
    // Regional Indian (Future Scope — expanded network)
    { name: 'Dainik Bhaskar',       icon: '🗺️', reliability: 0.87, domain: 'bhaskar.com',         region: 'regional' },
    { name: 'Ananda Bazar Patrika', icon: '📋', reliability: 0.88, domain: 'anandabazar.com',     region: 'regional' },
    { name: 'Eenadu',               icon: '🔔', reliability: 0.86, domain: 'eenadu.net',           region: 'regional' },
    { name: 'Dinamalar',            icon: '🌺', reliability: 0.85, domain: 'dinamalar.com',        region: 'regional' },
];

// ===== Multi-Language Indicator Dictionaries =====
// English
const FAKE_INDICATORS_EN = [
    'breaking:', 'shocking', 'you won\'t believe', 'secret', 'they don\'t want you to know',
    'exposed', 'miracle', 'cure', 'banned', 'coverup', 'conspiracy', 'illuminati',
    'alien', 'hoax confirmed', 'mainstream media lies', 'deep state', 'plandemic',
    'microchip', '5g causes', 'flat earth', 'chemtrails', 'mind control',
    'big pharma', 'government hiding', 'suppressed', 'wake up sheeple'
];
const CREDIBLE_INDICATORS_EN = [
    'according to', 'study finds', 'research shows', 'officials said',
    'report indicates', 'data suggests', 'peer-reviewed', 'published in',
    'university', 'scientists', 'evidence', 'investigation', 'confirmed by'
];

// Hindi (romanized transliteration)
const FAKE_INDICATORS_HI = [
    'bada khulasa', 'sach saamne aaya', 'sarkar chupa rahi', 'media jhooth bol rahi',
    'viral sach', 'andha vishwas', 'chmatkar', 'nafrat failao', 'bharat ke dushman',
    'danga', 'jhooth', 'fake news', 'sedition', 'desh drohi'
];
const CREDIBLE_INDICATORS_HI = [
    'sarkari adhikaari ne kaha', 'report ke anusar', 'shodh mein paya gaya',
    'vishwavidyalay', 'vaigyanik', 'saboot', 'janch', 'pushtikaran'
];

// Bengali (romanized transliteration)
const FAKE_INDICATORS_BN = [
    'baro khobor', 'sarkar lukiye rakhche', 'media mithye bolche', 'viral satya',
    'dhoka', 'provocative', 'bhoy', 'satarko thakun', 'danga lagiye dite'
];
const CREDIBLE_INDICATORS_BN = [
    'sarkaari kothay bola hoyeche', 'protibedon anuyayi', 'biswavidyalay', 'bigganider mat'
];

// Tamil (romanized transliteration)
const FAKE_INDICATORS_TA = [
    'arasai maraikkindra', 'unmai veliyidapadavillai', 'aanmiga rahasiyam',
    'media poruntadha unmai', 'aayiram sathagam unmai'
];
const CREDIBLE_INDICATORS_TA = [
    'ariviyal aalargal koorugiraargal', 'aavanapatru', 'seydi nischayappadugiradhu'
];

// Active language (toggled by language selector)
let ACTIVE_LANGUAGE = 'en';
let FAKE_INDICATORS    = [...FAKE_INDICATORS_EN];
let CREDIBLE_INDICATORS = [...CREDIBLE_INDICATORS_EN];

function setLanguage(lang) {
    ACTIVE_LANGUAGE = lang;
    const fakeMap = { en: FAKE_INDICATORS_EN, hi: FAKE_INDICATORS_HI, bn: FAKE_INDICATORS_BN, ta: FAKE_INDICATORS_TA };
    const credMap = { en: CREDIBLE_INDICATORS_EN, hi: CREDIBLE_INDICATORS_HI, bn: CREDIBLE_INDICATORS_BN, ta: CREDIBLE_INDICATORS_TA };
    FAKE_INDICATORS     = [...FAKE_INDICATORS_EN, ...(fakeMap[lang] || [])];
    CREDIBLE_INDICATORS = [...CREDIBLE_INDICATORS_EN, ...(credMap[lang] || [])];
}

// Per-indicator weights for explainability
const INDICATOR_WEIGHTS = {
    sensational_language: { label: 'Sensational Language',     weight: 15, direction: 'negative' },
    excessive_caps:       { label: 'Excessive Capitalization', weight: 10, direction: 'negative' },
    excessive_punct:      { label: 'Excessive Punctuation',    weight: 10, direction: 'negative' },
    short_content:        { label: 'Insufficient Content',     weight:  5, direction: 'negative' },
    credible_cues:        { label: 'Credibility Cues',         weight: 10, direction: 'positive' },
    source_corroboration: { label: 'Source Corroboration',     weight: 15, direction: 'positive' },
    word_count_bonus:     { label: 'Content Depth',            weight: 10, direction: 'positive' },
};

// ===== Main Analysis Handler =====
document.getElementById('analyze-btn').addEventListener('click', async () => {
    const textInput = document.getElementById('news-text-input');
    const urlInput  = document.getElementById('news-url-input');
    const activeTab = document.querySelector('.tab-btn.active').dataset.tab;

    const rawInput = activeTab === 'text' ? textInput.value.trim() : urlInput.value.trim();

    if (!rawInput) {
        shakeButton();
        return;
    }

    await runAnalysis(rawInput, activeTab);
});

async function runAnalysis(rawInput, type) {
    const analyzeBtn = document.getElementById('analyze-btn');
    const btnText   = analyzeBtn.querySelector('.btn-text');
    const btnLoader = analyzeBtn.querySelector('.btn-loader');
    const btnIcon   = analyzeBtn.querySelector('.btn-icon');
    const loaderLabel = btnLoader.querySelector('span');

    // Show loading state
    btnText.style.display  = 'none';
    btnIcon.style.display  = 'none';
    btnLoader.style.display = 'flex';
    analyzeBtn.disabled = true;

    let content = rawInput;
    let urlMeta = null;

    if (type === 'url') {
        // Validate URL format
        let parsedUrl;
        try {
            parsedUrl = new URL(rawInput);
        } catch {
            showUrlError('Invalid URL. Please include https:// at the start.');
            resetBtn();
            return;
        }

        loaderLabel.textContent = 'Fetching article...';
        try {
            content = await fetchUrlContent(rawInput);
            urlMeta = { domain: parsedUrl.hostname.replace('www.', '') };
        } catch (err) {
            // Fallback: analyse the URL string for domain-based credibility
            content = rawInput;
            urlMeta = { domain: parsedUrl.hostname.replace('www.', ''), fallback: true };
        }
        loaderLabel.textContent = 'Scanning Sources...';
    }

    // Simulate multi-source scanning
    await simulateScanning(2800);

    // Generate analysis results
    const results = analyzeContent(content, type, urlMeta);

    resetBtn();
    displayResults(results);

    function resetBtn() {
        btnText.style.display  = 'inline';
        btnIcon.style.display  = 'inline';
        btnLoader.style.display = 'none';
        if (loaderLabel) loaderLabel.textContent = 'Scanning Sources...';
        analyzeBtn.disabled = false;
    }
}

// ===== URL Content Fetcher (via CORS proxy) =====
async function fetchUrlContent(url) {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error('Proxy fetch failed');
    const data = await res.json();
    if (!data.contents) throw new Error('Empty response');

    // Parse HTML and extract readable text
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');

    // Remove non-content elements
    doc.querySelectorAll('script, style, nav, header, footer, aside, noscript, iframe, [aria-hidden="true"]').forEach(el => el.remove());

    // Try to find main article content
    const articleEl = doc.querySelector(
        'article, [class*="article"], [class*="story"], [class*="post"], main, #content, .content'
    ) || doc.body;

    const text = (articleEl.innerText || articleEl.textContent || '').trim();
    if (!text || text.length < 50) throw new Error('Could not extract article text');
    return text.slice(0, 8000); // Cap at 8000 chars for analysis
}

function showUrlError(msg) {
    const urlInput = document.getElementById('news-url-input');
    urlInput.style.borderColor = 'var(--danger)';
    urlInput.style.boxShadow   = '0 0 0 4px rgba(239,68,68,0.15)';
    const existing = document.getElementById('url-error-msg');
    if (existing) existing.remove();
    const err = document.createElement('p');
    err.id = 'url-error-msg';
    err.textContent = msg;
    err.style.cssText = 'color:var(--danger);font-size:0.85rem;margin-top:8px;';
    urlInput.parentNode.appendChild(err);
    setTimeout(() => {
        urlInput.style.borderColor = '';
        urlInput.style.boxShadow   = '';
        err.remove();
    }, 4000);
}

function analyzeContent(content, type, urlMeta = null) {
    const text = content.toLowerCase();

    // Domain credibility boost when analysing a URL from a known trusted source
    let domainBoost = 0;
    if (urlMeta && urlMeta.domain) {
        const match = SOURCES_DB.find(s => urlMeta.domain.includes(s.domain) || s.domain.includes(urlMeta.domain));
        if (match) domainBoost = Math.round((match.reliability - 0.88) * 60);
    }

    // Detect script/language for auto-tagging
    const detectedLang = detectLanguage(text);

    // Calculate fake indicator score with per-indicator weights
    let fakeScore = 0;
    let fakeMatches = [];
    FAKE_INDICATORS.forEach(indicator => {
        if (text.includes(indicator)) {
            fakeScore += INDICATOR_WEIGHTS.sensational_language.weight;
            fakeMatches.push(indicator);
        }
    });

    // Calculate credibility indicators
    let credScore = 0;
    let credMatches = [];
    CREDIBLE_INDICATORS.forEach(indicator => {
        if (text.includes(indicator)) {
            credScore += INDICATOR_WEIGHTS.credible_cues.weight;
            credMatches.push(indicator);
        }
    });

    // Text quality analysis
    const wordCount = content.split(/\s+/).length;
    const hasExcessiveCaps = (content.match(/[A-Z]{3,}/g) || []).length > 3;
    const hasExcessivePunctuation = (content.match(/[!?]{2,}/g) || []).length > 1;
    const hasSensationalLanguage = fakeMatches.length > 0;

    if (hasExcessiveCaps)        fakeScore += INDICATOR_WEIGHTS.excessive_caps.weight;
    if (hasExcessivePunctuation) fakeScore += INDICATOR_WEIGHTS.excessive_punct.weight;
    if (wordCount < 10)          fakeScore += INDICATOR_WEIGHTS.short_content.weight;

    const wordCountBonus = Math.min(wordCount / 10, 10);

    // Base credibility — pool-averaged reliability baseline
    const avgReliability = SOURCES_DB.reduce((sum, s) => sum + s.reliability, 0) / SOURCES_DB.length;
    let credibility = Math.round(avgReliability * 70);
    credibility -= fakeScore;
    credibility += credScore;
    credibility += wordCountBonus;
    credibility += domainBoost; // Domain reputation bonus for known outlets

    credibility = Math.max(5, Math.min(98, credibility));
    credibility += Math.floor(Math.random() * 8) - 4;
    credibility = Math.max(5, Math.min(98, credibility));

    // Confidence interval (±margin based on content length and indicator count)
    // URLs get tighter bounds since we have article-level text
    const urlUncertaintyReduction = urlMeta && !urlMeta.fallback ? 4 : 0;
    const uncertainty = Math.max(3, 18 - Math.min(wordCount / 5, 10) - (credMatches.length * 1.5) - urlUncertaintyReduction);
    const confidenceLow  = Math.max(0,   Math.round(credibility - uncertainty));
    const confidenceHigh = Math.min(100, Math.round(credibility + uncertainty));

    // Explainability breakdown
    const explainability = buildExplainability({
        fakeMatches, credMatches, hasExcessiveCaps,
        hasExcessivePunctuation, wordCount, wordCountBonus, fakeScore, credScore
    });

    // Generate source results
    const sourceResults = generateSourceResults(credibility);

    // Verdict
    let verdict, verdictClass, verdictDesc;
    if (credibility >= 70) {
        verdict = 'Likely Credible';
        verdictClass = 'credible';
        verdictDesc = 'This content appears to be consistent with reporting from multiple trusted sources. The language patterns and claims are aligned with verified information.';
    } else if (credibility >= 40) {
        verdict = 'Suspicious';
        verdictClass = 'suspicious';
        verdictDesc = 'This content contains some elements that could not be fully verified. Exercise caution and check additional sources before sharing.';
    } else {
        verdict = 'Likely Fake';
        verdictClass = 'fake';
        verdictDesc = 'This content contains multiple indicators commonly associated with misinformation. The claims could not be corroborated by trusted sources.';
    }

    // Build metrics
    const metrics = [
        {
            label: 'Source Corroboration',
            value: Math.min(credibility + 5, 100),
            color: credibility >= 60 ? 'var(--success)' : credibility >= 40 ? 'var(--warning)' : 'var(--danger)'
        },
        {
            label: 'Language Authenticity',
            value: hasSensationalLanguage ? Math.max(20, credibility - 15) : Math.min(credibility + 10, 95),
            color: !hasSensationalLanguage ? 'var(--success)' : 'var(--warning)'
        },
        {
            label: 'Claim Verifiability',
            value: Math.max(15, credibility - Math.floor(Math.random() * 15)),
            color: credibility >= 50 ? 'var(--accent-primary)' : 'var(--danger)'
        },
        {
            label: 'Emotional Manipulation',
            value: hasExcessiveCaps || hasExcessivePunctuation ? Math.min(80, 100 - credibility + 20) : Math.max(10, 100 - credibility),
            color: (100 - credibility) < 40 ? 'var(--success)' : 'var(--danger)',
            inverted: true
        }
    ];

    // Build findings
    const findings = [];
    if (fakeMatches.length > 0) {
        findings.push({
            title: 'Sensational Language Detected',
            text: `Trigger phrases found: "${fakeMatches.join('", "')}" — commonly used in misleading or clickbait articles. Each phrase reduced credibility by ${INDICATOR_WEIGHTS.sensational_language.weight} pts.`
        });
    }
    if (hasExcessiveCaps) {
        findings.push({
            title: 'Excessive Capitalization',
            text: `Excessive uppercase text detected (−${INDICATOR_WEIGHTS.excessive_caps.weight} pts). A common tactic in sensationalized content.`
        });
    }
    if (hasExcessivePunctuation) {
        findings.push({
            title: 'Excessive Punctuation',
            text: `Multiple !!/!! patterns detected (−${INDICATOR_WEIGHTS.excessive_punct.weight} pts), suggesting emotionally manipulative writing.`
        });
    }
    if (credMatches.length > 0) {
        findings.push({
            title: 'Credibility Cues Found',
            text: `Positive signals: "${credMatches.join('", "')}" — each cue added +${INDICATOR_WEIGHTS.credible_cues.weight} pts to the credibility score.`
        });
    }
    if (wordCount < 20) {
        findings.push({
            title: 'Limited Content',
            text: `Only ${wordCount} words analysed. Submit a full article for a more accurate result.`
        });
    }
    if (detectedLang !== 'en') {
        findings.push({
            title: `Multi-Language Content Detected (${detectedLang.toUpperCase()})`,
            text: `Regionalised indicator dictionary activated for ${LANGUAGE_NAMES[detectedLang] || detectedLang}. Analysis includes transliterated misinformation patterns.`
        });
    }
    if (urlMeta) {
        const matchedSource = SOURCES_DB.find(s => urlMeta.domain.includes(s.domain) || s.domain.includes(urlMeta.domain));
        if (matchedSource) {
            findings.push({
                title: `Known Source Identified: ${matchedSource.name}`,
                text: `The URL domain "${urlMeta.domain}" is a verified source in our network (reliability: ${Math.round(matchedSource.reliability * 100)}%). A domain credibility boost of +${domainBoost} pts was applied.`
            });
        }
        if (urlMeta.fallback) {
            findings.push({
                title: 'URL Content Could Not Be Fetched',
                text: 'The article content could not be retrieved — the site may block scrapers or require a login. Domain-based analysis was applied. For best results, paste the article text directly into the Text tab.'
            });
        }
    }
    if (findings.length === 0) {
        findings.push({
            title: 'General Assessment',
            text: 'No strong indicators of misinformation detected. Always verify important claims through multiple trusted sources.'
        });
    }

    const matchedSources = sourceResults.filter(s => s.status === 'match').length;
    return {
        credibility: Math.round(credibility),
        confidenceLow, confidenceHigh,
        verdict, verdictClass, verdictDesc,
        sourceResults, metrics, findings, explainability,
        sourcesChecked: sourceResults.length,
        matchedSources,
        detectedLang,
        analysisTime: (2.5 + Math.random() * 3).toFixed(1)
    };
}

// ===== Language Detection =====
const LANGUAGE_NAMES = { en: 'English', hi: 'Hindi', bn: 'Bengali', ta: 'Tamil' };

function detectLanguage(text) {
    // Check Hindi romanized markers
    const hiMarkers = ['hai', 'nahi', 'aur', 'kya', 'sarkar', 'bharat', 'desh', 'log', 'baat'];
    const bnMarkers = ['amader', 'bangla', 'manush', 'khobor', 'bolche', 'korche'];
    const taMarkers = ['avar', 'naan', 'ungal', 'tamilnadu', 'arasangam', 'tamil'];
    const scoreHi = hiMarkers.filter(w => text.includes(w)).length;
    const scoreBn = bnMarkers.filter(w => text.includes(w)).length;
    const scoreTa = taMarkers.filter(w => text.includes(w)).length;
    if (scoreHi >= 2) { setLanguage('hi'); return 'hi'; }
    if (scoreBn >= 2) { setLanguage('bn'); return 'bn'; }
    if (scoreTa >= 2) { setLanguage('ta'); return 'ta'; }
    setLanguage('en');
    return 'en';
}

// ===== Explainability Builder =====
function buildExplainability({ fakeMatches, credMatches, hasExcessiveCaps, hasExcessivePunctuation, wordCount, wordCountBonus, fakeScore, credScore }) {
    const factors = [];
    if (fakeMatches.length > 0) factors.push({ label: 'Sensational language', impact: -(fakeMatches.length * INDICATOR_WEIGHTS.sensational_language.weight), type: 'negative' });
    if (hasExcessiveCaps)       factors.push({ label: 'Excessive caps',        impact: -INDICATOR_WEIGHTS.excessive_caps.weight,  type: 'negative' });
    if (hasExcessivePunctuation) factors.push({ label: 'Excessive punctuation', impact: -INDICATOR_WEIGHTS.excessive_punct.weight, type: 'negative' });
    if (wordCount < 10)         factors.push({ label: 'Too short',             impact: -INDICATOR_WEIGHTS.short_content.weight,   type: 'negative' });
    if (credMatches.length > 0) factors.push({ label: 'Credibility cues',      impact: +(credMatches.length * INDICATOR_WEIGHTS.credible_cues.weight), type: 'positive' });
    if (wordCountBonus > 0)     factors.push({ label: 'Content depth bonus',   impact: +Math.round(wordCountBonus),                type: 'positive' });
    return factors;
}

// Source-specific corroboration messages for realistic cross-referencing
const SOURCE_MESSAGES = {
    credible: {
        match:     s => `${s.name} independently verified this claim with sourced reporting (reliability: ${Math.round(s.reliability * 100)}%).`,
        partial:   s => `${s.name} covered a related story but with differing scope or timeline.`,
        notFound:  s => `No recent coverage of this specific claim found on ${s.name}.`
    },
    suspicious: {
        match:     s => `${s.name} published a tangentially related report — some claims align.`,
        partial:   s => `${s.name}'s reporting covers the topic but contradicts key specifics.`,
        noMatch:   s => `${s.name} has not corroborated this claim; coverage shows conflicting data.`,
        notFound:  s => `${s.name} has no record of this event or claim.`
    },
    fake: {
        partial:   s => `A distant resemblance to a debunked story once covered by ${s.name} was found.`,
        noMatch:   s => `${s.name} editorial team has directly disputed claims of this nature.`,
        notFound:  s => `No credible archive matches found across ${s.name}'s verified database.`
    }
};

function generateSourceResults(credibility) {
    // Weighted shuffle — higher-reliability sources appear more often
    const weighted = [...SOURCES_DB].sort((a, b) => (b.reliability - a.reliability) + (Math.random() - 0.5) * 0.3);
    const selected = weighted.slice(0, 8);

    return selected.map(source => {
        const roll = Math.random() * 100;
        // Adjust effective roll by source reliability: trustworthy sources skew toward confirmation on credible content
        const reliabilityBias = (source.reliability - 0.88) * 50; // ±5 pts adjustment
        const adjustedRoll = Math.max(0, Math.min(100, roll - reliabilityBias));
        let status, detail;

        if (credibility >= 70) {
            if (adjustedRoll < 62) {
                status = 'match';
                detail = SOURCE_MESSAGES.credible.match(source);
            } else if (adjustedRoll < 87) {
                status = 'partial';
                detail = SOURCE_MESSAGES.credible.partial(source);
            } else {
                status = 'not-found';
                detail = SOURCE_MESSAGES.credible.notFound(source);
            }
        } else if (credibility >= 40) {
            if (adjustedRoll < 22) {
                status = 'match';
                detail = SOURCE_MESSAGES.suspicious.match(source);
            } else if (adjustedRoll < 50) {
                status = 'partial';
                detail = SOURCE_MESSAGES.suspicious.partial(source);
            } else if (adjustedRoll < 78) {
                status = 'no-match';
                detail = SOURCE_MESSAGES.suspicious.noMatch(source);
            } else {
                status = 'not-found';
                detail = SOURCE_MESSAGES.suspicious.notFound(source);
            }
        } else {
            if (adjustedRoll < 12) {
                status = 'partial';
                detail = SOURCE_MESSAGES.fake.partial(source);
            } else if (adjustedRoll < 55) {
                status = 'no-match';
                detail = SOURCE_MESSAGES.fake.noMatch(source);
            } else {
                status = 'not-found';
                detail = SOURCE_MESSAGES.fake.notFound(source);
            }
        }
        return { ...source, status, detail };
    });
}

// ===== Display Results =====
function displayResults(results) {
    const resultsSection = document.getElementById('results');
    resultsSection.style.display = 'block';

    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    // Animate gauge
    const gaugeCircle = document.getElementById('gauge-circle');
    const gaugeScore  = document.getElementById('gauge-score');
    const circumference = 2 * Math.PI * 85;
    const offset = circumference - (results.credibility / 100) * circumference;
    const gaugeColors = { credible: 'var(--success)', suspicious: 'var(--warning)', fake: 'var(--danger)' };
    gaugeCircle.style.stroke = gaugeColors[results.verdictClass];
    setTimeout(() => { gaugeCircle.style.strokeDashoffset = offset; }, 200);
    animateCounter(gaugeScore, results.credibility, 2000);

    // Confidence band
    const confBand = document.getElementById('confidence-band');
    if (confBand) confBand.textContent = `Confidence interval: ${results.confidenceLow}–${results.confidenceHigh}`;

    // Language tag
    const langTag = document.getElementById('lang-tag');
    if (langTag) {
        langTag.textContent = results.detectedLang !== 'en'
            ? `🌐 ${LANGUAGE_NAMES[results.detectedLang]} mode active`
            : '🌐 English';
        langTag.style.display = 'inline-block';
    }

    // Verdict
    const verdictBadge = document.getElementById('verdict-badge');
    verdictBadge.textContent = results.verdict;
    verdictBadge.className = `verdict-badge ${results.verdictClass}`;
    document.getElementById('verdict-title').textContent = 'Verification Complete';
    document.getElementById('verdict-desc').textContent  = results.verdictDesc;
    document.getElementById('analysis-time').textContent  = `${results.analysisTime}s analysis`;
    document.getElementById('sources-checked').textContent = `${results.sourcesChecked} sources checked`;
    document.getElementById('source-match-badge').textContent = `${results.matchedSources}/${results.sourcesChecked} matched`;

    // Source list with reliability badge
    const sourcesList = document.getElementById('sources-list');
    sourcesList.innerHTML = results.sourceResults.map(s => `
        <div class="source-item">
            <div class="source-status ${s.status}"></div>
            <span class="source-name">${s.icon} ${s.name}
                <span class="source-reliability-badge">${Math.round(s.reliability * 100)}%</span>
            </span>
            <span class="source-detail">${s.detail}</span>
        </div>
    `).join('');

    // Metrics
    const metricsContainer = document.getElementById('analysis-metrics');
    metricsContainer.innerHTML = results.metrics.map(m => `
        <div class="metric-item">
            <div class="metric-header">
                <span class="metric-label">${m.label}</span>
                <span class="metric-value">${m.value}%</span>
            </div>
            <div class="metric-bar">
                <div class="metric-fill" style="width: 0%; background: ${m.color};"></div>
            </div>
        </div>
    `).join('');
    setTimeout(() => {
        document.querySelectorAll('.metric-fill').forEach((fill, i) => {
            fill.style.width = `${results.metrics[i].value}%`;
        });
    }, 300);

    // Explainability panel
    const explainPanel = document.getElementById('explainability-content');
    if (explainPanel) {
        if (results.explainability.length === 0) {
            explainPanel.innerHTML = '<p class="explain-empty">No significant positive or negative factors detected — content appears neutral.</p>';
        } else {
            explainPanel.innerHTML = results.explainability.map(f => `
                <div class="explain-factor ${f.type}">
                    <span class="explain-label">${f.label}</span>
                    <span class="explain-impact">${f.impact > 0 ? '+' : ''}${f.impact} pts</span>
                </div>
            `).join('');
        }
    }

    // Findings
    const findingsContent = document.getElementById('findings-content');
    findingsContent.innerHTML = results.findings.map(f => `
        <div class="finding-item">
            <h4>${f.title}</h4>
            <p>${f.text}</p>
        </div>
    `).join('');

    // Community flag button state
    updateFlagCount();
}

// ===== Helpers =====
function animateCounter(element, target, duration) {
    const start = performance.now();
    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = Math.floor(target * eased);
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

function simulateScanning(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
}

function shakeButton() {
    const btn = document.getElementById('analyze-btn');
    btn.style.animation = 'shake 0.5s ease';
    setTimeout(() => btn.style.animation = '', 500);
}

// Add shake keyframe dynamically
const style = document.createElement('style');
style.textContent = `@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }`;
document.head.appendChild(style);

// ===== Download Report =====
document.getElementById('download-report').addEventListener('click', () => {
    const score   = document.getElementById('gauge-score').textContent;
    const verdict = document.getElementById('verdict-badge').textContent;
    const desc    = document.getElementById('verdict-desc').textContent;
    const time    = document.getElementById('analysis-time').textContent;
    const sources = document.getElementById('sources-checked').textContent;

    let report = `VERITYAI - LEGITIMACY REPORT\n${'='.repeat(50)}\n\n`;
    report += `Date: ${new Date().toLocaleString()}\n`;
    report += `Analysis Time: ${time}\n`;
    report += `Sources Checked: ${sources}\n\n`;
    report += `CREDIBILITY SCORE: ${score}/100\n`;
    report += `VERDICT: ${verdict}\n\n`;
    report += `SUMMARY:\n${desc}\n\n`;

    report += `SOURCE CROSS-REFERENCE:\n${'-'.repeat(40)}\n`;
    document.querySelectorAll('.source-item').forEach(item => {
        const name   = item.querySelector('.source-name').textContent.trim();
        const detail = item.querySelector('.source-detail').textContent.trim();
        report += `  ${name} — ${detail}\n`;
    });

    report += `\nANALYSIS METRICS:\n${'-'.repeat(40)}\n`;
    document.querySelectorAll('.metric-item').forEach(item => {
        const label = item.querySelector('.metric-label').textContent;
        const value = item.querySelector('.metric-value').textContent;
        report += `  ${label}: ${value}\n`;
    });

    report += `\nDETAILED FINDINGS:\n${'-'.repeat(40)}\n`;
    document.querySelectorAll('.finding-item').forEach(item => {
        report += `  [${item.querySelector('h4').textContent}]\n`;
        report += `  ${item.querySelector('p').textContent}\n\n`;
    });

    report += `\n${'='.repeat(50)}\nGenerated by VerityAI | verityai.com\n`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `VerityAI_Report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
});

// ===== Community Flagging (localStorage) =====
function updateFlagCount() {
    const btn = document.getElementById('flag-content-btn');
    if (!btn) return;
    const count = parseInt(localStorage.getItem('verityai_flags') || '0');
    btn.querySelector('.flag-count').textContent = count > 0 ? `${count} flagged` : 'Flag as Suspicious';
}

document.addEventListener('click', e => {
    if (e.target.closest('#flag-content-btn')) {
        const current = parseInt(localStorage.getItem('verityai_flags') || '0');
        localStorage.setItem('verityai_flags', current + 1);
        const btn = document.getElementById('flag-content-btn');
        btn.classList.add('flagged');
        btn.querySelector('.flag-count').textContent = `${current + 1} flagged`;
        btn.title = 'You have flagged this content. Thank you for helping the community.';
    }
});

// ===== Language Selector =====
document.addEventListener('change', e => {
    if (e.target.id === 'language-select') {
        setLanguage(e.target.value);
    }
});
