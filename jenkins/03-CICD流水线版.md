# 流水线版CICD


## 创建`jenkins`任务
- `pipeline-simple-java-maven-app (Multibranch Pipeline Job)`
  ```xml
  <?xml version='1.1' encoding='UTF-8'?>
  <org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject plugin="workflow-multibranch@806.vb_b_688f609ee9">
   <actions/>
   <description></description>
   <properties>
     <org.jenkinsci.plugins.docker.workflow.declarative.FolderConfig plugin="docker-workflow@611.v16e84da_6d3ff">
       <dockerLabel></dockerLabel>
       <registry plugin="docker-commons@451.vd12c371eeeb_3"/>
     </org.jenkinsci.plugins.docker.workflow.declarative.FolderConfig>
   </properties>
   <folderViews class="jenkins.branch.MultiBranchProjectViewHolder" plugin="branch-api@2.1217.v43d8b_b_d8b_2c7">
     <owner class="org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject" reference="../.."/>
   </folderViews>
   <healthMetrics/>
   <icon class="jenkins.branch.MetadataActionFolderIcon" plugin="branch-api@2.1217.v43d8b_b_d8b_2c7">
     <owner class="org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject" reference="../.."/>
   </icon>
   <orphanedItemStrategy class="com.cloudbees.hudson.plugins.folder.computed.DefaultOrphanedItemStrategy" plugin="cloudbees-folder@6.1012.v79a_86a_1ea_c1f">
     <pruneDeadBranches>true</pruneDeadBranches>
     <daysToKeep>-1</daysToKeep>
     <numToKeep>-1</numToKeep>
     <abortBuilds>false</abortBuilds>
   </orphanedItemStrategy>
   <triggers/>
   <disabled>false</disabled>
   <sources class="jenkins.branch.MultiBranchProject$BranchSourceList" plugin="branch-api@2.1217.v43d8b_b_d8b_2c7">
     <data>
       <jenkins.branch.BranchSource>
         <source class="jenkins.plugins.git.GitSCMSource" plugin="git@5.7.0">
           <id>e9e7fdf7-6c5e-4fdc-ab0e-851ccb31d186</id>
           <remote>https://github.com/whh881114/simple-java-maven-app.git</remote>
           <credentialsId></credentialsId>
           <traits>
             <jenkins.plugins.git.traits.BranchDiscoveryTrait/>
           </traits>
         </source>
         <strategy class="jenkins.branch.DefaultBranchPropertyStrategy">
           <properties class="empty-list"/>
         </strategy>
       </jenkins.branch.BranchSource>
     </data>
     <owner class="org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject" reference="../.."/>
   </sources>
   <factory class="org.jenkinsci.plugins.workflow.multibranch.WorkflowBranchProjectFactory">
     <owner class="org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject" reference="../.."/>
     <scriptPath>Jenkinsfile</scriptPath>
   </factory>
  </org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject>
  ```

- `pipeline-idc-registry`
  ```xml
  <?xml version='1.1' encoding='UTF-8'?>
  <project>
    <actions/>
    <description></description>
    <keepDependencies>false</keepDependencies>
    <properties>
      <hudson.model.ParametersDefinitionProperty>
        <parameterDefinitions>
          <hudson.model.StringParameterDefinition>
            <name>APP_NAME</name>
            <trim>true</trim>
          </hudson.model.StringParameterDefinition>
          <hudson.model.StringParameterDefinition>
            <name>GIT_COMMIT</name>
            <trim>true</trim>
          </hudson.model.StringParameterDefinition>
          <hudson.model.StringParameterDefinition>
            <name>REGISTRY</name>
            <trim>true</trim>
          </hudson.model.StringParameterDefinition>
          <hudson.model.StringParameterDefinition>
            <name>REPOSITORY</name>
            <trim>true</trim>
          </hudson.model.StringParameterDefinition>
          <hudson.model.StringParameterDefinition>
            <name>IMAGE</name>
            <trim>true</trim>
          </hudson.model.StringParameterDefinition>
          <hudson.model.StringParameterDefinition>
            <name>WORKSPACE</name>
            <trim>false</trim>
          </hudson.model.StringParameterDefinition>
          <hudson.model.StringParameterDefinition>
            <name>DOCKERFILE</name>
            <trim>false</trim>
          </hudson.model.StringParameterDefinition>
        </parameterDefinitions>
      </hudson.model.ParametersDefinitionProperty>
    </properties>
    <scm class="hudson.scm.NullSCM"/>
    <assignedNode>docker</assignedNode>
    <canRoam>false</canRoam>
    <disabled>false</disabled>
    <blockBuildWhenDownstreamBuilding>false</blockBuildWhenDownstreamBuilding>
    <blockBuildWhenUpstreamBuilding>false</blockBuildWhenUpstreamBuilding>
    <triggers/>
    <concurrentBuild>true</concurrentBuild>
    <builders>
      <hudson.tasks.Shell>
        <command>cd ${WORKSPACE}
  
  docker build -t ${REGISTRY}/${REPOSITORY}/${APP_NAME}:${GIT_COMMIT} -f ${DOCKERFILE} .
  docker push ${REGISTRY}/${REPOSITORY}/${APP_NAME}:${GIT_COMMIT}</command>
        <configuredLocalRules/>
      </hudson.tasks.Shell>
    </builders>
    <publishers/>
    <buildWrappers/>
  </project>
  ```

- `pipeline-sync-argocd-app`
  ```xml
  <?xml version='1.1' encoding='UTF-8'?>
  <project>
    <actions/>
    <description></description>
    <keepDependencies>false</keepDependencies>
    <properties>
      <hudson.model.ParametersDefinitionProperty>
        <parameterDefinitions>
          <hudson.model.StringParameterDefinition>
            <name>ARGOCD_URL</name>
            <defaultValue>https://argocd-server.idc-ingress-nginx-lan.roywong.work:443</defaultValue>
            <trim>false</trim>
          </hudson.model.StringParameterDefinition>
          <hudson.model.StringParameterDefinition>
            <name>ARGOCD_TOKEN</name>
            <defaultValue>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhcmdvY2QiLCJzdWIiOiJyZWZyZXNoLXN5bmMtdXNlcjphcGlLZXkiLCJuYmYiOjE3NDc4MDk5NjIsImlhdCI6MTc0NzgwOTk2MiwianRpIjoiNGI3ODljMzQtODdhZi00YzIxLWE2YmYtMDA0ZThhNzY5ZDBiIn0.Q4krUNzorTBqdDSIp2jR6eqDp-a2IESRxvzVZuopJfA</defaultValue>
            <trim>false</trim>
          </hudson.model.StringParameterDefinition>
          <hudson.model.StringParameterDefinition>
            <name>ARGOCD_APP</name>
            <trim>false</trim>
          </hudson.model.StringParameterDefinition>
        </parameterDefinitions>
      </hudson.model.ParametersDefinitionProperty>
    </properties>
    <scm class="hudson.scm.NullSCM"/>
    <canRoam>true</canRoam>
    <disabled>false</disabled>
    <blockBuildWhenDownstreamBuilding>false</blockBuildWhenDownstreamBuilding>
    <blockBuildWhenUpstreamBuilding>false</blockBuildWhenUpstreamBuilding>
    <triggers/>
    <concurrentBuild>true</concurrentBuild>
    <builders>
      <hudson.tasks.Shell>
        <command>unset HTTP_PROXY
  unset HTTPS_PROXY
  
  curl -s -X POST ${ARGOCD_URL}/api/v1/applications/${ARGOCD_APP}/sync \
    -H &quot;Authorization: Bearer ${ARGOCD_TOKEN}&quot; \
    -H &quot;Content-Type: application/json&quot; \
    -d &apos;{
      &quot;prune&quot;: true
    }&apos;</command>
        <configuredLocalRules/>
      </hudson.tasks.Shell>
    </builders>
    <publishers/>
    <buildWrappers/>
  </project>
  ```


## `pipeline-simple-java-maven-app`创建`Jenkinsfile`
```
pipeline {
  agent { label 'maven-jdk17' } // 你在 Kubernetes 中部署的 Maven 构建 agent 标签

  environment {
    APP_NAME = "simple-java-maven-app"
    GIT_COMMIT = "${env.GIT_COMMIT}"
    WORKSPACE = "${env.WORKSPACE}"
    REGISTRY = "harbor.idc.roywong.work"    // 内部docker仓库地址
    REPOSITORY = "library"                  // 构建后的镜像存放在内部docker仓库中的哪个项目中
    IMAGE = "${env.REGISTRY}/${env.REPOSITORY}/${env.APP_NAME}:${GIT_COMMIT}"
    DOCKERFILE = "Dockerfile"
    ARGOCD_APP = "${env.APP_NAME}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Print Variables') {
      steps {
        echo "APP_NAME = ${env.APP_NAME}"
        echo "GIT_COMMIT = ${env.GIT_COMMIT}"
        echo "WORKSPACE = ${env.WORKSPACE}"
        echo "REGISTRY = ${env.REGISTRY}"
        echo "REPOSITORY = ${env.REPOSITORY}"
        echo "IMAGE = ${env.IMAGE}"
        echo "DOCKERFILE = ${env.DOCKERFILE}"
        echo "ARGOCD_APP = ${env.ARGOCD_APP}"
      }
    }

    stage('Build') {
      steps {
        sh 'mvn clean compile'
      }
    }

    stage('Package') {
      steps {
        sh 'mvn package -DskipTests'
        archiveArtifacts artifacts: 'target/*.jar', fingerprint: true
      }
    }

    stage('Trigger Docker Job') {
      steps {
        build job: 'pipeline-idc-registry', wait: true, parameters: [
          string(name: 'APP_NAME', value: "${env.APP_NAME}"),
          string(name: 'GIT_COMMIT', value: "${env.GIT_COMMIT}"),
          string(name: 'REGISTRY', value: "${env.REGISTRY}"),
          string(name: 'REPOSITORY', value: "${env.REPOSITORY}"),
          string(name: 'IMAGE', value: "${env.IMAGE}"),
          string(name: 'WORKSPACE', value: "${env.WORKSPACE}"),
          string(name: 'DOCKERFILE', value: "${env.DOCKERFILE}"),
        ]
      }
    }

    stage('Trigger Argocd Job') {
      steps {
        build job: 'pipeline-sync-argocd-app', wait: true, parameters: [
          string(name: 'ARGOCD_APP', value: "${env.ARGOCD_APP}"),
        ]
      }
    }
  }
}
```


## 构建日志
- `pipeline-simple-java-maven-app`
    ```
    Started by user admin
    
     > git rev-parse --resolve-git-dir /var/jenkins_home/caches/git-245520383fbd2d5f5ae42ee597e1891e/.git # timeout=10
    Setting origin to https://github.com/whh881114/simple-java-maven-app.git
     > git config remote.origin.url https://github.com/whh881114/simple-java-maven-app.git # timeout=10
    Fetching origin...
    Fetching upstream changes from origin
     > git --version # timeout=10
     > git --version # 'git version 2.39.5'
     > git config --get remote.origin.url # timeout=10
     > git fetch --tags --force --progress -- origin +refs/heads/*:refs/remotes/origin/* # timeout=10
    Seen branch in repository origin/master
    Seen 1 remote branch
    Obtained Jenkinsfile from 0dcd2715d6ddc1c9265b243c99a78b7aed968f28
    [Pipeline] Start of Pipeline
    [Pipeline] node
    Agent maven-jdk17-f25km
     is provisioned from template maven-jdk17
    ---
    apiVersion: "v1"
    kind: "Pod"
    metadata:
      annotations:
        kubernetes.jenkins.io/last-refresh: "1748513167968"
      labels:
        jenkins/jenkins-jenkins-agent: "true"
        jenkins/label-digest: "da15ceb5802655d6267be733669d2ffbeca10003"
        jenkins/label: "jenkins-jenkins-agent_maven-jdk17"
        kubernetes.jenkins.io/controller: "http___jenkins_jenkins_svc_cluster_local_8080x"
      name: "maven-jdk17-f25km"
      namespace: "jenkins"
    spec:
      containers:
      - args:
        - "********"
        - "maven-jdk17-f25km"
        env:
        - name: "JENKINS_SECRET"
          value: "********"
        - name: "JENKINS_TUNNEL"
          value: "jenkins-agent.jenkins.svc.cluster.local:50000"
        - name: "JENKINS_AGENT_NAME"
          value: "maven-jdk17-f25km"
        - name: "HTTPS_PROXY"
          value: "http://10.255.2.162:8001"
        - name: "REMOTING_OPTS"
          value: "-noReconnectAfter 1d"
        - name: "JENKINS_NAME"
          value: "maven-jdk17-f25km"
        - name: "JENKINS_AGENT_WORKDIR"
          value: "/home/jenkins/agent"
        - name: "HTTP_PROXY"
          value: "http://10.255.2.162:8001"
        - name: "JENKINS_URL"
          value: "http://jenkins.jenkins.svc.cluster.local:8080/"
        image: "harbor.idc.roywong.work/library/jenkins/inbound-agent-maven:jdk17"
        imagePullPolicy: "Always"
        name: "jnlp"
        resources:
          limits:
            memory: "8Gi"
            cpu: "4"
          requests:
            memory: "128Mi"
            cpu: "100m"
        tty: false
        volumeMounts:
        - mountPath: "/home/jenkins/.m2"
          name: "volume-0"
          readOnly: false
        - mountPath: "/home/jenkins/.m2/repository"
          name: "volume-2"
          readOnly: false
        - mountPath: "/home/jenkins/.m2/settings.xml"
          name: "volume-1"
          readOnly: false
          subPath: "settings.xml"
        - mountPath: "/home/jenkins/agent"
          name: "workspace-volume"
          readOnly: false
        workingDir: "/home/jenkins/agent"
      imagePullSecrets:
      - name: "registry-idc-library"
      nodeSelector:
        kubernetes.io/os: "linux"
      restartPolicy: "Never"
      serviceAccountName: "jenkins-agent"
      volumes:
      - emptyDir:
          medium: ""
        name: "volume-0"
      - name: "volume-2"
        persistentVolumeClaim:
          claimName: "data-maven-repository"
          readOnly: false
      - configMap:
          name: "maven-settings"
        name: "volume-1"
      - name: "workspace-volume"
        persistentVolumeClaim:
          claimName: "data-jenkins-workspace"
          readOnly: false
    
    Running on maven-jdk17-f25km
     in /home/jenkins/agent/workspace/ine-simple-java-maven-app_master
    [Pipeline] {
    [Pipeline] stage
    [Pipeline] { (Declarative: Checkout SCM)
    [Pipeline] checkout
    Selected Git installation does not exist. Using Default
    The recommended git tool is: NONE
    No credentials specified
    Fetching changes from the remote Git repository
     > git rev-parse --resolve-git-dir /home/jenkins/agent/workspace/ine-simple-java-maven-app_master/.git # timeout=10
    Fetching without tags
     > git config remote.origin.url https://github.com/whh881114/simple-java-maven-app.git # timeout=10
    Fetching upstream changes from https://github.com/whh881114/simple-java-maven-app.git
     > git --version # timeout=10
     > git --version # 'git version 2.39.5'
     > git fetch --no-tags --force --progress -- https://github.com/whh881114/simple-java-maven-app.git +refs/heads/*:refs/remotes/origin/* # timeout=10
    Checking out Revision 0dcd2715d6ddc1c9265b243c99a78b7aed968f28 (master)
    Commit message: "调整变量"
     > git config core.sparsecheckout # timeout=10
     > git checkout -f 0dcd2715d6ddc1c9265b243c99a78b7aed968f28 # timeout=10
     > git rev-list --no-walk 0dcd2715d6ddc1c9265b243c99a78b7aed968f28 # timeout=10
    [Pipeline] }
    [Pipeline] // stage
    [Pipeline] withEnv
    [Pipeline] {
    [Pipeline] withEnv
    [Pipeline] {
    [Pipeline] stage
    [Pipeline] { (Checkout)
    [Pipeline] checkout
    Selected Git installation does not exist. Using Default
    The recommended git tool is: NONE
    No credentials specified
    Fetching changes from the remote Git repository
    Fetching without tags
     > git rev-parse --resolve-git-dir /home/jenkins/agent/workspace/ine-simple-java-maven-app_master/.git # timeout=10
     > git config remote.origin.url https://github.com/whh881114/simple-java-maven-app.git # timeout=10
    Fetching upstream changes from https://github.com/whh881114/simple-java-maven-app.git
     > git --version # timeout=10
     > git --version # 'git version 2.39.5'
     > git fetch --no-tags --force --progress -- https://github.com/whh881114/simple-java-maven-app.git +refs/heads/*:refs/remotes/origin/* # timeout=10
    Checking out Revision 0dcd2715d6ddc1c9265b243c99a78b7aed968f28 (master)
    Commit message: "调整变量"
    [Pipeline] }
    [Pipeline] // stage
    [Pipeline] stage
    [Pipeline] { (Print Variables)
    [Pipeline] echo
    APP_NAME = simple-java-maven-app
    [Pipeline] echo
    GIT_COMMIT = 0dcd2715d6ddc1c9265b243c99a78b7aed968f28
    [Pipeline] echo
    WORKSPACE = /home/jenkins/agent/workspace/ine-simple-java-maven-app_master
    [Pipeline] echo
    REGISTRY = harbor.idc.roywong.work
    [Pipeline] echo
    REPOSITORY = library
    [Pipeline] echo
    IMAGE = harbor.idc.roywong.work/library/simple-java-maven-app:0dcd2715d6ddc1c9265b243c99a78b7aed968f28
    [Pipeline] echo
    DOCKERFILE = Dockerfile
    [Pipeline] echo
    ARGOCD_APP = simple-java-maven-app
    [Pipeline] }
    [Pipeline] // stage
    [Pipeline] stage
    [Pipeline] { (Build)
    [Pipeline] sh
     > git config core.sparsecheckout # timeout=10
     > git checkout -f 0dcd2715d6ddc1c9265b243c99a78b7aed968f28 # timeout=10
    + mvn clean compile
    [INFO] Scanning for projects...
    [INFO] 
    [INFO] ----------------------< com.mycompany.app:my-app >----------------------
    [INFO] Building my-app 1.0-SNAPSHOT
    [INFO]   from pom.xml
    [INFO] --------------------------------[ jar ]---------------------------------
    [INFO] 
    [INFO] --- clean:3.3.2:clean (default-clean) @ my-app ---
    [INFO] Deleting /home/jenkins/agent/workspace/ine-simple-java-maven-app_master/target
    [INFO] 
    [INFO] --- enforcer:3.5.0:enforce (enforce-maven) @ my-app ---
    [INFO] Rule 0: org.apache.maven.enforcer.rules.version.RequireMavenVersion passed
    [INFO] Rule 1: org.apache.maven.enforcer.rules.version.RequireJavaVersion passed
    [INFO] 
    [INFO] --- resources:3.3.1:resources (default-resources) @ my-app ---
    [INFO] Copying 1 resource from src/main/resources to target/classes
    [INFO] Copying 0 resource from src/main/resources to target/classes
    [INFO] 
    [INFO] --- compiler:3.14.0:compile (default-compile) @ my-app ---
    [INFO] Recompiling the module because of changed source code.
    [INFO] Compiling 1 source file with javac [debug parameters release 17] to target/classes
    [INFO] ------------------------------------------------------------------------
    [INFO] BUILD SUCCESS
    [INFO] ------------------------------------------------------------------------
    [INFO] Total time:  2.671 s
    [INFO] Finished at: 2025-05-29T10:06:40Z
    [INFO] ------------------------------------------------------------------------
    [Pipeline] }
    [Pipeline] // stage
    [Pipeline] stage
    [Pipeline] { (Package)
    [Pipeline] sh
    + mvn package -DskipTests
    [INFO] Scanning for projects...
    [INFO] 
    [INFO] ----------------------< com.mycompany.app:my-app >----------------------
    [INFO] Building my-app 1.0-SNAPSHOT
    [INFO]   from pom.xml
    [INFO] --------------------------------[ jar ]---------------------------------
    [INFO] 
    [INFO] --- enforcer:3.5.0:enforce (enforce-maven) @ my-app ---
    [INFO] Rule 0: org.apache.maven.enforcer.rules.version.RequireMavenVersion passed
    [INFO] Rule 1: org.apache.maven.enforcer.rules.version.RequireJavaVersion passed
    [INFO] 
    [INFO] --- resources:3.3.1:resources (default-resources) @ my-app ---
    [INFO] Copying 1 resource from src/main/resources to target/classes
    [INFO] Copying 0 resource from src/main/resources to target/classes
    [INFO] 
    [INFO] --- compiler:3.14.0:compile (default-compile) @ my-app ---
    [INFO] Nothing to compile - all classes are up to date.
    [INFO] 
    [INFO] --- resources:3.3.1:testResources (default-testResources) @ my-app ---
    [INFO] skip non existing resourceDirectory /home/jenkins/agent/workspace/ine-simple-java-maven-app_master/src/test/resources
    [INFO] 
    [INFO] --- compiler:3.14.0:testCompile (default-testCompile) @ my-app ---
    [INFO] Recompiling the module because of changed source code.
    [INFO] Compiling 1 source file with javac [debug parameters release 17] to target/test-classes
    [INFO] 
    [INFO] --- surefire:3.1.2:test (default-test) @ my-app ---
    [INFO] Tests are skipped.
    [INFO] 
    [INFO] --- jar:3.4.2:jar (default-jar) @ my-app ---
    [INFO] Building jar: /home/jenkins/agent/workspace/ine-simple-java-maven-app_master/target/app.jar
    [INFO] 
    [INFO] --- spring-boot:3.2.5:repackage (repackage) @ my-app ---
    [INFO] Replacing main artifact /home/jenkins/agent/workspace/ine-simple-java-maven-app_master/target/app.jar with repackaged archive, adding nested dependencies in BOOT-INF/.
    [INFO] The original artifact has been renamed to /home/jenkins/agent/workspace/ine-simple-java-maven-app_master/target/app.jar.original
    [INFO] ------------------------------------------------------------------------
    [INFO] BUILD SUCCESS
    [INFO] ------------------------------------------------------------------------
    [INFO] Total time:  5.627 s
    [INFO] Finished at: 2025-05-29T10:06:48Z
    [INFO] ------------------------------------------------------------------------
    [Pipeline] archiveArtifacts
    Archiving artifacts
    Recording fingerprints
    [Pipeline] }
    [Pipeline] // stage
    [Pipeline] stage
    [Pipeline] { (Trigger Docker Job)
    [Pipeline] build (Building pipeline-idc-registry)
    Scheduling project: pipeline-idc-registry
    
    Starting building: pipeline-idc-registry #11
    
    Build pipeline-idc-registry #11
     completed: SUCCESS
    [Pipeline] }
    [Pipeline] // stage
    [Pipeline] stage
    [Pipeline] { (Trigger Argocd Job)
    [Pipeline] build (Building pipeline-sync-argocd-app)
    Scheduling project: pipeline-sync-argocd-app
    
    Starting building: pipeline-sync-argocd-app #2
    
    Build pipeline-sync-argocd-app #2
     completed: SUCCESS
    [Pipeline] }
    [Pipeline] // stage
    [Pipeline] }
    [Pipeline] // withEnv
    [Pipeline] }
    [Pipeline] // withEnv
    [Pipeline] }
    [Pipeline] // node
    [Pipeline] End of Pipeline
    Finished: SUCCESS
    ````

- `pipeline-idc-registry`
    ```
    Started by upstream project "pipeline-simple-java-maven-app/master" build number 18
    originally caused by:
     Started by user admin
    Running as SYSTEM
    Agent docker-g8jdc is provisioned from template docker
    ---
    apiVersion: "v1"
    kind: "Pod"
    metadata:
      annotations:
        kubernetes.jenkins.io/last-refresh: "1748513222127"
      labels:
        jenkins/jenkins-jenkins-agent: "true"
        jenkins/label-digest: "804d9af7c7a5f1f187fd8137c59c52b4127e34bd"
        jenkins/label: "jenkins-jenkins-agent_docker"
        kubernetes.jenkins.io/controller: "http___jenkins_jenkins_svc_cluster_local_8080x"
      name: "docker-g8jdc"
      namespace: "jenkins"
    spec:
      containers:
      - args:
        - "--host=tcp://0.0.0.0:2375"
        - "--host=unix:///var/run/docker.sock"
        - "--tls=false"
        command:
        - "dockerd-entrypoint.sh"
        env:
        - name: "DOCKER_HOST"
          value: "unix:///var/run/docker.sock"
        - name: "JENKINS_URL"
          value: "http://jenkins.jenkins.svc.cluster.local:8080/"
        image: "harbor.idc.roywong.work/docker.io/library/docker:28.1.1-dind"
        imagePullPolicy: "Always"
        name: "dind"
        resources:
          limits:
            memory: "8Gi"
            cpu: "4"
          requests:
            memory: "4Gi"
            cpu: "2"
        securityContext:
          privileged: true
          runAsGroup: 0
          runAsUser: 0
        tty: false
        volumeMounts:
        - mountPath: "/root/.docker"
          name: "volume-2"
          readOnly: false
        - mountPath: "/var/lib/docker"
          name: "volume-0"
          readOnly: false
        - mountPath: "/var/run"
          name: "volume-1"
          readOnly: false
        - mountPath: "/home/jenkins/agent"
          name: "workspace-volume"
          readOnly: false
        workingDir: "/home/jenkins/agent"
      - args:
        - "********"
        - "docker-g8jdc"
        env:
        - name: "JENKINS_SECRET"
          value: "********"
        - name: "JENKINS_TUNNEL"
          value: "jenkins-agent.jenkins.svc.cluster.local:50000"
        - name: "JENKINS_AGENT_NAME"
          value: "docker-g8jdc"
        - name: "DOCKER_HOST"
          value: "unix:///var/run/docker.sock"
        - name: "REMOTING_OPTS"
          value: "-noReconnectAfter 1d"
        - name: "JENKINS_NAME"
          value: "docker-g8jdc"
        - name: "JENKINS_AGENT_WORKDIR"
          value: "/home/jenkins/agent"
        - name: "JENKINS_URL"
          value: "http://jenkins.jenkins.svc.cluster.local:8080/"
        image: "harbor.idc.roywong.work/library/jenkins/inbound-agent-docker-cli:28.1.1"
        imagePullPolicy: "Always"
        name: "jnlp"
        resources:
          limits:
            memory: "8Gi"
            cpu: "4"
          requests:
            memory: "4Gi"
            cpu: "2"
        securityContext:
          privileged: false
          runAsGroup: 0
          runAsUser: 0
        tty: false
        volumeMounts:
        - mountPath: "/root/.docker"
          name: "volume-2"
          readOnly: false
        - mountPath: "/var/lib/docker"
          name: "volume-0"
          readOnly: false
        - mountPath: "/var/run"
          name: "volume-1"
          readOnly: false
        - mountPath: "/home/jenkins/agent"
          name: "workspace-volume"
          readOnly: false
        workingDir: "/home/jenkins/agent"
      imagePullSecrets:
      - name: "registry-idc-library"
      nodeSelector:
        kubernetes.io/os: "linux"
      restartPolicy: "Never"
      serviceAccountName: "jenkins-agent"
      volumes:
      - emptyDir:
          medium: ""
        name: "volume-0"
      - configMap:
          name: "docker-config"
        name: "volume-2"
      - emptyDir:
          medium: ""
        name: "volume-1"
      - name: "workspace-volume"
        persistentVolumeClaim:
          claimName: "data-jenkins-workspace"
          readOnly: false
    
    Building remotely on docker-g8jdc (jenkins-jenkins-agent docker) in workspace /home/jenkins/agent/workspace/pipeline-idc-registry
    [pipeline-idc-registry] $ /bin/sh -xe /tmp/jenkins5774193673988507616.sh
    + cd /home/jenkins/agent/workspace/ine-simple-java-maven-app_master
    + docker build -t harbor.idc.roywong.work/library/simple-java-maven-app:0dcd2715d6ddc1c9265b243c99a78b7aed968f28 -f Dockerfile .
    DEPRECATED: The legacy builder is deprecated and will be removed in a future release.
                Install the buildx component to build images with BuildKit:
                https://docs.docker.com/go/buildx/
    
    Sending build context to Docker daemon  19.96MB
    
    Step 1/5 : FROM harbor.idc.roywong.work/docker.io/library/eclipse-temurin:17-jre-alpine
    17-jre-alpine: Pulling from eclipse-temurin
    f18232174bc9: Pulling fs layer
    d66c12a520b9: Pulling fs layer
    aa898b139fbf: Pulling fs layer
    e6744199aa66: Pulling fs layer
    b4dce0e52e6a: Pulling fs layer
    e6744199aa66: Waiting
    b4dce0e52e6a: Waiting
    f18232174bc9: Verifying Checksum
    f18232174bc9: Download complete
    e6744199aa66: Download complete
    b4dce0e52e6a: Verifying Checksum
    b4dce0e52e6a: Download complete
    d66c12a520b9: Download complete
    f18232174bc9: Pull complete
    d66c12a520b9: Pull complete
    aa898b139fbf: Verifying Checksum
    aa898b139fbf: Download complete
    aa898b139fbf: Pull complete
    e6744199aa66: Pull complete
    b4dce0e52e6a: Pull complete
    Digest: sha256:02bb161f8b8acea324b5eb6ceadcc4785d427fb1c81add26c3a86f233db423fd
    Status: Downloaded newer image for harbor.idc.roywong.work/docker.io/library/eclipse-temurin:17-jre-alpine
     ---> 2d3f08ebfda1
    Step 2/5 : LABEL maintainer="whh881114@gmail.com"       description="the first java application demo"
     ---> Running in afe3128e6d5c
     ---> Removed intermediate container afe3128e6d5c
     ---> e97e30f71386
    Step 3/5 : WORKDIR /app
     ---> Running in ee3ab6d0ea05
     ---> Removed intermediate container ee3ab6d0ea05
     ---> 3793bc5b4bf6
    Step 4/5 : COPY target/app.jar app.jar
     ---> 8c9094cc2524
    Step 5/5 : ENTRYPOINT ["java", "-jar", "app.jar"]
     ---> Running in 3e1ee3981783
     ---> Removed intermediate container 3e1ee3981783
     ---> e347660dcf13
    Successfully built e347660dcf13
    Successfully tagged harbor.idc.roywong.work/library/simple-java-maven-app:0dcd2715d6ddc1c9265b243c99a78b7aed968f28
    + docker push harbor.idc.roywong.work/library/simple-java-maven-app:0dcd2715d6ddc1c9265b243c99a78b7aed968f28
    The push refers to repository [harbor.idc.roywong.work/library/simple-java-maven-app]
    0f01f6f953f7: Preparing
    49c577bfd52d: Preparing
    179f80c1bf5f: Preparing
    002d22842e01: Preparing
    644f2ee1ce52: Preparing
    7788687a03b0: Preparing
    08000c18d16d: Preparing
    7788687a03b0: Waiting
    08000c18d16d: Waiting
    002d22842e01: Layer already exists
    179f80c1bf5f: Layer already exists
    644f2ee1ce52: Layer already exists
    7788687a03b0: Layer already exists
    08000c18d16d: Layer already exists
    49c577bfd52d: Pushed
    0f01f6f953f7: Pushed
    0dcd2715d6ddc1c9265b243c99a78b7aed968f28: digest: sha256:4e20ef2ce840e7185b5c01a75a91d49f3267f21e3c227354153dd99963c8b6db size: 1786
    Finished: SUCCESS
    ```

- `pipeline-sync-argocd-app`
    ```
    Started by upstream project "pipeline-simple-java-maven-app/master" build number 18
    originally caused by:
     Started by user admin
    Running as SYSTEM
    Agent default-ttvhq is provisioned from template default
    ---
    apiVersion: "v1"
    kind: "Pod"
    metadata:
      annotations:
        kubernetes.jenkins.io/last-refresh: "1748513252856"
      labels:
        jenkins/jenkins-jenkins-agent: "true"
        jenkins/label-digest: "500b4f18aee87616849e4f4c2435020898e34aa0"
        jenkins/label: "jenkins-jenkins-agent"
        kubernetes.jenkins.io/controller: "http___jenkins_jenkins_svc_cluster_local_8080x"
      name: "default-ttvhq"
      namespace: "jenkins"
    spec:
      containers:
      - args:
        - "********"
        - "default-ttvhq"
        env:
        - name: "JENKINS_SECRET"
          value: "********"
        - name: "JENKINS_TUNNEL"
          value: "jenkins-agent.jenkins.svc.cluster.local:50000"
        - name: "JENKINS_AGENT_NAME"
          value: "default-ttvhq"
        - name: "HTTPS_PROXY"
          value: "http://10.255.2.162:8001"
        - name: "REMOTING_OPTS"
          value: "-noReconnectAfter 1d"
        - name: "JENKINS_NAME"
          value: "default-ttvhq"
        - name: "JENKINS_AGENT_WORKDIR"
          value: "/home/jenkins/agent"
        - name: "HTTP_PROXY"
          value: "http://10.255.2.162:8001"
        - name: "JENKINS_URL"
          value: "http://jenkins.jenkins.svc.cluster.local:8080/"
        image: "harbor.idc.roywong.work/docker.io/jenkins/inbound-agent:3301.v4363ddcca_4e7-3"
        imagePullPolicy: "Always"
        name: "jnlp"
        resources:
          limits:
            memory: "8Gi"
            cpu: "4"
          requests:
            memory: "128Mi"
            cpu: "100m"
        tty: false
        volumeMounts:
        - mountPath: "/home/jenkins/agent"
          name: "workspace-volume"
          readOnly: false
        workingDir: "/home/jenkins/agent"
      imagePullSecrets:
      - name: "registry-idc-library"
      nodeSelector:
        kubernetes.io/os: "linux"
      restartPolicy: "Never"
      serviceAccountName: "jenkins-agent"
      volumes:
      - name: "workspace-volume"
        persistentVolumeClaim:
          claimName: "data-jenkins-workspace"
          readOnly: false
    
    Building remotely on default-ttvhq (jenkins-jenkins-agent) in workspace /home/jenkins/agent/workspace/pipeline-sync-argocd-app
    [pipeline-sync-argocd-app] $ /bin/sh -xe /tmp/jenkins217384657636621117.sh
    + unset HTTP_PROXY
    + unset HTTPS_PROXY
    + curl -s -X POST https://argocd-server.idc-ingress-nginx-lan.roywong.work:443/api/v1/applications/simple-java-maven-app/sync -H Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhcmdvY2QiLCJzdWIiOiJyZWZyZXNoLXN5bmMtdXNlcjphcGlLZXkiLCJuYmYiOjE3NDc4MDk5NjIsImlhdCI6MTc0NzgwOTk2MiwianRpIjoiNGI3ODljMzQtODdhZi00YzIxLWE2YmYtMDA0ZThhNzY5ZDBiIn0.Q4krUNzorTBqdDSIp2jR6eqDp-a2IESRxvzVZuopJfA -H Content-Type: application/json -d {
        "prune": true
      }
    {"metadata":{"name":"simple-java-maven-app","namespace":"argocd","uid":"9182d54e-c413-4770-935c-e3a7391c647b","resourceVersion":"39385702","generation":486,"creationTimestamp":"2025-05-28T06:32:49Z","labels":{"argocd.argoproj.io/instance":"001-application-index"},"annotations":{"kubectl.kubernetes.io/last-applied-configuration":"{\"apiVersion\":\"argoproj.io/v1alpha1\",\"kind\":\"Application\",\"metadata\":{\"annotations\":{},\"labels\":{\"argocd.argoproj.io/instance\":\"001-application-index\"},\"name\":\"simple-java-maven-app\",\"namespace\":\"argocd\"},\"spec\":{\"destination\":{\"namespace\":\"default\",\"server\":\"https://kubernetes.default.svc\"},\"project\":\"default\",\"source\":{\"path\":\"simple-java-maven-app\",\"plugin\":{\"name\":\"argocd-cmp-jsonnet\",\"parameters\":[{\"name\":\"jsonnet-file\",\"string\":\"index.jsonnet\"},{\"name\":\"registry\",\"string\":\"harbor.idc.roywong.work\"},{\"name\":\"project\",\"string\":\"library\"},{\"name\":\"image\",\"string\":\"simple-java-maven-app\"},{\"name\":\"tag\",\"string\":\"latest\"}]},\"repoURL\":\"git@github.com:whh881114/argocd-manifests.git\",\"targetRevision\":\"master\"},\"syncPolicy\":{\"syncOptions\":[\"CreateNamespace=true\"]}}}\n"},"managedFields":[{"manager":"argocd-controller","operation":"Update","apiVersion":"argoproj.io/v1alpha1","time":"2025-05-28T06:32:49Z","fieldsType":"FieldsV1","fieldsV1":{"f:metadata":{"f:annotations":{".":{},"f:kubectl.kubernetes.io/last-applied-configuration":{}},"f:labels":{".":{},"f:argocd.argoproj.io/instance":{}}},"f:spec":{".":{},"f:destination":{".":{},"f:namespace":{},"f:server":{}},"f:project":{},"f:source":{".":{},"f:path":{},"f:plugin":{".":{},"f:name":{},"f:parameters":{}},"f:repoURL":{},"f:targetRevision":{}},"f:syncPolicy":{".":{},"f:syncOptions":{}}}}},{"manager":"argocd-application-controller","operation":"Update","apiVersion":"argoproj.io/v1alpha1","time":"2025-05-29T10:05:30Z","fieldsType":"FieldsV1","fieldsV1":{"f:status":{".":{},"f:controllerNamespace":{},"f:health":{".":{},"f:status":{}},"f:history":{},"f:reconciledAt":{},"f:resources":{},"f:sourceType":{},"f:summary":{"f:images":{}},"f:sync":{".":{},"f:comparedTo":{".":{},"f:destination":{".":{},"f:namespace":{},"f:server":{}},"f:source":{".":{},"f:path":{},"f:plugin":{".":{},"f:name":{},"f:parameters":{}},"f:repoURL":{},"f:targetRevision":{}}},"f:revision":{},"f:status":{}}}}},{"manager":"argocd-server","operation":"Update","apiVersion":"argoproj.io/v1alpha1","time":"2025-05-29T10:07:39Z","fieldsType":"FieldsV1","fieldsV1":{"f:operation":{".":{},"f:initiatedBy":{".":{},"f:username":{}},"f:retry":{},"f:sync":{".":{},"f:prune":{},"f:revision":{},"f:syncOptions":{}}},"f:status":{"f:summary":{}}}}]},"spec":{"source":{"repoURL":"git@github.com:whh881114/argocd-manifests.git","path":"simple-java-maven-app","targetRevision":"master","plugin":{"name":"argocd-cmp-jsonnet","parameters":[{"name":"jsonnet-file","string":"index.jsonnet"},{"name":"registry","string":"harbor.idc.roywong.work"},{"name":"project","string":"library"},{"name":"image","string":"simple-java-maven-app"},{"name":"tag","string":"latest"}]}},"destination":{"server":"https://kubernetes.default.svc","namespace":"default"},"project":"default","syncPolicy":{"syncOptions":["CreateNamespace=true"]}},"status":{"resources":[{"group":"apps","version":"v1","kind":"Deployment","namespace":"default","name":"simple-java-maven-app","status":"OutOfSync","health":{"status":"Healthy"}}],"sync":{"status":"OutOfSync","comparedTo":{"source":{"repoURL":"git@github.com:whh881114/argocd-manifests.git","path":"simple-java-maven-app","targetRevision":"master","plugin":{"name":"argocd-cmp-jsonnet","parameters":[{"name":"jsonnet-file","string":"index.jsonnet"},{"name":"registry","string":"harbor.idc.roywong.work"},{"name":"project","string":"library"},{"name":"image","string":"simple-java-maven-app"},{"name":"tag","string":"latest"}]}},"destination":{"server":"https://kubernetes.default.svc","namespace":"default"}},"revision":"0f02621d4010ebb6ca25994f0bfaffc973e45287"},"health":{"status":"Healthy"},"history":[{"revision":"415a05b92785ae465f9cda1f53614fd4159a53be","deployedAt":"2025-05-28T06:34:44Z","id":0,"source":{"repoURL":"git@github.com:whh881114/argocd-manifests.git","path":"simple-java-maven-app","targetRevision":"master","plugin":{"name":"argocd-cmp-jsonnet","parameters":[{"name":"jsonnet-file","string":"index.jsonnet"},{"name":"registry","string":"harbor.idc.roywong.work"},{"name":"project","string":"library"},{"name":"image","string":"simple-java-maven-app"},{"name":"tag","string":"latest"}]}},"deployStartedAt":"2025-05-28T06:34:44Z","initiatedBy":{"username":"refresh-sync-user"}},{"revision":"76cfb626524415f3a26d67296d86ee6e9982eee5","deployedAt":"2025-05-28T07:03:53Z","id":1,"source":{"repoURL":"git@github.com:whh881114/argocd-manifests.git","path":"simple-java-maven-app","targetRevision":"master","plugin":{"name":"argocd-cmp-jsonnet","parameters":[{"name":"jsonnet-file","string":"index.jsonnet"},{"name":"registry","string":"harbor.idc.roywong.work"},{"name":"project","string":"library"},{"name":"image","string":"simple-java-maven-app"},{"name":"tag","string":"latest"}]}},"deployStartedAt":"2025-05-28T07:03:53Z","initiatedBy":{"username":"refresh-sync-user"}},{"revision":"2c6cb18d8a5c0024eb9e3296fe1da332ae846886","deployedAt":"2025-05-28T07:10:35Z","id":2,"source":{"repoURL":"git@github.com:whh881114/argocd-manifests.git","path":"simple-java-maven-app","targetRevision":"master","plugin":{"name":"argocd-cmp-jsonnet","parameters":[{"name":"jsonnet-file","string":"index.jsonnet"},{"name":"registry","string":"harbor.idc.roywong.work"},{"name":"project","string":"library"},{"name":"image","string":"simple-java-maven-app"},{"name":"tag","string":"latest"}]}},"deployStartedAt":"2025-05-28T07:10:27Z","initiatedBy":{"username":"refresh-sync-user"}},{"revision":"2c6cb18d8a5c0024eb9e3296fe1da332ae846886","deployedAt":"2025-05-28T07:13:15Z","id":3,"source":{"repoURL":"git@github.com:whh881114/argocd-manifests.git","path":"simple-java-maven-app","targetRevision":"master","plugin":{"name":"argocd-cmp-jsonnet","parameters":[{"name":"jsonnet-file","string":"index.jsonnet"},{"name":"registry","string":"harbor.idc.roywong.work"},{"name":"project","string":"library"},{"name":"image","string":"simple-java-maven-app"},{"name":"tag","string":"latest"}]}},"deployStartedAt":"2025-05-28T07:13:15Z","initiatedBy":{"username":"refresh-sync-user"}},{"revision":"2c6cb18d8a5c0024eb9e3296fe1da332ae846886","deployedAt":"2025-05-28T07:30:57Z","id":4,"source":{"repoURL":"git@github.com:whh881114/argocd-manifests.git","path":"simple-java-maven-app","targetRevision":"master","plugin":{"name":"argocd-cmp-jsonnet","parameters":[{"name":"jsonnet-file","string":"index.jsonnet"},{"name":"registry","string":"harbor.idc.roywong.work"},{"name":"project","string":"library"},{"name":"image","string":"simple-java-maven-app"},{"name":"tag","string":"latest"}]}},"deployStartedAt":"2025-05-28T07:30:56Z","initiatedBy":{"username":"refresh-sync-user"}},{"revision":"5b26e2efc3c4d6c9b48ffac8e26aa535ea7fc74d","deployedAt":"2025-05-29T09:48:33Z","id":5,"source":{"repoURL":"git@github.com:whh881114/argocd-manifests.git","path":"simple-java-maven-app","targetRevision":"master","plugin":{"name":"argocd-cmp-jsonnet","parameters":[{"name":"jsonnet-file","string":"index.jsonnet"},{"name":"registry","string":"harbor.idc.roywong.work"},{"name":"project","string":"library"},{"name":"image","string":"simple-java-maven-app"},{"name":"tag","string":"latest"}]}},"deployStartedAt":"2025-05-29T09:48:33Z","initiatedBy":{"username":"refresh-sync-user"}}],"reconciledAt":"2025-05-29T10:05:30Z","sourceType":"Plugin","summary":{"images":["harbor.idc.roywong.work/docker.io/istio/proxyv2:1.23.0","harbor.idc.roywong.work/library/simple-java-maven-app:ab24071e0776ac72037d5ee7c0c238933f1b1795"]},"controllerNamespace":"argocd"},"operation":{"sync":{"revision":"0f02621d4010ebb6ca25994f0bfaffc973e45287","prune":true,"syncOptions":["CreateNamespace=true"]},"initiatedBy":{"username":"refresh-sync-user"},"retry":{}}}Finished: SUCCESS
    ```