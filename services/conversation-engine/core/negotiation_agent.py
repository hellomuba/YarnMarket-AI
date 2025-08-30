"""
Simplified Negotiation Agent for Price Negotiation
Basic haggling system for Nigerian market interactions (MVP version)
"""

from typing import Dict, List, Optional, Tuple, Any
import logging
import random
from datetime import datetime, timedelta

from .models import NegotiationState, MerchantSettings, CustomerProfile
from .config import Settings

logger = logging.getLogger(__name__)


class HagglingAgent:
    """
    Simplified negotiation agent that uses rule-based logic
    instead of machine learning for MVP
    """
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self.negotiation_history: Dict[str, List[Dict]] = {}
        
    async def initialize(self):
        """Initialize the negotiation agent"""
        logger.info("🤝 Initializing Negotiation Agent...")
        logger.info("✅ Negotiation Agent ready")
    
    async def get_strategy(
        self,
        negotiation_state: NegotiationState,
        merchant_rules: MerchantSettings,
        customer_profile: CustomerProfile
    ) -> Dict[str, Any]:
        """
        Determine negotiation strategy based on current state
        """
        original_price = negotiation_state.original_price
        customer_offer = negotiation_state.customer_offer
        round_number = negotiation_state.round_number
        
        # Calculate minimum acceptable price based on merchant rules
        min_profit_margin = merchant_rules.min_profit_margin or 0.1
        cost_price = original_price * (1 - min_profit_margin)
        min_acceptable = cost_price * 1.05  # 5% minimum profit
        
        # Negotiation logic
        if customer_offer is None:
            # First interaction - start with slight discount
            counter_offer = original_price * 0.95
            action_type = "counter"
            
        elif customer_offer >= original_price * 0.9:
            # Good offer - accept or minor counter
            if customer_offer >= original_price * 0.95:
                action_type = "accept"
                counter_offer = customer_offer
            else:
                action_type = "counter"
                counter_offer = original_price * 0.92
                
        elif customer_offer >= min_acceptable:
            # Acceptable range - negotiate based on round
            if round_number >= 3:
                # Getting tired, more willing to compromise
                counter_offer = (customer_offer + min_acceptable * 1.1) / 2
                action_type = "counter"
            else:
                # Still negotiating
                counter_offer = original_price * (0.85 - (round_number * 0.05))
                action_type = "counter"
                
        elif customer_offer >= min_acceptable * 0.85:
            # Low but possible - try bundle or reject
            if round_number <= 2:
                # Suggest bundle deal
                action_type = "bundle"
                counter_offer = customer_offer * 1.15
            else:
                # Final counter
                action_type = "counter"
                counter_offer = min_acceptable * 1.02
                
        else:
            # Too low - reject
            if round_number >= 4:
                action_type = "reject"
                counter_offer = None
            else:
                action_type = "counter"
                counter_offer = original_price * 0.8
        
        # Ensure counter offer is not below minimum
        if counter_offer and counter_offer < min_acceptable:
            counter_offer = min_acceptable
        
        # Generate appropriate quick replies based on action
        quick_replies = self._generate_quick_replies(action_type, counter_offer, original_price)
        
        return {
            "action_type": action_type,
            "counter_offer": counter_offer,
            "confidence": 0.8,
            "reasoning": f"Round {round_number}, customer offered {customer_offer}, responding with {action_type}",
            "suggested_replies": quick_replies,
            "bundle_quantity": 3 if action_type == "bundle" else None,
            "bundle_price": counter_offer * 2.8 if action_type == "bundle" else None,
            "individual_price": original_price if action_type == "bundle" else None
        }
    
    def _generate_quick_replies(
        self, 
        action_type: str, 
        counter_offer: Optional[float], 
        original_price: float
    ) -> List[Dict[str, str]]:
        """Generate contextual quick reply options"""
        
        if action_type == "accept":
            return [
                {"id": "confirm", "title": "Confirm Deal", "payload": "confirm_deal"},
                {"id": "payment", "title": "Payment Options", "payload": "payment_options"}
            ]
        
        elif action_type == "counter":
            return [
                {"id": "accept_counter", "title": f"Accept ₦{counter_offer:,.0f}", "payload": f"accept_{counter_offer}"},
                {"id": "negotiate", "title": "Let's negotiate", "payload": "continue_negotiation"},
                {"id": "think", "title": "Let me think", "payload": "thinking"}
            ]
        
        elif action_type == "bundle":
            return [
                {"id": "bundle_yes", "title": "Bundle sounds good", "payload": "accept_bundle"},
                {"id": "single", "title": "Just one item", "payload": "single_item"},
                {"id": "tell_more", "title": "Tell me more", "payload": "bundle_details"}
            ]
        
        else:  # reject
            return [
                {"id": "final_offer", "title": "Final offer?", "payload": "final_offer"},
                {"id": "other_items", "title": "Show other items", "payload": "show_alternatives"},
                {"id": "think", "title": "Let me think", "payload": "thinking"}
            ]
    
    async def record_negotiation_outcome(
        self,
        negotiation_state: NegotiationState,
        outcome: str,
        final_price: Optional[float] = None,
        customer_satisfaction: float = 0.5
    ):
        """Record the outcome of a negotiation for future learning"""
        
        customer_phone = negotiation_state.customer_phone if hasattr(negotiation_state, 'customer_phone') else 'unknown'
        
        if customer_phone not in self.negotiation_history:
            self.negotiation_history[customer_phone] = []
        
        record = {
            'timestamp': datetime.utcnow(),
            'original_price': negotiation_state.original_price,
            'customer_offer': negotiation_state.customer_offer,
            'final_price': final_price,
            'rounds': negotiation_state.round_number,
            'outcome': outcome,  # 'accepted', 'rejected', 'abandoned'
            'discount_given': (negotiation_state.original_price - final_price) / negotiation_state.original_price if final_price else 0,
            'customer_satisfaction': customer_satisfaction
        }
        
        self.negotiation_history[customer_phone].append(record)
        
        # Keep only recent history (last 50 negotiations per customer)
        if len(self.negotiation_history[customer_phone]) > 50:
            self.negotiation_history[customer_phone] = self.negotiation_history[customer_phone][-50:]
        
        logger.info(f"Recorded negotiation outcome: {outcome} for customer {customer_phone}")
    
    def get_customer_negotiation_stats(self, customer_phone: str) -> Dict[str, Any]:
        """Get negotiation statistics for a specific customer"""
        
        if customer_phone not in self.negotiation_history:
            return {
                'total_negotiations': 0,
                'avg_rounds': 0,
                'avg_discount': 0,
                'success_rate': 0,
                'customer_type': 'new'
            }
        
        history = self.negotiation_history[customer_phone]
        successful = [h for h in history if h['outcome'] == 'accepted']
        
        return {
            'total_negotiations': len(history),
            'avg_rounds': sum(h['rounds'] for h in history) / len(history),
            'avg_discount': sum(h['discount_given'] for h in successful) / len(successful) if successful else 0,
            'success_rate': len(successful) / len(history) if history else 0,
            'customer_type': 'experienced' if len(history) > 5 else 'regular' if len(history) > 2 else 'new'
        }