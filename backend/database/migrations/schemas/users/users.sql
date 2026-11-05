CREATE TABLE IF NOT EXISTS users (
2
id SERIAL PRIMARY KEY,

user_name VARCHAR(100) NOT NULL,
4
user_email VARCHAR(150) UNIQUE NOT NULL,
5
user_phone VARCHAR(20),
6
document_type VARCHAR(20),

document_number VARCHAR(50) UNIQUE,

user_address VARCHAR(100) NOT NULL,
9
ıser lastname VARCHAR (100) NOT NULL,
10

password TEXT NOT NULL,
11
avatar_url TEXT,


12
is_staff BOOLEAN DEFAULT FALSE,
13
is_active BOOLEAN DEFAULT TRUE,
14
is_superuser BOOLEAN DEFAULT FALSE,
15
created_at TIMESTAMP DEFAULT NOW()
16
) ;