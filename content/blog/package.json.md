---
date: 2024-11-13 16:40
url: 
tags: 
title: package.json 个人总结
en-title: package-json-personal-summary
---


package.json 日常使用的积累与常用技巧

- 常用字段的含义


## 1 . bin字段
bin 字段指定了你的包中哪些文件应该作为可执行文件。

```json
  "bin": {
    "命令前缀名": "./bin.ts"
  },
```