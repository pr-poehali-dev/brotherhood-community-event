import json
import os
import psycopg2
from typing import Dict, Any

DATABASE_URL = os.environ.get('DATABASE_URL', '')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для управления настройками мероприятия
    Args: event - httpMethod (GET, PUT), body с настройками
          context - объект с request_id, function_name
    Returns: JSON с настройками мероприятия
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            cur.execute("""
                SELECT event_name, event_slogan, event_date, event_location,
                       organizer_name, organizer_contact, program_data, about_content
                FROM event_settings
                ORDER BY id DESC
                LIMIT 1
            """)
            
            row = cur.fetchone()
            
            if row:
                settings = {
                    'event_name': row[0],
                    'event_slogan': row[1],
                    'event_date': row[2].isoformat() if row[2] else None,
                    'event_location': row[3],
                    'organizer_name': row[4],
                    'organizer_contact': row[5],
                    'program_data': row[6],
                    'about_content': row[7]
                }
            else:
                settings = {
                    'event_name': '42 БРАТУХ',
                    'event_slogan': None,
                    'event_date': None,
                    'event_location': None,
                    'organizer_name': None,
                    'organizer_contact': None,
                    'program_data': None,
                    'about_content': None
                }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(settings),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            
            cur.execute("SELECT id FROM event_settings ORDER BY id DESC LIMIT 1")
            existing = cur.fetchone()
            
            if existing:
                updates = []
                values = []
                
                if 'event_name' in body:
                    updates.append('event_name = %s')
                    values.append(body['event_name'])
                
                if 'event_slogan' in body:
                    updates.append('event_slogan = %s')
                    values.append(body['event_slogan'])
                
                if 'event_date' in body:
                    updates.append('event_date = %s')
                    values.append(body['event_date'])
                
                if 'event_location' in body:
                    updates.append('event_location = %s')
                    values.append(body['event_location'])
                
                if 'organizer_name' in body:
                    updates.append('organizer_name = %s')
                    values.append(body['organizer_name'])
                
                if 'organizer_contact' in body:
                    updates.append('organizer_contact = %s')
                    values.append(body['organizer_contact'])
                
                if 'program_data' in body:
                    updates.append('program_data = %s')
                    values.append(json.dumps(body['program_data']))
                
                if 'about_content' in body:
                    updates.append('about_content = %s')
                    values.append(body['about_content'])
                
                updates.append('updated_at = CURRENT_TIMESTAMP')
                values.append(existing[0])
                
                query = f"UPDATE event_settings SET {', '.join(updates)} WHERE id = %s"
                cur.execute(query, values)
            else:
                cur.execute("""
                    INSERT INTO event_settings (
                        event_name, event_slogan, event_date, event_location,
                        organizer_name, organizer_contact, program_data, about_content
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    body.get('event_name', '42 БРАТУХ'),
                    body.get('event_slogan'),
                    body.get('event_date'),
                    body.get('event_location'),
                    body.get('organizer_name'),
                    body.get('organizer_contact'),
                    json.dumps(body.get('program_data')) if body.get('program_data') else None,
                    body.get('about_content')
                ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Settings updated successfully'}),
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
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()
