'use client'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100

  const stepLabels = [
    'Basic Info',
    'Category',
    'Build Sections',
    'Review'
  ]

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between items-center">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div
            key={step}
            className="flex flex-col items-center"
          >
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-1
                ${step < currentStep
                  ? 'bg-blue-600 text-white'
                  : step === currentStep
                  ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                  : 'bg-gray-200 text-gray-500'
                }
              `}
            >
              {step < currentStep ? '✓' : step}
            </div>
            <span className={`text-xs ${step === currentStep ? 'font-semibold text-blue-600' : 'text-gray-500'}`}>
              {stepLabels[step - 1]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
