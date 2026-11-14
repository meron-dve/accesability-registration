import { useCallback, useEffect, useRef, useState } from 'react'

export const SPEECH_LANG = { en: 'en-US' }

const getCtor = () =>
  typeof window === 'undefined' ? null : window.SpeechRecognition || window.webkitSpeechRecognition

// Dictation. Continuous, so slow speakers are not cut off; the person presses Stop.
export function useListen(lang) {
  const recRef = useRef(null)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState('')
  const supported = !!getCtor()

  const stop = useCallback(() => recRef.current?.stop(), [])
  const start = useCallback(
    (onText) => {
      const Ctor = getCtor()
      if (!Ctor) return
      recRef.current?.abort()
      const rec = new Ctor()
      rec.lang = SPEECH_LANG[lang] || lang
      rec.continuous = true
      rec.interimResults = true
      let finalText = ''
      rec.onstart = () => {
        setListening(true)
        setError('')
      }
      rec.onresult = (e) => {
        let interim = ''
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i]
          if (r.isFinal) finalText += r[0].transcript + ' '
          else interim += r[0].transcript
        }
        onText((finalText + interim).trim())
      }
      rec.onerror = (e) => setError(e.error || 'error')
      rec.onend = () => setListening(false)
      recRef.current = rec
      try {
        rec.start()
      } catch {
        setError('error')
      }
    },
    [lang],
  )
  useEffect(() => () => recRef.current?.abort(), [])

  return { supported, listening, error, start, stop }
}

export function speak(text, lang = 'en') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) return false
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = SPEECH_LANG[lang] || lang
  u.rate = 0.9
  window.speechSynthesis.speak(u)
  return true
}
export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
}

const DIGITS = { zero: 0, oh: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9 }
export function spokenToDigits(text) {
  return text
    .toLowerCase()
    .split(/[\s,.-]+/)
    .map((w) => (w in DIGITS ? String(DIGITS[w]) : w))
    .join('')
    .replace(/[^\d+]/g, '')
}

const norm = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
const STOP = new Set(['the', 'and', 'for', 'you', 'with', 'are', 'this', 'that', 'have', 'can', 'use', 'get', 'need'])
const tokens = (s) => norm(s).split(' ').filter((w) => w.length >= 3 && !STOP.has(w))

// Match what was said to option objects ({ value, label, say }). Returns the matches with a score.
export function matchOptions(text, options, labelOf) {
  const said = norm(text)
  const saidTokens = new Set(tokens(text))
  return options
    .map((o) => {
      const phrases = [labelOf(o), ...(o.say || [])].map(norm).filter(Boolean)
      let score = 0
      for (const p of phrases) {
        if (` ${said} `.includes(` ${p} `)) score = Math.max(score, 10 + p.length)
        else for (const t of tokens(p)) if (saidTokens.has(t)) score = Math.max(score, 1)
      }
      return { option: o, score }
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
}
