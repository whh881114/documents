# 无法识别monitoring之外的ServiceMonitor资源


## 资料
- https://blog.csdn.net/weixin_40548182/article/details/139297413


## 记录原因
**配置完redis-exporter的ServiceMonitor后，prometheus无法抓取监控数据。**


## 排查
- 最开始怀疑点是rbac权限问题，查看了prometheus使用的ServiceAccount为kube-prometheus-stack-operator，  
  顺藤摸瓜找到ClusterRoleBinding和ClusterRole信息，其ClusterRole权限已经对`monitoring.coreos.com`有所有权限。

- 排除rbac权限问题外，只能是一些annotation的配置了，但是不知道从哪里修改，此时用Chatgpt或Gemini无法解决问题，只能Google查询了，  
  如果只监控SeviceMonitor资源，只需设置`prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues`为`false`即可。  
  一次性全解决后顾之忧，设置的参数如下。
  ```yaml
  prometheus.prometheusSpec.ruleSelectorNilUsesHelmValues: false
  prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues: false
  prometheus.prometheusSpec.podMonitorSelectorNilUsesHelmValues: false
  prometheus.prometheusSpec.probeSelectorNilUsesHelmValues: false
  prometheus.prometheusSpec.scrapeConfigSelectorNilUsesHelmValues: false
  ```

## 配置说明
- 原文注释
  ```yaml
      ## If true, a nil or {} value for prometheus.prometheusSpec.serviceMonitorSelector will cause the
      ## prometheus resource to be created with selectors based on values in the helm deployment,
      ## which will also match the servicemonitors created
      ##
      serviceMonitorSelectorNilUsesHelmValues: false
  
      ## ServiceMonitors to be selected for target discovery.
      ## If {}, select all ServiceMonitors
      ##
      serviceMonitorSelector: {}
      ## Example which selects ServiceMonitors with label "prometheus" set to "somelabel"
      # serviceMonitorSelector:
      #   matchLabels:
      #     prometheus: somelabel
  ```

- 整段话的意思是，当serviceMonitorSelectorNilUsesHelmValues为真时，prometheus.prometheusSpec.serviceMonitorSelector为nil或空对象， 
  Prometheus的选择器将自动基于Helm配置来生成，并且这些选择器会匹配到已经存在的ServiceMonitors。

- 从上面的理解来看，我创建的ServiceMonitor资源需要配置相应的annotation才可以，这样通用性不强，所以禁用掉。serviceMonitorSelector  
  同时也是为空对象，这样就可以匹配到所有的ServiceMonitor资源。