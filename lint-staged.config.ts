export default {
  '*.ts': ['eslint --flag unstable_native_nodejs_ts_config'],
  '*.html': ['eslint --flag unstable_native_nodejs_ts_config'],
  '*.{scss,css}': ["stylelint '*.{css,scss}'"]
};
