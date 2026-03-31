import React from 'react'

export interface WizardContextValue {
  currentStep: number
  totalSteps: number
  next: () => void
  prev: () => void
  data: Record<string, any>
  setData: (data: Record<string, any>) => void
}

export interface WizardProviderProps {
  children: React.ReactNode
  steps: WizardStepComponent[]
  onComplete?: (data: Record<string, any>) => void
}

export type WizardStepComponent = React.ComponentType<{
  context: WizardContextValue
}>
