import { useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:5001/api'

function App() {
  const [activePage, setActivePage] = useState('Dashboard')

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem('token')
  )

  // ==========================
  // LOGIN
  // ==========================

  const [loginEmail, setLoginEmail] = useState(
    'syazhini900@gmail.com'
  )
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // ==========================
  // QUIZ
  // ==========================

  const [quiz, setQuiz] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const [error, setError] = useState('')

  // ==========================
  // SUMMARY
  // ==========================

  const [summary, setSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)

  // ==========================
  // FLASHCARDS
  // ==========================

  const [flashcards, setFlashcards] = useState([])
  const [flashcardsLoading, setFlashcardsLoading] = useState(false)
  const [flashcardsError, setFlashcardsError] = useState('')
  const [flippedCards, setFlippedCards] = useState({})

  // ==========================
  // MATERIAL
  // ==========================

  const materialId = '6ab7aeae5e4f4801376d4c35'

  // ==========================
  // MENU
  // ==========================

  const menuItems = [
    { name: 'Dashboard', icon: '🏠' },
    { name: 'Study Materials', icon: '📚' },
    { name: 'AI Summary', icon: '🤖' },
    { name: 'AI Quiz', icon: '🧠' },
    { name: 'Flashcards', icon: '🃏' },
    { name: 'Study Plan', icon: '📅' },
    { name: 'Weather', icon: '🌤️' },
    { name: 'Favorites', icon: '⭐' },
    { name: 'Profile', icon: '👤' },
  ]

  // ==========================
  // LOGIN
  // ==========================

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      setLoginLoading(true)
      setLoginError('')

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed')
      }

      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data))

      setIsLoggedIn(true)
    } catch (error) {
      console.error('Login error:', error)
      setLoginError(error.message)
    } finally {
      setLoginLoading(false)
    }
  }

  // ==========================
  // QUIZ
  // ==========================

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
        throw new Error(
          data.message || 'Failed to generate quiz'
        )
      }

      console.log(
        'QUIZ API RESPONSE:',
        data.data.quiz
      )

      setQuiz(data.data.quiz || [])
      setActivePage('AI Quiz')
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

    if (
      answer === quiz[currentQuestion].answer
    ) {
      setScore((prev) => prev + 1)
    }
  }

  const nextQuestion = () => {
    if (
      currentQuestion <
      quiz.length - 1
    ) {
      setCurrentQuestion(
        (prev) => prev + 1
      )

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

  // ==========================
  // AI SUMMARY
  // ==========================

  const generateSummary = async () => {
    try {
      setSummaryLoading(true)
      setError('')

      const token = localStorage.getItem('token')

      if (!token) {
        setError('Please login first.')
        setSummaryLoading(false)
        return
      }

      const response = await fetch(
        `${API_URL}/materials/${materialId}/summarize`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            materialId,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            'Failed to generate summary'
        )
      }

      setSummary(
        data.data.summary ||
          data.data ||
          'Summary generated successfully.'
      )
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setSummaryLoading(false)
    }
  }

  // ==========================
  // AI FLASHCARDS
  // ==========================

  const loadFlashcards = async () => {
    try {
      setFlashcardsLoading(true)
      setFlashcardsError('')

      const token =
        localStorage.getItem('token')

      if (!token) {
        setFlashcardsError(
          'Please login first.'
        )
        return
      }

      const response = await fetch(
        `${API_URL}/ai/flashcards`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            materialId,
          }),
        }
      )

      const data = await response.json()

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            'Failed to generate flashcards'
        )
      }

      console.log(
        'FLASHCARDS API RESPONSE:',
        data.data.flashcards
      )

      setFlashcards(
        data.data.flashcards || []
      )

      setFlippedCards({})
    } catch (error) {
      console.error(
        'Flashcards error:',
        error
      )

      setFlashcardsError(
        error.message
      )
    } finally {
      setFlashcardsLoading(false)
    }
  }

  const flipCard = (index) => {
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  // ==========================
  // DASHBOARD
  // ==========================

  const renderDashboard = () => (
    <>
      <div className="page-heading">
        <div>
          <p className="small-label">
            WELCOME BACK 👋
          </p>

          <h1>
            Ready to learn smarter?
          </h1>

          <p>
            Manage your study materials
            and learn with AI.
          </p>
        </div>
      </div>

      <div className="hero-card">
        <div>
          <span className="hero-badge">
            ✨ AI POWERED LEARNING
          </span>

          <h2>
            Your Personal AI Study Buddy
          </h2>

          <p>
            Upload your study materials
            and use AI to create
            summaries, quizzes, flashcards
            and personalized study plans.
          </p>

          <button
            className="primary-btn"
            onClick={() =>
              setActivePage(
                'Study Materials'
              )
            }
          >
            Explore Materials →
          </button>
        </div>

        <div className="hero-emoji">
          🤖
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            📚
          </div>

          <div>
            <span>
              Study Materials
            </span>

            <strong>12</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            🧠
          </div>

          <div>
            <span>
              Quizzes Completed
            </span>

            <strong>5</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            🃏
          </div>

          <div>
            <span>Flashcards</span>

            <strong>
              {flashcards.length || 24}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            📅
          </div>

          <div>
            <span>Study Plan</span>

            <strong>
              Active
            </strong>
          </div>
        </div>
      </div>

      <div className="section-title">
        <h2>Quick Actions</h2>

        <p>
          Start learning in one click
        </p>
      </div>

      <div className="quick-grid">
        <button
          className="quick-card"
          onClick={() =>
            setActivePage('AI Summary')
          }
        >
          <span>🤖</span>

          <h3>AI Summary</h3>

          <p>
            Understand difficult topics
            quickly.
          </p>
        </button>

        <button
          className="quick-card"
          onClick={() => {
            setActivePage('AI Quiz')
            startQuiz()
          }}
        >
          <span>🧠</span>

          <h3>Take Quiz</h3>

          <p>
            Test your knowledge with AI
            questions.
          </p>
        </button>

        <button
          className="quick-card"
          onClick={() =>
            setActivePage('Flashcards')
          }
        >
          <span>🃏</span>

          <h3>Flashcards</h3>

          <p>
            Revise important concepts
            easily.
          </p>
        </button>

        <button
          className="quick-card"
          onClick={() =>
            setActivePage('Study Plan')
          }
        >
          <span>📅</span>

          <h3>Study Plan</h3>

          <p>
            Follow your personalized
            schedule.
          </p>
        </button>
      </div>

      <div className="section-title">
        <h2>
          Recent Study Materials
        </h2>

        <p>
          Continue where you left off
        </p>
      </div>

      <div className="material-grid">
        <div className="material-card">
          <div className="material-icon">
            🗄️
          </div>

          <div>
            <h3>
              Database Management System
            </h3>

            <p>
              DBMS • Updated recently
            </p>
          </div>

          <button
            onClick={() =>
              setActivePage('AI Quiz')
            }
          >
            Study →
          </button>
        </div>

        <div className="material-card">
          <div className="material-icon">
            💻
          </div>

          <div>
            <h3>
              Data Structures
            </h3>

            <p>
              Computer Science • 4 topics
            </p>
          </div>

          <button
            onClick={() =>
              setActivePage(
                'Study Materials'
              )
            }
          >
            Study →
          </button>
        </div>

        <div className="material-card">
          <div className="material-icon">
            🌐
          </div>

          <div>
            <h3>
              Computer Networks
            </h3>

            <p>
              Computer Science • 6 topics
            </p>
          </div>

          <button
            onClick={() =>
              setActivePage(
                'Study Materials'
              )
            }
          >
            Study →
          </button>
        </div>
      </div>
    </>
  )

  // ==========================
  // STUDY MATERIALS
  // ==========================

  const renderMaterials = () => (
    <div>
      <div className="page-heading">
        <div>
          <p className="small-label">
            LEARNING LIBRARY
          </p>

          <h1>
            Study Materials 📚
          </h1>

          <p>
            Access all your study
            resources in one place.
          </p>
        </div>

        <button className="primary-btn">
          + Add Material
        </button>
      </div>

      <div className="search-box">
        🔍

        <input
          placeholder="Search study materials..."
        />
      </div>

      <div className="large-material-grid">
        <div className="large-material-card">
          <span className="large-icon">
            🗄️
          </span>

          <span className="subject-tag">
            DBMS
          </span>

          <h2>
            Database Management System
          </h2>

          <p>
            Learn databases, SQL,
            normalization, transactions,
            indexing and database
            architecture.
          </p>

          <div className="card-footer">
            <span>
              📖 8 Topics
            </span>

            <button
              onClick={() =>
                setActivePage(
                  'AI Summary'
                )
              }
            >
              Learn →
            </button>
          </div>
        </div>

        <div className="large-material-card">
          <span className="large-icon">
            💻
          </span>

          <span className="subject-tag">
            DS
          </span>

          <h2>
            Data Structures
          </h2>

          <p>
            Arrays, linked lists,
            stacks, queues, trees and
            searching algorithms.
          </p>

          <div className="card-footer">
            <span>
              📖 10 Topics
            </span>

            <button>
              Learn →
            </button>
          </div>
        </div>

        <div className="large-material-card">
          <span className="large-icon">
            🌐
          </span>

          <span className="subject-tag">
            CN
          </span>

          <h2>
            Computer Networks
          </h2>

          <p>
            Networking concepts,
            protocols, OSI model and
            network security.
          </p>

          <div className="card-footer">
            <span>
              📖 6 Topics
            </span>

            <button>
              Learn →
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // ==========================
  // AI SUMMARY
  // ==========================

  const renderSummary = () => (
    <div>
      <div className="page-heading">
        <div>
          <p className="small-label">
            ARTIFICIAL INTELLIGENCE
          </p>

          <h1>
            AI Summary 🤖
          </h1>

          <p>
            Turn lengthy study material
            into simple notes.
          </p>
        </div>
      </div>

      <div className="ai-panel">
        <div className="ai-panel-header">
          <div className="ai-big-icon">
            🤖
          </div>

          <div>
            <h2>
              Database Management System
            </h2>

            <p>
              AI-powered summary generation
            </p>
          </div>
        </div>

        <button
          className="primary-btn"
          onClick={generateSummary}
          disabled={summaryLoading}
        >
          {summaryLoading
            ? 'Generating...'
            : '✨ Generate AI Summary'}
        </button>

        {summary && (
          <div className="summary-result">
            <h3>
              📌 AI Generated Summary
            </h3>

            <p>{summary}</p>
          </div>
        )}

        {!summary &&
          !summaryLoading && (
            <div className="empty-ai">
              <span>📝</span>

              <h3>
                No summary generated yet
              </h3>

              <p>
                Click the button above to
                let AI create
                easy-to-understand notes
                from your study material.
              </p>
            </div>
          )}

        {error && (
          <p className="error">
            {error}
          </p>
        )}
      </div>
    </div>
  )

  // ==========================
  // AI QUIZ
  // ==========================

  const renderQuiz = () => {
    if (loading) {
      return (
        <section className="loading-card">
          <div className="loader">
            🤖
          </div>

          <h2>
            Generating your quiz...
          </h2>

          <p>
            AI is preparing questions
            from your study material.
          </p>
        </section>
      )
    }

    if (
      !quiz.length &&
      !finished
    ) {
      return (
        <section className="quiz-start-card">
          <div className="quiz-hero-icon">
            🧠
          </div>

          <span className="subject-tag">
            AI POWERED QUIZ
          </span>

          <h1>
            Database Management System
          </h1>

          <p className="subject">
            Subject: DBMS
          </p>

          <p>
            Test your knowledge with an
            AI-generated quiz created
            from your study material.
          </p>

          <div className="info">
            <span>
              ❓ 5 Questions
            </span>

            <span>
              🔘 4 Options
            </span>

            <span>
              🤖 AI Generated
            </span>
          </div>

          <button
            className="primary-btn"
            onClick={startQuiz}
          >
            Start Quiz →
          </button>

          {error && (
            <p className="error">
              {error}
            </p>
          )}
        </section>
      )
    }

    if (finished) {
      return (
        <section className="result-card">
          <div className="result-icon">
            🎉
          </div>

          <span className="subject-tag">
            QUIZ COMPLETED
          </span>

          <h2>
            Great job!
          </h2>

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

          <button
            className="primary-btn"
            onClick={restartQuiz}
          >
            Try Again
          </button>
        </section>
      )
    }

    return (
      <section className="quiz-card">
        <div className="quiz-top">
          <span>
            Question{' '}
            {currentQuestion + 1}{' '}
            of {quiz.length}
          </span>

          <span>
            Score: {score}
          </span>
        </div>

        <div className="progress">
          <div
            className="progress-bar"
            style={{
              width: `${
                ((currentQuestion + 1) /
                  quiz.length) *
                100
              }%`,
            }}
          />
        </div>

        <h2 className="question">
          {
            quiz[currentQuestion]
              .question
          }
        </h2>

        <div className="options">
          {quiz[
            currentQuestion
          ].options.map(
            (option, index) => {
              const isSelected =
                selectedAnswer ===
                option

              const isCorrect =
                selectedAnswer &&
                option ===
                  quiz[
                    currentQuestion
                  ].answer

              return (
                <button
                  key={index}
                  className={`option ${
                    isSelected
                      ? 'selected'
                      : ''
                  } ${
                    isCorrect
                      ? 'correct'
                      : ''
                  }`}
                  onClick={() =>
                    handleAnswer(
                      option
                    )
                  }
                >
                  <span className="option-letter">
                    {String.fromCharCode(
                      65 + index
                    )}
                  </span>

                  <span>
                    {option}
                  </span>
                </button>
              )
            }
          )}
        </div>

        {selectedAnswer && (
          <button
            className="primary-btn next-question"
            onClick={
              nextQuestion
            }
          >
            {currentQuestion ===
            quiz.length - 1
              ? 'Finish Quiz'
              : 'Next Question →'}
          </button>
        )}
      </section>
    )
  }

  // ==========================
  // FLASHCARDS
  // ==========================

  const renderFlashcards = () => (
    <div>
      <div className="page-heading">
        <div>
          <p className="small-label">
            ACTIVE RECALL
          </p>

          <h1>
            Flashcards 🃏
          </h1>

          <p>
            AI-generated flashcards from
            your study material.
          </p>
        </div>
      </div>

      <div className="section-card">
        <div className="section-card-header">
          <div>
            <h2>
              AI Flashcards
            </h2>

            <p>
              Generate quick revision
              cards from your study
              material.
            </p>
          </div>

          <button
            className="primary-btn"
            onClick={
              loadFlashcards
            }
            disabled={
              flashcardsLoading
            }
          >
            {flashcardsLoading
              ? 'Generating...'
              : '✨ Generate Flashcards'}
          </button>
        </div>
      </div>

      {flashcardsError && (
        <div className="error-box">
          ⚠️ {flashcardsError}
        </div>
      )}

      {flashcards.length > 0 && (
        <div className="flashcard-grid">
          {flashcards.map(
            (card, index) => (
              <div
                className="flashcard"
                key={index}
              >
                <span>
                  {flippedCards[index]
                    ? 'ANSWER'
                    : `QUESTION ${
                        index + 1
                      }`}
                </span>

                <h2>
                  {flippedCards[index]
                    ? card.answer
                    : card.question}
                </h2>

                <button
                  onClick={() =>
                    flipCard(index)
                  }
                >
                  {flippedCards[index]
                    ? 'Show Question'
                    : 'Show Answer'}
                </button>
              </div>
            )
          )}
        </div>
      )}

      {!flashcardsLoading &&
        flashcards.length === 0 &&
        !flashcardsError && (
          <div className="empty-page">
            <span>
              🃏
            </span>

            <h2>
              No flashcards generated
              yet
            </h2>

            <p>
              Click "Generate
              Flashcards" to create
              AI-powered revision
              cards.
            </p>
          </div>
        )}
    </div>
  )

  // ==========================
  // STUDY PLAN
  // ==========================

  const renderStudyPlan = () => (
    <div>
      <div className="page-heading">
        <div>
          <p className="small-label">
            PERSONALIZED LEARNING
          </p>

          <h1>
            Study Plan 📅
          </h1>

          <p>
            Stay organized with your
            daily learning schedule.
          </p>
        </div>

        <button className="primary-btn">
          + Create Plan
        </button>
      </div>

      <div className="plan-card">
        <div className="plan-header">
          <div>
            <span className="subject-tag">
              ACTIVE PLAN
            </span>

            <h2>
              Semester Exam Preparation
            </h2>

            <p>
              Computer Science •
              30 Day Plan
            </p>
          </div>

          <div className="plan-progress">
            <strong>
              65%
            </strong>

            <span>
              Completed
            </span>
          </div>
        </div>

        <div className="progress large">
          <div
            className="progress-bar"
            style={{
              width: '65%',
            }}
          />
        </div>

        <div className="schedule-list">
          <div className="schedule-item done">
            <span>✓</span>

            <div>
              <strong>
                DBMS - Introduction
              </strong>

              <p>
                Completed
              </p>
            </div>
          </div>

          <div className="schedule-item active">
            <span>📖</span>

            <div>
              <strong>
                DBMS - Normalization
              </strong>

              <p>
                Today's topic •
                45 minutes
              </p>
            </div>
          </div>

          <div className="schedule-item">
            <span>○</span>

            <div>
              <strong>
                Data Structures - Trees
              </strong>

              <p>
                Tomorrow •
                60 minutes
              </p>
            </div>
          </div>

          <div className="schedule-item">
            <span>○</span>

            <div>
              <strong>
                Computer Networks
              </strong>

              <p>
                Upcoming •
                45 minutes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ==========================
  // WEATHER
  // ==========================

  const renderWeather = () => (
    <div>
      <div className="page-heading">
        <div>
          <p className="small-label">
            STUDY ENVIRONMENT
          </p>

          <h1>
            Weather 🌤️
          </h1>

          <p>
            Plan your study time around
            the weather.
          </p>
        </div>
      </div>

      <div className="weather-card">
        <div className="weather-icon">
          ☀️
        </div>

        <div>
          <p>
            Current Weather
          </p>

          <h2>
            28°C
          </h2>

          <strong>
            Partly Cloudy
          </strong>

          <span>
            Good weather for studying 📚
          </span>
        </div>
      </div>
    </div>
  )

  // ==========================
  // FAVORITES
  // ==========================

  const renderFavorites = () => (
    <div>
      <div className="page-heading">
        <div>
          <p className="small-label">
            SAVED RESOURCES
          </p>

          <h1>
            Favorites ⭐
          </h1>

          <p>
            Your bookmarked study
            resources.
          </p>
        </div>
      </div>

      <div className="empty-page">
        <span>⭐</span>

        <h2>
          Your favorite resources
        </h2>

        <p>
          Save important study
          materials, summaries and
          flashcards here for quick
          access.
        </p>

        <button
          className="primary-btn"
          onClick={() =>
            setActivePage(
              'Study Materials'
            )
          }
        >
          Browse Materials
        </button>
      </div>
    </div>
  )

  // ==========================
  // PROFILE
  // ==========================

  const renderProfile = () => {
    let user = {}

    try {
      user = JSON.parse(
        localStorage.getItem(
          'user'
        ) || '{}'
      )
    } catch {
      user = {}
    }

    return (
      <div>
        <div className="page-heading">
          <div>
            <p className="small-label">
              ACCOUNT
            </p>

            <h1>
              My Profile 👤
            </h1>

            <p>
              Manage your StudyBuddy
              account.
            </p>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-avatar">
            {(
              user.name ||
              user.username ||
              'Y'
            )
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="profile-info">
            <h2>
              {user.name ||
                user.username ||
                'Student'}
            </h2>

            <p>
              AI StudyBuddy Learner
            </p>

            <div className="profile-details">
              <div>
                <span>
                  📧 Email
                </span>

                <strong>
                  {user.email ||
                    'student@example.com'}
                </strong>
              </div>

              <div>
                <span>
                  🎓 Role
                </span>

                <strong>
                  Student
                </strong>
              </div>

              <div>
                <span>
                  📚 Materials
                </span>

                <strong>
                  12
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ==========================
  // PAGE ROUTER
  // ==========================

  const renderPage = () => {
    switch (activePage) {
      case 'Study Materials':
        return renderMaterials()

      case 'AI Summary':
        return renderSummary()

      case 'AI Quiz':
        return renderQuiz()

      case 'Flashcards':
        return renderFlashcards()

      case 'Study Plan':
        return renderStudyPlan()

      case 'Weather':
        return renderWeather()

      case 'Favorites':
        return renderFavorites()

      case 'Profile':
        return renderProfile()

      default:
        return renderDashboard()
    }
  }

  // ==========================
  // LOGIN PAGE
  // ==========================

  if (!isLoggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">
            🤖
          </div>

          <h1>
            AI StudyBuddy
          </h1>

          <p className="login-subtitle">
            Learn smarter with AI
          </p>

          <form
            onSubmit={handleLogin}
          >
            <div className="login-field">
              <label>
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={loginEmail}
                onChange={(e) =>
                  setLoginEmail(
                    e.target.value
                  )
                }
                required
              />
            </div>

            <div className="login-field">
              <label>
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={
                  loginPassword
                }
                onChange={(e) =>
                  setLoginPassword(
                    e.target.value
                  )
                }
                required
              />
            </div>

            {loginError && (
              <div className="login-error">
                ⚠️ {loginError}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={
                loginLoading
              }
            >
              {loginLoading
                ? 'Signing in...'
                : 'Sign In'}
            </button>
          </form>

          <p className="login-footer">
            AI-powered learning
            companion
          </p>
        </div>
      </div>
    )
  }

  // ==========================
  // MAIN APP
  // ==========================

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            🤖
          </div>

          <div>
            <h2>
              StudyBuddy
            </h2>

            <span>
              AI Learning Platform
            </span>
          </div>
        </div>

        <div className="menu-label">
          MAIN MENU
        </div>

        <nav>
          {menuItems.map(
            (item) => (
              <button
                key={item.name}
                className={`nav-item ${
                  activePage ===
                  item.name
                    ? 'active'
                    : ''
                }`}
                onClick={() => {
                  setActivePage(
                    item.name
                  )

                  if (
                    item.name !==
                    'AI Quiz'
                  ) {
                    setQuiz([])
                    setFinished(
                      false
                    )
                    setError('')
                  }
                }}
              >
                <span>
                  {item.icon}
                </span>

                {item.name}
              </button>
            )
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="ai-tip">
            <span>
              💡
            </span>

            <strong>
              Study Tip
            </strong>

            <p>
              Use active recall and
              spaced repetition for
              better learning.
            </p>
          </div>

          <div className="mini-profile">
            <div className="mini-avatar">
              Y
            </div>

            <div>
              <strong>
                Student
              </strong>

              <span>
                Learning Mode
              </span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="mobile-title">
            <span>
              🤖
            </span>

            <strong>
              AI StudyBuddy
            </strong>
          </div>

          <div className="topbar-right">
            <button className="notification">
              🔔
            </button>

            <div className="top-profile">
              <div className="mini-avatar">
                Y
              </div>

              <div>
                <strong>
                  Student
                </strong>

                <span>
                  Student Account
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="content-area">
          {renderPage()}
        </div>
      </main>
    </div>
  )
}

export default App