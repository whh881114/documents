# RocketMQ控制台：This date have't data.


## 文档引用
- https://segmentfault.com/a/1190000021742186


## 正文
- 原因：容器中的时区和所在的地区时间不同导致。

- 解决方法：以docker运行举例，kubernetes自行修改即可。
  ```shell
    docker run \
           --name rocketmq-console -d \
           -e "JAVA_OPTS=-Drocketmq.namesrv.addr=172.16.0.249:9876;172.16.8.248:9876 -Dcom.rocketmq.sendMessageWithVIPChannel=false -Duser.timezone='Asia/Shanghai'" \
           -v /etc/localtime:/etc/localtime \
           -p 9999:8080 \
           -t styletang/rocketmq-console-ng:1.0.0
  ```