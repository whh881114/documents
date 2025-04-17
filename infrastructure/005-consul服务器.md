# consul服务器


## 前言
- 主机清单
  ```
  central-server.freedom.org / 10.255.1.11
  ```

- 单`server`节点，暂时无集群部署要求，因为即使`server`服务挂掉了，也不会影响`consul-template`已生成的文件。


## 配置细节
- 整体来说，只有一个特别注意的点，就是主机名修改后，再次启动服务会失败，所以要修改下`consul`的启动服务文件  
  `/usr/lib/systemd/system/consul.service`， 启动服务之前删除原先的快照数据。


## 安装过程
- `cd ansible && ansible-playbook central-server.yml -t consul`