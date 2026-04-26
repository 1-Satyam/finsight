import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

import API from '../config'

interface Source { document: string; page: number; section: string; chunk_index: number }
interface Message { role: 'user' | 'assistant'; content: string; sources?: Source[]; model?: string }

function ProgressiveLoader() {
  const steps = [
    'Scanning documents…',
    'Extracting financial data…',
    'Running similarity search…',
    'Generating analysis…',
  ]
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setStep(s => (s + 1) % steps.length)
    }, 1800)
    return () => clearInterval(id)
  }, [])

  return (
    <p style={{
      fontSize: '13.5px', color: 'var(--text-tertiary)',
      fontStyle: 'italic', transition: 'opacity 0.3s'
    }}>
      {steps[step]}
    </p>
  )
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [question, setQuestion] = useState('')
  const [company, setCompany] = useState('')
  const [year, setYear] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const send = async () => {
    if (!question.trim() || loading) return
    const q = question
    setMessages(prev => [...prev, { role: 'user', content: q }])
    setQuestion('')
    setLoading(true)
    try {
      const res = await axios.post(`${API}/query`, {
        question: q, company: company || null,
        year: year ? parseInt(year) : null, top_k: 5
      })
      setMessages(prev => [...prev, {
        role: 'assistant', content: res.data.answer,
        sources: res.data.sources, model: res.data.model
      }])
    } catch (e: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${e.response?.data?.detail || 'Something went wrong'}`
      }])
    } finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 96px)', maxWidth: '720px' }}>

      {/* Header */}
      <div style={{ marginBottom: '20px', paddingBottom: '18px', borderBottom: '1px solid var(--border)' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
          RAG Query Interface
        </p>
        <h1 style={{ fontSize: '28px', color: 'var(--text-primary)', lineHeight: 1.2 }}>Ask FinSight</h1>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[
          { ph: 'Company', val: company, set: setCompany, w: '160px' },
          { ph: 'Year', val: year, set: setYear, w: '110px' }
        ].map((f, i) => (
          <input key={i} placeholder={f.ph} value={f.val}
            onChange={e => f.set(e.target.value)}
            style={{
              width: f.w, padding: '7px 12px',
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
              fontSize: '13px', outline: 'none'
            }}
          />
        ))}
        {(company || year) && (
          <button onClick={() => { setCompany(''); setYear('') }} style={{
            padding: '7px 12px', background: 'transparent',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer'
          }}>Clear</button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {messages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', opacity: 0.5 }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.3">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>Upload a document to start querying</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            padding: '18px 0', borderBottom: '1px solid var(--border)',
            display: 'flex', gap: '14px', alignItems: 'flex-start'
          }}>
            {/* Avatar */}
            <div style={{
              width: '28px', height: '28px', borderRadius: '6px', flexShrink: 0,
              background: msg.role === 'user' ? 'var(--bg-tertiary)' : 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 600,
              color: msg.role === 'user' ? 'var(--text-secondary)' : '#fff',
              marginTop: '2px'
            }}>
              {msg.role === 'user' ? 'U' : 'F'}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                {msg.role === 'user' ? 'You' : 'FinSight'}
              </p>
              <p style={{ fontSize: '14px', lineHeight: 1.75, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </p>

              {/* Source citations — serif pills */}
              {msg.sources && msg.sources.length > 0 && (
                <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginRight: '2px' }}>Sources</span>
                  {msg.sources.map((s, j) => (
                    <span key={j} style={{
                      fontFamily: 'Instrument Serif, serif',
                      fontSize: '12px', padding: '2px 10px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '20px', color: 'var(--text-secondary)',
                      cursor: 'default',
                      transition: 'all 0.15s'
                    }}
                      onMouseEnter={e => {
                        (e.target as HTMLElement).style.background = 'var(--accent-light)'
                        ;(e.target as HTMLElement).style.borderColor = 'var(--accent)'
                        ;(e.target as HTMLElement).style.color = 'var(--accent)'
                      }}
                      onMouseLeave={e => {
                        (e.target as HTMLElement).style.background = 'var(--bg-secondary)'
                        ;(e.target as HTMLElement).style.borderColor = 'var(--border)'
                        ;(e.target as HTMLElement).style.color = 'var(--text-secondary)'
                      }}
                    >
                      p.{s.page} · {s.section}
                    </span>
                  ))}
                  {msg.model && (
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginLeft: '4px', fontStyle: 'italic' }}>
                      via {msg.model}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Thinking indicator with progressive states */}
          {loading && (
            <div style={{
              padding: '18px 0', display: 'flex', gap: '14px', alignItems: 'flex-start'
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '6px', flexShrink: 0,
                background: 'var(--accent)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 600, color: '#fff', marginTop: '2px'
              }}>F</div>
              <div style={{ paddingTop: '6px' }}>
                <ProgressiveLoader />
              </div>
            </div>
          )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center',
        padding: '10px 12px', background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius)', border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <input
          placeholder="Ask about revenue, risk factors, cash flow…"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          style={{
            flex: 1, padding: '6px 4px', background: 'transparent',
            border: 'none', color: 'var(--text-primary)', fontSize: '14px', outline: 'none'
          }}
        />
        <button
          onClick={send}
          disabled={loading || !question.trim()}
          style={{
            width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
            background: loading || !question.trim() ? 'var(--bg-tertiary)' : 'var(--accent)',
            border: 'none', cursor: loading || !question.trim() ? 'not-allowed' : 'pointer',
            color: loading || !question.trim() ? 'var(--text-tertiary)' : '#fff',
            fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: `all 0.2s cubic-bezier(0.4,0,0.2,1)`
          }}
        >↑</button>
      </div>
    </div>
  )
}