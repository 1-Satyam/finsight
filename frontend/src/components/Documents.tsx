import { useEffect, useState } from 'react'
import axios from 'axios'

import API from '../config'
interface Doc { filename: string; company: string; year: string }
interface Props { refresh: number }

export default function Documents({ refresh }: Props) {
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchDocs = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/documents`)
      setDocs(res.data.documents)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchDocs() }, [refresh])

  const deleteDoc = async (filename: string) => {
    if (!window.confirm(`Remove "${filename}" from the knowledge base?`)) return
    setDeleting(filename)
    try {
      await axios.delete(`${API}/documents/${encodeURIComponent(filename)}`)
      setDocs(prev => prev.filter(d => d.filename !== filename))
    } catch (e) { console.error(e) }
    finally { setDeleting(null) }
  }

  return (
    <div style={{ maxWidth: '600px' }}>
      <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
        Knowledge Base
      </p>
      <h1 style={{ fontSize: '32px', color: 'var(--text-primary)', marginBottom: '6px' }}>
        Documents
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
        {loading ? 'Loading…' : `${docs.length} document${docs.length !== 1 ? 's' : ''} indexed`}
      </p>

      {!loading && docs.length === 0 && (
        <div style={{
          padding: '48px 40px', textAlign: 'center',
          background: 'var(--bg-secondary)', borderRadius: 'var(--radius)',
          border: '1px solid var(--border)'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.3" style={{ margin: '0 auto 12px', display: 'block' }}>
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
          </svg>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>No documents yet</p>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginTop: '4px' }}>Upload a financial PDF to populate the knowledge base</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {docs.map(doc => (
          <div key={doc.filename} style={{
            padding: '14px 18px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: '16px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
                background: 'var(--accent-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {doc.filename}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  {doc.company !== 'Unknown' ? doc.company : '—'} · {doc.year || '—'}
                </p>
              </div>
            </div>
            <button
              onClick={() => deleteDoc(doc.filename)}
              disabled={deleting === doc.filename}
              style={{
                padding: '6px 14px', background: 'transparent',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                color: 'var(--text-tertiary)', cursor: 'pointer',
                fontSize: '12px', flexShrink: 0,
                transition: `all 0.15s`
              }}
              onMouseEnter={e => {
                (e.currentTarget).style.borderColor = 'var(--danger)'
                ;(e.currentTarget).style.color = 'var(--danger)'
                ;(e.currentTarget).style.background = 'var(--danger-light)'
              }}
              onMouseLeave={e => {
                (e.currentTarget).style.borderColor = 'var(--border)'
                ;(e.currentTarget).style.color = 'var(--text-tertiary)'
                ;(e.currentTarget).style.background = 'transparent'
              }}
            >
              {deleting === doc.filename ? 'Removing…' : 'Remove'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}