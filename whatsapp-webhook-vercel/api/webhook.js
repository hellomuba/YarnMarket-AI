// YarnMarket AI WhatsApp Webhook for Vercel
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Log everything for debugging
  console.log('=== YARNMARKET WEBHOOK ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Query:', req.query);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('========================');

  if (req.method === 'GET') {
    // WhatsApp webhook verification
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log('🔍 WhatsApp Verification:');
    console.log('- Mode:', mode);
    console.log('- Token:', token);
    console.log('- Challenge:', challenge);

    // Verify token matches expected value
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'yarnmarket_verify_2024';
    
    if (mode === 'subscribe' && token === VERIFY_TOKEN && challenge) {
      console.log('✅ VERIFICATION SUCCESSFUL');
      return res.status(200).send(challenge);
    }

    console.log('❌ Verification failed');
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid verification token'
    });
  }

  if (req.method === 'POST') {
    try {
      console.log('📨 Processing WhatsApp message...');
      
      const body = req.body;
      
      // Check if it's a WhatsApp message
      if (body.object !== 'whatsapp_business_account') {
        console.log('❌ Not a WhatsApp message');
        return res.status(200).json({ status: 'ignored', reason: 'not whatsapp' });
      }

      let messagesProcessed = 0;
      
      // Process each entry
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field !== 'messages') continue;
          
          const value = change.value || {};
          const messages = value.messages || [];
          const contacts = value.contacts || [];
          
          for (const message of messages) {
            // Find contact info
            const contact = contacts.find(c => c.wa_id === message.from) || {};
            const customerName = contact.profile?.name || 'Customer';
            
            console.log(`📥 Message from ${customerName} (${message.from}):`, message.text?.body || message.type);
            
            // Here you could forward to your local webhook or process directly
            // For now, just log and acknowledge
            messagesProcessed++;
            
            // Optional: Forward to your local webhook
            try {
              if (process.env.LOCAL_WEBHOOK_URL) {
                const forwardResponse = await fetch(process.env.LOCAL_WEBHOOK_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(body)
                });
                console.log('✅ Forwarded to local webhook:', forwardResponse.status);
              }
            } catch (forwardError) {
              console.log('⚠️ Failed to forward to local webhook:', forwardError.message);
            }
          }
        }
      }
      
      console.log(`✅ Processed ${messagesProcessed} messages`);
      
      return res.status(200).json({
        status: 'success',
        processed_messages: messagesProcessed,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Error processing webhook:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  // For any other method
  return res.status(200).json({
    message: 'YarnMarket AI WhatsApp Webhook',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    methods_supported: ['GET (verification)', 'POST (messages)']
  });
}