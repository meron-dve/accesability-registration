import { getCustomJobs } from './store'

// Sample listings so the gateway works out of the box. Replace with your API.
export const SEED_JOBS = [
  { id: 'seed-1', company: 'Selam Call Centre', title: 'Customer phone support', place: 'Addis Ababa (Bole)',
    summary: 'Answer customer calls in Amharic. Full training is given.',
    offers: ['screen-reader', 'step-free', 'accessible-toilet', 'extra-time', 'flexible-hours', 'own-device', 'simple-language'] },
  { id: 'seed-2', company: 'Abay Data Services', title: 'Data entry from home', place: 'Remote',
    summary: 'Type records into a spreadsheet. Work at your own pace.',
    offers: ['remote', 'flexible-hours', 'voice', 'keyboard', 'large-text', 'screen-reader', 'extra-time'] },
  { id: 'seed-3', company: 'Merkato Textiles', title: 'Sewing and packing', place: 'Addis Ababa (Kolfe)',
    summary: 'Sew and pack clothes in a small team.',
    offers: ['step-free', 'quiet-space', 'human-help', 'simple-language', 'sign-language'] },
  { id: 'seed-4', company: 'Hope Library', title: 'Library assistant', place: 'Adama',
    summary: 'Help readers find books and keep shelves tidy.',
    offers: ['step-free', 'accessible-toilet', 'read-aloud', 'large-text', 'quiet-space', 'human-help'] },
]

export const getJobs = () => [...getCustomJobs(), ...SEED_JOBS]

// Matching is done here, on the learner's device. Needs are never sent to employers.
export function matchJobs(jobs, needs) {
  return jobs
    .map((j) => ({ job: j, missing: needs.filter((n) => !j.offers.includes(n)) }))
    .sort((a, b) => a.missing.length - b.missing.length)
}
