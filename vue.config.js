// vue.config.js

module.exports = {
  chainWebpack: (config) => {
    config.module
      .rule("vue")
      .use("vue-loader")
      .tap((options) => {
        options.compilerOptions = {
          isCustomElement: (tag) => tag === "close-one", // 设置自定义元素的标签名
        };
        return options;
      });
  },
};
