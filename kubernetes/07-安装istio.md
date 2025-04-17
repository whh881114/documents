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


## 安装（ansible方法，弃用）
- 使用helm添加repo，然后使用fetch下载包。
  ```shell
  helm repo add istio https://istio-release.storage.googleapis.com/charts
  
  helm search repo istio
  
  helm fetch istio/base --version=1.23.0
  helm fetch istio/istiod --version=1.23.0
  helm fetch istio/gateway --version=1.23.0
  
  helm install istio-base    istio/base    -n istio-system
  helm install istiod        istio/istiod  -n istio-system --wait
  helm install istio-ingress istio/gateway -n istio-ingress --wait
  ```

- 另一种下载helm chart包的方法，下载地址：https://gcsweb.istio.io/gcs/istio-release/releases/1.23.0/helm/。

- 修改参数在ansible包中，其中istio-ingress安装时，创建的服务类型修改为`NodePort`模式。



## 安装结果（ansible方法，弃用）
```shell
ok: [10.255.1.12] => {
    "msg": [
        [
            "NAME: istio-base",
            "LAST DEPLOYED: Thu Aug 29 16:14:40 2024",
            "NAMESPACE: istio-system",
            "STATUS: deployed",
            "REVISION: 1",
            "TEST SUITE: None",
            "NOTES:",
            "Istio base successfully installed!",
            "",
            "To learn more about the release, try:",
            "  $ helm status istio-base -n istio-system",
            "  $ helm get all istio-base -n istio-system"
        ],
        []
    ]
}
```

```shell
ok: [10.255.1.12] => {
    "msg": [
        [
            "NAME: istiod",
            "LAST DEPLOYED: Thu Aug 29 16:14:44 2024",
            "NAMESPACE: istio-system",
            "STATUS: deployed",
            "REVISION: 1",
            "TEST SUITE: None",
            "NOTES:",
            "\"istiod\" successfully installed!",
            "",
            "To learn more about the release, try:",
            "  $ helm status istiod -n istio-system",
            "  $ helm get all istiod -n istio-system",
            "",
            "Next steps:",
            "  * Deploy a Gateway: https://istio.io/latest/docs/setup/additional-setup/gateway/",
            "  * Try out our tasks to get started on common configurations:",
            "    * https://istio.io/latest/docs/tasks/traffic-management",
            "    * https://istio.io/latest/docs/tasks/security/",
            "    * https://istio.io/latest/docs/tasks/policy-enforcement/",
            "  * Review the list of actively supported releases, CVE publications and our hardening guide:",
            "    * https://istio.io/latest/docs/releases/supported-releases/",
            "    * https://istio.io/latest/news/security/",
            "    * https://istio.io/latest/docs/ops/best-practices/security/",
            "",
            "For further documentation see https://istio.io website"
        ],
        []
    ]
}
```

```shell
ok: [10.255.1.12] => {
    "msg": [
        [
            "NAME: istio-ingress",
            "LAST DEPLOYED: Thu Aug 29 16:14:47 2024",
            "NAMESPACE: istio-ingress",
            "STATUS: deployed",
            "REVISION: 1",
            "TEST SUITE: None",
            "NOTES:",
            "\"istio-ingress\" successfully installed!",
            "",
            "To learn more about the release, try:",
            "  $ helm status istio-ingress -n istio-ingress",
            "  $ helm get all istio-ingress -n istio-ingress",
            "",
            "Next steps:",
            "  * Deploy an HTTP Gateway: https://istio.io/latest/docs/tasks/traffic-management/ingress/ingress-control/",
            "  * Deploy an HTTPS Gateway: https://istio.io/latest/docs/tasks/traffic-management/ingress/secure-ingress/"
        ],
        []
    ]
}
```

```shell
[root@master-1.k8s.freedom.org ~ 16:14]# 11> kubectl get pods -o wide -n istio-system
NAME                      READY   STATUS    RESTARTS   AGE   IP             NODE                       NOMINATED NODE   READINESS GATES
istiod-7b6c6db79d-58wnl   1/1     Running   0          59s   10.251.5.204   worker-3.k8s.freedom.org   <none>           <none>
istiod-7b6c6db79d-7x6r4   1/1     Running   0          59s   10.251.4.120   worker-2.k8s.freedom.org   <none>           <none>
istiod-7b6c6db79d-hs6r8   1/1     Running   0          74s   10.251.3.55    worker-1.k8s.freedom.org   <none>           <none>
[root@master-1.k8s.freedom.org ~ 16:15]# 12> 
[root@master-1.k8s.freedom.org ~ 16:16]# 12> kubectl get pods -o wide -n istio-ingress
NAME                             READY   STATUS    RESTARTS   AGE   IP              NODE                       NOMINATED NODE   READINESS GATES
istio-ingress-586b49fb9c-k9kp9   1/1     Running   0          74s   10.251.10.162   worker-5.k8s.freedom.org   <none>           <none>
istio-ingress-586b49fb9c-phjrv   1/1     Running   0          74s   10.251.5.157    worker-3.k8s.freedom.org   <none>           <none>
istio-ingress-586b49fb9c-rw7vd   1/1     Running   0          89s   10.251.3.129    worker-1.k8s.freedom.org   <none>           <none>
[root@master-1.k8s.freedom.org ~ 16:16]# 13> 
```
