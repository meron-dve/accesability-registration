import { useState } from 'react'
import { MdSave, MdSms, MdClose } from 'react-icons/md'
import { useAccess } from '../context'
import { createResume } from '../store'

// Answers are autosaved already; this adds a resume link that can be texted to any phone.
export default function SaveLater({ formId, answers, stepId, defaultPhone, onToken }) {
  const { tr } = useAccess()
  const [open, setOpen] = useState(false)
  const [phone, setPhone] = useState(defaultPhone || '')
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  const send = async (e) => {
    e.preventDefault()
    setBusy(true)
    setFailed(false)
    try {
      const r = await createResume({ formId, answers, stepId, phone: phone.trim() })
      onToken?.(r.token)
      setResult({ ...r, to: phone.trim() })
    } catch {
      setFailed(true)
    }
    setBusy(false)
  }

  if (!open) {
    return (
      <button type="button" className="ax-btn ax-btn-ghost" onClick={() => setOpen(true)}>
        <MdSave aria-hidden="true" /> {tr('saveLater')}
      </button>
    )
  }
  return (
    <form className="ax-panel" onSubmit={send} aria-label={tr('saveTitle')}>
      <h3 className="ax-panel-title">{tr('saveTitle')}</h3>
      <p className="ax-hint">{tr('saveBody')}</p>
      <label className="ax-label-small">
        {tr('savePhone')}
        <input className="ax-input" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </label>
      {failed && <p className="ax-error" role="alert">{tr('sendFailed')}</p>}
      {result && (
        <div aria-live="polite">
          <p>{result.sms?.delivered ? tr('saveSent', { to: result.to }) : tr('saveDemo')}</p>
          {!result.sms?.delivered && <p><a href={result.link} className="ax-link">{result.link}</a></p>}
          <button type="button" className="ax-btn ax-btn-ghost" onClick={() => navigator.clipboard?.writeText(result.link)}>
            {tr('saveCopy')}
          </button>
        </div>
      )}
      <div className="ax-row">
        <button type="submit" className="ax-btn ax-btn-primary" disabled={busy || phone.replace(/\D/g, '').length < 9}>
          <MdSms aria-hidden="true" /> {tr('saveSend')}
        </button>
        <button type="button" className="ax-btn ax-btn-ghost" onClick={() => setOpen(false)}>
          <MdClose aria-hidden="true" /> {tr('close')}
        </button>
      </div>
    </form>
  )
}
