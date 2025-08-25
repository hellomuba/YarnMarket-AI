"""
Reinforcement Learning Agent for Price Negotiation
Advanced haggling system that learns from successful Nigerian market interactions
"""

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from typing import Dict, List, Optional, Tuple, Any
import logging
import random
from collections import deque
import asyncio
from datetime import datetime, timedelta

from .models import (
    NegotiationState, MerchantSettings, CustomerProfile, 
    NegotiationAction, Product, Language
)
from .config import Settings

logger = logging.getLogger(__name__)


class NegotiationStrategy:
    """Represents a negotiation strategy with specific actions"""
    
    def __init__(
        self,
        action_type: str,
        counter_offer: Optional[float] = None,
        bundle_quantity: Optional[int] = None,
        bundle_price: Optional[float] = None,
        confidence: float = 0.5,
        urgency_level: float = 0.0,
        suggested_replies: List[Dict[str, str]] = None
    ):
        self.action_type = action_type  # accept, counter, bundle, reject, stall
        self.counter_offer = counter_offer
        self.bundle_quantity = bundle_quantity
        self.bundle_price = bundle_price
        self.confidence = confidence
        self.urgency_level = urgency_level
        self.suggested_replies = suggested_replies or []


class NegotiationEnvironment:
    """Simulates Nigerian market negotiation environment for RL training"""
    
    def __init__(self):
        self.reset()
    
    def reset(self):
        """Reset environment for new negotiation"""
        self.state = {
            'original_price': 0.0,
            'customer_offer': 0.0,
            'negotiation_round': 0,
            'customer_sentiment': 0.0,
            'time_pressure': 0.0,
            'profit_margin': 0.0,
            'customer_history': 0.0,  # 0-1 based on past purchases
        }
        return self._get_state_vector()
    
    def step(self, action: Dict[str, Any]) -> Tuple[np.ndarray, float, bool, Dict]:
        """Execute action and return new state, reward, done, info"""
        
        # Update state based on action
        self.state['negotiation_round'] += 1
        
        # Calculate reward based on Nigerian market psychology
        reward = self._calculate_reward(action)
        
        # Check if negotiation is done
        done = (
            action['type'] == 'accept' or 
            action['type'] == 'reject' or 
            self.state['negotiation_round'] >= 5
        )
        
        # Update customer sentiment based on action
        self._update_customer_sentiment(action)
        
        info = {
            'profit_made': action.get('profit', 0),
            'customer_satisfied': self.state['customer_sentiment'] > 0,
            'rounds_taken': self.state['negotiation_round']
        }
        
        return self._get_state_vector(), reward, done, info
    
    def _get_state_vector(self) -> np.ndarray:
        """Convert state to feature vector"""
        return np.array([
            self.state['original_price'] / 1000.0,  # Normalize
            self.state['customer_offer'] / 1000.0,
            self.state['negotiation_round'] / 10.0,
            self.state['customer_sentiment'],
            self.state['time_pressure'],
            self.state['profit_margin'],
            self.state['customer_history']
        ])
    
    def _calculate_reward(self, action: Dict[str, Any]) -> float:
        """Calculate reward based on Nigerian market dynamics"""
        base_reward = 0.0
        
        if action['type'] == 'accept':
            # Reward based on profit margin maintained
            profit_ratio = action.get('profit_ratio', 0.0)
            base_reward = profit_ratio * 10.0  # Scale to meaningful reward
            
            # Bonus for maintaining customer relationship
            if self.state['customer_sentiment'] > 0:
                base_reward += 2.0
                
        elif action['type'] == 'counter':
            # Small reward for reasonable counter-offers
            counter_ratio = action.get('counter_ratio', 0.5)
            if 0.3 <= counter_ratio <= 0.8:  # Reasonable range
                base_reward = 1.0
            else:
                base_reward = -0.5  # Penalty for extreme counter-offers
                
        elif action['type'] == 'bundle':
            # Reward for creative bundling solutions
            base_reward = 1.5
            if action.get('bundle_savings', 0) > 0:
                base_reward += 1.0
                
        elif action['type'] == 'reject':
            # Small penalty for rejecting, but sometimes necessary
            base_reward = -1.0
            if self.state['profit_margin'] < 0.05:  # Justified rejection
                base_reward = 0.0
                
        elif action['type'] == 'stall':
            # Small reward for strategic stalling
            if self.state['negotiation_round'] < 3:
                base_reward = 0.5
            else:
                base_reward = -1.0  # Penalty for excessive stalling
        
        # Time pressure penalty
        base_reward -= self.state['time_pressure'] * 0.5
        
        # Round number penalty (encourage faster resolution)
        base_reward -= self.state['negotiation_round'] * 0.1
        
        return base_reward
    
    def _update_customer_sentiment(self, action: Dict[str, Any]):
        """Update customer sentiment based on agent action"""
        if action['type'] == 'accept':
            self.state['customer_sentiment'] += 0.3
        elif action['type'] == 'counter':
            counter_ratio = action.get('counter_ratio', 0.5)
            if counter_ratio > 0.8:  # High counter-offer
                self.state['customer_sentiment'] -= 0.2
            else:
                self.state['customer_sentiment'] += 0.1
        elif action['type'] == 'bundle':
            self.state['customer_sentiment'] += 0.2  # Usually appreciated
        elif action['type'] == 'reject':
            self.state['customer_sentiment'] -= 0.4
        elif action['type'] == 'stall':
            self.state['customer_sentiment'] -= 0.1
        
        # Clamp sentiment
        self.state['customer_sentiment'] = np.clip(self.state['customer_sentiment'], -1.0, 1.0)


class NegotiationDQN(nn.Module):
    """Deep Q-Network for negotiation strategy learning"""
    
    def __init__(self, state_size: int = 7, action_size: int = 5, hidden_size: int = 128):
        super(NegotiationDQN, self).__init__()
        
        self.network = nn.Sequential(
            nn.Linear(state_size, hidden_size),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_size, hidden_size),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(),
            nn.Linear(hidden_size // 2, action_size)
        )
    
    def forward(self, x):
        return self.network(x)


class HagglingAgent:
    """
    Advanced RL agent for Nigerian market haggling
    Learns from successful negotiations and adapts to different customer types
    """
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self.device = torch.device("cuda" if torch.cuda.is_available() and settings.use_gpu else "cpu")
        
        # DQN components
        self.state_size = 7
        self.action_size = 5  # accept, counter, bundle, reject, stall
        self.q_network = NegotiationDQN(self.state_size, self.action_size).to(self.device)
        self.target_network = NegotiationDQN(self.state_size, self.action_size).to(self.device)
        self.optimizer = optim.Adam(self.q_network.parameters(), lr=0.001)
        
        # Experience replay
        self.memory = deque(maxlen=10000)
        self.batch_size = 32
        
        # Exploration
        self.epsilon = 1.0
        self.epsilon_min = 0.01
        self.epsilon_decay = 0.995
        
        # Training parameters
        self.gamma = 0.95  # Discount factor
        self.tau = 0.005   # Soft update parameter
        
        # Nigerian market rules and heuristics
        self.market_rules = {
            'min_profit_margin': 0.1,
            'max_discount_percent': 0.3,
            'bundle_threshold': 3,
            'stall_limit': 2,
            'respect_customer_budget': True
        }
        
        # Customer type patterns (learned from data)
        self.customer_types = {
            'bargain_hunter': {'price_sensitivity': 0.9, 'patience': 0.7},
            'quality_seeker': {'price_sensitivity': 0.3, 'patience': 0.5},
            'time_pressed': {'price_sensitivity': 0.5, 'patience': 0.2},
            'regular_customer': {'price_sensitivity': 0.6, 'patience': 0.8}
        }
    
    async def initialize(self):
        """Initialize the haggling agent"""
        logger.info("🤝 Initializing Haggling Agent...")
        
        # Load pre-trained model if exists
        try:
            model_path = f"{self.settings.model_path}/negotiation_dqn.pth"
            self.q_network.load_state_dict(torch.load(model_path, map_location=self.device))
            self.target_network.load_state_dict(self.q_network.state_dict())
            logger.info("✅ Loaded pre-trained negotiation model")
        except FileNotFoundError:
            logger.info("🎯 Starting with fresh negotiation model")
        
        # Set target network weights
        self.target_network.load_state_dict(self.q_network.state_dict())
        
        logger.info("✅ Haggling Agent initialized")
    
    async def get_strategy(
        self,
        negotiation_state: NegotiationState,
        merchant_rules: MerchantSettings,
        customer_profile: CustomerProfile
    ) -> NegotiationStrategy:
        """
        Get negotiation strategy using learned policy + market heuristics
        """
        # Convert to state vector
        state_vector = self._create_state_vector(
            negotiation_state, merchant_rules, customer_profile
        )
        
        # Get Q-values from network
        with torch.no_grad():
            state_tensor = torch.FloatTensor(state_vector).unsqueeze(0).to(self.device)
            q_values = self.q_network(state_tensor)
            action_scores = q_values.cpu().numpy()[0]
        
        # Apply market rules and heuristics
        strategy = self._apply_market_heuristics(
            action_scores, negotiation_state, merchant_rules, customer_profile
        )
        
        return strategy
    
    def _create_state_vector(
        self,
        negotiation_state: NegotiationState,
        merchant_rules: MerchantSettings,
        customer_profile: CustomerProfile
    ) -> np.ndarray:
        """Create state vector for the DQN"""
        
        original_price = negotiation_state.original_price
        customer_offer = negotiation_state.customer_offer or 0.0
        
        # Calculate features
        price_gap = (original_price - customer_offer) / original_price if customer_offer else 1.0
        negotiation_progress = negotiation_state.round_number / 10.0
        customer_sentiment = negotiation_state.customer_sentiment
        
        # Time pressure based on negotiation duration
        time_pressure = min((datetime.utcnow() - negotiation_state.started_at).seconds / 300.0, 1.0)
        
        # Profit margin at customer's offer
        cost_price = original_price * (1 - merchant_rules.max_discount_percentage / 100)
        profit_margin = (customer_offer - cost_price) / customer_offer if customer_offer > 0 else 0.0
        
        # Customer history score (simplified)
        customer_history = len(customer_profile.purchase_history) / 10.0
        
        return np.array([
            price_gap,
            negotiation_progress,
            customer_sentiment,
            time_pressure,
            profit_margin,
            customer_history,
            negotiation_state.urgency_level
        ])
    
    def _apply_market_heuristics(
        self,
        action_scores: np.ndarray,
        negotiation_state: NegotiationState,
        merchant_rules: MerchantSettings,
        customer_profile: CustomerProfile
    ) -> NegotiationStrategy:
        """
        Apply Nigerian market heuristics to raw Q-values
        """
        original_price = negotiation_state.original_price
        customer_offer = negotiation_state.customer_offer or 0.0
        
        # Calculate key metrics
        cost_price = original_price * (1 - merchant_rules.max_discount_percentage / 100)
        min_acceptable = cost_price * (1 + merchant_rules.min_discount_percentage / 100)
        
        # Rule-based overrides
        
        # 1. Never sell below cost + minimum profit
        if customer_offer > 0 and customer_offer >= min_acceptable:
            # Customer offer is acceptable, boost accept action
            action_scores[0] += 2.0  # accept
        
        # 2. If customer offer is way too low, don't accept
        if customer_offer > 0 and customer_offer < cost_price:
            action_scores[0] -= 5.0  # heavily penalize accept
            action_scores[3] += 1.0   # slightly boost reject
        
        # 3. After many rounds, prefer resolution
        if negotiation_state.round_number >= 4:
            action_scores[0] += 1.0  # boost accept
            action_scores[4] -= 2.0  # penalize stall
        
        # 4. Bundle suggestions for higher-value items
        if original_price > 5000 and negotiation_state.round_number >= 2:
            action_scores[2] += 1.5  # boost bundle
        
        # 5. Customer sentiment considerations
        if negotiation_state.customer_sentiment < -0.5:
            # Customer getting frustrated, be more accommodating
            action_scores[0] += 1.0  # boost accept
            action_scores[1] += 0.5  # boost reasonable counter
            action_scores[3] -= 1.0  # reduce reject
        
        # Select action with epsilon-greedy exploration
        if random.random() < self.epsilon:
            action_idx = random.randint(0, self.action_size - 1)
        else:
            action_idx = np.argmax(action_scores)
        
        # Generate strategy based on selected action
        return self._create_strategy(
            action_idx, negotiation_state, merchant_rules, customer_profile
        )
    
    def _create_strategy(
        self,
        action_idx: int,
        negotiation_state: NegotiationState,
        merchant_rules: MerchantSettings,
        customer_profile: CustomerProfile
    ) -> NegotiationStrategy:
        """Create concrete strategy from action index"""
        
        original_price = negotiation_state.original_price
        customer_offer = negotiation_state.customer_offer or 0.0
        
        action_names = ['accept', 'counter', 'bundle', 'reject', 'stall']
        action_type = action_names[action_idx]
        
        if action_type == 'accept':
            return NegotiationStrategy(
                action_type='accept',
                counter_offer=customer_offer,
                confidence=0.9,
                suggested_replies=[
                    {'id': 'confirm', 'title': 'Confirm Order', 'payload': 'confirm_order'},
                    {'id': 'payment', 'title': 'Payment Options', 'payload': 'payment_options'}
                ]
            )
        
        elif action_type == 'counter':
            # Smart counter-offer calculation
            if customer_offer > 0:
                gap = original_price - customer_offer
                counter_offer = customer_offer + (gap * 0.6)  # Meet 60% of the way
            else:
                # First counter when no customer offer yet
                counter_offer = original_price * 0.85  # 15% discount
            
            # Apply merchant rules
            max_discount = merchant_rules.max_discount_percentage / 100
            min_price = original_price * (1 - max_discount)
            counter_offer = max(counter_offer, min_price)
            
            return NegotiationStrategy(
                action_type='counter',
                counter_offer=counter_offer,
                confidence=0.8,
                suggested_replies=[
                    {'id': 'accept_counter', 'title': 'Accept', 'payload': f'accept_{counter_offer}'},
                    {'id': 'negotiate_more', 'title': 'Still too high', 'payload': 'negotiate_more'}
                ]
            )
        
        elif action_type == 'bundle':
            # Create bundle offer
            bundle_qty = 3
            individual_price = original_price * 0.9  # 10% discount per item
            bundle_price = individual_price * bundle_qty * 0.95  # Additional 5% bundle discount
            
            return NegotiationStrategy(
                action_type='bundle',
                counter_offer=bundle_price,
                bundle_quantity=bundle_qty,
                bundle_price=bundle_price,
                confidence=0.85,
                suggested_replies=[
                    {'id': 'accept_bundle', 'title': 'Take Bundle', 'payload': f'bundle_{bundle_qty}'},
                    {'id': 'single_item', 'title': 'Just One', 'payload': 'single_item'}
                ]
            )
        
        elif action_type == 'reject':
            return NegotiationStrategy(
                action_type='reject',
                confidence=0.7,
                suggested_replies=[
                    {'id': 'understand', 'title': 'I Understand', 'payload': 'understand'},
                    {'id': 'other_products', 'title': 'Show Other Items', 'payload': 'show_alternatives'}
                ]
            )
        
        else:  # stall
            return NegotiationStrategy(
                action_type='stall',
                confidence=0.6,
                urgency_level=0.3,
                suggested_replies=[
                    {'id': 'think_about', 'title': 'Let me think', 'payload': 'thinking'},
                    {'id': 'final_offer', 'title': 'Final offer?', 'payload': 'final_offer'}
                ]
            )
    
    def remember(
        self,
        state: np.ndarray,
        action: int,
        reward: float,
        next_state: np.ndarray,
        done: bool
    ):
        """Store experience in replay buffer"""
        self.memory.append((state, action, reward, next_state, done))
    
    async def train(self, batch_size: int = 32):
        """Train the DQN on a batch of experiences"""
        if len(self.memory) < batch_size:
            return
        
        batch = random.sample(self.memory, batch_size)
        states = torch.FloatTensor([e[0] for e in batch]).to(self.device)
        actions = torch.LongTensor([e[1] for e in batch]).to(self.device)
        rewards = torch.FloatTensor([e[2] for e in batch]).to(self.device)
        next_states = torch.FloatTensor([e[3] for e in batch]).to(self.device)
        dones = torch.BoolTensor([e[4] for e in batch]).to(self.device)
        
        current_q_values = self.q_network(states).gather(1, actions.unsqueeze(1))
        next_q_values = self.target_network(next_states).max(1)[0].detach()
        target_q_values = rewards + (self.gamma * next_q_values * ~dones)
        
        loss = nn.MSELoss()(current_q_values.squeeze(), target_q_values)
        
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()
        
        # Soft update target network
        for target_param, local_param in zip(self.target_network.parameters(), self.q_network.parameters()):
            target_param.data.copy_(self.tau * local_param.data + (1.0 - self.tau) * target_param.data)
        
        # Decay epsilon
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay
    
    async def learn_from_conversation(
        self,
        negotiation_log: Dict[str, Any],
        outcome: str,
        final_price: float,
        customer_satisfaction: float
    ):
        """Learn from completed negotiations"""
        
        # Create training example from negotiation log
        if outcome == 'sale' and customer_satisfaction > 0.5:
            # Successful negotiation - positive reinforcement
            for i, round_data in enumerate(negotiation_log.get('rounds', [])):
                state = round_data.get('state_vector')
                action = round_data.get('action_idx')
                
                # Calculate reward based on outcome
                profit_margin = (final_price - round_data.get('cost_price', 0)) / final_price
                reward = profit_margin * 10 + customer_satisfaction * 2
                
                next_state = negotiation_log['rounds'][i+1]['state_vector'] if i+1 < len(negotiation_log['rounds']) else state
                done = (i == len(negotiation_log['rounds']) - 1)
                
                self.remember(state, action, reward, next_state, done)
        
        # Train on accumulated experience
        if len(self.memory) >= self.batch_size:
            await self.train()
    
    def get_negotiation_insights(self, negotiation_state: NegotiationState) -> Dict[str, Any]:
        """Get insights about current negotiation for merchant dashboard"""
        
        insights = {
            'negotiation_strength': 'medium',
            'customer_type': 'bargain_hunter',
            'recommended_action': 'counter_offer',
            'success_probability': 0.7,
            'risk_factors': [],
            'opportunities': []
        }
        
        # Analyze customer behavior
        if negotiation_state.customer_sentiment < -0.3:
            insights['risk_factors'].append('Customer getting frustrated')
        
        if negotiation_state.round_number > 3:
            insights['risk_factors'].append('Negotiation dragging on')
        
        if negotiation_state.customer_offer and negotiation_state.customer_offer > negotiation_state.original_price * 0.8:
            insights['opportunities'].append('Customer willing to pay good price')
        
        return insights
    
    async def save_model(self):
        """Save trained model"""
        model_path = f"{self.settings.model_path}/negotiation_dqn.pth"
        torch.save(self.q_network.state_dict(), model_path)
        logger.info(f"💾 Saved negotiation model to {model_path}")


class NegotiationAnalytics:
    """Analytics for negotiation performance"""
    
    def __init__(self):
        self.negotiations = []
    
    def record_negotiation(
        self,
        merchant_id: str,
        customer_phone: str,
        outcome: str,
        rounds: int,
        final_price: float,
        original_price: float,
        customer_satisfaction: float
    ):
        """Record negotiation outcome for analysis"""
        self.negotiations.append({
            'merchant_id': merchant_id,
            'customer_phone': customer_phone,
            'outcome': outcome,
            'rounds': rounds,
            'final_price': final_price,
            'original_price': original_price,
            'discount_given': (original_price - final_price) / original_price,
            'customer_satisfaction': customer_satisfaction,
            'timestamp': datetime.utcnow()
        })
    
    def get_success_metrics(self, merchant_id: str = None) -> Dict[str, float]:
        """Get negotiation success metrics"""
        relevant_negotiations = [
            n for n in self.negotiations 
            if merchant_id is None or n['merchant_id'] == merchant_id
        ]
        
        if not relevant_negotiations:
            return {}
        
        successful = [n for n in relevant_negotiations if n['outcome'] == 'sale']
        
        return {
            'success_rate': len(successful) / len(relevant_negotiations),
            'avg_rounds': np.mean([n['rounds'] for n in relevant_negotiations]),
            'avg_discount': np.mean([n['discount_given'] for n in successful]),
            'customer_satisfaction': np.mean([n['customer_satisfaction'] for n in successful])
        }