# prometheus配置webhook告警


## 第一部分：prometheus配置alertmanager

### 默认配置内容
```yaml
alerting:
  alert_relabel_configs:
  - separator: ;
    regex: prometheus_replica
    replacement: $1
    action: labeldrop
  alertmanagers:
  - follow_redirects: true
    enable_http2: true
    scheme: http
    path_prefix: /
    timeout: 10s
    api_version: v2
    relabel_configs:
    - source_labels: [__meta_kubernetes_service_name]
      separator: ;
      regex: kube-prometheus-stack-alertmanager
      replacement: $1
      action: keep
    - source_labels: [__meta_kubernetes_endpoint_port_name]
      separator: ;
      regex: http-web
      replacement: $1
      action: keep
    kubernetes_sd_configs:
    - role: endpoints
      kubeconfig_file: ""
      follow_redirects: true
      enable_http2: true
      namespaces:
        own_namespace: false
        names:
        - monitoring
```

### alert_relabel_configs
```
alert_relabel_configs，是Prometheus中用于对发送给Alertmanager的告警信息进行重写和过滤的配置项。
它和relabel_configs类似，但专门用于处理告警（alerts）。通过这个配置项，你可以对告警的标签、接收方式等信息进行修改或过滤，
以便控制哪些告警最终会发送到Alertmanager，或者如何修改告警内容。
```

### alertmanagers
```
alertmanagers，是配置Alertmanager服务器参数，此时没有使用传统的static_configs配置，而是使用kubernetes_sd_configs和relabel_configs
结合，将重写出Alertmanager服务地址。
```


## prometheus配置告警规则

### 默认配置内容
```yaml
rule_files:
- /etc/prometheus/rules/prometheus-kube-prometheus-stack-prometheus-rulefiles-0/*.yaml
```

### 自定义告警规则
```
查看chart中的templates/prometheus/additionalPrometheusRules.yaml文件，可以看出，实质上是创建PrometheusRule资源，所以说，只需要
创建自定义的PrometheusRule资源，不需要修改chart默认配置文件values.yaml文件中的additionalPrometheusRules或additionalPrometheusRulesMap。

此外，PrometheusRule资源既可以定义告警规则（Alerting Rule），也可以定义记录规则（Recording Rule）。
alert: 用于定义告警规则，必须指定告警名称。如果使用了alert字段，表示该规则是告警规则。
record: 用于定义记录规则，表示计算的表达式结果将存储为一个新的时间序列。如果使用了record字段，表示该规则是记录规则。
```


## 第二部分：alertmanager配置告警通知渠道

### alertmanager默认配置文件
```yaml
global:
  resolve_timeout: 5m
  http_config:
    follow_redirects: true
    enable_http2: true
  smtp_hello: localhost
  smtp_require_tls: true
  pagerduty_url: https://events.pagerduty.com/v2/enqueue
  opsgenie_api_url: https://api.opsgenie.com/
  wechat_api_url: https://qyapi.weixin.qq.com/cgi-bin/
  victorops_api_url: https://alert.victorops.com/integrations/generic/20131114/alert/
  telegram_api_url: https://api.telegram.org
  webex_api_url: https://webexapis.com/v1/messages
route:
  receiver: "null"
  group_by:
  - namespace
  continue: false
  routes:
  - receiver: "null"
    matchers:
    - alertname="Watchdog"
    continue: false
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 12h
inhibit_rules:
- source_matchers:
  - severity="critical"
  target_matchers:
  - severity=~"warning|info"
  equal:
  - namespace
  - alertname
- source_matchers:
  - severity="warning"
  target_matchers:
  - severity="info"
  equal:
  - namespace
  - alertname
- source_matchers:
  - alertname="InfoInhibitor"
  target_matchers:
  - severity="info"
  equal:
  - namespace
- target_matchers:
  - alertname="InfoInhibitor"
receivers:
- name: "null"
templates:
- /etc/alertmanager/config/*.tmpl
```

### alertmanager发送数据格式
```shell
https://prometheus.io/docs/alerting/latest/notifications/
```

### alertmanager webhook
```
根据alertmanager发送数据格式，这个对于一些告警媒介来说，还需要做一些处理才行，如企业微信机器人。那现在的重点是，要写一个web接口来处理
alertmanger请求，思前想后，还是觉得用go写一个简单的web程序是最优解。

web程序的具体设计请查看`go-projects/qywxbot/README.md`文件。
```

### 自定义alertmanager配置文件
```yaml
配置以下参数，将默认配置文件中的各大项，全部拆分成独立的secret文件。
alertmanager.alertmanagerSpec.useExistingSecret = true
alertmanager.alertmanagerSpec.secrets = ['global', 'route', 'inhibit', 'receivers']
```