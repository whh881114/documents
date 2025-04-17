# zabbix服务器


## 前言
- 主机清单
  ```
  zabbix.freedom.org / 10.255.1.13
  ```

- 安装版本：`6.0-lts`。

- `单server节点`，根据官方文档，手动安装。

- 文档地址：https://www.zabbix.com/download?zabbix=6.0&os_distribution=rocky_linux&os_version=9&components=server_frontend_agent&db=mysql&ws=nginx。


## 配置细节
- `zabbix-server`图形界面不支持中文显示，这个需要调整。关于`zabbix`的监控文档会单独写在`documents/zabbix`目录中。

- 另外，`mysql`数据库版本是`8.0.36`，将数据保存在数据磁盘中，需要修改`datadir`参数。`/etc/my.cnf.d/mysql-server.cnf`配置文件内容如下。
  ```
  [root@zabbix.freedom.org ~ 11:06]# 1> cat /etc/my.cnf.d/mysql-server.cnf 
  #
  # This group are read by MySQL server.
  # Use it for options that only the server (but not clients) should see
  #
  # For advice on how to change settings please see
  # http://dev.mysql.com/doc/refman/en/server-configuration-defaults.html
  
  # Settings user and group are ignored when systemd is used.
  # If you need to run mysqld under a different user or group,
  # customize your systemd unit file for mysqld according to the
  # instructions in http://fedoraproject.org/wiki/Systemd
  
  #[mysqld]
  #datadir=/var/lib/mysql
  #socket=/var/lib/mysql/mysql.sock
  #log-error=/var/log/mysql/mysqld.log
  #pid-file=/run/mysqld/mysqld.pid
  
  [mysqld]
  datadir=/data/mysql
  socket=/var/lib/mysql/mysql.sock
  log-error=/var/log/mysql/mysqld.log
  pid-file=/run/mysqld/mysqld.pid
  bind-address=127.0.0.1
  mysqlx=0
  binlog_expire_logs_seconds = 604800
  [root@zabbix.freedom.org ~ 11:06]# 2> 
  ```

- 开启`mysql 8.0`慢查询，使用`mysql`命令进入后，设置相应变量，**重启服务生效**。
  ```
  show variables like 'slow_query_log';
  show variables like 'slow_query_log_file';
  show variables like 'long_query_time';
  
  set persist slow_query_log = 'ON';
  set persist long_query_time = 1;
  set persist slow_query_log_file = '/var/log/mysql/slow.log';
  ```