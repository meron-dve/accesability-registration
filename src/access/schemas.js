import {
  MdPerson, MdSms, MdBadge, MdDescription, MdPublic, MdLock, MdFavorite, MdHelp, MdBusiness, MdWork,
  MdLocationOn, MdPhone, MdChecklist, MdHandshake, MdSchedule } from 'react-icons/md'
import { supportOptions, offerOptions, YES_NO } from './vocab'

export const DEFAULT_PARTNERS = [
  { value: 'aaapd', label: 'Addis Ababa Association of Persons with Disabilities (AAAPD)', say: ['aaapd', 'addis ababa association'] },
  { value: 'refugee-org', label: 'A refugee support organisation', say: ['refugee'] },
  { value: 'community', label: 'A community or church group', say: ['community', 'church'] },
  { value: 'any', label: 'Choose one for me', say: ['choose', 'any'] },
]

const needsStep = {
  id: 'support',
  type: 'multi',
  icon: MdLock,
  private: true,
  label: { en: 'What would make this easier for you?', simple: 'What helps you?' },
  hint: {
    en: 'We do not ask why. You do not need a doctor’s letter or any proof. You can skip.',
    simple: 'We do not ask why. No papers needed. You can skip.' },
  options: supportOptions() }

const idRouteStep = {
  id: 'idRoute',
  type: 'choice',
  icon: MdBadge,
  required: true,
  label: { en: 'Which ID can you use?', simple: 'Do you have an ID?' },
  hint: {
    en: 'No ID is fine. Every choice lets you carry on.',
    simple: 'No ID is OK. You can still go on.' },
  options: [
    { value: 'kebele', icon: MdBadge, label: { en: 'Kebele ID', simple: 'Kebele ID' }, say: ['kebele', 'national'] },
    { value: 'refugee', icon: MdPublic, label: { en: 'Refugee ID', simple: 'Refugee ID' }, say: ['refugee', 'arra', 'unhcr'] },
    { value: 'other-doc', icon: MdDescription, label: { en: 'Another document (school, church, community or work letter)', simple: 'A different paper or letter' }, say: ['another', 'other', 'letter', 'document'] },
    { value: 'refer', icon: MdHandshake, label: { en: 'I have no document. Please refer me through a partner', simple: 'No paper. Please connect me to a helper group' }, say: ['no document', 'refer', 'partner', 'none'] },
  ] }

export function buildSignupSchema({ partners = DEFAULT_PARTNERS } = {}) {
  const is = (a, ...vals) => vals.includes(a.idRoute)
  return {
    id: 'signup',
    title: { en: 'Sign up', simple: 'Sign up' },
    steps: [
      { id: 'name', type: 'text', icon: MdPerson, required: true, autoComplete: 'name', maxLength: 120,
        label: { en: 'What should we call you?', simple: 'Your name' },
        hint: { en: 'Any name you like. It does not have to match an ID.', simple: 'Any name is OK.' } },
      { id: 'contactMethod', type: 'choice', icon: MdSms, required: true,
        label: { en: 'How can we reach you?', simple: 'How can we reach you?' },
        options: [
          { value: 'sms', icon: MdSms, label: { en: 'Text message (SMS)', simple: 'Text message' }, say: ['text', 'sms', 'message'] },
          { value: 'call', icon: MdPhone, label: { en: 'Phone call', simple: 'Phone call' }, say: ['call', 'phone'] },
          { value: 'inperson', icon: MdLocationOn, label: { en: 'I will visit in person', simple: 'I will come to you' }, say: ['visit', 'person', 'come'] },
        ] },
      { id: 'phone', type: 'tel', icon: MdPhone, required: true, autoComplete: 'tel',
        showIf: (a) => a.contactMethod === 'sms' || a.contactMethod === 'call',
        label: { en: 'What is your phone number?', simple: 'Your phone number' },
        hint: { en: 'Only used for your save-and-continue link and updates.', simple: 'Only for messages to you.' } },
      idRouteStep,
      { id: 'idNumber', type: 'text', maxLength: 60, showIf: (a) => is(a, 'kebele', 'refugee'),
        label: { en: 'What is the ID number?', simple: 'ID number' },
        hint: { en: 'You can skip this and add it later.', simple: 'You can skip.' } },
      { id: 'otherDoc', type: 'text', maxLength: 120, showIf: (a) => is(a, 'other-doc'),
        label: { en: 'Which document do you have?', simple: 'What paper do you have?' },
        hint: { en: 'For example: school letter, church letter, community letter. You can skip.', simple: 'You can skip.' } },
      { id: 'partner', type: 'choice', icon: MdHandshake, required: true, showIf: (a) => is(a, 'refer'),
        label: { en: 'Which partner can help you?', simple: 'Which group can help you?' },
        options: partners.map((p) => ({ icon: MdHandshake, ...p })) },
      { id: 'partnerShare', type: 'choice', icon: MdHelp, required: true, showIf: (a) => is(a, 'refer'),
        label: { en: 'Can we share your name and phone with them so they can contact you?', simple: 'Can we share your name and phone with them?' },
        options: YES_NO },
      { ...needsStep },
      { id: 'consent', type: 'choice', icon: MdFavorite, required: true, mustBe: 'yes',
        label: { en: 'Is it OK for us to save these answers to make your profile?', simple: 'Can we keep your answers?' },
        hint: { en: 'You can see, change or delete your profile at any time.', simple: 'You can change or delete it any time.' },
        mustBeMsg: { en: 'We can only make a profile with your OK. You can go back and change an answer, or leave. Nothing is sent.' },
        options: YES_NO },
    ] }
}

// Support request from any screen: private, no reason asked.
export const supportRequestSchema = {
  id: 'support-request',
  title: { en: 'Ask for support privately', simple: 'Ask for help, privately' },
  steps: [
    { ...needsStep, required: true, private: false,
      hint: { en: 'Pick what helps. You never have to say why, and no proof is needed.', simple: 'Pick what helps. No reason. No papers.' } },
    { id: 'note', type: 'textarea', maxLength: 600,
      label: { en: 'Anything else you want us to know?', simple: 'Anything else?' },
      hint: { en: 'Optional. Do not tell us about your health unless you want to.', simple: 'You can skip.' } },
    { id: 'replyVia', type: 'choice', required: true,
      label: { en: 'How may we reply?', simple: 'How can we answer you?' },
      options: [
        { value: 'sms', icon: MdSms, label: { en: 'Text message (SMS)', simple: 'Text message' }, say: ['text', 'sms'] },
        { value: 'inperson', icon: MdLocationOn, label: { en: 'I will ask in person', simple: 'I will come to you' }, say: ['person', 'visit'] },
        { value: 'none', icon: MdLock, label: { en: 'Do not reply. Just save my request', simple: 'Just save it' }, say: ['save', 'none'] },
      ] },
    { id: 'phone', type: 'tel', required: true, showIf: (a) => a.replyVia === 'sms', autoComplete: 'tel',
      label: { en: 'Phone number for the reply', simple: 'Your phone number' } },
  ] }

// Partner registers a learner. Consent comes first; nothing about the learner is asked before it.
export function buildPartnerSchema({ partners = DEFAULT_PARTNERS } = {}) {
  const base = buildSignupSchema({ partners })
  return {
    id: 'partner-register',
    title: { en: 'Register a learner (partner)', simple: 'Register a learner' },
    steps: [
      { id: 'partnerName', type: 'text', icon: MdBusiness, required: true, maxLength: 120,
        label: { en: 'Your organisation’s name', simple: 'Your group name' } },
      { id: 'staffName', type: 'text', icon: MdPerson, required: true, maxLength: 120,
        label: { en: 'Your name', simple: 'Your name' } },
      { id: 'consentInfo', type: 'info', icon: MdFavorite,
        label: { en: 'Read this to the learner, in their own language', simple: 'Read this to the learner' },
        body: { en: [
          'We want to make a learning profile for you. We will keep your name, phone and the answers you choose to give.',
          'You can say no. If you say no, nothing is saved. You can change your mind later and ask us to delete everything.',
          'You will get a text message with a link. There you can keep or delete the profile yourself.',
        ] } },
      { id: 'consent', type: 'choice', icon: MdFavorite, required: true, mustBe: 'yes',
        label: { en: 'Did the learner clearly say YES?', simple: 'Did the learner say YES?' },
        mustBeMsg: { en: 'Without a clear YES from the learner, we cannot continue. Nothing has been saved about them.' },
        options: YES_NO },
      { id: 'consentHow', type: 'choice', required: true, showIf: (a) => a.consent === 'yes',
        label: { en: 'How did they give their OK?', simple: 'How did they say yes?' },
        options: [
          { value: 'spoken', label: { en: 'They said it out loud' }, say: ['said', 'spoken', 'voice'] },
          { value: 'tapped', label: { en: 'They tapped it on the device themselves' }, say: ['tapped', 'themselves'] },
          { value: 'signed', label: { en: 'They signed or used a thumbprint' }, say: ['signed', 'thumb', 'fingerprint'] },
        ] },
      { ...base.steps[0], id: 'name', showIf: (a) => a.consent === 'yes' },
      { ...base.steps[1], showIf: (a) => a.consent === 'yes' },
      { ...base.steps[2], id: 'phone', showIf: (a) => a.consent === 'yes' && (a.contactMethod === 'sms' || a.contactMethod === 'call') },
      { ...idRouteStep, showIf: (a) => a.consent === 'yes' },
      { id: 'idNumber', type: 'text', maxLength: 60, showIf: (a) => a.consent === 'yes' && ['kebele', 'refugee'].includes(a.idRoute),
        label: { en: 'ID number', simple: 'ID number' }, hint: { en: 'You can skip.' } },
      { ...needsStep, showIf: (a) => a.consent === 'yes',
        hint: { en: 'Ask only if the learner wants to share. It goes to the learner’s own profile, not to your list.' } },
    ] }
}

// ----- Career gateway -----

export function buildApplicationSchema(job) {
  return {
    id: `apply-${job.id}`,
    title: { en: `Apply: ${job.title}`, simple: `Apply: ${job.title}` },
    steps: [
      { id: 'name', type: 'text', required: true, maxLength: 120, autoComplete: 'name', icon: MdPerson,
        label: { en: 'Your name', simple: 'Your name' } },
      { id: 'phone', type: 'tel', required: true, autoComplete: 'tel', icon: MdPhone,
        label: { en: 'Phone number', simple: 'Your phone number' } },
      { id: 'why', type: 'textarea', required: true, maxLength: 1200, icon: MdWork,
        label: { en: 'Why do you want this job?', simple: 'Why do you want this job?' },
        hint: { en: 'A few words are enough. You can speak your answer.', simple: 'A few words are OK. You can speak.' } },
      { id: 'experience', type: 'textarea', maxLength: 1200, icon: MdChecklist,
        label: { en: 'What work or skills do you have?', simple: 'What can you do?' },
        hint: { en: 'Work, volunteering, home or community tasks all count. You can skip.', simple: 'All kinds of work count. You can skip.' } },
      { id: 'availability', type: 'choice', required: true, icon: MdSchedule,
        label: { en: 'When can you start?', simple: 'When can you start?' },
        options: [
          { value: 'now', label: { en: 'Right away', simple: 'Now' }, say: ['right away', 'now', 'immediately'] },
          { value: '1m', label: { en: 'Within a month', simple: 'In one month' }, say: ['month'] },
          { value: 'later', label: { en: 'Later. Let us talk', simple: 'Later' }, say: ['later', 'talk'] },
        ] },
      { id: 'interviewSupport', type: 'multi', icon: MdLock, private: true,
        label: { en: 'Do you want this employer to prepare anything for your interview?', simple: 'Do you want anything ready for your interview?' },
        hint: { en: 'Optional. The employer sees only what you tick, never why. Skip to share nothing.', simple: 'You can skip. Nothing is shared if you skip.' },
        options: supportOptions().filter((o) => job.offers.includes(o.value)) },
    ] }
}

export const employerSchema = {
  id: 'employer-job',
  title: { en: 'Post a job and the support it offers', simple: 'Post a job' },
  steps: [
    { id: 'company', type: 'text', required: true, maxLength: 120, icon: MdBusiness,
      label: { en: 'Company name', simple: 'Company name' } },
    { id: 'contact', type: 'tel', required: true, icon: MdPhone,
      label: { en: 'Phone number for applicants’ replies', simple: 'Phone number' } },
    { id: 'title', type: 'text', required: true, maxLength: 120, icon: MdWork,
      label: { en: 'Job title', simple: 'Job name' } },
    { id: 'summary', type: 'textarea', required: true, maxLength: 800,
      label: { en: 'What will the person do?', simple: 'What is the work?' },
      hint: { en: 'Use plain words, short sentences.', simple: 'Use short, simple words.' } },
    { id: 'place', type: 'text', required: true, maxLength: 120, icon: MdLocationOn,
      label: { en: 'Where is the work?', simple: 'Where is the work?' } },
    { id: 'offers', type: 'multi', required: true, icon: MdChecklist,
      label: { en: 'What can this job offer?', simple: 'What can you offer?' },
      hint: { en: 'Tick everything you can arrange. Applicants are matched to these without telling you anything about themselves.', simple: 'Tick all you can do.' },
      requiredMsg: { en: 'Please tick at least one thing this job offers.' },
      options: offerOptions() },
    { id: 'offersNote', type: 'textarea', maxLength: 600,
      label: { en: 'Anything else you can arrange?', simple: 'Anything else?' } },
    { id: 'noProof', type: 'choice', required: true, mustBe: 'yes',
      label: { en: 'Will you arrange adjustments when asked, without asking for medical proof?', simple: 'Will you help when asked, without asking for medical papers?' },
      mustBeMsg: { en: 'We can only list jobs that agree not to ask for medical proof.' },
      options: YES_NO },
  ] }
