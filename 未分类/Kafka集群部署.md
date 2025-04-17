# Kafka集群部署


## 正文
- kafka部署模式：`3个controller和3个broker。`

- kafka部署场景和rocketmq一样，每个实例部署为一个statefulset实例，并且每个statefulset只能启用一个副本。

- 图形界面使用`redpanda`。


## 测试
- 部署完后，根据官方的quickstart里操作topic命令进行验证即可，https://kafka.apache.org/quickstart。