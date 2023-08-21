# IPL_Server_2023

Install Dependencies
---
```
npm install
```

Database Settings
---
> The Database must be installed before following the instructions below.

Create a file named `.env` with the following configuration
```
PORT=8080
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=DB PWD
DB_DATABASE=DB NAME
```

Database Structures
---
Create Tables named with the following configuration
* users
```
+------------------------+---------------+------+-----+---------+-------+
| Field                  | Type          | Null | Key | Default | Extra |
+------------------------+---------------+------+-----+---------+-------+
| id                     | varchar(20)   | NO   | PRI | NULL    |       |
| pwd                    | varchar(60)   | NO   |     | NULL    |       |
| u_name                 | varchar(50)   | NO   |     | NULL    |       |
| nickname               | varchar(50)   | NO   |     | NULL    |       |
| phone_number           | varchar(20)   | NO   |     | NULL    |       |
+------------------------+---------------+------+-----+---------+-------+
```

* board
```
+------------------------+---------------+------+-----+---------+----------------+
| Field                  | Type          | Null | Key | Default | Extra          |
+------------------------+---------------+------+-----+---------+----------------+
| num                    | int           | NO   | PRI | NULL    | auto_increment |
| title                  | varchar(100)  | NO   |     | NULL    |                |
| content                | varchar(1000) | NO   |     | NULL    |                |
| image_name             | varchar(100)  | YES  |     | NULL    |                |
| regist_date            | datetime      | NO   |     | NULL    |                |
| user_id                | varchar(20)   | YES  | MUL | NULL    |                |
+------------------------+---------------+------+-----+---------+----------------+
```

* likes
```
+------------------------+---------------+------+-----+---------+----------------+
| Field                  | Type          | Null | Key | Default | Extra          |
+------------------------+---------------+------+-----+---------+----------------+
| like_id                | int           | NO   | PRI | NULL    | auto_increment |
| post_num               | int           | NO   | MUL | NULL    |                |
| user_id                | varchar(20)   | NO   | MUL | NULL    |                |
+------------------------+---------------+------+-----+---------+----------------+
```

Start the application
---
```
nodemon app.js
```

