# WhatsApp Webhook with Vercel (Free & Permanent)

## Why Choose Vercel for Your Webhook
✅ Completely free for personal projects  
✅ Permanent URL - never expires  
✅ Automatic HTTPS - required for WhatsApp webhooks  
✅ Instant deployments - updates in seconds  
✅ No server management - just deploy and forget  
✅ Built-in logging - see webhook activity in dashboard  

## Quick Setup Guide

### 1. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from this directory)
cd whatsapp-webhook-vercel
vercel --prod
```

### 2. Set Environment Variables in Vercel

Go to your Vercel dashboard → Project → Settings → Environment Variables

Add these variables:
- `WHATSAPP_VERIFY_TOKEN`: `test_verify_token_12345` (or your custom token)
- `WHATSAPP_WEBHOOK_SECRET`: (optional, for signature verification)

### 3. Configure WhatsApp Business API

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app → Business → WhatsApp Business Platform
3. In WhatsApp → Configuration:
   - **Callback URL**: `https://your-project.vercel.app/api/webhook`
   - **Verify Token**: `test_verify_token_12345` (same as in Vercel)
   - **Webhook Fields**: Select `messages` and `message_deliveries`

### 4. Test Your Webhook

Send a test message from WhatsApp Business API or use the webhook test tool.

Check logs in Vercel dashboard → Functions → View Function Logs

## File Structure

```
whatsapp-webhook-vercel/
├── api/
│   └── webhook.js          # Main webhook handler
├── package.json            # Dependencies
├── vercel.json            # Vercel configuration
└── README.md              # This file
```

## Features Included

- ✅ Webhook verification (GET request)
- ✅ Message processing (POST request)
- ✅ Signature verification (optional)
- ✅ Message type handling (text, image, document, audio)
- ✅ Status updates handling
- ✅ Error handling and logging
- ✅ Contact information extraction

## Customization

Edit `api/webhook.js` to add your business logic:

```javascript
// Add your message processing logic in processMessage function
async function processMessage(message, contacts) {
  // Your custom logic here
  console.log('Processing message:', message);
}
```

## Security Notes

- Always use HTTPS URLs (Vercel provides this automatically)
- Set `WHATSAPP_WEBHOOK_SECRET` for production to verify webhook signatures
- Never expose your access tokens in code - use Vercel environment variables

## Troubleshooting

**Webhook verification fails:**
- Check that verify token matches exactly
- Ensure URL is correct: `https://your-project.vercel.app/api/webhook`

**Messages not received:**
- Check Vercel function logs
- Verify webhook is subscribed to correct fields
- Ensure webhook URL is accessible via HTTPS

**Deployment issues:**
- Run `vercel --prod` for production deployment
- Check Node.js version (using 18.x as specified in package.json)

## Next Steps

1. **Add Response Logic**: Implement automatic replies in `processMessage`
2. **Database Integration**: Connect to your database to store messages
3. **Business Logic**: Add your specific business workflows
4. **Rate Limiting**: Implement rate limiting for production
5. **Monitoring**: Set up alerts for webhook failures

Your webhook is now live and permanent at: `https://your-project.vercel.app/api/webhook`