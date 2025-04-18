# 监控mysql


## 说明
- 监控任何对象，优先选择`agent`方式。

- 官方文档：https://www.zabbix.com/cn/integrations/mysql

- **文档中记录的密码使用mkpasswd生成随机密码，此外，此密码仅用于个人实验环境。**


## 配置过程
- `MySQL by Zabbix agent 2`模板说明。
  ```
  Requirements for template operation:
  1. Create a MySQL user for monitoring. For example:
  CREATE USER 'zbx_monitor'@'%' IDENTIFIED BY '<password>';
  GRANT REPLICATION CLIENT,PROCESS,SHOW DATABASES,SHOW VIEW ON *.* TO 'zbx_monitor'@'%';
  For more information please read the MySQL documentation https://dev.mysql.com/doc/refman/8.0/en/grant.html.
  2. Set in the {$MYSQL.DSN} macro the data source name of the MySQL instance either session name from Zabbix agent 2 configuration file or URI.
  Examples: MySQL1, tcp://localhost:3306, tcp://172.16.0.10, unix:/var/run/mysql.sock
  For more information about MySQL Unix socket file please read the MySQL documentation https://dev.mysql.com/doc/refman/8.0/en/problems-with-mysql-sock.html.
  3. If you had set URI in the {$MYSQL.DSN}, please define the user name and password in host macros ({$MYSQL.USER} and {$MYSQL.PASSWORD}).
  Leave macros {$MYSQL.USER} and {$MYSQL.PASSWORD} empty if you use a session name. Set the user name and password in the Plugins.Mysql.<...> section of your Zabbix agent 2 configuration file.
  For more information about configuring the Zabbix MySQL plugin please read the documentation https://git.zabbix.com/projects/ZBX/repos/zabbix/browse/src/go/plugins/mysql/README.md.
  
  You can discuss this template or leave feedback on our forum https://www.zabbix.com/forum/zabbix-suggestions-and-feedback/384189-discussion-thread-for-official-zabbix-template-db-mysql
  
  Generated by official Zabbix template tool "Templator"
  ```

- mysql数据库监控用户名密码分别为：`zbx_monitor`和`dr_rfrfYz*fa10xtU@s#wfzzplev_lqe`。

- 配置主机时，需要设置`{$MYSQL.DSN}`，单机单实例的情况下，写`tcp://localhost:3306`；当存在单机多实例的情况下，可以使用以下方法配置。  
  第一种方式是，在`web`界面创建多个监控实例，然后配置宏变量`{$MYSQL.DSN}`，`{$MYSQL.USER}`和`{$MYSQL.PASSWORD}`。  
  第二种方式是，修改配置文件`/etc/zabbix/zabbix_agent2.d/plugins.d/mysql.conf`文件，配置多个`session`实例，  
  `web`界面上配置宏变量`{$MYSQL.DSN}`，值是`session`名称。
  ```
  Plugins.Mysql.Default.User=zbx_monitor
  Plugins.Mysql.Default.Password=dr_rfrfYz*fa10xtU@s#wfzzplev_lqe
  
  Plugins.Mysql.Sessions.MySQLTest1.Uri=tcp://localhost:3317
  Plugins.Mysql.Sessions.MySQLTest1.User=zbx_monitor
  Plugins.Mysql.Sessions.MySQLTest1.Password=dr_rfrfYz*fa10xtU@s#wfzzplev_lqe
  
  Plugins.Mysql.Sessions.MySQLTest2.Uri=tcp://localhost:3318
  Plugins.Mysql.Sessions.MySQLTest2.User=zbx_monitor
  Plugins.Mysql.Sessions.MySQLTest2.Password=dr_rfrfYz*fa10xtU@s#wfzzplev_lqe
  ```


## 监控结果
### 第一种方式监控结果
![MySQL-by-Zabbix-agent-2-1.png](images/MySQL-by-Zabbix-agent-2-1.png)

### 第二种方式监控结果
![MySQL-by-Zabbix-agent-2-2.png](images/MySQL-by-Zabbix-agent-2-2.png)



## 额外记录
- `mysql5.7`初始化密码。
    ```shell
    mysql> show databases;
    ERROR 1820 (HY000): You must reset your password using ALTER USER statement before executing this statement.
    mysql> alter user 'root'@'localhost' identified by 'rhhy4rsyx4vvgpLjj<tvfrmojDxfdggw';
    Query OK, 0 rows affected (0.00 sec)
    
    mysql> flush privileges;
    Query OK, 0 rows affected (0.00 sec)
    
    mysql> quit
    Bye
    ```

- `mysql8.0`，默认root用户无密码，需要使用此命令修改：`ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'new_password';`。

- mysql配置zabbix监控用户。
    ```shell
    mysql> CREATE USER 'zbx_monitor'@'%' IDENTIFIED BY 'dr_rfrfYz*fa10xtU@s#wfzzplev_lqe';
    Query OK, 0 rows affected (0.00 sec)
    
    mysql> GRANT REPLICATION CLIENT,PROCESS,SHOW DATABASES,SHOW VIEW ON *.* TO 'zbx_monitor'@'%';
    Query OK, 0 rows affected (0.00 sec)
    
    mysql> flush privileges;
    Query OK, 0 rows affected (0.00 sec)
    
    mysql> quit
    Bye
    ``