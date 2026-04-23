pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'verity-ai-app'
        DOCKER_TAG = "${BUILD_NUMBER}"
        REGISTRY = 'docker.io/verityai'
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing Node.js dependencies...'
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                echo 'Running code linting...'
                sh 'npm run lint || true'
            }
        }

        stage('Test') {
            steps {
                echo 'Running unit tests...'
                sh 'npm test || true'
            }
            post {
                always {
                    echo 'Test stage completed'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Building Docker image: ${DOCKER_IMAGE}:${DOCKER_TAG}"
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
            }
        }

        stage('Security Scan') {
            steps {
                echo 'Running container security scan...'
                sh "docker scout cves ${DOCKER_IMAGE}:${DOCKER_TAG} || true"
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                echo 'Deploying to staging environment...'
                sh 'docker-compose -f docker-compose.yml up -d'
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying to production...'
                sh "docker-compose -f docker-compose.yml up -d --build"
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check logs for details.'
        }
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
        }
    }
}
