import { spawn } from "node:child_process";

const processes = [
  spawn("node", ["server/api.js"], {
    stdio: "inherit",
    env: process.env
  }),
  spawn("npx", ["vite", "--host", "127.0.0.1"], {
    stdio: "inherit",
    env: process.env
  })
];

let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  for (const child of processes) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
  process.exit(exitCode);
}

for (const child of processes) {
  child.on("exit", (code, signal) => {
    if (!shuttingDown) {
      console.log(`Dev-Teilprozess beendet (${signal ?? code}).`);
      shutdown(code ?? 1);
    }
  });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
