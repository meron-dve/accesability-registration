import { useEffect, useMemo, useState } from "react";
import {
  MdPerson,
  MdVolumeUp,
  MdHandshake,
  MdCheck,
  MdDelete,
} from "react-icons/md";
import AccessShell from "./AccessShell";
import FormEngine from "./engine/FormEngine";
import PartnerRegister from "./PartnerRegister";
import { useAccess } from "./context";
import { pick } from "./translation helper";
import { buildSignupSchema } from "./schemas";
import {
  store,
  tokenFromUrl,
  loadResume,
  loadClaim,
  dropClaim,
  getProfile,
  saveProfile,
  getSupport,
  saveSupport,
} from "./store";

const T = {
  chooseTitle: { en: "How would you like to do this?" },
  standard: { en: "Standard: read and type" },
  simple: { en: "Simple words, pictures and sound" },
  partner: { en: "A partner is helping me register" },
  keep: { en: "Yes, keep my profile" },
  del: { en: "No, delete it" },
  claimTitle: { en: "A partner made a profile for you" },
  claimMissing: {
    en: "We could not find this link on this device. Please ask your partner to send it again, or start a new sign-up.",
  },
  claimKept: {
    en: "Your profile is yours now. You can change or delete it any time.",
  },
  claimDeleted: { en: "The profile was deleted." },
  newSignup: { en: "Start a new sign-up" },
  saved: {
    en: "Your profile is saved. Open this page again at any time to see or change it. Your support choices stay private on this device.",
  },
  next: { en: "Go to jobs" },
  welcome: { en: "Welcome ! Write your welcome text here." },
};

function Choose({ onPick, hasDraft }) {
  const { lang, simple, tr, setPrefs } = useAccess();
  const t = (k) => pick(T[k], lang, simple);
  return (
    <section className="ax-engine">
      <h1 className="ax-title">{t("welcome")}</h1>
      <h2 className="ax-title" tabIndex={-1}>
        {t("chooseTitle")}
      </h2>
      <p className="ax-hint">{tr("noTimer")}</p>
      {hasDraft && (
        <p className="ax-hint" role="status">
          {tr("resumeFound")}
        </p>
      )}
      <div className="ax-cards">
        <button
          type="button"
          className="ax-card ax-cardbtn"
          onClick={() => {
            setPrefs({ simple: false });
            onPick("form");
          }}
        >
          <MdPerson className="ax-cardicon" aria-hidden="true" />
          <span>{t("standard")}</span>
        </button>
        <button
          type="button"
          className="ax-card ax-cardbtn"
          onClick={() => {
            setPrefs({ simple: true });
            onPick("form");
          }}
        >
          <MdVolumeUp className="ax-cardicon" aria-hidden="true" />
          <span>{t("simple")}</span>
        </button>
        <button
          type="button"
          className="ax-card ax-cardbtn"
          onClick={() => onPick("partner")}
        >
          <MdHandshake className="ax-cardicon" aria-hidden="true" />
          <span>{t("partner")}</span>
        </button>
      </div>
    </section>
  );
}

function Claim({ token, onDone }) {
  const { lang, simple } = useAccess();
  const t = (k) => pick(T[k], lang, simple);
  const [claim, setClaim] = useState(undefined);
  const [outcome, setOutcome] = useState("");

  useEffect(() => {
    let live = true;
    loadClaim(token).then((c) => live && setClaim(c ?? null));
    return () => {
      live = false;
    };
  }, [token]);

  if (claim === undefined) return null;
  if (outcome) {
    return (
      <section className="ax-engine">
        <p role="status">
          {outcome === "kept" ? t("claimKept") : t("claimDeleted")}
        </p>
        <button type="button" className="ax-btn" onClick={onDone}>
          {t("newSignup")}
        </button>
      </section>
    );
  }
  if (!claim) {
    return (
      <section className="ax-engine">
        <p role="alert">{t("claimMissing")}</p>
        <button type="button" className="ax-btn" onClick={onDone}>
          {t("newSignup")}
        </button>
      </section>
    );
  }
  return (
    <section className="ax-engine">
      <h2 className="ax-title" tabIndex={-1}>
        {t("claimTitle")}
      </h2>
      <p>
        <strong>{claim.partnerName}</strong>
      </p>
      <p>{claim.profile.name}</p>
      <div className="ax-row">
        <button
          type="button"
          className="ax-btn ax-btn-primary"
          onClick={() => {
            saveProfile({ answers: claim.profile });
            if (claim.support?.length) saveSupport({ needs: claim.support });
            dropClaim(token);
            setOutcome("kept");
          }}
        >
          <MdCheck aria-hidden="true" /> {t("keep")}
        </button>
        <button
          type="button"
          className="ax-btn"
          onClick={() => {
            dropClaim(token);
            setOutcome("deleted");
          }}
        >
          <MdDelete aria-hidden="true" /> {t("del")}
        </button>
      </div>
    </section>
  );
}

function Inner({ partners, onComplete }) {
  const { lang, simple, tr } = useAccess();
  const t = (k) => pick(T[k], lang, simple);
  const schema = useMemo(() => buildSignupSchema({ partners }), [partners]);
  const profile = getProfile();
  const claimToken = tokenFromUrl("claim");
  const resumeToken = tokenFromUrl("resume");

  const [stage, setStage] = useState(
    claimToken
      ? "claim"
      : resumeToken
        ? "resume"
        : profile
          ? "profile"
          : "choose",
  );
  const [resume, setResume] = useState(null);

  useEffect(() => {
    if (stage !== "resume") return;
    let live = true;
    loadResume(resumeToken).then((r) => {
      if (!live) return;
      setResume(r && r.formId === "signup" ? r : null);
      setStage("form");
    });
    return () => {
      live = false;
    };
  }, [stage, resumeToken]);

  const save = async (a) => {
    const { support, ...rest } = a;
    saveProfile({ answers: rest });
    saveSupport({ needs: support || [] });
    return rest;
  };
  const done = () => (
    <>
      <p>{t("saved")}</p>
      {onComplete && (
        <button
          type="button"
          className="ax-btn ax-btn-primary"
          onClick={() => onComplete(getProfile())}
        >
          {t("next")}
        </button>
      )}
    </>
  );

  if (stage === "resume") return <p role="status">{tr("loading")}</p>;
  if (stage === "claim")
    return (
      <Claim
        token={claimToken}
        onDone={() => {
          window.history.replaceState(null, "", window.location.pathname);
          setStage("choose");
        }}
      />
    );
  if (stage === "partner") return <PartnerRegister partners={partners} />;
  if (stage === "profile") {
    return (
      <FormEngine
        key="profile"
        schema={schema}
        formId="profile-edit"
        initialAnswers={{ ...profile.answers, support: getSupport().needs }}
        startAtReview
        onSubmit={save}
        doneContent={done}
      />
    );
  }
  if (stage === "choose")
    return <Choose onPick={setStage} hasDraft={!!store.get("draft:signup")} />;
  return (
    <FormEngine
      key="signup"
      schema={schema}
      resume={resume ?? undefined}
      onSubmit={save}
      doneContent={done}
    />
  );
}

/**
 * Drop-in sign-up and profile. <AccessibleOnboarding partners={[...]} onComplete={(profile) => ...} />
 * Support needs are saved privately and are never part of the profile passed to onComplete.
 */
export default function AccessibleOnboarding({ partners, onComplete }) {
  return (
    <AccessShell>
      <Inner partners={partners} onComplete={onComplete} />
    </AccessShell>
  );
}
