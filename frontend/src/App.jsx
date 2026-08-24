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
  "Preparing your card for analysis...",
  "Enhancing image quality...",
  "Reading contact information...",
  "Identifying names and organizations...",
  "Extracting phone numbers and emails...",
  "Structuring your contact details..."
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
    }, 1400);

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
      previous
        ? { ...previous, [field]: [...(previous[field] || []), ""] }
        : previous
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

      window.setTimeout(() => setCurrentStep("success"), 650);
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

  const stepNumber =
    currentStep === "upload"
      ? 1
      : currentStep === "success"
        ? 3
        : 2;

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
          <div className="secure-badge">
            <span className="secure-dot" />
            Secure AI Processing
          </div>

          <div className="step-indicator" aria-label={`Step ${stepNumber} of 3`}>
            {[1, 2, 3].map((step, index) => (
              <div className="step-indicator-part" key={step}>
                <div className={`mini-step ${step <= stepNumber ? "active" : ""}`}>
                  {step}
                </div>
                {index < 2 && (
                  <div className={`mini-line ${step < stepNumber ? "filled" : ""}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="main-content">
        {currentStep === "upload" && (
          <UploadScreen
            side1Preview={side1Preview}
            side2Preview={side2Preview}
            error={error}
            onFileChange={handleFileChange}
            onOpenCamera={setActiveCamera}
            onRemove={removeCard}
            onContinue={scanCard}
          />
        )}

        {currentStep === "processing" && (
          <ProcessingScreen
            side1Preview={side1Preview}
            side2Preview={side2Preview}
            processingText={processingText}
            processingIndex={processingIndex}
          />
        )}

        {currentStep === "review" && contact && (
          <ReviewScreen
            contact={contact}
            side1Preview={side1Preview}
            side2Preview={side2Preview}
            error={error}
            onBack={() => { setError(""); setCurrentStep("upload"); }}
            onSave={saveContact}
            updateField={updateField}
            updateListField={updateListField}
            addListItem={addListItem}
            removeListItem={removeListItem}
          />
        )}

        {currentStep === "saving" && <SavingScreen />}

        {currentStep === "success" && (
          <SuccessScreen
            contact={contact}
            savedContactName={savedContactName}
            onNewScan={resetApplication}
          />
        )}
      </main>

      {activeCamera && (
        <CameraCapture
          sideLabel={activeCamera === "side1" ? "Front Side" : "Back Side"}
          onCapture={handleCameraCapture}
          onClose={() => setActiveCamera(null)}
        />
      )}
    </div>
  );
}

function UploadScreen({ side1Preview, side2Preview, error, onFileChange, onOpenCamera, onRemove, onContinue }) {
  return (
    <section className="screen screen-upload screen-enter">
      <div className="hero-section">
        <div className="hero-copy">
          <div className="hero-chip"><span className="chip-sparkle">✦</span> NEXT-GEN VISITING CARD SCANNER</div>
          <h2>Your visiting cards.<span>Instantly intelligent.</span></h2>
          <p>Capture or upload a visiting card and let CardFlow AI transform it into clean, organized contact information in seconds.</p>
          <div className="hero-features">
            <div><span>✦</span>AI-powered extraction</div>
            <div><span>✓</span>Edit before saving</div>
            <div><span>⚡</span>Fast & accurate</div>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-card-stack card-back" />
          <div className="hero-card-stack card-middle" />
          <div className="hero-ai-card">
            <div className="ai-card-top">
              <div className="mini-profile"><span /></div>
              <div><strong>Visiting Card</strong><small>AI Ready</small></div>
              <div className="ai-pulse">✦</div>
            </div>
            <div className="ai-lines"><span /><span /><span /><span /></div>
            <div className="hero-scan-line" />
          </div>
          <div className="floating-tag tag-one">✦ AI Extracted</div>
          <div className="floating-tag tag-two">✓ Ready to Save</div>
        </div>
      </div>

      <section className="scanner-panel">
        <div className="panel-heading advanced-panel-heading">
          <div>
            <div className="section-number"><span>01</span><small>CAPTURE</small></div>
            <h2>Add your visiting card</h2>
            <p>Start with the front side. Add the back side only if it contains additional contact information.</p>
          </div>
          <div className="panel-progress">
            <div className="progress-label"><span>Workflow</span><strong>1 of 3</strong></div>
            <div className="progress-track"><span /></div>
          </div>
        </div>

        <div className="scanner-grid">
          <CardUploader
            title="Front Side"
            required={true}
            preview={side1Preview}
            onFileChange={(file) => onFileChange(file, "side1")}
            onOpenCamera={() => onOpenCamera("side1")}
            onRemove={() => onRemove("side1")}
          />
          <CardUploader
            title="Back Side"
            required={false}
            preview={side2Preview}
            onFileChange={(file) => onFileChange(file, "side2")}
            onOpenCamera={() => onOpenCamera("side2")}
            onRemove={() => onRemove("side2")}
          />
        </div>

        {error && <div className="inline-error"><span>⚠</span>{error}</div>}

        <div className="scan-footer">
          <div className="scan-security">
            <div className="security-icon">🔒</div>
            <div><strong>Your data stays protected</strong><p>Images are used only to extract contact information.</p></div>
          </div>
          <button type="button" className="scan-ai-button" onClick={onContinue} disabled={!side1Preview}>
            <span>Scan with AI</span><span className="button-arrow">→</span>
          </button>
        </div>
      </section>
    </section>
  );
}

function ProcessingScreen({ side1Preview, side2Preview, processingText, processingIndex }) {
  const completedCount = Math.min(processingIndex, 4);

  return (
    <section className="processing-screen screen-enter">
      <div className="processing-glow" />
      <div className="processing-card">
        <div className="processing-visual">
          <div className="processing-rings ring-one" />
          <div className="processing-rings ring-two" />
          <div className="processing-rings ring-three" />
          <div className="processing-card-preview">
            {side1Preview ? <img src={side1Preview} alt="Card being analyzed" /> : <span>🪪</span>}
            <div className="processing-scan-line" />
          </div>
          {side2Preview && <div className="processing-side-two"><img src={side2Preview} alt="Back side being analyzed" /></div>}
          <div className="processing-core"><span>✦</span></div>
        </div>

        <div className="processing-content">
          <div className="processing-label">CARD ANALYSIS IN PROGRESS</div>
          <h2>Our AI is reading<span>your card.</span></h2>
          <p>Please wait while we analyze the image and organize the contact information.</p>
          <div className="processing-status"><div className="status-spinner"><span /></div><span>{processingText}</span></div>
          <div className="processing-checklist">
            <ProcessingItem done={completedCount >= 1} active={processingIndex === 0} number="1" text="Image received" />
            <ProcessingItem done={completedCount >= 2} active={processingIndex === 1 || processingIndex === 2} number="2" text="AI extracting information" />
            <ProcessingItem done={completedCount >= 3} active={processingIndex === 3 || processingIndex === 4} number="3" text="Organizing contact details" />
            <ProcessingItem done={processingIndex >= 5} active={processingIndex === 5} number="4" text="Preparing review" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessingItem({ done, active, number, text }) {
  return <div className={`processing-item ${done ? "completed" : ""} ${active ? "active" : ""}`}><span>{done ? "✓" : active ? <i /> : number}</span>{text}</div>;
}

function ReviewScreen({ contact, side1Preview, side2Preview, error, onBack, onSave, updateField, updateListField, addListItem, removeListItem }) {
  return (
    <section className="screen-review screen-enter">
      <div className="review-header">
        <button type="button" className="back-button" onClick={onBack}>←<span>Back to card</span></button>
        <div className="review-title">
          <div className="section-number"><span>02</span><small>REVIEW & EDIT</small></div>
          <h2>AI found your<span>contact details.</span></h2>
          <p>Review the extracted information below. You can edit anything before saving.</p>
        </div>
        <div className="extraction-complete"><div className="complete-icon">✓</div><div><strong>Extraction complete</strong><small>Ready for review</small></div></div>
      </div>

      {error && <div className="inline-error review-error"><span>⚠</span>{error}</div>}

      <div className="review-layout">
        <aside className="review-sidebar">
          <div className="card-preview-title"><span>ORIGINAL</span><strong>CARD PREVIEW</strong></div>
          {side1Preview && <div className="review-card-image"><img src={side1Preview} alt="Front side of visiting card" /></div>}
          {side2Preview && <div className="review-card-image secondary-preview"><img src={side2Preview} alt="Back side of visiting card" /></div>}
          <button type="button" className="change-card-button" onClick={onBack}>↺ Change card images</button>
        </aside>

        <section className="contact-editor">
          <div className="editor-header">
            <div><span className="editor-eyebrow">CONTACT INFORMATION</span><h3>Extracted details</h3></div>
            <div className="editor-status"><span />Ready to save</div>
          </div>

          <div className="form-section">
            <div className="form-section-title"><div className="form-title-icon">👤</div><div><h4>Basic information</h4><p>Personal and professional details</p></div></div>
            <div className="advanced-form-grid">
              <FormField label="Full Name" value={contact.name} placeholder="Enter full name" onChange={(value) => updateField("name", value)} />
              <FormField label="Company / Organization" value={contact.company_name} placeholder="Enter company name" onChange={(value) => updateField("company_name", value)} />
              <FormField label="Designation" value={contact.designation} placeholder="Enter designation" onChange={(value) => updateField("designation", value)} />
              <FormField label="Website" value={contact.website} placeholder="www.example.com" onChange={(value) => updateField("website", value)} />
              <FormField label="LinkedIn" value={contact.linkedin} placeholder="LinkedIn profile" onChange={(value) => updateField("linkedin", value)} />
            </div>
          </div>

          <div className="form-section"><EditableList label="Mobile Numbers" icon="📱" description="Phone and mobile contact numbers" field="mobile_numbers" values={contact.mobile_numbers || []} placeholder="+91 98765 43210" onChange={updateListField} onAdd={addListItem} onRemove={removeListItem} /></div>
          <div className="form-section"><EditableList label="Email Addresses" icon="✉" description="Email contact information" field="email_addresses" values={contact.email_addresses || []} placeholder="name@example.com" onChange={updateListField} onAdd={addListItem} onRemove={removeListItem} /></div>

          <div className="form-section">
            <div className="form-section-title"><div className="form-title-icon">📍</div><div><h4>Address</h4><p>Business or office location</p></div></div>
            <div className="text-field-group"><textarea value={contact.address || ""} placeholder="Enter complete address" onChange={(event) => updateField("address", event.target.value)} /></div>
          </div>

          <div className="form-section">
            <div className="form-section-title"><div className="form-title-icon">✦</div><div><h4>Additional details</h4><p>Any other useful information found on the card</p></div></div>
            <div className="text-field-group"><textarea value={contact.other_details || ""} placeholder="Additional notes or information" onChange={(event) => updateField("other_details", event.target.value)} /></div>
          </div>

          <div className="save-contact-footer">
            <div className="save-copy"><div className="save-step">STEP 03</div><h3>Everything looks good?</h3><p>Save this verified contact to your database.</p></div>
            <div className="save-actions"><button type="button" className="secondary-back-button" onClick={onBack}>← Back</button><button type="button" className="save-contact-button" onClick={onSave}><span>Save Contact</span><span>→</span></button></div>
          </div>
        </section>
      </div>
    </section>
  );
}

function SavingScreen() {
  return <section className="saving-screen screen-enter"><div className="saving-card"><div className="saving-animation"><div className="saving-circle"><span>↑</span></div></div><span className="saving-label">SAVING CONTACT</span><h2>Almost there...</h2><p>We're securely saving your verified contact information.</p><div className="saving-progress"><span /></div></div></section>;
}

function SuccessScreen({ contact, savedContactName, onNewScan }) {
  const initials = (savedContactName || "C").split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <section className="success-screen screen-enter"><div className="success-confetti confetti-one">✦</div><div className="success-confetti confetti-two">●</div><div className="success-confetti confetti-three">✦</div><div className="success-confetti confetti-four">●</div><div className="success-card"><div className="success-icon-wrapper"><div className="success-ring ring-a" /><div className="success-ring ring-b" /><div className="success-icon">✓</div></div><span className="success-eyebrow">SUCCESSFULLY SAVED</span><h2>Contact added<span>successfully!</span></h2><p>{savedContactName || "Your contact"} has been saved successfully. Your contact is now ready to use.</p><div className="success-contact-summary"><div className="success-avatar">{initials}</div><div><strong>{savedContactName || "New Contact"}</strong><small>{contact?.company_name || "Contact saved to your database"}</small></div><span className="success-check">✓</span></div><button type="button" className="scan-new-card-button" onClick={onNewScan}><span className="new-scan-icon">+</span><span>Scan another card</span><span className="button-arrow">→</span></button><button type="button" className="simple-home-button" onClick={onNewScan}>Return to home</button></div></section>;
}

function FormField({ label, value, placeholder, onChange }) {
  return <div className="advanced-form-field"><label>{label}</label><input type="text" value={value || ""} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></div>;
}

function EditableList({ label, icon, description, field, values, placeholder, onChange, onAdd, onRemove }) {
  return <div className="editable-list"><div className="form-section-title"><div className="form-title-icon">{icon}</div><div><h4>{label}</h4><p>{description}</p></div></div>{values.length === 0 && <div className="empty-list">No details extracted. You can add one manually.</div>}{values.map((value, index) => <div className="editable-list-item" key={`${field}-${index}`}><input type="text" value={value || ""} placeholder={placeholder} onChange={(event) => onChange(field, index, event.target.value)} /><button type="button" onClick={() => onRemove(field, index)} title="Remove">✕</button></div>)}<button type="button" className="add-detail-button" onClick={() => onAdd(field)}>+ Add another</button></div>;
}

export default App;
