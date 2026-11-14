import { useEffect, useRef, useState } from 'react'
import { MdContrast, MdRemove, MdAdd, MdVolumeUp } from 'react-icons/md'
import './access.css'
import { AccessContext, useAccess } from './context'
import { translate } from './translation helper'
import { store, saveSupport } from './store'
import { supportRequestSchema } from './schemas'
import FormEngine from './engine/FormEngine'

// Zoom steps, as a percentage of the normal 18px text.
const ZOOMS = [100, 125, 150, 175, 200]

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
// paintPage: when high contrast is on, also colour the whole page behind the form.
export default function AccessShell({ children, className = '', paintPage = false }) {
  const outer = useAccess()
  const [prefs, setPrefs] = useState(() => ({ simple: false, zoom: 100, contrast: false, ...store.get('prefs'), lang: 'en' }))
  const [supportOpen, setSupportOpen] = useState(0)
  const [zoomToast, setZoomToast] = useState(false)
  const dialogRef = useRef(null)
  const toastTimer = useRef(null)
  const pageHc = !outer.inShell && paintPage && prefs.contrast

  useEffect(() => {
    if (!pageHc) return
    document.documentElement.classList.add('ax-page-hc')
    return () => document.documentElement.classList.remove('ax-page-hc')
  }, [pageHc])

  if (outer.inShell) return children

  const set = (patch) => {
    const next = { ...prefs, ...patch }
    setPrefs(next)
    store.set('prefs', next)
  }
  const setZoom = (zoom) => {
    set({ zoom })
    setZoomToast(true)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setZoomToast(false), 1500)
  }
  const zoomIdx = Math.max(0, ZOOMS.indexOf(prefs.zoom))
  const tr = (k, v) => translate(prefs.lang, k, v)
  const openSupport = () => {
    setSupportOpen((n) => n + 1)
    dialogRef.current?.showModal()
  }
  const value = { inShell: true, lang: prefs.lang, simple: prefs.simple, tr, openSupport, prefs, setPrefs: set }

  return (
    <AccessContext.Provider value={value}>
      <div
        lang={prefs.lang}
        className={`ax${prefs.contrast ? ' ax-hc' : ''}${prefs.simple ? ' ax-simple' : ''} ${className}`}
        style={{ fontSize: `${(18 * ZOOMS[zoomIdx]) / 100}px` }}
      >
       <div className="ax-inner">
        <div className="ax-zoomnote" role="status" aria-live="polite">
          {zoomToast && <span className="ax-toast">{tr('zoom')} {ZOOMS[zoomIdx]}%</span>}
        </div>
        <div className="ax-prefs" role="group" aria-label={tr('prefs')}>
          <div className="ax-row" role="group" aria-label={tr('textSize')}>
            <button type="button" className="ax-btn ax-btn-small" onClick={() => setZoom(ZOOMS[zoomIdx - 1])} disabled={zoomIdx === 0}>
              <MdRemove aria-hidden="true" /><span className="ax-sr">{tr('smaller')}</span>
            </button>
            <button type="button" className="ax-btn ax-btn-small ax-zoom" onClick={() => setZoom(100)} aria-label={`${tr('zoom')} ${ZOOMS[zoomIdx]}%. ${tr('zoomReset')}`}>
              {ZOOMS[zoomIdx]}%
            </button>
            <button type="button" className="ax-btn ax-btn-small" onClick={() => setZoom(ZOOMS[zoomIdx + 1])} disabled={zoomIdx === ZOOMS.length - 1}>
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
      </div>
    </AccessContext.Provider>
  )
}
