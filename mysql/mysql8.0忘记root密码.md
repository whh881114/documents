# MySQL 8.0 忘记 root 密码恢复手册（一次性前台启动法｜不改配置文件）

> 适用系统：Linux（systemd 管理的 `mysqld`/`mysql` 服务，例如 Rocky/CentOS/Ubuntu 等）  
> 思路：临时以前台方式启动 `mysqld` 并启用 `--skip-grant-tables --skip-networking`，本机免密进库修改 root 密码，完成后恢复正常启动。

---

## 0. 风险与前置条件

- **风险提示**：在「跳过权限表」期间，任何能访问本机 Unix Socket 的用户都可免密进库。务必在本机操作，并尽快恢复正常模式。
- **确认信息**：
  - 数据目录（默认 `/var/lib/mysql`）
  - 服务名（常见为 `mysqld` 或 `mysql`）
  - 具备 `sudo` 权限的系统账号

---

## 1. 停止正在运行的 MySQL 服务

```bash
sudo systemctl stop mysqld    # 或者 sudo systemctl stop mysql
```

确认已停止（可选）：
```bash
systemctl status mysqld | cat
```

---

## 2. 以前台方式启动「跳权」实例

> 该命令会在当前终端前台占用。**不要关闭此终端**，后续会在**新终端**里改密码。

```bash
sudo mysqld --skip-grant-tables --skip-networking --datadir=/var/lib/mysql
```

若你的数据目录不同，请替换 `--datadir` 路径。

---

## 3. 在新终端中连接并重置 root 密码

打开**第二个**终端，执行：

```bash
# 方式一：默认本机套接字
mysql -uroot

# 方式二：显式指定 socket（路径视发行版而定）
# mysql --socket=/var/lib/mysql/mysql.sock -uroot
```

进入 MySQL 后，先刷新权限，再修改密码：

```sql
FLUSH PRIVILEGES;

-- 常规做法（8.0 默认插件为 caching_sha2_password）
ALTER USER 'root'@'localhost' IDENTIFIED BY 'Your.New-P@ssw0rd!';

-- 若报插件相关错误，可显式指定插件：
-- ALTER USER 'root'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'Your.New-P@ssw0rd!';
```

> 说明：必须先执行 `FLUSH PRIVILEGES;`，否则在 `--skip-grant-tables` 下可能出现  
> `ERROR 1290 (HY000): The MySQL server is running with the --skip-grant-tables option ...`

退出 MySQL：
```sql
EXIT;
```

---

## 4. 停掉前台实例并恢复正常启动

返回**第一终端**（前台 `mysqld` 所在窗口），`Ctrl + C` 结束该前台进程：

```bash
# 在前台窗口按 Ctrl+C 结束
```

然后以 systemd 方式正常启动：

```bash
sudo systemctl start mysqld
```

---

## 5. 验证登录

```bash
mysql -uroot -p
```

输入你在第 3 步设置的新密码，应可正常进入。

---

## 6. 常见问题

- **老客户端无法连接（认证插件不兼容）**  
  旧客户端不支持 `caching_sha2_password` 时，可把 root 临时切换为老插件：
  ```sql
  ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Your.New-P@ssw0rd!';
  ```
  完成后建议升级客户端，或将管理账号与业务账号分离。

- **Socket 位置不一致**  
  不同发行版的 socket 可能在 `/var/lib/mysql/mysql.sock`、`/var/run/mysqld/mysqld.sock` 等路径。可用如下命令查找：
  ```bash
  mysqladmin variables | grep -i socket
  ```

- **数据目录权限/SELinux**  
  若自定义数据目录，确保属主属组为 `mysql:mysql`，SELinux 开启时需正确的上下文标记（如 `semanage fcontext` + `restorecon`）。

---

## 7. 安全收尾建议

- 仅允许 root 从 `localhost` 登录，远程管理请创建**单独账号**并最小化权限。
- 立即记录并妥善保管新密码；考虑启用密码管理器与定期轮换策略。
- 确保 MySQL 以正常模式运行，不再残留任何「跳权」启动方式或参数。

---

**完成。**
