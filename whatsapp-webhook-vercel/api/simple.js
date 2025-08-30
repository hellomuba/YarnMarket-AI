// Simple WhatsApp webhook for Vercel - no auth required
export default function handler(req, res) {
  // Disable authentication
  res.setHeader('x-robots-tag', 'noindex');
  
  if (req.method === 'GET') {
    // WhatsApp verification
    const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
    
    if (mode === 'subscribe' && token === 'yarnmarket_verify_2024') {
      return res.status(200).send(challenge);
    }
    
    return res.status(403).send('Forbidden');
  }
  
  if (req.method === 'POST') {
    console.log('WhatsApp message received:', JSON.stringify(req.body, null, 2));
    return res.status(200).json({ status: 'ok' });
  }
  
  return res.status(200).json({ message: 'YarnMarket WhatsApp Webhook' });
}