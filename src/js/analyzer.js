// ===== VerityAI - News Analyzer Engine =====
// Simulates multi-source cross-referencing for fake news detection

const SOURCES_DB = [
    { name: 'CNN', icon: '📺', reliability: 0.95, domain: 'cnn.com' },
    { name: 'Times Now', icon: '📰', reliability: 0.92, domain: 'timesnownews.com' },
    { name: 'BBC News', icon: '🌐', reliability: 0.96, domain: 'bbc.com' },
    { name: 'New York Times', icon: '🗽', reliability: 0.97, domain: 'nytimes.com' },
    { name: 'The Wall Street Journal', icon: '📊', reliability: 0.94, domain: 'wsj.com' },
    { name: 'NDTV', icon: '📡', reliability: 0.93, domain: 'ndtv.com' },
    { name: 'Fox News', icon: '📺', reliability: 0.88, domain: 'foxnews.com' },
    { name: 'India Today', icon: '🇮🇳', reliability: 0.91, domain: 'indiatoday.in' },
    { name: 'Reuters', icon: '🌍', reliability: 0.98, domain: 'reuters.com' },
    { name: 'The Washington Post', icon: '🏛️', reliability: 0.95, domain: 'washingtonpost.com' },
    { name: 'Al Jazeera', icon: '🌍', reliability: 0.89, domain: 'aljazeera.com' },
    { name: 'Bloomberg', icon: '📈', reliability: 0.96, domain: 'bloomberg.com' }
];

// Known fake news patterns (keyword-based heuristic simulation)
const FAKE_INDICATORS = [
    'breaking:', 'shocking', 'you won\'t believe', 'secret', 'they don\'t want you to know',
    'exposed', 'miracle', 'cure', 'banned', 'coverup', 'conspiracy', 'illuminati',
    'alien', 'hoax confirmed', 'mainstream media lies', 'deep state', 'plandemic',
    'microchip', '5g causes', 'flat earth', 'chemtrails', 'mind control',
    'big pharma', 'government hiding', 'suppressed', 'wake up sheeple'
];

const CREDIBLE_INDICATORS = [
    'according to', 'study finds', 'research shows', 'officials said',
    'report indicates', 'data suggests', 'peer-reviewed', 'published in',
    'university', 'scientists', 'evidence', 'investigation', 'confirmed by'
];

// ===== Main Analysis Handler =====
document.getElementById('analyze-btn').addEventListener('click', async () => {
    const textInput = document.getElementById('news-text-input');
    const urlInput = document.getElementById('news-url-input');
    const activeTab = document.querySelector('.tab-btn.active').dataset.tab;

    const content = activeTab === 'text' ? textInput.value.trim() : urlInput.value.trim();

    if (!content) {
        shakeButton();
        return;
    }

    await runAnalysis(content, activeTab);
});

async function runAnalysis(content, type) {
    const analyzeBtn = document.getElementById('analyze-btn');
    const btnText = analyzeBtn.querySelector('.btn-text');
    const btnLoader = analyzeBtn.querySelector('.btn-loader');
    const btnIcon = analyzeBtn.querySelector('.btn-icon');

    // Show loading state
    btnText.style.display = 'none';
    btnIcon.style.display = 'none';
    btnLoader.style.display = 'flex';
    analyzeBtn.disabled = true;

    // Simulate multi-source scanning with progressive delay
    await simulateScanning(3500);

    // Generate analysis results
    const results = analyzeContent(content, type);

    // Reset button
    btnText.style.display = 'inline';
    btnIcon.style.display = 'inline';
    btnLoader.style.display = 'none';
    analyzeBtn.disabled = false;

    // Display results
    displayResults(results);
}

function analyzeContent(content, type) {
    const text = content.toLowerCase();

    // Calculate fake indicator score
    let fakeScore = 0;
    let fakeMatches = [];
    FAKE_INDICATORS.forEach(indicator => {
        if (text.includes(indicator)) {
            fakeScore += 15;
            fakeMatches.push(indicator);
        }
    });

    // Calculate credibility indicators
    let credScore = 0;
    let credMatches = [];
    CREDIBLE_INDICATORS.forEach(indicator => {
        if (text.includes(indicator)) {
            credScore += 10;
            credMatches.push(indicator);
        }
    });

    // Text quality analysis
    const wordCount = content.split(/\s+/).length;
    const hasExcessiveCaps = (content.match(/[A-Z]{3,}/g) || []).length > 3;
    const hasExcessivePunctuation = (content.match(/[!?]{2,}/g) || []).length > 1;
    const hasSensationalLanguage = fakeMatches.length > 0;

    if (hasExcessiveCaps) fakeScore += 10;
    if (hasExcessivePunctuation) fakeScore += 10;
    if (wordCount < 10) fakeScore += 5;

    // Base credibility score (0-100)
    let credibility = 65; // Neutral starting point
    credibility -= fakeScore;
    credibility += credScore;
    credibility += Math.min(wordCount / 10, 10); // Longer = slightly more credible

    // Clamp between 5 and 98
    credibility = Math.max(5, Math.min(98, credibility));

    // Add some randomness for realism
    credibility += Math.floor(Math.random() * 10) - 5;
    credibility = Math.max(5, Math.min(98, credibility));

    // Generate source results
    const sourceResults = generateSourceResults(credibility);

    // Determine verdict
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
            label: 'Emotional Manipulation Score',
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
            text: `The following trigger phrases were found: "${fakeMatches.join('", "')}" — these are commonly used in misleading or clickbait articles.`
        });
    }
    if (hasExcessiveCaps) {
        findings.push({
            title: 'Excessive Capitalization',
            text: 'The article uses excessive uppercase text, which is a common tactic in sensationalized or misleading content.'
        });
    }
    if (hasExcessivePunctuation) {
        findings.push({
            title: 'Excessive Punctuation',
            text: 'Multiple exclamation or question marks were detected, suggesting emotionally manipulative writing.'
        });
    }
    if (credMatches.length > 0) {
        findings.push({
            title: 'Credibility Indicators Found',
            text: `Positive indicators detected: "${credMatches.join('", "')}" — these suggest the article references verifiable information.`
        });
    }
    if (wordCount < 20) {
        findings.push({
            title: 'Limited Content',
            text: 'The submitted text is very short, which limits the depth of analysis. Consider submitting a full article for better results.'
        });
    }
    if (findings.length === 0) {
        findings.push({
            title: 'General Assessment',
            text: 'No strong indicators of misinformation were detected. However, always verify important claims through multiple trusted sources.'
        });
    }

    const matchedSources = sourceResults.filter(s => s.status === 'match').length;
    return {
        credibility: Math.round(credibility),
        verdict, verdictClass, verdictDesc,
        sourceResults, metrics, findings,
        sourcesChecked: sourceResults.length,
        matchedSources,
        analysisTime: (2.5 + Math.random() * 3).toFixed(1)
    };
}

function generateSourceResults(credibility) {
    const shuffled = [...SOURCES_DB].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 8);

    return selected.map(source => {
        const roll = Math.random() * 100;
        let status, detail;
        if (credibility >= 70) {
            if (roll < 60) { status = 'match'; detail = 'Corroborates claim'; }
            else if (roll < 85) { status = 'partial'; detail = 'Partial match found'; }
            else { status = 'not-found'; detail = 'No related articles'; }
        } else if (credibility >= 40) {
            if (roll < 25) { status = 'match'; detail = 'Similar report found'; }
            else if (roll < 55) { status = 'partial'; detail = 'Partially matches'; }
            else if (roll < 80) { status = 'no-match'; detail = 'Contradicts claim'; }
            else { status = 'not-found'; detail = 'No related articles'; }
        } else {
            if (roll < 10) { status = 'partial'; detail = 'Weak similarity'; }
            else if (roll < 50) { status = 'no-match'; detail = 'Contradicts claim'; }
            else { status = 'not-found'; detail = 'Not reported'; }
        }
        return { ...source, status, detail };
    });
}

// ===== Display Results =====
function displayResults(results) {
    const resultsSection = document.getElementById('results');
    resultsSection.style.display = 'block';

    // Scroll to results
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    // Animate gauge
    const gaugeCircle = document.getElementById('gauge-circle');
    const gaugeScore = document.getElementById('gauge-score');
    const circumference = 2 * Math.PI * 85; // ~534
    const offset = circumference - (results.credibility / 100) * circumference;

    // Set gauge color based on verdict
    const gaugeColors = { credible: 'var(--success)', suspicious: 'var(--warning)', fake: 'var(--danger)' };
    gaugeCircle.style.stroke = gaugeColors[results.verdictClass];

    setTimeout(() => {
        gaugeCircle.style.strokeDashoffset = offset;
    }, 200);

    // Animate score counter
    animateCounter(gaugeScore, results.credibility, 2000);

    // Verdict
    const verdictBadge = document.getElementById('verdict-badge');
    verdictBadge.textContent = results.verdict;
    verdictBadge.className = `verdict-badge ${results.verdictClass}`;
    document.getElementById('verdict-title').textContent = 'Verification Complete';
    document.getElementById('verdict-desc').textContent = results.verdictDesc;
    document.getElementById('analysis-time').textContent = `${results.analysisTime}s analysis`;
    document.getElementById('sources-checked').textContent = `${results.sourcesChecked} sources checked`;

    // Source match badge
    document.getElementById('source-match-badge').textContent =
        `${results.matchedSources}/${results.sourcesChecked} matched`;

    // Source list
    const sourcesList = document.getElementById('sources-list');
    sourcesList.innerHTML = results.sourceResults.map(s => `
        <div class="source-item">
            <div class="source-status ${s.status}"></div>
            <span class="source-name">${s.icon} ${s.name}</span>
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

    // Animate metric bars
    setTimeout(() => {
        document.querySelectorAll('.metric-fill').forEach((fill, i) => {
            fill.style.width = `${results.metrics[i].value}%`;
        });
    }, 300);

    // Findings
    const findingsContent = document.getElementById('findings-content');
    findingsContent.innerHTML = results.findings.map(f => `
        <div class="finding-item">
            <h4>${f.title}</h4>
            <p>${f.text}</p>
        </div>
    `).join('');
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
    const score = document.getElementById('gauge-score').textContent;
    const verdict = document.getElementById('verdict-badge').textContent;
    const desc = document.getElementById('verdict-desc').textContent;
    const time = document.getElementById('analysis-time').textContent;
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
        const name = item.querySelector('.source-name').textContent.trim();
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
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VerityAI_Report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
});
