import {
  MdRecordVoiceOver, MdVolumeUp, MdMic, MdTextFields, MdKeyboard, MdAccessTime, MdAccessible, MdWc,
  MdSchedule, MdVolumeOff, MdSignLanguage, MdTranslate, MdHome, MdDevices, MdPeople } from 'react-icons/md'

// One shared vocabulary: learners pick what helps them, employers pick what a job offers.
// The ids are the only thing that is ever matched. No diagnosis or reason is stored anywhere.
export const SUPPORT = [
  { value: 'screen-reader', icon: MdRecordVoiceOver, short: 'Screen reader',
    label: { en: 'I use a screen reader' },
    offer: 'Our systems work with screen readers', say: ['screen reader', 'jaws', 'nvda', 'talkback'] },
  { value: 'large-text', icon: MdTextFields, short: 'Large text',
    label: { en: 'I need large text or strong colours' },
    offer: 'Large-text or high-contrast materials', say: ['large text', 'big text', 'high contrast'] },
  { value: 'read-aloud', icon: MdVolumeUp, short: 'Read aloud',
    label: { en: 'I need things read aloud to me' },
    offer: 'Documents read aloud or given as audio', say: ['read aloud', 'audio'] },
  { value: 'voice', icon: MdMic, short: 'Voice input',
    label: { en: 'I use my voice instead of typing' },
    offer: 'Spoken or recorded answers are accepted', say: ['voice', 'speak', 'speech'] },
  { value: 'keyboard', icon: MdKeyboard, short: 'No mouse',
    label: { en: 'I cannot use a mouse' },
    offer: 'Work can be done by keyboard or switch', say: ['no mouse', 'keyboard', 'switch'] },
  { value: 'extra-time', icon: MdAccessTime, short: 'Extra time',
    label: { en: 'I do better with extra time' },
    offer: 'Extra time for tests and tasks', say: ['extra time', 'more time'] },
  { value: 'step-free', icon: MdAccessible, short: 'Step-free access',
    label: { en: 'I need step-free access (wheelchair, crutches)' },
    offer: 'Step-free entrance and ramps', say: ['step free', 'wheelchair', 'ramp', 'crutches'] },
  { value: 'accessible-toilet', icon: MdWc, short: 'Accessible toilet',
    label: { en: 'I need an accessible toilet' },
    offer: 'Accessible toilet on site', say: ['toilet', 'bathroom'] },
  { value: 'flexible-hours', icon: MdSchedule, short: 'Flexible hours',
    label: { en: 'I need flexible hours or rest breaks' },
    offer: 'Flexible hours and rest breaks', say: ['flexible hours', 'breaks', 'rest'] },
  { value: 'quiet-space', icon: MdVolumeOff, short: 'Quiet space',
    label: { en: 'I need a quiet place to work' },
    offer: 'A quiet place to work', say: ['quiet'] },
  { value: 'sign-language', icon: MdSignLanguage, short: 'Sign language',
    label: { en: 'I use sign language' },
    offer: 'Sign-language interpreter for interviews', say: ['sign language', 'interpreter', 'deaf'] },
  { value: 'simple-language', icon: MdTranslate, short: 'Plain instructions',
    label: { en: 'I need simple, clear instructions' },
    offer: 'Plain-language, step-by-step instructions', say: ['simple', 'clear', 'plain'] },
  { value: 'remote', icon: MdHome, short: 'Work from home',
    label: { en: 'I need to work from home some of the time' },
    offer: 'Work from home is possible', say: ['home', 'remote'] },
  { value: 'human-help', icon: MdPeople, short: 'Helper on site',
    label: { en: 'I want a person to help me in person' },
    offer: 'A named person who can help in person', say: ['helper', 'person', 'help'] },
  { value: 'own-device', icon: MdDevices, short: 'Own device',
    label: { en: 'I need to use my own assistive device or app' },
    offer: 'You may use your own assistive device or app', say: ['own device', 'assistive'] },
]

export const supportShort = (value) => SUPPORT.find((s) => s.value === value)?.short ?? value

export const supportOptions = () => SUPPORT.map(({ value, icon, label, say }) => ({ value, icon, label, say }))
export const offerOptions = () =>
  SUPPORT.map(({ value, icon, offer, say }) => ({ value, icon, label: offer, say }))

export const YES_NO = [
  { value: 'yes', label: { en: 'Yes' }, say: ['yes', 'yeah', 'ok', 'okay'] },
  { value: 'no', label: { en: 'No' }, say: ['no', 'nope'] },
]
