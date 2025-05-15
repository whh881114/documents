# Config Management Plugins


## 背景
- 这一段时间在私有云中搭建一些基础服务，比如说`kube-prometheus-stack`，`loki`，`cert-manager`之类的，这类的基础服务官方都有  
  相应的`helm chart`安装包。默认情况下，其`valueFiles`要求的是`yaml`格式，此文件只能硬编码，没有像`jsonnet`那样可以引用变量，  
  但又想继续沿用`jsonnet`逻辑，所幸官方可以让用户配置自定义插件来实现。
 
- 官方地址：https://argo-cd.readthedocs.io/en/stable/operator-manual/config-management-plugins/


## 配置过程

### 创建cmp配置文件
- 在`argo-cd`的`chart`中修改`values.yaml`，配置内容如下。
  ```yaml
  configs:
    cmp:
      # -- Create the argocd-cmp-cm configmap
      create: true
  
      # -- Annotations to be added to argocd-cmp-cm configmap
      annotations: {}
  
      # -- Plugin yaml files to be added to argocd-cmp-cm
      plugins:
        argocd-cmp-jsonnet:   # 插件名称，在application中要指定。
          generate:
            command: [sh, -c]
            args:
              - |
                set -eux
                
                # 1. 直接拿 env var，Argo CD 会自动注入
                JSONNET_FILE="${PARAM_JSONNET_FILE:?jsonnet-file param not set}"
          
                # 2. 渲染 Jsonnet
                jsonnet "$JSONNET_FILE"| yq_linux_amd64 -P > values-rendered.yaml 
          
                # 3. 调用 Helm 渲染
                helm template . --values values-rendered.yaml
  ```
- 以上的配置最终会成一份`configamp`，内容如下，其中`argocd-cmp-jsonnet.yaml`内容细节介绍地址：https://argo-cd.readthedocs.io/en/stable/operator-manual/config-management-plugins/#installing-a-config-management-plugin
  ```yaml
  apiVersion: v1
  data:
    argocd-cmp-jsonnet.yaml: |
      apiVersion: argoproj.io/v1alpha1
      kind: ConfigManagementPlugin
      metadata:
        name: argocd-cmp-jsonnet
      spec:
        generate:
          args:
          - "set -eux\n\n# 1. 直接拿 env var，Argo CD 会自动注入\nJSONNET_FILE=\"${PARAM_JSONNET_FILE:?jsonnet-file
            param not set}\"\n\n# 2. 渲染 Jsonnet\njsonnet \"$JSONNET_FILE\"| yq_linux_amd64
            -P > values-rendered.yaml \n\n# 3. 调用 Helm 渲染\nhelm template . --values values-rendered.yaml\n"
          command:
          - sh
          - -c
  kind: ConfigMap
  metadata:
    annotations:
      meta.helm.sh/release-name: argocd
      meta.helm.sh/release-namespace: argocd
    creationTimestamp: "2025-05-14T15:28:20Z"
    labels:
      app.kubernetes.io/component: repo-server
      app.kubernetes.io/instance: argocd
      app.kubernetes.io/managed-by: Helm
      app.kubernetes.io/name: argocd-cmp-cm
      app.kubernetes.io/part-of: argocd
      app.kubernetes.io/version: v2.12.1
      helm.sh/chart: argo-cd-7.4.4
    name: argocd-cmp-cm
    namespace: argocd
    resourceVersion: "30835479"
    uid: b8c78fa8-33de-4a1f-a27a-0a8e888ac7a3
  ```

- 以上的配置最终会生成一个`configmap`


### 配置argocd-repo-server的sidecar


### application使用cmp


## 结果