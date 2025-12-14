// YarnMarket AI - Full Integration with Conversation Engine
// Connects WhatsApp to Cultural Intelligence, Haggling, and OpenAI

const openai = require('openai');

// Environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || 'EAAKX1rZCMQ20BPSLgWn0iKJknyD4VqmFNfN8iW6OpPoHVa4e9cKI7cCUAfYrz78ifCxW5ZCtIIkiFmbTlKjAuWxqGjT88VnZBK7nb5iYFZA3JOQZCIX0usmgjDgnFWGuNndpai13BEOkEiBEQGSJKUqLZAr4ibzb4ZCneSXD7Wc6YCZBBxTpmsuo3NZCKWEZCwhTmLN03PYFYgOCNS0eYTWiZAyzNOfJHkIqRw5Yh0wpZCwr7Ih8bY3LZBMpQQqqLWf3ZCXEuVIAZDZD';
const PHONE_NUMBER_ID = '772141085979230';
const VERIFY_TOKEN = 'yarnmarket_verify_2024';

// Initialize OpenAI client
let openaiClient = null;
if (OPENAI_API_KEY) {
  openaiClient = new openai.OpenAI({ 
    apiKey: OPENAI_API_KEY 
  });
}

// Conversation memory and customer profiles
const conversationMemory = new Map();
const customerProfiles = new Map();
const negotiationSessions = new Map();

// YarnMarket AI Cultural Intelligence System
class YarnMarketCulturalAI {
  constructor() {
    this.nigerianGreetings = {
      pidgin: {
        morning: [
          "Good morning o! How you dey today? Wetin you wan buy for YarnMarket?",
          "Morning my customer! You come early today o. How we fit help you find good things?",
          "Eh! Good morning! Welcome to YarnMarket. Wetin dey worry you today? Make we solve am!",
          "Good morning sir/madam! Hope you sleep well? Come make we do business wey go sweet you!"
        ],
        afternoon: [
          "Good afternoon! You dey try well well to come YarnMarket today. Wetin you need?",
          "Afternoon my brother/sister! Hope say afternoon dey treat you well? Make we find wetin you want!",
          "Welcome! Good afternoon o! Come make we see wetin YarnMarket fit do for you today.",
          "Afternoon customer! You come at the right time. Our goods dey fresh and original!"
        ],
        evening: [
          "Good evening sir/madam! You still dey hustle o. Wetin bring you come YarnMarket?",
          "Evening my person! Hope your day go well? Make we do quick business before night come.",
          "Good evening o! Even for evening you still dey find quality things. I respect you!",
          "Evening my customer! You know where to find original goods. YarnMarket na the best!"
        ]
      },
      english: {
        morning: [
          "Good morning! Welcome to YarnMarket. How can I help you find what you're looking for today?",
          "Morning! Thank you for choosing YarnMarket. What products interest you?",
          "Good morning! I hope you're doing well. What brings you to YarnMarket today?",
          "Morning! I'm excited to help you discover our amazing products. What can I show you?"
        ],
        afternoon: [
          "Good afternoon! Welcome to YarnMarket. What can I help you with today?",
          "Afternoon! Thank you for visiting YarnMarket. How may I assist you?",
          "Good afternoon! What brings you to Nigeria's premier online marketplace today?",
          "Afternoon! I'm here to help you find exactly what you need. What are you looking for?"
        ],
        evening: [
          "Good evening! Thank you for choosing YarnMarket even this late. How can I help?",
          "Evening! I appreciate you visiting our marketplace. What can I show you?",
          "Good evening! What brings you to YarnMarket this evening?",
          "Evening! Thank you for trusting YarnMarket. How may I assist you today?"
        ]
      }
    };

    this.haggleResponses = {
      opening: [
        "Ah! You get eye for good things o! This product na original, quality guarantee. But because you be my customer, make we talk am well.",
        "My friend, you choose correct thing! This na premium quality wey go last you long time. But I fit arrange better price for you.",
        "You see this product? Na fire! But make I tell you wetin... as you be serious customer, we fit negotiate small.",
        "This na quality goods wey everybody dey find. But since you come personally, make we see how we fit work together."
      ],
      middleNegotiation: [
        "Eh! You dey try sha! But consider the quality - this thing na original, no be fake. How about we meet somewhere in the middle?",
        "I see say you sabi market! Okay, make we do business. I fit come down small, but the quality must reflect for price o.",
        "You get good negotiation skills! Let me check... okay, I fit adjust small for you. But this na my best price o!",
        "Alright, alright! You don already win me. But remember, this na premium quality - e no go disappoint you!"
      ],
      finalOffer: [
        "Okay, you don win! This na my final price - I no fit go below this one again. Na real talk!",
        "My friend, you tough o! This price wey I give you now, na special for you. I no dey give everybody this rate.",
        "Chai! You don negotiate well well. This final price na because I like you. Other people dey pay more!",
        "Last price be this o! If you agree now, we go seal the deal. This na below market price already!"
      ]
    };

    this.productCategories = {
      electronics: {
        keywords: ['phone', 'laptop', 'computer', 'tablet', 'headphones', 'speaker', 'tv', 'camera', 'gadget', 'tech'],
        responses: [
          "Tech lover! 📱 You don come to the right place! YarnMarket get all the latest electronics wey dey trend now.",
          "Electronics specialist here! 💻 From phones to laptops, we get original products with warranty.",
          "Welcome to our tech section! 🎧 Quality electronics with competitive prices - that's our specialty!"
        ]
      },
      fashion: {
        keywords: ['dress', 'shirt', 'trouser', 'shoe', 'bag', 'watch', 'jewelry', 'clothes', 'fashion', 'style'],
        responses: [
          "Fashion forward! 👗 YarnMarket get the latest styles wey go make you shine!",
          "Style icon! 👔 From casual to corporate wear, we get everything to upgrade your wardrobe.",
          "Fashion specialist here! 💫 Quality materials, trendy designs, and affordable prices!"
        ]
      },
      home: {
        keywords: ['furniture', 'kitchen', 'home', 'decor', 'appliance', 'bed', 'chair', 'table', 'fridge'],
        responses: [
          "Home improvement specialist! 🏠 Make your house beautiful with our quality furniture and appliances.",
          "Home and kitchen expert! 🍳 From cookware to furniture, we get everything to make your home complete.",
          "Interior decoration time! ✨ Transform your space with our amazing home products."
        ]
      }
    };

    this.timeOfDay = this.getCurrentTimeOfDay();
  }

  getCurrentTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  detectLanguagePreference(message) {
    const pidginWords = ['dey', 'wetin', 'wan', 'fit', 'sha', 'abi', 'no', 'wey', 'go', 'make'];
    const messageLower = message.toLowerCase();
    
    const pidginMatches = pidginWords.filter(word => messageLower.includes(word)).length;
    return pidginMatches >= 2 ? 'pidgin' : 'english';
  }

  generateCulturalGreeting(customerName, detectedLanguage) {
    const language = detectedLanguage === 'pidgin' ? 'pidgin' : 'english';
    const greetings = this.nigerianGreetings[language][this.timeOfDay];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    return greeting.replace(/sir\/madam|my customer|my person|my brother\/sister/, customerName || 'my friend');
  }

  detectProductCategory(message) {
    const messageLower = message.toLowerCase();
    
    for (const [category, data] of Object.entries(this.productCategories)) {
      if (data.keywords.some(keyword => messageLower.includes(keyword))) {
        return {
          category,
          response: data.responses[Math.floor(Math.random() * data.responses.length)]
        };
      }
    }
    
    return null;
  }

  generateHagglingResponse(stage, customerOffer, originalPrice) {
    let responseArray;
    
    switch (stage) {
      case 'opening':
        responseArray = this.haggleResponses.opening;
        break;
      case 'middle':
        responseArray = this.haggleResponses.middleNegotiation;
        break;
      case 'final':
        responseArray = this.haggleResponses.finalOffer;
        break;
      default:
        responseArray = this.haggleResponses.opening;
    }
    
    return responseArray[Math.floor(Math.random() * responseArray.length)];
  }

  async generateAdvancedResponse(message, customerName, conversationHistory) {
    if (!openaiClient) {
      return this.generateRuleBasedResponse(message, customerName);
    }

    try {
      const systemPrompt = `You are YarnMarket AI, a culturally intelligent Nigerian e-commerce assistant.

PERSONALITY:
- Warm, friendly, and culturally authentic Nigerian marketplace experience
- Mix English with appropriate Nigerian pidgin expressions
- Use marketplace psychology and gentle negotiation techniques
- Always helpful and solution-oriented

CULTURAL CONTEXT:
- Time: ${this.timeOfDay} in Lagos, Nigeria
- Customer: ${customerName}
- Setting: Premium online marketplace (YarnMarket)

CONVERSATION STYLE:
- Use expressions like "o!", "sha", "abeg", "my friend" naturally
- Be enthusiastic about products and deals
- Show genuine interest in helping the customer
- Use gentle persuasion and market psychology

CAPABILITIES:
- Product search and recommendations
- Price negotiations and deals
- Order tracking and customer service
- Shopping guidance and comparisons

Previous conversation: ${conversationHistory.slice(-3).join('\n')}

Customer message: "${message}"

Respond as YarnMarket AI with cultural authenticity:`;

      const response = await openaiClient.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 200,
        temperature: 0.8
      });

      return response.choices[0].message.content.trim();

    } catch (error) {
      console.error('OpenAI error:', error);
      return this.generateRuleBasedResponse(message, customerName);
    }
  }

  generateRuleBasedResponse(message, customerName) {
    const messageLower = message.toLowerCase();
    const detectedLanguage = this.detectLanguagePreference(message);
    const productCategory = this.detectProductCategory(message);

    // Greeting detection
    if (messageLower.includes('hello') || messageLower.includes('hi') || messageLower.includes('morning') || messageLower.includes('evening')) {
      return this.generateCulturalGreeting(customerName, detectedLanguage);
    }

    // Price/negotiation detection
    if (messageLower.includes('price') || messageLower.includes('cost') || messageLower.includes('how much') || messageLower.includes('naira') || messageLower.includes('₦')) {
      const hagglingResponse = this.generateHagglingResponse('opening');
      return `${hagglingResponse}\n\nTell me which specific product you want, and I'll give you the best price with room for friendly negotiation! 💰`;
    }

    // Product category detection
    if (productCategory) {
      return `${productCategory.response}\n\nWhat specific ${productCategory.category} item you dey find? Let me show you our best options! 🎯`;
    }

    // Help/assistance
    if (messageLower.includes('help') || messageLower.includes('assist')) {
      const helpStyle = detectedLanguage === 'pidgin' 
        ? `I dey here to help you, ${customerName}! 🤝\n\nWetin you fit do here:\n🛍️ Find any product wey you want\n💰 Get better price through negotiation\n📦 Track your order\n🎯 Get shopping advice\n\nWetin you need help with?`
        : `I'm here to help, ${customerName}! 🤝\n\nWhat I can do for you:\n🛍️ Find any products you need\n💰 Get you the best deals\n📦 Track your orders\n🎯 Provide shopping guidance\n\nWhat do you need help with?`;
      
      return helpStyle;
    }

    // Default response with cultural touch
    const defaultResponses = detectedLanguage === 'pidgin' 
      ? [
          `Thanks for your message, ${customerName}! 🎯 You talk say: "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}"\n\nI be YarnMarket AI - your market specialist! How I fit help you find wetin you dey look for?`,
          `I hear you, ${customerName}! 👂 About wetin you talk - "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}"\n\nMake we discuss am well! Wetin exactly you wan buy? I go help you get the best deal!`
        ]
      : [
          `Thank you for that, ${customerName}! 🎯 I received: "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}"\n\nI'm YarnMarket AI - your personal shopping assistant! How can I help you find what you're looking for?`,
          `I understand, ${customerName}! 💭 Regarding: "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}"\n\nLet's discuss how I can help you with that! What specific products or services are you interested in?`
        ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }
}

// Negotiation System
class NegotiationAgent {
  constructor() {
    this.activeSessions = new Map();
  }

  startNegotiation(customerId, productName, originalPrice) {
    const session = {
      productName,
      originalPrice,
      currentOffer: null,
      rounds: 0,
      minPrice: originalPrice * 0.7, // 30% discount max
      customerOffers: [],
      stage: 'opening'
    };
    
    this.activeSessions.set(customerId, session);
    return session;
  }

  processCounterOffer(customerId, customerOffer) {
    const session = this.activeSessions.get(customerId);
    if (!session) return null;

    session.rounds++;
    session.customerOffers.push(customerOffer);
    session.currentOffer = customerOffer;

    // Determine negotiation strategy
    const offerRatio = customerOffer / session.originalPrice;
    
    if (offerRatio >= 0.9) {
      // Good offer - accept or slight counter
      session.stage = 'closing';
      return {
        action: offerRatio >= 0.95 ? 'accept' : 'counter',
        counterOffer: session.originalPrice * 0.92,
        message: offerRatio >= 0.95 
          ? "Deal! You get good eye for quality. This price na perfect!"
          : "Almost there! Let's say ₦" + Math.round(session.originalPrice * 0.92) + " and we close this deal!"
      };
    } else if (offerRatio >= 0.75) {
      // Negotiable range
      session.stage = session.rounds >= 3 ? 'final' : 'middle';
      const counterOffer = session.originalPrice * (0.85 - (session.rounds * 0.03));
      
      return {
        action: 'counter',
        counterOffer: Math.max(counterOffer, session.minPrice),
        message: `I see say you sabi negotiate! Let's meet at ₦${Math.round(counterOffer)}. This na quality product wey go last you!`
      };
    } else if (offerRatio >= 0.6) {
      // Low offer - try to bring up
      session.stage = 'middle';
      return {
        action: 'counter',
        counterOffer: session.originalPrice * 0.8,
        message: `My friend, you wan kill person! 😅 Consider the quality sha. How about ₦${Math.round(session.originalPrice * 0.8)}? That's already big discount!`
      };
    } else {
      // Very low offer - educate on value
      return {
        action: 'reject',
        counterOffer: session.originalPrice * 0.85,
        message: `Ah! This price too low o! This na original product with warranty. I fit do ₦${Math.round(session.originalPrice * 0.85)} - that's my special price for you!`
      };
    }
  }

  endNegotiation(customerId) {
    this.activeSessions.delete(customerId);
  }
}

// Initialize AI systems
const culturalAI = new YarnMarketCulturalAI();
const negotiationAgent = new NegotiationAgent();

// Main webhook handler
export default async function handler(req, res) {
  console.log('🔔 YarnMarket AI Webhook Request:', {
    method: req.method,
    timestamp: new Date().toISOString()
  });

  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified successfully!');
      return res.status(200).send(challenge);
    }

    return res.status(403).send('Forbidden');
  }

  if (req.method === 'POST') {
    try {
      console.log('📨 Processing WhatsApp message...');
      
      if (req.body?.object === 'whatsapp_business_account') {
        for (const entry of req.body.entry || []) {
          for (const change of entry.changes || []) {
            if (change.field === 'messages') {
              await processMessages(change.value);
            }
          }
        }
      }

      return res.status(200).send('OK');
    } catch (error) {
      console.error('❌ Webhook error:', error);
      return res.status(500).send('Internal Server Error');
    }
  }

  return res.status(405).send('Method Not Allowed');
}

// Process incoming messages with full AI
async function processMessages(messageData) {
  const messages = messageData.messages || [];
  const contacts = messageData.contacts || [];

  for (const message of messages) {
    try {
      const contact = contacts.find(c => c.wa_id === message.from) || {};
      const customerName = contact.profile?.name || 'Customer';
      const customerPhone = message.from;

      console.log('💬 Processing message:', {
        from: customerPhone,
        name: customerName,
        type: message.type,
        text: message.text?.body
      });

      // Get or create customer profile
      if (!customerProfiles.has(customerPhone)) {
        customerProfiles.set(customerPhone, {
          name: customerName,
          phone: customerPhone,
          language_preference: 'auto',
          conversation_count: 0,
          last_seen: new Date(),
          negotiation_style: 'unknown'
        });
      }

      // Get conversation history
      const history = conversationMemory.get(customerPhone) || [];

      let aiResponse;

      if (message.type === 'text') {
        const messageText = message.text.body;
        
        // Check if this is a price negotiation
        const priceMatch = messageText.match(/₦?(\d+(?:,\d{3})*)/);
        if (priceMatch && negotiationSessions.has(customerPhone)) {
          // Handle negotiation
          const customerOffer = parseInt(priceMatch[1].replace(/,/g, ''));
          const negotiationResult = negotiationAgent.processCounterOffer(customerPhone, customerOffer);
          
          if (negotiationResult) {
            aiResponse = negotiationResult.message;
            if (negotiationResult.action === 'accept') {
              negotiationAgent.endNegotiation(customerPhone);
              aiResponse += "\n\n🎉 Perfect! Deal closed! Should I help you place the order now?";
            }
          }
        } else {
          // Generate AI response using cultural intelligence
          aiResponse = await culturalAI.generateAdvancedResponse(
            messageText,
            customerName,
            history
          );
        }

        // Update conversation memory
        history.push(`Customer: ${messageText}`);
        history.push(`YarnMarket AI: ${aiResponse}`);
        conversationMemory.set(customerPhone, history.slice(-10)); // Keep last 10 exchanges

        // Update customer profile
        const profile = customerProfiles.get(customerPhone);
        profile.conversation_count++;
        profile.last_seen = new Date();
        profile.language_preference = culturalAI.detectLanguagePreference(messageText);

      } else {
        // Handle non-text messages
        aiResponse = `Thanks for the ${message.type}, ${customerName}! 📎 I received your media message. How can I help you with your shopping today? Feel free to tell me what you're looking for! 🛍️`;
      }

      // Send response
      await sendMessage(customerPhone, aiResponse);

    } catch (error) {
      console.error('Error processing individual message:', error);
    }
  }
}

// Send message function
async function sendMessage(to, text) {
  try {
    const url = `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: text }
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Message sent successfully:', result.messages?.[0]?.id);
    } else {
      const error = await response.json();
      console.error('❌ Send message failed:', error);
    }
  } catch (error) {
    console.error('❌ Send message error:', error);
  }
}