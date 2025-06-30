pipeline {
    agent any

    stages {
        stage('Clone Repo') {
            steps {
                echo 'Cloning repository...'
                // Jenkins automatically checks out your repo if using "Pipeline from SCM"
            }
        }

        stage('Build Docker Containers') {
            steps {
                echo 'Building Docker containers...'
                sh 'docker compose down'      // Stop and remove old containers
                sh 'docker-compose up --build -d' // Build and run in detached mode
            }
        }

        stage('Verify Deployment') {
            steps {
                echo 'Listing Docker containers...'
                sh 'docker ps'
            }
        }
    }

    post {
        failure {
            echo '⛔️ Build failed!'
        }
        success {
            echo '✅ Build succeeded!'
        }
    }
}
