export default {
  '*.{ts,tsx}': ['eslint --flag unstable_native_nodejs_ts_config .'],
  '*.{pcss,css,scss}': ['npm run lint:style'],
  '*.cs': ['npm run lint:csharp']
};
