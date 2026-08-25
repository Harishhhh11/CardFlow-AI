import { useEffect, useState } from "react";

import api from "./services/api";
import CameraCapture from "./components/CameraCapture";
import CardUploader from "./components/CardUploader";

import "./App.css";

const EMPTY_CONTACT = { name: "", company_name: "", designation: "", mobile_numbers: [], email_addresses: [], website: "", address: "", linkedin: "", other_details: "" };
const PROCESSING_STEPS = [
  { title: "Reading card image", detail: "Checking image quality and detecting card boundaries." },
  { title: "Extracting contact details", detail: "Finding names, companies, phone numbers and email addresses." },
  { title: "Structuring information", detail: "Organizing detected details into clean contact fields." },
  { title: "Preparing review", detail: "Finalizing the extracted contact for your review." }
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

  const processingStep = PROCESSING_STEPS[processingIndex];

  useEffect(() => {
    if (currentStep !== "processing") return undefined;
    const interval = window.setInterval(() => setProcessingIndex((previous) => previous >= PROCESSING_STEPS.length - 1 ? previous : previous + 1), 1400);
    return () => window.clearInterval(interval);
  }, [currentStep]);

  useEffect(() => () => {
    if (side1Preview) URL.revokeObjectURL(side1Preview);
    if (side2Preview) URL.revokeObjectURL(side2Preview);
  }, [side1Preview, side2Preview]);

  const handleFileChange = (file, side) => {
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) { setError("Please upload a JPG, PNG, or WEBP image."); return; }
    if (file.size > MAX_IMAGE_SIZE) { setError("Image size must be less than 10 MB."); return; }
    const preview = URL.createObjectURL(file);
    if (side === "side1") {
      if (side1Preview) URL.revokeObjectURL(side1Preview);
      setSide1(file); setSide1Preview(preview);
    } else {
      if (side2Preview) URL.revokeObjectURL(side2Preview);
      setSide2(file); setSide2Preview(preview);
    }
    setError("");
  };

  const removeCard = (side) => {
    if (side === "side1") {
      if (side1Preview) URL.revokeObjectURL(side1Preview);
      setSide1(null); setSide1Preview(null);
    } else {
      if (side2Preview) URL.revokeObjectURL(side2Preview);
      setSide2(null); setSide2Preview(null);
    }
  };

  const handleCameraCapture = (file) => {
    if (!activeCamera) return;
    handleFileChange(file, activeCamera);
    setActiveCamera(null);
  };

  const scanCard = async () => {
    if (!side1) { setError("Please capture or upload the front side of the visiting card."); return; }
    setError(""); setProcessingIndex(0); setCurrentStep("processing");
    try {
      const formData = new FormData();
      formData.append("side1", side1);
      if (side2) formData.append("side2", side2);
      const response = await api.post("/api/scan-card", formData);
      const data = response.data?.data || response.data || {};
      setContact({ ...EMPTY_CONTACT, ...data, mobile_numbers: Array.isArray(data.mobile_numbers) ? data.mobile_numbers : [], email_addresses: Array.isArray(data.email_addresses) ? data.email_addresses : [] });
      setProcessingIndex(PROCESSING_STEPS.length - 1);
      setCurrentStep("review");
    } catch (err) {
      console.error("SCAN ERROR:", err);
      setError(err.response?.data?.detail || "Unable to scan the visiting card. Please try again.");
      setCurrentStep("upload");
    }
  };

  const updateField = (field, value) => setContact((previous) => previous ? { ...previous, [field]: value } : previous);
  const updateListField = (field, index, value) => setContact((previous) => {
    if (!previous) return previous;
    const updated = [...(previous[field] || [])]; updated[index] = value;
    return { ...previous, [field]: updated };
  });
  const addListItem = (field) => setContact((previous) => previous ? { ...previous, [field]: [...(previous[field] || []), ""] } : previous);
  const removeListItem = (field, index) => setContact((previous) => previous ? { ...previous, [field]: (previous[field] || []).filter((_, i) => i !== index) } : previous);

  const saveContact = async () => {
    if (!contact) return;
    setError(""); setCurrentStep("saving");
    try {
      const cleanedContact = { ...contact, mobile_numbers: (contact.mobile_numbers || []).filter((number) => number?.trim()), email_addresses: (contact.email_addresses || []).filter((email) => email?.trim()) };
      await api.post("/api/contacts/save", cleanedContact);
      setSavedContactName(cleanedContact.name || "Contact");
      window.setTimeout(() => setCurrentStep("success"), 650);
    } catch (err) {
      console.error("SAVE ERROR:", err);
      setError(err.response?.data?.detail || "Unable to save the contact. Please try again.");
      setCurrentStep("review");
    }
  };

  const resetApplication = () => {
    if (side1Preview) URL.revokeObjectURL(side1Preview);
    if (side2Preview) URL.revokeObjectURL(side2Preview);
    setSide1(null); setSide2(null); setSide1Preview(null); setSide2Preview(null); setContact(null); setError(""); setProcessingIndex(0); setSavedContactName(""); setActiveCamera(null); setCurrentStep("upload");
  };

  const stepNumber = currentStep === "upload" ? 1 : currentStep === "success" ? 3 : 2;

  return <div className="app-shell">
    <div className="background-orb orb-one" /><div className="background-orb orb-two" /><div className="background-grid" />
    <header className="topbar">
      <button type="button" className="brand" onClick={resetApplication}><div className="brand-icon">CF</div><div><h1>CardFlow <span>AI</span></h1><p>Intelligent Contact Capture</p></div></button>
      <div className="topbar-right"><div className="secure-badge"><span className="secure-dot" />Secure AI Processing</div><div className="step-indicator" aria-label={`Step ${stepNumber} of 3`}>{[1,2,3].map((step,index)=><div className="step-indicator-part" key={step}><div className={`mini-step ${step<=stepNumber?"active":""}`}>{step}</div>{index<2&&<div className={`mini-line ${step<stepNumber?"filled":""}`} />}</div>)}</div></div>
    </header>
    <main className="main-content">
      {currentStep === "upload" && <UploadScreen side1Preview={side1Preview} side2Preview={side2Preview} error={error} onFileChange={handleFileChange} onOpenCamera={setActiveCamera} onRemove={removeCard} onContinue={scanCard} />}
      {currentStep === "processing" && <ProcessingScreen side1Preview={side1Preview} side2Preview={side2Preview} processingIndex={processingIndex} processingStep={processingStep} />}
      {currentStep === "review" && contact && <ReviewScreen contact={contact} side1Preview={side1Preview} side2Preview={side2Preview} error={error} onBack={()=>{setError("");setCurrentStep("upload");}} onSave={saveContact} updateField={updateField} updateListField={updateListField} addListItem={addListItem} removeListItem={removeListItem} />}
      {currentStep === "saving" && <SavingScreen />}
      {currentStep === "success" && <SuccessScreen contact={contact} savedContactName={savedContactName} onNewScan={resetApplication} />}
    </main>
    {activeCamera && <CameraCapture sideLabel={activeCamera === "side1" ? "Front Side" : "Back Side"} onCapture={handleCameraCapture} onClose={()=>setActiveCamera(null)} />}
  </div>;
}

function UploadScreen({ side1Preview, side2Preview, error, onFileChange, onOpenCamera, onRemove, onContinue }) {
  return <section className="screen screen-upload screen-enter">
    <div className="hero-section">
      <div className="hero-copy"><div className="hero-chip"><span>✦</span> AI VISITING CARD SCANNER</div><h2>Turn every card into a <span>smart contact.</span></h2><p>Capture a visiting card, let CardFlow AI extract the details, review the result, and save a clean contact in moments.</p><div className="hero-features"><div><span>✦</span>AI extraction</div><div><span>✓</span>Review before save</div><div><span>⚡</span>Fast processing</div></div><div className="hero-visual-note"><span className="hero-visual-dot" />Built for fast contact capture</div></div>
      <div className="hero-visual" aria-hidden="true"><div className="hero-card-stack card-back" /><div className="hero-card-stack card-middle" /><div className="hero-ai-card"><div className="ai-card-top"><div className="mini-profile"><span /></div><div><strong>Contact detected</strong><small>Ready for review</small></div><div className="ai-pulse">✦</div></div><div className="ai-lines"><span/><span/><span/><span/></div><div className="hero-scan-line"/></div><div className="floating-tag tag-one">✦ AI Extracted</div><div className="floating-tag tag-two">✓ Ready to Save</div></div>
    </div>
    <section className="scanner-panel home-capture-panel"><div className="panel-heading advanced-panel-heading"><div><div className="section-number"><span>01</span><small>CAPTURE</small></div><h2>Bring in your card</h2><p>Front side is required. Add the back side when it contains more contact information.</p></div><div className="capture-trust"><strong>Private by design</strong><span>Images are only used for extraction.</span></div></div>
      <div className="scanner-grid"><CardUploader title="Front Side" required preview={side1Preview} onFileChange={(file)=>onFileChange(file,"side1")} onOpenCamera={()=>onOpenCamera("side1")} onRemove={()=>onRemove("side1")} /><CardUploader title="Back Side" required={false} preview={side2Preview} onFileChange={(file)=>onFileChange(file,"side2")} onOpenCamera={()=>onOpenCamera("side2")} onRemove={()=>onRemove("side2")} /></div>
      {error && <div className="inline-error"><span>⚠</span>{error}</div>}
      <div className="scan-footer"><div className="scan-security"><div className="security-icon">🔒</div><div><strong>Ready when you are</strong><p>JPG, PNG or WEBP up to 10 MB.</p></div></div><button type="button" className="scan-ai-button" onClick={onContinue} disabled={!side1Preview}><span>Scan with CardFlow AI</span><span className="button-arrow">→</span></button></div>
    </section>
  </section>;
}

function ProcessingScreen({ side1Preview, side2Preview, processingIndex, processingStep }) {
  const progress = ((processingIndex + 1) / PROCESSING_STEPS.length) * 100;
  return <section className="processing-screen screen-enter"><div className="processing-glow"/><div className="processing-card processing-card-enhanced"><div className="processing-visual processing-visual-enhanced"><div className="processing-rings ring-one"/><div className="processing-rings ring-two"/><div className="processing-rings ring-three"/><div className="processing-card-preview">{side1Preview?<img src={side1Preview} alt="Card being analyzed"/>:<span>🪪</span>}<div className="processing-scan-line"/><div className="scan-corners"><i className="corner tl"/><i className="corner tr"/><i className="corner bl"/><i className="corner br"/></div></div>{side2Preview&&<div className="processing-side-two"><img src={side2Preview} alt="Back side being analyzed"/></div>}<div className="processing-core processing-core-enhanced"><span>✦</span></div><div className="processing-live-chip"><span className="live-dot"/>AI ACTIVE</div></div><div className="processing-content processing-content-enhanced"><div className="processing-label">CARD EXTRACTION</div><div className="processing-step-count">STEP {String(processingIndex+1).padStart(2,"0")} <span>OF {String(PROCESSING_STEPS.length).padStart(2,"0")}</span></div><h2>{processingStep.title}<span>...</span></h2><p>{processingStep.detail}</p><div className="extraction-progress"><div className="extraction-progress-top"><span>Extraction progress</span><strong>{Math.round(progress)}%</strong></div><div className="extraction-progress-track"><span style={{width:`${progress}%`}}/></div></div><div className="extraction-steps">{PROCESSING_STEPS.map((step,index)=>{const completed=index<processingIndex;const current=index===processingIndex;return <div className={`extraction-step ${completed?"completed":""} ${current?"current":""}`} key={step.title}><div className="extraction-step-marker">{completed?"✓":String(index+1).padStart(2,"0")}</div><div className="extraction-step-copy"><strong>{step.title}</strong><small>{current?"Processing now":completed?"Completed":"Waiting"}</small></div>{current&&<div className="step-pulse"/>}</div>})}</div><div className="processing-note"><span>✦</span>Keep this window open while CardFlow AI finishes extracting the details.</div></div></div></section>;
}

function ReviewScreen({ contact, side1Preview, side2Preview, error, onBack, onSave, updateField, updateListField, addListItem, removeListItem }) {
  const scalarFields = [["name","Full Name","The person's name"],["company_name","Company","Company or organization"],["designation","Designation","Job title or role"],["website","Website","Company or personal website"],["linkedin","LinkedIn","LinkedIn profile URL"],["address","Address","Address or office location"],["other_details","Other Details","Any additional information"]];
  return <section className="screen-review screen-enter"><div className="review-header"><div className="review-title"><div className="section-number"><span>02</span><small>REVIEW</small></div><h2>Polish the contact before saving</h2><p>AI has structured the information. Check anything that needs a correction.</p></div><div className="review-confidence"><span className="confidence-dot"/>AI extraction complete</div></div><div className="review-layout"><aside className="review-card-preview"><div className="preview-card-label">SOURCE IMAGE</div><div className="review-image-wrap">{side1Preview&&<img src={side1Preview} alt="Front side of visiting card"/>}</div>{side2Preview&&<div className="review-image-wrap review-back-preview"><img src={side2Preview} alt="Back side of visiting card"/></div>}<div className="preview-note">Compare the original card with the extracted fields before saving.</div></aside><div className="editor-panel"><div className="editor-header"><div><span className="editor-kicker">STRUCTURED CONTACT</span><h3>Edit details</h3></div><span className="editor-ai-badge">✦ AI</span></div><div className="editor-grid">{scalarFields.map(([field,label,placeholder])=><label className={`field-group ${field==="other_details"||field==="address"?"field-wide":""}`} key={field}><span>{label}</span>{field==="other_details"||field==="address"?<textarea value={contact[field]||""} placeholder={placeholder} rows={field==="other_details"?3:2} onChange={(event)=>updateField(field,event.target.value)}/>:<input value={contact[field]||""} placeholder={placeholder} onChange={(event)=>updateField(field,event.target.value)}/>}</label>)}</div><ListEditor field="mobile_numbers" label="Mobile Numbers" placeholder="Enter phone number" values={contact.mobile_numbers||[]} updateListField={updateListField} addListItem={addListItem} removeListItem={removeListItem}/><ListEditor field="email_addresses" label="Email Addresses" placeholder="name@example.com" values={contact.email_addresses||[]} updateListField={updateListField} addListItem={addListItem} removeListItem={removeListItem}/>{error&&<div className="inline-error review-error"><span>⚠</span>{error}</div>}<div className="save-contact-footer"><button type="button" className="secondary-button" onClick={onBack}>← Back to scan</button><button type="button" className="save-contact-button" onClick={onSave}><span>Save Contact</span><span>✓</span></button></div></div></div></section>;
}

function ListEditor({ field, label, placeholder, values, updateListField, addListItem, removeListItem }) { return <div className="list-field-group"><div className="list-field-heading"><span>{label}</span><button type="button" className="add-item-button" onClick={()=>addListItem(field)}>+ Add</button></div>{values.length===0?<div className="empty-list-note">No {label.toLowerCase()} detected. Add one if needed.</div>:values.map((value,index)=><div className="list-row" key={`${field}-${index}`}><input value={value||""} placeholder={placeholder} onChange={(event)=>updateListField(field,index,event.target.value)}/><button type="button" className="remove-item-button" onClick={()=>removeListItem(field,index)} aria-label={`Remove ${label} ${index+1}`}>×</button></div>)}</div>; }
function SavingScreen(){return <section className="saving-screen screen-enter"><div className="saving-spinner"><span/></div><div className="saving-label">SECURE SAVE</div><h2>Saving your <span>contact.</span></h2><p>Writing the cleaned contact details to your CardFlow workspace.</p></section>;}
function SuccessScreen({ contact, savedContactName, onNewScan }){const name=savedContactName||contact?.name||"Contact";return <section className="success-screen screen-enter"><div className="success-icon">✓</div><div className="success-content"><div className="success-label">CONTACT SAVED</div><h2><span>{name}</span> is ready.</h2><p>Your contact has been saved successfully. You can start another scan whenever you like.</p><button type="button" className="scan-new-card-button" onClick={onNewScan}>Scan another card <span>→</span></button></div></section>;}
export default App;
