import { useState, useEffect } from 'react'
import Upload from './components/Upload'
import Chat from './components/Chat'
import Documents from './components/Documents'
import './index.css'

type Tab = 'chat' | 'upload' | 'documents'

const NAV = [
  { id: 'upload' as Tab, label: 'Upload', icon: '↑' },
  { id: 'chat' as Tab, label: 'Ask FinSight', icon: '◎' },
  { id: 'documents' as Tab, label: 'Documents', icon: '⊟' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('upload')
  const [refreshDocs, setRefreshDocs] = useState(0)
  const [dark, setDark] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  const sidebarW = collapsed ? '64px' : '256px'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Sidebar */}
      <aside style={{
        width: sidebarW, minHeight: '100vh', flexShrink: 0,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: collapsed ? '20px 10px' : '24px 14px',
        position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50,
        transition: `width 0.35s cubic-bezier(0.4,0,0.2,1)`,
        overflow: 'hidden'
      }}>

        {/* Logo row */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          marginBottom: '28px', gap: '10px'
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '9px',
                background: 'var(--accent)', display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <text
                    x="1" y="14"
                    fontFamily="Instrument Serif, Georgia, serif"
                    fontSize="16"
                    fontStyle="italic"
                    fill="white"
                    letterSpacing="-0.5"
                  >F</text>
                </svg>
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{
                  fontFamily: 'Instrument Serif, serif', fontSize: '16px',
                  color: 'var(--text-primary)', whiteSpace: 'nowrap'
                }}>FinSight</p>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                  Financial Intelligence
                </p>
              </div>
            </div>
          )}

          {/* Collapsed logo */}
          {collapsed && (
            <div style={{
              width: '32px', height: '32px', borderRadius: '9px',
              background: 'var(--accent)', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <text
                  x="1" y="14"
                  fontFamily="Instrument Serif, Georgia, serif"
                  fontSize="16"
                  fontStyle="italic"
                  fill="white"
                  letterSpacing="-0.5"
                >F</text>
              </svg>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={() => setCollapsed(c => !c)}
              style={{
                width: '28px', height: '28px', borderRadius: '7px',
                background: 'transparent', border: '1px solid var(--border)',
                cursor: 'pointer', color: 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', flexShrink: 0
              }}
              title="Collapse sidebar"
            >←</button>
          )}
        </div>

        {/* Collapsed expand button */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            style={{
              width: '28px', height: '28px', borderRadius: '7px',
              background: 'transparent', border: '1px solid var(--border)',
              cursor: 'pointer', color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', margin: '0 auto 16px'
            }}
            title="Expand sidebar"
          >→</button>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV.map(item => {
            const active = tab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: '10px', padding: collapsed ? '10px' : '9px 12px',
                  borderRadius: 'var(--radius-sm)', border: 'none',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  background: active ? 'var(--bg-tertiary)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: '13.5px', fontWeight: active ? 500 : 400,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  boxShadow: active ? 'var(--shadow-sm)' : 'none',
                }}
              >
                <span style={{ fontSize: '15px', flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Dark mode toggle */}
        <div style={{ display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end' }}>
          <button
            onClick={() => setDark(d => !d)}
            title={dark ? 'Switch to light' : 'Switch to dark'}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              border: '1px solid var(--border)',
              background: 'var(--bg-tertiary)',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
              transition: `all 0.4s cubic-bezier(0.4,0,0.2,1)`
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              {dark ? (
                <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
                  fill="var(--text-secondary)" />
              ) : (
                <>
                  <circle cx="12" cy="12" r="5" fill="var(--text-secondary)" />
                  <line x1="12" y1="1" x2="12" y2="3" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" />
                  <line x1="12" y1="21" x2="12" y2="23" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" />
                  <line x1="1" y1="12" x2="3" y2="12" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" />
                  <line x1="21" y1="12" x2="23" y2="12" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{
        marginLeft: sidebarW, flex: 1, padding: '48px 56px',
        transition: `margin-left 0.35s cubic-bezier(0.4,0,0.2,1)`,
        minHeight: '100vh'
      }}>
        {tab === 'upload' && (
          <Upload onUploaded={() => { setRefreshDocs(r => r + 1); setTab('chat') }} />
        )}
        {tab === 'chat' && <Chat />}
        {tab === 'documents' && <Documents refresh={refreshDocs} />}
      </main>
    </div>
  )
}