// Storage + gateway layer. Defaults to this browser's localStorage and a demo SMS outbox.
// Plug real services in with configureGateway({ sendSms, saveRemote, loadRemote }).
const NS = 'access:v1:'

function safe(fn) {
  try {
    return fn()
  } catch {
    return undefined
  }
}

export const store = {
  get(key, fallback = null) {
    const v = safe(() => {
      const raw = localStorage.getItem(NS + key)
      return raw == null ? undefined : JSON.parse(raw)
    })
    return v === undefined ? fallback : v
  },
  set(key, value) {
    return safe(() => {
      localStorage.setItem(NS + key, JSON.stringify(value))
      return true
    }) ?? false
  },
  remove(key) {
    safe(() => localStorage.removeItem(NS + key))
  },
}

export const saveDraft = (formId, d) => store.set(`draft:${formId}`, { ...d, updatedAt: Date.now() })

let gateway = {}
export function configureGateway(g) {
  gateway = g || {}
}

const TOKEN_RE = /^[a-f0-9]{32}$/
function makeToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}
export function linkFor(param, token) {
  const u = new URL(window.location.href)
  u.search = ''
  u.hash = ''
  u.searchParams.set(param, token)
  return u.toString()
}
export function tokenFromUrl(param) {
  const t = new URLSearchParams(window.location.search).get(param)
  return t && TOKEN_RE.test(t) ? t : null
}

export async function sendSms({ to, body }) {
  if (gateway.sendSms) {
    await gateway.sendSms({ to, body })
    return { delivered: true }
  }
  const box = store.get('outbox', [])
  box.push({ to, body, at: Date.now() })
  store.set('outbox', box.slice(-50))
  return { delivered: false, demo: true }
}
export const getOutbox = () => store.get('outbox', [])

async function saveToken(prefix, token, payload) {
  if (gateway.saveRemote) await gateway.saveRemote(`${prefix}:${token}`, payload)
  store.set(`${prefix}:${token}`, payload)
}
async function loadToken(prefix, token) {
  if (!TOKEN_RE.test(token)) return null
  const remote = gateway.loadRemote ? await gateway.loadRemote(`${prefix}:${token}`) : null
  return remote ?? store.get(`${prefix}:${token}`)
}

// Save-and-resume. The SMS text carries only a link, never answers.
export async function createResume({ formId, answers, stepId, phone }) {
  const token = makeToken()
  await saveToken('resume', token, { formId, answers, stepId, updatedAt: Date.now() })
  const link = linkFor('resume', token)
  const body =
    `Continue your sign-up whenever you are ready. No time limit: ${link}`
  const sms = phone ? await sendSms({ to: phone, body }) : null
  return { token, link, sms }
}
export const loadResume = (token) => loadToken('resume', token)
export const dropResume = (token) => token && store.remove(`resume:${token}`)

// Partner registration: the learner confirms or deletes the profile from an SMS link.
export async function createClaim({ profile, support, phone, partnerName }) {
  const token = makeToken()
  await saveToken('claim', token, { profile, support, partnerName, createdAt: Date.now() })
  const link = linkFor('claim', token)
  const body =
    `${partnerName} made a profile for you. Open to keep it or delete it: ${link}`
  const sms = phone ? await sendSms({ to: phone, body }) : null
  return { token, link, sms }
}
export const loadClaim = (token) => loadToken('claim', token)
export const dropClaim = (token) => store.remove(`claim:${token}`)

// Profile (never holds support needs)
export const getProfile = () => store.get('profile')
export const saveProfile = (p) => store.set('profile', { ...p, updatedAt: Date.now() })
export const deleteProfile = () => store.remove('profile')

// Private support: stays on this device unless the person sends a request.
export const getSupport = () => store.get('support', { needs: [] })
export function saveSupport(s) {
  store.set('support', { ...getSupport(), ...s, updatedAt: Date.now() })
}

// Partner registration log (consent proof only, no support needs)
export const getPartnerRecords = () => store.get('partner-records', [])
export function addPartnerRecord(r) {
  store.set('partner-records', [r, ...getPartnerRecords()])
}

// Jobs and applications
export const getCustomJobs = () => store.get('jobs', [])
export function addJob(job) {
  store.set('jobs', [job, ...getCustomJobs()])
}
export const getApplications = () => store.get('applications', [])
export function addApplication(a) {
  store.set('applications', [a, ...getApplications()])
}
