// Simple debug webhook to test if messages are reaching us
export default function handler(req, res) {
  console.log('🔔 DEBUG WEBHOOK CALLED');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Query:', JSON.stringify(req.query, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('========================');

  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const challenge = req.query['hub.challenge'];
    
    console.log('✅ GET verification request');
    
    if (mode === 'subscribe' && challenge) {
      console.log('✅ Returning challenge:', challenge);
      return res.status(200).send(challenge);
    }
    
    return res.status(200).send('Debug webhook active');
  }

  if (req.method === 'POST') {
    console.log('📨 POST REQUEST RECEIVED!');
    console.log('This means messages ARE reaching the webhook!');
    
    // Just return OK without processing
    return res.status(200).send('OK');
  }

  return res.status(200).send('Debug webhook is running');
}