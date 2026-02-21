# wsl

## 本地导入RockyLinux9容器镜像

### 拉取镜像，docker导出rootfs镜像
```
docker pull rockylinux:9.3.20231119
docker create --name rockylinux-9.3.20231119 rockylinux:9.3.20231119
docker export rockylinux-9.3.20231119 -o 'd:\wsl\images\rockylinux-9.3.20231119.tar'
```

### wsl导入镜像
```
wsl --import RockyLinux9 'D:\wsl\RockyLinux9' 'D:\wsl\images\rockylinux-9.3.20231119.tar' --version 2
wsl --import RockyLinux9-RocketMQ 'D:\wsl\RockyLinux9-RocketMQ' 'D:\wsl\images\rockylinux-9.3.20231119.tar' --version 2
```

### 启动容器
```
wsl -d RockyLinux9
wsl -d RockyLinux9-RocketMQ
```