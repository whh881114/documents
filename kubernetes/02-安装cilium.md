# 安装cilium

### 前言
- https://docs.cilium.io
- https://github.com/cilium/cilium/releases


## 安装
- 操作系统使用的是RockyLinux-9.3，所以不需要更新内核版本，暂时没有涉及额外的配置。
  - https://docs.cilium.io/en/stable/gettingstarted/k8s-install-default/#install-cilium

- 初始化kubernetes集群时，指定了`--pod-network-cidr`，但是这个在只能算是声明，
  真正能决定pod运行的网段，是由cni插件来决定，所以安装cilium也要指定pod运行的网段，这个参数是`clusterPoolIPv4PodCIDRList`。
  - https://docs.cilium.io/en/stable/network/concepts/ipam/cluster-pool/#expanding-the-cluster-pool
  - https://docs.cilium.io/en/stable/network/kubernetes/ipam-cluster-pool/#crd-backed-by-cilium-cluster-pool-ipam

- 使用helm下载cilium，此外，可以下载相对应的release文件：https://github.com/cilium/cilium/archive/refs/tags/v1.16.1.tar.gz，
  chart内容位于压缩文件根目录下的`./install/kubernetes/cilium`，此次则使用helm下载包。
  ```shell
  helm repo add cilium https://helm.cilium.io/
  helm search repo cilium
  helm fetch cilium/cilium --version=1.16.1
  ```

- 目前对cilium的需求是先安装好插件，并且pod的ip在`clusterPoolIPv4PodCIDRList`定义的范围内即可，所以修改`values.yaml`文件内容就
  比较少，主要是修改镜像地址，然后就是`clusterPoolIPv4PodCIDRList`参数了。

- 安装日志。
  ```shell
  ok: [10.255.1.12] => {
      "msg": [
          [
              "NAME: cilium",
              "LAST DEPLOYED: Thu Aug 22 10:34:01 2024",
              "NAMESPACE: kube-system",
              "STATUS: deployed",
              "REVISION: 1",
              "TEST SUITE: None",
              "NOTES:",
              "You have successfully installed Cilium with Hubble.",
              "",
              "Your release version is 1.16.1.",
              "",
              "For any further help, visit https://docs.cilium.io/en/v1.16/gettinghelp"
          ],
          [
              "Error: uninstall: Release not loaded: cilium: release: not found"
          ]
      ]
  }
  ```

- 重新安装后，pod重启后，其地址应该属于之前定义的网段，这表示安装成功。
```shell
[root@master-1.k8s.freedom.org ~ 10:51]# 18> kubectl get pods -o wide -A | grep coredns
kube-system            coredns-55b9c9ffdf-l2pb8                                    1/1     Running   11 (8d ago)    19d     10.251.1.207    master-2.k8s.freedom.org   <none>           <none>
kube-system            coredns-55b9c9ffdf-vbcn2                                    1/1     Running   15 (8d ago)    21d     10.251.0.73     master-1.k8s.freedom.org   <none>           <none>
[root@master-1.k8s.freedom.org ~ 10:51]# 19> kubectl rollout restart deployment coredns -n kube-system
deployment.apps/coredns restarted
[root@master-1.k8s.freedom.org ~ 10:51]# 20> kubectl get pods -o wide -A | grep coredns
kube-system            coredns-55b9c9ffdf-l2pb8                                    1/1     Terminating   11 (8d ago)    19d     10.251.1.207    master-2.k8s.freedom.org   <none>           <none>
kube-system            coredns-55b9c9ffdf-vbcn2                                    1/1     Terminating   15 (8d ago)    21d     10.251.0.73     master-1.k8s.freedom.org   <none>           <none>
kube-system            coredns-798484667f-n5xhg                                    1/1     Running       0              3s      10.251.5.214    worker-3.k8s.freedom.org   <none>           <none>
kube-system            coredns-798484667f-zjv2c                                    1/1     Running       0              3s      10.251.3.233    worker-1.k8s.freedom.org   <none>           <none>
[root@master-1.k8s.freedom.org ~ 10:51]# 21> 
```
