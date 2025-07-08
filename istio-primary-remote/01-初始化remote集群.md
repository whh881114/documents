#

## bj
```shell
kubeadm init \
         --image-repository=harbor.idc.roywong.top/registry.k8s.io \
         --kubernetes-version=v1.30.3 \
         --pod-network-cidr=10.240.0.0/16 \
         --service-cidr=10.241.0.0/16 \
         --control-plane-endpoint="10.248.0.1:6443" \
         --upload-certs
mkdir -p $HOME/.kube 
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config  
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```


## sh
```shell
kubeadm init \
         --image-repository=harbor.idc.roywong.top/registry.k8s.io \
         --kubernetes-version=v1.30.3 \
         --pod-network-cidr=10.242.0.0/16 \
         --service-cidr=10.243.0.0/16 \
         --control-plane-endpoint="10.249.0.1:6443" \
         --upload-certs
mkdir -p $HOME/.kube 
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config  
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```


## gz
```shell
kubeadm init \
         --image-repository=harbor.idc.roywong.top/registry.k8s.io \
         --kubernetes-version=v1.30.3 \
         --pod-network-cidr=10.244.0.0/16 \
         --service-cidr=10.245.0.0/16 \
         --control-plane-endpoint="10.250.0.1:6443" \
         --upload-certs
mkdir -p $HOME/.kube 
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config  
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```