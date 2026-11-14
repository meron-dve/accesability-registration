import { pick } from '../translation helper'

export const isEmpty = (v) => v == null || v === '' || (Array.isArray(v) && v.length === 0)

// Returns a plain-language message, or '' when the answer is fine.
export function validateStep(step, value, answers, tr, lang, simple) {
  if (step.type === 'info') return ''
  if (isEmpty(value)) {
    if (!step.required) return ''
    if (step.requiredMsg) return pick(step.requiredMsg, lang, simple)
    if (step.type === 'choice') return tr('err.requiredChoice')
    if (step.type === 'multi') return tr('err.requiredMulti')
    return tr('err.required')
  }
  if (step.type === 'tel') {
    const digits = String(value).replace(/\D/g, '')
    if (digits.length < 9 || digits.length > 15) return tr('err.phone')
  }
  if (typeof value === 'string' && step.maxLength && value.length > step.maxLength) {
    return tr('err.tooLong', { n: step.maxLength })
  }
  if (step.mustBe && value !== step.mustBe) return pick(step.mustBeMsg, lang, simple)
  if (step.validate) return pick(step.validate(value, answers), lang, simple)
  return ''
}
