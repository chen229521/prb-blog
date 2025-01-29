---
title: nginx判断用户是手机还是pc
date: 2023-11-09
---

### 最终采用的方案

```text

location / {
          #alias /var/docker/nginx/html/aiot/;
      # 控制缓存设置，避免重定向结果被缓存
          add_header Cache-Control "no-cache, no-store, must-revalidate";
          expires off;
      if ($http_user_agent ~* '(Mobile|Android|iPhone|iPod|BlackBerry)') {
            return 302 http://10.100.50.67/aiot_mobile; # 跳转到移动端网站
        }
          root /usr/share/nginx/html/aiot; 
          try_files $uri $uri/ /index.html; 
          #index index.html index.htm;
        }

```