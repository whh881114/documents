# 安装jenkins


## 参考资料
- https://support.huaweicloud.com/bestpractice-cce/cce_bestpractice_0066.html


## 架构介绍
| 部署模式         | Master     | Agent     | 优缺点分析                                                                                                                         |
|:-------------|:-----------|:----------|:------------------------------------------------------------------------------------------------------------------------------|
| 单Master      | 虚拟机        | -         | 优点：本地化构建，操作简单。<br>缺点：任务管理和执行都在同一台虚拟机上，安全风险较高。                                                                                 |
| 单Master      | 容器         | -         | 优点：利用K8s容器调度机制，拥有一定的自愈能力。<br>缺点：任务管理和执行没有分离，安全风险问题仍未解决。                                                                       |
| Master加Agent | 虚拟机        | 虚拟机       | 优点：任务管理和执行分离，降低了一定的安全风险。<br>缺点：只能固定Agent，无法进行资源调度，资源利用率低，且环境维护成本高。                                                            |
| Master加Agent | 虚拟机        | 容器（K8s集群） | 优点：容器化的Agent可以选择固定Agent，也可以通过K8s实现动态Agent，动态Agent的方式资源利用率高。并且可以根据调度策略均匀分配任务，后期也比较容易维护。<br>缺点：Jenkins的Master存在小概率的宕机风险，恢复成本较高。 |
| Master加Agent | 容器（K8s集群）  | 容器（K8s集群） | 优点：容器化的Agent可以选择固定Agent，也可以通过K8s实现动态Agent，资源利用率高。且Master具有自愈能力，维护成本低。Agent可以选择和Master共集群，也可以分集群。<br>缺点：系统复杂程度高，环境搭建较困难。       |


## 架构选型
- `Master+Agent`架构，部署在`kubernetes`集群中。  
  ![jenkins分布式架构.png](./images/jenkins分布式架构.png)


## 部署细节
- 使用`argocd`部署`jenkins`。

- 下载`jenkins`对应的`helm`包，修改`values.yaml`中的相关值，其目录为`argocd-manifests/_charts/jenkins/5.8.33`。


## 修改配置文件
- 配置文件：`argocd-manifests/_charts/jenkins/5.8.33/values.yaml`。

- 配置`controller`。
  ```yaml
  controller:
    # -- Used for label app.kubernetes.io/component
    componentName: "jenkins-controller"
    image:
      registry: "harbor.idc.roywong.work"
      repository: "docker.io/jenkins/jenkins"
      tag: 2.505-jdk21
      tagLabel: 2.505-jdk21
      pullPolicy: "IfNotPresent"
  
    # controller节点不负责构建，所以numExecutors要保持为0。
    # -- Set Number of executors
    numExecutors: 0
  
    # -- Sets the executor mode of the Jenkins node. Possible values are "NORMAL" or "EXCLUSIVE"
    executorMode: "NORMAL"
  
    # admin的密码不配置，打开界面时，直接登录，然后再配置admin密码。
    # When enabling LDAP or another non-Jenkins identity source, the built-in admin account will no longer exist.
    # If you disable the non-Jenkins identity store and instead use the Jenkins internal one,
    # you should revert controller.admin.username to your preferred admin user:
    admin:
      # -- Admin username created as a secret if `controller.admin.createSecret` is true
      username: "admin"
      # -- Admin password created as a secret if `controller.admin.createSecret` is true
      # @default -- <random password>
      password:
  
      # -- The key in the existing admin secret containing the username
      userKey:
      # -- The key in the existing admin secret containing the password
      passwordKey:
  
      # The default configuration uses this secret to configure an admin user
      # If you don't need that user or use a different security realm, then you can disable it
      # -- Create secret for admin user
      createSecret: false
  
      # -- The name of an existing secret containing the admin credentials
      existingSecret: ""
  
    # -- Resource allocation (Requests and Limits)
    resources:
      requests:
        cpu: "4000m"
        memory: "8192Mi"
      limits:
        cpu: "4000m"
        memory: "8192Mi"

    # 加快插件安装，启动时插件检查。
    containerEnv:
      - name: HTTP_PROXY
        value: http://10.255.2.162:8001
      - name: HTTPS_PROXY
        value: http://10.255.2.162:8001
      - name: NO_PROXY
        value: 'localhost,127.0.0.1,10.251.0.0/16,10.252.0.0/16,*.svc,*.svc.cluster.local,kubernetes.default.svc'
  
    # 采用controller+agent模式时，agentListenerEnabled需开启。
    # -- Create Agent listener service
    agentListenerEnabled: true
    # -- Listening port for agents
    agentListenerPort: 50000
  
    # 风是涉及到插件安装，需要在installPlugins中定义。
    # Plugins will be installed during Jenkins controller start
    # -- List of Jenkins plugins to install. If you don't want to install plugins, set it to `false`
    installPlugins:
      - kubernetes:4324.vfec199a_33512
      - workflow-aggregator:608.v67378e9d3db_1
      - git:5.7.0
      - configuration-as-code:1953.v148f87d74b_1e
      - parameterized-trigger:859.vb_e3907a_07a_16
  
    # If set to false, Jenkins will download the minimum required version of all dependencies.
    # -- Download the minimum required version or latest version of all dependencies
    installLatestPlugins: true
  
    # JCasC必须要开启，要不然controller节点功能不全。
    # Below is the implementation of Jenkins Configuration as Code. Add a key under configScripts for each configuration area,
    # where each corresponds to a plugin or section of the UI. Each key (prior to | character) is just a label, and can be any value.
    # Keys are only used to give the section a meaningful name. The only restriction is they may only contain RFC 1123 \ DNS label
    # characters: lowercase letters, numbers, and hyphens. The keys become the name of a configuration yaml file on the controller in
    # /var/jenkins_home/casc_configs (by default) and will be processed by the Configuration as Code Plugin. The lines after each |
    # become the content of the configuration yaml file. The first line after this is a JCasC root element, e.g., jenkins, credentials,
    # etc. Best reference is https://<jenkins_url>/configuration-as-code/reference. The example below creates a welcome message:
    JCasC:
      # -- Enables default Jenkins configuration via configuration as code plugin
      defaultConfig: true
  
      # If true, the init container deletes all the plugin config files and Jenkins Config as Code overwrites any existing configuration
      # -- Whether Jenkins Config as Code should overwrite any existing configuration
      overwriteConfiguration: false
      # -- Remote URLs for configuration files.
      configUrls: []
      # - https://acme.org/jenkins.yaml
      # -- List of Jenkins Config as Code scripts
      configScripts: {}
      #  welcome-message: |
      #    jenkins:
      #      systemMessage: Welcome to our CI\CD server. This Jenkins is configured and managed 'as code'.
  
      # Allows adding to the top-level security JCasC section. For legacy purposes, by default, the chart includes apiToken configurations
      # -- Jenkins Config as Code security-section
      security:
        apiToken:
          creationOfLegacyTokenEnabled: false
          tokenGenerationOnCreationEnabled: false
          usageStatisticsEnabled: true
  
      # Ignored if securityRealm is defined in controller.JCasC.configScripts
      # -- Jenkins Config as Code Security Realm-section
      securityRealm: |-
        local:
          allowsSignup: false
          enableCaptcha: false
          users:
          - id: "${chart-admin-username}"
            name: "Jenkins Admin"
            password: "${chart-admin-password}"
  
      # Ignored if authorizationStrategy is defined in controller.JCasC.configScripts
      # -- Jenkins Config as Code Authorization Strategy-section
      authorizationStrategy: |-
        loggedInUsersCanDoAnything:
          allowAnonymousRead: false
  
      # -- Annotations for the JCasC ConfigMap
      configMapAnnotations: {}
  
    # 配置jenkins JCasC auto-reload
    sidecars:
      configAutoReload:
        # If enabled: true, Jenkins Configuration as Code will be reloaded on-the-fly without a reboot.
        # If false or not-specified, JCasC changes will cause a reboot and will only be applied at the subsequent start-up.
        # Auto-reload uses the http://<jenkins_url>/reload-configuration-as-code endpoint to reapply config when changes to
        # the configScripts are detected.
        # -- Enables Jenkins Config as Code auto-reload
        enabled: true
        image:
          # -- Registry for the image that triggers the reload
          registry: harbor.idc.roywong.work
          # -- Repository of the image that triggers the reload
          repository: docker.io/kiwigrid/k8s-sidecar
          # -- Tag for the image that triggers the reload
          tag: 1.30.3
        imagePullPolicy: IfNotPresent
  
    # 配置ingress，证书由cert-manager进行签发。
    ingress:
      # -- Enables ingress
      enabled: true
  
      # Override for the default paths that map requests to the backend
      # -- Override for the default Ingress paths
      paths: []
      # - backend:
      #     serviceName: ssl-redirect
      #     servicePort: use-annotation
      # - backend:
      #     serviceName: >-
      #       {{ template "jenkins.fullname" . }}
      #     # Don't use string here, use only integer value!
      #     servicePort: 8080
  
      # For Kubernetes v1.14+, use 'networking.k8s.io/v1beta1'
      # For Kubernetes v1.19+, use 'networking.k8s.io/v1'
      # -- Ingress API version
      apiVersion: "networking.k8s.io/v1"
      # -- Ingress labels
      labels: {}
      # -- Ingress annotations
      annotations:
        nginx.ingress.kubernetes.io/rewrite-target: /
        nginx.ingress.kubernetes.io/ssl-redirect: "true"
        cert-manager.io/cluster-issuer: roywong-work-tls-cluster-issuer
        # kubernetes.io/ingress.class: nginx
        # kubernetes.io/tls-acme: "true"
      # For Kubernetes >= 1.18 you should specify the ingress-controller via the field ingressClassName
      # See https://kubernetes.io/blog/2020/04/02/improvements-to-the-ingress-api-in-kubernetes-1.18/#specifying-the-class-of-an-ingress
      ingressClassName: ingress-nginx-lan
  
      # Set this path to jenkinsUriPrefix above or use annotations to rewrite path
      # -- Ingress path
      path: /
  
      # configures the hostname e.g. jenkins.example.com
      # -- Ingress hostname
      hostName: jenkins.idc-ingress-nginx-lan.roywong.work
      # -- Hostname to serve assets from
      resourceRootUrl:
      # -- Ingress TLS configuration
      tls:
        - secretName: tls-certificate-secret-jenkins
          hosts:
            - jenkins.idc-ingress-nginx-lan.roywong.work
  ```

- 配置`agent`。
  ```yaml
  agent:
    # -- Enable Kubernetes plugin jnlp-agent podTemplate
    enabled: true
    
    image:
      repository: "harbor.idc.roywong.work/docker.io/jenkins/inbound-agent"
      tag: "3301.v4363ddcca_4e7-3"
      
    imagePullSecretName: registry-idc-library
    
    resources:
      requests:
        cpu: '100m'
        memory: '128Mi'
      limits:
        cpu: '4'
        memory: '8Gi'
  
    # You may want to change this to true while testing a new image
    # -- Always pull agent container image before build
    alwaysPullImage: true
  
    # 需要持久化jenkins的workspace，所有的agent都共用这个PVC，NFS存储类可以提供RWX访问模式。
    # You can define the workspaceVolume that you want to mount for this container
    # Allowed types are: DynamicPVC, EmptyDir, EphemeralVolume, HostPath, Nfs, PVC
    # Configure the attributes as they appear in the corresponding Java class for that type
    # https://github.com/jenkinsci/kubernetes-plugin/tree/master/src/main/java/org/csanchez/jenkins/plugins/kubernetes/volumes/workspace
    # -- Workspace volume (defaults to EmptyDir)
    workspaceVolume:
      type: PVC
      claimName: data-jenkins-workspace
  
    # 配置代理地址，解决构建时的网络问题。
    # Pod-wide environment, these vars are visible to any container in the agent pod
    # -- Environment variables for the agent Pod
    envVars:
      - name: HTTP_PROXY
        value: http://10.255.2.162:8001
      - name: HTTPS_PROXY
        value: http://10.255.2.162:8001
  ```

- 配置`additionalAgents`。
  ```yaml
  # Inherits all values from `agent` so you only need to specify values which differ
  # -- Configure additional
  additionalAgents:
    go:
      podName: go
      customJenkinsLabels: go
      image:
        repository: harbor.idc.roywong.work/library/jenkins/inbound-agent-go
        tag: 1.24.2
    maven-jdk8:
      podName: maven-jdk8
      customJenkinsLabels: maven-jdk8
      image:
        repository: harbor.idc.roywong.work/library/jenkins/inbound-agent-maven
        tag: jdk8
      volumes:
        - type: EmptyDir
          mountPath: /home/jenkins/.m2
        - type: ConfigMap
          configMapName: maven-settings
          mountPath: /home/jenkins/.m2/settings.xml
          subPath: settings.xml
        - type: PVC
          claimName: data-maven-repository
          mountPath: /home/jenkins/.m2/repository
          readOnly: false
    maven-jdk11:
      podName: maven-jdk11
      customJenkinsLabels: maven-jdk11
      image:
        repository: harbor.idc.roywong.work/library/jenkins/inbound-agent-maven
        tag: jdk11
      volumes:
        - type: EmptyDir
          mountPath: /home/jenkins/.m2
        - type: ConfigMap
          configMapName: maven-settings
          mountPath: /home/jenkins/.m2/settings.xml
          subPath: settings.xml
        - type: PVC
          claimName: data-maven-repository
          mountPath: /home/jenkins/.m2/repository
          readOnly: false
    maven-jdk17:
      podName: maven-jdk17
      customJenkinsLabels: maven-jdk17
      image:
        repository: harbor.idc.roywong.work/library/jenkins/inbound-agent-maven
        tag: jdk17
      volumes:
        - type: EmptyDir
          mountPath: /home/jenkins/.m2
        - type: ConfigMap
          configMapName: maven-settings
          mountPath: /home/jenkins/.m2/settings.xml
          subPath: settings.xml
        - type: PVC
          claimName: data-maven-repository
          mountPath: /home/jenkins/.m2/repository
          readOnly: false
    maven-jdk21:
      podName: maven-jdk21
      customJenkinsLabels: maven-jdk21
      image:
        repository: harbor.idc.roywong.work/library/jenkins/inbound-agent-maven
        tag: jdk21
      volumes:
        - type: EmptyDir
          mountPath: /home/jenkins/.m2
        - type: ConfigMap
          configMapName: maven-settings
          mountPath: /home/jenkins/.m2/settings.xml
          subPath: settings.xml
        - type: PVC
          claimName: data-maven-repository
          mountPath: /home/jenkins/.m2/repository
          readOnly: false
    docker:
      podName: docker
      customJenkinsLabels: docker
      image:
        repository: harbor.idc.roywong.work/library/jenkins/inbound-agent-docker-cli
        tag: 28.1.1
      resources:
        requests:
          cpu: '2'
          memory: '4Gi'
        limits:
          cpu: '4'
          memory: '8Gi'
      runAsUser: '0'
      runAsGroup: '0'
      volumes:
        - type: EmptyDir
          mountPath: /var/lib/docker
          memory: false
        - type: EmptyDir
          mountPath: /var/run
        - type: ConfigMap
          configMapName: docker-config
          mountPath: /root/.docker
      envVars:
        - name: DOCKER_HOST
          value: "unix:///var/run/docker.sock"
      additionalContainers:
        - sideContainerName: dind
          image:
            repository: harbor.idc.roywong.work/docker.io/library/docker
            tag: 28.1.1-dind
          command: "dockerd-entrypoint.sh"
          args: "--host=tcp://0.0.0.0:2375 --host=unix:///var/run/docker.sock --tls=false"
          privileged: true
          resources:
            requests:
              cpu: '2'
              memory: '4Gi'
            limits:
              cpu: '4'
              memory: '8Gi'
          volumeMounts:
            - mountPath: /var/lib/docker
            - mountPath: /var/run
  ```

- 配置`controller`节点持久化，指定已创建的`PVC`。
  ```yaml
  persistence:
    enabled: true
    existingClaim: data-jenkins
  ```


## 自定义agent镜像
- 自定义`agent`镜像要点：使用官方基础镜像`jenkins/inbound-agent:3301.v4363ddcca_4e7-3`，然后添加相应的软件包即可。

- `Dockerfile`位置目录`dockerfiles/jenkins/inbound-agent`中。