// task-3100b6ea5164 — PM2-Fallback fuer Hosting-Umgebungen ohne systemd.
//
// Installation:
//   npm install -g pm2
//   pm2 start deploy/pm2.config.cjs --env production
//   pm2 save
//   pm2 startup            # Auto-Start nach Reboot
//
// PM2 monitoring: pm2 logs workforce-time, pm2 monit
//
// Variablen via .env (process.env wird durchgereicht):
//   CORTEX_TENANT_DIR, ARBEITSZEITEN_API_HOST, ARBEITSZEITEN_API_PORT.

module.exports = {
  apps: [
    {
      name: "workforce-time",
      script: "/var/www/arbeitszeiten/server/api.js",
      cwd: "/var/www/arbeitszeiten",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        ARBEITSZEITEN_API_HOST: "127.0.0.1",
        ARBEITSZEITEN_API_PORT: "5175"
      },
      env_production: {
        NODE_ENV: "production"
      },
      error_file: "/var/log/workforce-time/error.log",
      out_file: "/var/log/workforce-time/out.log",
      time: true
    }
  ]
};
