# VIP2021-game

![issues](https://img.shields.io/github/issues/VilmaNilsson/VIP2021-game)
![issues-pr](https://img.shields.io/github/issues-pr/VilmaNilsson/VIP2021-game)

## Documentation

All of the documentation can be found in the [Project Wiki](https://github.com/VilmaNilsson/VIP2021-game/wiki).

## Getting Started

All of the `npm run` commands can be found within [package.json](package.json) under `"scripts": { ... }`.

### Installation

``` bash
$ npm install     # Install all dependencies
```

### Compiling the code

The client code needs to be compiled into one JavaScript and one CSS file respectively. This is done by either doing it once or *watching* your code for changes and then automatically compiling the code. The compiled code will be saved to the folder `dist/` (short for *distribution*).

``` bash
$ npm run build   # Compiles the code once
$ npm run watch   # Watches your code for changes
```

*While developing it is recommended to start the watch command.*

### Starting the servers

We have two servers that needs to be started **separately**, the HTTP and WebSocket server.

``` bash
$ npm run http    # Starts the HTTP server
$ npm run ws      # Starts the WebSocket server
```

*Start these in two different terminal windows in order to properly view the logs.*

#### Custom Ports

The HTTP server defaults to port `7000` and the WebSocket server to `7001`. This can easily be changed via the environment variables `HTTP_PORT` and `WS_PORT`.

``` bash
$ HTTP_PORT=7070 npm run http   # Sets the HTTP port to 7070
$ WS_PORT=8080 npm run ws       # Sets the WebSocket port to 8080
```

### Analyze the code

Check your JavaScript for syntax or styling errors (this should always be done
before publishing changes):

``` bash
$ npm run check   # Default way of checking the whole repository
```

*Ignore errors in files you haven't been working on.*

#### Check files manually

``` bash
$ npx eslint .          # Check the repository with Warnings
$ npx eslint file.js    # Check a file with Warnings
$ npx eslint . --quiet  # Supress warnings with the quiet flag
```
