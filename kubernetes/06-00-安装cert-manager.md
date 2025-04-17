# 安装cert-manager

## 前言
- https://cert-manager.io/docs/
- https://github.com/cert-manager/cert-manager/releases
- https://artifacthub.io/packages/helm/cert-manager/cert-managers
- https://github.com/topics/cert-manager-webhook
- https://github.com/snowdrop/godaddy-webhook


## 部署
- 使用`argocd`部署`cert-manager`。

- 下载`cert-manager`对应的`helm`包，修改`values.yaml`中的相关值，其目录为`argocd-manifests/_charts/cert-manager/1.15.2`。

- 部署逻辑位置文件`argocd-manifests/_indexes/indexCharts.jsonnet`中，然后在`argocd`管理界面上同步对应的`app`即可。