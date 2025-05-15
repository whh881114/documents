# Config Management Plugins


## 背景
- 这一段时间在私有云中搭建一些基础服务，比如说`kube-prometheus-stack`，`loki`，`cert-manager`之类的，这类的基础服务官方都有  
  相应的`helm chart`安装包。默认情况下，其`valueFiles`要求的是`yaml`格式，此文件只能硬编码，没有像`jsonnet`那样可以引用变量，  
  但又想继续沿用`jsonnet`逻辑，所幸官方可以让用户配置自定义插件来实现。
 
- 官方地址：https://argo-cd.readthedocs.io/en/stable/operator-manual/config-management-plugins/


## 配置过程

### 创建cmp配置文件


### 配置argocd-repo-server的sidecar


### application使用cmp


## 结果