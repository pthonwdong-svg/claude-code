export type FeedbackSurveyType = 'nps' | 'satisfaction' | 'feature_request'

export interface FeedbackSurveyResponse {
  type: FeedbackSurveyType
  score?: number
  comment?: string
  timestamp: number
  [key: string]: any
}
