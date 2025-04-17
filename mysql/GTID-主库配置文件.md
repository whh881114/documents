# GTID-主库配置文件

## /etc/my.cnf
```
[mysql]
prompt="\u@\h_[\d]_\D > "
no-auto-rehash

[mysqld]
datadir=/var/lib/mysql
socket=/var/lib/mysql/mysql.sock
log-error=/var/log/mysql/mysqld.log
pid-file=/var/run/mysqld/mysqld.pid

server-id=1
gtid_mode=ON
enforce_gtid_consistency=ON
default_authentication_plugin=caching_sha2_password

replicate-ignore-db=information_schema
replicate-ignore-db=mysql
replicate-ignore-db=performance_schema
replicate-ignore-db=sys
```