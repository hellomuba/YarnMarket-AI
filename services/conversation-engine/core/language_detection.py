"""
Nigerian Language Detection and Processing
Specialized system for detecting and handling Nigerian Pidgin, Yoruba, Igbo, Hausa, and English
"""

import re
import asyncio
from typing import List, Dict, Optional, Tuple
import logging

# import torch  # Simplified for MVP
# from transformers import AutoTokenizer, AutoModel
from langdetect import detect, DetectorFactory
# import spacy  # Simplified for MVP

from .models import Language, LanguageContext
from .config import Settings

logger = logging.getLogger(__name__)

# Set langdetect seed for consistent results
DetectorFactory.seed = 0


class NigerianLanguageDetector:
    """
    Advanced language detection system for Nigerian languages and code-switching
    """
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self.tokenizer: Optional[AutoTokenizer] = None
        self.model: Optional[AutoModel] = None
        self.nlp_en = None
        
        # Nigerian Pidgin vocabulary and patterns
        self.pidgin_vocab = {
            # Common Pidgin words
            "wetin", "wey", "dey", "na", "no", "sef", "abeg", "oya", "shey", 
            "dem", "una", "make", "go", "wan", "fit", "sabi", "tey", "small",
            "plenty", "waka", "chop", "sha", "kuku", "abi", "wahala", "gbese",
            
            # Greetings
            "bawo", "sannu", "ndewo", "kaise", "how far", "wetin sup",
            
            # Commercial terms
            "how much", "last price", "discount", "nego", "cheaper",
            "original", "tear rubber", "sharp sharp", "correct price",
            
            # Expressions
            "no worry", "e go better", "God go bless you", "thank you sir",
            "thank you ma", "i appreciate", "God bless", "you try well well"
        }
        
        # Language-specific patterns
        self.language_patterns = {
            Language.YORUBA: [
                r'\b(bawo|eku|pele|se|ni|ko|ti|wa|bi|mi|fun|gan|na|je|lo|si|ati)\b',
                r'\b(owo|ewo|ni|elo|se|da|re|bi|ko|gbowo)\b'  # Money/price terms
            ],
            Language.IGBO: [
                r'\b(ndewo|maka|na|gi|m|ka|nke|ya|ahu|ego|ole|ka|ndi|unu)\b',
                r'\b(ego|ole|ka|zuru|di|mma)\b'  # Money/price terms
            ],
            Language.HAUSA: [
                r'\b(sannu|yaya|dai|da|na|ta|su|mu|ku|kuma|amma|ko|nawa)\b',
                r'\b(kudi|nawa|arha|tsada|kasuwa)\b'  # Money/price terms
            ],
            Language.PIDGIN: [
                r'\b(' + '|'.join(self.pidgin_vocab) + r')\b',
                r'\b(naira|kobo|cedis|francs?)\b',  # Currency terms
                r'\b(how much|last price|make we|i go|you dey)\b'
            ],
        }
        
        # Code-switching indicators
        self.code_switch_patterns = [
            r'(?:^|\s)(but|and|so|or|because)(?:\s|$)',  # English conjunctions
            r'(?:^|\s)(abeg|oya|sha)(?:\s|$)',  # Pidgin in English
            r'(?:^|\s)(thank you|please|sorry)(?:\s|$)',  # English politeness in Pidgin
        ]
        
        # Regional/cultural markers
        self.cultural_markers = {
            "religious": ["God", "Allah", "Jesus", "insha'Allah", "God bless", "amen"],
            "respect": ["sir", "ma", "madam", "oga", "aunty", "uncle", "bro", "sister"],
            "time": ["morning", "afternoon", "evening", "night", "today", "tomorrow"],
            "location": ["Lagos", "Abuja", "Kano", "Port Harcourt", "Ibadan", "Enugu"],
        }
    
    async def initialize(self):
        """Initialize the language detection models"""
        logger.info("🔤 Initializing Nigerian Language Detector...")
        
        try:
            # Load multilingual BERT for Nigerian languages (simplified for MVP)
            # model_name = "Davlan/bert-base-multilingual-cased-finetuned-yoruba"
            # self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            # self.model = AutoModel.from_pretrained(model_name)
            logger.info("⚠️ Using simplified language detection for MVP")
            
            # Load spaCy for English processing (simplified for MVP)
            # try:
            #     self.nlp_en = spacy.load("en_core_web_sm")
            # except OSError:
            #     logger.warning("English spaCy model not found, using basic processing")
            #     self.nlp_en = None
            self.nlp_en = None  # Simplified for MVP
            
            logger.info("✅ Language detector initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize language detector: {e}")
            raise
    
    async def analyze(
        self,
        text: str,
        conversation_history: List[Dict],
        expected_language: Optional[Language] = None
    ) -> LanguageContext:
        """
        Analyze text to detect language, code-switching, and cultural context
        """
        if not text:
            return LanguageContext(
                primary_language=Language.ENGLISH,
                confidence=0.0
            )
        
        # Clean and normalize text
        normalized_text = self._normalize_text(text)
        
        # Detect primary and secondary languages
        primary_lang, secondary_lang, confidence = await self._detect_languages(normalized_text)
        
        # Check for code-switching
        code_switching = self._detect_code_switching(normalized_text)
        
        # Analyze cultural markers
        cultural_context = self._analyze_cultural_markers(normalized_text)
        
        # Determine formality level
        formality = self._analyze_formality(normalized_text)
        
        # Consider conversation history for context
        if conversation_history:
            primary_lang, confidence = self._refine_with_history(
                primary_lang, confidence, conversation_history
            )
        
        return LanguageContext(
            primary_language=primary_lang,
            secondary_language=secondary_lang if code_switching else None,
            code_switching=code_switching,
            confidence=confidence,
            greeting_type=cultural_context.get("greeting_type"),
            formality_level=formality,
            regional_markers=cultural_context.get("regional_markers", [])
        )
    
    def _normalize_text(self, text: str) -> str:
        """Normalize text for better analysis"""
        # Convert to lowercase
        text = text.lower()
        
        # Handle common contractions and variations
        replacements = {
            "what's up": "wetin sup",
            "how are you": "how you dey",
            "i'm fine": "i dey fine",
            "thank u": "thank you",
            "pls": "please",
            "dis": "this",
            "dat": "that",
            "wit": "with",
            "ur": "your",
            "u": "you",
        }
        
        for old, new in replacements.items():
            text = text.replace(old, new)
        
        return text
    
    async def _detect_languages(self, text: str) -> Tuple[Language, Optional[Language], float]:
        """
        Detect primary and secondary languages in the text
        """
        # Score each language based on patterns
        language_scores = {}
        
        for lang, patterns in self.language_patterns.items():
            score = 0
            for pattern in patterns:
                matches = len(re.findall(pattern, text, re.IGNORECASE))
                score += matches
            
            # Normalize by text length
            language_scores[lang] = score / max(len(text.split()), 1)
        
        # Use langdetect as fallback for general language detection
        try:
            detected = detect(text)
            if detected == 'en':
                # Could be English or Pidgin, rely on pattern matching
                pass
            elif detected in ['yo', 'ig', 'ha']:  # Yoruba, Igbo, Hausa codes
                language_map = {'yo': Language.YORUBA, 'ig': Language.IGBO, 'ha': Language.HAUSA}
                if language_map[detected] in language_scores:
                    language_scores[language_map[detected]] += 0.5
        except:
            pass
        
        # Determine primary language
        if not language_scores or max(language_scores.values()) == 0:
            return Language.ENGLISH, None, 0.5
        
        # Sort by score
        sorted_langs = sorted(language_scores.items(), key=lambda x: x[1], reverse=True)
        
        primary_lang = sorted_langs[0][0]
        primary_score = sorted_langs[0][1]
        
        # Check for secondary language
        secondary_lang = None
        if len(sorted_langs) > 1 and sorted_langs[1][1] > 0:
            secondary_lang = sorted_langs[1][0]
        
        # Calculate confidence
        confidence = min(primary_score * 2, 1.0)  # Scale to 0-1
        
        return primary_lang, secondary_lang, confidence
    
    def _detect_code_switching(self, text: str) -> bool:
        """
        Detect if the text contains code-switching between languages
        """
        for pattern in self.code_switch_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        
        # Check for mixed language patterns
        english_words = re.findall(r'\b[a-zA-Z]+\b', text)
        pidgin_words = [word for word in english_words if word.lower() in self.pidgin_vocab]
        
        if len(pidgin_words) > 0 and len(english_words) > len(pidgin_words):
            return True
        
        return False
    
    def _analyze_cultural_markers(self, text: str) -> Dict[str, any]:
        """
        Analyze cultural and contextual markers in the text
        """
        context = {
            "greeting_type": None,
            "regional_markers": [],
            "cultural_elements": []
        }
        
        # Detect greeting patterns
        greeting_patterns = {
            "morning": ["good morning", "morning", "eku ojumo", "sannu da safe"],
            "afternoon": ["good afternoon", "afternoon", "eku osan", "barka da rana"],
            "evening": ["good evening", "evening", "eku irole", "barka da yamma"],
            "general": ["hello", "hi", "bawo", "ndewo", "sannu", "how far", "wetin sup"]
        }
        
        for greeting_type, patterns in greeting_patterns.items():
            for pattern in patterns:
                if pattern in text:
                    context["greeting_type"] = greeting_type
                    break
            if context["greeting_type"]:
                break
        
        # Detect cultural markers
        for category, markers in self.cultural_markers.items():
            found_markers = [marker for marker in markers if marker.lower() in text.lower()]
            if found_markers:
                context["cultural_elements"].extend(found_markers)
                if category == "location":
                    context["regional_markers"].extend(found_markers)
        
        return context
    
    def _analyze_formality(self, text: str) -> float:
        """
        Analyze the formality level of the text (0 = very informal, 1 = very formal)
        """
        informal_indicators = ["how far", "wetin", "abeg", "sha", "oya", "bro", "guy"]
        formal_indicators = ["please", "thank you", "sir", "madam", "i would like", "excuse me"]
        
        informal_count = sum(1 for indicator in informal_indicators if indicator in text)
        formal_count = sum(1 for indicator in formal_indicators if indicator in text)
        
        if informal_count == 0 and formal_count == 0:
            return 0.5  # Neutral
        
        total = informal_count + formal_count
        formality_score = formal_count / total
        
        return formality_score
    
    def _refine_with_history(
        self,
        primary_lang: Language,
        confidence: float,
        history: List[Dict]
    ) -> Tuple[Language, float]:
        """
        Refine language detection using conversation history
        """
        if not history:
            return primary_lang, confidence
        
        # Look at recent messages to maintain consistency
        recent_messages = history[-5:]  # Last 5 messages
        
        language_frequency = {}
        for msg in recent_messages:
            if 'language' in msg:
                lang = msg['language']
                language_frequency[lang] = language_frequency.get(lang, 0) + 1
        
        if language_frequency:
            most_frequent = max(language_frequency, key=language_frequency.get)
            # If the most frequent language matches detected, boost confidence
            if most_frequent == primary_lang.value:
                confidence = min(confidence * 1.2, 1.0)
        
        return primary_lang, confidence
    
    def get_language_capabilities(self, language: Language) -> Dict[str, bool]:
        """
        Get capabilities for a specific language
        """
        capabilities = {
            Language.PIDGIN: {
                "greeting": True,
                "negotiation": True,
                "product_inquiry": True,
                "complaint_handling": True,
                "cultural_intelligence": True
            },
            Language.ENGLISH: {
                "greeting": True,
                "negotiation": True,
                "product_inquiry": True,
                "complaint_handling": True,
                "cultural_intelligence": True
            },
            Language.YORUBA: {
                "greeting": True,
                "negotiation": True,
                "product_inquiry": False,
                "complaint_handling": False,
                "cultural_intelligence": True
            },
            Language.IGBO: {
                "greeting": True,
                "negotiation": True,
                "product_inquiry": False,
                "complaint_handling": False,
                "cultural_intelligence": True
            },
            Language.HAUSA: {
                "greeting": True,
                "negotiation": True,
                "product_inquiry": False,
                "complaint_handling": False,
                "cultural_intelligence": True
            }
        }
        
        return capabilities.get(language, {})
    
    async def translate_to_pidgin(self, text: str, source_language: Language) -> str:
        """
        Simple rule-based translation to Pidgin for basic phrases
        """
        if source_language == Language.PIDGIN:
            return text
        
        # Basic translation patterns
        translations = {
            "how are you": "how you dey",
            "i am fine": "i dey fine",
            "good morning": "good morning",  # Same in Pidgin
            "thank you": "thank you",
            "you're welcome": "you welcome",
            "how much": "how much",
            "what is the price": "how much be the price",
            "it's expensive": "e cost well well",
            "can you reduce": "you fit reduce am",
        }
        
        text_lower = text.lower()
        for english, pidgin in translations.items():
            if english in text_lower:
                return pidgin
        
        return text  # Return original if no translation found