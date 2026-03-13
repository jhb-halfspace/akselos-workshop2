import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()
db_name = os.getenv('POSTGRES_DB')
db_user = os.getenv('POSTGRES_USER')
db_password = os.getenv('POSTGRES_PASSWORD')
db_host = "localhost"
db_port = "5433"

conn = psycopg2.connect(
    dbname=db_name,
    user=db_user,
    password=db_password,
    host=db_host,
    port=db_port
)

cur = conn.cursor()

update_query = """
    UPDATE users
    SET position = 'Manager'
    WHERE id IN (10, 14);
"""

cur.execute(update_query)

conn.commit()

cur.close()
conn.close()

print("Database updated successfully.")