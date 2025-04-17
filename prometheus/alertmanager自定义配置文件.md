# alertmanager自定义配置文件


## alertmanager默认配置文件
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


## 自定义alertmanager配置文件

### kubectl explain Alertmanager.spec.configSecret
```
  configSecret  <string>
    ConfigSecret is the name of a Kubernetes Secret in the same namespace as the
    Alertmanager object, which contains the configuration for this Alertmanager
    instance. If empty, it defaults to `alertmanager-<alertmanager-name>`.
    
    
    The Alertmanager configuration should be available under the
    `alertmanager.yaml` key. Additional keys from the original secret are
    copied to the generated secret and mounted into the
    `/etc/alertmanager/config` directory in the `alertmanager` container.
    
    
    If either the secret or the `alertmanager.yaml` key is missing, the
    operator provisions a minimal Alertmanager configuration with one empty
    receiver (effectively dropping alert notifications).
```

### helm chart alertmanager模板文件
```
{{- if .Values.alertmanager.alertmanagerSpec.configSecret }}
  configSecret: {{ .Values.alertmanager.alertmanagerSpec.configSecret }}
{{- end }}
```

### helm chart alertmanager配置块说明
```
    ## ConfigSecret is the name of a Kubernetes Secret in the same namespace as the Alertmanager object, which contains configuration for
    ## this Alertmanager instance. Defaults to 'alertmanager-' The secret is mounted into /etc/alertmanager/config.
    ##
    # configSecret:
```


## 结论
测试验证自定义配置文件，通过。具体实现，查看`argocd-manifests/monitoring/alertmanagerConfiguration/index.jsonnet`即可。
