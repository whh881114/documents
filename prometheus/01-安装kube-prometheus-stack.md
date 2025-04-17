# 安装kube-prometheus-stack


## 参考资料
- https://prometheus.io/
- https://thanos.io/
- https://github.com/prometheus-operator/kube-prometheus
- https://github.com/prometheus-community/helm-charts


##  前言
- `prometheus`部署在`kubernetes`集群上有两个选择，一个是`kube-prometheus`，另一个是`kube-prometheus-stack`。

- 之前使用的是`kube-prometheus`，提供很多开箱即用的功能，非常适合新手入门和个人实验环境部署。但是，涉及到集群规模较大时，收集的  
  数据越来越多时，涉及到很多自定义配置时，那么就不太适合了。因为，`kube-prometheus`早期只支持`prometheus单实例架构`，即使  
  到目前为止（2025-04-17）官方声明支持`prometheus`多实例，但是需要使用者进入`jsonnet/kube-prometheus`目录中修改`jsonnet`配置  
  再渲染成`yaml`文件，这个对使用者要求太高了。

- 首选`kube-prometheus-stack`，因为此方案具体`prometheus`水平扩展能力，同时也有`thanos-sidecar`统一数据存储的方案。   
  另外，提供`helm`安装包，对使用者友好。

- 特别注意：不管是哪种方案，涉及到监控对象时，他们的配置都和原生`prometheus`的`scrap_config`是有差异的，都需要按各自方案中定义  
  要求来，比如说监控`pod`或`service`时，创建`PodMonitor`或`ServiceMonitor`。


## prometheus架构图
![prometheus-architecture.jpg](..%2Fkubernetes%2Fimages%2Fprometheus-architecture.jpg)

## kube-prometheus-stack
### 配置全局变量
- 配置文件：`argocd-manifests/_charts/kube-prometheus-stack/61.8.0/values.yaml`，修改内容如下：
  ```yaml
  namespaceOverride: "monitoring"
  kubeTargetVersionOverride: "1.30.3"
  crds:
    enabled: false
  global:
    imageRegistry: "harbor.idc.roywong.work"
  defaultRules:
    create: false
  ```
- 特别说明一：`crds.enabled=false`，部署时不安装`crds`。默认情况下是开启`crds`安装，即使在`prometheus`应用中添加同步参数`ApplyStrategy=create`，  
  是可以将部分`crds`创建出来，但`create`逻辑只适合于初次创建，创建好后，还需要将此参数删除，之后就是
  `apply`逻辑了，也会报错。  
  错误信息：`The CustomResourceDefinition "***********" is invalid: metadata.annotations: Too long: must have at most 262144 bytes`  
  解决方法：将代码拉取到`kubernetes`集群的主机上，然后使用`kubectl create -f xxx.yaml`方法创建于`crds`资源。
  ```shell
  [root@master-1.k8s.freedom.org /data/argocd-manifests/_charts/kube-prometheus-stack/61.8.0/charts/crds/crds 14:32]# 1> ll
  总用量 3332
  -rw-r--r-- 1 root root 439093  3月 27 13:29 crd-alertmanagerconfigs.yaml
  -rw-r--r-- 1 root root 523281  3月 27 13:29 crd-alertmanagers.yaml
  -rw-r--r-- 1 root root  48118  3月 27 13:29 crd-podmonitors.yaml
  -rw-r--r-- 1 root root  46592  3月 27 13:29 crd-probes.yaml
  -rw-r--r-- 1 root root 626429  3月 27 13:29 crd-prometheusagents.yaml
  -rw-r--r-- 1 root root 736313  3月 27 13:29 crd-prometheuses.yaml
  -rw-r--r-- 1 root root   6624  3月 27 13:29 crd-prometheusrules.yaml
  -rw-r--r-- 1 root root 418557  3月 27 13:29 crd-scrapeconfigs.yaml
  -rw-r--r-- 1 root root  49299  3月 27 13:29 crd-servicemonitors.yaml
  -rw-r--r-- 1 root root 497408  3月 27 13:29 crd-thanosrulers.yaml
  [root@master-1.k8s.freedom.org /data/argocd-manifests/_charts/kube-prometheus-stack/61.8.0/charts/crds/crds 14:45]# 2> ls | xargs -n 1 kubectl create -f
  customresourcedefinition.apiextensions.k8s.io/alertmanagerconfigs.monitoring.coreos.com created
  customresourcedefinition.apiextensions.k8s.io/alertmanagers.monitoring.coreos.com created
  customresourcedefinition.apiextensions.k8s.io/podmonitors.monitoring.coreos.com created
  customresourcedefinition.apiextensions.k8s.io/probes.monitoring.coreos.com created
  customresourcedefinition.apiextensions.k8s.io/prometheusagents.monitoring.coreos.com created
  customresourcedefinition.apiextensions.k8s.io/prometheuses.monitoring.coreos.com created
  customresourcedefinition.apiextensions.k8s.io/prometheusrules.monitoring.coreos.com created
  customresourcedefinition.apiextensions.k8s.io/scrapeconfigs.monitoring.coreos.com created
  customresourcedefinition.apiextensions.k8s.io/servicemonitors.monitoring.coreos.com created
  customresourcedefinition.apiextensions.k8s.io/thanosrulers.monitoring.coreos.com created
  [root@master-1.k8s.freedom.org /data/argocd-manifests/_charts/kube-prometheus-stack/61.8.0/charts/crds/crds 14:45]# 3> 
  ```
- 特别说明二：`defaultRules.create=true`，部署时先创建`PrometheusRule`资源，这些资源供给`thanos`的`ruler`组件使用，在后续`thanos`篇章中会做解释说明。


### 配置alertmanager
- 配置文件`argocd-manifests/_charts/kube-prometheus-stack/61.8.0/values.yaml`，修改内容如下：
  ```yaml
  alertmanager:
    ingress:
      enabled: true
      ingressClassName: ingress-nginx-lan
      annotations:
        cert-manager.io/cluster-issuer: roywong-work-tls-cluster-issuer
        nginx.ingress.kubernetes.io/rewrite-target: /
        nginx.ingress.kubernetes.io/ssl-redirect: "true"
      hosts:
        - alertmanager.idc-ingress-nginx-lan.roywong.work
      paths:
       - /
      tls:
        - secretName: tls-certificate-secret-alertmanager
          hosts:
            - "alertmanager.idc-ingress-nginx-lan.roywong.work"
    alertmanagerSpec:
      image:
        repository: quay.io/prometheus/alertmanager
        tag: v0.27.0
      replicas: 3
      storage:
        volumeClaimTemplate:
          spec:
            storageClassName: infra
            accessModes: [ "ReadWriteOnce" ]
            resources:
              requests:
                storage: 1Gi
  ```


### 配置grafana
- 配置文件：`argocd-manifests/_charts/kube-prometheus-stack/61.8.0/values.yaml`，修改内容如下：
  ```yaml
  grafana:
    adminPassword: prom-operator    # 管理员admin默认密码
    ingress:
      enabled: true
      ingressClassName: ingress-nginx-lan
      annotations:
        cert-manager.io/cluster-issuer: roywong-work-tls-cluster-issuer
        nginx.ingress.kubernetes.io/rewrite-target: /
        nginx.ingress.kubernetes.io/ssl-redirect: "true"
      hosts:
        - "grafana.idc-ingress-nginx-lan.roywong.work"
      path: /
      tls:
        - secretName: tls-certificate-secret-grafana
          hosts:
            - "grafana.idc-ingress-nginx-lan.roywong.work"
    useStatefulSet: false           # grafana由statefulset模式改为deployment，归避grafana误增加副本，从而产生多个pvc。
    persistence:
      enabled: true
      type: pvc
      storageClassName: "infra"
      accessModes:
        - ReadWriteOnce
      size: 10Gi
      finalizers:
        - kubernetes.io/pvc-protection
  sidecar:
    datasources:
      url: http://thanos-query-frontend:9090/     # 数据源指向thanos-query-frontend地址。
  ```

- 配置文件：`argocd-manifests/_charts/kube-prometheus-stack/61.8.0/charts/grafana/values.yaml`，修改内容如下：
  ```yaml
  image:
    repository: docker.io/grafana/grafana
  initChownData:
    image:
      repository: docker.io/library/busybox
  sidecar:
    image:
      repository: quay.io/kiwigrid/k8s-sidecar
  ```


### 配置kube-state-metrics
- 配置文件`argocd-manifests/_charts/kube-prometheus-stack/61.8.0/charts/kube-state-metrics/values.yaml`，修改内容如下：
  ```yaml
  image:
    repository: registry.k8s.io/kube-state-metrics/kube-state-metrics
    tag: "v2.13.0"
  replicas: 3
  ```


### 配置prometheus-node-exporter
- 配置文件`argocd-manifests/_charts/kube-prometheus-stack/61.8.0/charts/prometheus-node-exporter/values.yaml`，修改内容如下：
  ```yaml
  image:
    repository: quay.io/prometheus/node-exporter
    tag: "v1.8.2"
  ```


### 配置prometheusOperator
- 配置文件`argocd-manifests/_charts/kube-prometheus-stack/61.8.0/values.yaml`，修改内容如下：
  ```yaml
  prometheusOperator:
    image:
      repository: quay.io/prometheus-operator/prometheus-operator
      tag: "v0.75.2"
    prometheusConfigReloader:
      image:
        repository: quay.io/prometheus-operator/prometheus-config-reloader
        tag: "v0.75.2"
    thanosImage:
      repository: quay.io/thanos/thanos
      tag: v0.36.0
  ```


### 配置prometheus
- 配置文件`argocd-manifests/_charts/kube-prometheus-stack/61.8.0/values.yaml`，修改内容如下：
  ```yaml
  prometheus:
    thanosService:
      enabled: true
    thanosServiceMonitor:
      enabled: true
    prometheusSpec:
      image:
        repository: quay.io/prometheus/prometheus
        tag: v2.54.0
      replicas: 3
      retention: 30d    # 启用了thanos后，此参数没有任何作用了，因为thanos默认以2小时为间隔将本地数据写向thanos。
      storageSpec:
        volumeClaimTemplate:
          spec:
            storageClassName: infra
            accessModes: ["ReadWriteOnce"]
            resources:
              requests:
                storage: 300Gi
      thanos:
        objectStorageConfig:
          secret:
            type: S3
            config:
              bucket: "kubernetes-prometheus"
              endpoint: "minio-s3.idc.roywong.work"
              access_key: "053ixvmeitBL45A6BxFo"
              secret_key: "igLOl7oPohS3mrHnIRkbujmkwAA6YYVVgoqA8mTt"
  ```


## 小结
- `crd`资源使用`kubectl create -f *.yaml`命令创建。
- 创建默认的`PrometheusRule`资源。
- 已配置`kube-prometheus-stack`核心组件，`alertmanager`，`grafana`，`prometheus`，除去`grafana`是单副本外，其他都是多副本。
- `alertmanager`，需要做持久化数据，其数据内容为"自身的控制状态"（如`silence`、`inhibition`、通知记录等）来保持行为一致性和避免重复告警。如果数据丢失，则会引起"告警广播风暴"。
- `grafana`，采用`deployment+pvc`替换`statefulset+storageclass`部署模式，这样有效避免产生多副本的`grafana`，从而造成资源浪费。
- `prometheus`各实例在后续运行过程中所存储的数据可能不相同，如果减少或增加副本数。