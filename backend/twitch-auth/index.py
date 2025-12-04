import json
import os
import urllib.parse
import urllib.request
from typing import Dict, Any

TWITCH_CLIENT_ID = os.environ.get('TWITCH_CLIENT_ID', '')
TWITCH_CLIENT_SECRET = os.environ.get('TWITCH_CLIENT_SECRET', '')
REDIRECT_URI = os.environ.get('REDIRECT_URI', 'http://localhost:5173/auth/callback')

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Twitch OAuth авторизация: получение токена и данных пользователя
    Args: event - httpMethod, queryStringParameters с code
          context - объект с request_id, function_name
    Returns: JSON с пользовательскими данными или redirect URL
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        params = event.get('queryStringParameters', {})
        action = params.get('action', 'login')
        
        if action == 'login':
            auth_url = (
                f"https://id.twitch.tv/oauth2/authorize?"
                f"client_id={TWITCH_CLIENT_ID}&"
                f"redirect_uri={urllib.parse.quote(REDIRECT_URI)}&"
                f"response_type=code&"
                f"scope=user:read:email"
            )
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'auth_url': auth_url}),
                'isBase64Encoded': False
            }
        
        elif action == 'callback':
            code = params.get('code')
            if not code:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'No authorization code provided'}),
                    'isBase64Encoded': False
                }
            
            token_data = urllib.parse.urlencode({
                'client_id': TWITCH_CLIENT_ID,
                'client_secret': TWITCH_CLIENT_SECRET,
                'code': code,
                'grant_type': 'authorization_code',
                'redirect_uri': REDIRECT_URI
            }).encode()
            
            token_req = urllib.request.Request(
                'https://id.twitch.tv/oauth2/token',
                data=token_data,
                method='POST'
            )
            
            with urllib.request.urlopen(token_req) as response:
                token_response = json.loads(response.read().decode())
            
            access_token = token_response.get('access_token')
            
            user_req = urllib.request.Request(
                'https://api.twitch.tv/helix/users',
                headers={
                    'Authorization': f'Bearer {access_token}',
                    'Client-Id': TWITCH_CLIENT_ID
                }
            )
            
            with urllib.request.urlopen(user_req) as response:
                user_response = json.loads(response.read().decode())
            
            user_data = user_response.get('data', [])[0] if user_response.get('data') else {}
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'user': {
                        'id': user_data.get('id'),
                        'login': user_data.get('login'),
                        'display_name': user_data.get('display_name'),
                        'email': user_data.get('email'),
                        'profile_image_url': user_data.get('profile_image_url'),
                        'created_at': user_data.get('created_at')
                    },
                    'access_token': access_token
                }),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
