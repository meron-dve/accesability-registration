// Interface strings. Question text lives in the schemas as { en, am, simple }.
export const STRINGS = {
  en: {
    questionOf: 'Question {n} of {total}',
    noTimer: 'Take your time. There is no time limit. Your answers are saved as you go.',
    next: 'Next',
    back: 'Back',
    skip: 'Skip',
    review: 'Check my answers',
    send: 'Send',
    change: 'Change',
    skipped: 'Skipped',
    saveLater: 'Save and continue later',
    askSupport: 'Ask for support privately',
    readAloud: 'Read this question to me',
    readAll: 'Read my answers to me',
    startOver: 'Start again',
    reviewTitle: 'Check your answers',
    reviewHint: 'Press "Change" next to anything you want to fix. Nothing is sent until you press "Send".',
    privateNote: 'Private. Only you and the support team can see this.',
    sending: 'Sending…',
    sendFailed: 'We could not send your answers. They are still saved. Please try again.',
    doneTitle: 'Thank you. Your answers were sent.',
    voiceStart: 'Answer with my voice',
    voiceTitle: 'Voice answer',
    listening: 'Listening… speak now.',
    stopped: 'Stopped listening.',
    stop: 'Stop',
    speakAgain: 'Speak again',
    heard: 'What we heard. You can change it.',
    useThis: 'Use this answer',
    cancel: 'Cancel',
    voiceUnsupported: 'Voice typing is not available in this browser. You can type in the box below instead.',
    voiceDenied: 'The microphone is blocked. Allow it in your browser, or type in the box below.',
    voiceNoSpeech: 'We did not hear anything. Press "Speak again" or type below.',
    voiceError: 'Voice did not work. You can type in the box below.',
    voicePrivacy: 'Your browser may send your voice to its speech service to turn it into text.',
    voiceNoMatch: 'We could not match that to an answer. Please choose with the buttons, or say it again.',
    voiceAmbiguous: 'We heard more than one answer. Please choose with the buttons.',
    voiceNoNumber: 'We could not find a phone number. Say the digits one by one, or type them.',
    'err.required': 'Please answer this question to continue. You can use the microphone.',
    'err.requiredChoice': 'Please choose one answer to continue.',
    'err.requiredMulti': 'Please choose at least one answer, or press "Skip".',
    'err.phone': 'This phone number looks too short or too long. Please check it. Example: 0911 23 45 67.',
    'err.tooLong': 'This answer is too long. Please use fewer than {n} letters.',
    options: 'The choices are',
    optional: '(optional)',
    prefs: 'Display and language',
    textSize: 'Text size',
    smaller: 'Smaller text',
    larger: 'Larger text',
    contrast: 'High contrast',
    simpleMode: 'Simple words and sound',
    language: 'Language',
    saveTitle: 'Save and continue later',
    saveBody: 'Your answers are already saved on this device. To continue on any phone, we can text you a link. It does not expire.',
    savePhone: 'Phone number for the link',
    saveSend: 'Text me the link',
    saveSent: 'We sent the link by SMS to {to}.',
    saveDemo: 'SMS is not connected in this demo. Here is your link:',
    saveCopy: 'Copy link',
    close: 'Close',
    supportTitle: 'Ask for support privately',
    supportDone: 'Your request is saved privately. You did not have to explain why or show any proof.',
    resumeFound: 'Welcome back. You can carry on where you stopped.',
    loading: 'Loading…',
    zoom: 'Zoom',
    zoomReset: 'Reset zoom to 100 percent' }
}

export function translate(lang, key, vars) {
  let s = STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v)
  return s
}

// Schema text can be a string or { en, am, simple }. Simple words are English-only,
// so a non-English language wins over `simple` when a translation exists.
export function pick(v, lang = 'en', simple = false) {
  if (v == null) return ''
  if (typeof v === 'string') return v
  if (lang !== 'en' && v[lang]) return v[lang]
  if (simple && v.simple) return v.simple
  return v[lang] ?? v.en ?? ''
}
