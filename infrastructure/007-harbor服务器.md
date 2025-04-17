# harbor服务器


## 前言
- 主机清单
  ```
  harbor.freedom.org / 10.255.1.21
  ```

- 部署版本为`2.10.3`。


## 配置细节
- 下载离线包部署，不需要配置`https`，因为环境中有两台`nginx`服务器搭建成高可用反向代理，`https`均在`nginx`服务器中配置。

- 部署完后，需要将容器启动命令放在`/etc/rc.d/rc.local`文件中，这里面的命令可能因版本不同而改变。
  ```shell
  docker restart nginx \
                 harbor-jobservice \
                 harbor-core \
                 registryctl \
                 redis \
                 harbor-portal \
                 harbor-db \
                 registry \
                 harbor-log
  ```

- 安装时，分别安装`docker`，`harbor`和`docker-image`角色，`harbor`服务器使用熟悉的容器引擎`docker`。

- `docker-image`角色，是下载整个实验环境所用到容器镜像。目前中国大陆无法直接访问`docker.com`，所以拉取镜像时要用到加速域名
  `m.daocloud.io`。


## 安装过程
- `cd ansible && ansible-playbook harbor.yml -t docker`
- `cd ansible && ansible-playbook harbor.yml -t harbor`
- `cd ansible && ansible-playbook harbor.yml -t docker-image`