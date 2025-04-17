# grafana服务器


## 部署细节
- 主机清单。
  ```
  central-server.freedom.org / 10.255.1.11
  ```

- 单机部署grafana，用于查询本地loki服务器日志，配置文件使用默认值即可。

- 访问地址：`https://grafana.idc.roywong.top`。


## 安装过程
- `cd ansible && ansible-playbook central-server.yml -t grafana`
