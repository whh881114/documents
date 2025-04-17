# 安装ingress-nginx


### 前言
- https://github.com/kubernetes/ingress-nginx
- https://github.com/kubernetes/ingress-nginx/archive/refs/tags/helm-chart-4.11.1.tar.gz
- https://helm.sh/


## 部署
- 使用`argocd`部署`ingress-nginx`。

- 下载`ingress-nginx`对应的`helm`包，修改`values.yaml`中的相关值，其目录为`argocd-manifests/_charts/ingress-nginx/4.12.0`。
    - `values-lan.yaml`
    - `values-wan.yaml`

- 部署逻辑位置文件`argocd-manifests/_indexes/indexCharts.jsonnet`中，然后在`argocd`管理界面上同步对应的`app`即可。