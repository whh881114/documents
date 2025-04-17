# 安装nfs-subdir-external-provisioner


## 前言
- https://github.com/kubernetes-sigs/nfs-subdir-external-provisioner


## 部署
- 使用`argocd`部署`nfs-subdir-external-provisioner`。

- 下载`nfs-subdir-external-provisioner`对应的`helm`包，修改`values.yaml`中的相关值，其目录为`argocd-manifests/_charts/nfs-subdir-external-provisioner/4.0.18`。

- `values-infra.yaml`
  ```yaml
  replicaCount: 3
  
  image.repository: "harbor.freedom.org/registry.k8s.io/sig-storage/nfs-subdir-external-provisioner"
  image.tag: v4.0.2
  
  nfs.server: nfs.freedom.org
  nfs.path: /data1/kubernetes/infra
  nfs.volumeName: infra
  nfs.reclaimPolicy: Retain
  
  storageClass.name: infra
  storageClass.provisionerName: infra
  ```

- `values-mysql.yaml`
  ```yaml
  replicaCount: 3
  
  image.repository: "harbor.freedom.org/registry.k8s.io/sig-storage/nfs-subdir-external-provisioner"
  image.tag: v4.0.2
  
  nfs.server: nfs.freedom.org
  nfs.path: /data1/kubernetes/mysql
  nfs.volumeName: mysql
  nfs.reclaimPolicy: Retain
  
  storageClass.name: mysql
  storageClass.provisionerName: mysql
  ```

- `values-redis.yaml`
  ```yaml
  replicaCount: 3
  
  image.repository: "harbor.freedom.org/registry.k8s.io/sig-storage/nfs-subdir-external-provisioner"
  image.tag: v4.0.2
  
  nfs.server: nfs.freedom.org
  nfs.path: /data1/kubernetes/redis
  nfs.volumeName: redis
  nfs.reclaimPolicy: Retain
  
  storageClass.name: redis
  storageClass.provisionerName: redis
  ```

- 部署逻辑位置文件`argocd-manifests/_indexes/indexCharts.jsonnet`中，然后在`argocd`管理界面上同步对应的`app`即可。