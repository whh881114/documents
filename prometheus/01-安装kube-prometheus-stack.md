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


## prometheus
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
    useStatefulSet: true
    persistence:
      enabled: true
      type: sts
      storageClassName: "infra"
      accessModes:
        - ReadWriteOnce
      size: 20Gi
      finalizers:
        - kubernetes.io/pvc-protection
  sidecar:
    datasources:
      url: http://thanos-query-frontend:9090/
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


## thanos
### 组件说明
- Sidecar: connects to Prometheus, reads its data for query and/or uploads it to cloud storage.
- Store Gateway: serves metrics inside of a cloud storage bucket.
- Compactor: compacts, downsamples and applies retention on the data stored in the cloud storage bucket.
- Receiver: receives data from Prometheus’s remote write write-ahead log, exposes it, and/or uploads it to cloud storage.
- Ruler/Rule: evaluates recording and alerting rules against data in Thanos for exposition and/or upload.
- Querier/Query: implements Prometheus’s v1 API to aggregate data from the underlying components.
- Query Frontend: implements Prometheus’s v1 API to proxy it to Querier while caching the response and optionally splitting it by queries per day.


### sidecar部署模式
Thanos integrates with existing Prometheus servers as a sidecar process, which runs on the same machine or in the same pod as the Prometheus server.  
The purpose of Thanos Sidecar is to back up Prometheus’s data into an object storage bucket, and give other Thanos components access to the Prometheus metrics via a gRPC API.  
![Deployment with Thanos Sidecar for Kubernetes](images%2FThanos%20High%20Level%20Arch%20Diagram.png)


### 配置全局变量
- 配置文件`argocd-manifests/_charts/thanos/15.7.19/values.yaml`，所有的组件参数配置都在此文件中，修改内容如下：
  ```yaml
  global:
    imageRegistry: "harbor.idc.roywong.work"
    defaultStorageClass: "infra"
  kubeVersion: "1.30.3"
  image:
    repository: docker.io/bitnami/thanos
  objstoreConfig:
    type: s3
    config:
      bucket: "kubernetes-prometheus"
      endpoint: "minio-s3.idc.roywong.work"
      access_key: "053ixvmeitBL45A6BxFo"
      secret_key: "igLOl7oPohS3mrHnIRkbujmkwAA6YYVVgoqA8mTt"
  ```

### 配置query
  ```yaml
  query:
    # query中需要添加prometheus的thanos-sidecar的地址，这样grafana配置prometheus数据源时，就可以从cos和prometheus本地
    # 同时查数据了，然后将结果汇总给到终端用户。
    # 此外，添加过滤prometheus_replica标签（此标签随版本不同而不同），这样查询结果会汇总去重。
    extraFlags:
      - "--endpoint=dnssrv+_grpc._tcp.prometheus-kube-prometheus-thanos-discovery.monitoring.svc.cluster.local"
      - "--query.replica-label=prometheus_replica"
    replicaCount: 3
    resources:
      requests:
        cpu: 100m
        memory: 128Mi
      limits:
        cpu: 4
        memory: 8192Mi
  ```


### 配置queryFrontend
  ```yaml
  queryFrontend:
    replicaCount: 3
    # 启用ingress，可以像调用prometheus api一样调用queryFrontend，默认情况下只配置http即可。
    ingress:
      enabled: true
      hostname: "thanos-query-frontend.idc-ingress-nginx-lan.roywong.work"
      ingressClassName: "ingress-nginx-lan"
      annotations:
          cert-manager.io/cluster-issuer: roywong-work-tls-cluster-issuer
          nginx.ingress.kubernetes.io/rewrite-target: /
          nginx.ingress.kubernetes.io/ssl-redirect: "true"
      extraTls:
        - hosts:
            - "thanos-query-frontend.idc-ingress-nginx-lan.roywong.work"
          secretName: tls-certificate-secret-thanos-query-frontend
    resources:
      requests:
        cpu: 100m
        memory: 128Mi
      limits:
        cpu: 4
        memory: 8192Mi
  ```


### 配置compactor
  ```yaml
  compactor:
    enabled: true
    persistence:
      enabled: true
      storageClass: "infra"
      size: 100Gi
    resources:
      requests:
        cpu: 100m
        memory: 128Mi
      limits:
        cpu: 4
        memory: 8192Mi
  ```


### 配置storegateway
  ```yaml
  storegateway:
    enabled: true
    replicaCount: 3
    persistence:
      enabled: true
      storageClass: "infra"
      size: 100Gi
    persistentVolumeClaimRetentionPolicy:
      enabled: true
    resources:
      requests:
        cpu: 100m
        memory: 128Mi
      limits:
        cpu: 4
        memory: 8192Mi
  ```

### 配置ruler
  ```yaml
  ruler:
    enabled: true
    existingConfigmap: "thanos-ruler-rules"   # 需要配置PrometheusRule资源的配置文件
    alertmanagers:
      - http://prometheus-kube-prometheus-alertmanager:9093
    replicaCount: 3
    persistence:
      enabled: true
      storageClass: "infra"
      size: 20Gi
    persistentVolumeClaimRetentionPolicy:
      enabled: true
    resources:
      requests:
        cpu: 100m
        memory: 128Mi
      limits:
        cpu: 4
        memory: 8192Mi
  ```


## 迁移Prometheus默认规则
- 配置文件`argocd-manifests/_charts/kube-prometheus-stack/61.8.0/values.yaml`，其中参数`defaultRules.create=true`为  
  `Prometheus`默认告警规则创建开关。
- 这些默认告警规则挺好的，想把这些规则迁移到`thanos`的`ruler`组件中使用，最终的数据位于`argocd-manifests/thanos-ruler-rules/prometheusDefaultRules.libsonnet`文件中。
  ```shell
  #!/bin/bash
  
  > rules.json
  
  rules=$(kubectl -n monitoring get prometheusrule | grep -v '^NAME' | awk '{print $1}')
  
  for rule in $rules
  do
      kubectl -n monitoring get prometheusrule $rule -o json > tmp.json
      jq '.spec.groups' tmp.json >> rules.json
  done 
  ```
- 增加告警规则后，需要调整`thanos`各组件的`resources`值，避免`OOM`故障。