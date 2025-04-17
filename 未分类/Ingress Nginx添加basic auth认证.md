# Ingress Nginx添加basic auth认证


## 文档引用
- https://www.ywcsb.vip/blog/139.html


## 正文
- 使用`htpasswd`配置用户名和密码：`htpasswd -c <authfile> <admin>`。

- 目前使用jsonnet编写kubernetes的manifests文件，所以将生成的用户名和密码文件内容使用std.toString()转换成字符串，  
  之后，再使用std.base64()进行封装。

- 具体参考`argocd-manifests/_templates/rocketmq`目录下`basicAuth.libsonnet`和`basicAuthIndex.libsonnet`，  
  另外，还有密码文件`argocd-manifests/_templates/rocketmq/baiscAuth/default`。

- 最后，在ingress配置annotation，增加以下示例内容即可，参考文件`argocd-manifests/_templates/rocketmq/ingress.libsonnet`。
  ```yaml
  'nginx.ingress.kubernetes.io/auth-type': 'basic',
  'nginx.ingress.kubernetes.io/auth-secret': 'baisc-auth',
  'nginx.ingress.kubernetes.io/auth-realm': 'Authentication Required',
  ```