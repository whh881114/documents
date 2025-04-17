# 安装loki


## 前言
- https://grafana.com/docs/loki/latest/setup/install/helm/
- https://grafana.com/docs/loki/latest/setup/install/helm/concepts/
- https://grafana.com/docs/loki/latest/setup/install/helm/install-scalable/
- https://grafana.com/docs/loki/latest/get-started/deployment-modes/


## 部署
- 使用helm安装loki。

- 部署模式为`Simple Scalable`。
  ```
  SimpleScalable: Loki is deployed as 3 targets: read, write, and backend.
  Useful for medium installs easier to manage than distributed, up to a about 1TB/day.
  ```

- **部署思路：**
  ```
  先了解loki是什么，然后理解各组件功能，最后验证自己所期望达到的目标。我倾向于先看一些中文技术文档，心中有了一个大概理解后，再去看官方文档。
  搭建时，初期最重要的目标是：先让所有pod能正常运行。功能不全或者配置不当之类的一律放在后面调整。
  ```

- **第一阶段：**
  - 思路：
    - 先保证能正常安装即可。loki的参数配置文件values.yaml内容挺多的，所以想要一次性修改好配置文件，其实是挺有难度的，
      所以安装时报错，要放松心态，这些都是因为某此参数没有正确配置导致，所以需要仔细看报错内容，然后再修改。
      ```shell
      global.image.registry: harbor.idc.roywong.top
      loki.auth_enabled: false
        
      loki.storage.bucketNames.chunks: kubernetes-loki-chunks
      loki.storage.bucketNames.ruler: kubernetes-loki-ruler
      loki.storage.bucketNames.admin: kubernetes-loki-admin
      loki.storage.s3.endpoint: minio-s3.idc.roywong.top
      loki.storage.s3.secretAccessKey: uppflsfdavutdnjgkkDuc3pjggavdlhlnsxW9vbc
      loki.storage.s3.accessKeyId: zftKko84rusihbZotbmi
        
      loki.schemaConfig.configs:
        - from: 2024-04-01
          store: tsdb
          object_store: s3
          schema: v13
          index:
            prefix: index_
            period: 24h
      memcached.image.repository: harbor.idc.roywong.top/docker.io/memcached
      memcached.image.tag: 1.6.23-alpine
        
      write.persistence.size: 10Gi
      write.persistence.storageClass: infra
      write.affinity: {}
        
      read.affinity: {}
        
      backend.persistence.size: 10Gi
      backend.persistence.storageClass: infra
      backend.affinity: {}
        
      sidecar.image.repository: harbor.idc.roywong.top/docker.io/kiwigrid/k8s-sidecar
      sidecar.image.tag: 1.24.3
        
      memcachedExporter.image.repository: harbor.idc.roywong.top/docker.io/prom/memcached-exporter
      memcachedExporter.image.tag: v0.14.2
      ```

  - 验证：
    ```shell
    ok: [10.255.1.12] => {
        "msg": [
            [
                "namespace/grafana created",
                "NAME: loki",
                "LAST DEPLOYED: Thu Aug  1 11:59:29 2024",
                "NAMESPACE: grafana",
                "STATUS: deployed",
                "REVISION: 1",
                "NOTES:",
                "***********************************************************************",
                " Welcome to Grafana Loki",
                " Chart version: 6.7.3",
                " Chart Name: loki",
                " Loki version: 3.1.0",
                "***********************************************************************",
                "",
                "** Please be patient while the chart is being deployed **",
                "",
                "Tip:",
                "",
                "  Watch the deployment status using the command: kubectl get pods -w --namespace grafana",
                "",
                "If pods are taking too long to schedule make sure pod affinity can be fulfilled in the current cluster.",
                "",
                "***********************************************************************",
                "Installed components:",
                "***********************************************************************",
                "* gateway",
                "* read",
                "* write",
                "* backend",
                "",
                "",
                "***********************************************************************",
                "Sending logs to Loki",
                "***********************************************************************",
                "",
                "Loki has been configured with a gateway (nginx) to support reads and writes from a single component.",
                "",
                "You can send logs from inside the cluster using the cluster DNS:",
                "",
                "http://loki-gateway.grafana.svc.cluster.local/loki/api/v1/push",
                "",
                "You can test to send data from outside the cluster by port-forwarding the gateway to your local machine:",
                "",
                "  kubectl port-forward --namespace grafana svc/loki-gateway 3100:80 &",
                "",
                "And then using http://127.0.0.1:3100/loki/api/v1/push URL as shown below:",
                "",
                "```",
                "curl -H \"Content-Type: application/json\" -XPOST -s \"http://127.0.0.1:3100/loki/api/v1/push\"  \\",
                "--data-raw \"{\\\"streams\\\": [{\\\"stream\\\": {\\\"job\\\": \\\"test\\\"}, \\\"values\\\": [[\\\"$(date +%s)000000000\\\", \\\"fizzbuzz\\\"]]}]}\"",
                "```",
                "",
                "Then verify that Loki did received the data using the following command:",
                "",
                "```",
                "curl \"http://127.0.0.1:3100/loki/api/v1/query_range\" --data-urlencode 'query={job=\"test\"}' | jq .data.result",
                "```",
                "",
                "***********************************************************************",
                "Connecting Grafana to Loki",
                "***********************************************************************",
                "",
                "If Grafana operates within the cluster, you'll set up a new Loki datasource by utilizing the following URL:",
                "",
                "http://loki-gateway.grafana.svc.cluster.local/"
            ],
            []
        ]
    }
    ```

- **第二阶段：**
  - 思路：
    - 各组件正常运行后，可以先查看配置文件，明白各个配置段的意思，如果有配置不合理的，可以修改再重新部署。
      配置文件说明：https://grafana.com/docs/loki/v3.0.x/configure/。
    - loki的各个组件都是使用同一份配置文件，所以重点就是看`loki.config`配置内容，然后修改以下的参数。
      ```yaml
      auth_enabled: false
      chunk_store_config:
        chunk_cache_config:
          background:
            writeback_buffer: 500000
            writeback_goroutines: 1
            writeback_size_limit: 500MB
          default_validity: 0s
          memcached:
            batch_size: 4
            parallelism: 5
          memcached_client:
            addresses: dnssrvnoa+_memcached-client._tcp.loki-chunks-cache.grafana.svc
            consistent_hash: true
            max_idle_conns: 72
            timeout: 2000ms
      common:
        compactor_address: 'http://loki-backend:3100'
        path_prefix: /var/loki
        replication_factor: 3
        storage:
          s3:
            access_key_id: zftKko84rusihbZotbmi
            bucketnames: kubernetes-loki-chunks
            endpoint: minio-s3.idc.roywong.top
            s3forcepathstyle: true
            secret_access_key: uppflsfdavutdnjgkkDuc3pjggavdlhlnsxW9vbc
      frontend:
        scheduler_address: ""
        tail_proxy_url: ""
      frontend_worker:
        scheduler_address: ""
      index_gateway:
        mode: simple
      limits_config:
        max_cache_freshness_per_query: 10m
        query_timeout: 300s
        reject_old_samples: true
        reject_old_samples_max_age: 168h
        split_queries_by_interval: 15m
        volume_enabled: true
      memberlist:
        join_members:
        - loki-memberlist
      pattern_ingester:
        enabled: false
      query_range:
        align_queries_with_step: true
        cache_results: true
        results_cache:
          cache:
            background:
              writeback_buffer: 500000
              writeback_goroutines: 1
              writeback_size_limit: 500MB
            default_validity: 12h
            memcached_client:
              addresses: dnssrvnoa+_memcached-client._tcp.loki-results-cache.grafana.svc
              consistent_hash: true
              timeout: 500ms
              update_interval: 1m
      ruler:
        storage:
          s3:
            access_key_id: zftKko84rusihbZotbmi
            bucketnames: kubernetes-loki-ruler
            endpoint: minio-s3.idc.roywong.top
            s3forcepathstyle: true
            secret_access_key: uppflsfdavutdnjgkkDuc3pjggavdlhlnsxW9vbc
          type: s3
      runtime_config:
        file: /etc/loki/runtime-config/runtime-config.yaml
      schema_config:
        configs:
        - from: "2024-04-01"
          index:
            period: 24h
            prefix: index_
          object_store: s3
          schema: v13
          store: tsdb
      server:
        grpc_listen_port: 9095
        http_listen_port: 3100
        http_server_read_timeout: 600s
        http_server_write_timeout: 600s
      storage_config:
        boltdb_shipper:
          index_gateway_client:
            server_address: dns+loki-backend-headless.grafana.svc.cluster.local:9095
        hedging:
          at: 250ms
          max_per_second: 20
          up_to: 3
        tsdb_shipper:
          index_gateway_client:
            server_address: dns+loki-backend-headless.grafana.svc.cluster.local:9095
      tracing:
        enabled: false
      ```


## loki主要组件介绍
- 当前部署模式为`Simple Scalable`，所以应优先关注write/read/backend这三类pod，理解它们工作的机理。
  - write
    - Distributor
    - Ingester
  - read
    - Query frontend
    - Querier
  - backend
    - Compactor
    - Index Gateway
    - Query Scheduler
    - Ruler

- 功能组件介绍。 
  - Distributor: The distributor service is responsible for handling incoming push requests from clients. 
                 It’s the first step in the write path for log data.
  - Ingester:    The ingester service is responsible for persisting data and shipping it to long-term storage 
                 (Amazon Simple Storage Service, Google Cloud Storage, Azure Blob Storage, etc.) on the write path, 
                 and returning recently ingested, in-memory log data for queries on the read path.

  - Query Frontend: The query frontend is an optional service providing the querier’s API endpoints 
                    and can be used to accelerate the read path.
  - Querier:        The querier service is responsible for executing Log Query Language (LogQL) queries.

  - Compactor:       The compactor service is used by “shipper stores”, such as single store TSDB or single store 
                     BoltDB to compact the multiple index files produced by the ingesters and shipped to object storage 
                     into single index files per day and tenant. This makes index lookups more efficient.
  - Index Gateway:   The index gateway service is responsible for handling and serving metadata queries.
  - Query Scheduler: The query scheduler is an optional service providing more advanced queuing functionality than 
                     the query frontend.
  - Ruler:           The ruler service manages and evaluates rule and/or alert expressions provided in a rule 
                     configuration. 

- pod清单。
  - loki-chunks-cache： 此配置项归属于`chunk_store_config` -- The `chunk_store_config` block configures how chunks will 
                        be cached and how long to wait before saving them to the backing store.
  - loki-results-cache：此配置项归属于`query_range` -- The `query_range` block configures the query splitting and 
                        caching in the Loki query-frontend.
  - loki-gateway：nginx容器，反向代理loki-read/loki-write/loki-backend服务。
  - promtail：收集容器日志服务。    

  ```shell
  [root@master-1.k8s.freedom.org ~ 11:35]# 8> kubectl -n grafana get pods -o wide
  NAME                            READY   STATUS    RESTARTS         AGE   IP              NODE                       NOMINATED NODE   READINESS GATES
  loki-backend-0                  2/2     Running   0                76s   10.251.11.196   worker-6.k8s.freedom.org   <none>           <none>
  loki-backend-1                  2/2     Running   0                75s   10.251.4.148    worker-2.k8s.freedom.org   <none>           <none>
  loki-backend-2                  2/2     Running   0                76s   10.251.9.49     worker-4.k8s.freedom.org   <none>           <none>
  loki-chunks-cache-0             2/2     Running   0                76s   10.251.10.185   worker-5.k8s.freedom.org   <none>           <none>
  loki-gateway-77c4cd47f6-87b54   1/1     Running   0                76s   10.251.9.120    worker-4.k8s.freedom.org   <none>           <none>
  loki-gateway-77c4cd47f6-jtz49   1/1     Running   0                76s   10.251.11.93    worker-6.k8s.freedom.org   <none>           <none>
  loki-gateway-77c4cd47f6-v7r26   1/1     Running   0                76s   10.251.10.249   worker-5.k8s.freedom.org   <none>           <none>
  loki-read-6bcd4674cd-gvmvp      1/1     Running   0                76s   10.251.10.149   worker-5.k8s.freedom.org   <none>           <none>
  loki-read-6bcd4674cd-q667l      1/1     Running   0                76s   10.251.9.117    worker-4.k8s.freedom.org   <none>           <none>
  loki-read-6bcd4674cd-tcf5p      1/1     Running   0                76s   10.251.11.137   worker-6.k8s.freedom.org   <none>           <none>
  loki-results-cache-0            2/2     Running   0                76s   10.251.9.233    worker-4.k8s.freedom.org   <none>           <none>
  loki-write-0                    1/1     Running   0                76s   10.251.11.251   worker-6.k8s.freedom.org   <none>           <none>
  loki-write-1                    1/1     Running   0                75s   10.251.4.121    worker-2.k8s.freedom.org   <none>           <none>
  loki-write-2                    1/1     Running   0                75s   10.251.9.167    worker-4.k8s.freedom.org   <none>           <none>
  promtail-59b92                  1/1     Running   9 (5d10h ago)    8d    10.251.3.171    worker-1.k8s.freedom.org   <none>           <none>
  promtail-5x57h                  1/1     Running   12 (2d17h ago)   8d    10.251.0.117    master-1.k8s.freedom.org   <none>           <none>
  promtail-g9t5w                  1/1     Running   10 (2d17h ago)   8d    10.251.2.235    master-3.k8s.freedom.org   <none>           <none>
  promtail-gsx9k                  1/1     Running   0                19h   10.251.11.181   worker-6.k8s.freedom.org   <none>           <none>
  promtail-mm2sh                  1/1     Running   0                19h   10.251.10.96    worker-5.k8s.freedom.org   <none>           <none>
  promtail-pgklz                  1/1     Running   0                19h   10.251.9.193    worker-4.k8s.freedom.org   <none>           <none>
  promtail-vlht6                  1/1     Running   9 (5d10h ago)    8d    10.251.4.144    worker-2.k8s.freedom.org   <none>           <none>
  promtail-w6lx7                  1/1     Running   9 (5d10h ago)    8d    10.251.5.216    worker-3.k8s.freedom.org   <none>           <none>
  promtail-zmqtv                  1/1     Running   10 (2d17h ago)   8d    10.251.1.98     master-2.k8s.freedom.org   <none>           <none>
  [root@master-1.k8s.freedom.org ~ 11:35]# 9> 
  ```



## 验收标准
- 各个组件是否正常运行？
- 各个组件日志中是否存在报错？
- 日志是否存在minio中？