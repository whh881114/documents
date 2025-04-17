# 安装argo-rollouts


## 参考资料
- https://argoproj.github.io/argo-rollouts/
- https://github.com/argoproj/argo-helm/releases


## 前言
- 配置文件修改起来不难，慢慢修改即可。

- 理解各个服务功能。
  ```
  rollouts:      Argo Rollouts is a Kubernetes controller and set of CRDs which provide advanced deployment 
                 capabilities such as blue-green, canary, canary analysis, experimentation, 
                 and progressive delivery features to Kubernetes.
                       
  dashboard :    The Argo Rollouts Kubectl plugin can serve a local UI Dashboard to visualize your Rollouts.  
              
  notifications: Argo Rollouts provides notifications powered by the Notifications Engine. Controller 
                 administrators can leverage flexible systems of triggers and templates to configure 
                 notifications requested by the end users.                 
  ```

## 结果
```shell
ok: [10.255.1.12] => {
    "msg": [
        [
            "customresourcedefinition.apiextensions.k8s.io \"analysisruns.argoproj.io\" deleted",
            "customresourcedefinition.apiextensions.k8s.io \"analysistemplates.argoproj.io\" deleted",
            "customresourcedefinition.apiextensions.k8s.io \"clusteranalysistemplates.argoproj.io\" deleted",
            "customresourcedefinition.apiextensions.k8s.io \"experiments.argoproj.io\" deleted",
            "customresourcedefinition.apiextensions.k8s.io \"rollouts.argoproj.io\" deleted",
            "NAME: argo-rollouts",
            "LAST DEPLOYED: Thu Aug 29 15:57:58 2024",
            "NAMESPACE: argo-rollouts",
            "STATUS: deployed",
            "REVISION: 1",
            "TEST SUITE: None"
        ],
        [
            "Error: uninstall: Release not loaded: argo-rollouts: release: not found"
        ]
    ]
}
```

```shell
[root@master-1.k8s.freedom.org ~ 16:00]# 1> kubectl get pods -o wide -n argo-rollouts
NAME                                       READY   STATUS    RESTARTS   AGE     IP              NODE                       NOMINATED NODE   READINESS GATES
argo-rollouts-d8977db6f-p7m2n              1/1     Running   0          2m25s   10.251.5.46     worker-3.k8s.freedom.org   <none>           <none>
argo-rollouts-d8977db6f-rfm8n              1/1     Running   0          2m25s   10.251.3.26     worker-1.k8s.freedom.org   <none>           <none>
argo-rollouts-d8977db6f-v75t8              1/1     Running   0          2m25s   10.251.4.152    worker-2.k8s.freedom.org   <none>           <none>
argo-rollouts-dashboard-7f58bf9575-59bxj   1/1     Running   0          2m25s   10.251.5.190    worker-3.k8s.freedom.org   <none>           <none>
argo-rollouts-dashboard-7f58bf9575-frpkn   1/1     Running   0          2m25s   10.251.3.171    worker-1.k8s.freedom.org   <none>           <none>
argo-rollouts-dashboard-7f58bf9575-vf2v2   1/1     Running   0          2m25s   10.251.10.205   worker-5.k8s.freedom.org   <none>           <none>
[root@master-1.k8s.freedom.org ~ 16:00]# 2> 
```