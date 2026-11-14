import { useMemo, useState } from 'react'
import { MdLock, MdWork, MdBusiness, MdArrowBack, MdCheck } from 'react-icons/md'
import AccessShell from './AccessShell'
import FormEngine from './engine/FormEngine'
import { useAccess } from './context'
import { pick } from './translation helper'
import { buildApplicationSchema, employerSchema } from './schemas'
import { SUPPORT, supportShort } from './vocab'
import { getJobs, matchJobs } from './jobs'
import { addApplication, addJob, getProfile, getSupport, saveSupport } from './store'

const T = {
  find: { en: 'Find a job' },
  post: { en: 'Post a job (employers)' },
  filterTitle: { en: 'Support I need' },
  filterHint: {
    en: 'Private. This stays on your device. Employers never see it, and we never ask why.' },
  onlyAll: { en: 'Only show jobs that offer everything I picked' },
  offers: { en: 'This job offers' },
  matchAll: { en: 'Offers everything you picked' },
  missing: { en: 'Does not list' },
  apply: { en: 'Apply' },
  none: { en: 'No jobs match yet. Turn off the filter or pick less.' },
  backToJobs: { en: 'Back to jobs' },
  applied: { en: 'Your application was sent. The employer sees only what you chose to share.' },
  posted: { en: 'Your job is listed with the support you offer.' },
  seeJobs: { en: 'See the job list' } }

function JobFilter({ needs, setNeeds, onlyAll, setOnlyAll }) {
  const { lang, simple } = useAccess()
  const t = (k) => pick(T[k], lang, simple)
  const toggle = (v) => {
    const next = needs.includes(v) ? needs.filter((x) => x !== v) : [...needs, v]
    setNeeds(next)
    saveSupport({ needs: next })
  }
  return (
    <fieldset className="ax-panel ax-fieldset">
      <legend className="ax-panel-title"><MdLock aria-hidden="true" /> {t('filterTitle')}</legend>
      <p className="ax-hint">{t('filterHint')}</p>
      <div className="ax-cards">
        {SUPPORT.map((s) => {
          const Icon = s.icon
          const on = needs.includes(s.value)
          return (
            <label key={s.value} className={`ax-card${on ? ' is-on' : ''}`}>
              <input type="checkbox" checked={on} onChange={() => toggle(s.value)} />
              <Icon className="ax-cardicon" aria-hidden="true" />
              <span>{pick(s.label, lang, simple)}</span>
            </label>
          )
        })}
      </div>
      {needs.length > 0 && (
        <label className="ax-label-small">
          <input type="checkbox" checked={onlyAll} onChange={(e) => setOnlyAll(e.target.checked)} /> {t('onlyAll')}
        </label>
      )}
    </fieldset>
  )
}

function JobCard({ job, missing, hasNeeds, onApply }) {
  const { lang, simple } = useAccess()
  const t = (k) => pick(T[k], lang, simple)
  return (
    <li className="ax-panel">
      <h3 className="ax-panel-title">{job.title}</h3>
      <p>{job.company} · {job.place}</p>
      <p>{job.summary}</p>
      <p className="ax-hint"><strong>{t('offers')}:</strong> {job.offers.map(supportShort).join(', ')}</p>
      {hasNeeds && (
        <p role="status">
          {missing.length === 0
            ? <><MdCheck aria-hidden="true" /> {t('matchAll')}</>
            : <>{t('missing')}: {missing.map(supportShort).join(', ')}</>}
        </p>
      )}
      <button type="button" className="ax-btn ax-btn-primary" onClick={() => onApply(job)}>
        <MdWork aria-hidden="true" /> {t('apply')}<span className="ax-sr"> — {job.title}, {job.company}</span>
      </button>
    </li>
  )
}

function Jobs() {
  const { lang, simple } = useAccess()
  const t = (k) => pick(T[k], lang, simple)
  const [needs, setNeeds] = useState(() => getSupport().needs || [])
  const [onlyAll, setOnlyAll] = useState(false)
  const [applying, setApplying] = useState(null)
  const schema = useMemo(() => (applying ? buildApplicationSchema(applying) : null), [applying])

  if (applying) {
    const profile = getProfile()?.answers
    return (
      <>
        <button type="button" className="ax-btn ax-btn-ghost" onClick={() => setApplying(null)}>
          <MdArrowBack aria-hidden="true" /> {t('backToJobs')}
        </button>
        <FormEngine
          schema={schema}
          initialAnswers={{ name: profile?.name, phone: profile?.phone }}
          onSubmit={async (a) => addApplication({ jobId: applying.id, at: Date.now(), answers: a })}
          doneContent={() => (
            <>
              <p>{t('applied')}</p>
              <button type="button" className="ax-btn ax-btn-primary" onClick={() => setApplying(null)}>{t('backToJobs')}</button>
            </>
          )}
        />
      </>
    )
  }

  let rows = matchJobs(getJobs(), needs)
  if (onlyAll && needs.length) rows = rows.filter((r) => r.missing.length === 0)

  return (
    <>
      <JobFilter needs={needs} setNeeds={setNeeds} onlyAll={onlyAll} setOnlyAll={setOnlyAll} />
      {rows.length === 0 ? (
        <p role="status">{t('none')}</p>
      ) : (
        <ul className="ax-joblist" style={{ listStyle: 'none', padding: 0 }}>
          {rows.map(({ job, missing }) => (
            <JobCard key={job.id} job={job} missing={missing} hasNeeds={needs.length > 0} onApply={setApplying} />
          ))}
        </ul>
      )}
    </>
  )
}

function Employer({ onDone }) {
  const { lang, simple } = useAccess()
  const t = (k) => pick(T[k], lang, simple)
  return (
    <FormEngine
      schema={employerSchema}
      showSupportButton={false}
      onSubmit={async (a) =>
        addJob({
          id: `job-${Date.now()}`,
          company: a.company,
          title: a.title,
          place: a.place,
          summary: a.summary,
          offers: a.offers,
          offersNote: a.offersNote,
          contact: a.contact })
      }
      doneContent={() => (
        <>
          <p>{t('posted')}</p>
          <button type="button" className="ax-btn ax-btn-primary" onClick={onDone}>{t('seeJobs')}</button>
        </>
      )}
    />
  )
}

function Inner() {
  const { lang, simple } = useAccess()
  const t = (k) => pick(T[k], lang, simple)
  const [tab, setTab] = useState('jobs')
  return (
    <>
      <nav className="ax-row" aria-label="Career">
        <button type="button" className="ax-btn" aria-pressed={tab === 'jobs'} onClick={() => setTab('jobs')}>
          <MdWork aria-hidden="true" /> {t('find')}
        </button>
        <button type="button" className="ax-btn" aria-pressed={tab === 'employer'} onClick={() => setTab('employer')}>
          <MdBusiness aria-hidden="true" /> {t('post')}
        </button>
      </nav>
      {tab === 'jobs' ? <Jobs /> : <Employer onDone={() => setTab('jobs')} />}
    </>
  )
}

/** Job gateway: private support filter, voice-enabled applications, employer accommodations form. */
export default function CareerGateway() {
  return (
    <AccessShell>
      <Inner />
    </AccessShell>
  )
}
