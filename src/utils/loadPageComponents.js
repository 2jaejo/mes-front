// src/loadComponents.js

const context = require.context('../pages', true, /\.jsx$/);

const components = {};

context.keys().forEach((key) => {
  const module = context(key).default;
  
  // 예: './common/Button.jsx' → ['common', 'Button']
  const parts = key.replace('./', '').replace(/\.\w+$/, '').split('/');

  components[parts[1]] = module;
});

export default components;