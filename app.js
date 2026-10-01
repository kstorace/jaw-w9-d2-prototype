(() => {
  const STORAGE_KEY = "jaw-w9-d2-alex-tavera-language-v2";
  const defaultState = {
    view: "overview",
    evidenceExpanded: false,
    sourceOpen: false,
    correctionAccepted: false,
    impactAcknowledged: false,
    decision: null,
    applicationLanguage: null,
    languageChoice: null,
    generated: false,
    regenerated: false,
    approvedV2: false,
    draftV3: false,
    documentTab: "Cover letter",
    modalOrigin: null
  };

  let state = loadState();
  let impactVisible = false;
  const view = document.querySelector("#view");
  const modalRoot = document.querySelector("#modal-root");
  const toast = document.querySelector("#toast");
  let toastTimer;

  function loadState() {
    try { return { ...defaultState, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; }
    catch { return { ...defaultState }; }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch { /* Continue with the current in-memory demo state if storage is unavailable. */ }
  }
  function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c])); }
  function showToast(message) {
    clearTimeout(toastTimer); toast.textContent = message; toast.classList.add("show");
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }
  function setState(patch, message) { state = { ...state, ...patch }; saveState(); render(); if (message) showToast(message); }
  function heading(eyebrow, title, description, pillText, pillClass = "state-current") {
    return `<div class="page-heading"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${description}</p></div><span class="state-pill ${pillClass}">${pillText}</span></div>`;
  }
  function route(next) {
    impactVisible = false;
    if (state.decision === "stop" && next === "alignment") next = "overview";
    if (next === "documents" && state.decision !== "proceed") {
      state.view = "documents"; saveState(); render(); return;
    }
    state.view = next; saveState(); render();
  }

  function overview() {
    if (state.decision === "stop") {
      return heading("Overview", "Senior Strategic Procurement Manager", "Your application remains accessible in the workspace.", "Do not continue", "state-stopped") + `
        <div class="card"><div class="card-section attention-card"><div class="attention-icon" aria-hidden="true">—</div><div><h2>No documents will be generated</h2><p>You have decided not to continue with this application.</p></div></div>
        <div class="card-section"><dl class="meta-list"><div><dt>Company</dt><dd>Tavera Anlagenbau GmbH</dd></div><div><dt>Decision</dt><dd>Do not continue</dd></div><div><dt>Documents</dt><dd>Not generated</dd></div></dl></div></div>`;
    }
    if (state.approvedV2 || state.draftV3) {
      const label = state.draftV3 ? "Draft v3 – unapproved" : "Approved package v2";
      const pill = state.draftV3 ? "Revision open" : "Approved · submission separate";
      return heading("Overview", "Senior Strategic Procurement Manager", "Versions and approvals remain distinct, preserved objects.", pill, state.draftV3 ? "state-current" : "state-approved") + `
        <div class="grid two"><section class="card card-section"><div class="section-title"><h2>Current work</h2><span class="status-pill ${state.draftV3 ? "state-current" : "state-approved"}">${label}</span></div><p class="small-note">${state.draftV3 ? "The new draft is current but unapproved. Approved package v2 is preserved." : "This exact package was approved. Submission remains manual."}</p><div class="button-row"><button class="button primary" data-route="documents">Open documents</button></div></section>${applicationMeta()}</div>`;
    }
    if (state.decision === "proceed") {
      const label = !state.applicationLanguage ? "Application language not established" : !state.generated ? "Documents not yet generated" : state.regenerated ? "Draft v2 – unapproved" : "Draft v1 – review required";
      return heading("Overview", "Senior Strategic Procurement Manager", "You chose Continue. The reassessed alignment remains saved.", label, !state.generated || state.regenerated ? "state-current" : "state-attention") + `
        <div class="grid two"><section class="card card-section"><div class="section-title"><h2>Current work</h2></div><p>${label}</p><div class="button-row"><button class="button primary" data-route="documents">Open documents</button></div></section>${applicationMeta()}</div>`;
    }
    if (state.correctionAccepted && !state.impactAcknowledged) {
      return heading("Overview", "Senior Strategic Procurement Manager", "The correction is saved. Its impact still needs review.", "Impact review pending", "state-attention") + `
        <div class="card attention-card"><div class="attention-icon" aria-hidden="true">!</div><div><h2>Reassess 1 alignment result</h2><p>The corrected vacancy interpretation affects the alignment and one document section.</p></div><button class="button primary" data-route="vacancy">Review impact</button></div>`;
    }
    if (state.impactAcknowledged && !state.decision) {
      return heading("Overview", "Senior Strategic Procurement Manager", "The corrected interpretation and reassessed alignment are saved.", "Decision pending", "state-attention") + `
        <div class="card attention-card"><div class="attention-icon" aria-hidden="true">?</div><div><h2>Your decision is still pending</h2><p>Would you like to continue with this application?</p></div><button class="button primary" data-route="alignment">Review alignment</button></div>`;
    }
    return heading("Overview", "Senior Strategic Procurement Manager", "Review the unresolved vacancy interpretation before deciding on this application.", "1 item needs attention", "state-attention") + `
      <div class="grid two"><div class="grid"><section class="card attention-card"><div class="attention-icon" aria-hidden="true">!</div><div><h2>1 vacancy interpretation remains unclear</h2><p>Several years of strategic procurement experience</p></div><button class="button primary" data-route="alignment">Review alignment</button></section><section class="card card-section"><div class="section-title"><h2>Orientation</h2></div><p class="small-note">You can open any workspace at any time. Navigation does not change a decision, approval or version.</p></section></div>${applicationMeta()}</div>`;
  }

  function applicationMeta() { return `<section class="card card-section"><div class="section-title"><h2>Application details</h2></div><dl class="meta-list"><div><dt>Company</dt><dd>Tavera Anlagenbau GmbH</dd></div><div><dt>Location</dt><dd>Weinheim (Bergstraße), hybrid</dd></div><div><dt>Employment</dt><dd>Full-time, permanent</dd></div><div><dt>Reference</dt><dd>EK-2026-14</dd></div><div><dt>Application language</dt><dd>${state.applicationLanguage || "Not established"} · this application</dd></div></dl></section>`; }

  function vacancy() {
    if (impactVisible || (state.correctionAccepted && !state.impactAcknowledged)) return impact();
    const accepted = state.correctionAccepted;
    return heading("Vacancy", "Review interpretation", "JAW labels its interpretation. You decide whether to accept the correction.", accepted ? "Correction saved" : "Review required", accepted ? "state-approved" : "state-attention") + `
      <div class="grid two"><section class="card card-section"><div class="section-title"><h2>Requirement</h2><span class="small-note">Source: original German vacancy</span></div><div class="interpretation"><div class="interpretation-item"><span class="interpretation-label">JAW interpretation</span><p>At least 8 years of strategic procurement experience are mandatory</p></div><div class="interpretation-item corrected"><span class="interpretation-label">Your correction</span><p>At least 8 years as a preferred guideline; mandatory status remains unresolved</p></div></div><div class="button-row">${accepted && state.decision === "stop" ? `<button class="button secondary" data-route="overview">Back to overview</button>` : accepted ? `<button class="button primary" data-action="show-impact">Show impact</button>` : `<button class="button primary" data-action="accept-correction">Accept correction</button><button class="button tertiary" data-action="cancel-correction">Cancel</button>`}</div></section>
      <aside class="card card-section"><div class="section-title"><h2>Original source · German</h2></div><blockquote class="small-note" lang="de">„Sie bringen mehrjährige Berufserfahrung im strategischen Einkauf mit, idealerweise mindestens acht Jahre, davon einen wesentlichen Teil im Maschinen- und Anlagenbau oder in einem vergleichbaren industriellen Fertigungsumfeld.“</blockquote><p class="small-note">The German wording suggests a preferred guideline but leaves mandatory status unresolved. This correction is a working interpretation, not a new employer statement.</p></aside></div>`;
  }

  function impact() {
    return heading("Vacancy", "Correction impact", "Only dependent content is marked for review. Other content remains valid.", "Correction accepted", "state-approved") + `
      <section class="card card-section"><div class="impact-flow"><div class="impact-node changed"><strong>Changed</strong><span>Vacancy interpretation</span></div><div class="impact-arrow" aria-hidden="true">→</div><div class="impact-node affected"><strong>Affected</strong><span>1 alignment result – ${state.impactAcknowledged ? "reassessed" : "awaiting reassessment"}</span></div><div class="impact-arrow" aria-hidden="true">→</div><div class="impact-node affected"><strong>Affected</strong><span>1 document section – ${state.regenerated ? "regenerated" : state.generated ? "review before approval" : "planned content; not yet generated"}</span></div></div><div class="unaffected"><strong>Unaffected</strong><span>Other requirements and evidence remain unchanged. Unaffected document content will be preserved once generated.</span></div><div class="button-row"><button class="button primary" data-action="ack-impact">Go to alignment</button>${state.decision === "proceed" ? `<button class="button secondary" data-route="documents">Go to document</button>` : `<button class="button" disabled title="Available only after your decision">Go to document</button>`}</div></section>`;
  }

  function alignment() {
    if (state.decision === "stop") return overview();
    if (state.impactAcknowledged) return alignmentDecision();
    const detail = state.evidenceExpanded ? `<div class="requirement-detail"><div class="evidence-grid"><div class="evidence-block"><strong>Requirement meaning</strong><p>The vacancy describes eight years as an ideal minimum. Its mandatory status is unclear on the vacancy side.</p></div><div class="evidence-block"><strong>Profile evidence</strong><p>Alex Kinsella · Head of Strategic Procurement, Rheinmark<br><span class="small-note">04/2018 – 06/2026 · approximately 21 years in German mechanical and plant-engineering procurement</span></p></div><div class="evidence-block"><strong>Why unclear?</strong><p>Alex’s strategic procurement experience is directly evidenced. The uncertainty concerns the vacancy’s weighting of eight years, not his experience.</p></div></div><div class="button-row"><button class="button secondary" data-action="toggle-source">${state.sourceOpen ? "Hide source" : "Show source"}</button><button class="button primary" data-route="vacancy">Review interpretation</button></div>${state.sourceOpen ? `<div class="source-disclosure"><blockquote lang="de">„Sie bringen mehrjährige Berufserfahrung im strategischen Einkauf mit, idealerweise mindestens acht Jahre, davon einen wesentlichen Teil im Maschinen- und Anlagenbau oder in einem vergleichbaren industriellen Fertigungsumfeld.“</blockquote><cite>Tavera · original German vacancy v1.0 · section: <span lang="de">Ihr Profil</span> · EK-2026-14</cite></div>` : ""}</div>` : "";
    return heading("Alignment", "Requirement alignment", "Review Alex’s evidence and the vacancy interpretation. Missing evidence does not establish lack of capability.", "1 item needs attention", "state-attention") + `
      <section class="card card-section"><div class="requirement-list"><article class="requirement"><button data-action="toggle-evidence" aria-expanded="${state.evidenceExpanded}"><span><h3>Several years of strategic procurement experience</h3><small>${state.evidenceExpanded ? "Evidence and vacancy interpretation expanded" : "Review vacancy interpretation"}</small></span><span class="status-pill state-attention">Interpretation unclear</span><span aria-hidden="true">${state.evidenceExpanded ? "⌃" : "⌄"}</span></button>${detail}</article>${contextRequirements()}</div></section>`;
  }

  function staticRequirement(title, status, cls, evidence) {
    return `<article class="requirement"><button type="button" disabled><span><h3>${title}</h3><small>${evidence}</small></span><span class="status-pill ${cls}">${status}</span><span aria-hidden="true">—</span></button></article>`;
  }

  function contextRequirements() {
    return staticRequirement("Supplier management & contract negotiations", "Directly evidenced", "state-approved", "Alex: supplier management, consolidation and negotiation experience.")
      + staticRequirement("Procurement leadership", "Directly evidenced", "state-approved", "Rheinmark: leadership of six buyers; Tavera asks for functional or line leadership, or coordination.")
      + staticRequirement("Procurement ERP experience / SAP", "Directly evidenced", "state-approved", "SAP S/4HANA MM key-user experience. SAP is advantageous in the vacancy; the ERP experience threshold remains unspecified.")
      + staticRequirement("Practical LkSG implementation", "Related evidence", "state-current", "LkSG training in 2023 and supplier management; personal implementation or programme ownership not established.")
      + staticRequirement("Digital E-Sourcing / Source-to-Contract", "No verified evidence identified", "state-attention", "Experience with these solutions or KORVAX S2C is not established. This does not establish lack of capability.");
  }

  function alignmentDecision() {
    return heading("Alignment", "Alignment after correction", "The alignment was reassessed: experience is directly evidenced; the eight-year mandatory status remains unresolved. Other evidence states are unchanged.", "Reassessed", "state-approved") + `
      <section class="card card-section"><article class="requirement"><button type="button" disabled><span><h3>Several years of strategic procurement experience</h3><small>Alex Kinsella · Rheinmark, 04/2018–06/2026. Experience is directly evidenced; the eight-year mandatory status remains unresolved.</small></span><span class="status-pill state-approved">Evidenced</span><span aria-hidden="true">✓</span></button></article><div class="requirement-list">${contextRequirements()}</div>${state.decision === null ? `<div class="decision-box"><h2>Your decision</h2><p>Would you like to continue with this application?</p><div class="button-row"><button class="button primary" data-action="proceed">Continue</button><button class="button danger-subtle" data-action="stop">Do not continue</button></div></div>` : `<div class="decision-box"><h2>Your decision</h2><p>Continue selected. The reassessed alignment is preserved.</p><div class="button-row"><button class="button primary" data-route="documents">Open documents</button></div></div>`}</section>`;
  }

  function documents() {
    if (state.decision !== "proceed") {
      const blocked = state.decision === "stop" ? "You chose not to continue. No documents were generated." : "Documents can only be generated after you review the alignment and explicitly choose Continue.";
      return heading("Documents", "No application documents yet", blocked, state.decision === "stop" ? "Do not continue" : "Decision pending", state.decision === "stop" ? "state-stopped" : "state-attention") + `<section class="card card-section"><p>${blocked}</p><div class="button-row"><button class="button secondary" data-route="${state.decision === "stop" ? "overview" : "alignment"}">${state.decision === "stop" ? "Back to overview" : "Go to alignment"}</button></div></section>`;
    }
    if (!state.applicationLanguage || !state.generated) return languagePrerequisite();
    if (state.draftV3) return draftV3();
    if (state.approvedV2) return approvedV2();
    if (state.regenerated) return packageV2();
    return affectedDraft();
  }

  function languageContext() {
    return `<p class="small-note"><strong>Application language: ${state.applicationLanguage || "Not established"}</strong> · This application only; not a global profile setting.</p>`;
  }

  function languagePrerequisite() {
    const established = !!state.applicationLanguage;
    return heading("Documents", "Application documents not yet generated", established ? "Application language is established. Generation is a separate action." : "Establish the language for this application before substantive documents can be generated.", established ? "Ready to generate" : "Language not established", "state-current") + `<section class="card card-section">${languageContext()}${established ? "" : `<fieldset class="language-choice"><legend>Application language</legend><p class="small-note">English and German are both permitted. Neither is selected or recommended by default.</p><div class="button-row"><label><input type="radio" name="application-language" data-language="English" ${state.languageChoice === "English" ? "checked" : ""}> English</label><label><input type="radio" name="application-language" data-language="German" ${state.languageChoice === "German" ? "checked" : ""}> German</label></div><p class="small-note">Selected: ${state.languageChoice || "None"}. Selection alone does not establish the language or generate documents.</p></fieldset><div class="button-row"><button class="button primary" data-action="confirm-language" ${state.languageChoice ? "" : "disabled"}>Confirm language</button></div>` }<p class="small-note">${established ? "No documents exist yet. Generate them when you are ready; this does not approve or submit them." : "Generation is unavailable because the application language has not been confirmed. No CV or cover letter has been generated."}</p><div class="button-row"><button class="button primary" data-action="generate" ${established ? "" : "disabled"}>Generate documents</button></div></section>`;
  }

  function letterPreview(version, affected = false) {
    const german = state.applicationLanguage === "German";
    const body = german
      ? `<h3>Bewerbung als Senior Strategic Procurement Manager (m/w/d)<br><span class="small-note">Lieferantenmanagement &amp; Beschaffungsstrategie · EK-2026-14</span></h3><p>Sehr geehrte Frau Ostheim,</p><p>hiermit bewerbe ich mich als Senior Strategic Procurement Manager bei Tavera Anlagenbau GmbH.</p><p class="${affected ? "affected-passage" : ""}">${affected ? "Zu prüfen: Die Darstellung meiner Einkaufserfahrung wurde auf die bisherige Interpretation einer zwingenden Acht-Jahres-Anforderung zugeschnitten." : "Ich verfüge über rund 21 Jahre Einkaufserfahrung im deutschen Maschinen- und Anlagenbau. Von April 2018 bis Juni 2026 war ich Head of Strategic Procurement bei Rheinmark."}</p><p>Meine Erfahrung umfasst strategischen Einkauf, Lieferantenmanagement und -konsolidierung, Vertragsverhandlungen sowie die Führung von sechs Einkäufern. Für SAP S/4HANA MM liegt Key-User-Erfahrung vor.</p><p>Eine LkSG-Schulung habe ich 2023 abgeschlossen. Sie wird hier nicht als Nachweis praktischer LkSG-Implementierungsverantwortung dargestellt.</p><p>Ich bin sofort verfügbar; eine Kündigungsfrist besteht nicht.</p><p>Mit freundlichen Grüßen<br>Alex Kinsella</p>`
      : `<h3>Application for Senior Strategic Procurement Manager<br><span class="small-note">Supplier management &amp; procurement strategy · EK-2026-14</span></h3><p>Dear Ms Ostheim,</p><p>I am applying for the Senior Strategic Procurement Manager position at Tavera Anlagenbau GmbH.</p><p class="${affected ? "affected-passage" : ""}">${affected ? "For review: The presentation of my procurement experience was tailored to the previous interpretation of a mandatory eight-year requirement." : "I have approximately 21 years of procurement experience in German mechanical and plant engineering. From April 2018 to June 2026, I was Head of Strategic Procurement at Rheinmark."}</p><p>My experience includes strategic procurement, supplier management and consolidation, contract negotiations, and leadership of six buyers. I have SAP S/4HANA MM key-user experience.</p><p>I completed LkSG training in 2023. This is not presented as evidence of responsibility for practical LkSG implementation.</p><p>I am immediately available and have no notice period.</p><p>Yours sincerely,<br>Alex Kinsella</p>`;
    return `<div class="document-preview"><div class="document-toolbar"><span>Cover letter · ${version}</span><span>Preview · ${state.applicationLanguage}</span></div><div class="letter" lang="${german ? "de" : "en"}">${body}</div></div>`;
  }

  function cvPreview(version) {
    const german = state.applicationLanguage === "German";
    const body = german
      ? `<h3>Alex Kinsella</h3><p>Rund 21 Jahre Einkaufserfahrung im deutschen Maschinen- und Anlagenbau.</p><p><strong>Head of Strategic Procurement · Rheinmark</strong><br>April 2018 – Juni 2026<br>Führung von sechs Einkäufern · strategischer Einkauf · Lieferantenmanagement und -konsolidierung · Vertragsverhandlungen</p><p>SAP S/4HANA MM · Key-User-Erfahrung</p><p>LkSG-Schulung · 2023</p><p>Sofort verfügbar · keine Kündigungsfrist</p>`
      : `<h3>Alex Kinsella</h3><p>Approximately 21 years of procurement experience in German mechanical and plant engineering.</p><p><strong>Head of Strategic Procurement · Rheinmark</strong><br>April 2018 – June 2026<br>Leadership of six buyers · strategic procurement · supplier management and consolidation · contract negotiations</p><p>SAP S/4HANA MM · key-user experience</p><p>LkSG training · 2023</p><p>Immediately available · no notice period</p>`;
    return `<div class="document-preview"><div class="document-toolbar"><span>CV · ${version}</span><span>Excerpt · ${state.applicationLanguage}</span></div><div class="letter" lang="${german ? "de" : "en"}">${body}</div></div>`;
  }

  function packageNote() {
    return `<p class="small-note"><strong>Package scope:</strong> CV + cover letter. <strong>Salary expectation:</strong> unknown / not established. The vacancy requests it for manual submission; it has not been supplied.</p>`;
  }

  function affectedDraft() {
    return heading("Documents", "Application documents – draft v1", "The correction affects exactly one section. Unchanged content is preserved.", "Review required", "state-attention") + `<div class="grid two"><section>${languageContext()}${letterPreview("Draft v1", true)}</section><aside class="card card-section"><div class="section-title"><h2>Affected content</h2></div><p class="small-note">The marked section reflects the earlier vacancy interpretation and must be regenerated using the correction before approval.</p><div class="button-row"><button class="button primary" data-action="regenerate">Regenerate</button><button class="button" disabled title="Not implemented in this prototype">Edit section</button></div></aside></div>`;
  }

  function tabs() { return `<div class="document-tabs" role="tablist" aria-label="Package documents">${["Cover letter","CV"].map(t => `<button role="tab" aria-selected="${state.documentTab === t}" data-tab="${t}">${t}</button>`).join("")}</div>`; }
  function packageV2() {
    const content = state.documentTab === "Cover letter" ? letterPreview("v2") : cvPreview("v2");
    return heading("Documents", "Application documents – draft v2", "Review both documents in the bounded demo package. Approval applies only to this exact version.", "Draft – unapproved", "state-current") + `<section class="card card-section">${languageContext()}${tabs()}<div class="exact-version"><strong>Your approval applies to this exact version (v2).</strong></div>${content}${packageNote()}<div class="button-row"><button class="button primary" data-action="approve-v2">Approve this version</button></div></section>`;
  }

  function approvedV2() {
    return heading("Documents", "Approved package v2", "This exact package was approved and is preserved.", "Approved · submission separate", "state-approved") + `<div class="grid two"><section class="card card-section"><div class="section-title"><h2>Package v2</h2><span class="status-pill state-approved">Approved</span></div>${languageContext()}<p>The approved cover letter and CV remain preserved without changes.</p><div class="button-row"><button class="button secondary" data-action="open-v2">View approved package</button><button class="button primary" data-action="create-v3">Create revised draft</button></div></section><aside class="card card-section"><div class="section-title"><h2>Submission</h2></div><p><strong>Submission is manual.</strong></p>${packageNote()}<p class="small-note">Approval prepares the package. It does not submit an external application.</p><button class="button" disabled title="Intentional system boundary of this prototype">Record submission</button></aside></div>`;
  }

  function draftV3() {
    return heading("Documents", "Application documents", "The new draft is current. The previously approved package remains preserved as an exact version.", "Draft v3 – unapproved", "state-current") + `<section class="card card-section">${languageContext()}<div class="version-stack"><article class="version-card current"><div><h3>v3 – Draft</h3><p>Current revision · unapproved</p></div><span class="status-pill state-current">Unapproved</span></article><article class="version-card approved"><div><h3>v2 – Approved</h3><p>Preserved unchanged · manual submission remains separate</p></div><span class="status-pill state-approved">Approved</span></article></div><div class="button-row"><button class="button secondary" data-action="open-v2">View v2</button><button class="button primary" data-action="continue-v3">Continue editing v3</button></div></section>`;
  }

  function history() {
    const events = [];
    if (state.draftV3) events.push(["Draft v3 created", "Current · unapproved"]);
    if (state.approvedV2) events.push(["Package v2 approved", "Exact version preserved"]);
    if (state.regenerated) events.push(["Documents regenerated", "Draft v2"]);
    if (state.generated) events.push(["Application documents generated", state.applicationLanguage]);
    if (state.applicationLanguage) events.push(["Application language established", `${state.applicationLanguage} · this application`]);
    if (state.decision === "proceed") events.push(["Continue selected", "Your decision"]);
    if (state.decision === "stop") events.push(["Do not continue selected", "No documents generated"]);
    if (state.impactAcknowledged) events.push(["Alignment reassessed", "After correction"]);
    if (state.correctionAccepted) events.push(["Vacancy interpretation corrected", "Working interpretation corrected; mandatory status unresolved"]);
    events.push(["Vacancy added", "Tavera · EK-2026-14"]);
    return heading("Status & history", "Status and history", "Current state is separate from event history. The entries are not mandatory steps.", state.approvedV2 ? "Package v2 approved" : state.decision === "stop" ? "Do not continue" : "In progress", state.approvedV2 ? "state-approved" : state.decision === "stop" ? "state-stopped" : "state-current") + `<section class="card card-section"><ol class="timeline">${events.map(e => `<li><span class="timeline-dot" aria-hidden="true"></span><div><strong>${e[0]}</strong><small>${e[1]}</small></div></li>`).join("")}</ol></section>`;
  }

  function render() {
    document.querySelectorAll("[data-route]").forEach(el => el.removeAttribute("aria-current"));
    document.querySelectorAll(`.sidebar [data-route="${state.view}"]`).forEach(el => el.setAttribute("aria-current", "page"));
    const navDot = document.querySelector(".nav-dot");
    if (navDot) navDot.hidden = !(state.decision === null && !state.approvedV2);
    const renderers = { overview, vacancy, alignment, documents, history };
    view.innerHTML = (renderers[state.view] || overview)();
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function openV2() {
    if (!state.approvedV2 || !state.applicationLanguage || !state.generated) return;
    state.modalOrigin = state.draftV3 ? "v3" : "approved"; saveState();
    document.querySelector(".app-shell").inert = true;
    modalRoot.innerHTML = `<div class="modal-backdrop" data-action="close-modal"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header><div><span class="eyebrow">Read-only version</span><h2 id="modal-title">Approved package v2</h2></div><button class="modal-close" data-action="close-modal" aria-label="Close">×</button></header><div class="modal-body"><div class="exact-version"><strong>Approved demo package · This exact package remains unchanged.</strong></div>${languageContext()}${letterPreview("v2")}${cvPreview("v2")}${packageNote()}<p class="small-note">Inspection changes neither v2’s status nor the current draft’s status.</p></div></section></div>`;
    setTimeout(() => modalRoot.querySelector(".modal-close")?.focus(), 0);
  }
  function closeModal() { modalRoot.innerHTML = ""; document.querySelector(".app-shell").inert = false; state.modalOrigin = null; saveState(); document.querySelector('[data-action="open-v2"]')?.focus(); }

  document.addEventListener("click", event => {
    const routeTarget = event.target.closest("[data-route]");
    if (routeTarget) { event.preventDefault(); route(routeTarget.dataset.route); return; }
    const tab = event.target.closest("[data-tab]");
    if (tab) { setState({ documentTab: tab.dataset.tab }); return; }
    const target = event.target.closest("[data-action]"); if (!target) return;
    if (target.dataset.action === "close-modal" && event.target !== target && !event.target.closest(".modal-close")) return;
    const actions = {
      "toggle-evidence": () => setState({ evidenceExpanded: !state.evidenceExpanded, sourceOpen: false }),
      "toggle-source": () => setState({ sourceOpen: !state.sourceOpen }),
      "cancel-correction": () => setState({ view: "alignment", evidenceExpanded: true }),
      "accept-correction": () => setState({ correctionAccepted: true }, "Correction saved"),
      "show-impact": () => { impactVisible = true; render(); },
      "ack-impact": () => {
        impactVisible = false;
        if (state.impactAcknowledged) route("alignment");
        else setState({ impactAcknowledged: true, view: "alignment" }, "Alignment reassessed");
      },
      "proceed": () => setState({ decision: "proceed", view: "documents" }, "Decision saved"),
      "stop": () => setState({ decision: "stop", view: "overview" }, "Decision saved – no documents generated"),
      "confirm-language": () => {
        if (state.decision === "proceed" && !state.applicationLanguage && ["English", "German"].includes(state.languageChoice)) {
          setState({ applicationLanguage: state.languageChoice }, "Application language established");
          document.querySelector('[data-action="generate"]')?.focus();
        }
      },
      "generate": () => {
        if (state.decision === "proceed" && state.applicationLanguage && !state.generated) setState({ generated: true }, "Application documents generated");
      },
      "regenerate": () => { if (state.generated && state.applicationLanguage) setState({ regenerated: true }, "Affected section regenerated"); },
      "approve-v2": () => { if (state.generated && state.regenerated && state.applicationLanguage) setState({ approvedV2: true }, "Package v2 approved"); },
      "create-v3": () => { if (state.approvedV2) setState({ draftV3: true }, "Draft v3 created – unapproved"); },
      "open-v2": openV2,
      "close-modal": closeModal,
      "continue-v3": () => showToast("v3 remains an unapproved draft.")
    };
    actions[target.dataset.action]?.();
  });

  document.addEventListener("change", event => {
    const language = event.target.closest("[data-language]");
    if (language && state.decision === "proceed" && !state.applicationLanguage && ["English", "German"].includes(language.dataset.language)) {
      state.languageChoice = language.dataset.language; saveState(); render();
      document.querySelector(`[data-language="${state.languageChoice}"]`)?.focus();
    }
  });

  document.addEventListener("keydown", event => {
    if (!modalRoot.innerHTML) return;
    if (event.key === "Escape") { closeModal(); return; }
    if (event.key === "Tab") {
      const focusable = [...modalRoot.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])')].filter(el => !el.disabled);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  document.querySelector(".prototype-reset").addEventListener("click", () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* Reset still works in memory. */ }
    state = { ...defaultState }; impactVisible = false; saveState(); modalRoot.innerHTML = ""; document.querySelector(".app-shell").inert = false; render(); showToast("Demo reset");
  });
  render();
})();
