export interface OAuthTokens {
  accessToken: string
  refreshToken?: string
  expiresAt?: number
  tokenType?: string
  [key: string]: any
}

export type SubscriptionType = 'free' | 'pro' | 'team' | 'enterprise' | 'max'

export interface ReferralRedemptionsResponse {
  redemptions: any[]
  [key: string]: any
}

export interface ReferrerRewardInfo {
  rewardType: string
  amount: number
  [key: string]: any
}
