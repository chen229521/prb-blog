// .eslintrc.cjs
module.exports = {
  /**
   * 默认情况下，ESLint 会在所有父级目录里寻找配置文件，一直到根目录
   * 为了将 ESLint 限制到一个特定的项目 设置 'root': true
   * ESLint 一旦发现配置文件中有 'root': true，它就会停止在父级目录中寻找。
   */
  root: true,
  // 指定环境
  env: {
    // 浏览器环境中的全局变量
    browser: true,
    // Node.js 全局变量和 Node.js 作用域
    node: true,
    // 支持es6
    es6: true,
  },
  // 定义全局变量
  globals: {
    // script setup
    defineProps: "readonly",
    defineEmits: "readonly",
    defineExpose: "readonly",
  },
  // 解析器只能有一个。安装了vue-eslint-parser就无需安装babel-eslint
  parser: "vue-eslint-parser",
  // 解析器配置项
  parserOptions: {
    // ESLint默认是使用 Espree 进行语法解析, 无法解析ts,因此使用@typescript-eslint/parser替代默认解析器
    parser: "@typescript-eslint/parser",
    ecmaVersion: 2020,
    //  设置为 'script' (默认) 或 'module'（如果你的代码是 ECMAScript 模块)
    sourceType: "module",
  },
  extends: [
    // 最基本配置
    "plugin:vue/vue3-essential",
    // // eslint官方推荐使用,vue3的规则集是plugin:vue/vue3-recommended
    "eslint:recommended", // 代码快速修复可以选择引入第三方库
    "@vue/typescript/recommended",
    // @vue/eslint-config-prettier插件
    "@vue/prettier",
    "@vue/eslint-config-typescript",
  ],
  rules: {
    // 去除v-html被eslint所警告
    "vue/no-v-html": "off",
    // 去除JSX等类型被eslint所警告
    "no-undef": "off",
    // 允许在 case 子句中使用词法声明
    "no-case-declarations": "off",
    // 不检查默认属性
    "vue/require-default-prop": "off",
    // 关闭没有声明emits
    "vue/require-explicit-emits": "off",
    // 关闭组件名命名规则
    "vue/multi-word-component-names": "off",
    // 关闭any类型的警告
    "@typescript-eslint/no-explicit-any": "off",
    // eslint规则没有开始debugger,手动放开
    "no-debugger": "off",
    // 关闭每个函数都需要return对应type
    "@typescript-eslint/explicit-module-boundary-types": "off",
    // 忽略默认禁止类型
    "@typescript-eslint/ban-types": "off",
    // 使用@ts-ignore会检查报错，故添加忽略规则
    "@typescript-eslint/ban-ts-comment": "off",
    // 关闭对empty函数的校验
    "@typescript-eslint/no-empty-function": "off",
    // 关闭!non-null断言警告
    "@typescript-eslint/no-non-null-assertion": "off",
    // 允许html里单标签的单闭合
    "vue/html-self-closing": [
      "error",
      {
        html: {
          void: "always",
          normal: "always",
          component: "always",
        },
        svg: "always",
        math: "always",
      },
    ],
    // 允许类型定义但没使用
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
      },
    ],
    // 禁止不必要的转义字符
    "no-useless-escape": 0,
  },
};
