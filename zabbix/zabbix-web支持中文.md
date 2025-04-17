# zabbix-server支持中文

## web安装界面支持中文
Rocky Linux 9 没有安装中文环境，在zabbix安装界面警告信息：`You are not able to choose some of the languages, 
because locales for them are not installed on the web server.`，其解决方法如下。
```shell
dnf install glibc-langpack-zh
localectl set-locale LANG="zh_CN.utf8"
systemctl restart zabbix-server zabbix-agent2 httpd php-fpm
```

## 监控图中无法显示中文
解决方法：上传微软雅黑字体`msyh.ttf`到服务器中，然后替换zabbix-web-font指定的字体即可。
```shell
[root@zabbix.freedom.org ~]# ll /etc/alternatives/zabbix-web-font 
lrwxrwxrwx 1 root root 49  5月 28 10:17 /etc/alternatives/zabbix-web-font -> /usr/share/fonts/dejavu-sans-fonts/DejaVuSans.ttf

[root@zabbix.freedom.org ~]# ll /usr/share/fonts/dejavu-sans-fonts/DejaVuSans.ttf
-rw-r--r-- 1 root root 15044440  5月 28 10:59 /usr/share/fonts/dejavu-sans-fonts/DejaVuSans.ttf

[root@zabbix.freedom.org ~]# cd /usr/share/fonts/dejavu-sans-fonts
[root@zabbix.freedom.org ~]# mv DejaVuSans.ttf DejaVuSans.ttf.orginal
[root@zabbix.freedom.org ~]# cp msyh.ttf DejaVuSans.ttf
```
