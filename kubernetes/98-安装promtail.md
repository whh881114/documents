# 安装promtail

## 前言
- https://github.com/grafana/helm-charts/releases/download/promtail-6.16.4/promtail-6.16.4.tgz

## 部署
- 使用helm安装promtail。
- 配置相关参数，默认情况下配置的内容很少，只是更新下镜像地址即可。

## 安装结果
```shell
ok: [10.255.1.12] => {
    "msg": [
        [
            "release \"promtail\" uninstalled",
            "NAME: promtail",
            "LAST DEPLOYED: Wed Aug  7 11:02:10 2024",
            "NAMESPACE: grafana",
            "STATUS: deployed",
            "REVISION: 1",
            "TEST SUITE: None",
            "NOTES:",
            "***********************************************************************",
            " Welcome to Grafana Promtail",
            " Chart version: 6.16.4",
            " Promtail version: 3.1.0",
            "***********************************************************************",
            "",
            "Verify the application is working by running these commands:",
            "* kubectl --namespace grafana port-forward daemonset/promtail 3101",
            "* curl http://127.0.0.1:3101/metrics"
        ],
        [
            "Error from server (AlreadyExists): namespaces \"grafana\" already exists"
        ]
    ]
}
```

## 部署过程中的思考点
- 如果官方有helm chart，那么优先使用，毕竟官方写的模板会考虑周全。

- 官方的positions文件为什么要放在/run目录下呢，`positions.filename: /run/promtail/positions.yaml`？
  ```
  这个目录已经映射到本地目录/run/promtail，设计很巧妙，promtail只收集集群pod日志，当宿主机重启后，/run目录清空，pod也是重新启动，
  原先的pod日志也是重新打印，所以promtail就会重新收集日志，如果positions.yaml持久化到别的目录了，那么反而会有影响。
  ```

- `kubernetes_sd_configs`工作原理是什么？
  ```shell
  简单来说，promtail运行在k8s集群中，promtail会和apiserver通信，可以获取到pod的元信息，之后在relabel_configs中进一系列重写，将元
  信息暴露出来，这些就是loki中的索引，可以用于查询。
  
  至此，有了这些元信息（标签/索引），如namespace=kube-system，pod=coredns-55b9c9ffdf-l2pb8，container=coredns，
  那么如何通过这些信息，找到这个pod的日志文件在哪呢？
  
  - action: replace
    replacement: /var/log/pods/*$1/*.log
    separator: /
    source_labels:
      - __meta_kubernetes_pod_uid
      - __meta_kubernetes_pod_container_name
    target_label: __path__
  
  以上的配置即可找到相对应的文件，注意要重写的标签是`__path__`。
  举例来说，replacement改写后结果是`/var/log/pods/*6c4f4d7e-f548-4309-9df6-e6bde69ac222/promtail/0.log`，
  而实际路径为`/var/log/pods/grafana_promtail-hps4b_6c4f4d7e-f548-4309-9df6-e6bde69ac222/promtail/0.log`。
  那这里就会有一个疑问了，为什么不直接使用`/var/log/pods/*/promtail/0.log`呢？
  
  原因：/var/log/pods下可能有多个子目录，每个目录对应一个不同的Pod UID。使用通配符 * 匹配所有子目录中的日志文件，可能会导致日志文件
  匹配不准确，特别是如果有多个相同容器名称的日志目录。如果匹配到多个目录下的日志文件，那么在loki中查询到的内容就是别的pod的日志了。 
  ```
