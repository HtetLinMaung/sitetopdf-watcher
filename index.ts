#!/usr/bin/env node

import { OptionValues, program } from "commander";
import path from "path";
import fs from "fs";
import express from "express";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function main() {
  program
    .version("1.0.0")
    .description("Real-time HTML to PDF conversion tool")
    .option("-p, --port <port>", "Port of the watcher", "3333")
    .option("-e, --entry-file <file>", "Path to the entry file", "index.html")
    .option(
      "-c, --config-file <file>",
      "Path to the config file",
      "config.json"
    );

  program.parse(process.argv);
  const options = program.opts();

  const app = express();
  const workingDir = process.cwd();
  const staticPath = path.join(workingDir);

  app.use(express.static(staticPath));

  try {
    const server = app.listen(options.port, () => {
      console.log(`Watcher listening on port ${options.port}`);
    });

    let config = readConfigFile(options.configFile);

    await runCommand(options, config);

    fs.watch(workingDir, async (eventType, fileName) => {
      if (eventType === "change" && fileName && fileName !== config.output) {
        console.log(`${eventType}: ${fileName}`);
        if (fileName === options.configFile) {
          console.log("Config file changed, reloading configuration...");
          config = readConfigFile(options.configFile);
        }
        await runCommand(options, config);
      }
    });

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      console.log("Stopping server...");
      server.close(() => {
        console.log("Server stopped.");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Error occurred:", error);
    process.exit(1);
  }
}

async function runCommand(options: OptionValues, config: any) {
  const cmd = `sitetopdf -u http://localhost:${options.port}/${
    options.entryFile
  } ${buildCommandOptions(config)}`;
  console.log(`Executing: ${cmd}`);

  try {
    const { stdout } = await execAsync(cmd);
    console.log(stdout);
  } catch (error) {
    console.error("Error executing command:", error);
  }
}

function buildCommandOptions(config: any) {
  return Object.entries(config)
    .map(([key, value]) => `--${key} ${value}`)
    .join(" ");
}

function readConfigFile(configFile: string) {
  const configPath = path.join(process.cwd(), configFile);
  try {
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, "utf8");
      return {
        output: "output.pdf",
        "wait-until": "load",
        ...JSON.parse(content),
      };
    }
  } catch (error) {
    console.error("Error reading config file:", error);
  }
  return {
    output: "output.pdf",
    "wait-until": "load",
  };
}

main();
