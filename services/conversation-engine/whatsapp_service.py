"""
WhatsApp Service for YarnMarket AI
Handles WhatsApp Business API integration
"""

import os
import requests
import json
import logging
from typing import Dict, Optional, List
from datetime import datetime

logger = logging.getLogger(__name__)

class WhatsAppService:
    def __init__(self):
        self.access_token = os.getenv('WHATSAPP_ACCESS_TOKEN')
        self.phone_number_id = os.getenv('WHATSAPP_PHONE_NUMBER_ID')
        self.business_account_id = os.getenv('WHATSAPP_BUSINESS_ACCOUNT_ID')
        self.webhook_url = os.getenv('WHATSAPP_WEBHOOK_URL')
        
        self.base_url = f"https://graph.facebook.com/v22.0/{self.phone_number_id}"
        
        if not all([self.access_token, self.phone_number_id]):
            logger.error("Missing required WhatsApp credentials")
            raise ValueError("Missing WhatsApp API credentials")
    
    def send_message(self, to: str, message: str, message_type: str = "text") -> Dict:
        """
        Send a WhatsApp message
        
        Args:
            to (str): Phone number to send to (with country code)
            message (str): Message content
            message_type (str): Type of message (text, template, etc.)
        
        Returns:
            Dict: Response from WhatsApp API
        """
        try:
            url = f"{self.base_url}/messages"
            
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            if message_type == "text":
                payload = {
                    "messaging_product": "whatsapp",
                    "to": to,
                    "type": "text",
                    "text": {
                        "body": message
                    }
                }
            elif message_type == "template":
                # For template messages (like hello_world)
                payload = {
                    "messaging_product": "whatsapp",
                    "to": to,
                    "type": "template",
                    "template": {
                        "name": "hello_world",
                        "language": {
                            "code": "en_US"
                        }
                    }
                }
            else:
                raise ValueError(f"Unsupported message type: {message_type}")
            
            logger.info(f"Sending WhatsApp message to {to}: {message[:50]}...")
            
            response = requests.post(url, headers=headers, json=payload)
            result = response.json()
            
            if response.status_code == 200:
                message_id = result.get('messages', [{}])[0].get('id')
                logger.info(f"Message sent successfully. ID: {message_id}")
                return {
                    'success': True,
                    'message_id': message_id,
                    'response': result
                }
            else:
                logger.error(f"Failed to send message: {result}")
                return {
                    'success': False,
                    'error': result.get('error', 'Unknown error'),
                    'response': result
                }
                
        except Exception as e:
            logger.error(f"Error sending WhatsApp message: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def send_interactive_message(self, to: str, header: str, body: str, buttons: List[Dict]) -> Dict:
        """
        Send an interactive button message
        
        Args:
            to (str): Phone number
            header (str): Message header
            body (str): Message body
            buttons (List[Dict]): List of button objects
        
        Returns:
            Dict: Response from WhatsApp API
        """
        try:
            url = f"{self.base_url}/messages"
            
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            # Format buttons for WhatsApp API
            interactive_buttons = []
            for i, button in enumerate(buttons):
                interactive_buttons.append({
                    "type": "reply",
                    "reply": {
                        "id": button.get('id', f"btn_{i}"),
                        "title": button.get('title', f"Button {i+1}")
                    }
                })
            
            payload = {
                "messaging_product": "whatsapp",
                "to": to,
                "type": "interactive",
                "interactive": {
                    "type": "button",
                    "header": {
                        "type": "text",
                        "text": header
                    },
                    "body": {
                        "text": body
                    },
                    "action": {
                        "buttons": interactive_buttons
                    }
                }
            }
            
            response = requests.post(url, headers=headers, json=payload)
            result = response.json()
            
            if response.status_code == 200:
                return {'success': True, 'response': result}
            else:
                return {'success': False, 'error': result}
                
        except Exception as e:
            logger.error(f"Error sending interactive message: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def process_webhook_message(self, webhook_data: Dict) -> List[Dict]:
        """
        Process incoming webhook message
        
        Args:
            webhook_data (Dict): Webhook payload from Meta
            
        Returns:
            List[Dict]: Processed messages
        """
        messages = []
        
        try:
            if webhook_data.get('object') != 'whatsapp_business_account':
                return messages
            
            for entry in webhook_data.get('entry', []):
                for change in entry.get('changes', []):
                    if change.get('field') != 'messages':
                        continue
                    
                    value = change.get('value', {})
                    
                    # Process incoming messages
                    for message in value.get('messages', []):
                        contact = next(
                            (c for c in value.get('contacts', []) 
                             if c.get('wa_id') == message.get('from')),
                            {}
                        )
                        
                        processed_message = {
                            'id': message.get('id'),
                            'from': message.get('from'),
                            'timestamp': datetime.fromtimestamp(int(message.get('timestamp', 0))),
                            'type': message.get('type'),
                            'customer_name': contact.get('profile', {}).get('name', 'Unknown'),
                            'text': message.get('text', {}).get('body', ''),
                            'raw_data': message
                        }
                        
                        # Handle different message types
                        if message.get('type') == 'text':
                            processed_message['content'] = message.get('text', {}).get('body', '')
                        elif message.get('type') == 'image':
                            processed_message['media_url'] = message.get('image', {}).get('id')
                        elif message.get('type') == 'document':
                            processed_message['document_id'] = message.get('document', {}).get('id')
                        elif message.get('type') == 'audio':
                            processed_message['audio_id'] = message.get('audio', {}).get('id')
                        elif message.get('type') == 'interactive':
                            # Handle button clicks
                            interactive = message.get('interactive', {})
                            if interactive.get('type') == 'button_reply':
                                processed_message['button_id'] = interactive.get('button_reply', {}).get('id')
                                processed_message['button_title'] = interactive.get('button_reply', {}).get('title')
                        
                        messages.append(processed_message)
                        logger.info(f"Processed message from {processed_message['from']}: {processed_message.get('content', processed_message.get('type'))}...")
            
        except Exception as e:
            logger.error(f"Error processing webhook message: {str(e)}")
        
        return messages
    
    def get_media_url(self, media_id: str) -> Optional[str]:
        """
        Get media URL from media ID
        
        Args:
            media_id (str): Media ID from WhatsApp
            
        Returns:
            Optional[str]: URL to download the media
        """
        try:
            url = f"https://graph.facebook.com/v22.0/{media_id}"
            headers = {'Authorization': f'Bearer {self.access_token}'}
            
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                return result.get('url')
            else:
                logger.error(f"Failed to get media URL: {response.json()}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting media URL: {str(e)}")
            return None
    
    def download_media(self, media_url: str, file_path: str) -> bool:
        """
        Download media file
        
        Args:
            media_url (str): URL to download from
            file_path (str): Local path to save file
            
        Returns:
            bool: Success status
        """
        try:
            headers = {'Authorization': f'Bearer {self.access_token}'}
            response = requests.get(media_url, headers=headers, stream=True)
            
            if response.status_code == 200:
                with open(file_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                
                logger.info(f"Media downloaded to {file_path}")
                return True
            else:
                logger.error(f"Failed to download media: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error downloading media: {str(e)}")
            return False

# Initialize the service
whatsapp_service = WhatsAppService()