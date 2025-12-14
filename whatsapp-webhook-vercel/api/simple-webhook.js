// Minimal webhook for debugging
export default function handler(req, res) {
  console.log('Request received:', {
    method: req.method,
    query: req.query,
    headers: req.headers,
    body: req.body
  });

  if (req.method === 'GET') {
    // Webhook verification
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    console.log('Verification request:', { mode, token, challenge });
    
    // Accept ANY verification for debugging
    if (mode === 'subscribe' && challenge) {
      console.log('Verification successful!');
      return res.status(200).send(challenge);
    }
    
    console.log('Verification failed');
    return res.status(403).send('Forbidden');
  }
  
  if (req.method === 'POST') {
    console.log('POST request received');
    return res.status(200).send('OK');
  }
  
  return res.status(405).send('Method Not Allowed');
}