# ha-nginx服务器


## 前言
- 主机清单
  ```
  ha-nginx-1.freedom.org / 10.255.1.9
  ha-nginx-2.freedom.org / 10.255.1.10
  ```

- 架构模式：两台主机互为主备模式。


## keepalived配置细节
- 官方文档：
  - https://nginx.org/
  - https://www.keepalived.org/

- 配置文件`/etc/keepalived/keepalived.conf`要点说明：
  - 禁用`global_defs.vrrp_strict`，这样`vip`就可以被ping通了。

  - `vrrp_script`定义心跳检查，`vrrp_script.script`可以是shell命令，用双引号括起来即可。`vrrp_script.weight`这个要是**负数**，  
    因为心跳不通过时，其主机的`priority`就要和这个`weight`求和，计算出新的值，新的值一定要比另一台主机的`priority`低，这样另一台  
    主机就可以由`BACKUP`切换成`MASTER`状态。

  - `vrrp_instance`中要配置`track_script`，这个就是对应之前的心跳检查。

- 配置完成后，可以使用`ip addr show`查看ip信息。
  ```
  [root@ha-nginx-1.freedom.org ~ 15:51]# 1> ip addr show
  1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
      link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
      inet 127.0.0.1/8 scope host lo
         valid_lft forever preferred_lft forever
      inet6 ::1/128 scope host 
         valid_lft forever preferred_lft forever
  2: ens192: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
      link/ether 00:50:56:9d:2f:0a brd ff:ff:ff:ff:ff:ff
      altname enp11s0
      inet 10.255.1.9/22 brd 10.255.3.255 scope global noprefixroute ens192
         valid_lft forever preferred_lft forever
      inet 10.255.1.111/22 scope global secondary ens192
         valid_lft forever preferred_lft forever
      inet6 fe80::250:56ff:fe9d:2f0a/64 scope link noprefixroute 
         valid_lft forever preferred_lft forever
  [root@ha-nginx-1.freedom.org ~ 15:51]# 2> 
  
  [root@ha-nginx-2.freedom.org ~ 15:51]# 1> ip addr show
  1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
      link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
      inet 127.0.0.1/8 scope host lo
         valid_lft forever preferred_lft forever
      inet6 ::1/128 scope host 
         valid_lft forever preferred_lft forever
  2: ens192: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
      link/ether 00:50:56:9d:49:ca brd ff:ff:ff:ff:ff:ff
      altname enp11s0
      inet 10.255.1.10/22 brd 10.255.3.255 scope global noprefixroute ens192
         valid_lft forever preferred_lft forever
      inet 10.255.1.222/22 scope global secondary ens192
         valid_lft forever preferred_lft forever
      inet6 fe80::250:56ff:fe9d:49ca/64 scope link noprefixroute 
         valid_lft forever preferred_lft forever
  [root@ha-nginx-2.freedom.org ~ 15:51]# 2> 
  ```


## keepalived配置文件
- `ha-nginx-1.freedom.org -- /etc/keepalived/keepalived.conf`
  ```
  ! Configuration File for keepalived
  
  global_defs {
    notification_email {
      acassen@firewall.loc
      failover@firewall.loc
      sysadmin@firewall.loc
    }
    notification_email_from Alexandre.Cassen@firewall.loc
    smtp_server 127.0.0.1
    smtp_connect_timeout 30
    router_id ha-nginx-1.freedom.org
    vrrp_skip_check_adv_addr
    vrrp_garp_interval 0
    vrrp_gna_interval 0
    # 禁用vrrp_strict，允许vip可以被ping通。
    # vrrp_strict
  }
  
  vrrp_script check_nginx_pid {
    script "/usr/sbin/pidof nginx"
    interval 3
    weight -10
    fall 3
    rise 2
    user root
  }
  
  vrrp_instance VI_1 {
    state MASTER
    interface ens192
    virtual_router_id 51   # 这个值在Master和Backup服务器上必须相同，以确保它们属于同一个VRRP实例。
    priority 100
    advert_int 1
    
    authentication {
        auth_type PASS
        auth_pass 1111
    }
    
    virtual_ipaddress {
        10.255.1.111/22
    }
    
    track_script {
      check_nginx_pid
    }
  }
  
  vrrp_instance VI_2 {
    state BACKUP
    interface ens192
    virtual_router_id 52
    priority 99
    advert_int 1
    
    authentication {
        auth_type PASS
        auth_pass 1111
    }
    
    virtual_ipaddress {
        10.255.1.222/22
    }
    
    track_script {
      check_nginx_pid
    }
  }
  ```
  
- `ha-nginx-2.freedom.org -- /etc/keepalived/keepalived.conf`
  ```
  ! Configuration File for keepalived
  
  global_defs {
    notification_email {
      acassen@firewall.loc
      failover@firewall.loc
      sysadmin@firewall.loc
    }
    notification_email_from Alexandre.Cassen@firewall.loc
    smtp_server 127.0.0.1
    smtp_connect_timeout 30
    router_id ha-nginx-2.freedom.org
    vrrp_skip_check_adv_addr
    vrrp_garp_interval 0
    vrrp_gna_interval 0
    # 禁用vrrp_strict，允许vip可以被ping通。
    # vrrp_strict
  }
  
  vrrp_script check_nginx_pid {
    script "/usr/sbin/pidof nginx"
    interval 3
    weight -10
    fall 3
    rise 2
    user root
  }
  
  vrrp_instance VI_1 {
    state BACKUP
    interface ens192
    virtual_router_id 51   # 这个值在Master和Backup服务器上必须相同，以确保它们属于同一个VRRP实例。
    priority 99
    advert_int 1
    
    authentication {
        auth_type PASS
        auth_pass 1111
    }
    
    virtual_ipaddress {
        10.255.1.111/22
    }
    
    track_script {
      check_nginx_pid
    }
  }
  
  vrrp_instance VI_2 {
    state MASTER
    interface ens192
    virtual_router_id 52
    priority 100
    advert_int 1
    
    authentication {
        auth_type PASS
        auth_pass 1111
    }
    
    virtual_ipaddress {
        10.255.1.222/22
    }
    
    track_script {
      check_nginx_pid
    }
  }
  ```


## keepalived切换日志
```
Aug  2 14:46:03 ha-nginx-1 Keepalived[742]: Starting Keepalived v2.2.8 (04/04,2023), git commit v2.2.7-154-g292b299e+
Aug  2 14:46:03 ha-nginx-1 Keepalived[742]: Running on Linux 5.14.0-362.8.1.el9_3.x86_64 #1 SMP PREEMPT_DYNAMIC Wed Nov 8 17:36:32 UTC 2023 (built for Linux 5.14.0)
Aug  2 14:46:03 ha-nginx-1 Keepalived[742]: Command line: '/usr/sbin/keepalived' '--dont-fork' '-D' '-d' '-S' '0'
Aug  2 14:46:03 ha-nginx-1 Keepalived[742]: Opening file '/etc/keepalived/keepalived.conf'.
Aug  2 14:46:03 ha-nginx-1 Keepalived[742]: Configuration file /etc/keepalived/keepalived.conf
Aug  2 14:46:03 ha-nginx-1 Keepalived[742]: (Line 14) WARNING - number '0' outside range [0.000001, 4294.967295]
Aug  2 14:46:03 ha-nginx-1 Keepalived[742]: (Line 14) vrrp_garp_interval '0' is invalid
Aug  2 14:46:03 ha-nginx-1 Keepalived[742]: (Line 15) WARNING - number '0' outside range [0.000001, 4294.967295]
Aug  2 14:46:03 ha-nginx-1 Keepalived[742]: (Line 15) vrrp_gna_interval '0' is invalid
Aug  2 14:46:03 ha-nginx-1 Keepalived[742]: NOTICE: setting config option max_auto_priority should result in better keepalived performance
Aug  2 14:46:03 ha-nginx-1 Keepalived[742]: Starting VRRP child process, pid=878
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Registering Kernel netlink reflector
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Registering Kernel netlink command channel
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: SECURITY VIOLATION - scripts are being executed but script_security not enabled.
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Assigned address 10.255.1.9 for interface ens192
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Assigned address fe80::250:56ff:fe9d:2f0a for interface ens192
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Registering gratuitous ARP shared channel
Aug  2 14:46:03 ha-nginx-1 Keepalived[742]: Startup complete
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: (VI_1) removing VIPs.
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: (VI_2) removing VIPs.
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: ------< Global definitions >------
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Network namespace = (default)
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Network namespace ipvs = (main namespace)
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Router ID = ha-nginx-1.freedom.org
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Smtp server = 127.0.0.1
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Smtp server port = 25
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Smtp HELO name = ha-nginx-1.freedom.org
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Smtp server connection timeout = 30
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Email notification from = Alexandre.Cassen@firewall.loc
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Email notification to:
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   acassen@firewall.loc
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   failover@firewall.loc
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   sysadmin@firewall.loc
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Default smtp_alert = unset
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Default smtp_alert_vrrp = unset
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Default smtp_alert_checker = unset
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Checkers log all failures = false
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: No test config before reload
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Dynamic interfaces = false
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Default interface = eth0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Disable local IGMP = no
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Use VRRPv2 checksum for VRRPv3 IPv4 = no
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: LVS flush = false
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: LVS flush on stop = disabled
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: FIFO write vrrp states on reload = false
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: VRRP notify priority changes = false
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: VRRP IPv4 mcast group = 224.0.0.18
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: VRRP IPv6 mcast group = ff02::12
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Gratuitous ARP delay = 5
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Gratuitous ARP repeat = 5
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Gratuitous ARP refresh timer = 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Gratuitous ARP refresh repeat = 1
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Gratuitous ARP lower priority delay = 5
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Gratuitous ARP lower priority repeat = 5
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Num adverts before down = 3
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Gratuitous ARP for each secondary VMAC = 0s
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Send advert after receive lower priority advert = true
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Send advert after receive higher priority advert = false
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Gratuitous ARP interval = 0.000000
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Gratuitous NA interval = 0.000000
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: VRRP default protocol version = 2
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: nftables without counters
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: libnftnl version 1.2.2
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: VRRP check unicast_src = false
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: VRRP skip check advert addresses = true
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: VRRP strict mode = false
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Max auto priority = 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Min auto priority delay = 1000000 usecs
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: VRRP process priority = 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: VRRP don't swap = false
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: VRRP realtime priority = 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: VRRP realtime limit = 10000
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Checker process priority = 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Checker don't swap = false
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Checker realtime priority = 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Checker realtime limit = 10000
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: SNMP vrrp disabled
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: SNMP checker disabled
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: SNMP RFCv2 disabled
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: SNMP RFCv3 disabled
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: SNMP traps disabled
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: SNMP socket = default (unix:/var/agentx/master)
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Script security disabled
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Script user 'keepalived_script' does not exist
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Default script uid:gid 0:0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: vrrp_netlink_cmd_rcv_bufs = 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: vrrp_netlink_cmd_rcv_bufs_force = 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: vrrp_netlink_monitor_rcv_bufs = 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: vrrp_netlink_monitor_rcv_bufs_force = 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: process_monitor_rcv_bufs = 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: process_monitor_rcv_bufs_force = 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: lvs_netlink_cmd_rcv_bufs = 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: lvs_netlink_cmd_rcv_bufs_force = 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: lvs_netlink_monitor_rcv_bufs = 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: lvs_netlink_monitor_rcv_bufs_force = 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: rs_init_notifies = 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: no_checker_emails = 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: rx_bufs_multiples = 3
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: umask = 0177
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: json_version 1
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: ------< VRRP Topology >------
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: VRRP Instance = VI_1
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   VRRP Version = 2
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Flags:
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Wantstate = MASTER
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Number of config faults = 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Interface = ens192
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Skip checking advert IP addresses
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Using src_ip = 10.255.1.9
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Multicast address 224.0.0.18
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Gratuitous ARP delay = 5
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Gratuitous ARP repeat = 5
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Gratuitous ARP refresh = 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Gratuitous ARP refresh repeat = 1
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Gratuitous ARP lower priority delay = 5
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Gratuitous ARP lower priority repeat = 5
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Down timer adverts = 3
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Send advert after receive lower priority advert = true
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Send advert after receive higher priority advert = false
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Virtual Router ID = 51
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Priority = 100
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Advert interval = 1 sec
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Last advert sent = 0.000000
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Accept = enabled
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Preempt = enabled
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Promote_secondaries = disabled
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Authentication type = SIMPLE_PASSWORD
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Password = 1111
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Virtual IP (1):
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:     10.255.1.111/22 dev ens192 scope global
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   No sockets allocated
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Tracked scripts :
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:     check_nginx_pid weight -10
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Using smtp notification = no
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Notify deleted = Fault
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Notify priority changes = false
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: VRRP Instance = VI_2
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   VRRP Version = 2
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Flags:
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Wantstate = BACKUP
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Number of config faults = 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Interface = ens192
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Skip checking advert IP addresses
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Using src_ip = 10.255.1.9
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Multicast address 224.0.0.18
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Gratuitous ARP delay = 5
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Gratuitous ARP repeat = 5
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Gratuitous ARP refresh = 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Gratuitous ARP refresh repeat = 1
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Gratuitous ARP lower priority delay = 5
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Gratuitous ARP lower priority repeat = 5
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Down timer adverts = 3
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Send advert after receive lower priority advert = true
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Send advert after receive higher priority advert = false
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Virtual Router ID = 52
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Priority = 99
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Advert interval = 1 sec
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Last advert sent = 0.000000
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Accept = enabled
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Preempt = enabled
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Promote_secondaries = disabled
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Authentication type = SIMPLE_PASSWORD
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Password = 1111
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Virtual IP (1):
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:     10.255.1.222/22 dev ens192 scope global
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   No sockets allocated
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Tracked scripts :
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:     check_nginx_pid weight -10
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Using smtp notification = no
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Notify deleted = Fault
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Notify priority changes = false
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: ------< VRRP Scripts >------
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: VRRP Script = check_nginx_pid
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Command = '/usr/bin/pidof' 'nginx'
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Interval = 3 sec
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Timeout = 0 sec
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Weight = -10
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Rise = 2
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Fall = 3
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Result = 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Insecure = no
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Init state = INIT
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Status = BAD
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Script uid:gid = 0:0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   VRRP instances :
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Tracking instances :
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:     VI_1, weight -10
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:     VI_2, weight -10
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   State = idle
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: ------< Interfaces >------
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Name = lo
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   index = 1
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   IPv4 address = 127.0.0.1
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   IPv6 address = (none)
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   State = UP, RUNNING, no broadcast, loopback, no multicast
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Seen up = 1
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Delayed state change running = false
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Up debounce timer = 0us
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Down debounce timer = 0us
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   MTU = 65536
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   HW Type = LOOPBACK
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   NIC netlink status update
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Reset ARP config counter 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Original arp_ignore 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Original arp_filter 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Original promote_secondaries 1
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Reset promote_secondaries counter 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: Name = ens192
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   index = 2
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   IPv4 address = 10.255.1.9
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   IPv6 address = fe80::250:56ff:fe9d:2f0a
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   MAC = 00:50:56:9d:2f:0a
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   MAC broadcast = ff:ff:ff:ff:ff:ff
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   State = UP, RUNNING
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Seen up = 1
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Delayed state change running = false
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Up debounce timer = 0us
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Down debounce timer = 0us
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   MTU = 1500
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   HW Type = ETHERNET
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   NIC netlink status update
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Reset ARP config counter 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Original arp_ignore 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Original arp_filter 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Original promote_secondaries 1
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Reset promote_secondaries counter 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:   Tracking VRRP instances :
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:     VI_1, weight 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]:     VI_2, weight 0
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: (VI_1) Entering BACKUP STATE (init)
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: (VI_2) Entering BACKUP STATE (init)
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: VRRP sockpool: [ifindex(  2), family(IPv4), proto(112), fd(12,13) multicast, address(224.0.0.18)]
Aug  2 14:46:03 ha-nginx-1 Keepalived_vrrp[878]: VRRP_Script(check_nginx_pid) succeeded
Aug  2 14:46:07 ha-nginx-1 Keepalived_vrrp[878]: (VI_1) Receive advertisement timeout
Aug  2 14:46:07 ha-nginx-1 Keepalived_vrrp[878]: (VI_1) Entering MASTER STATE
Aug  2 14:46:07 ha-nginx-1 Keepalived_vrrp[878]: (VI_1) setting VIPs.
Aug  2 14:46:07 ha-nginx-1 Keepalived_vrrp[878]: (VI_1) Sending/queueing gratuitous ARPs on ens192 for 10.255.1.111
Aug  2 14:46:07 ha-nginx-1 Keepalived_vrrp[878]: Sending gratuitous ARP on ens192 for 10.255.1.111
Aug  2 14:46:07 ha-nginx-1 Keepalived_vrrp[878]: Sending gratuitous ARP on ens192 for 10.255.1.111
Aug  2 14:46:07 ha-nginx-1 Keepalived_vrrp[878]: Sending gratuitous ARP on ens192 for 10.255.1.111
Aug  2 14:46:07 ha-nginx-1 Keepalived_vrrp[878]: Sending gratuitous ARP on ens192 for 10.255.1.111
Aug  2 14:46:07 ha-nginx-1 Keepalived_vrrp[878]: Sending gratuitous ARP on ens192 for 10.255.1.111
Aug  2 14:46:07 ha-nginx-1 Keepalived_vrrp[878]: (VI_2) Receive advertisement timeout
Aug  2 14:46:07 ha-nginx-1 Keepalived_vrrp[878]: (VI_2) Entering MASTER STATE
Aug  2 14:46:07 ha-nginx-1 Keepalived_vrrp[878]: (VI_2) setting VIPs.
Aug  2 14:46:07 ha-nginx-1 Keepalived_vrrp[878]: (VI_2) Sending/queueing gratuitous ARPs on ens192 for 10.255.1.222
Aug  2 14:46:07 ha-nginx-1 Keepalived_vrrp[878]: Sending gratuitous ARP on ens192 for 10.255.1.222
Aug  2 14:46:07 ha-nginx-1 Keepalived_vrrp[878]: Sending gratuitous ARP on ens192 for 10.255.1.222
Aug  2 14:46:07 ha-nginx-1 Keepalived_vrrp[878]: Sending gratuitous ARP on ens192 for 10.255.1.222
Aug  2 14:46:07 ha-nginx-1 Keepalived_vrrp[878]: Sending gratuitous ARP on ens192 for 10.255.1.222
Aug  2 14:46:07 ha-nginx-1 Keepalived_vrrp[878]: Sending gratuitous ARP on ens192 for 10.255.1.222
Aug  2 14:41:38 ha-nginx-1 Keepalived_vrrp[878]: (VI_2) Master received advert from 10.255.1.10 with higher priority 100, ours 99
Aug  2 14:41:38 ha-nginx-1 Keepalived_vrrp[878]: (VI_2) Entering BACKUP STATE
Aug  2 14:41:38 ha-nginx-1 Keepalived_vrrp[878]: (VI_2) removing VIPs.
Aug  2 14:41:41 ha-nginx-1 Keepalived_vrrp[878]: (VI_1) Sending/queueing gratuitous ARPs on ens192 for 10.255.1.111
Aug  2 14:41:41 ha-nginx-1 Keepalived_vrrp[878]: Sending gratuitous ARP on ens192 for 10.255.1.111
Aug  2 14:41:41 ha-nginx-1 Keepalived_vrrp[878]: Sending gratuitous ARP on ens192 for 10.255.1.111
Aug  2 14:41:41 ha-nginx-1 Keepalived_vrrp[878]: Sending gratuitous ARP on ens192 for 10.255.1.111
Aug  2 14:41:41 ha-nginx-1 Keepalived_vrrp[878]: Sending gratuitous ARP on ens192 for 10.255.1.111
Aug  2 14:41:41 ha-nginx-1 Keepalived_vrrp[878]: Sending gratuitous ARP on ens192 for 10.255.1.111
```


## nginx配置细节
- `*.idc.roywong.top`域名的A记录分别是`10.255.1.111`和`10.255.1.222`。
- 泛域名解析指向了两个`vip`，所以需要增加默认访问域名配置文件`/etc/nginx/conf.d/0__default.conf`，当访问不存在的域名时，返回`404`。
- 提供`https`服务，同时支持`http跳转https`。


## 安装过程
- `cd ansible && ansible-playbook ha-nginx.yml -t 'ssl,nginx'`
- `cd ansible && ansible-playbook ha-nginx-keepalived.yml`