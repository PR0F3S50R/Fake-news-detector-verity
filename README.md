# VerityAI — Fake News Detection System

A web application that detects fake news by cross-referencing multiple legitimate news sources and generating comprehensive legitimacy reports.

## Features

- **Multi-Source Verification**: Scours 50+ legitimate news sources (Reuters, AP, BBC, etc.)
- **AI-Powered Analysis**: NLP-based language authenticity and sentiment analysis
- **Legitimacy Reports**: Comprehensive credibility scoring with downloadable reports
- **Real-Time Processing**: Results in under 5 seconds

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Containerization**: Docker + Docker Compose
- **CI/CD**: Jenkins Pipeline
- **Version Control**: Git

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/verity-ai.git
cd verity-ai

# Run with Docker
docker-compose up -d

# Or run locally
npx serve src -l 3000
```

Visit `http://localhost:8080` (Docker) or `http://localhost:3000` (local).

## Project Structure

```
fake-news-detector/
├── src/
│   ├── index.html          # Main application page
│   ├── css/style.css        # Styling
│   └── js/
│       ├── app.js           # Core application logic
│       └── analyzer.js      # News analysis engine
├── docker/
│   └── nginx.conf           # Nginx configuration
├── docs/
│   ├── SRS.md               # Software Requirements Specification
│   └── SDD.md               # Software Design Document
├── Dockerfile               # Container build instructions
├── docker-compose.yml       # Multi-container orchestration
├── Jenkinsfile              # CI/CD pipeline definition
└── package.json             # Project metadata
```

## License

MIT License — See LICENSE for details.
