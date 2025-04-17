# RocketMQ集群部署


## 正文
- 版本：4.9.7。

- 部署模式：`多namesrv，多broker，每个broker配置一个从broker。`

- 针对此部署模式思考：
  - RocketMQ的NameServer本身不存储任何数据。它的主要功能是提供服务发现和路由管理。具体来说，NameServer负责管理Broker的  
    注册信息，并维护Topic和Queue的路由信息。各个NameServer之间相互不通信。

  - 既然NameServer不存任何数据，那是否可以配置成无状态服务，是否可以水平扩展吗？

    - 否可以配置成无状态服务？
      - **答案是不可以。** 当前是多namesrv模式，那broker配置文件中要指定namesrv地址，其地址是namesrv的service地址，而service充当的
        是一个负载均衡角色，那么，broker注册信息时，就会发生一个现象，一会向namesrv1主机注册信息，一会向namesrv2主机注册信息。  
        任何一台namesrv主机没有完整的broker信息。当消费者连接namesrv的service地址时，就会发生请求的topic不存在的错误。
    
    - 是否可以水平扩展吗？
      - **答案是可以。** 因为namesrv此时有状态，并且多个namesrv分别是一个statefulset实例，并且每个statefulset只能启用一个副本，  
        如果namesrv要水平扩展，那么就是重新部署一个statefulset实例，另外，broker配置文件要修改namesrvAddr地址，消费者同时也要  
        修改namesrvAddr地址。
    
  - 每个broker配置文件不一样，所以broker也是一个statefulset实例，并且每个statefulset只能启用一个副本。

- 结论：针对上述的思考，每个namesrv/broker部署为一个statefulset实例，并且每个statefulset只能启用一个副本。broker向namesrv注册  
       地址都是service地址，所以要防止statefulset出现多副本的情况，所以要提前为每个实例创建pvc，访问模式为ReadWriteOnce。


## 测试
- 进入broker容器，执行以下测试命令。
  ```shell
  $ export NAMESRV_ADDR='default-namesrv-0:9876;default-namesrv-1:9876'
  
  $ sh tools.sh org.apache.rocketmq.example.quickstart.Producer
   SendResult [sendStatus=SEND_OK, msgId= ...
  
  $ sh tools.sh org.apache.rocketmq.example.quickstart.Consumer
   ConsumeMessageThread_%d Receive New Messages: [MessageExt...
  ```