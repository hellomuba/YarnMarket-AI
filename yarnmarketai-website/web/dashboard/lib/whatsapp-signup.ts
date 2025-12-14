/**
 * WhatsApp Business Embedded Signup Integration
 * Handles merchant WhatsApp connection via Meta's Embedded Signup flow
 */

declare global {
  interface Window {
    FB: any
    fbAsyncInit: () => void
  }
}

export interface WhatsAppSignupConfig {
  merchantId: string
  businessName: string
  onSuccess: (data: WhatsAppSignupResult) => void
  onError: (error: string) => void
}

export interface WhatsAppSignupResult {
  success: boolean
  phone_number: string
  verified_name: string
  quality_rating: string
}

/**
 * Initialize Facebook SDK
 * Call this once when the app loads
 */
export function initializeFacebookSDK(appId: string): Promise<void> {
  return new Promise((resolve) => {
    // Check if SDK is already loaded
    if (window.FB) {
      resolve()
      return
    }

    // Load SDK asynchronously
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      })
      resolve()
    }

    // Load the SDK script
    const script = document.createElement('script')
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    script.id = 'facebook-jssdk'

    const firstScript = document.getElementsByTagName('script')[0]
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript)
    } else {
      document.head.appendChild(script)
    }
  })
}

/**
 * Launch WhatsApp Embedded Signup flow
 * Opens Meta's modal for merchant to connect their WhatsApp
 */
export function launchWhatsAppSignup(config: WhatsAppSignupConfig) {
  if (!window.FB) {
    config.onError('Facebook SDK not loaded. Please refresh the page and try again.')
    return
  }

  const configId = process.env.NEXT_PUBLIC_META_CONFIG_ID

  if (!configId) {
    config.onError('WhatsApp integration not configured. Please contact support.')
    return
  }

  console.log('Launching WhatsApp Embedded Signup...')

  // Launch Meta's Embedded Signup modal
  window.FB.login(
    function (response: any) {
      if (response.authResponse) {
        console.log('✅ User authorized app')
        const code = response.authResponse.code

        // Exchange code for tokens via our backend
        completeWhatsAppSignup(code, config)
      } else {
        console.log('❌ User cancelled login or did not fully authorize')
        config.onError('WhatsApp connection cancelled. Please try again.')
      }
    },
    {
      config_id: configId,
      response_type: 'code',
      override_default_response_type: true,
      extras: {
        setup: {
          // Pre-fill business name (optional but recommended)
          business: {
            name: config.businessName
          }
        }
      }
    }
  )
}

/**
 * Complete signup by sending auth code to backend
 */
async function completeWhatsAppSignup(
  code: string,
  config: WhatsAppSignupConfig
) {
  try {
    console.log('Sending auth code to backend...')

    const dashboardApiUrl = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || 'http://localhost:8005'

    const response = await fetch(`${dashboardApiUrl}/api/whatsapp/complete-signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: code,
        merchant_id: config.merchantId
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to complete WhatsApp signup')
    }

    const data: WhatsAppSignupResult = await response.json()

    console.log('✅ WhatsApp connected successfully:', data)
    config.onSuccess(data)
  } catch (error) {
    console.error('Error completing WhatsApp signup:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to connect WhatsApp. Please try again.'
    config.onError(errorMessage)
  }
}

/**
 * Get WhatsApp connection status for a merchant
 */
export async function getWhatsAppStatus(merchantId: string) {
  try {
    const dashboardApiUrl = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || 'http://localhost:8005'

    const response = await fetch(`${dashboardApiUrl}/api/whatsapp/status/${merchantId}`)

    if (!response.ok) {
      throw new Error('Failed to get WhatsApp status')
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting WhatsApp status:', error)
    return {
      connected: false,
      phone_number: null,
      verified_name: null,
      quality_rating: null
    }
  }
}

/**
 * Disconnect WhatsApp from merchant account
 */
export async function disconnectWhatsApp(merchantId: string) {
  try {
    const dashboardApiUrl = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || 'http://localhost:8005'

    const response = await fetch(`${dashboardApiUrl}/api/whatsapp/disconnect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        merchant_id: merchantId
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to disconnect WhatsApp')
    }

    return await response.json()
  } catch (error) {
    console.error('Error disconnecting WhatsApp:', error)
    throw error
  }
}
