function ContactForm({
  contact,
  setContact,
}) {
  const updateField = (
    field,
    value
  ) => {
    setContact((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateList = (
    field,
    index,
    value
  ) => {
    setContact((previous) => {
      const updated = [
        ...previous[field],
      ];

      updated[index] = value;

      return {
        ...previous,
        [field]: updated,
      };
    });
  };

  const addListItem = (field) => {
    setContact((previous) => ({
      ...previous,
      [field]: [
        ...previous[field],
        "",
      ],
    }));
  };

  const removeListItem = (
    field,
    index
  ) => {
    setContact((previous) => ({
      ...previous,
      [field]:
        previous[field].filter(
          (_, currentIndex) =>
            currentIndex !== index
        ),
    }));
  };

  return (
    <div className="contact-form-modern">
      <FormSection title="Basic Information">
        <div className="contact-form-grid">
          <InputField
            label="Full Name"
            value={contact.name}
            placeholder="Enter full name"
            onChange={(value) =>
              updateField("name", value)
            }
          />

          <InputField
            label="Company"
            value={contact.company_name}
            placeholder="Company name"
            onChange={(value) =>
              updateField(
                "company_name",
                value
              )
            }
          />

          <InputField
            label="Designation"
            value={contact.designation}
            placeholder="Job title"
            onChange={(value) =>
              updateField(
                "designation",
                value
              )
            }
          />

          <InputField
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

          <InputField
            label="LinkedIn"
            value={contact.linkedin}
            placeholder="LinkedIn profile URL"
            fullWidth={true}
            onChange={(value) =>
              updateField(
                "linkedin",
                value
              )
            }
          />
        </div>
      </FormSection>

      <FormSection title="Phone Numbers">
        <ListField
          values={contact.mobile_numbers}
          field="mobile_numbers"
          placeholder="+91 98765 43210"
          onChange={updateList}
          onAdd={addListItem}
          onRemove={removeListItem}
        />
      </FormSection>

      <FormSection title="Email Addresses">
        <ListField
          values={contact.email_addresses}
          field="email_addresses"
          placeholder="name@example.com"
          onChange={updateList}
          onAdd={addListItem}
          onRemove={removeListItem}
        />
      </FormSection>

      <FormSection title="Address">
        <textarea
          className="modern-textarea"
          value={
            contact.address || ""
          }
          placeholder="Complete address"
          onChange={(event) =>
            updateField(
              "address",
              event.target.value
            )
          }
        />
      </FormSection>

      <FormSection title="Other Details">
        <textarea
          className="modern-textarea"
          value={
            contact.other_details || ""
          }
          placeholder="Additional information"
          onChange={(event) =>
            updateField(
              "other_details",
              event.target.value
            )
          }
        />
      </FormSection>
    </div>
  );
}

function FormSection({
  title,
  children,
}) {
  return (
    <section className="contact-form-section">
      <h3>
        {title}
      </h3>

      {children}
    </section>
  );
}

function InputField({
  label,
  value,
  placeholder,
  onChange,
  fullWidth,
}) {
  return (
    <div
      className={`modern-input-group ${
        fullWidth
          ? "full-width"
          : ""
      }`}
    >
      <label>
        {label}
      </label>

      <input
        type="text"
        value={value || ""}
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

function ListField({
  values,
  field,
  placeholder,
  onChange,
  onAdd,
  onRemove,
}) {
  return (
    <div className="modern-list-field">
      {values.length === 0 && (
        <div className="no-list-items">
          No details found yet.
        </div>
      )}

      {values.map(
        (value, index) => (
          <div
            className="modern-list-item"
            key={`${field}-${index}`}
          >
            <input
              type="text"
              value={value}
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
            >
              ×
            </button>
          </div>
        )
      )}

      <button
        type="button"
        className="add-list-button"
        onClick={() =>
          onAdd(field)
        }
      >
        + Add another
      </button>
    </div>
  );
}

export default ContactForm;