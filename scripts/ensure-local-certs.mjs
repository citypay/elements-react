#!/usr/bin/env node
import { spawn } from "node:child_process";
import {
  X509Certificate,
  createPrivateKey,
  createPublicKey,
} from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, "..");
const renewalDays = Number.parseInt(process.env.CITYPAY_CERT_RENEWAL_DAYS ?? "30", 10);

if (!Number.isInteger(renewalDays) || renewalDays < 0) {
  throw new Error("CITYPAY_CERT_RENEWAL_DAYS must be a non-negative integer");
}

const targets = {
  "demo-react": {
    packageName: "@citypay/elements-react-demo",
    label: "React demo",
    directory: "demo-react",
    hostname: "dev.citypay.local",
  },
  "demo-server": {
    packageName: "@citypay/elements-demo-server",
    label: "demo server",
    directory: "demo-server",
    hostname: "localhost",
  },
};

function getCertificateIssue(target) {
  const certPath = resolve(rootDir, "packages", target.directory, "certs", "localhost.pem");
  const keyPath = resolve(rootDir, "packages", target.directory, "certs", "localhost-key.pem");

  if (!existsSync(certPath) || !existsSync(keyPath)) {
    return "certificate or private key is missing";
  }

  try {
    const certificate = new X509Certificate(readFileSync(certPath));
    const privateKey = createPrivateKey(readFileSync(keyPath));
    const certificateKey = certificate.publicKey.export({ type: "spki", format: "der" });
    const privateKeyPublicPart = createPublicKey(privateKey).export({ type: "spki", format: "der" });

    if (!certificateKey.equals(privateKeyPublicPart)) {
      return "certificate and private key do not match";
    }

    if (!certificate.checkHost(target.hostname)) {
      return `certificate does not cover ${target.hostname}`;
    }

    const validFrom = Date.parse(certificate.validFrom);
    const validTo = Date.parse(certificate.validTo);
    const renewalDeadline = Date.now() + renewalDays * 24 * 60 * 60 * 1000;

    if (!Number.isFinite(validFrom) || !Number.isFinite(validTo)) {
      return "certificate validity dates are invalid";
    }
    if (validFrom > Date.now()) {
      return "certificate is not valid yet";
    }
    if (validTo <= renewalDeadline) {
      return `certificate expires within ${renewalDays} days`;
    }

    return null;
  } catch (error) {
    return `certificate files are invalid (${error.message})`;
  }
}

function generateCertificate(target) {
  const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  const script = process.platform === "win32" ? "certs:win" : "certs:bash";

  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(pnpm, ["--filter", target.packageName, script], {
      cwd: rootDir,
      env: process.env,
      stdio: "inherit",
    });

    child.on("error", rejectRun);
    child.on("close", (code, signal) => {
      if (code === 0) {
        resolveRun();
        return;
      }
      const reason = signal ? `signal ${signal}` : `exit code ${code}`;
      rejectRun(new Error(`Certificate generation for ${target.label} failed with ${reason}`));
    });
  });
}

const requestedTargets = process.argv.slice(2);
const targetNames = requestedTargets.length > 0 ? requestedTargets : Object.keys(targets);

for (const targetName of targetNames) {
  const target = targets[targetName];
  if (!target) {
    throw new Error(`Unknown certificate target: ${targetName}`);
  }

  const issue = getCertificateIssue(target);
  if (!issue) {
    console.log(`[cp-demo] ${target.label} certificate is valid for more than ${renewalDays} days`);
    continue;
  }

  console.log(`[cp-demo] Regenerating ${target.label} certificate: ${issue}`);
  await generateCertificate(target);

  const generatedIssue = getCertificateIssue(target);
  if (generatedIssue) {
    throw new Error(`Generated ${target.label} certificate is unusable: ${generatedIssue}`);
  }
}
