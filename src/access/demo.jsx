/* eslint-disable react-refresh/only-export-components -- entry file, nothing imports it */
import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AccessibleOnboarding, PartnerRegister, CareerGateway, AccessShell } from './index'
import { getOutbox } from './store'

const TABS = [
  ['signup', 'Sign up and profile'],
  ['partner', 'Partner registers a learner'],
  ['careers', 'Career gateway'],
  ['outbox', 'SMS outbox (demo)'],
]

function Outbox() {
  const [box, setBox] = useState(getOutbox)
  return (
    <section>
      <h2>SMS outbox (demo)</h2>
      <p>No SMS service is connected, so messages that would be texted appear here.</p>
      <button type="button" className="ax-btn" onClick={() => setBox(getOutbox())}>Refresh</button>
      <ul>
        {box.map((m, i) => (
          <li key={i}><strong>{m.to}</strong>: {m.body}</li>
        ))}
      </ul>
    </section>
  )
}

function Demo() {
  const [tab, setTab] = useState('signup')
  return (
    <AccessShell paintPage>
      <nav className="ax-row" aria-label="Demo sections">
        {TABS.map(([id, name]) => (
          <button key={id} type="button" className="ax-btn ax-btn-small" aria-pressed={tab === id} onClick={() => setTab(id)}>{name}</button>
        ))}
      </nav>
      <main>
        {tab === 'signup' && <AccessibleOnboarding onComplete={() => setTab('careers')} />}
        {tab === 'partner' && <PartnerRegister />}
        {tab === 'careers' && <CareerGateway />}
        {tab === 'outbox' && <Outbox />}
      </main>
    </AccessShell>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Demo />
  </StrictMode>,
)
