import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'

import API from '../config'
interface Props { onUploaded: () => void }

export default function Upload({ onUploaded }: Props) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file) return
    setStatus('uploading')
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await axios.post(`${API}/upload`, fd)
      setResult(res.data)
      setStatus('success')
      setTimeout(onUploaded, 2200)
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Upload failed')
      setStatus('error')
    }
  }, [onUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, multiple: false
  })

  return (
    <div style={{ maxWidth: '600px' }}>
      <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
        Document Ingestion
      </p>
      <h1 style={{ fontSize: '32px', color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '8px' }}>
        Upload Financial Report
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '36px', lineHeight: 1.6 }}>
        10-K filings, annual reports, earnings statements. Once ingested, query with natural language.
      </p>

      <div {...getRootProps()} style={{
        border: `1.5px dashed ${isDragActive ? 'var(--accent)' : 'var(--border-hover)'}`,
        borderRadius: 'var(--radius)',
        padding: '52px 40px', textAlign: 'center', cursor: 'pointer',
        background: isDragActive ? 'var(--accent-light)' : 'var(--bg-secondary)',
        boxShadow: isDragActive ? `0 0 0 4px var(--accent-light)` : 'none',
        transition: `all 0.25s cubic-bezier(0.4,0,0.2,1)`
      }}>
        <input {...getInputProps()} />
        <div style={{
          width: '44px', height: '44px', borderRadius: '10px',
          background: 'var(--accent-light)', margin: '0 auto 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <polyline points="9,15 12,12 15,15" />
          </svg>
        </div>
        <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '5px' }}>
          {isDragActive ? 'Release to upload' : 'Drop PDF here, or click to browse'}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>PDF only · Max recommended 200 pages</p>
      </div>

      {status === 'uploading' && (
        <div style={{
          marginTop: '18px', padding: '14px 18px',
          background: 'var(--accent-light)', borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--accent)', display: 'flex', gap: '12px', alignItems: 'center'
        }}>
          <div style={{
            width: '14px', height: '14px', border: '2px solid var(--accent)',
            borderTopColor: 'transparent', borderRadius: '50%',
            animation: 'spin 0.7s linear infinite', flexShrink: 0
          }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ fontSize: '13.5px', color: 'var(--accent)' }}>
            Parsing · chunking · embedding into vector store…
          </p>
        </div>
      )}

      {status === 'success' && result && (
        <div style={{
          marginTop: '18px', padding: '20px',
          background: 'var(--bg-secondary)', borderRadius: 'var(--radius)',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)'
        }}>
          <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 500, marginBottom: '14px', letterSpacing: '0.04em' }}>
            ✓ INGESTION COMPLETE
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Filename', value: result.filename },
              { label: 'Pages parsed', value: result.pages },
              { label: 'Chunks stored', value: result.chunks_stored }
            ].map(item => (
              <div key={item.label} style={{
                padding: '12px 14px', background: 'var(--bg)',
                borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)'
              }}>
                <p style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '5px' }}>{item.label}</p>
                <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', wordBreak: 'break-all', fontVariantNumeric: 'tabular-nums' }}>{item.value}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '14px' }}>Redirecting to chat…</p>
        </div>
      )}

      {status === 'error' && (
        <div style={{
          marginTop: '18px', padding: '14px 18px',
          background: 'var(--danger-light)', borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--danger)'
        }}>
          <p style={{ fontSize: '13.5px', color: 'var(--danger)' }}>✕  {error}</p>
        </div>
      )}
    </div>
  )
}