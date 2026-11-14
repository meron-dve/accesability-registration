import { useMemo } from 'react'
import AccessShell from './AccessShell'
import FormEngine from './engine/FormEngine'
import { useAccess } from './context'
import { buildPartnerSchema } from './schemas'
import { addPartnerRecord, createClaim } from './store'

function Inner({ partners }) {
  const { tr } = useAccess()
  const schema = useMemo(() => buildPartnerSchema({ partners }), [partners])

  const submit = async (a) => {
    const { support, partnerName, staffName, consent, consentHow, ...profile } = a
    delete profile.consentInfo
    // The learner's support needs travel only inside the claim, not into the partner's own list.
    const claim = await createClaim({ profile, support, phone: profile.phone, partnerName })
    addPartnerRecord({
      id: claim.token.slice(0, 8),
      at: Date.now(),
      partnerName,
      staffName,
      learnerName: profile.name,
      consent: { given: consent === 'yes', how: consentHow },
      claimed: false,
    })
    return claim
  }

  return (
    <FormEngine
      schema={schema}
      onSubmit={submit}
      showSupportButton={false}
      submitLabel={tr('send')}
      doneContent={({ result, reset }) => (
        <>
          <p>
            {result.sms?.delivered
              ? 'The learner was sent a text link to keep or delete their profile.'
              : 'No SMS was sent (demo mode or no phone). Give this link to the learner:'}
          </p>
          {!result.sms?.delivered && <p><a className="ax-link" href={result.link}>{result.link}</a></p>}
          <button type="button" className="ax-btn ax-btn-primary" onClick={reset}>
            Register another learner
          </button>
        </>
      )}
    />
  )
}

/** A partner (for example AAAPD) registers a learner. Consent is asked first and recorded. */
export default function PartnerRegister({ partners }) {
  return (
    <AccessShell>
      <Inner partners={partners} />
    </AccessShell>
  )
}
