// Simple test endpoint to debug environment variables
export default function handler(req, res) {
  const env = {
    VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN || 'NOT_SET',
    ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN || 'NOT_SET',
    PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT_SET'
  };

  // Log for debugging
  console.log('Environment variables:', env);

  // Return environment info (be careful in production)
  res.status(200).json({
    message: 'Test endpoint working',
    method: req.method,
    query: req.query,
    environment: env,
    timestamp: new Date().toISOString()
  });
}