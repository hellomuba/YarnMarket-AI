# YarnMarket AI Dashboard - Design Context

## 🎯 Project Overview
**YarnMarket AI** is a conversational commerce platform designed specifically for Nigerian markets. The dashboard provides real-time analytics and management for AI-powered customer conversations across multiple Nigerian languages (English, Pidgin, Yoruba, Igbo, Hausa).

## 🎨 Current Design System

### Brand Identity
- **Primary Color**: Emerald Green (#10B981) - representing prosperity
- **Secondary Color**: Amber (#F59E0B) - representing Nigerian markets
- **Accent Color**: Purple (#8B5CF6) - representing innovation
- **Theme**: Nigerian market-inspired with cultural elements

### Typography
- **Brand Font**: Poppins (headings, brand text)
- **Primary Font**: Inter (body text, UI elements)
- **Loaded from**: Google Fonts

### Visual Style
- **Modern glassmorphism effects** with backdrop blur
- **Gradient backgrounds** (emerald, blue, purple combinations)
- **Rounded corners** (2xl = 16px radius)
- **Subtle shadows** with hover interactions
- **Dark/Light theme support**

## 🏗️ Current Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS 3.3.6
- **Language**: TypeScript
- **Icons**: Custom SVG components
- **Available Libraries**: 
  - Framer Motion (animations)
  - Recharts (data visualization)
  - React Hook Form
  - Heroicons & Lucide React

### Component Structure
```
Dashboard (Main Page)
├── Sidebar Navigation
│   ├── Logo & Branding
│   ├── Navigation Menu
│   └── Connection Status
├── Top Header
│   ├── Page Title
│   ├── Theme Toggle
│   ├── Notifications
│   └── User Avatar
└── Main Content
    ├── Metric Cards (4-grid)
    ├── Search & Filter Bar
    ├── Analytics Overview (Language & Types)
    └── Live Conversations List
```

## 📊 Data Structure
The dashboard displays:
- **Metrics**: Active conversations, revenue, conversion rate, response time
- **Conversations**: Customer chats with status, language, message count
- **Language Distribution**: Nigerian Pidgin (45%), English (35%), Yoruba (12%), Igbo (5%), Hausa (3%)
- **Conversation Types**: Product inquiry, price negotiation, order creation, general chat, complaints

## 🎭 Current Features
- **Responsive sidebar** with mobile hamburger menu
- **Dark/light theme toggle**
- **Real-time search & filtering** for conversations
- **Interactive metric cards** with trend indicators
- **Language-specific customer avatars** with status indicators
- **Animated progress bars** for language distribution
- **Hover effects and micro-interactions**

## 🎨 Design Opportunities
Areas where enhanced design could improve the experience:

### 1. Visual Hierarchy
- Better typography scaling and spacing
- More sophisticated color usage
- Enhanced card layouts and content organization

### 2. Data Visualization
- Interactive charts and graphs (we have Recharts available)
- More engaging metric displays
- Better progress indicators and status visualizations

### 3. User Experience
- Loading states and skeleton screens
- Better mobile responsiveness
- More intuitive navigation and user flows

### 4. Cultural Design Elements
- More authentic Nigerian design motifs
- Better representation of local commerce culture
- Enhanced multilingual design considerations

### 5. Advanced Interactions
- Smooth page transitions
- Better hover states and animations
- More engaging call-to-action elements

## 🚀 Design Goals
- **Accessibility**: WCAG compliant, keyboard navigation
- **Performance**: Fast loading, efficient animations
- **Cultural Relevance**: Authentic Nigerian market aesthetics
- **Modern**: Contemporary web design patterns
- **Functional**: Clear information hierarchy and easy navigation

## 📱 Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

Current design is mobile-first with sidebar collapsing on small screens.

## 🎨 Available Design Tokens
```css
/* Colors */
--brand-primary: #10B981
--brand-secondary: #F59E0B  
--brand-accent: #8B5CF6

/* Gradients */
--gradient-primary: linear-gradient(135deg, #10B981 0%, #059669 100%)
--gradient-glass: rgba(255, 255, 255, 0.25) with backdrop-blur

/* Animations */
float, slide-up, pulse-glow, fade-in, scale-in, bounce-subtle

/* Typography */
font-brand: Poppins
font-primary: Inter
```

## 🎯 Success Metrics
A successful design enhancement should:
- Improve visual appeal while maintaining Nigerian cultural context
- Enhance usability and information clarity
- Maintain or improve performance
- Work seamlessly across all devices
- Support both light and dark themes
