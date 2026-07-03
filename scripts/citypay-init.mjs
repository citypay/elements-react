#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";

const reset = "\x1b[0m";
const blue = "\x1b[38;2;0;67;117m";
const yellow = "\x1b[38;2;214;203;45m";
const green = "\x1b[32m";
const red = "\x1b[31m";
const dim = "\x1b[2m";
const bold = "\x1b[1m";

const isWindows = process.platform === "win32";
const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, "..");

const commands = {
  install: ["pnpm", ["install", "--config.confirmModulesPurge=false"]],
  buildLibrary: ["pnpm", ["lib:build"]],
  certs: isWindows
    ? ["pnpm", ["demo:certs:win"]]
    : ["pnpm", ["demo:certs:bash"]],
  env: isWindows
    ? ["powershell", ["-ExecutionPolicy", "Bypass", "-File", "./setup-env.ps1"]]
    : ["./setup-env.sh", []],
};

const certificateFiles = [
  "packages/demo-react/certs/localhost.pem",
  "packages/demo-react/certs/localhost-key.pem",
  "packages/demo-server/certs/localhost.pem",
  "packages/demo-server/certs/localhost-key.pem",
].map((file) => resolve(rootDir, file));

function printBanner() {
  const white = "\x1b[37m";

  console.log();
  console.log(`${blue}   ____ ___ _______   __${yellow} ____   ___  __   __${reset}`);
  console.log(`${blue}  / ___|_ _|_   _\\ \\ / /${yellow}|  _ \\ / _ \\ \\ \\ / /${reset}`);
  console.log(`${blue} | |    | |  | |  \\ V / ${yellow}| |_) | | | | \\ V / ${reset}`);
  console.log(`${blue} | |___ | |  | |   | |  ${yellow}|  __/| |_| |  | |  ${reset}`);
  console.log(`${blue}  \\____|___| |_|   |_|  ${yellow}|_|    \\___/   |_|  ${reset}`);
  console.log();
  console.log(`  ${bold}${white}CityPay Demo Environment Initializer${reset}`);
  console.log(`  ${dim}Secure local setup for CityPay Elements${reset}`);
  console.log();
}

function redact(value) {
  return value
    .replace(/\/\/([^/\s:@]+):([^@\s]+)@/g, "//[redacted]:[redacted]@")
    .replace(/(\/\/[^/\s]+\/[^:\s]+:)[^\s]+/g, "$1[redacted]")
    .replace(/((?:npm|node_auth|auth|token|password|secret|licen[cs]e)[^=\s]*\s*=\s*)[^\s]+/gi, "$1[redacted]")
    .replace(/([A-Za-z0-9_]*TOKEN[A-Za-z0-9_]*=)[^\s]+/g, "$1[redacted]")
    .replace(/([A-Za-z0-9_]*SECRET[A-Za-z0-9_]*=)[^\s]+/g, "$1[redacted]");
}

function writeChunk(stream, chunk) {
  stream.write(redact(chunk.toString()));
}

function run(command, args, options = {}) {
  return new Promise((resolveRun, rejectRun) => {
    const inheritOutput = options.inheritOutput === true;
    const child = spawn(command, args, {
      cwd: rootDir,
      env: process.env,
      shell: isWindows,
      stdio: inheritOutput ? "inherit" : ["inherit", "pipe", "pipe"],
    });

    if (!inheritOutput) {
      child.stdout.on("data", (chunk) => writeChunk(process.stdout, chunk));
      child.stderr.on("data", (chunk) => writeChunk(process.stderr, chunk));
    }

    child.on("error", (error) => {
      rejectRun(error);
    });

    child.on("close", (code, signal) => {
      if (code === 0) {
        resolveRun();
        return;
      }

      const reason = signal ? `signal ${signal}` : `exit code ${code}`;
      rejectRun(new Error(`${command} ${args.join(" ")} failed with ${reason}`));
    });
  });
}

async function runStep(label, command, args, options = {}) {
  console.log(`${yellow}>${reset} ${bold}${label}${reset}`);
  await run(command, args, options);
  console.log(`${green}[OK]${reset} ${label}`);
  console.log();
}

async function confirm(question, defaultValue = false) {
  const suffix = defaultValue ? "[Y/n]" : "[y/N]";
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const answer = (await rl.question(`${question} ${suffix}: `)).trim().toLowerCase();
    if (!answer) {
      return defaultValue;
    }
    return answer === "y" || answer === "yes";
  } finally {
    rl.close();
  }
}

async function configureCertificates() {
  const allCertificatesExist = certificateFiles.every((file) => existsSync(file));

  console.log(`${yellow}>${reset} ${bold}Generating trusted local certificates${reset}`);

  if (allCertificatesExist) {
    const regenerate = await confirm("Local certificates already exist. Regenerate them?", false);
    if (!regenerate) {
      console.log(`${green}[OK]${reset} Keeping existing local certificates`);
      console.log();
      return;
    }
  }

  await run(...commands.certs);
  console.log(`${green}[OK]${reset} Generating trusted local certificates`);
  console.log();
}

async function checkPrerequisites() {
  console.log(`${yellow}>${reset} ${bold}Checking prerequisites${reset}`);

  try {
    await run("node", ["--version"]);
  } catch (error) {
    throw new Error(`Node.js is required to run this initializer. ${error.message}`);
  }

  try {
    await run("pnpm", ["--version"]);
  } catch (error) {
    throw new Error(
      `pnpm is required. Enable it with: corepack enable && corepack prepare pnpm@11.9.0 --activate. ${error.message}`,
    );
  }

  console.log(`${green}[OK]${reset} Checking prerequisites`);
  console.log();
}

async function main() {
  printBanner();

  try {
    await checkPrerequisites();
    await runStep("Installing dependencies", ...commands.install);
    await runStep("Building local Elements package", ...commands.buildLibrary);
    await configureCertificates();
    await runStep("Configuring environment variables", ...commands.env, { inheritOutput: true });

    console.log(`${green}${bold}Initialization complete${reset}`);
    console.log();
    console.log(`${bold}Next steps:${reset}`);
    console.log("  pnpm demo:dev");
    console.log("  Open: https://localhost:3000");
    console.log();
  } catch (error) {
    console.error();
    console.error(`${red}${bold}Initialization failed${reset}`);
    console.error(`${red}${redact(error.message)}${reset}`);
    console.error();
    console.error("Fix the error above, then re-run:");
    console.error("  pnpm citypay-init");
    process.exitCode = 1;
  }
}

main();
