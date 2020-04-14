process.env.NODE_ENV = "production";

const { findArgsFromCli } = require("../lib/args");

// Make sure this is called before "paths" is imported.
findArgsFromCli(); // 将 args 中 --config / --verbose 属性格式化缓存起来 其中 verbose 属性表示将构建流程中的内容都暴露到 console.log 中

const { log } = require("../lib/logger");
const { getCraPaths, build } = require("../lib/cra");
const { loadCracoConfig } = require("../lib/config");
const { overrideWebpackProd } = require("../lib/features/webpack/override");

log("Override started with arguments: ", process.argv);
log("For environment: ", process.env.NODE_ENV);

const context = {
    env: process.env.NODE_ENV
};

const cracoConfig = loadCracoConfig(context); // 格式化 craco config 配置 执行 craco plugins 完成属性的注入
context.paths = getCraPaths(cracoConfig); // 获取 cra 中 path 对象 保存到 context 中

overrideWebpackProd(cracoConfig, context); // 基于用户的配置来改写 cra 原始的 webpack config
build(cracoConfig); // 仍旧使用 cra 来开启构建
