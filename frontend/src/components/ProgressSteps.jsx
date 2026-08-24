const steps = [
  {
    number: 1,
    title: "Upload",
    subtitle: "Add your card",
  },
  {
    number: 2,
    title: "AI Scan",
    subtitle: "Reading details",
  },
  {
    number: 3,
    title: "Review",
    subtitle: "Check information",
  },
  {
    number: 4,
    title: "Done",
    subtitle: "Contact saved",
  },
];

function ProgressSteps({
  currentStep,
}) {
  return (
    <div className="progress-container">
      {steps.map((step, index) => {
        const isActive =
          step.number === currentStep;

        const isComplete =
          step.number < currentStep;

        return (
          <div
            className="progress-item-wrapper"
            key={step.number}
          >
            <div className="progress-item">
              <div
                className={`progress-number ${
                  isActive
                    ? "active"
                    : ""
                } ${
                  isComplete
                    ? "complete"
                    : ""
                }`}
              >
                {isComplete
                  ? "✓"
                  : step.number}
              </div>

              <div className="progress-copy">
                <strong>
                  {step.title}
                </strong>

                <span>
                  {step.subtitle}
                </span>
              </div>
            </div>

            {index <
              steps.length - 1 && (
              <div
                className={`progress-line ${
                  step.number <
                  currentStep
                    ? "complete"
                    : ""
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ProgressSteps;