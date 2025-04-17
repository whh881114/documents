# 安装kubernetes-dashboard

## 前言
- https://github.com/kubernetes/dashboard/releases/download/kubernetes-dashboard-7.5.0/kubernetes-dashboard-7.5.0.tgz

## 部署
- 部署方式由`ansible`转向`argocd`。

- 涉及修改的配置`argocd-manifests/_charts/kubernetes-dashboard/7.5.0/charts/metrics-server/values.yaml`。
  ```yaml
  image:
    repository: harbor.idc.roywong.work/registry.k8s.io/metrics-server/metrics-server
    tag: "0.7.1"
  replicas: 3
  resources:
    requests:
      cpu: 100m
      memory: 200Mi
    limits:
      cpu: 1
      memory: 1024Mi
  ```

- 涉及修改的配置`argocd-manifests/_charts/kubernetes-dashboard/7.5.0/values.yaml`。
  ```yaml
  app:
    ingress:
      enabled: true
      hosts:
        - kubernetes-dashboard.idc-ingress-nginx-lan.roywong.work
      ingressClassName: ingress-nginx-lan
      useDefaultIngressClass: false
      useDefaultAnnotations: true
      pathType: ImplementationSpecific
      path: /
      issuer:
        name: roywong-work-tls-cluster-issuer
        scope: cluster
      tls:
        enabled: true
        secretName: "roywong-work-tls-cert"
      labels: {}
      annotations: {}
  
  auth:
    role: auth
    image:
      repository: harbor.idc.roywong.work/docker.io/kubernetesui/dashboard-auth
      tag: 1.1.3
    scaling:
      replicas: 3
  
  api:
    role: api
    image:
      repository: harbor.idc.roywong.work/docker.io/kubernetesui/dashboard-api
      tag: 1.7.0
    scaling:
      replicas: 3
  
  web:
    role: web
    image:
      repository: harbor.idc.roywong.work/docker.io/kubernetesui/dashboard-web
      tag: 1.4.0
    scaling:
      replicas: 3
  
  metricsScraper:
    enabled: true
    role: metrics-scraper
    image:
      repository: harbor.idc.roywong.work/docker.io/kubernetesui/dashboard-metrics-scraper
      tag: 1.1.1
    scaling:
      replicas: 3
  
  metrics-server:
    enabled: true
    args:
      - --kubelet-preferred-address-types=InternalIP
      - --kubelet-insecure-tls
  
  kong:
    enabled: true
    replicaCount: 3
    image:
      repository: harbor.idc.roywong.work/docker.io/library/kong
      tag: "3.6"
    env:
      dns_order: LAST,A,CNAME,AAAA,SRV
      plugins: 'off'
      nginx_worker_processes: 1
    ingressController:
      enabled: false
    dblessConfig:
      configMap: kong-dbless-config
    proxy:
      type: ClusterIP
      http:
        enabled: false
  
  cert-manager:
    enabled: false
    installCRDs: false
  ```


## 访问kubernetes-dashboard
- 获取token，文档位于`argocd-manifests-secrets/kubernetes-dashboard`目录下。
  ```shell
  kubectl get secret cluster-admin  -n kubernetes-dashboard -o jsonpath={".data.token"} | base64 -d
  kubectl get secret cluster-viewer -n kubernetes-dashboard -o jsonpath={".data.token"} | base64 -d
  kubectl get secret system-ops     -n kubernetes-dashboard -o jsonpath={".data.token"} | base64 -d
  ```

- 权限的精细化配置，可以后续补上。