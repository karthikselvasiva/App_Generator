import { Check } from 'lucide-react';
import './StepIndicator.css';

const steps = [
  { num: 1, label: 'Website URL' },
  { num: 2, label: 'App Settings' },
  { num: 3, label: 'Welcome Screen' },
  { num: 4, label: 'Build & Download' },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="step-indicator">
      {steps.map((step, i) => (
        <div key={step.num} className="step-item-wrapper">
          <div className={`step-item ${currentStep > step.num ? 'completed' : ''} ${currentStep === step.num ? 'active' : ''}`}>
            <div className="step-circle">
              {currentStep > step.num ? <Check size={16} /> : step.num}
            </div>
            <span className="step-label">{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`step-line ${currentStep > step.num ? 'completed' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
}
