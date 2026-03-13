from urllib.parse import urlparse
from datetime import datetime


def decode_vector(s):
    try:
        return [int(part) for part in s.split(",")]
    except ValueError:
        return []


def extract_db_components(database_url):
    result = urlparse(database_url)
    engine = result.scheme
    dbname = result.path.lstrip("/")
    host = result.hostname
    port = result.port
    user = result.username
    password = result.password

    if port is None:
        if engine == "postgresql":
            port = "5432"
        elif engine == "mysql":
            port = "3306"
        elif engine == "sqlite":
            port = None  # No default port for SQLite

    return engine, dbname, host, port, user, password

def parse_date(date_string, date_formats=None):
    if date_formats is None:
        # Default date formats
        date_formats = ['%m/%d/%Y', '%Y-%m-%d']

    for date_format in date_formats:
        try:
            return datetime.strptime(date_string, date_format).date()
        except ValueError:
            pass
    return None

def find_column_value(titles, values, column_title, default=None):
    try:
        index = titles.index(column_title)
        return values[index]
    except ValueError:
        return default
