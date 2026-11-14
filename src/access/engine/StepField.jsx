import { useAccess } from '../context'
import { pick } from '../translation helper'

// Renders one question. The question text is the real <label>/<legend>, so screen readers announce it.
export default function StepField({ step, value, onChange, error, qid }) {
  const { lang, simple, tr } = useAccess()
  const label = pick(step.label, lang, simple)
  const hint = step.hint ? pick(step.hint, lang, simple) : ''
  const hintId = `${qid}-hint`
  const errId = `${qid}-err`
  const describedBy = [hint && hintId, error && errId].filter(Boolean).join(' ') || undefined
  const Icon = step.icon

  const head = (
    <>
      {Icon && <Icon className="ax-qicon" aria-hidden="true" />}
      <span className="ax-q">
        {label}
        {!step.required && step.type !== 'info' && <span className="ax-opt"> {tr('optional')}</span>}
      </span>
    </>
  )
  const notes = (
    <>
      {hint && <p id={hintId} className="ax-hint">{hint}</p>}
      {error && <p id={errId} className="ax-error" role="alert">{error}</p>}
    </>
  )

  if (step.type === 'info') {
    const body = [].concat(pick(step.body, lang, simple))
    return (
      <div>
        <h3 className="ax-q" tabIndex={-1} data-focus-heading>{head}</h3>
        {body.map((p, i) => <p key={i} className="ax-hint">{p}</p>)}
      </div>
    )
  }

  if (step.type === 'choice' || step.type === 'multi') {
    const multi = step.type === 'multi'
    const selected = multi ? value || [] : value
    const toggle = (v) => {
      if (!multi) return onChange(v)
      onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v])
    }
    return (
      <fieldset className="ax-fieldset" aria-describedby={describedBy} aria-required={step.required || undefined}>
        <legend className="ax-legend">{head}</legend>
        {notes}
        <div className="ax-cards">
          {step.options.map((o) => {
            const OIcon = o.icon
            const checked = multi ? selected.includes(o.value) : selected === o.value
            return (
              <label key={o.value} className={`ax-card${checked ? ' is-on' : ''}`}>
                <input
                  type={multi ? 'checkbox' : 'radio'}
                  name={qid}
                  value={o.value}
                  checked={checked}
                  onChange={() => toggle(o.value)}
                  data-autofocus
                />
                {OIcon && <OIcon className="ax-cardicon" aria-hidden="true" />}
                <span>{pick(o.label, lang, simple)}</span>
              </label>
            )
          })}
        </div>
      </fieldset>
    )
  }

  const common = {
    id: qid,
    value: value ?? '',
    onChange: (e) => onChange(e.target.value),
    'aria-describedby': describedBy,
    'aria-invalid': error ? true : undefined,
    'aria-required': step.required || undefined,
    autoComplete: step.autoComplete,
    'data-autofocus': true,
  }
  return (
    <div>
      <label htmlFor={qid} className="ax-label">{head}</label>
      {notes}
      {step.type === 'textarea' ? (
        <textarea className="ax-input" rows={5} {...common} />
      ) : (
        <input
          className="ax-input"
          type={step.type === 'tel' ? 'tel' : 'text'}
          inputMode={step.type === 'tel' ? 'tel' : undefined}
          {...common}
        />
      )}
    </div>
  )
}
