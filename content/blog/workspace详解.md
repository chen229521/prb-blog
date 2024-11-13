---
date: 2024-11-13 16:40
url: 
tags: 
title: workspace详解
en-title: workspace detail
---

![](https://api-shields.edui.fun/badge/Gemini-%E6%96%87%E7%AB%A0%E6%91%98%E8%A6%81-blue.svg?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjIiIGQ9Im0yMS42NCAzLjY0bC0xLjI4LTEuMjhhMS4yMSAxLjIxIDAgMCAwLTEuNzIgMEwyLjM2IDE4LjY0YTEuMjEgMS4yMSAwIDAgMCAwIDEuNzJsMS4yOCAxLjI4YTEuMiAxLjIgMCAwIDAgMS43MiAwTDIxLjY0IDUuMzZhMS4yIDEuMiAwIDAgMCAwLTEuNzJNMTQgN2wzIDNNNSA2djRtMTQgNHY0TTEwIDJ2Mk03IDhIM20xOCA4aC00TTExIDNIOSIvPjwvc3ZnPg==)

[](about:blank#%E7%8E%AF%E5%A2%83%E4%B8%8E%E7%89%88%E6%9C%AC "环境与版本")环境与版本
==========================================================================

*   `platform` => `mac os`
*   `node` => `v22.2.0`
*   `npm` => `10.8.0`
*   `pnpm` => `9.1.3`
*   `yarn` => `1.22.22`

[](about:blank#%E5%90%8D%E8%AF%8D%E8%A7%A3%E9%87%8A "名词解释")名词解释
===============================================================

[](about:blank#monorepo "monorepo")monorepo
-------------------------------------------

利用单一仓库来管理多个 `packages` 的一种策略，如早期的 `lerna`

[](about:blank#workspace "workspace")workspace
----------------------------------------------

由上述单仓多包催生的管理方式，`workspace`（工作空间） 是 `npm`、`yarn`、`pnpm` 等包管理工具提供的一种特性，用于管理多个包的依赖关系。  
合理配置 `workspace` 后，包之间互相依赖不需要使用 `npm link`，将在 `install` 时中处理

[](about:blank#%E5%9C%A8-pnpm-%E4%B8%AD%E4%BD%BF%E7%94%A8-workspace "在 pnpm 中使用 workspace")在 `pnpm` 中使用 `workspace`
===================================================================================================================

**A workspace must have a [pnpm-workspace.yaml](https://pnpm.io/zh/pnpm-workspace_yaml) file in its root. A workspace also may have an [.npmrc](https://pnpm.io/zh/npmrc) in its root.**  
如文档描述，启用 `pnpm` 的 `workspace` 需要在项目**根目录**创建 `pnpm-workspace.yaml`

[](about:blank#%E9%A1%B9%E7%9B%AE%E7%BB%93%E6%9E%84 "项目结构")项目结构
---------------------------------------------------------------

```
my-monorepo
├── docs
├── apps
│   └── web
├── packages
│   ├── ui
│   ├── eslint-config
│   └── shared-utils
├── pnpm-workspace.yaml
├── .npmrc => optional
└── sdk
```

### [](about:blank#%E6%A0%B9%E7%9B%AE%E5%BD%95-package-json "根目录 package.json")根目录 `package.json`

`private`: [**If you set “private”: true in your package.json, then npm will refuse to publish it.**](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#private)

私有化为 `true` 时，在 `publish` 时 `npm` 将不会处理该 `package`，你可以在项目的根目录配置，或在不需要被 `publish` 的 `workspace` 中配置它

```


/my-monorepo/package.json

`{   "name": "my-monorepo",   "private": true,   "script": {     "dev": "pnpm -r dev"   } }` 
```

[](about:blank#pnpm-workspace-yaml "pnpm-workspace.yaml")pnpm-workspace.yaml
----------------------------------------------------------------------------

在该项目中指定位于 `my-monorepo/apps/` 和 `my-monorepo/packages/` 内的直接子目录为工作区如 `web`、`ui`等  
而 `docs` 本身则为一个工作区，则不需要通配符

```


pnpm-workspace.yaml

`packages:   - "docs"   - "apps/*"   - "packages/*"`
```

### [](about:blank#%E5%85%B7%E4%BD%93%E8%AF%AD%E6%B3%95-glob-%E9%80%9A%E9%85%8D%E7%AC%A6 "具体语法 - glob 通配符")具体语法 - glob 通配符

> [pnpm-workspace.yaml](https://pnpm.io/zh/pnpm-workspace_yaml)

```


pnpm-workspace.yaml

`packages:   # 选择 packages 目录下的所有首层子目录的包   - 'packages/*'   # 选择 components 目录下所有层级的包   - 'components/**'   # 排除所有包含 test 的包   - '!**/test/**'`
```

[](about:blank#%E5%AE%89%E8%A3%85%E4%BE%9D%E8%B5%96 "安装依赖")安装依赖
---------------------------------------------------------------

```


/my-monorepo/

`pnpm install`
```

### [](about:blank#%E5%9C%A8%E6%A0%B9%E7%9B%AE%E5%BD%95%E4%B8%AD%E5%AE%89%E8%A3%85%E4%BE%9D%E8%B5%96 "在根目录中安装依赖")在根目录中安装依赖

> [–workspace-root](https://pnpm.io/zh/pnpm-cli#-w---workspace-root)

```


/my-monorepo/

`pnpm add <package-name> -w # or pnpm add <package-name> --workspace-root`
```

### [](about:blank#%E7%BB%99%E6%8C%87%E5%AE%9A-workspace%EF%BC%88%E5%B7%A5%E4%BD%9C%E7%A9%BA%E9%97%B4%EF%BC%89-%E5%AE%89%E8%A3%85%E4%BE%9D%E8%B5%96 "给指定 workspace（工作空间） 安装依赖")给指定 `workspace`（工作空间） 安装依赖

`--filter` 为 `package.json` `name`

```


/my-monorepo/

`pnpm add <package-name> --filter <workspace-name> # or pnpm add lodash --filter docs`
```

### [](about:blank#%E6%9B%B4%E6%96%B0%E4%BE%9D%E8%B5%96 "更新依赖")更新依赖

更新根目录依赖，看执行路径

```
pnpm update <package-name> [-w]
```

更新指定 `workspace` 依赖

```
pnpm update <package-name> --filter <workspace-name>
# or
pnpm update lodash --filter docs
```

卸载依赖

```
pnpm uninstall <package-name> [-w]
# or
pnpm uninstall <package-name> --filter <workspace-name>
# or
pnpm uninstall lodash --filter docs
```

### [](about:blank#%E6%89%A7%E8%A1%8C%E8%84%9A%E6%9C%AC "执行脚本")执行脚本

**执行 workspace 中的脚本**

```
pnpm dev --filter docs
```

**执行所有 workspace 中脚本**

```
pnpm -r dev
# or
$ pnpm --recursive dev
```

**或者在根目录的 package.json 中配置**

```


/my-monorepo/package.json

`{   "name": "my-monorepo",   "script": {     "docs:dev": "pnpm dev --filter docs"   } }` 
```

**直接执行**

```
pnpm docs:dev
```

### [](about:blank#%E5%AE%89%E8%A3%85%E5%86%85%E9%83%A8-workspace-%E4%BE%9D%E8%B5%96 "安装内部 workspace 依赖")安装内部 `workspace` 依赖

```
pnpm add <package-name> --filter <workspace-name>
# or
pnpm add web --filter docs
```

*   请注意你当前的 `pnpm` 版本，在 `9.0` 后 `pnpm` 修改 `link-workspace-packages` 的默认值为 `false`。该属性开启后，你在安装依赖时优先在本地链接，而不是从 `registry`（远程） 中下载。
*   **所以在这个版本你若需要使用**命令**安装一个`新的` `workspace` 中的依赖需要在 `.npmrc` 中启用 `link-workspace-packages`**
*   当然主动在 `package.json` 中声明的依赖不受影响，如 `web: "workspace:*"`，`pnpm` 还是会自动处理，这种不确定性的执行结果可能是导致 `pnpm` 在该版本中禁用了该值

> [https://github.com/pnpm/pnpm/issues/7954#issuecomment-2062830615](https://github.com/pnpm/pnpm/issues/7954#issuecomment-2062830615)  
> [9.x pnpm link-workspace-packages](https://pnpm.io/zh/npmrc#link-workspace-packages)  
> [8.x pnpm link-workspace-packages](https://pnpm.io/zh/8.x/npmrc#link-workspace-packages)

**在 `.npmrc` 中**

```


.npmrc

`link-workspace-packages = true`
```

**或临时启用**

```
pnpm add <package-name> --filter <workspace-name> --link-workspace-packages=true
# or
pnpm add web --filter docs --link-workspace-packages=true
```

**执行结果**

```


/my-monorepo/packages/docs/package.json

`{   "name": "docs",   "dependencies": {     "web": "workspace:^"   } }`
```

### [](about:blank#%E4%BB%80%E4%B9%88%E6%98%AF-workspace-semver-%E7%89%88%E6%9C%AC "什么是 workspace:^ - semver 版本")什么是 `workspace:^` - semver 版本

你可能好奇 `workspace:^` 是怎么生成的，后面 `pnpm` 是怎么如何转化的？

当你将依赖项添加到 `package.json` 中时，`pnpm` 根据 `.npmrc` 或命令行中的 `save-workspace-protocol` 字段来决定是否使用 `workspace:` 协议，并根据 `save-prefix` 字段来决定版本的前缀（[semver](https://semver.org/lang/zh-CN/)）

例如，`save-prefix` 为 `"~"` ，`save-workspace-protocol` 为 `true` 时

> [save-workspace-protocol](https://pnpm.io/zh/npmrc#save-workspace-protocol)

```
{
  "name": "docs",
  "dependencies": {
    "web": "workspace:~1.0.0"
  }
}
```

#### [](about:blank#%E8%BD%AC%E5%8C%96 "转化")转化

```
{
	"dependencies": {
		"foo": "workspace:*",
		"bar": "workspace:~",
		"qar": "workspace:^",
		"zoo": "workspace:^1.5.0"
	}
}
```
```
{
	"dependencies": {
		"foo": "1.5.0",
		"bar": "~1.5.0",
		"qar": "^1.5.0",
		"zoo": "^1.5.0"
	}
}
```

[](about:blank#%E6%80%BB%E7%BB%93 "总结")总结
-----------------------------------------

常用命令

```
# 安装依赖
$ pnpm install

# 给指定 workspace 安装依赖
$ pnpm add <package-name> --filter <workspace-name>

# 卸载依赖
$ pnpm uninstall <package-name> --filter <workspace-name>

# 更新依赖
$ pnpm update <package-name> --filter <workspace-name>

# 给根目录安装依赖 - -w 为安装 -workspace-root
$ pnpm add <package-name> -<D>w

# 内部包的互相引用 - 前提 .npmrc 中配置 link-workspace-packages = true
# 若未配置需手动
$ pnpm add <package-name> --filter <workspace-name>

# 执行 workspace 中的脚本, 或者在根目录的 package.json 中配置
$ pnpm dev --filter docs
# 执行所有 workspace 中的脚本 
$ pnpm -r dev
# or
$ pnpm --recursive dev
```

[](about:blank#%E5%9C%A8-npm-%E4%B8%AD%E4%BD%BF%E7%94%A8-workspace "在 npm 中使用 workspace")在 `npm` 中使用 `workspace`
================================================================================================================

[](about:blank#%E9%A1%B9%E7%9B%AE%E7%BB%93%E6%9E%84-1 "项目结构")项目结构
-----------------------------------------------------------------

```
my-monorepo
├── docs
├── apps
│   └── web
├── packages
│   ├── ui
│   ├── eslint-config
│   └── shared-utils
├── package.json
└── sdk
```

[](about:blank#%E5%9C%A8-package-json-%E4%B8%AD%E9%85%8D%E7%BD%AE-workspace "在 package.json 中配置 workspace")在 `package.json` 中配置 `workspace`
-------------------------------------------------------------------------------------------------------------------------------------------

路径语法与 `pnpm` 一致 => [具体语法 - glob 通配符](about:blank#%E5%85%B7%E4%BD%93%E8%AF%AD%E6%B3%95-glob-%E9%80%9A%E9%85%8D%E7%AC%A6)

```
{
  "name": "my-monorepo",
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

[](about:blank#%E5%91%BD%E4%BB%A4%E5%88%9D%E5%A7%8B%E5%8C%96%E5%AD%90%E5%8C%85 "命令初始化子包")命令初始化子包
------------------------------------------------------------------------------------------------

根据提供的路径创建 `workspace`（路径不存在，则创建），并在根目录的 `package.json` 中添加 `workspace` 路径（若已经配置相关路径，则不会）

```
npm init -w ./newFolder/hooks -y
# or
npm init -w ./packages/hooks -y
```

[](about:blank#%E4%B8%BA-workspace-%E6%B7%BB%E5%8A%A0%E3%80%81%E6%9B%B4%E6%96%B0%E3%80%81%E7%A7%BB%E9%99%A4%E4%BE%9D%E8%B5%96 "为 workspace 添加、更新、移除依赖")为 `workspace` 添加、更新、移除依赖
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

```
npm install lodash -w docs
npm uninstall lodash -w docs
npm update lodash -w docs

# or
npm install lodash --workspace=docs
```

[](about:blank#%E4%BE%9D%E8%B5%96%E5%86%85%E9%83%A8%E7%9A%84-workspace "依赖内部的 workspace")依赖内部的 `workspace`
----------------------------------------------------------------------------------------------------------

与 `pnpm` 不同的是 `npm` 是直观的版号，当然你需要修改 `semver` 规则，可参考 [save-prefix](https://docs.npmjs.com/cli/v8/using-npm/config#save-prefix)

```
npm install ui -w docs
```
```


/my-monorepo/packages/docs/package.json

`{   "name": "docs",   "dependencies": {     "ui": "^1.0.0"   } }`
```

[](about:blank#%E6%89%A7%E8%A1%8C%E8%84%9A%E6%9C%AC-1 "执行脚本")执行脚本
-----------------------------------------------------------------

```
npm run dev -w docs
# run many
npm run dev -w docs -w ui

# or
npm run dev --workspace=docs
npm run test --workspace=docs --workspace=ui
```

### [](about:blank#%E6%89%B9%E9%87%8F%E6%89%A7%E8%A1%8C-workspace-%E5%86%85%E7%9A%84%E8%84%9A%E6%9C%AC "批量执行 workspace 内的脚本")批量执行 `workspace` 内的脚本

`--if-present` 避免 `workspace` 中不含当前脚本的报错

```
npm run dev

# or
npm run dev --if-present
```

[](about:blank#%E5%9C%A8%E6%A0%B9%E7%9B%AE%E5%BD%95-package-json-%E4%B8%AD%E8%BF%90%E8%A1%8C-workspace-%E4%B8%AD%E7%9A%84%E8%84%9A%E6%9C%AC "在根目录 package.json 中运行 workspace 中的脚本")在根目录 package.json 中运行 workspace 中的脚本
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

在此处配置一些常用的脚本命令

```


/my-monorepo/package.json

`{   "name": "my-monorepo",   "script": {     "dev": "npm run dev",     "docs:dev": "npm run dev -w docs"   } }`
```

[](about:blank#%E6%80%BB%E7%BB%93-1 "总结")总结
-------------------------------------------

```
# 新增子包
npm init -w ./packages/docs -y

# 为子包添加依赖
npm install lodash -w docs

# 运行子包的dev脚本
npm run dev -w docs

# 运行所有 workspace dev脚本
npm run dev
```

[](about:blank#%E5%9C%A8-yarn-%E4%B8%AD%E4%BD%BF%E7%94%A8-workspace "在 yarn 中使用 workspace")在 `yarn` 中使用 `workspace`
===================================================================================================================

`yarn` 与 `npm` 大体一致，此处不阐述相同点。

[](about:blank#%E5%91%BD%E4%BB%A4 "命令")命令
-----------------------------------------

### [](about:blank#yarn-workspaces-info-%E6%9F%A5%E8%AF%A2-workspace-%E4%B9%8B%E9%97%B4%E4%BE%9D%E8%B5%96%E5%85%B3%E7%B3%BB "yarn workspaces info - 查询 workspace 之间依赖关系")`yarn workspaces info` - 查询 workspace 之间依赖关系

```
yarn workspaces info
```

执行结果：

```
{
  "docs": {
    "location": "docs",
    "workspaceDependencies": [
      "eslint-config",
      "typescript-config",
      "ui"
    ],
    "mismatchedWorkspaceDependencies": []
  },
  "web": {
    "location": "web",
    "workspaceDependencies": [
      "eslint-config",
      "typescript-config"
    ],
    "mismatchedWorkspaceDependencies": []
  }
}
```

### [](about:blank#yarn-workspace-%E7%BB%99-workspace-%E5%AE%89%E8%A3%85%E4%BE%9D%E8%B5%96 "yarn workspace <package-name> <command> - 给 workspace 安装依赖")`yarn workspace <package-name> <command>` - 给 workspace 安装依赖

```
# 添加依赖
yarn workspace docs add lodash

# 移除依赖
yarn workspace docs remove lodash
```

### [](about:blank#yarn-add-W-%E6%A0%B9%E7%9B%AE%E5%BD%95%E5%AE%89%E8%A3%85%E4%BE%9D%E8%B5%96 "yarn add <package-name> -W - 根目录安装依赖")`yarn add <package-name> -W` - 根目录安装依赖

```
yarn add lodash -w
```

### [](about:blank#yarn-workspace-add-%E5%AE%89%E8%A3%85%E5%86%85%E9%83%A8%E4%BE%9D%E8%B5%96 "yarn workspace <package-name> add <package-name@version> - 安装内部依赖")`yarn workspace <package-name> add <package-name@version>` - 安装内部依赖

```
yarn workspace docs add ui@1.0.0
# or
yarn workspace docs add ui@^1.0.0
```

此处必须加上`版本号`，你可以手动加上 `semver` 前缀，但需要与 `package.json` 中的版本号保持一致即可，否则会去远程下载。

  

本文转自 [https://ksh7.com/posts/pnpm-use-workspace/index.html](https://ksh7.com/posts/pnpm-use-workspace/index.html)，如有侵权，请联系删除。