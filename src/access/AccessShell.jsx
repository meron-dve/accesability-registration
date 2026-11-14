import { useRef, useState } from 'react'
import { MdContrast, MdRemove, MdAdd, MdVolumeUp } from 'react-icons/md'
import './access.css'
import { AccessContext, useAccess } from './context'
import { translate } from './translation helper'
import { store, saveSupport } from './store'
import { supportRequestSchema } from './schemas'
import FormEngine from './engine/FormEngine'

const SIZES = ['ax-s0', 'ax-s1', 'ax-s2', 'ax-s3']

function SupportDialog({ dialogRef, openCount, onClose }) {
  const { tr } = useAccess()
  return (
    <dialog ref={dialogRef} className="ax-dialog" onClose={onClose} aria-label={tr('supportTitle')}>
      {openCount > 0 && <FormEngine
        key={openCount}
        schema={supportRequestSchema}
        showSupportButton={false}
        onSubmit={async (a) => {
          saveSupport({ needs: a.support, note: a.note, replyVia: a.replyVia, phone: a.phone, requested: true })
        }}
        doneContent={() => (
          <>
            <p>{tr('supportDone')}</p>
            <button type="button" className="ax-btn ax-btn-primary" onClick={() => dialogRef.current?.close()}>{tr('close')}</button>
          </>
        )}
      />}
      <button type="button" className="ax-btn ax-btn-ghost ax-dialog-close" onClick={() => dialogRef.current?.close()}>{tr('close')}</button>
    </dialog>
  )
}

// Provides language, simple mode, text size and contrast, and the private-support dialog.
// Components wrap themselves in this; nested uses reuse the outer one.
export default function AccessShell({ children, className = '' }) {
  const outer = useAccess()
  const [prefs, setPrefs] = useState(() => ({ simple: false, size: 1, contrast: false, ...store.get('prefs'), lang: 'en' }))
  const [supportOpen, setSupportOpen] = useState(0)
  const dialogRef = useRef(null)

  if (outer.inShell) return children

  const set = (patch) => {
    const next = { ...prefs, ...patch }
    setPrefs(next)
    store.set('prefs', next)
  }
  const tr = (k, v) => translate(prefs.lang, k, v)
  const openSupport = () => {
    setSupportOpen((n) => n + 1)
    dialogRef.current?.showModal()
  }
  const value = { inShell: true, lang: prefs.lang, simple: prefs.simple, tr, openSupport, prefs, setPrefs: set }

  return (
    <AccessContext.Provider value={value}>
      <div lang={prefs.lang} className={`ax ${SIZES[prefs.size]}${prefs.contrast ? ' ax-hc' : ''}${prefs.simple ? ' ax-simple' : ''} ${className}`}>
        <div className="ax-prefs" role="group" aria-label={tr('prefs')}>
          <div className="ax-row" role="group" aria-label={tr('textSize')}>
            <button type="button" className="ax-btn ax-btn-small" onClick={() => set({ size: Math.max(0, prefs.size - 1) })} disabled={prefs.size === 0}>
              <MdRemove aria-hidden="true" /><span className="ax-sr">{tr('smaller')}</span>
            </button>
            <span aria-hidden="true">Aa</span>
            <button type="button" className="ax-btn ax-btn-small" onClick={() => set({ size: Math.min(3, prefs.size + 1) })} disabled={prefs.size === 3}>
              <MdAdd aria-hidden="true" /><span className="ax-sr">{tr('larger')}</span>
            </button>
          </div>
          <button type="button" className="ax-btn ax-btn-small" aria-pressed={prefs.contrast} onClick={() => set({ contrast: !prefs.contrast })}>
            <MdContrast aria-hidden="true" /> {tr('contrast')}
          </button>
          <button type="button" className="ax-btn ax-btn-small" aria-pressed={prefs.simple} onClick={() => set({ simple: !prefs.simple })}>
            <MdVolumeUp aria-hidden="true" /> {tr('simpleMode')}
          </button>
        </div>
        {children}
        <SupportDialog dialogRef={dialogRef} openCount={supportOpen} onClose={() => {}} />
      </div>
    </AccessContext.Provider>
  )
}
