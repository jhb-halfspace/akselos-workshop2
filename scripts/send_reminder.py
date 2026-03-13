import pytz
import schedule
from datetime import date
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
from itertools import chain
import os
import psycopg2
from dotenv import load_dotenv
from jinja2 import Environment, FileSystemLoader

# Create the Jinja environment
env = Environment(loader=FileSystemLoader('./template/'))
template = env.get_template('reminder.html')

load_dotenv()
db_name = os.getenv('POSTGRES_DB')
db_user = os.getenv('POSTGRES_USER')
db_password = os.getenv('POSTGRES_PASSWORD')
db_host = "time-recorder-db"
db_port = "5432"
conn = psycopg2.connect(
    dbname=db_name,
    user=db_user,
    password=db_password,
    host=db_host,
    port=db_port
)

server_email = os.getenv('SERVER_EMAIL')
server_password = os.getenv('SERVER_PASSWORD')

def get_no_reminder_user_data(input_file):
    with open(input_file, 'r') as file:
        data = file.read() 
        user_list = data.split("\n") 
    return tuple(user_list)

def send_email():
    cur = conn.cursor()
    today = str(date.today())
    
    # When a new Django server is deployed, please uncomment this new query:
    #     select_user_query = """
    #     SELECT is_active, receive_email
    #     FROM users
    #     LEFT JOIN records
    #         ON users.id = records.user_id
    #         AND records.date = '{}'
    #     WHERE records.user_id IS NULL
    #     AND is_active IS TRUE
    #     AND receive_email IS TRUE
    # """.format(today)

    select_user_query = """
        SELECT user_name
        FROM users
        LEFT JOIN records
            ON users.id = records.user_id
            AND records.date = '{}'
        WHERE records.user_id IS NULL
        AND users.receive_email = 't'
    """.format(today)

    cur.execute(select_user_query)
    res = cur.fetchall()
    if len(res) > 0:
        user_list = list(chain(*res))  # flatten the list
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(server_email, server_password)
        for i in user_list:
            # EMAIL CONTENT
            message = MIMEMultipart("alternative")
            message['X-Priority'] = '1'
            message['X-MSMail-Priority'] = 'High'
            message["Subject"] = "Akselos Daily Input Reminder"
            message["From"] = server_email
            message["To"] = i + "@akselos.com"
            html = template.render(name=i)
            message.attach(MIMEText(html, 'html'))
            server.sendmail(
                server_email, i + "@akselos.com", message.as_string()
            )
    # Close connection
    cur.close()

send_email()
