# cert-manager签发cloudflare厂商证书


## 注意
- 在`github`上创建私有仓库`git@github.com:whh881114/argocd-manifests-secrets.git`，只用于存放密钥，密码等敏感信息，单独用此仓库来部署密钥。


## ACME签发证书流程
```
- 选择签发证书方式，我选择dns，这次使用cloudflare厂商域名系统，cert-manager默认支持。

- 创建一个密钥，存放在cloudflare的个人用户的token，此时token中存放的密钥是明文。

- 创建ClusterIssuer: 定义证书颁发机构（CA），例如"Let's Encrypt"。创建ClusterIssuer后，会生成一个密钥文件，其名称对应为spec.acme.privateKeySecretRef.name。

- 创建Certificate: 定义要申请的证书，包括DNS名称、密钥使用等信息。 创建Certificate后，会生成一个密钥文件，存放着证书内容，其名称对应为spec.secretName。

- Cert-Manager自动申请证书: Cert-Manager会根据Issuer和Certificate的配置，向CA申请证书。

- 证书存储: 签发的证书会被存储在Kubernetes Secret中。
```

## cloudflare签发流程yaml文件
```yaml
---
apiVersion: v1
kind: Secret
metadata:
  name: cloudflare-api-token-secret
  namespace: cert-manager
type: Opaque
stringData:
  api-token: "<个人API-TOKEN>"  # https://cert-manager.io/docs/configuration/acme/dns01/cloudflare/#api-tokens

---
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: roywong-work-tls-cluster-issuer
  namespace: cert-manager
spec:
  acme:
    email: whh881114@gmail.com
    privateKeySecretRef:
      name: roywong-work-tls-key
    server: 'https://acme-v02.api.letsencrypt.org/directory'
    solvers:
      - dns01:
          cloudflare:
            apiTokenSecretRef:
              key: api-token
              name: cloudflare-api-token-secret
        selector:
          dnsZones:
            - '*.idc-ingress-nginx-lan.roywong.work'
            - '*.idc-ingress-nginx-wan.roywong.work'
            - '*.idc-istio-gateway-lan.roywong.work'
            - '*.idc-istio-gateway-wan.roywong.work'

---
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: roywong-work-tls-certificate
  namespace: cert-manager
spec:
  dnsNames:
    - '*.idc-ingress-nginx-lan.roywong.work'
    - '*.idc-ingress-nginx-wan.roywong.work'
    - '*.idc-istio-gateway-lan.roywong.work'
    - '*.idc-istio-gateway-wan.roywong.work'
  issuerRef:
    kind: ClusterIssuer
    name: roywong-work-tls-cluster-issuer
  secretName: roywong-work-tls-cert
```

## 创建指向nginx服务的ingress
```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: nginx
  name: nginx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - image: 'harbor.idc.roywong.work/docker.io/nginx:1.27.1'
          name: nginx
          ports:
            - containerPort: 80

---
apiVersion: v1
kind: Service
metadata:
  name: nginx
spec:
  ports:
    - port: 80
      protocol: TCP
      targetPort: 80
  selector:
    app: nginx
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    cert-manager.io/cluster-issuer: roywong-work-tls-cluster-issuer
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: 'true'
  name: nginx
spec:
  ingressClassName: ingress-nginx-lan
  rules:
    - host: www.idc-ingress-nginx-lan.roywong.work
      http:
        paths:
          - backend:
              service:
                name: nginx
                port:
                  number: 80
            path: /
            pathType: Prefix
  tls:
    - hosts:
        - '*.idc-ingress-nginx-lan.roywong.work'
        - '*.idc-ingress-nginx-wan.roywong.work'
        - '*.idc-istio-gateway-lan.roywong.work'
        - '*.idc-istio-gateway-wan.roywong.work'
      secretName: roywong-work-tls-cert
```

## 验证结果
```shell
# curl -vs http://www.idc-ingress-nginx-lan.roywong.work
*   Trying 10.255.3.104:80...
* Connected to www.idc-ingress-nginx-lan.roywong.work (10.255.3.104) port 80 (#0)
> GET / HTTP/1.1
> Host: www.idc-ingress-nginx-lan.roywong.work
> User-Agent: curl/7.76.1
> Accept: */*
> 
* Mark bundle as not supporting multiuse
< HTTP/1.1 308 Permanent Redirect
< Date: Thu, 20 Mar 2025 16:12:33 GMT
< Content-Type: text/html
< Content-Length: 164
< Connection: keep-alive
< Location: https://www.idc-ingress-nginx-lan.roywong.work
< 
<html>
<head><title>308 Permanent Redirect</title></head>
<body>
<center><h1>308 Permanent Redirect</h1></center>
<hr><center>nginx</center>
</body>
</html>
* Connection #0 to host www.idc-ingress-nginx-lan.roywong.work left intact


# curl -vs https://www.idc-ingress-nginx-lan.roywong.work
*   Trying 10.255.3.104:443...
* Connected to www.idc-ingress-nginx-lan.roywong.work (10.255.3.104) port 443 (#0)
* ALPN, offering h2
* ALPN, offering http/1.1
*  CAfile: /etc/pki/tls/certs/ca-bundle.crt
* TLSv1.0 (OUT), TLS header, Certificate Status (22):
* TLSv1.3 (OUT), TLS handshake, Client hello (1):
* TLSv1.2 (IN), TLS header, Certificate Status (22):
* TLSv1.3 (IN), TLS handshake, Server hello (2):
* TLSv1.2 (IN), TLS header, Finished (20):
* TLSv1.2 (IN), TLS header, Unknown (23):
* TLSv1.3 (IN), TLS handshake, Encrypted Extensions (8):
* TLSv1.2 (IN), TLS header, Unknown (23):
* TLSv1.3 (IN), TLS handshake, Certificate (11):
* TLSv1.2 (IN), TLS header, Unknown (23):
* TLSv1.3 (IN), TLS handshake, CERT verify (15):
* TLSv1.2 (IN), TLS header, Unknown (23):
* TLSv1.3 (IN), TLS handshake, Finished (20):
* TLSv1.2 (OUT), TLS header, Finished (20):
* TLSv1.3 (OUT), TLS change cipher, Change cipher spec (1):
* TLSv1.2 (OUT), TLS header, Unknown (23):
* TLSv1.3 (OUT), TLS handshake, Finished (20):
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384
* ALPN, server accepted to use h2
* Server certificate:
*  subject: CN=*.idc-ingress-nginx-lan.roywong.work
*  start date: Mar 20 15:07:09 2025 GMT
*  expire date: Jun 18 15:07:08 2025 GMT
*  subjectAltName: host "www.idc-ingress-nginx-lan.roywong.work" matched cert's "*.idc-ingress-nginx-lan.roywong.work"
*  issuer: C=US; O=Let's Encrypt; CN=R10
*  SSL certificate verify ok.
* Using HTTP2, server supports multi-use
* Connection state changed (HTTP/2 confirmed)
* Copying HTTP/2 data in stream buffer to connection buffer after upgrade: len=0
* TLSv1.2 (OUT), TLS header, Unknown (23):
* TLSv1.2 (OUT), TLS header, Unknown (23):
* TLSv1.2 (OUT), TLS header, Unknown (23):
* Using Stream ID: 1 (easy handle 0x56363cefc550)
* TLSv1.2 (OUT), TLS header, Unknown (23):
> GET / HTTP/2
> Host: www.idc-ingress-nginx-lan.roywong.work
> user-agent: curl/7.76.1
> accept: */*
> 
* TLSv1.2 (IN), TLS header, Unknown (23):
* TLSv1.3 (IN), TLS handshake, Newsession Ticket (4):
* TLSv1.2 (IN), TLS header, Unknown (23):
* TLSv1.3 (IN), TLS handshake, Newsession Ticket (4):
* old SSL session ID is stale, removing
* TLSv1.2 (IN), TLS header, Unknown (23):
* Connection state changed (MAX_CONCURRENT_STREAMS == 128)!
* TLSv1.2 (OUT), TLS header, Unknown (23):
* TLSv1.2 (IN), TLS header, Unknown (23):
* TLSv1.2 (IN), TLS header, Unknown (23):
< HTTP/2 200 
< date: Thu, 20 Mar 2025 16:12:39 GMT
< content-type: text/html
< content-length: 615
< last-modified: Mon, 12 Aug 2024 14:21:01 GMT
< etag: "66ba1a4d-267"
< accept-ranges: bytes
< strict-transport-security: max-age=31536000; includeSubDomains
< 
* TLSv1.2 (IN), TLS header, Unknown (23):
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
* TLSv1.2 (IN), TLS header, Unknown (23):
* Connection #0 to host www.idc-ingress-nginx-lan.roywong.work left intact
```

