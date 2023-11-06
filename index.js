#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        commander_1.program
            .version("1.0.0")
            .description("Real-time HTML to PDF conversion tool")
            .option("-p, --port <port>", "Port of the watcher", "3333")
            .option("-e, --entry-file <file>", "Path to the entry file", "index.html")
            .option("-c, --config-file <file>", "Path to the config file", "config.json");
        commander_1.program.parse(process.argv);
        const options = commander_1.program.opts();
        const app = (0, express_1.default)();
        const workingDir = process.cwd();
        const staticPath = path_1.default.join(workingDir);
        app.use(express_1.default.static(staticPath));
        try {
            const server = app.listen(options.port, () => {
                console.log(`Watcher listening on port ${options.port}`);
            });
            let config = readConfigFile(options.configFile);
            yield runCommand(options, config);
            fs_1.default.watch(workingDir, (eventType, fileName) => __awaiter(this, void 0, void 0, function* () {
                if (eventType === "change" && fileName && fileName !== config.output) {
                    console.log(`${eventType}: ${fileName}`);
                    if (fileName === options.configFile) {
                        console.log("Config file changed, reloading configuration...");
                        config = readConfigFile(options.configFile);
                    }
                    yield runCommand(options, config);
                }
            }));
            process.on("SIGINT", () => {
                console.log("Stopping server...");
                server.close(() => {
                    console.log("Server stopped.");
                    process.exit(0);
                });
            });
        }
        catch (error) {
            console.error("Error occurred:", error);
            process.exit(1);
        }
    });
}
function runCommand(options, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const cmd = `sitetopdf -u http://localhost:${options.port}/${options.entryFile} ${buildCommandOptions(config)}`;
        console.log(`Executing: ${cmd}`);
        try {
            const { stdout } = yield execAsync(cmd);
            console.log(stdout);
        }
        catch (error) {
            console.error("Error executing command:", error);
        }
    });
}
function buildCommandOptions(config) {
    return Object.entries(config)
        .map(([key, value]) => `--${key} ${value}`)
        .join(" ");
}
function readConfigFile(configFile) {
    const configPath = path_1.default.join(process.cwd(), configFile);
    try {
        if (fs_1.default.existsSync(configPath)) {
            const content = fs_1.default.readFileSync(configPath, "utf8");
            return Object.assign({ output: "output.pdf", "wait-until": "load" }, JSON.parse(content));
        }
    }
    catch (error) {
        console.error("Error reading config file:", error);
    }
    return {
        output: "output.pdf",
        "wait-until": "load",
    };
}
main();
