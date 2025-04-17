# haproxy服务器


## 前言
- 主机清单：`haproxy.freedom.org / 10.255.1.122`，单主机多ip，各ip使用情况。
  ```
  10.255.1.122 -- apiserver.k8s.freedom.org
  10.255.3.101 -- *.idc-ingress-istio.roywong.top
  10.255.3.102 -- *.idc-ingress-nginx.roywong.top
  10.255.3.103 -- 未使用
  10.255.3.104 -- 未使用
  10.255.3.105 -- 未使用
  10.255.3.106 -- 未使用
  10.255.3.107 -- 未使用
  10.255.3.108 -- 未使用
  10.255.3.109 -- 未使用
  10.255.3.110 -- 未使用
  ```


- 架构模式：
  - 没有结合keepalived做高可用，原因是已经做过了高可用的nginx，再做高可用的haproxy觉得没有必要，毕竟是个人实验环境。

- haproxy用途：
  - 只代理tcp请求。
  - 作为kubernetes集群的负载均衡，代理域名apiserver.k8s.freedom.org指向集群各master节点6443端口。
  - 作为kubernetes集群的ingress入口，分别处理ingress-istio和ingress-nginx流量请求。


## 配置细节
- 考虑到自动化需求，使用`consul`和`consul-template`实现haproxy动态更新。
- `haproxy-2.4.22`可以支持加载目录的子配置文件，这样在写`consul-template`时，配置文件目录更加有条理。
- `haproxy`配置不难，具体细节可以查看`haproxy`和`consul-template`角色。


## 安装过程
- `cd ansible && ansible-playbook haproxy.yml -t haproxy`