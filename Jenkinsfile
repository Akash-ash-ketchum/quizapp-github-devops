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
                sh '''
          echo "MONGO_URI=mongodb://mongo:27017/quizdb" > backend/.env
          echo "PORT=5000" >> backend/.env
          echo "JWT_SECRET=supersecret123" >> backend/.env

          docker compose down
          docker compose up --build -d
        '''
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
