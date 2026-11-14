import { useEffect, useId, useRef, useState } from 'react'
import { MdArrowBack, MdArrowForward, MdEdit, MdLock, MdVolumeUp, MdCheck, MdHelp } from 'react-icons/md'
import { useAccess } from '../context'
import { pick } from '../translation helper'
import { store, saveDraft, dropResume } from '../store'
import { speak, stopSpeaking } from '../voice'
import { validateStep, isEmpty } from './validate'
import { applyVoice } from './voiceApply'
import StepField from './StepField'
import VoiceInput from './VoiceInput'
import SaveLater from './SaveLater'

/*
 * One question per screen, no timers, autosave on every change, review before sending.
 * schema = { id, title, steps: [{ id, type, label, hint, required, options, showIf, icon,
 *            private, validate, mustBe }] }   type: text | tel | textarea | choice | multi | info
 */
export default function FormEngine({
  schema,
  formId = schema.id,
  initialAnswers,
  resume,
  startAtReview = false,
  onSubmit,
  doneContent,
  submitLabel,
  showSupportButton = true,
}) {
  const { lang, simple, tr, openSupport } = useAccess()
  const uid = useId()
  const rootRef = useRef(null)
  const firstRun = useRef(true)

  const [state, setState] = useState(() => {
    const saved = resume ?? store.get(`draft:${formId}`)
    return {
      answers: { ...initialAnswers, ...saved?.answers },
      stepId: saved?.stepId ?? null,
      review: startAtReview,
      returnToReview: startAtReview,
      resumeToken: saved?.resumeToken ?? null,
    }
  })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('filling') // filling | submitting | done
  const [submitError, setSubmitError] = useState(false)
  const [result, setResult] = useState(null)

  const { answers, review } = state
  const visible = schema.steps.filter((s) => !s.showIf || s.showIf(answers))
  const step = visible.find((s) => s.id === state.stepId) ?? visible[0]
  const idx = visible.indexOf(step)
  const qid = `${uid}-${step.id}`
  const asked = visible.filter((s) => s.type !== 'info')

  const commit = (next) => {
    setState(next)
    saveDraft(formId, { answers: next.answers, stepId: next.stepId, resumeToken: next.resumeToken })
  }
  const label = (s) => pick(s.label, lang, simple)
  const optionLabel = (s, v) => pick(s.options?.find((o) => o.value === v)?.label, lang, simple) || v
  const show = (s, v) =>
    isEmpty(v) ? tr('skipped') : Array.isArray(v) ? v.map((x) => optionLabel(s, x)).join(', ') : s.options ? optionLabel(s, v) : v

  const setValue = (id, v) => {
    setErrors({})
    commit({ ...state, stepId: step.id, answers: { ...answers, [id]: v } })
  }

  const readOut = () => {
    const opts = step.options?.map((o) => pick(o.label, lang, simple)).join('. ')
    const body = step.type === 'info' ? [].concat(pick(step.body, lang, simple)).join(' ') : ''
    speak([label(step), body, step.hint && pick(step.hint, lang, simple), opts && `${tr('options')}: ${opts}`].filter(Boolean).join('. '), lang)
  }
  const readAnswers = () => speak(asked.map((s) => `${label(s)}. ${show(s, answers[s.id])}`).join('. '), lang)

  // Move focus to the new question; in simple mode read it aloud. Skipped on first paint so an
  // embedded form does not steal focus from the page.
  useEffect(() => {
    if (!firstRun.current) {
      const root = rootRef.current
      const el = root?.querySelector('[data-autofocus]:checked') || root?.querySelector('[data-autofocus]') || root?.querySelector('[data-focus-heading]') || root?.querySelector('[data-view-heading]')
      el?.focus()
    }
    if (simple && status === 'filling' && !review) readOut()
    firstRun.current = false
    return stopSpeaking
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id, review, status])

  const advance = (nextAnswers) => {
    const nextStep = visible[idx + 1]
    if (state.returnToReview || !nextStep) {
      commit({ ...state, answers: nextAnswers, review: true, returnToReview: false })
    } else {
      commit({ ...state, answers: nextAnswers, stepId: nextStep.id })
    }
  }
  const next = () => {
    const err = validateStep(step, answers[step.id], answers, tr, lang, simple)
    if (err) return setErrors({ [step.id]: err })
    setErrors({})
    advance(answers)
  }
  const skip = () => {
    setErrors({})
    advance({ ...answers, [step.id]: '' })
  }
  const back = () => {
    setErrors({})
    if (review) commit({ ...state, review: false, stepId: visible[visible.length - 1].id })
    else if (idx > 0) commit({ ...state, stepId: visible[idx - 1].id })
  }
  const edit = (id) => {
    setErrors({})
    commit({ ...state, review: false, returnToReview: true, stepId: id })
  }

  const send = async () => {
    for (const s of visible) {
      const err = validateStep(s, answers[s.id], answers, tr, lang, simple)
      if (err) {
        setErrors({ [s.id]: err })
        commit({ ...state, review: false, returnToReview: true, stepId: s.id })
        return
      }
    }
    setStatus('submitting')
    setSubmitError(false)
    try {
      const shown = Object.fromEntries(visible.map((s) => [s.id, answers[s.id]]))
      setResult(await onSubmit?.(shown, { schema, visible }))
      store.remove(`draft:${formId}`)
      dropResume(state.resumeToken)
      setStatus('done')
    } catch {
      setSubmitError(true)
      setStatus('filling')
    }
  }
  const startOver = () => {
    store.remove(`draft:${formId}`)
    dropResume(state.resumeToken)
    setErrors({})
    setStatus('filling')
    setState({ answers: { ...initialAnswers }, stepId: null, review: false, returnToReview: false, resumeToken: null })
  }

  const title = pick(schema.title, lang, simple)

  if (status === 'done') {
    return (
      <section className="ax-engine" ref={rootRef}>
        <h2 className="ax-title" tabIndex={-1} data-view-heading>{tr('doneTitle')}</h2>
        {doneContent?.({ result, answers, reset: startOver })}
      </section>
    )
  }

  return (
    <section className="ax-engine" ref={rootRef} aria-label={title}>
      <h2 className="ax-title">{title}</h2>
      <p className="ax-hint">{tr('noTimer')}</p>

      {review ? (
        <div>
          <h3 className="ax-q" tabIndex={-1} data-view-heading>{tr('reviewTitle')}</h3>
          <p className="ax-hint">{tr('reviewHint')}</p>
          <ol className="ax-review">
            {asked.map((s) => (
              <li key={s.id}>
                <div>
                  <strong>{label(s)}</strong>
                  <div>{show(s, answers[s.id])}</div>
                  {s.private && <small className="ax-private"><MdLock aria-hidden="true" /> {tr('privateNote')}</small>}
                </div>
                <button type="button" className="ax-btn ax-btn-ghost" onClick={() => edit(s.id)}>
                  <MdEdit aria-hidden="true" /> {tr('change')}<span className="ax-sr"> — {label(s)}</span>
                </button>
              </li>
            ))}
          </ol>
          {submitError && <p className="ax-error" role="alert">{tr('sendFailed')}</p>}
          <div className="ax-row">
            <button type="button" className="ax-btn" onClick={back}><MdArrowBack aria-hidden="true" /> {tr('back')}</button>
            <button type="button" className="ax-btn ax-btn-ghost" onClick={readAnswers}><MdVolumeUp aria-hidden="true" /> {tr('readAll')}</button>
            <button type="button" className="ax-btn ax-btn-primary" onClick={send} disabled={status === 'submitting'} aria-busy={status === 'submitting'}>
              <MdCheck aria-hidden="true" /> {status === 'submitting' ? tr('sending') : submitLabel || tr('send')}
            </button>
          </div>
        </div>
      ) : (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            next()
          }}
        >
          <p className="ax-progress" aria-live="polite">
            {tr('questionOf', { n: Math.max(1, asked.indexOf(step) + 1), total: asked.length })}
          </p>
          <progress className="ax-bar" max={asked.length} value={Math.max(1, asked.indexOf(step) + 1)} aria-hidden="true" />
          <StepField
            step={step}
            qid={qid}
            value={answers[step.id]}
            error={errors[step.id]}
            onChange={(v) => setValue(step.id, v)}
          />
          {step.private && <p className="ax-private"><MdLock aria-hidden="true" /> {tr('privateNote')}</p>}
          <div className="ax-row ax-tools">
            <button type="button" className="ax-btn ax-btn-ghost" onClick={readOut}>
              <MdVolumeUp aria-hidden="true" /> {tr('readAloud')}
            </button>
            {step.type !== 'info' && (
              <VoiceInput
                key={step.id}
                onApply={(text) => {
                  const r = applyVoice(step, text, answers[step.id], tr, lang, simple)
                  if (r.ok) setValue(step.id, r.value)
                  return r
                }}
              />
            )}
          </div>
          <div className="ax-row ax-nav">
            {idx > 0 && (
              <button type="button" className="ax-btn" onClick={back}><MdArrowBack aria-hidden="true" /> {tr('back')}</button>
            )}
            {!step.required && step.type !== 'info' && (
              <button type="button" className="ax-btn ax-btn-ghost" onClick={skip}>{tr('skip')}</button>
            )}
            <button type="submit" className="ax-btn ax-btn-primary">
              {idx === visible.length - 1 ? tr('review') : tr('next')} <MdArrowForward aria-hidden="true" />
            </button>
          </div>
        </form>
      )}

      <div className="ax-row ax-foot">
        <SaveLater
          formId={formId}
          answers={answers}
          stepId={step.id}
          defaultPhone={answers.phone || answers.learnerPhone}
          onToken={(t) => commit({ ...state, resumeToken: t })}
        />
        {showSupportButton && openSupport && (
          <button type="button" className="ax-btn ax-btn-ghost" onClick={openSupport}>
            <MdHelp aria-hidden="true" /> {tr('askSupport')}
          </button>
        )}
        {(Object.keys(answers).length > 0 || state.stepId) && (
          <button type="button" className="ax-btn ax-btn-ghost" onClick={startOver}>{tr('startOver')}</button>
        )}
      </div>
    </section>
  )
}
