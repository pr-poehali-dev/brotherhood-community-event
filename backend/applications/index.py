import json
import os
import psycopg2
from datetime import datetime
from typing import Dict, Any, Optional

DATABASE_URL = os.environ.get('DATABASE_URL', '')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для работы с заявками на участие в мероприятии
    Args: event - httpMethod (GET, POST, PUT), body с данными заявки
          context - объект с request_id, function_name
    Returns: JSON с данными заявки или списком заявок
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
            params = event.get('queryStringParameters', {})
            app_id = params.get('id')
            status_filter = params.get('status')
            
            if app_id:
                cur.execute("""
                    SELECT id, name, contact, twitch_link, about, status,
                           twitch_user_id, twitch_display_name, twitch_avatar_url,
                           twitch_email, qr_code, created_at, updated_at
                    FROM applications WHERE id = %s
                """, (app_id,))
                row = cur.fetchone()
                if not row:
                    return {
                        'statusCode': 404,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Application not found'}),
                        'isBase64Encoded': False
                    }
                
                application = {
                    'id': row[0],
                    'name': row[1],
                    'contact': row[2],
                    'twitch_link': row[3],
                    'about': row[4],
                    'status': row[5],
                    'twitch_user_id': row[6],
                    'twitch_display_name': row[7],
                    'twitch_avatar_url': row[8],
                    'twitch_email': row[9],
                    'qr_code': row[10],
                    'created_at': row[11].isoformat() if row[11] else None,
                    'updated_at': row[12].isoformat() if row[12] else None
                }
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps(application),
                    'isBase64Encoded': False
                }
            
            else:
                query = """
                    SELECT id, name, contact, status, created_at,
                           twitch_display_name, twitch_avatar_url
                    FROM applications
                """
                
                if status_filter:
                    query += " WHERE status = %s"
                    cur.execute(query + " ORDER BY created_at DESC", (status_filter,))
                else:
                    cur.execute(query + " ORDER BY created_at DESC")
                
                rows = cur.fetchall()
                applications = []
                for row in rows:
                    applications.append({
                        'id': row[0],
                        'name': row[1],
                        'contact': row[2],
                        'status': row[3],
                        'created_at': row[4].isoformat() if row[4] else None,
                        'twitch_display_name': row[5],
                        'twitch_avatar_url': row[6]
                    })
                
                cur.execute("SELECT COUNT(*) FROM applications")
                total_count = cur.fetchone()[0]
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'applications': applications,
                        'total': total_count
                    }),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            name = body.get('name')
            contact = body.get('contact')
            twitch_link = body.get('twitch_link')
            about = body.get('about')
            twitch_user = body.get('twitch_user', {})
            
            if not name or not contact:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Name and contact are required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                INSERT INTO applications (
                    name, contact, twitch_link, about, status,
                    twitch_user_id, twitch_display_name, twitch_avatar_url, twitch_email
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, created_at
            """, (
                name, contact, twitch_link, about, 'new',
                twitch_user.get('id'),
                twitch_user.get('display_name'),
                twitch_user.get('profile_image_url'),
                twitch_user.get('email')
            ))
            
            result = cur.fetchone()
            app_id = result[0]
            created_at = result[1]
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'id': app_id,
                    'message': 'Application created successfully',
                    'created_at': created_at.isoformat()
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            app_id = body.get('id')
            
            if not app_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Application ID is required'}),
                    'isBase64Encoded': False
                }
            
            updates = []
            values = []
            
            if 'status' in body:
                updates.append('status = %s')
                values.append(body['status'])
            
            if 'qr_code' in body:
                updates.append('qr_code = %s')
                values.append(body['qr_code'])
            
            if not updates:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'No fields to update'}),
                    'isBase64Encoded': False
                }
            
            updates.append('updated_at = CURRENT_TIMESTAMP')
            values.append(app_id)
            
            query = f"UPDATE applications SET {', '.join(updates)} WHERE id = %s"
            cur.execute(query, values)
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Application updated successfully'}),
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
