import { useState } from 'react'
import './App.css'

function App() {
  const [userPrompt, setUserPrompt] = useState('')
  const [command, setCommand] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!userPrompt.trim() || isLoading) {
      return
    }

    setIsLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('http://localhost:3000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userPrompt,
        }),
      })

      if (!response.ok) {
        throw new Error('Request failed')
      }

      const data = await response.json()

      // Handle different response command types
      if (data.command === 'NEED_MORE_INFO') {
        setCommand('')
        setMessage(data.message || 'חסר מידע כדי ליצור פקודה מדויקת.')
      } else if (['UNSAFE_REQUEST', 'QUOTA_EXCEEDED', 'SERVER_ERROR'].includes(data.command)) {
        setCommand('')
        setError(data.message || 'אירעה שגיאה בלתי צפויה.')
      } else {
        // Real command
        setCommand(data.command || '')
        setMessage('')
        setError('')
      }
    } catch {
      setCommand('')
      setError('אירעה שגיאה ביצירת הפקודה.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="page" dir="rtl" lang="he">
      <section className="shell">
        <header className="hero">
          <h1>מחולל פקודות CLI</h1>
          <p className="subtitle">הקלידי הוראה בשפה טבעית וקבלי פקודת CMD ברורה ומדויקת.</p>
        </header>

        <section className="dashboard" aria-label="CLI command dashboard">
          <article className="card card-input">
            <h2>קלט</h2>

            <div className="field">
              <label htmlFor="prompt">ההוראה שלך</label>
              <textarea
                id="prompt"
                value={userPrompt}
                onChange={(event) => setUserPrompt(event.target.value)}
                placeholder="לדוגמה: מה כתובת ה-IP של המחשב שלי?"
                rows={5}
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!userPrompt.trim() || isLoading}
              className="submitButton"
            >
              {isLoading ? 'יוצר פקודה...' : 'צור פקודה'}
            </button>
          </article>

          <article className="card card-output">
            <h2>פלט</h2>

            <div className="field">
              <label htmlFor="command">הפקודה שנוצרה</label>
              <input
                id="command"
                type="text"
                value={command || (isLoading ? 'מייצר פקודה...' : 'הפלט יופיע כאן')}
                readOnly
                aria-live="polite"
              />
            </div>

            <div className="statusArea" role="status" aria-live="polite">
              {message && <p className="status info">{message}</p>}
              {error && <p className="status error">{error}</p>}
              {!message && !error && (
                <p className="status hint">אפשר להשתמש בשאלות קצרות או מפורטות ולקבל פקודה מתאימה.</p>
              )}
            </div>
          </article>
        </section>

        <div className="footerHint">
          <span>טיפ:</span> נסחי מטרה ברורה לקבלת פקודה מדויקת יותר.
        </div>
      </section>
    </main>
  )
}

export default App
