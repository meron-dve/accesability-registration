import { pick } from '../translation helper'
import { matchOptions, spokenToDigits } from '../voice'

// Turn a reviewed transcript into a field value. Returns { ok, value } or { ok: false, message }.
export function applyVoice(step, text, current, tr, lang, simple) {
  const said = text.trim()
  if (!said) return { ok: false, message: tr('voiceNoSpeech') }
  const labelOf = (o) => pick(o.label, lang, simple)

  if (step.type === 'tel') {
    const digits = spokenToDigits(said)
    if (digits.length < 5) return { ok: false, message: tr('voiceNoNumber') }
    return { ok: true, value: digits }
  }
  if (step.type === 'choice') {
    const m = matchOptions(said, step.options, labelOf)
    if (!m.length) return { ok: false, message: tr('voiceNoMatch') }
    if (m.length > 1 && m[0].score === m[1].score) return { ok: false, message: tr('voiceAmbiguous') }
    return { ok: true, value: m[0].option.value }
  }
  if (step.type === 'multi') {
    const m = matchOptions(said, step.options, labelOf)
    if (!m.length) return { ok: false, message: tr('voiceNoMatch') }
    const merged = new Set([...(current || []), ...m.map((x) => x.option.value)])
    return { ok: true, value: step.options.map((o) => o.value).filter((v) => merged.has(v)) }
  }
  if (step.type === 'textarea' && current) return { ok: true, value: `${current} ${said}` }
  return { ok: true, value: said }
}
