# sitetopdf-watcher

A Node.js command-line tool that watches for changes in HTML files and automatically converts them to PDF using `sitetopdf`.

## Features

- Real-time monitoring of HTML file changes.
- Automatic conversion of updated HTML files to PDF.
- Customizable through a simple JSON configuration.

## Installation

To install `sitetopdf-watcher` globally, run the following command:

```bash
npm install -g sitetopdf-watcher
```

This will install the package globally on your system, allowing it to be run from any location.

## Usage

After installation, you can start watching a directory with the following command:

```bash
sitetopdf-watcher --port 3333 --entry-file index.html
```

By default, `sitetopdf-watcher` will serve files on port 3333 and watch the `index.html` file for changes.

## Options

- `-p, --port <port>`: Specify the port on which the file server will run. Default is 3333.
- `-e, --entry-file <file>`: Specify the path to the entry HTML file. Default is index.html.
- `-c, --config-file <file>`: Specify the path to the configuration file. Default is config.json.

## Configuration

Create a `config.json` file in your project directory to set custom options for PDF conversion. Here is an example configuration:

```bash
{
  "output": "output.pdf",
  "wait-until": "networkidle0"
}
```

The `output` field specifies the name of the created PDF file, and `wait-until` is an option passed to `sitetopdf` that defines when to consider the page load complete.

## Development

If you wish to contribute to the project or fork it for your own modifications, here are some useful commands:

- `npm run build`: Compiles the TypeScript source code.
- `npm run watch`: Watches the TypeScript source for changes and recompiles.
- `npm run clean`: Removes generated files.
- `npm start`: Runs the compiled JavaScript code.
