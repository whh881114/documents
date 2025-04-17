# promtail日志收集


## 部署细节
- 虚拟机上部署了单机的loki服务后，需要在虚拟机上安装promtail，收集日志，然后发送到loki。

- promtail角色中引用变量步骤，然后配置文件中去渲染`scrape_projects`值，这样每台服务器可以自由组合各种变量，可以收集特定的日志。
  ```yaml
  - name: include vars
    include_vars:
       dir: scrape_projects
  ```


## 安装过程
- `cd ansible && ansible-playbook ha-nginx.yml -t promtail`
