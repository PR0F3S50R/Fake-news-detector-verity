# Software Design Document (SDD)
## VerityAI — Fake News Detection System

**Version:** 1.0  
**Date:** April 2026  
**Prepared by:** VerityAI Development Team

---

## 1. Introduction

### 1.1 Purpose
This Software Design Document (SDD) describes the architecture, components, data flow, and design decisions for the VerityAI Fake News Detection System. It translates the requirements defined in the SRS into a technical blueprint for implementation.

### 1.2 Scope
This document covers the system architecture, frontend component design, analysis engine algorithms, deployment configuration (Docker, Jenkins, Git), and interface specifications.

---

## 2. System Architecture

### 2.1 Architecture Overview
VerityAI follows a **client-side single-page application (SPA)** architecture served via Nginx in a Docker container. The CI/CD pipeline is managed through Jenkins.

```
┌─────────────────────────────────────────────────────┐
│                   User's Browser                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ index.html│  │ style.css│  │ app.js + analyzer│   │
│  └──────────┘  └──────────┘  └──────────────────┘   │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP/HTTPS
┌───────────────────────▼─────────────────────────────┐
│              Docker Container (Nginx)                │
│  ┌──────────────────────────────────┐               │
│  │    Nginx Web Server (Port 80)    │               │
│  │    - Static file serving         │               │
│  │    - Gzip compression            │               │
│  │    - Cache headers               │               │
│  └──────────────────────────────────┘               │
└─────────────────────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│              Jenkins CI/CD Pipeline                  │
│  Checkout → Lint → Test → Build → Scan → Deploy     │
└─────────────────────────────────────────────────────┘
```

### 2.2 Design Principles
1. **Separation of Concerns** — UI logic (`app.js`) is separated from analysis logic (`analyzer.js`)
2. **Progressive Enhancement** — Core functionality works without JavaScript animations
3. **Responsive Design** — Mobile-first CSS with breakpoints at 768px
4. **Containerization** — Reproducible builds through Docker multi-stage builds

---

## 3. Component Design

### 3.1 Frontend Components

#### 3.1.1 Navigation Component
- **File**: `index.html` (nav section) + `app.js` (initNavbar)
- **Behavior**: Fixed top navigation with scroll effect (adds `.scrolled` class when `scrollY > 50`). Active link tracking based on scroll position. Mobile hamburger menu toggle.

#### 3.1.2 Hero Section
- **File**: `index.html` (hero section) + `app.js` (animateStats)
- **Behavior**: Full-viewport landing with animated background orbs (CSS `@keyframes orbFloat`). Statistics counter animation using `IntersectionObserver` with eased cubic progression.

#### 3.1.3 Analyzer Interface
- **File**: `index.html` (analyze section) + `app.js` (initTabs)
- **Behavior**: Tabbed interface switching between text input and URL input. Tab state managed via `.active` class toggling on both button and content elements.

#### 3.1.4 Results Dashboard
- **File**: `index.html` (results section) + `analyzer.js` (displayResults)
- **Sub-components**:
  - **Credibility Gauge**: SVG circle with `stroke-dashoffset` animation
  - **Verdict Card**: Dynamic badge, title, description, and meta information
  - **Source List**: Dynamically generated source items with status indicators
  - **Analysis Metrics**: Progress bars with animated fill widths
  - **Detailed Findings**: Collapsible finding cards with border-left indicators

### 3.2 Analysis Engine

#### 3.2.1 Module: `analyzer.js`

**Core Function: `analyzeContent(content, type)`**

```
Input: content (string), type ('text' | 'url')
Output: {
    credibility: number (0-100),
    verdict: string,
    verdictClass: string,
    verdictDesc: string,
    sourceResults: SourceResult[],
    metrics: Metric[],
    findings: Finding[],
    sourcesChecked: number,
    matchedSources: number,
    analysisTime: string
}
```

**Algorithm Flow:**
1. Convert input to lowercase for pattern matching
2. Scan for fake news indicator keywords → accumulate `fakeScore` (+15 per match)
3. Scan for credibility indicator keywords → accumulate `credScore` (+10 per match)
4. Analyze text quality:
   - Excessive capitalization (3+ consecutive uppercase words): +10 to fakeScore
   - Excessive punctuation (2+ consecutive !! or ??): +10 to fakeScore
   - Short content (<10 words): +5 to fakeScore
5. Calculate base credibility: `65 - fakeScore + credScore + min(wordCount/10, 10)`
6. Clamp to range [5, 98] with ±5 randomness
7. Generate source results based on credibility tier
8. Classify verdict:
   - ≥70: "Likely Credible"
   - 40-69: "Suspicious"
   - <40: "Likely Fake"
9. Build metrics and findings arrays

#### 3.2.2 Source Cross-Reference Generator

**Function: `generateSourceResults(credibility)`**

Selects 8 random sources from the 12-source database and assigns status based on credibility score:

| Credibility | Match % | Partial % | No-Match % | Not-Found % |
|------------|---------|-----------|------------|-------------|
| ≥ 70       | 60%     | 25%       | 0%         | 15%         |
| 40-69      | 25%     | 30%       | 25%        | 20%         |
| < 40       | 0%      | 10%       | 40%        | 50%         |

### 3.3 Data Structures

#### 3.3.1 Source Database Entry
```javascript
{
    name: string,        // e.g., "Reuters"
    icon: string,        // emoji icon
    reliability: number, // 0.0-1.0 reliability score
    domain: string       // website domain
}
```

#### 3.3.2 Analysis Metric
```javascript
{
    label: string,  // e.g., "Source Corroboration"
    value: number,  // percentage (0-100)
    color: string,  // CSS color variable
    inverted: boolean // true if lower is better
}
```

---

## 4. Deployment Architecture

### 4.1 Docker Configuration

**Multi-Stage Build (Dockerfile):**
- **Stage 1 (build)**: `node:20-alpine` — installs dependencies
- **Stage 2 (production)**: `nginx:alpine` — copies built assets, serves via Nginx

**Docker Compose Services:**
| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| verity-ai | Custom (Dockerfile) | 8080:80 | Main application |
| jenkins | jenkins/jenkins:lts | 8081:8080 | CI/CD server |

### 4.2 Jenkins Pipeline

**Stages:**
1. **Checkout** — Pull latest code from Git repository
2. **Install Dependencies** — `npm ci` for deterministic installs
3. **Lint** — Static code analysis
4. **Test** — Run unit test suite
5. **Build Docker Image** — Build and tag container image
6. **Security Scan** — Docker Scout vulnerability scan
7. **Deploy to Staging** — Auto-deploy on `develop` branch
8. **Deploy to Production** — Auto-deploy on `main` branch

### 4.3 Nginx Configuration
- Root directory: `/usr/share/nginx/html`
- SPA routing: `try_files $uri $uri/ /index.html`
- Static asset caching: 1 year with `immutable` header
- Gzip enabled for text, CSS, JS, JSON, and XML

---

## 5. User Interface Design

### 5.1 Color System
| Token | Dark Mode Value | Purpose |
|-------|----------------|---------|
| --bg-primary | #0a0a0f | Main background |
| --bg-secondary | #12121a | Card/input backgrounds |
| --accent-primary | #6366f1 | Primary accent (Indigo) |
| --accent-secondary | #8b5cf6 | Secondary accent (Violet) |
| --success | #22c55e | Credible verdict |
| --warning | #f59e0b | Suspicious verdict |
| --danger | #ef4444 | Fake verdict |

### 5.2 Typography
- **Font Family**: Inter (Google Fonts)
- **Monospace**: JetBrains Mono (for metric values)
- **Heading Scale**: clamp(1.8rem, 4vw, 2.5rem) for responsive sizing
- **Body Size**: 16px base, 1.6 line-height

### 5.3 Animation System
| Animation | Duration | Easing | Purpose |
|-----------|----------|--------|---------|
| orbFloat | 20s | ease-in-out | Background gradient movement |
| pulse | 2s | default | Status badge blinking |
| spin | 0.8s | linear | Loading spinner |
| float | 6s | ease-in-out | Floating cards in About section |
| gauge fill | 2s | ease | Credibility score reveal |
| metric bars | 1.5s | ease | Analysis bar chart animation |

---

## 6. Security Considerations

1. **Input Sanitization**: All user inputs are processed as strings; no `innerHTML` with user-controlled content is used for critical elements
2. **No Server-Side Storage**: All analysis is performed client-side; no user data is stored
3. **CSP Headers**: Content Security Policy headers configured in Nginx
4. **Docker Security**: Container runs as non-root user; health checks enabled
5. **Jenkins Security**: Workspace cleaned after each build (`cleanWs()`)

---

## 7. Testing Strategy

### 7.1 Unit Testing
- Analysis engine functions tested with known fake/credible inputs
- Score boundary testing (0, 40, 70, 100 thresholds)
- Source generation probability distribution validation

### 7.2 Integration Testing
- End-to-end user flow: input → analyze → view results → download
- Tab switching and input preservation
- Responsive layout at 320px, 768px, 1024px, 1440px

### 7.3 Performance Testing
- Page load time < 3 seconds (Lighthouse audit)
- Analysis completion < 5 seconds
- No memory leaks in repeated analysis cycles
