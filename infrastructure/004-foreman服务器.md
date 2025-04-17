# foreman服务器


## 更新日志
- 2024/05/18更新日志
  - 私有云环境下，`foreman`服务只提供`RHSM（Red Hat Subscription Manager）`服务功能，也就是提供`yum源订阅`服务功能。  
    `discovery/ansible`插件就不安装了，原因在于`discovery`安装部署有点复杂，时间成本过高，毕竟在`vcenter`管理平台下使用  
    模板部署虚拟机效率更高；另外，`ansible`自动化处理则使用静态`playbooks`方式处理即可。
  - `CentOS 7`将于`2024/06/30`结束生命周期，个人实验环境操作系统将使用`RockyLinux`，官方地址：https://rockylinux.org。
  - 此次使用`Rocky-9.4-x86_64`部署系统，`foreman`使用`3.11`版本，`katello`使用`4.13`版本。


## 前言
- 主机清单
  ```
  central-server.freedom.org / 10.255.1.11
  ```

- 需添加域名`central-server.freedom.org`的`dns正反向解析`，旧日志报错如下。
  ```
  2024-05-18 23:07:35 [NOTICE] [root] Loading installer configuration. This will take some time.
  2024-05-18 23:07:41 [NOTICE] [root] Running installer with log based terminal output at level NOTICE.
  2024-05-18 23:07:41 [NOTICE] [root] Use -l to set the terminal output log level to ERROR, WARN, NOTICE, INFO, or DEBUG. See --full-help for definitions.
  Unable to resolve forward DNS for foreman.freedom.org
  ```


## foreman配置细节
- 官方文档
  - https://theforeman.org/manuals/3.11/index.html
  - https://docs.theforeman.org/3.11/Installing_Server/index-katello.html

- 安装命令
    ```shell
    dnf clean all
    dnf install https://yum.theforeman.org/releases/3.11/el9/x86_64/foreman-release.rpm
    dnf install https://yum.theforeman.org/katello/4.13/katello/el9/x86_64/katello-repos-latest.rpm
    dnf install https://yum.puppet.com/puppet7-release-el-9.noarch.rpm

    dnf install foreman-installer-katello

    foreman-installer --scenario katello
    ```

- 安装过程
  ```
  [root@central-server.freedom.org ~ 16:49]# 31> foreman-installer --scenario katello
  2024-07-24 16:49:07 [NOTICE] [root] Loading installer configuration. This will take some time.
  2024-07-24 16:49:13 [NOTICE] [root] Running installer with log based terminal output at level NOTICE.
  2024-07-24 16:49:13 [NOTICE] [root] Use -l to set the terminal output log level to ERROR, WARN, NOTICE, INFO, or DEBUG. See --full-help for definitions.
  2024-07-24 16:49:21 [NOTICE] [configure] Starting system configuration.
  2024-07-24 16:51:05 [NOTICE] [configure] 250 configuration steps out of 1343 steps complete.
  2024-07-24 16:53:25 [NOTICE] [configure] 500 configuration steps out of 1345 steps complete.
  2024-07-24 16:57:40 [NOTICE] [configure] 750 configuration steps out of 1350 steps complete.
  2024-07-24 16:57:58 [NOTICE] [configure] 1000 configuration steps out of 1373 steps complete.
  2024-07-24 17:06:02 [NOTICE] [configure] 1250 configuration steps out of 1373 steps complete.
  2024-07-24 17:09:35 [NOTICE] [configure] System configuration has finished.
  Executing: foreman-rake upgrade:run
  =============================================
  Upgrade Step 1/11: katello:correct_repositories. This may take a long while.
  =============================================
  Upgrade Step 2/11: katello:clean_backend_objects. This may take a long while.
  0 orphaned consumer id(s) found in candlepin.
  Candlepin orphaned consumers: []
  =============================================
  Upgrade Step 3/11: katello:upgrades:4.0:remove_ostree_puppet_content. =============================================
  Upgrade Step 4/11: katello:upgrades:4.1:sync_noarch_content. =============================================
  Upgrade Step 5/11: katello:upgrades:4.1:fix_invalid_pools. I, [2024-07-24T17:10:10.319998 #56746]  INFO -- : Corrected 0 invalid pools
  I, [2024-07-24T17:10:10.320162 #56746]  INFO -- : Removed 0 orphaned pools
  =============================================
  Upgrade Step 6/11: katello:upgrades:4.1:reupdate_content_import_export_perms. =============================================
  Upgrade Step 7/11: katello:upgrades:4.2:remove_checksum_values. =============================================
  Upgrade Step 8/11: katello:upgrades:4.4:publish_import_cvvs. =============================================
  Upgrade Step 9/11: katello:upgrades:4.8:fix_incorrect_providers. Fixing incorrect providers
  Fixed 0 incorrect providers
  Cleaning Candlepin orphaned custom products for organization Default Organization
  Deleted 0 Candlepin orphaned custom products for organization Default Organization
  =============================================
  Upgrade Step 10/11: katello:upgrades:4.8:regenerate_imported_repository_metadata. No repositories found for regeneration.
  =============================================
  Upgrade Step 11/11: katello:upgrades:4.12:update_content_access_modes. Checking Candlepin status
  Setting content access modes
  ----------------------------------------
  Set content access mode for 0 organizations
  ----------------------------------------
    Success!
    * Foreman is running at https://central-server.freedom.org
        Initial credentials are admin / b22WrbZiuEjCAufN
      * To install an additional Foreman proxy on separate machine continue by running:
  
          foreman-proxy-certs-generate --foreman-proxy-fqdn "$FOREMAN_PROXY" --certs-tar "/root/$FOREMAN_PROXY-certs.tar.gz"
      * Foreman Proxy is running at https://central-server.freedom.org:9090
  
  The full log is at /var/log/foreman-installer/katello.log
  [root@central-server.freedom.org ~ 17:10]# 32> 
  ```


## katello配置细节
- 文档地址：https://docs.theforeman.org/nightly/Content_Management_Guide/index-foreman-el.html。
- 将katello存放rpm包目录移至大容量目录下。
  ```shell
  mv /var/lib/pulp /data
  ln -s /data/pulp /var/lib/
  ```


## RockyLinux9源列表
```
appstream   https://mirrors.aliyun.com/rockylinux/9/AppStream/x86_64/os
baseos      https://mirrors.aliyun.com/rockylinux/9/BaseOS/x86_64/os
extras      https://mirrors.aliyun.com/rockylinux/9/extras/x86_64/os
crb         https://mirrors.aliyun.com/rockylinux/9/CRB/x86_64/os
epel        https://mirrors.aliyun.com/epel/9/Everything/x86_64
zabbix      https://mirrors.aliyun.com/zabbix/zabbix/6.0/rhel/9/x86_64
docker-ce   https://mirrors.aliyun.com/docker-ce/linux/rhel/9/x86_64/stable
kubernetes  https://mirrors.aliyun.com/kubernetes-new/core/stable/v1.30/rpm/
```


## 订阅RockyLinux9本地源
- 3.11版本和之前安装的3.3版本有差异，使用以下命令订阅并注册主机，其中token无过期时间。
  ```shell
  set -o pipefail && curl -sS --insecure 'https://foreman.freedom.org/register?activation_keys=Rocky-Linux-9-x86_64&force=true&location_id=2&organization_id=1&update_packages=false' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo0LCJpYXQiOjE3MTYwODMzMTcsImp0aSI6ImU4MTBjMTE2ZmJiNGRjYWI5Yzc0MjU3MDU3MWFhMGQ0YTZlOTZhY2U0MWM2YzU1ZjZkNjk5MTU5NzJiZGMwYjIiLCJzY29wZSI6InJlZ2lzdHJhdGlvbiNnbG9iYWwgcmVnaXN0cmF0aW9uI2hvc3QifQ.8hXP9U67TjQeduIvRFaZ5PReKZHezDQguF5EcHuR7Zs' | bash
  ```