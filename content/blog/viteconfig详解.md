---
date: 2024-11-14 14:57:36
url: 
tags: 
title: viteconfig详解
en-title: viteconfig Detail
---

# 字段解释

记录部分字段的解释

## service

在 Vite 的配置文件 vite.config.ts 中，server 字段用于配置开发服务器的行为。

### fs

1. **allow**
   - **类型**: `string[]`
   - **默认值**: `['.']`
   - **描述**: 指定允许访问的文件系统路径。这可以用于限制开发服务器可以访问的目录范围，提高安全性。

2. **deny**
   - **类型**: `string[]`
   - **默认值**: `[]`
   - **描述**: 指定禁止访问的文件系统路径。这可以用于进一步限制开发服务器的访问权限。

3. **cachedChecks**
   - **类型**: `boolean`
   - **默认值**: `false`
   - **描述**: 启用或禁用文件系统检查的缓存。启用后，可以显著减少 I/O 操作，提高性能。

 示例配置

以下是一个示例 `vite.config.ts` 文件，展示了如何配置 `server.fs` 字段：

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    fs: {
      allow: ['.', '../shared'], // 允许访问当前目录和 ../shared 目录
      deny: ['../private'], // 禁止访问 ../private 目录
      cachedChecks: true, // 启用文件系统检查缓存
    },
  },
});
```

 解释

- **allow**: 通过指定允许访问的路径，可以确保开发服务器只能访问指定的目录。这对于多项目共享开发环境特别有用。
- **deny**: 通过指定禁止访问的路径，可以进一步限制开发服务器的访问权限，提高安全性。
- **cachedChecks**: 启用文件系统检查缓存可以减少 I/O 操作，提高开发服务器的性能。

通过合理配置 `server.fs` 字段，可以更好地控制开发服务器的文件系统访问行为，提高开发效率和安全性。