import { useEffect, useState } from "react";

import api from "./services/api";
import CameraCapture from "./components/CameraCapture";
import CardUploader from "./components/CardUploader";

import "./App.css";

const EMPTY_CONTACT = {
  name: "",
  company_name: "",
  designation: "",
  mobile_numbers: [],
  email_addresses: [],
  website: "",
  address: "",
  linkedin: "",
  other_details: ""
};

const PROCESSING_STEPS = [
  "Reading card image...",
  "Extracting contact details...",
  "Structuring the information...",
  "Preparing your review..."
];

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

function App() {
  const [currentStep, setCurrentStep] = useState("upload");
  const [side1, setSide1] = useState(null);
  const [side2, setSide2] = useState(null);
  const [side1Preview, setSide1Preview] = useState(null);
  const [side2Preview, setSide2Preview] = useState(null);
  const [activeCamera, setActiveCamera] = useState(null);
  const [contact, setContact] = useState(null);
  const [error, setError] = useState("");
  const [processingIndex, setProcessingIndex] = useState(0);
  const [savedContactName, setSavedContactName] = useState("");

  const processingText = PROCESSING_STEPS[processingIndex];

  useEffect(() => {
    if (currentStep !== "processing") return undefined;

    const interval = window.setInterval(() => {
      setProcessingIndex((previous) =>
        previous >= PROCESSING_STEPS.length - 1 ? previous : previous + 1
      );
    }, 550);

    return () => window.clearInterval(interval);
  }, [currentStep]);

  useEffect(() => {
    return () => {
      if (side1Preview) URL.revokeObjectURL(side1Preview);
      if (side2Preview) URL.revokeObjectURL(side2Preview);
    };
  }, [side1Preview, side2Preview]);

  const handleFileChange = (file, side) => {
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Please upload a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image size must be less than 10 MB.");
      return;
    }

    const preview = URL.createObjectURL(file);

    if (side === "side1") {
      if (side1Preview) URL.revokeObjectURL(side1Preview);
      setSide1(file);
      setSide1Preview(preview);
    } else {
      if (side2Preview) URL.revokeObjectURL(side2Preview);
      setSide2(file);
      setSide2Preview(preview);
    }

    setError("");
  };

  const removeCard = (side) => {
    if (side === "side1") {
      if (side1Preview) URL.revokeObjectURL(side1Preview);
      setSide1(null);
      setSide1Preview(null);
    } else {
      if (side2Preview) URL.revokeObjectURL(side2Preview);
      setSide2(null);
      setSide2Preview(null);
    }
  };

  const handleCameraCapture = (file) => {
    if (!activeCamera) return;
    handleFileChange(file, activeCamera);
    setActiveCamera(null);
  };

  const scanCard = async () => {
    if (!side1) {
      setError("Please capture or upload the front side of the visiting card.");
      return;
    }

    setError("");
    setProcessingIndex(0);
    setCurrentStep("processing");

    try {
      const formData = new FormData();
      formData.append("side1", side1);
      if (side2) formData.append("side2", side2);

      const response = await api.post("/api/scan-card", formData);
      const data = response.data?.data || response.data || {};

      setContact({
        ...EMPTY_CONTACT,
        ...data,
        mobile_numbers: Array.isArray(data.mobile_numbers) ? data.mobile_numbers : [],
        email_addresses: Array.isArray(data.email_addresses) ? data.email_addresses : []
      });
      setCurrentStep("review");
    } catch (err) {
      console.error("SCAN ERROR:", err);
      setError(
        err.response?.data?.detail ||
        "Unable to scan the visiting card. Please try again."
      );
      setCurrentStep("upload");
    }
  };

  const updateField = (field, value) => {
    setContact((previous) => (previous ? { ...previous, [field]: value } : previous));
  };

  const updateListField = (field, index, value) => {
    setContact((previous) => {
      if (!previous) return previous;
      const updated = [...(previous[field] || [])];
      updated[index] = value;
      return { ...previous, [field]: updated };
    });
  };

  const addListItem = (field) => {
    setContact((previous) =>
      previous ? { ...previous, [field]: [...(previous[field] || []), ""] } : previous
    );
  };

  const removeListItem = (field, index) => {
    setContact((previous) =>
      previous
        ? { ...previous, [field]: (previous[field] || []).filter((_, i) => i !== index) }
        : previous
    );
  };

  const saveContact = async () => {
    if (!contact) return;

    setError("");
    setCurrentStep("saving");

    try {
      const cleanedContact = {
        ...contact,
        mobile_numbers: (contact.mobile_numbers || []).filter((number) => number?.trim()),
        email_addresses: (contact.email_addresses || []).filter((email) => email?.trim())
      };

      await api.post("/api/contacts/save", cleanedContact);
      setSavedContactName(cleanedContact.name || "Contact");
      window.setTimeout(() => setCurrentStep("success"), 400);
    } catch (err) {
      console.error("SAVE ERROR:", err);
      setError(
        err.response?.data?.detail ||
        "Unable to save the contact. Please try again."
      );
      setCurrentStep("review");
    }
  };

  const resetApplication = () => {
    if (side1Preview) URL.revokeObjectURL(side1Preview);
    if (side2Preview) URL.revokeObjectURL(side2Preview);
    setSide1(null);
    setSide2(null);
    setSide1Preview(null);
    setSide2Preview(null);
    setContact(null);
    setError("");
    setProcessingIndex(0);
    setSavedContactName("");
    setActiveCamera(null);
    setCurrentStep("upload");
  };

  const stepNumber = currentStep === "upload" ? 1 : currentStep === "success" ? 3 : 2;

  return (
    <div className="app-shell">
      <div className="background-orb orb-one" />
      <div className="background-orb orb-two" />
      <div className="background-grid" />

      <header className="topbar">
        <button type="button" className="brand" onClick={resetApplication}>
          <div className="brand-icon">CF</div>
          <div>
            <h1>CardFlow <span>AI</span></h1>
            <p>Intelligent Contact Capture</p>
          </div>
        </button>
        <div className="topbar-right">
          <div className="secure-badge"><span className="secure-dot" />Secure AI Processing</div>
          <div className="step-indicator" aria-label={`Step ${stepNumber} of 3`}>
            {[1, 2, 3].map((step, index) => (
              <div className="step-indicator-part" key={step}>
                <div className={`mini-step ${step <= stepNumber ? "active" : ""}`}>{step}</div>
                {index < 2 && <div className={`mini-line ${step < stepNumber ? "filled" : ""}`} />}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="main-content">
        {currentStep === "upload" && (
          <UploadScreen side1Preview={side1Preview} side2Preview={side2Preview} error={error} onFileChange={handleFileChange} onOpenCamera={setActiveCamera} onRemove={removeCard} onContinue={scanCard} />
        )}
        {currentStep === "processing" && (
          <ProcessingScreen side1Preview={side1Preview} side2Preview={side2Preview} processingText={processingText} processingIndex={processingIndex} />
        )}
        {currentStep === "review" && contact && (
          <ReviewScreen contact={contact} side1Preview={side1Preview} side2Preview={side2Preview} error={error} onBack={() => { setError(""); setCurrentStep("upload"); }} onSave={saveContact} updateField={updateField} updateListField={updateListField} addListItem={addListItem} removeListItem={removeListItem} />
        )}
        {currentStep === "saving" && <SavingScreen />}
        {currentStep === "success" && <SuccessScreen savedContactName={savedContactName} onNewScan={resetApplication} />}
      </main>

      {activeCamera && (
        <CameraCapture sideLabel={activeCamera === "side1" ? "Front Side" : "Back Side"} onCapture={handleCameraCapture} onClose={() => setActiveCamera(null)} />
      )}
    </div>
  );
}

function UploadScreen({ side1Preview, side2Preview, error, onFileChange, onOpenCamera, onRemove, onContinue }) {
  return (
    <section className="screen screen-upload screen-enter">
      <div className="hero-section">
        <div className="hero-copy">
          <div className="hero-chip"><span>✦</span>SMART VISITING CARD CAPTURE</div>
          <h2>Scan once.<span>Organize instantly.</span></h2>
          <p>Capture the front and optional back of any visiting card. CardFlow AI extracts the contact details and prepares them for review.</p>
          <div className="hero-features"><div><span>01</span>AI extraction</div><div><span>02</span>Human review</div><div><span>03</span>One-click save</div></div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-card-stack card-back" /><div className="hero-card-stack card-middle" />
          <div className="hero-ai-card">
            <div className="ai-card-top"><div className="mini-profile" /><div><strong>Contact intelligence</strong><small>Live AI pipeline</small></div><div className="ai-pulse">●</div></div>
            <div className="ai-lines"><span /><span /><span /><span /></div><div className="hero-scan-line" />
          </div>
          <div className="floating-tag tag-one">LIVE ANALYSIS</div><div className="floating-tag tag-two">READY TO SAVE</div>
        </div>
      </div>

      <section className="scanner-panel">
        <div className="panel-heading advanced-panel-heading">
          <div><div className="section-number"><span>01</span><small>CAPTURE</small></div><h2>Add your visiting card</h2><p>Front side is required. Back side is optional for cards with extra information.</p></div>
          <div className="panel-progress"><div className="progress-label"><span>Capture</span><strong>1 / 3</strong></div><div className="progress-track"><span /></div></div>
        </div>
        <div className="scanner-grid">
          <CardUploader title="Front Side" required={true} preview={side1Preview} onFileChange={(file) => onFileChange(file, "side1")} onOpenCamera={() => onOpenCamera("side1")} onRemove={() => onRemove("side1")} />
          <CardUploader title="Back Side" required={false} preview={side2Preview} onFileChange={(file) => onFileChange(file, "side2")} onOpenCamera={() => onOpenCamera("side2")} onRemove={() => onRemove("side2")} />
        </div>
        {error && <div className="inline-error"><span>⚠</span>{error}</div>}
        <div className="scan-footer"><div className="scan-security"><div className="security-icon">🔒</div><div><strong>Protected processing</strong><p>Images are used only for contact extraction.</p></div></div><button type="button" className="scan-ai-button" onClick={onContinue} disabled={!side1Preview}>Scan with AI <span>→</span></button></div>
      </section>
    </section>
  );
}

function ProcessingScreen({ side1Preview, side2Preview, processingText, processingIndex }) {
  return (
    <section className="processing-screen screen-enter">
      <div className="processing-glow" />
      <div className="processing-card">
        <div className="processing-visual">
          <div className="processing-rings ring-one" /><div className="processing-rings ring-two" /><div className="processing-rings ring-three" />
          <div className="processing-card-preview">{side1Preview ? <img src={side1Preview} alt="Card being analyzed" /> : <span>🪪</span>}<div className="processing-scan-line" /></div>
          {side2Preview && <div className="processing-side-two"><img src={side2Preview} alt="Back side" /></div>}
        </div>
        <div className="processing-content">
          <div className="processing-label">AI EXTRACTION</div>
          <h2>Reading your<span>visiting card.</span></h2>
          <p>Fast extraction is in progress. We will open the review screen as soon as the response arrives.</p>
          <div className="processing-status"><div className="status-spinner" /><span>{processingText}</span></div>
          <div className="processing-checklist">
            {PROCESSING_STEPS.map((step, index) => <ProcessingItem key={step} done={processingIndex > index} active={processingIndex === index} number={index + 1} text={step.replace('...', '')} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessingItem({ done, active, number, text }) {
  return <div className={`processing-item ${done ? "completed" : ""} ${active ? "active" : ""}`}><span>{done ? "✓" : number}</span>{text}</div>;
}

function ReviewScreen({ contact, side1Preview, side2Preview, error, onBack, onSave, updateField, updateListField, addListItem, removeListItem }) {
  return (
    <section className="screen-review screen-enter">
      <div className="review-header"><button type="button" className="back-button" onClick={onBack}>← Back to card</button><div className="review-title"><div className="section-number"><span>02</span><small>REVIEW & EDIT</small></div><h2>Verify your<span>contact details.</span></h2><p>Correct anything before saving.</p></div><div className="extraction-complete">✓ Extraction complete</div></div>
      {error && <div className="inline-error"><span>⚠</span>{error}</div>}
      <div className="review-layout">
        <aside className="review-sidebar"><div className="card-preview-title"><span>ORIGINAL</span><strong>CARD PREVIEW</strong></div>{side1Preview && <div className="review-card-image"><img src={side1Preview} alt="Front side" /></div>}{side2Preview && <div className="review-card-image secondary-preview"><img src={side2Preview} alt="Back side" /></div>}<button type="button" className="change-card-button" onClick={onBack}>↺ Change images</button></aside>
        <section className="contact-editor">
          <div className="editor-header"><div><span className="section-number">CONTACT DATA</span><h3>Extracted details</h3></div><div className="editor-status">Ready to save</div></div>
          <div className="form-section"><div className="form-section-title"><div className="form-title-icon">👤</div><div><h4>Basic information</h4><p>Name, company and professional details</p></div></div><div className="advanced-form-grid">
            <FormField label="Full Name" value={contact.name} placeholder="Enter full name" onChange={(value) => updateField("name", value)} />
            <FormField label="Company / Organization" value={contact.company_name} placeholder="Enter company name" onChange={(value) => updateField("company_name", value)} />
            <FormField label="Designation" value={contact.designation} placeholder="Enter designation" onChange={(value) => updateField("designation", value)} />
            <FormField label="Website" value={contact.website} placeholder="www.example.com" onChange={(value) => updateField("website", value)} />
            <FormField label="LinkedIn" value={contact.linkedin} placeholder="LinkedIn profile" onChange={(value) => updateField("linkedin", value)} />
          </div></div>
          <div className="form-section"><EditableList label="Mobile Numbers" icon="📱" description="Phone and mobile contacts" field="mobile_numbers" values={contact.mobile_numbers || []} placeholder="+91 98765 43210" onChange={updateListField} onAdd={addListItem} onRemove={removeListItem} /></div>
          <div className="form-section"><EditableList label="Email Addresses" icon="✉" description="Email contacts" field="email_addresses" values={contact.email_addresses || []} placeholder="name@example.com" onChange={updateListField} onAdd={addListItem} onRemove={removeListItem} /></div>
          <div className="form-section"><div className="form-section-title"><div className="form-title-icon">📍</div><div><h4>Address</h4><p>Business or office location</p></div></div><div className="text-field-group"><textarea value={contact.address || ""} placeholder="Enter complete address" onChange={(event) => updateField("address", event.target.value)} /></div></div>
          <div className="form-section"><div className="form-section-title"><div className="form-title-icon">✦</div><div><h4>Additional details</h4><p>Any other useful information</p></div></div><div className="text-field-group"><textarea value={contact.other_details || ""} placeholder="Additional notes or information" onChange={(event) => updateField("other_details", event.target.value)} /></div></div>
          <div className="save-contact-footer"><div className="save-copy"><div className="save-step">03 / SAVE</div><h3>Ready to store this contact?</h3><p>Your reviewed information will be sent to the contact storage endpoint.</p></div><div className="save-actions"><button type="button" className="secondary-back-button" onClick={onBack}>← Back</button><button type="button" className="save-contact-button" onClick={onSave}>Save Contact →</button></div></div>
        </section>
      </div>
    </section>
  );
}

function FormField({ label, value, placeholder, onChange }) {
  return <div className="advanced-form-field"><label>{label}</label><input type="text" value={value || ""} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></div>;
}

function EditableList({ label, icon, description, field, values, placeholder, onChange, onAdd, onRemove }) {
  return <div className="editable-list"><div className="form-section-title"><div className="form-title-icon">{icon}</div><div><h4>{label}</h4><p>{description}</p></div></div>{values.length === 0 && <div className="empty-list">No details extracted. Add one manually.</div>}{values.map((value, index) => <div className="editable-list-item" key={`${field}-${index}`}><input type="text" value={value || ""} placeholder={placeholder} onChange={(event) => onChange(field, index, event.target.value)} /><button type="button" onClick={() => onRemove(field, index)} title="Remove">✕</button></div>)}<button type="button" className="add-detail-button" onClick={() => onAdd(field)}>+ Add another</button></div>;
}

function SavingScreen() {
  return <section className="saving-screen screen-enter"><div className="saving-card"><div className="saving-circle">↑</div><span className="saving-label">SAVING</span><h2>Storing your contact</h2><p>Almost done. Your verified contact is being saved.</p><div className="saving-progress"><span /></div></div></section>;
}

function SuccessScreen({ savedContactName, onNewScan }) {
  return <section className="success-screen screen-enter"><div className="success-confetti confetti-one">◆</div><div className="success-confetti confetti-two">●</div><div className="success-confetti confetti-three">✦</div><div className="success-confetti confetti-four">●</div><div className="success-card"><div className="success-icon">✓</div><span className="processing-label">SAVED SUCCESSFULLY</span><h2>Contact is<span>ready to use.</span></h2><p>{savedContactName || "Your contact"} has been saved successfully.</p><div className="success-contact-summary"><div className="success-avatar">{(savedContactName || "C").charAt(0).toUpperCase()}</div><div><strong>{savedContactName || "New Contact"}</strong><small>Contact stored successfully</small></div><span className="success-check">✓</span></div><button type="button" className="scan-new-card-button" onClick={onNewScan}>Scan another card →</button><button type="button" className="simple-home-button" onClick={onNewScan}>Return home</button></div></section>;
}

export default App;
