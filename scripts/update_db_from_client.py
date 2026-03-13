from requests_oauthlib import OAuth2Session
import http.server
from urllib.parse import urlparse, parse_qs
import threading
import webbrowser
import os
import requests
from dotenv import load_dotenv
import csv

DEPARTMENT_MAP = {
    'Showcase': 1,
    'Production': 2,
    'Sales': 3,
    'Marketing': 4,
    'Training & Support': 5,
    'Development': 6,
    '': 7
}

class HTTPRequestHandler(http.server.BaseHTTPRequestHandler):
    parsed_path = None

    def do_GET(self):
        self.__class__.parsed_path = urlparse(self.path)

        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(b"""
        <html>
            <body>
                <script>
                    alert("Authorized successfully. You can close this tab.");
                    window.open('', '_self', '');
                    window.close();
                </script>
            </body>
        </html>
        """)

def start_auth_server():
    httpd = http.server.HTTPServer(('localhost', 3001), HTTPRequestHandler)
    server_thread = threading.Thread(target=httpd.handle_request)
    server_thread.start()
    server_thread.join()

def fetch_token_and_close(redirect_response, client_secret, token_url, google):
    params = parse_qs(redirect_response.query)
    code = params['code'][0]
    google.fetch_token(token_url, client_secret=client_secret, code=code)
    return google.token['id_token']

def add_user(api_url, jwt_token, user_data_list):
    url = f"{api_url}/users"
    headers = {
        "Authorization": f"Bearer {jwt_token}",
        'Content-Type': 'application/json',
    }
    for user_data in user_data_list:
        response = requests.post(url, json=user_data, headers=headers)
        if response.status_code == 201:
            print(f'{user_data["user_name"]} added successfully')
        else:
            print(f'Error adding user: {response.status_code}')


def update_user(api_url, jwt_token, user_data_list):
    url = f"{api_url}/users"
    headers = {
        "Authorization": f"Bearer {jwt_token}",
        'Content-Type': 'application/json',
    }
    for user_data in user_data_list:
        user_id = user_data['id']
        response = requests.put(url, json=user_data, headers=headers)
        if response.status_code == 200:
            print(f'User {user_id} updated successfully')
        else:
            print(f'Error updating user {user_id}: {response.status_code}')

def delete_user(api_url, jwt_token, user_data_list):
    headers = {
        "Authorization": f"Bearer {jwt_token}",
        'Content-Type': 'application/json',
    }
    for user_data in user_data_list:
        user_id = user_data['id']
        url = f"{api_url}/users?id={user_id}"
        response = requests.delete(url, headers=headers)
        if response.status_code == 200:
            print(f'User {user_id} deleted successfully')
        else:
            print(f'Error deleting user {user_id}: {response.status_code}')

def get_user_data(input_file, api_url, jwt_token):
    user_data_list = []

    with open(input_file, 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            url = f"{api_url}/users?user_name={row['NAME']}"
            headers = {
                "Authorization": f"Bearer {jwt_token}",
                'Content-Type': 'application/json',
            }
            user_id = -1
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                user_id = response.json()["data"][0]["id"]
            else:
                print(f'Error querying user: {response.status_code}')

            department_id = DEPARTMENT_MAP.get(row['DEPARTMENT'], '')
            user_data = {
                "id": user_id,
                "user_name": row['NAME'],
                "department_id": department_id,
                "position": row["LEVEL"],
                "note": row['NOTE']
            }
            user_data_list.append(user_data)
    
    return user_data_list

def get_added_user_data(input_file):
    added_user_data_list = []

    with open(input_file, 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            department_id = DEPARTMENT_MAP.get(row['DEPARTMENT'], '')
            user_data = {
                "user_name": row['NAME'],
                "department_id": department_id,
                "position": row["LEVEL"],
                "note": row['NOTE']
            }
            added_user_data_list.append(user_data)

    return added_user_data_list

def main():
    load_dotenv()

    client_id = os.getenv('GG_CLIENT_ID')
    client_secret = os.getenv('GG_CLIENT_SECRET')
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

    api_url = "http://localhost:7789/api"
    redirect_uri = 'http://localhost:3001'
    authorization_base_url = "https://accounts.google.com/o/oauth2/v2/auth"
    token_url = "https://oauth2.googleapis.com/token"
    scope = ["https://www.googleapis.com/auth/userinfo.profile",
             "https://www.googleapis.com/auth/userinfo.email", "openid"]

    google = OAuth2Session(client_id, scope=scope, redirect_uri=redirect_uri)
    authorization_url, state = google.authorization_url(authorization_base_url,
                                                        access_type="offline",
                                                        prompt="select_account")

    webbrowser.open(authorization_url)

    start_auth_server()

    redirect_response = HTTPRequestHandler.parsed_path
    jwt_token = fetch_token_and_close(redirect_response, client_secret, token_url, google)
    print("ID Token: ", jwt_token)

    updated_user_data_list = get_user_data('./data/employee_to_update.csv', api_url, jwt_token)
    update_user(api_url, jwt_token, updated_user_data_list)

    added_user_data_list = get_added_user_data('./data/employee_to_add.csv')
    add_user(api_url, jwt_token, added_user_data_list)

    # removed_user_data_list = get_user_data('./data/employee_to_remove.csv', api_url, jwt_token)
    # delete_user(api_url, jwt_token, removed_user_data_list)

if __name__ == "__main__":
    main()
