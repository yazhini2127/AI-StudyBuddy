import { useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:5001/api'

function App() {
  const [quiz, setQuiz] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const [error, setError] = useState('')

  const materialId = '6ab7aeae5e4f4801376d4c35'

  const startQuiz = async () => {
    try {
      setLoading(true)
      setError('')
      setFinished(false)
      setScore(0)
      setCurrentQuestion(0)
      setSelectedAnswer('')

      const token = localStorage.getItem('token')

      if (!token) {
        setError('Please login first.')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/ai/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          materialId,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to generate quiz')
      }

      setQuiz(data.data.quiz)
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (answer) => {
    if (selectedAnswer) return

    setSelectedAnswer(answer)

    if (answer === quiz[currentQuestion].answer) {
      setScore((prev) => prev + 1)
    }
  }

  const nextQuestion = () => {
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setSelectedAnswer('')
    } else {
      setFinished(true)
    }
  }

  const restartQuiz = () => {
    setQuiz([])
    setCurrentQuestion(0)
    setSelectedAnswer('')
    setScore(0)
    setFinished(false)
    setError('')
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>🤖 AI StudyBuddy</h1>
          <p>Learn smarter with AI</p>
        </div>
      </header>

      <main className="container">
        {!quiz.length && !loading && !finished && (
          <section className="welcome-card">
            <div className="icon">📝</div>

            <h2>Database Management System</h2>

            <p className="subject">Subject: DBMS</p>

            <p>
              Test your knowledge with an AI-generated quiz.
            </p>

            <div className="info">
              <span>❓ 5 Questions</span>
              <span>🔘 4 Options</span>
              <span>🤖 AI Generated</span>
            </div>

            <button className="start-btn" onClick={startQuiz}>
              Start Quiz
            </button>

            {error && <p className="error">{error}</p>}
          </section>
        )}

        {loading && (
          <section className="loading-card">
            <div className="loader">🤖</div>
            <h2>Generating your quiz...</h2>
            <p>AI is preparing questions from your study material.</p>
          </section>
        )}

        {quiz.length > 0 && !finished && (
          <section className="quiz-card">
            <div className="quiz-top">
              <span>
                Question {currentQuestion + 1} of {quiz.length}
              </span>

              <span>Score: {score}</span>
            </div>

            <div className="progress">
              <div
                className="progress-bar"
                style={{
                  width: `${((currentQuestion + 1) / quiz.length) * 100}%`,
                }}
              ></div>
            </div>

            <h2 className="question">
              {quiz[currentQuestion].question}
            </h2>

            <div className="options">
              {quiz[currentQuestion].options.map((option, index) => {
                const isSelected = selectedAnswer === option
                const isCorrect =
                  selectedAnswer &&
                  option === quiz[currentQuestion].answer

                return (
                  <button
                    key={index}
                    className={`option ${
                      isSelected ? 'selected' : ''
                    } ${isCorrect ? 'correct' : ''}`}
                    onClick={() => handleAnswer(option)}
                  >
                    <span className="option-letter">
                      {String.fromCharCode(65 + index)}
                    </span>

                    <span>{option}</span>
                  </button>
                )
              })}
            </div>

            {selectedAnswer && (
              <button className="next-btn" onClick={nextQuestion}>
                {currentQuestion === quiz.length - 1
                  ? 'Finish Quiz'
                  : 'Next Question →'}
              </button>
            )}
          </section>
        )}

        {finished && (
          <section className="result-card">
            <div className="result-icon">🎉</div>

            <h2>Quiz Completed!</h2>

            <p className="result-text">
              Your Score
            </p>

            <div className="score">
              {score} / {quiz.length}
            </div>

            <p>
              {score === quiz.length
                ? 'Excellent! You answered everything correctly.'
                : score >= 3
                  ? 'Good job! Keep studying and improve your score.'
                  : 'Keep practicing! Review the study material and try again.'}
            </p>

            <button className="start-btn" onClick={restartQuiz}>
              Try Again
            </button>
          </section>
        )}

        {error && quiz.length > 0 && (
          <p className="error">{error}</p>
        )}
      </main>
    </div>
  )
}

export default App