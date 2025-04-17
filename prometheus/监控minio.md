# 监控minio


## 前言
- https://github.com/minio/minio/blob/master/docs/metrics/prometheus/README.md
- https://min.io/docs/minio/linux/operations/monitoring/metrics-and-alerts.html#minio-metrics-and-alerts


## 配置
- 生成minio资源监控代码片断，使用v3版本。
  ```
  Starting with MinIO Server RELEASE.2024-07-15T19-02-30Z and MinIO Client RELEASE.2024-07-11T18-01-28Z, 
  metrics version 3 replaces the deprecated metrics version 2.
  ```
  
  ```shell
  mc admin prometheus generate minio api           --api-version v3 --public
  mc admin prometheus generate minio system        --api-version v3 --public
  mc admin prometheus generate minio debug         --api-version v3 --public
  mc admin prometheus generate minio cluster       --api-version v3 --public
  mc admin prometheus generate minio ilm           --api-version v3 --public
  mc admin prometheus generate minio audit         --api-version v3 --public
  mc admin prometheus generate minio logger        --api-version v3 --public
  mc admin prometheus generate minio replication   --api-version v3 --public
  mc admin prometheus generate minio notification  --api-version v3 --public
  mc admin prometheus generate minio scanner       --api-version v3 --public
  ```

- 修改minio资源监控代码片断，`scheme`和`static_configs`。
  ```yaml
    scheme: http
    static_configs:
      - targets:
        - minio-1.freedom.org:9000
        - minio-2.freedom.org:9000
        - minio-3.freedom.org:9000
        - minio-4.freedom.org:9000
  ```

- minio服务配置文件`/etc/default/minio`中增加`MINIO_PROMETHEUS_AUTH_TYPE="public"`，禁用认证，然后重启服务。

- 将以下代码片断，添加到kube-prometheus-stack配置文件中的`prometheus.prometheusSpec.additionalScrapeConfigs`变量中。
  ```yaml
  - job_name: minio-job-api
    metrics_path: /minio/metrics/v3/api
    scheme: http
    static_configs:
      - targets:
          - minio-1.freedom.org:9000
          - minio-2.freedom.org:9000
          - minio-3.freedom.org:9000
          - minio-4.freedom.org:9000
  
  - job_name: minio-job-system
    metrics_path: /minio/metrics/v3/system
    scheme: http
    static_configs:
      - targets:
          - minio-1.freedom.org:9000
          - minio-2.freedom.org:9000
          - minio-3.freedom.org:9000
          - minio-4.freedom.org:9000
  
  - job_name: minio-job-debug
    metrics_path: /minio/metrics/v3/debug
    scheme: http
    static_configs:
      - targets:
          - minio-1.freedom.org:9000
          - minio-2.freedom.org:9000
          - minio-3.freedom.org:9000
          - minio-4.freedom.org:9000
  
  - job_name: minio-job-cluster
    metrics_path: /minio/metrics/v3/cluster
    scheme: http
    static_configs:
      - targets:
          - minio-1.freedom.org:9000
          - minio-2.freedom.org:9000
          - minio-3.freedom.org:9000
          - minio-4.freedom.org:9000
  
  - job_name: minio-job-ilm
    metrics_path: /minio/metrics/v3/ilm
    scheme: http
    static_configs:
      - targets:
          - minio-1.freedom.org:9000
          - minio-2.freedom.org:9000
          - minio-3.freedom.org:9000
          - minio-4.freedom.org:9000
  
  - job_name: minio-job-audit
    metrics_path: /minio/metrics/v3/audit
    scheme: http
    static_configs:
      - targets:
          - minio-1.freedom.org:9000
          - minio-2.freedom.org:9000
          - minio-3.freedom.org:9000
          - minio-4.freedom.org:9000
  
  - job_name: minio-job-logger
    metrics_path: /minio/metrics/v3/logger
    scheme: http
    static_configs:
      - targets:
          - minio-1.freedom.org:9000
          - minio-2.freedom.org:9000
          - minio-3.freedom.org:9000
          - minio-4.freedom.org:9000
  
  - job_name: minio-job-replication
    metrics_path: /minio/metrics/v3/replication
    scheme: http
    static_configs:
      - targets:
          - minio-1.freedom.org:9000
          - minio-2.freedom.org:9000
          - minio-3.freedom.org:9000
          - minio-4.freedom.org:9000
  
  - job_name: minio-job-notification
    metrics_path: /minio/metrics/v3/notification
    scheme: http
    static_configs:
      - targets:
          - minio-1.freedom.org:9000
          - minio-2.freedom.org:9000
          - minio-3.freedom.org:9000
          - minio-4.freedom.org:9000
  
  - job_name: minio-job-scanner
    metrics_path: /minio/metrics/v3/scanner
    scheme: http
    static_configs:
      - targets:
          - minio-1.freedom.org:9000
          - minio-2.freedom.org:9000
          - minio-3.freedom.org:9000
          - minio-4.freedom.org:9000
  ```

## TODO
- 在默认启用认证的情况下，按官方文档设置，但是访问时一直返回`403`。后续要完成这一项目标。


