# Software Requirements Specification (SRS)
## VerityAI — Fake News Detection System

**Version:** 1.0  
**Date:** April 2026  
**Prepared by:** VerityAI Development Team

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) document provides a complete description of the functional and non-functional requirements for the VerityAI Fake News Detection System. It serves as a binding agreement between stakeholders and the development team regarding what the system will deliver.

### 1.2 Scope
VerityAI is a web-based application designed to detect fake news by cross-referencing user-submitted news content (text or URL) against multiple legitimate and trusted news sources. The system generates a comprehensive legitimacy report containing a credibility score, source cross-reference results, language analysis metrics, and detailed findings.

### 1.3 Definitions and Acronyms
| Term | Definition |
|------|-----------|
| NLP | Natural Language Processing |
| SRS | Software Requirements Specification |
| API | Application Programming Interface |
| CI/CD | Continuous Integration / Continuous Deployment |
| UI | User Interface |

### 1.4 References
- IEEE Std 830-1998 — IEEE Recommended Practice for SRS
- W3C Web Accessibility Guidelines (WCAG 2.1)
- OWASP Top 10 Security Risks

---

## 2. Overall Description

### 2.1 Product Perspective
VerityAI is a standalone web application that operates in any modern web browser. It is a client-side application with simulated multi-source verification capabilities. The system is containerized using Docker and deployed via a Jenkins CI/CD pipeline.

### 2.2 Product Functions
The system shall provide the following major functions:

1. **News Input Interface** — Accept news articles via text/headline input or URL
2. **Multi-Source Cross-Referencing** — Scan 50+ legitimate news sources for corroboration
3. **Language Analysis** — Detect sensational language, excessive capitalization, and emotional manipulation
4. **Credibility Scoring** — Generate a 0-100 credibility score based on analysis
5. **Legitimacy Report Generation** — Produce detailed reports with source comparisons, metrics, and findings
6. **Report Download** — Allow users to download reports in text format

### 2.3 User Classes and Characteristics
| User Class | Description |
|-----------|-------------|
| General Public | Users seeking to verify news before sharing on social media |
| Journalists | Professionals fact-checking sources for articles |
| Educators | Teachers using the tool for media literacy education |
| Researchers | Academics studying misinformation patterns |

### 2.4 Operating Environment
- **Client**: Any modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Server**: Docker container running on Linux/Windows with Nginx
- **Network**: Standard HTTP/HTTPS internet connection

### 2.5 Constraints
- The system uses heuristic-based analysis (not a live ML model) for demonstration purposes
- Source cross-referencing is simulated and does not make real API calls
- URL analysis does not fetch actual webpage content

---

## 3. Functional Requirements

### 3.1 FR-01: News Text Input
- **Description**: The system shall allow users to input news content as plain text or headlines
- **Input**: Free-form text (1-5000 characters)
- **Priority**: High

### 3.2 FR-02: URL Input
- **Description**: The system shall allow users to input a news article URL for analysis
- **Input**: Valid URL string
- **Priority**: High

### 3.3 FR-03: Input Tab Switching
- **Description**: The system shall provide toggle tabs to switch between text input and URL input modes
- **Priority**: Medium

### 3.4 FR-04: Multi-Source Scanning
- **Description**: The system shall simulate cross-referencing against multiple legitimate sources including Reuters, AP News, BBC News, The Guardian, NPR, Snopes, PolitiFact, FactCheck.org, AFP Fact Check, Al Jazeera, Full Fact, and MBFC News
- **Output**: Per-source status (match, partial, no-match, not-found) with details
- **Priority**: High

### 3.5 FR-05: Credibility Score Calculation
- **Description**: The system shall calculate a credibility score (0-100) based on:
  - Presence of fake news indicator phrases
  - Presence of credible reporting indicators
  - Text quality metrics (capitalization, punctuation, length)
  - Source corroboration results
- **Priority**: High

### 3.6 FR-06: Verdict Classification
- **Description**: The system shall classify news into three categories:
  - **Likely Credible** (score ≥ 70)
  - **Suspicious** (score 40-69)
  - **Likely Fake** (score < 40)
- **Priority**: High

### 3.7 FR-07: Legitimacy Report Display
- **Description**: The system shall display a comprehensive report including:
  - Visual credibility gauge
  - Verdict badge with description
  - Source cross-reference list
  - Analysis metrics with progress bars
  - Detailed findings
- **Priority**: High

### 3.8 FR-08: Report Download
- **Description**: The system shall allow users to download the legitimacy report as a text file
- **Priority**: Medium

### 3.9 FR-09: Theme Toggle
- **Description**: The system shall support dark/light mode toggling
- **Priority**: Low

### 3.10 FR-10: Responsive Design
- **Description**: The system shall be fully responsive and functional on mobile devices (320px+), tablets (768px+), and desktops (1024px+)
- **Priority**: High

---

## 4. Non-Functional Requirements

### 4.1 NFR-01: Performance
- Analysis results shall be displayed within 5 seconds of submission
- Page initial load time shall be under 3 seconds on standard broadband
- The application shall handle 100 concurrent users without degradation

### 4.2 NFR-02: Usability
- The UI shall follow modern web design principles with intuitive navigation
- Users shall be able to complete an analysis within 3 clicks
- Error states shall provide clear, actionable feedback

### 4.3 NFR-03: Reliability
- The system shall have 99.5% uptime availability
- Docker health checks shall monitor container status every 30 seconds

### 4.4 NFR-04: Security
- All user inputs shall be sanitized to prevent XSS attacks
- No user data shall be stored on the server
- HTTPS shall be used in production

### 4.5 NFR-05: Maintainability
- Code shall follow modular architecture with separation of concerns
- Jenkins pipeline shall automate testing and deployment
- Docker containerization ensures consistent environments

### 4.6 NFR-06: Scalability
- The system architecture shall support horizontal scaling via Docker Compose
- Static assets shall be served via Nginx with gzip compression and caching

---

## 5. Interface Requirements

### 5.1 User Interface
- **Navigation Bar**: Fixed top bar with logo, links (Home, How It Works, Sources, About), theme toggle, and CTA button
- **Hero Section**: Full-viewport landing with animated statistics
- **Analyzer Section**: Tabbed input (Text/URL) with action button
- **Results Section**: Gauge chart, verdict card, source list, metrics, findings
- **Footer**: Product links, resources, legal

### 5.2 Hardware Interfaces
- No special hardware required; standard web browser on any device

### 5.3 Software Interfaces
- **Docker Engine**: Version 20.10+ for containerization
- **Nginx**: Version 1.21+ for serving static content
- **Jenkins**: LTS version for CI/CD pipeline

---

## 6. Use Case Diagram

```
         ┌─────────────────────────────────┐
         │         VerityAI System          │
         │                                  │
         │  ┌───────────────────────────┐   │
User ──> │  │ UC1: Submit News Text     │   │
         │  └───────────────────────────┘   │
         │  ┌───────────────────────────┐   │
User ──> │  │ UC2: Submit News URL      │   │
         │  └───────────────────────────┘   │
         │  ┌───────────────────────────┐   │
         │  │ UC3: View Analysis Report │ ──> User
         │  └───────────────────────────┘   │
         │  ┌───────────────────────────┐   │
         │  │ UC4: Download Report      │ ──> User
         │  └───────────────────────────┘   │
         │  ┌───────────────────────────┐   │
User ──> │  │ UC5: Toggle Theme         │   │
         │  └───────────────────────────┘   │
         └─────────────────────────────────┘
```

---

## 7. Appendix

### 7.1 Fake News Indicator Keywords
The system monitors for the following keywords/phrases: "breaking:", "shocking", "you won't believe", "secret", "they don't want you to know", "exposed", "miracle", "cure", "banned", "coverup", "conspiracy", "illuminati", "alien", "hoax confirmed", "mainstream media lies", "deep state", "plandemic", "microchip", "5g causes", "flat earth", "chemtrails", "mind control", "big pharma", "government hiding", "suppressed", "wake up sheeple".

### 7.2 Credible Reporting Indicators
Positive credibility indicators include: "according to", "study finds", "research shows", "officials said", "report indicates", "data suggests", "peer-reviewed", "published in", "university", "scientists", "evidence", "investigation", "confirmed by".
