// Simple test to verify webhook verification works
const fetch = require('node-fetch');

const WEBHOOK_URL = 'https://whatsapp-webhook-vercel-i6fsts6wp-hellomubas-projects.vercel.app/api/webhook';
const VERIFY_TOKEN = 'EAAKX1rZCMQ20BPSpm2ZBVCw2Lj52yZCO0sgT8FEw9v7pXzuJJeFZB1BxBs9xmW3atoLLOvXqPZBduVSkmNa3sEsZCyqnz7lJW2ShbkPxq1LRMv8z4lVA2z0AqC7kDMlTL34bTRlNayAkroLMjwzMYREEgdZBX4f60vfCfX3UysdZCl75PSsn71oUZAEWDaWlB8sOL9DaGbeTZCZAE1VWPgzduu0mZAG5Ea54molWZBNcbxTm8VXFaV4ybXPFqeSWipdPxfw4ZD';

async function testWebhookVerification() {
  try {
    const testChallenge = 'test_challenge_12345';
    const url = `${WEBHOOK_URL}?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=${testChallenge}`;
    
    console.log('Testing webhook verification...');
    console.log('URL:', url);
    
    const response = await fetch(url);
    const text = await response.text();
    
    console.log('Status:', response.status);
    console.log('Response:', text);
    
    if (response.status === 200 && text === testChallenge) {
      console.log('✅ Webhook verification test PASSED!');
    } else {
      console.log('❌ Webhook verification test FAILED!');
    }
    
  } catch (error) {
    console.error('Error testing webhook:', error);
  }
}

testWebhookVerification();