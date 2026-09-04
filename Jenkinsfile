pipeline {
    agent any

    stages {

        stage('Install') {
            steps {
                bat 'npm ci'
            }
        }

        stage('Test') {
            steps {
                bat 'npm test'
            }
        }

        stage('Build') {
            steps {
                bat 'echo Static HTML/CSS/JS project - no compilation required'
            }
        }
    }
}