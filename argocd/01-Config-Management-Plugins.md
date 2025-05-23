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
        argocd-cmp-helm:
          generate:
            command: [sh, -c]
            args:
              - |
                set -eux
                
                # 1. 直接拿 env var，Argo CD 会自动注入
                JSONNET_FILE="${PARAM_JSONNET_FILE:?jsonnet-file param not set}"
          
                # 2. 渲染 Jsonnet
                jsonnet "$JSONNET_FILE" | yq -P > values-rendered.yaml
          
                # 3. 调用 Helm 渲染
                helm template . --values values-rendered.yaml
        argocd-cmp-jsonnet:
          generate:
            command: [sh, -c]
            args:
              - |
                set -eux
                
                # 直接拿 env var，Argo CD 会自动注入
                JSONNET_FILE="${PARAM_JSONNET_FILE:?jsonnet-file param not set}"
                REGISTRY="${PARAM_REGISTRY:?registry param not set}"
                PROJECT="${PARAM_PROJECT:?project param not set}"
                IMAGE="${PARAM_IMAGE:?image param not set}"
                TAG="${PARAM_TAG:?tag param not set}"
                
                # 访问docker-image-tag.devops，获取到最新或者指定的tag。
                NEW_TAG=$(curl "docker-image-tag.devops?project=${PROJECT}&image=${IMAGE}&tag=${TAG}" | yq '.tag')
          
                # 渲染 Jsonnet，传入外部变量，需要导出结果到文件。
                jsonnet "$JSONNET_FILE" --ext-str image=${REGISTRY}/${PROJECT}/${IMAGE} --ext-str tag=${NEW_TAG} | yq -P > application.yaml
                
                # 查看jsonnet渲染文件。
                cat application.yaml
  ```
- 以上的配置最终会成一份`configamp`，内容如下，其中`argocd-cmp-helm.yaml`内容细节，[细节说明官方地址](https://argo-cd.readthedocs.io/en/stable/operator-manual/config-management-plugins/#installing-a-config-management-plugin)。
  ```yaml
  apiVersion: v1
  data:
    argocd-cmp-helm.yaml: "apiVersion: argoproj.io/v1alpha1\nkind: ConfigManagementPlugin\nmetadata:\n
      \ name: argocd-cmp-helm\nspec:\n  generate:\n    args:\n    - |\n      set -eux\n
      \ \n      # 1. 直接拿 env var，Argo CD 会自动注入\n      JSONNET_FILE=\"${PARAM_JSONNET_FILE:?jsonnet-file
      param not set}\"\n  \n      # 2. 渲染 Jsonnet\n      jsonnet \"$JSONNET_FILE\" |
      yq -P > values-rendered.yaml\n  \n      # 3. 调用 Helm 渲染\n      helm template .
      --values values-rendered.yaml\n    command:\n    - sh\n    - -c\n"
    argocd-cmp-jsonnet.yaml: "apiVersion: argoproj.io/v1alpha1\nkind: ConfigManagementPlugin\nmetadata:\n
      \ name: argocd-cmp-jsonnet\nspec:\n  generate:\n    args:\n    - |\n      set
      -eux\n  \n      # 直接拿 env var，Argo CD 会自动注入\n      JSONNET_FILE=\"${PARAM_JSONNET_FILE:?jsonnet-file
      param not set}\"\n      REGISTRY=\"${PARAM_REGISTRY:?registry param not set}\"\n
      \     PROJECT=\"${PARAM_PROJECT:?project param not set}\"\n      IMAGE=\"${PARAM_IMAGE:?image
      param not set}\"\n      TAG=\"${PARAM_TAG:?tag param not set}\"\n  \n      # 访问docker-image-tag.devops，获取到最新或者指定的tag。\n
      \     NEW_TAG=$(curl \"docker-image-tag.devops?project=${PROJECT}&image=${IMAGE}&tag=${TAG}\"
      | yq '.tag')\n  \n      # 渲染 Jsonnet，传入外部变量，需要导出结果到文件。\n      jsonnet \"$JSONNET_FILE\"
      --ext-str image=${REGISTRY}/${PROJECT}/${IMAGE} --ext-str tag=${NEW_TAG} | yq
      -P > application.yaml\n  \n      # 查看jsonnet渲染文件。\n      cat application.yaml\n
      \   command:\n    - sh\n    - -c\n"
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
    resourceVersion: "35307837"
    uid: b8c78fa8-33de-4a1f-a27a-0a8e888ac7a3
  ```

### 配置argocd-repo-server的sidecar
- 在`argo-cd`的`chart`中修改`values.yaml`，配置内容如下，[细节说明官方地址](https://argo-cd.readthedocs.io/en/stable/operator-manual/config-management-plugins/#installing-a-config-management-plugin)。
```yaml
repoServer:
  extraContainers:
    - name: argocd-cmp-helm
      image: harbor.idc.roywong.work/public/argocd-cmp:v2.12.1-2025-05-22-v1.0
      imagePullPolicy: Always
      command:
        - /var/run/argocd/argocd-cmp-server
      securityContext:
        runAsNonRoot: true
        runAsUser: 999
      volumeMounts:
        # 必需：用于和主 repo-server 共享请求/响应的 socket 文件
        - name: var-files
          mountPath: /var/run/argocd
        # 必需：插件运行时的“插件根目录”，可以是 emptyDir
        - name: plugins
          mountPath: /home/argocd/cmp-server/plugins
        # 必需：把你的 plugin 定义（jsonnet.yaml）挂载进来
        - name: argocd-cmp-cm-helm
          mountPath: /home/argocd/cmp-server/config/plugin.yaml
          subPath: argocd-cmp-helm.yaml
        # 必需：隔离 tmp，防止路径遍历攻击
        - name: cmp-tmp
          mountPath: /tmp
    - name: argocd-cmp-jsonnet
      image: harbor.idc.roywong.work/public/argocd-cmp:v2.12.1-2025-05-22-v1.0
      imagePullPolicy: Always
      command:
        - /var/run/argocd/argocd-cmp-server
      securityContext:
        runAsNonRoot: true
        runAsUser: 999
      volumeMounts:
        # 必需：用于和主 repo-server 共享请求/响应的 socket 文件
        - name: var-files
          mountPath: /var/run/argocd
        # 必需：插件运行时的“插件根目录”，可以是 emptyDir
        - name: plugins
          mountPath: /home/argocd/cmp-server/plugins
        # 必需：把你的 plugin 定义（jsonnet.yaml）挂载进来
        - name: argocd-cmp-cm-jsonnet
          mountPath: /home/argocd/cmp-server/config/plugin.yaml
          subPath: argocd-cmp-jsonnet.yaml
        # 必需：隔离 tmp，防止路径遍历攻击
        - name: cmp-tmp
          mountPath: /tmp
  volumes:
    - name: var-files
      emptyDir: {}
    - name: plugins
      emptyDir: {}
    - name: cmp-tmp
      emptyDir: {}
    - name: argocd-cmp-cm-helm
      configMap:
        name: argocd-cmp-cm
        items:
          - key: argocd-cmp-helm.yaml
            path: argocd-cmp-helm.yaml
    - name: argocd-cmp-cm-jsonnet
      configMap:
        name: argocd-cmp-cm
        items:
          - key: argocd-cmp-jsonnet.yaml
            path: argocd-cmp-jsonnet.yaml
```

- `sidecar`镜像打包是基于`argocd`官方镜像，然后加入必要的工具，`Dockerfile`位于`dockerfiles/argocd/dockerfile`

### application使用cmp
- 定义`application`资源文件。
  ```yaml
  apiVersion: argoproj.io/v1alpha1
  kind: Application
  metadata:
    name: argocd-cmp-helm-nginx-1
    namespace: argocd
  spec:
    destination:
      namespace: nginx
      server: https://kubernetes.default.svc
    project: default
    source:
      path: _charts/nginx/20.0.2
      plugin:
        name: argocd-cmp-helm
        parameters:
          - name: jsonnet-file
            string: argocd-cmp-helm-nginx-1.jsonnet
      repoURL: git@github.com:whh881114/argocd-manifests.git
      targetRevision: master
    syncPolicy:
      syncOptions:
        - CreateNamespace=true
  ```
  ```yaml
  apiVersion: argoproj.io/v1alpha1
  kind: Application
  metadata:
    name: argocd-cmp-jsonnet-nginx-1
    namespace: argocd
  spec:
    destination:
      namespace: nginx
      server: https://kubernetes.default.svc
    project: default
    source:
      path: argocd-cmp-jsonnet/nginx-1
      plugin:
        name: argocd-cmp-jsonnet
        parameters:
          - name: jsonnet-file
            string: index.jsonnet
          - name: registry
            string: harbor.idc.roywong.work
          - name: project
            string: docker.io
          - name: image
            string: library/nginx
          - name: tag
            string: latest
      repoURL: git@github.com:whh881114/argocd-manifests.git
      targetRevision: master
    syncPolicy:
      syncOptions:
        - CreateNamespace=true
  ```  

- 说明：
  - `argocd.argoproj.io/refresh: hard`，不一定要添加，如果使用`cmp`时，要是出现错误了，错误会缓存在`redis`，直到过期，所以刷新时，要执行`hard refresh`，`argocd`界面上的`refresh`有下拉菜单可以看到。  
    官网信息如下：
    - https://argo-cd.readthedocs.io/en/stable/operator-manual/config-management-plugins/#debugging-a-cmp
    - https://argo-cd.readthedocs.io/en/stable/faq/#how-can-i-force-argocd-to-re-sync-an-application
    - https://github.com/argoproj/argo-cd/blob/master/pkg/apis/application/v1alpha1/application_annotations.go
  - `parameters`中的`name`的值要和`cmp`配置文件中定义`JSONNET_FILE="${PARAM_JSONNET_FILE:?jsonnet-file param not set}"`要相呼应。  
    `string`值为`argocd-cmp-helm-nginx-1.jsonnet`，表示`jsonnet`文件位于`source.path`目录中。


## 结果
![argocd-cmp部署application结果.png](./images/argocd-cmp部署application结果.png)