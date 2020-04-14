const { configFilePath } = require("./paths");
const { isFunction, isArray, deepMergeWithArray } = require("./utils");
const { log } = require("./logger");
const { applyCracoConfigPlugins } = require("./features/plugins");
const { POSTCSS_MODES } = require("./features/webpack/style/postcss");
const { ESLINT_MODES } = require("./features/webpack/eslint");

// 默认的 craco 注入配置
const DEFAULT_CONFIG = {
    reactScriptsVersion: "react-scripts",
    style: {
        postcss: {
            mode: POSTCSS_MODES.extends // 默认的配置处理都是合并 而不是覆盖
        }
    },
    eslint: {
        mode: ESLINT_MODES.extends
    },
    jest: {
        babel: {
            addPresets: true,
            addPlugins: true
        }
    }
};

// 检查 plugins 的注入格式是否准确
function ensureConfigSanity(cracoConfig) {
    if (isArray(cracoConfig.plugins)) {
        cracoConfig.plugins.forEach((x, index) => {
            if (!x.plugin) {
                throw new Error(`craco: Malformed plugin at index: ${index} of 'plugins'.`);
            }
        });
    }
}

function processCracoConfig(cracoConfig, context) {
    let resultingCracoConfig = deepMergeWithArray({}, DEFAULT_CONFIG, cracoConfig); // 这里和默认值合并 如果是对象走 Object.assign 如果是数组走 concat
    ensureConfigSanity(resultingCracoConfig); // 检查 craco plugins 的配置格式是否正确

    return applyCracoConfigPlugins(resultingCracoConfig, context); // 执行 craco plugins 中的 overrideCracoConfig 回调函数配置
}

function loadCracoConfig(context) {
    log("Found craco config file at: ", configFilePath);

    const config = require(configFilePath);
    const configAsObject = isFunction(config) ? config(context) : config;

    if (!configAsObject) {
        throw new Error("craco: Config function didn't returned a config object.");
    }

    return processCracoConfig(configAsObject, context);
}

module.exports = {
    loadCracoConfig,
    processCracoConfig
};
