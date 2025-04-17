# kubernetes-v1.30.3集群部署


## 前提
- 已搭建私有镜像仓库`harbor.idc.roywong.top`，并且配置https访问方式。
- 集群中涉及到的`主机名`和`apiserver域名`需要完成DNS解析。
  ```
  master-1.k8s.freedom.org   /  10.255.1.12
  master-2.k8s.freedom.org   /  10.255.1.22
  master-3.k8s.freedom.org   /  10.255.1.23
  worker-1.k8s.freedom.org   /  10.255.1.24
  worker-2.k8s.freedom.org   /  10.255.1.25
  worker-3.k8s.freedom.org   /  10.255.1.26
  worker-4.k8s.freedom.org   /  10.255.1.27
  worker-5.k8s.freedom.org   /  10.255.1.28
  worker-6.k8s.freedom.org   /  10.255.1.29
  apiserver.k8s.freedom.org  /  10.255.1.122
  ```


## 部署构建
- 高可用文档：https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/high-availability/

- **在当前的架构下，用haproxy模拟负载均衡，它是单点故障。如果要追求完美，就需要再加一台haproxy主机，再配合keepalived搭建高可用。**
  **如果IDC机房的基础设施建设完善，那么处理的方法是，会在硬件负载均衡上创建转发，而硬件负载均衡肯定是高可用状态。**

- 架构图：
  ![kubeadm-ha-topology-stacked-etcd.svg](images/kubeadm-ha-topology-stacked-etcd.svg)


## 正文
- kubernetes-v1.30.3部署和之前的版本有点区别，比如说之前我部署的最新v1.22.2，现在此版本不使用docker引擎了，所以说区别还是存在的。

- 提前准备镜像，安装集群时指定镜像仓库即可。另外，获取镜像版本可以使用以下命令：`kubeadm config images list`，另外，也可以在后面
  指定版本号：`kubeadm config images list --kubernetes-version v1.30.3`。
  ```
  registry.k8s.io/kube-apiserver:v1.30.3
  registry.k8s.io/kube-controller-manager:v1.30.3
  registry.k8s.io/kube-scheduler:v1.30.3
  registry.k8s.io/kube-proxy:v1.30.3
  registry.k8s.io/coredns/coredns:v1.11.1
  registry.k8s.io/pause:3.9
  registry.k8s.io/etcd:3.5.12-0
  ```
  
- kubernetes-v1.30.3使用containerd了，先生成默认配置文件：`containerd config default > /etc/containerd/config.toml`，
  然后需要修改以下内容，其中**sandbox_image**是重点修改对象，否则会去访问官方源镜像，从而导致安装失败。
  ```
  [plugins."io.containerd.grpc.v1.cri"]
  sandbox_image = "harbor.idc.roywong.top/registry.k8s.io/pause:3.9"
  
  [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc]
    [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
      SystemdCgroup = true
  ```

- 安装高可用k8s集群（多master节点）前提，先建一个负载均衡地址，然后做TCP转到到后端的k8s master节点上的6443端口， 
  此时我使用的是`apiserver.k8s.freedom.org:6443`，使用haproxy完成转发。

- 在master-1.k8s.freedom.org上执行初始化命令，这里指定镜像仓库了，所以各k8s集群中不用手动去pull镜像，然后再打tag。
  ```shell
  kubeadm init \
           --image-repository=harbor.idc.roywong.top/registry.k8s.io \
           --kubernetes-version=v1.30.3 \
           --pod-network-cidr=10.251.0.0/16 \
           --service-cidr=10.252.0.0/16 \
           --control-plane-endpoint="apiserver.k8s.freedom.org:6443" \
           --upload-certs
  mkdir -p $HOME/.kube 
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config  
  sudo chown $(id -u):$(id -g) $HOME/.kube/config
  ```
    
- 添加master节点，在其他master节点执行如下命令。
    ```shell
    kubeadm join apiserver.k8s.freedom.org:6443 \
                 --token nxar03.twaeblpfqd2da7np \
                 --discovery-token-ca-cert-hash sha256:77b78a283161048bcafeef79c65b58e3de668a6773ebb456134dc4079992754b \
                 --control-plane \
                 --certificate-key 5b8776558fc4d503c2007e8f0459988855244625e577cd0e0081bb2ba45e73fe
    ```

- 添加worker节点，在worker节点执行如下命令。
    ```shell
    kubeadm join apiserver.k8s.freedom.org:6443 \
                 --token nxar03.twaeblpfqd2da7np \
                 --discovery-token-ca-cert-hash sha256:77b78a283161048bcafeef79c65b58e3de668a6773ebb456134dc4079992754b
    ```

- 集群节点初始状态为`NotReady`状态，这是因为没有安装网络插件，此插件安装过程在ansible角色中完成，不在这里说明了。
    ```shell
    [root@master-1.k8s.freedom.org ~ 09:34]# 1> kubectl get nodes -o wide
    NAME                       STATUS   ROLES           AGE    VERSION   INTERNAL-IP   EXTERNAL-IP   OS-IMAGE                      KERNEL-VERSION                CONTAINER-RUNTIME
    master-1.k8s.freedom.org   Ready    control-plane   104m   v1.30.3   10.255.1.12   <none>        Rocky Linux 9.3 (Blue Onyx)   5.14.0-362.8.1.el9_3.x86_64   containerd://1.7.19
    master-2.k8s.freedom.org   Ready    control-plane   100m   v1.30.3   10.255.1.22   <none>        Rocky Linux 9.3 (Blue Onyx)   5.14.0-362.8.1.el9_3.x86_64   containerd://1.7.19
    master-3.k8s.freedom.org   Ready    control-plane   100m   v1.30.3   10.255.1.23   <none>        Rocky Linux 9.3 (Blue Onyx)   5.14.0-362.8.1.el9_3.x86_64   containerd://1.7.19
    worker-1.k8s.freedom.org   Ready    <none>          98m    v1.30.3   10.255.1.24   <none>        Rocky Linux 9.3 (Blue Onyx)   5.14.0-362.8.1.el9_3.x86_64   containerd://1.7.19
    worker-2.k8s.freedom.org   Ready    <none>          98m    v1.30.3   10.255.1.25   <none>        Rocky Linux 9.3 (Blue Onyx)   5.14.0-362.8.1.el9_3.x86_64   containerd://1.7.19
    worker-3.k8s.freedom.org   Ready    <none>          98m    v1.30.3   10.255.1.26   <none>        Rocky Linux 9.3 (Blue Onyx)   5.14.0-362.8.1.el9_3.x86_64   containerd://1.7.19
    [root@master-1.k8s.freedom.org ~ 09:35]# 2> 
    ```

## 部署后碰到的一些问题
- 集群所有主机重启后，其集群无法启动。
  - 排查过程如下：
    - 容器kube-apiserver一直重启，除去kube-apiserver容器不断重启外，还有其他容器在重启。查看kube-apiserver报错日志，
      提示连接不上etcd。
      ```json
      {"level":"warn","ts":"2024-07-31T02:04:12.73454Z","caller":"rafthttp/probing_status.go:68","msg":"prober detected unhealthy status","round-tripper-name":"ROUND_TRIPPER_RAFT_MESSAGE","remote-peer-id":"574495eef1b06886","rtt":"0s","error":"dial tcp 10.255.1.22:2380: connect: connection refused"}
      ```
    - 查看etcd日志，提示当前etcd数据与其他节点不一致，导致不断重启。
      ```shell
      {"level":"fatal","ts":"2024-07-31T02:38:02.899481Z","caller":"etcdmain/etcd.go:204","msg":"discovery failed","error":"error validating peerURLs {ClusterID:9e6395fd91cf74a7 Members:[&{ID:27a71e7180313263 RaftAttributes:{PeerURLs:[https://10.255.1.12:2380] IsLearner:false} Attributes:{Name:master-1.k8s.freedom.org ClientURLs:[https://10.255.1.12:2379]}}] RemovedMemberIDs:[]}: member count is unequal","stacktrace":"go.etcd.io/etcd/server/v3/etcdmain.startEtcdOrProxyV2\n\tgo.etcd.io/etcd/server/v3/etcdmain/etcd.go:204\ngo.etcd.io/etcd/server/v3/etcdmain.Main\n\tgo.etcd.io/etcd/server/v3/etcdmain/main.go:40\nmain.main\n\tgo.etcd.io/etcd/server/v3/main.go:31\nruntime.main\n\truntime/proc.go:250"}
      ```
    - 处理方法：
      - 重置集群。
      - 在各个master节点，清除etcd本地数据，`rm -rf /var/lib/ectd`。
      - 再次部署集群。

- 添加新的worker节点，但是原来的kubeadm join忘记了，需要重新生成，参考资料：https://blog.csdn.net/liudongyang123/article/details/123731019。
  - 添加worker节点，在master主机上执行`kubeadm token create --print-join-command`。
  - 添加master节点，在master主机上执行`kubeadm token create --print-join-command`，然后在生成的结果上再添加`--control-plane`。
    如果需要证书，则使用`kubeadm init phase upload-certs --upload-certs`，然后在生成的结果上再添加`--certificate-key <key>`即可。