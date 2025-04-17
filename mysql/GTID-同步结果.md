# GTID-同步结果

## 同步结果
- 主从配置成功，很意外。还需要再配置一次才行。
    ```shell
    root@localhost_[(none)]_Sat Sep 14 16:39:47 2024 > show slave status\G
    *************************** 1. row ***************************
                   Slave_IO_State: Waiting for source to send event
                      Master_Host: 10.255.1.19
                      Master_User: repl
                      Master_Port: 3306
                    Connect_Retry: 60
                  Master_Log_File: binlog.000006
              Read_Master_Log_Pos: 197
                   Relay_Log_File: rockylinux9-wanghaohao-2-relay-bin.000007
                    Relay_Log_Pos: 407
            Relay_Master_Log_File: binlog.000006
                 Slave_IO_Running: Yes
                Slave_SQL_Running: Yes
                  Replicate_Do_DB: 
              Replicate_Ignore_DB: information_schema,mysql,performance_schema,sys
               Replicate_Do_Table: 
           Replicate_Ignore_Table: 
          Replicate_Wild_Do_Table: 
      Replicate_Wild_Ignore_Table: 
                       Last_Errno: 0
                       Last_Error: 
                     Skip_Counter: 0
              Exec_Master_Log_Pos: 197
                  Relay_Log_Space: 886
                  Until_Condition: None
                   Until_Log_File: 
                    Until_Log_Pos: 0
               Master_SSL_Allowed: No
               Master_SSL_CA_File: 
               Master_SSL_CA_Path: 
                  Master_SSL_Cert: 
                Master_SSL_Cipher: 
                   Master_SSL_Key: 
            Seconds_Behind_Master: 0
    Master_SSL_Verify_Server_Cert: No
                    Last_IO_Errno: 0
                    Last_IO_Error: 
                   Last_SQL_Errno: 0
                   Last_SQL_Error: 
      Replicate_Ignore_Server_Ids: 
                 Master_Server_Id: 1
                      Master_UUID: 1fc640e5-724d-11ef-8838-0050569da197
                 Master_Info_File: mysql.slave_master_info
                        SQL_Delay: 0
              SQL_Remaining_Delay: NULL
          Slave_SQL_Running_State: Replica has read all relay log; waiting for more updates
               Master_Retry_Count: 86400
                      Master_Bind: 
          Last_IO_Error_Timestamp: 
         Last_SQL_Error_Timestamp: 
                   Master_SSL_Crl: 
               Master_SSL_Crlpath: 
               Retrieved_Gtid_Set: 1fc640e5-724d-11ef-8838-0050569da197:1-5
                Executed_Gtid_Set: 1fc640e5-724d-11ef-8838-0050569da197:1-5
                    Auto_Position: 1
             Replicate_Rewrite_DB: 
                     Channel_Name: 
               Master_TLS_Version: 
           Master_public_key_path: 
            Get_master_public_key: 0
                Network_Namespace: 
    1 row in set, 1 warning (0.00 sec)
    
    root@localhost_[(none)]_Sat Sep 14 16:39:53 2024 > show databases;
    +--------------------+
    | Database           |
    +--------------------+
    | information_schema |
    | mysql              |
    | performance_schema |
    | sys                |
    | whh                |
    +--------------------+
    5 rows in set (0.00 sec)
    
    root@localhost_[(none)]_Sat Sep 14 16:40:10 2024 > 
    ```