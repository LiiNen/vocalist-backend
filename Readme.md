``` bash
$ sudo apt-get update
$ sudo apt-get install mysql-server
$ vi /etc/mysql/conf.d/mysql.cnf
```

``` vim
[client]
default-character-set=utf8

[mysql]
default-character-set=utf8

[mysqld]
collation-server = utf8_unicode_ci
init-connect='SET NAMES utf8'
character-set-server = utf8
```

``` bash
$ vi /etc/mysql/mysql.conf.d/mysqld.cnf
```

``` vim
[mysql]
skip-networking = Off
bind-address            = 0.0.0.0 // 모든 ip에 대해서 mysql 접근 허용
```

``` bash
$ systemctl start mysql
$ mysql -u root -p
```

``` sql
CREATE DATABASE vocalist;
USE vocalist;
CREATE TABLE music(musicId int PRIMARY KEY, title varchar(30) NOT NULL, artist varchar(20) NOT NULL);
DESC music; // 테이블 조회

GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY '(password)'; // 모든 ip에 대해서 데이터베이스 접근 허용
```