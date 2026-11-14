import { useState } from 'react'
import { MdMic, MdStop, MdCheck, MdClose } from 'react-icons/md'
import { useAccess } from '../context'
import { useListen } from '../voice'

// Voice on every field. What was heard goes into an editable box first; nothing is applied until
// the person presses "Use this answer".
export default function VoiceInput({ onApply }) {
  const { lang, tr } = useAccess()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [note, setNote] = useState('')
  const { supported, listening, error, start, stop } = useListen(lang)

  const begin = () => {
    setOpen(true)
    setNote('')
    start(setText)
  }
  const close = () => {
    stop()
    setOpen(false)
    setText('')
    setNote('')
  }
  const accept = () => {
    stop()
    const r = onApply(text)
    if (r.ok) close()
    else setNote(r.message)
  }

  let status
  if (!supported) status = tr('voiceUnsupported')
  else if (error === 'not-allowed' || error === 'service-not-allowed') status = tr('voiceDenied')
  else if (error === 'no-speech') status = tr('voiceNoSpeech')
  else if (error && error !== 'aborted') status = tr('voiceError')
  else if (listening) status = tr('listening')
  else status = tr('stopped')

  if (!open) {
    return (
      <button type="button" className="ax-btn ax-btn-ghost" onClick={begin}>
        <MdMic aria-hidden="true" /> {tr('voiceStart')}
      </button>
    )
  }
  return (
    <div className="ax-voice" role="group" aria-label={tr('voiceTitle')}>
      <p className="ax-voice-status" aria-live="polite">{status}</p>
      <label className="ax-label-small">
        {tr('heard')}
        <textarea
          className="ax-input"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={stop}
          spellCheck={false}
        />
      </label>
      {note && <p className="ax-error" role="alert">{note}</p>}
      <div className="ax-row">
        {listening ? (
          <button type="button" className="ax-btn" onClick={stop}><MdStop aria-hidden="true" /> {tr('stop')}</button>
        ) : (
          supported && <button type="button" className="ax-btn" onClick={begin}><MdMic aria-hidden="true" /> {tr('speakAgain')}</button>
        )}
        <button type="button" className="ax-btn ax-btn-primary" onClick={accept}><MdCheck aria-hidden="true" /> {tr('useThis')}</button>
        <button type="button" className="ax-btn ax-btn-ghost" onClick={close}><MdClose aria-hidden="true" /> {tr('cancel')}</button>
      </div>
      <p className="ax-hint">{tr('voicePrivacy')}</p>
    </div>
  )
}
