# 监控dell物理服务器

## 说明
- 监控物理机，当前使用`snmp`协议完成，访问其`iDRAC`地址，模板为`Dell iDRAC by SNMP`。
- `iDRAC`团体名为`public`（默认值），其`SNMP OID`的值要为`.1.3.6.1.4.1.674.10892.2.1.1.2.0`。
  ```shell
  [root@wang-hao-hao-01.indv.freedom.org ~ 17:15]# 5> snmpget -v 2c -c public 10.255.0.51 .1.3.6.1.4.1.674.10892.2.1.1.2.0
  SNMPv2-SMI::enterprises.674.10892.2.1.1.2.0 = STRING: "iDRAC8"
  [root@wang-hao-hao-01.indv.freedom.org ~ 17:16]# 6> 
  ```

## 配置过程
![Dell-iDRAC-by-SNMP-1.png](images/Dell-iDRAC-by-SNMP-1.png)


## 监控结果
![Dell-iDRAC-by-SNMP-2.png](images/Dell-iDRAC-by-SNMP-2.png)