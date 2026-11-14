# Accessible onboarding and career gateway: front / back split

## FRONT (yours): everything under `src/access/`

Written, not yet linted, built or run:
- `engine/FormEngine.jsx`: one question per screen, no timers, autosave, review, send
- `engine/StepField.jsx`, `VoiceInput.jsx`, `SaveLater.jsx`, `validate.js`, `voiceApply.js`
- `AccessShell.jsx`: text size, contrast, simple mode, private-support dialog
- `Onboarding.jsx` (sign-up + profile + SMS claim and resume), `PartnerRegister.jsx`
- `schemas.js`, `vocab.js`, `i18n.js`, `voice.js`, `jobs.js` (sample jobs)

Still to write:
- `access.css` (imported by `AccessShell.jsx`; classes are all `ax-*`): large targets, focus ring, high contrast, text sizes `ax-s0..s3`, `ax-simple`, `ax-sr` (screen-reader-only)
- `Career.jsx`: job list, private "support I need" filter (matching via `matchJobs`), apply flow using `buildApplicationSchema(job)`, employer form using `employerSchema`
- `index.js` exports, a demo page (`access.html` + `demo.jsx`), `vite.config.js` multi-page input
- Run `npm run lint` and `npm run build`; test with NVDA or TalkBack and Chrome voice input

## BACK (someone else): implement what `src/access/store.js` calls

Front talks to the back only through `configureGateway({ sendSms, saveRemote, loadRemote })` and the small functions in `store.js`. Today they use localStorage and a demo SMS outbox, so nothing leaves the browser.

| Need | Contract |
|---|---|
| Send SMS | `sendSms({ to, body })`. Use an SMS provider such as Africa's Talking. |
| Save and resume | `saveRemote("resume:<token>", { formId, answers, stepId })` and `loadRemote(...)`. Token is 32 hex chars. No expiry. Delete when the form is submitted. |
| Partner claim | `saveRemote("claim:<token>", { profile, support, partnerName })`. Learner opens `?claim=<token>` to keep or delete. Deleting must really delete server-side. |
| Profile | CRUD for one profile per person. Never store `support` with it. |
| Private support | Store `{ needs[], note, replyVia, phone }` separately. Only the support team may read it. Never expose it to employers or partners. |
| Partners | Log of `{ partnerName, staffName, learnerName, consent: { given, how }, at }`. Needs partner login. |
| Jobs | `GET /jobs` returning `{ id, company, title, place, summary, offers[] }`. `POST /jobs` from the employer form. Reject if `noProof` is not `yes`. |
| Applications | `POST /applications` with the answers. `interviewSupport` is the only support data the employer may receive, and only if the applicant ticked it. |

Back-end rules to keep: no medical proof fields anywhere, no timeouts on drafts, no support needs in any employer-facing API, encrypt stored answers, and tell users that browser voice recognition may send audio to the browser vendor's speech service.
