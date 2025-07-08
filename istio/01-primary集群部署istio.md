# 安装istio


## 部署架构
- 在一个kubernetes集群中部署istio。

- istio和kubernetes集群存在兼容性：https://istio.io/latest/docs/releases/supported-releases/#support-status-of-istio-releases


## 安装（argocd）
- 下载`istio`对应的`helm`包，针对`sidecar`模式，只需要下载`base`，`istiod`和`gateway`，修改相对应的`values.yaml`文件即可，   
  其目录为`argocd-manifests/_charts/istio/1.23.0`。

- 部署逻辑位置文件`argocd-manifests/_indexes/indexCharts.jsonnet`中，然后在`argocd`管理界面上同步对应的`app`即可。

- 同步完成后，[需要手动安装Gateway API CRDs](https://istio.io/latest/docs/setup/getting-started/#gateway-api) ，命令如下：
  ```shell
  kubectl get crd gateways.gateway.networking.k8s.io &> /dev/null || \
  { kubectl kustomize "github.com/kubernetes-sigs/gateway-api/config/crd?ref=v1.2.1" | kubectl apply -f -; }
  ```
