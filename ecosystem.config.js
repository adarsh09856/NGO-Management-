module.exports = {
  apps: [
    {
      name: 'drodul-phendey-ling-crm',
      script: './server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
