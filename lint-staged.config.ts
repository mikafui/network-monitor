export default {
  '*.ts': ['eslint --flag unstable_native_nodejs_ts_config'],
  '*.html': ['eslint --flag unstable_native_nodejs_ts_config'],
  '*.{scss,css}': ['npm run lint:style']
};
