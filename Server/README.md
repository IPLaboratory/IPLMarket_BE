# IPL_Server_2023

Installing Before Running
---
```
Node.js - https://www.nodejs.org - LTS
MySQL - https://www.mysql.com/downloads/ - MySQL Community Server
```
> If you encounter an error in error number 1251 when working with Node.js and MySQL, use the following methods to resolve.
> Enter the following command after accessing the MySQL root account
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Your PASSWORD';
```

Install Dependencies
---
```
npm install
npm install nodemon
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

```sql
CREATE TABLE users (
    id varchar(20) NOT NULL PRIMARY KEY,
    pwd varchar(60) NOT NULL,
    u_name varchar(50) NOT NULL,
    nickname varchar(50) NOT NULL,
    phone_number varchar(20) NOT NULL
);
```

* board
```
+------------------------+---------------+------+-----+---------+----------------+
| Field                  | Type          | Null | Key | Default | Extra          |
+------------------------+---------------+------+-----+---------+----------------+
| num                    | int           | NO   | PRI | NULL    | auto_increment |
| title                  | varchar(100)  | NO   |     | NULL    |                |
| content                | varchar(1000) | NO   |     | NULL    |                |
| price                  | varchar(100)  | NO   |     | NULL    |                |
| video_name             | varchar(100)  | YES  |     | NULL    |                |
| image_name             | varchar(100)  | YES  |     | NULL    |                |
| regist_date            | datetime      | NO   |     | NULL    |                |
| user_id                | varchar(20)   | YES  | MUL | NULL    |                |
+------------------------+---------------+------+-----+---------+----------------+
```

```sql
CREATE TABLE board (
    num int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    title varchar(100) NOT NULL,
    content varchar(1000) NOT NULL,
    price varchar(100) NOT NULL,
    video_name(100),
    image_name varchar(100),
    regist_date datetime NOT NULL,
    user_id varchar(20),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```


Start the application
---
```
nodemon app.js
```

