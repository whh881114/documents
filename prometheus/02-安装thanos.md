# 安装thanos


## 参考资料
- https://prometheus.io/
- https://thanos.io/
- https://github.com/prometheus-operator/kube-prometheus
- https://github.com/prometheus-community/helm-charts


## thanos
### 组件说明
- 英文
  ```
  - Sidecar: connects to Prometheus, reads its data for query and/or uploads it to cloud storage.
  - Store Gateway: serves metrics inside of a cloud storage bucket.
  - Compactor: compacts, downsamples and applies retention on the data stored in the cloud storage bucket.
  - Receiver: receives data from Prometheus’s remote write write-ahead log, exposes it, and/or uploads it to cloud storage.
  - Ruler/Rule: evaluates recording and alerting rules against data in Thanos for exposition and/or upload.
  - Querier/Query: implements Prometheus’s v1 API to aggregate data from the underlying components.
  - Query Frontend: implements Prometheus’s v1 API to proxy it to Querier while caching the response and optionally splitting it by queries per day.
  ```

- 中文
  ```
  Sidecar: 连接到Prometheus，读取其数据用于查询和/或上传到云存储。
  Store Gateway: 提供云存储桶中指标数据的服务。
  Compactor: 对存储在云存储桶中的数据进行压缩、降采样，并执行保留策略。
  Receiver: 接收来自Prometheus的远程写入预写日志（write-ahead log）数据，进行暴露和/或上传到云存储。
  Ruler/Rule: 对Thanos中的数据执行记录规则和告警规则的评估，用于暴露和/或上传。
  Querier/Query: 实现Prometheus的v1 API，用于聚合底层组件中的数据。
  Query Frontend: 实现Prometheus的v1 API，将请求代理到Querier，同时缓存响应，并可选地按天对查询进行拆分。
  ```


### 部署模式
- Deployment with Thanos Sidecar for Kubernetes  
  ![Thanos High Level Arch Diagram.png](images%2FThanos%20High%20Level%20Arch%20Diagram.png)
- Deployment via Receive in order to scale out or integrate with other remote write-compatible sources  
  ![Thanos High Level Arch Diagram with Recieve.png](images%2FThanos%20High%20Level%20Arch%20Diagram%20with%20Recieve.png)


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
    existingConfigmap: "thanos-ruler-rules"   # 需要先生成PrometheusRule资源的配置文件才行。
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
- 配置文件`argocd-manifests/_charts/kube-prometheus-stack/61.8.0/values.yaml`，其中参数`defaultRules.create=true`为`Prometheus`默认告警规则创建开关。
- 这些默认告警规则挺好的，想把这些规则迁移到`thanos`的`ruler`组件中使用，最终的数据位于`argocd-manifests/monitoring/thanos-ruler-rules`目录中。
  ```shell
  #!/bin/bash
  
  rules=$(kubectl -n monitoring get prometheusrule | grep -v '^NAME' | awk '{print $1}')
  
  for rule in $rules
  do
      kubectl -n monitoring get prometheusrule $rule -o json > tmp.json
      jq '.spec.groups' tmp.json > ${rule}.json
  done
  ```
- 增加告警规则后，需要调整`thanos`各组件的`resources`值，避免`OOM`故障。


## 小结
- 部署好了`thanos-sidecar`架构服务。
- 原始的`PrometheusRules`资源已迁移到`thanos-ruler`组件中。为什么要将`prometheus`中的`rule`迁移到`thanos-ruler`组件中，原因如下。
  - 原始的`PrometheusRelues`是作用于`prometheus`的，而`prometheus`是多实例，理论上来说`prometheus`各实例的数据是一样的，那么就会产生重复告警。  
    此外，如果各实例上的数据不一样，那么告警出来的内容也不会准确。
  - 现在部署了`thanos-sidecar`将`prometheus`本地数据周期性写入`cos`中，默认值为2小时，那么有告警规则查询周期大于2小时的，则可能永远发不出告警。
- `thanos-ruler`组件功能如下。
  - 规则执行器，定期运行`recording/alerting rules`。
  - `Store API`提供者，让`Query`能查询到`ruler`本地生成但未上传的`block`。
  - `Shipper`上传者，定期将本地`TSDB`的`block`上传至对象存储（如`COS`）。