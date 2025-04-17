# mysqld-exporter

## 正文
- https://github.com/prometheus/mysqld_exporter

- 在`v0.14.0`版本中，配置环境变量`DATA_SOURCE_NAME`即可和mysql容器通信，其格式为`"exporter_username:exporter_password@(localhost:3306)/"`。

- 在`v0.15.1`版本中，则需要配置环境变量`MYSQLD_EXPORTER_PASSWORD`，并且需配置启动参数`--mysqld.username exporter`。  
  此外，`mysqld_exporter`指定收集特定`metrics`参数。
  ```
  --collect.info_schema.innodb_metrics
  --collect.info_schema.tables
  --collect.info_schema.processlist
  --collect.info_schema.tables.databases=*
  ```

- `mysql`配置`exporter`用户，使用`localhost`时，会解析成`ipv6`地址，报错信息：`ts=2024-09-13T08:08:13.120Z caller=exporter.go:152 level=error msg="Error pinging mysqld" err="Error 1045 (28000): Access denied for user 'exporter'@'::1' (using password: YES)"`。
  ```shell
  CREATE USER 'exporter'@'%' IDENTIFIED BY 'XXXXXXXX' WITH MAX_USER_CONNECTIONS 3;
  GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'exporter'@'%';
  ```

- `grafana`面板：https://grafana.com/grafana/dashboards/14057-mysql/
  - 官方面板，需要修改下三个参数，使界面美观。
    - `Uptime`：对原参数求和，`sum(mysql_global_status_uptime{job=~"$job", instance=~"$instance"})`。
    - `Current QPS`：对原参数求平均值，`avg(rate(mysql_global_status_queries{job=~"$job", instance=~"$instance"}[$__interval]))`。
    - `InnoDB Buffer Pool`：对原参数求平均值，`avg(mysql_global_variables_innodb_buffer_pool_size{job=~"$job", instance=~"$instance"})`。