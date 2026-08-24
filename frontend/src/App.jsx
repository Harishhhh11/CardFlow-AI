import {
  useEffect,
  useState
} from "react";

import api from "./services/api";

import CameraCapture from "./components/CameraCapture";
import CardUploader from "./components/CardUploader";

import "./App.css";


const emptyContact = {
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


const processingSteps = [
  "Preparing your card for analysis...",
  "Enhancing image quality...",
  "Reading contact information...",
  "Identifying names and organizations...",
  "Extracting phone numbers and emails...",
  "Structuring your contact details..."
];


function App() {

  const [
    currentStep,
    setCurrentStep
  ] = useState("upload");


  const [
    side1,
    setSide1
  ] = useState(null);


  const [
    side2,
    setSide2
  ] = useState(null);


  const [
    side1Preview,
    setSide1Preview
  ] = useState(null);


  const [
    side2Preview,
    setSide2Preview
  ] = useState(null);


  const [
    activeCamera,
    setActiveCamera
  ] = useState(null);


  const [
    contact,
    setContact
  ] = useState(null);


  const [
    error,
    setError
  ] = useState("");


  const [
    processingIndex,
    setProcessingIndex
  ] = useState(0);


  const [
    savedContactName,
    setSavedContactName
  ] = useState("");


  const processingText =
    processingSteps[
      processingIndex
    ];


  useEffect(() => {

    if (
      currentStep !== "processing"
    ) {
      return undefined;
    }


    const interval =
      setInterval(() => {

        setProcessingIndex(
          (previousIndex) =>
            (
              previousIndex + 1
            ) %
            processingSteps.length
        );

      }, 1400);


    return () => {

      clearInterval(
        interval
      );

    };

  }, [currentStep]);


  useEffect(() => {

    return () => {

      if (
        side1Preview
      ) {

        URL.revokeObjectURL(
          side1Preview
        );

      }


      if (
        side2Preview
      ) {

        URL.revokeObjectURL(
          side2Preview
        );

      }

    };

  }, [
    side1Preview,
    side2Preview
  ]);


  const handleFileChange = (
    file,
    side
  ) => {

    if (
      !file
    ) {
      return;
    }


    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      setError(
        "Please upload a JPG, PNG, or WEBP image."
      );

      return;

    }


    const preview =
      URL.createObjectURL(
        file
      );


    if (
      side === "side1"
    ) {

      if (
        side1Preview
      ) {

        URL.revokeObjectURL(
          side1Preview
        );

      }


      setSide1(
        file
      );

      setSide1Preview(
        preview
      );

    } else {

      if (
        side2Preview
      ) {

        URL.revokeObjectURL(
          side2Preview
        );

      }


      setSide2(
        file
      );

      setSide2Preview(
        preview
      );

    }


    setError(
      ""
    );

  };


  const removeCard = (
    side
  ) => {

    if (
      side === "side1"
    ) {

      if (
        side1Preview
      ) {

        URL.revokeObjectURL(
          side1Preview
        );

      }


      setSide1(
        null
      );

      setSide1Preview(
        null
      );

    } else {

      if (
        side2Preview
      ) {

        URL.revokeObjectURL(
          side2Preview
        );

      }


      setSide2(
        null
      );

      setSide2Preview(
        null
      );

    }

  };


  const handleCameraCapture = (
    file
  ) => {

    if (
      !activeCamera
    ) {
      return;
    }


    handleFileChange(
      file,
      activeCamera
    );


    setActiveCamera(
      null
    );

  };


  const scanCard =
    async () => {

      if (
        !side1
      ) {

        setError(
          "Please capture or upload the front side of the visiting card."
        );

        return;

      }


      setError(
        ""
      );

      setProcessingIndex(
        0
      );

      setCurrentStep(
        "processing"
      );


      try {

        const formData =
          new FormData();


        formData.append(
          "side1",
          side1
        );


        if (
          side2
        ) {

          formData.append(
            "side2",
            side2
          );

        }


        const response =
          await api.post(
            "/api/scan-card",
            formData
          );


        const data =
          response.data?.data ||
          response.data ||
          {};


        setContact({

          ...emptyContact,

          ...data,

          mobile_numbers:
            Array.isArray(
              data.mobile_numbers
            )
              ? data.mobile_numbers
              : [],

          email_addresses:
            Array.isArray(
              data.email_addresses
            )
              ? data.email_addresses
              : []

        });


        setTimeout(() => {

          setCurrentStep(
            "review"
          );

        }, 700);

      } catch (
        err
      ) {

        console.error(
          "SCAN ERROR:",
          err
        );


        setError(
          err.response?.data?.detail ||
          "Unable to scan the visiting card. Please try again."
        );


        setCurrentStep(
          "upload"
        );

      }

    };


  const updateField = (
    field,
    value
  ) => {

    setContact(
      (previous) => {

        if (
          !previous
        ) {
          return previous;
        }


        return {

          ...previous,

          [field]:
            value

        };

      }
    );

  };


  const updateListField = (
    field,
    index,
    value
  ) => {

    setContact(
      (previous) => {

        if (
          !previous
        ) {
          return previous;
        }


        const updatedValues = [
          ...(
            previous[field] ||
            []
          )
        ];


        updatedValues[
          index
        ] = value;


        return {

          ...previous,

          [field]:
            updatedValues

        };

      }
    );

  };


  const addListItem = (
    field
  ) => {

    setContact(
      (previous) => {

        if (
          !previous
        ) {
          return previous;
        }


        return {

          ...previous,

          [field]: [

            ...(
              previous[field] ||
              []
            ),

            ""

          ]

        };

      }
    );

  };


  const removeListItem = (
    field,
    index
  ) => {

    setContact(
      (previous) => {

        if (
          !previous
        ) {
          return previous;
        }


        return {

          ...previous,

          [field]:
            (
              previous[field] ||
              []
            ).filter(
              (
                _,
                currentIndex
              ) =>
                currentIndex !==
                index
            )

        };

      }
    );

  };


  const saveContact =
    async () => {

      if (
        !contact
      ) {
        return;
      }


      setError(
        ""
      );

      setCurrentStep(
        "saving"
      );


      try {

        const cleanedContact = {

          ...contact,

          mobile_numbers:
            (
              contact.mobile_numbers ||
              []
            ).filter(
              (number) =>
                number?.trim()
            ),

          email_addresses:
            (
              contact.email_addresses ||
              []
            ).filter(
              (email) =>
                email?.trim()
            )

        };


        const response =
          await api.post(
            "/api/contacts/save",
            cleanedContact
          );


        setSavedContactName(
          cleanedContact.name ||
          "Contact"
        );


        console.log(
          "SAVE RESPONSE:",
          response.data
        );


        setTimeout(() => {

          setCurrentStep(
            "success"
          );

        }, 800);

      } catch (
        err
      ) {

        console.error(
          "SAVE ERROR:",
          err
        );


        setError(
          err.response?.data?.detail ||
          "Unable to save the contact. Please try again."
        );


        setCurrentStep(
          "review"
        );

      }

    };


  const resetApplication =
    () => {

      if (
        side1Preview
      ) {

        URL.revokeObjectURL(
          side1Preview
        );

      }


      if (
        side2Preview
      ) {

        URL.revokeObjectURL(
          side2Preview
        );

      }


      setSide1(
        null
      );

      setSide2(
        null
      );

      setSide1Preview(
        null
      );

      setSide2Preview(
        null
      );

      setContact(
        null
      );

      setError(
        ""
      );

      setProcessingIndex(
        0
      );

      setSavedContactName(
        ""
      );

      setActiveCamera(
        null
      );

      setCurrentStep(
        "upload"
      );

    };


  const goBackToUpload =
    () => {

      setError(
        ""
      );

      setCurrentStep(
        "upload"
      );

    };


  return (

    <div className="app-shell">


      <div className="background-orb orb-one" />

      <div className="background-orb orb-two" />

      <div className="background-grid" />


      <header className="topbar">

        <button
          type="button"
          className="brand"
          onClick={resetApplication}
        >

          <div className="brand-icon">

            <span>
              C
            </span>

            <span>
              F
            </span>

          </div>


          <div>

            <h1>

              CardFlow

              <span>
                AI
              </span>

            </h1>


            <p>
              Intelligent Contact Capture
            </p>

          </div>

        </button>


        <div className="topbar-right">


          <div className="secure-badge">

            <span className="secure-dot" />

            Secure AI Processing

          </div>


          <div className="step-indicator">


            <div
              className={
                `mini-step ${
                  currentStep === "upload"
                    ? "active"
                    : currentStep !== "upload"
                      ? "completed"
                      : ""
                }`
              }
            >

              1

            </div>


            <div className="mini-line" />


            <div
              className={
                `mini-step ${
                  [
                    "processing",
                    "review",
                    "saving",
                    "success"
                  ].includes(
                    currentStep
                  )
                    ? "active"
                    : ""
                }`
              }
            >

              2

            </div>


            <div className="mini-line" />


            <div
              className={
                `mini-step ${
                  currentStep === "success"
                    ? "active"
                    : ""
                }`
              }
            >

              3

            </div>

          </div>

        </div>

      </header>


      <main className="main-content">


        {currentStep === "upload" && (

          <section className="screen screen-upload">


            <div className="hero-section">


              <div className="hero-copy">


                <div className="hero-chip">

                  <span className="chip-sparkle">
                    ✦
                  </span>

                  NEXT-GEN VISITING CARD SCANNER

                </div>


                <h2>

                  Your visiting cards.

                  <span>
                    Instantly intelligent.
                  </span>

                </h2>


                <p>

                  Capture or upload a visiting card and let CardFlow AI
                  transform it into clean, organized contact information
                  in seconds.

                </p>


                <div className="hero-features">


                  <div>

                    <span>
                      ✦
                    </span>

                    AI-powered extraction

                  </div>


                  <div>

                    <span>
                      ✓
                    </span>

                    Edit before saving

                  </div>


                  <div>

                    <span>
                      ⚡
                    </span>

                    Fast & accurate

                  </div>

                </div>

              </div>


              <div className="hero-visual">


                <div className="hero-card-stack card-back" />

                <div className="hero-card-stack card-middle" />


                <div className="hero-ai-card">


                  <div className="ai-card-top">


                    <div className="mini-profile">

                      <span />

                    </div>


                    <div>

                      <strong>
                        Visiting Card
                      </strong>

                      <small>
                        AI Ready
                      </small>

                    </div>


                    <div className="ai-pulse">
                      ✦
                    </div>

                  </div>


                  <div className="ai-lines">

                    <span />

                    <span />

                    <span />

                    <span />

                  </div>


                  <div className="hero-scan-line" />

                </div>


                <div className="floating-tag tag-one">

                  ✦ AI Extracted

                </div>


                <div className="floating-tag tag-two">

                  ✓ Ready to Save

                </div>

              </div>

            </div>


            <section className="scanner-panel">


              <div className="panel-heading advanced-panel-heading">


                <div>


                  <div className="section-number">

                    <span>
                      01
                    </span>

                    <small>
                      CAPTURE
                    </small>

                  </div>


                  <h2>
                    Add your visiting card
                  </h2>


                  <p>

                    Start with the front side. Add the back side only if
                    it contains additional contact information.

                  </p>

                </div>


                <div className="panel-progress">


                  <div className="progress-label">

                    <span>
                      Workflow
                    </span>

                    <strong>
                      1 of 3
                    </strong>

                  </div>


                  <div className="progress-track">

                    <span />

                  </div>

                </div>

              </div>


              <div className="scanner-grid">


                <CardUploader
                  title="Front Side"
                  required={true}
                  preview={side1Preview}
                  onFileChange={(file) =>
                    handleFileChange(
                      file,
                      "side1"
                    )
                  }
                  onOpenCamera={() =>
                    setActiveCamera(
                      "side1"
                    )
                  }
                  onRemove={() =>
                    removeCard(
                      "side1"
                    )
                  }
                />


                <CardUploader
                  title="Back Side"
                  required={false}
                  preview={side2Preview}
                  onFileChange={(file) =>
                    handleFileChange(
                      file,
                      "side2"
                    )
                  }
                  onOpenCamera={() =>
                    setActiveCamera(
                      "side2"
                    )
                  }
                  onRemove={() =>
                    removeCard(
                      "side2"
                    )
                  }
                />

              </div>


              {error && (

                <div className="inline-error">

                  <span>
                    ⚠
                  </span>

                  {error}

                </div>

              )}


              <div className="scan-footer">


                <div className="scan-security">


                  <div className="security-icon">
                    🔒
                  </div>


                  <div>

                    <strong>
                      Your data stays protected
                    </strong>

                    <p>
                      Images are used only to extract contact information.
                    </p>

                  </div>

                </div>


                <button
                  type="button"
                  className="scan-ai-button"
                  onClick={scanCard}
                  disabled={!side1}
                >

                  <span>
                    Scan with AI
                  </span>

                  <span className="button-arrow">
                    →
                  </span>

                </button>

              </div>

            </section>

          </section>

        )}


        {currentStep === "processing" && (

          <section className="processing-screen">


            <div className="processing-glow" />


            <div className="processing-card">


              <div className="processing-visual">


                <div className="processing-rings ring-one" />

                <div className="processing-rings ring-two" />

                <div className="processing-rings ring-three" />


                <div className="processing-core">

                  <span>
                    ✦
                  </span>

                </div>

              </div>


              <div className="processing-content">


                <div className="processing-label">

                  CARD ANALYSIS IN PROGRESS

                </div>


                <h2>

                  Our AI is reading

                  <span>
                    your card.
                  </span>

                </h2>


                <p>

                  Please wait while we analyze the image and organize
                  the contact information.

                </p>


                <div className="processing-status">


                  <div className="status-spinner">

                    <span />

                  </div>


                  <span>

                    {processingText}

                  </span>

                </div>


                <div className="processing-checklist">


                  <div className="processing-item completed">

                    <span>
                      ✓
                    </span>

                    Image received

                  </div>


                  <div className="processing-item active">

                    <span>
                      <i />
                    </span>

                    AI extracting information

                  </div>


                  <div className="processing-item">

                    <span>
                      3
                    </span>

                    Preparing review

                  </div>

                </div>

              </div>

            </div>

          </section>

        )}


        {currentStep === "review" &&
          contact && (

            <section className="screen-review">


              <div className="review-header">


                <button
                  type="button"
                  className="back-button"
                  onClick={goBackToUpload}
                >

                  ←

                  <span>
                    Back to card
                  </span>

                </button>


                <div className="review-title">


                  <div className="section-number">

                    <span>
                      02
                    </span>

                    <small>
                      REVIEW & EDIT
                    </small>

                  </div>


                  <h2>

                    AI found your

                    <span>
                      contact details.
                    </span>

                  </h2>


                  <p>

                    Review the extracted information below.
                    You can edit anything before saving.

                  </p>

                </div>


                <div className="extraction-complete">


                  <div className="complete-icon">
                    ✓
                  </div>


                  <div>

                    <strong>
                      Extraction complete
                    </strong>

                    <small>
                      Ready for review
                    </small>

                  </div>

                </div>

              </div>


              {error && (

                <div className="inline-error review-error">

                  <span>
                    ⚠
                  </span>

                  {error}

                </div>

              )}


              <div className="review-layout">


                <aside className="review-sidebar">


                  <div className="card-preview-title">

                    <span>
                      ORIGINAL
                    </span>

                    <strong>
                      CARD PREVIEW
                    </strong>

                  </div>


                  {side1Preview && (

                    <div className="review-card-image">

                      <img
                        src={side1Preview}
                        alt="Front side of visiting card"
                      />

                    </div>

                  )}


                  {side2Preview && (

                    <div className="review-card-image secondary-preview">

                      <img
                        src={side2Preview}
                        alt="Back side of visiting card"
                      />

                    </div>

                  )}


                  <button
                    type="button"
                    className="change-card-button"
                    onClick={goBackToUpload}
                  >

                    ↺ Change card images

                  </button>

                </aside>


                <section className="contact-editor">


                  <div className="editor-header">


                    <div>

                      <span className="editor-eyebrow">

                        CONTACT INFORMATION

                      </span>


                      <h3>
                        Extracted details
                      </h3>

                    </div>


                    <div className="editor-status">

                      <span />

                      Ready to save

                    </div>

                  </div>


                  <div className="form-section">


                    <div className="form-section-title">


                      <div className="form-title-icon">
                        👤
                      </div>


                      <div>

                        <h4>
                          Basic information
                        </h4>

                        <p>
                          Personal and professional details
                        </p>

                      </div>

                    </div>


                    <div className="advanced-form-grid">


                      <FormField
                        label="Full Name"
                        value={contact.name}
                        placeholder="Enter full name"
                        onChange={(value) =>
                          updateField(
                            "name",
                            value
                          )
                        }
                      />


                      <FormField
                        label="Company / Organization"
                        value={contact.company_name}
                        placeholder="Enter company name"
                        onChange={(value) =>
                          updateField(
                            "company_name",
                            value
                          )
                        }
                      />


                      <FormField
                        label="Designation"
                        value={contact.designation}
                        placeholder="Enter designation"
                        onChange={(value) =>
                          updateField(
                            "designation",
                            value
                          )
                        }
                      />


                      <FormField
                        label="Website"
                        value={contact.website}
                        placeholder="www.example.com"
                        onChange={(value) =>
                          updateField(
                            "website",
                            value
                          )
                        }
                      />


                      <FormField
                        label="LinkedIn"
                        value={contact.linkedin}
                        placeholder="LinkedIn profile"
                        onChange={(value) =>
                          updateField(
                            "linkedin",
                            value
                          )
                        }
                      />

                    </div>

                  </div>


                  <div className="form-section">

                    <EditableList
                      label="Mobile Numbers"
                      icon="📱"
                      description="Phone and mobile contact numbers"
                      field="mobile_numbers"
                      values={
                        contact.mobile_numbers ||
                        []
                      }
                      placeholder="+91 98765 43210"
                      onChange={updateListField}
                      onAdd={addListItem}
                      onRemove={removeListItem}
                    />

                  </div>


                  <div className="form-section">

                    <EditableList
                      label="Email Addresses"
                      icon="✉"
                      description="Email contact information"
                      field="email_addresses"
                      values={
                        contact.email_addresses ||
                        []
                      }
                      placeholder="name@example.com"
                      onChange={updateListField}
                      onAdd={addListItem}
                      onRemove={removeListItem}
                    />

                  </div>


                  <div className="form-section">


                    <div className="form-section-title">


                      <div className="form-title-icon">
                        📍
                      </div>


                      <div>

                        <h4>
                          Address
                        </h4>

                        <p>
                          Business or office location
                        </p>

                      </div>

                    </div>


                    <div className="text-field-group">

                      <textarea
                        value={
                          contact.address ||
                          ""
                        }
                        placeholder="Enter complete address"
                        onChange={(event) =>
                          updateField(
                            "address",
                            event.target.value
                          )
                        }
                      />

                    </div>

                  </div>


                  <div className="form-section">


                    <div className="form-section-title">


                      <div className="form-title-icon">
                        ✦
                      </div>


                      <div>

                        <h4>
                          Additional details
                        </h4>

                        <p>
                          Any other useful information found on the card
                        </p>

                      </div>

                    </div>


                    <div className="text-field-group">

                      <textarea
                        value={
                          contact.other_details ||
                          ""
                        }
                        placeholder="Additional notes or information"
                        onChange={(event) =>
                          updateField(
                            "other_details",
                            event.target.value
                          )
                        }
                      />

                    </div>

                  </div>


                  <div className="save-contact-footer">


                    <div className="save-copy">


                      <div className="save-step">
                        STEP 03
                      </div>


                      <h3>
                        Everything looks good?
                      </h3>


                      <p>

                        Save this verified contact to your database.

                      </p>

                    </div>


                    <div className="save-actions">


                      <button
                        type="button"
                        className="secondary-back-button"
                        onClick={goBackToUpload}
                      >

                        ← Back

                      </button>


                      <button
                        type="button"
                        className="save-contact-button"
                        onClick={saveContact}
                      >

                        <span>
                          Save Contact
                        </span>

                        <span>
                          →
                        </span>

                      </button>

                    </div>

                  </div>

                </section>

              </div>

            </section>

          )}


        {currentStep === "saving" && (

          <section className="saving-screen">

            <div className="saving-card">


              <div className="saving-animation">

                <div className="saving-circle">

                  <span>
                    ↑
                  </span>

                </div>

              </div>


              <span className="saving-label">

                SAVING CONTACT

              </span>


              <h2>
                Almost there...
              </h2>


              <p>

                We're securely saving your verified contact information.

              </p>


              <div className="saving-progress">

                <span />

              </div>

            </div>

          </section>

        )}


        {currentStep === "success" && (

          <section className="success-screen">


            <div className="success-confetti confetti-one">
              ✦
            </div>

            <div className="success-confetti confetti-two">
              ●
            </div>

            <div className="success-confetti confetti-three">
              ✦
            </div>

            <div className="success-confetti confetti-four">
              ●
            </div>


            <div className="success-card">


              <div className="success-icon-wrapper">


                <div className="success-ring ring-a" />

                <div className="success-ring ring-b" />


                <div className="success-icon">
                  ✓
                </div>

              </div>


              <span className="success-eyebrow">

                SUCCESSFULLY SAVED

              </span>


              <h2>

                Contact added

                <span>
                  successfully!
                </span>

              </h2>


              <p>

                {savedContactName} has been saved successfully.
                Your contact is now ready to use.

              </p>


              <div className="success-contact-summary">


                <div className="success-avatar">

                  {
                    savedContactName
                      .charAt(0)
                      .toUpperCase() ||
                    "C"
                  }

                </div>


                <div>

                  <strong>

                    {
                      savedContactName ||
                      "New Contact"
                    }

                  </strong>


                  <small>

                    Contact saved to your database

                  </small>

                </div>


                <span className="success-check">
                  ✓
                </span>

              </div>


              <button
                type="button"
                className="scan-new-card-button"
                onClick={resetApplication}
              >


                <span className="new-scan-icon">
                  +
                </span>


                <span>
                  Scan another card
                </span>


                <span className="button-arrow">
                  →
                </span>

              </button>


              <button
                type="button"
                className="simple-home-button"
                onClick={resetApplication}
              >

                Return to home

              </button>

            </div>

          </section>

        )}

      </main>


      {activeCamera && (

        <CameraCapture
          sideLabel={
            activeCamera === "side1"
              ? "Front Side"
              : "Back Side"
          }
          onCapture={
            handleCameraCapture
          }
          onClose={() =>
            setActiveCamera(
              null
            )
          }
        />

      )}

    </div>

  );

}


function FormField({
  label,
  value,
  placeholder,
  onChange
}) {

  return (

    <div className="advanced-form-field">

      <label>
        {label}
      </label>


      <input
        type="text"
        value={
          value ||
          ""
        }
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
      />

    </div>

  );

}


function EditableList({
  label,
  icon,
  description,
  field,
  values,
  placeholder,
  onChange,
  onAdd,
  onRemove
}) {

  return (

    <div className="editable-list">


      <div className="form-section-title">


        <div className="form-title-icon">

          {icon}

        </div>


        <div>

          <h4>
            {label}
          </h4>


          <p>
            {description}
          </p>

        </div>

      </div>


      {values.length === 0 && (

        <div className="empty-list">

          No details extracted.
          You can add one manually.

        </div>

      )}


      {values.map(
        (
          value,
          index
        ) => (

          <div
            className="editable-list-item"
            key={`${field}-${index}`}
          >

            <input
              type="text"
              value={value || ""}
              placeholder={placeholder}
              onChange={(event) =>
                onChange(
                  field,
                  index,
                  event.target.value
                )
              }
            />


            <button
              type="button"
              onClick={() =>
                onRemove(
                  field,
                  index
                )
              }
              title="Remove"
            >

              ✕

            </button>

          </div>

        )
      )}


      <button
        type="button"
        className="add-detail-button"
        onClick={() =>
          onAdd(
            field
          )
        }
      >

        + Add another

      </button>

    </div>

  );

}


export default App;