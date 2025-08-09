// API Response types for subscription endpoints

export interface SubscriptionStatusResponse {
  success: boolean
  data?: {
    userId: string
    status: 'free' | 'pro' | 'expired' | 'cancelled'
    planType: string | null
    expiresAt: string | null
    dailyLimit: number
    usedToday: number
    remainingExports: number
    canExportGoogleSheets: boolean
    canExportToGoogleDrive: boolean
  }
  error?: string
}

export interface ExportCheckResponse {
  success: boolean
  canExport?: boolean
  reason?: string
  remainingExports?: number
  usageIncremented?: boolean
  unlimited?: boolean
  status?: string
  error?: string
}

export interface UsageResponse {
  success: boolean
  data?: {
    usedToday: number
    dailyLimit: number
    remainingExports: number
    status: string
  }
  usedToday?: number
  dailyLimit?: number
  remainingExports?: number
  unlimited?: boolean
  error?: string
}

export interface ExportCapabilityResponse {
  success: boolean
  canExport: boolean
  reason?: string
  remainingExports?: number
  exportType: string
  format?: string
  error?: string
}