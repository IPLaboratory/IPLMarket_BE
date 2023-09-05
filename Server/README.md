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
    image_name varchar(100),
    regist_date datetime NOT NULL,
    user_id varchar(20),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
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

```sql
CREATE TABLE likes (
    like_id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    post_num int NOT NULL,
    user_id varchar(20) NOT NULL,
    FOREIGN KEY (post_num) REFERENCES board(num),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```


Start the application
---
```
nodemon app.js
```

