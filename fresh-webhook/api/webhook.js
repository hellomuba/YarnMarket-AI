// YarnMarket AI - Full Integration with Conversation Engine
// Connects WhatsApp to Cultural Intelligence, Haggling, and OpenAI

// Environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || 'EAAKX1rZCMQ20BPSLgWn0iKJknyD4VqmFNfN8iW6OpPoHVa4e9cKI7cCUAfYrz78ifCxW5ZCtIIkiFmbTlKjAuWxqGjT88VnZBK7nb5iYFZA3JOQZCIX0usmgjDgnFWGuNndpai13BEOkEiBEQGSJKUqLZAr4ibzb4ZCneSXD7Wc6YCZBBxTpmsuo3NZCKWEZCwhTmLN03PYFYgOCNS0eYTWiZAyzNOfJHkIqRw5Yh0wpZCwr7Ih8bY3LZBMpQQqqLWf3ZCXEuVIAZDZD';
const PHONE_NUMBER_ID = '772141085979230';
const VERIFY_TOKEN = 'yarnmarket_verify_2024';

// OpenAI Client (only if API key is available)
let openaiEnabled = false;
if (OPENAI_API_KEY) {
  openaiEnabled = true;
  console.log('✅ OpenAI integration enabled');
} else {
  console.log('ℹ️ OpenAI not configured - using enhanced rule-based AI');
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
          "Good morning o! How you dey today? Welcome to YarnMarket - wetin you wan buy?",
          "Morning my customer! You come early today o. How YarnMarket fit help you find good things?",
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
      }
    };

    this.haggleResponses = {
      opening: [
        "Ah! You get eye for good things o! This product na original, quality guarantee. But because you be my customer, make we talk am well.",
        "My friend, you choose correct thing! This na premium quality wey go last you long time. But I fit arrange better price for you.",
        "You see this product? Na fire! But make I tell you wetin... as you be serious customer, we fit negotiate small.",
        "This na quality goods wey everybody dey find. But since you come personally, make we see how we fit work together."
      ],
      middle: [
        "Eh! You dey try sha! But consider the quality - this thing na original, no be fake. How about we meet somewhere in the middle?",
        "I see say you sabi market! Okay, make we do business. I fit come down small, but the quality must reflect for price o.",
        "You get good negotiation skills! Let me check... okay, I fit adjust small for you. But this na my best price o!",
        "Alright, alright! You don already win me. But remember, this na premium quality - e no go disappoint you!"
      ],
      final: [
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
    const timeGreetings = this.nigerianGreetings[language][this.timeOfDay];
    const greeting = timeGreetings[Math.floor(Math.random() * timeGreetings.length)];
    
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

  generateHagglingResponse(stage) {
    const responses = this.haggleResponses[stage] || this.haggleResponses.opening;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async generateAdvancedResponse(message, customerName, conversationHistory) {
    if (!openaiEnabled) {
      return this.generateRuleBasedResponse(message, customerName);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are YarnMarket AI, a culturally intelligent Nigerian e-commerce assistant.

PERSONALITY:
- Warm, friendly, and culturally authentic Nigerian marketplace experience
- Mix English with appropriate Nigerian pidgin expressions naturally
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
- Use gentle persuasion and Nigerian market psychology

CAPABILITIES:
- Product search and recommendations
- Price negotiations and deals with haggling
- Order tracking and customer service
- Shopping guidance and comparisons

Previous conversation: ${conversationHistory.slice(-3).join('\n')}

Respond as YarnMarket AI with authentic Nigerian cultural flavor:`
            },
            { role: "user", content: message }
          ],
          max_tokens: 200,
          temperature: 0.8
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content.trim();
      } else {
        console.error('OpenAI API error:', await response.text());
        return this.generateRuleBasedResponse(message, customerName);
      }

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
      return `${hagglingResponse}\n\nTell me which specific product you want, and I'll give you the best price with room for friendly negotiation! 💰\n\nExample: "iPhone 15 price" or "Samsung TV cost"`;
    }

    // Product category detection
    if (productCategory) {
      return `${productCategory.response}\n\nWhat specific ${productCategory.category} item you dey find? Let me show you our best options with competitive prices! 🎯`;
    }

    // Help/assistance
    if (messageLower.includes('help') || messageLower.includes('assist')) {
      const helpStyle = detectedLanguage === 'pidgin' 
        ? `I dey here to help you, ${customerName}! 🤝\n\n🛍️ **WETIN I FIT DO FOR YOU:**\n• Find any product wey you want\n• Get better price through negotiation\n• Track your order status\n• Give you shopping advice\n\nWetin you need help with today?`
        : `I'm here to help you, ${customerName}! 🤝\n\n🛍️ **WHAT I CAN DO:**\n• Find any products you need\n• Get you the best deals through negotiation\n• Track your orders\n• Provide shopping guidance\n\nWhat do you need help with today?`;
      
      return helpStyle;
    }

    // Thank you responses
    if (messageLower.includes('thank') || messageLower.includes('thanks')) {
      const thankYou = detectedLanguage === 'pidgin'
        ? `You welcome well well, ${customerName}! 😊 Na my pleasure to help you get the best from YarnMarket. Anything else you wan buy?`
        : `You're very welcome, ${customerName}! 😊 It's my pleasure to help you get the best deals at YarnMarket. Anything else you'd like to explore?`;
      
      return thankYou;
    }

    // Default response with cultural touch
    const defaultResponses = detectedLanguage === 'pidgin' 
      ? [
          `Thanks for your message, ${customerName}! 🎯\n\nYou talk say: "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}"\n\nI be YarnMarket AI - your personal shopping assistant! How I fit help you find wetin you dey look for? Try ask me about any product!`,
          `I hear you well, ${customerName}! 👂\n\nAbout wetin you talk: "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}"\n\nMake we discuss am! Wetin exactly you wan buy? I go help you get the best deal with negotiation join!`
        ]
      : [
          `Thank you for that message, ${customerName}! 🎯\n\nI received: "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}"\n\nI'm YarnMarket AI - your personal shopping assistant! How can I help you find what you're looking for? Feel free to ask about any product!`,
          `I understand, ${customerName}! 💭\n\nRegarding: "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}"\n\nLet's discuss how I can help you with that! What specific products are you interested in? I can also help you negotiate the best prices!`
        ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }
}

// Negotiation System
class NegotiationAgent {
  constructor() {
    this.activeSessions = new Map();
  }

  detectPriceInMessage(message) {
    const pricePatterns = [
      /₦?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
      /(\d+)\s*naira/gi,
      /(\d+)\s*thousand/gi
    ];

    for (const pattern of pricePatterns) {
      const match = message.match(pattern);
      if (match) {
        let price = parseInt(match[1].replace(/,/g, ''));
        if (message.toLowerCase().includes('thousand')) {
          price *= 1000;
        }
        return price;
      }
    }
    return null;
  }

  startNegotiation(customerId, productName, originalPrice) {
    const session = {
      productName,
      originalPrice,
      currentOffer: null,
      rounds: 0,
      minPrice: originalPrice * 0.75, // 25% discount max
      customerOffers: [],
      stage: 'opening'
    };
    
    this.activeSessions.set(customerId, session);
    return session;
  }

  processCounterOffer(customerId, customerOffer, culturalAI) {
    const session = this.activeSessions.get(customerId);
    if (!session) return null;

    session.rounds++;
    session.customerOffers.push(customerOffer);
    session.currentOffer = customerOffer;

    // Determine negotiation strategy
    const offerRatio = customerOffer / session.originalPrice;
    
    if (offerRatio >= 0.9) {
      // Excellent offer - accept or slight counter
      session.stage = 'closing';
      if (offerRatio >= 0.95) {
        return {
          action: 'accept',
          counterOffer: customerOffer,
          message: "Deal! 🤝 You get excellent eye for quality. This price perfect! Should I help you complete the order now?"
        };
      } else {
        const counterOffer = Math.round(session.originalPrice * 0.92);
        return {
          action: 'counter',
          counterOffer,
          message: `Almost there! Let's meet at ₦${counterOffer.toLocaleString()} and we close this deal today! This na sweet price for both of us. 😊`
        };
      }
    } else if (offerRatio >= 0.8) {
      // Good negotiation range
      session.stage = session.rounds >= 3 ? 'final' : 'middle';
      const counterOffer = Math.round(session.originalPrice * (0.87 - (session.rounds * 0.02)));
      
      return {
        action: 'counter',
        counterOffer: Math.max(counterOffer, session.minPrice),
        message: `I see say you sabi negotiate! 👏 You get good market sense. Let's say ₦${counterOffer.toLocaleString()}. This na quality product wey go serve you well!`
      };
    } else if (offerRatio >= 0.65) {
      // Moderate offer - educate and counter
      session.stage = 'middle';
      const counterOffer = Math.round(session.originalPrice * 0.82);
      return {
        action: 'counter',
        counterOffer,
        message: `My friend, you dey try o! 😅 But this na premium quality - original with warranty included. How about ₦${counterOffer.toLocaleString()}? That's already significant discount for you!`
      };
    } else {
      // Low offer - explain value and counter strongly
      const counterOffer = Math.round(session.originalPrice * 0.85);
      return {
        action: 'counter',
        counterOffer,
        message: `Ah! This price too low o! 😊 You wan make person cry? This na original product with full warranty and quality guarantee. I fit do ₦${counterOffer.toLocaleString()} - that's my special customer price just for you!`
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
  console.log('🔔 YarnMarket AI Cultural Webhook:', {
    method: req.method,
    timestamp: new Date().toISOString(),
    openai_enabled: openaiEnabled
  });

  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ YarnMarket AI Webhook verified successfully!');
      return res.status(200).send(challenge);
    }

    return res.status(403).send('Forbidden');
  }

  if (req.method === 'POST') {
    try {
      console.log('📨 Processing WhatsApp message with YarnMarket AI...');
      
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
      console.error('❌ YarnMarket AI Webhook error:', error);
      return res.status(500).send('Internal Server Error');
    }
  }

  return res.status(200).json({
    status: 'YarnMarket AI Webhook Active',
    features: ['Cultural Intelligence', 'Negotiation Agent', 'OpenAI Integration'],
    timestamp: new Date().toISOString()
  });
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

      console.log('💬 YarnMarket AI processing:', {
        from: customerPhone,
        name: customerName,
        type: message.type,
        text: message.text?.body?.slice(0, 50)
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
        console.log('👤 New customer profile created for', customerName);
      }

      // Get conversation history
      const history = conversationMemory.get(customerPhone) || [];

      let aiResponse;

      if (message.type === 'text') {
        const messageText = message.text.body;
        
        // Check if this is a price negotiation
        const customerOffer = negotiationAgent.detectPriceInMessage(messageText);
        if (customerOffer && negotiationSessions.has(customerPhone)) {
          // Handle active negotiation
          console.log('💰 Processing price negotiation:', customerOffer);
          const negotiationResult = negotiationAgent.processCounterOffer(customerPhone, customerOffer, culturalAI);
          
          if (negotiationResult) {
            aiResponse = negotiationResult.message;
            if (negotiationResult.action === 'accept') {
              negotiationAgent.endNegotiation(customerPhone);
              aiResponse += "\n\n🎉 Perfect! Deal finalized! Would you like me to help you place the order or do you have questions about delivery?";
            }
          }
        } else if (messageText.toLowerCase().includes('negotiate') || messageText.toLowerCase().includes('bargain') || customerOffer) {
          // Start new negotiation session
          const productName = "Premium Product"; // In real app, extract from context
          const originalPrice = 50000; // In real app, get from product database
          
          negotiationAgent.startNegotiation(customerPhone, productName, originalPrice);
          const hagglingResponse = culturalAI.generateHagglingResponse('opening');
          
          aiResponse = `${hagglingResponse}\n\nOriginal price: ₦${originalPrice.toLocaleString()}\nYour offer: ₦${customerOffer ? customerOffer.toLocaleString() : 'Please make an offer'}\n\nLet's negotiate! What's your best price? 💰`;
          
          if (customerOffer) {
            const negotiationResult = negotiationAgent.processCounterOffer(customerPhone, customerOffer, culturalAI);
            if (negotiationResult) {
              aiResponse = negotiationResult.message;
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
        const mediaResponses = {
          'image': `Thanks for the image, ${customerName}! 📸 I can see you shared something interesting. Are you looking for similar products? Tell me what you have in mind and I'll help you find it!`,
          'document': `I received your document, ${customerName}! 📄 How can I help you with this? Is it related to an order or product inquiry? Let me know what you need!`,
          'audio': `Thanks for the voice message, ${customerName}! 🎵 I'm currently text-based but I heard your passion! Please type what you're looking for and I'll give you my full attention!`,
          'location': `Thanks for sharing your location, ${customerName}! 📍 This helps with delivery estimates and local recommendations. What products can I help you find?`
        };

        aiResponse = mediaResponses[message.type] || `Hello ${customerName}! I received your ${message.type} message. 📨 How can I help you with your shopping at YarnMarket today? 🛍️`;
      }

      // Send response
      await sendMessage(customerPhone, aiResponse);

      console.log('✅ YarnMarket AI response sent successfully');

    } catch (error) {
      console.error('❌ Error processing individual message:', error);
      // Send fallback message
      try {
        await sendMessage(message.from, `Hello! Thanks for reaching out to YarnMarket. I'm here to help you find great products! How can I assist you today? 🛍️`);
      } catch (fallbackError) {
        console.error('❌ Fallback message failed:', fallbackError);
      }
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
      console.log('✅ YarnMarket AI message sent:', result.messages?.[0]?.id);
      return true;
    } else {
      const error = await response.json();
      console.error('❌ Send message failed:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Send message error:', error);
    return false;
  }
}