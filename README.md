# Freedeck

<img src="webui/client/assets/logo_big.png" width="120" height="120">

_More than just a macropad; it's a Freedeck. The FOSS alternative to the Elgato Stream Deck._

## Install from freedeck.app

<img src="https://raw.githubusercontent.com/Freedeck/media-kit/main/sections/installation-app.png" width="512">

The launcher automagically updates, keeps track of dependencies, and allows you to on-demand switch between the developer and stable branch. Alongside that, it also provides the native bridge capability, enabling control for system application volume and macros.

- Go to [https://freedeck.app](https://freedeck.app)
- Click "Get it? Get Freedeck."
- Run the installer, and configure Freedeck however you'd like!
- Click "Install" in the installer
- When it finishes, the installer will turn into the launcher for Freedeck.
- You're done! Check the Start menu for a shortcut.

The default installation location is `%APPDATA%\FreedeckApp`, and this repository is inside `FreedeckApp\freedeck`.

## Install from GitHub

<img src="https://raw.githubusercontent.com/Freedeck/media-kit/main/sections/installation-github.png" width="512">

This set of steps assumes you have a _minimum of_ [Node.js v20+, npm v10+](https://nodejs.org/en/download/current) and [Git 2.4X+](https://github.com/git-for-windows/git/releases/tag/v2.55.0.windows.3) installed.

Although it's recommended you have npm v11+ and Node.js v24+ installed, any newer version should work too.

These are commands you'd run in the terminal (cmd, powershell, bash, etc.)

- Clone the repo
  - `git clone https://github.com/Freedeck/freedeck.git`
- Move into it
  - `cd freedeck`
- Download NPM packages
  - `npm i`
- Run Freedeck!
  - There are two methods to running Freedeck.
    - For best performance, split your terminal into two. In the first, run either:
      - `npm run server` - Normal console output
      - `npm run debug-server` - Verbose console output
    - and in the second, run `npm run companion`. Splitting Freedeck into two processes lets Freedeck efficiently manage resources of the backend and Electron frontend.
    - For least processes, run `npm run start`. Companion and Server may take noticeably longer to start up, as they're both trying to use the same resources to start.
- Enjoy!

## Usage

<img src="https://raw.githubusercontent.com/Freedeck/media-kit/main/sections/slice7.png" width="512">

The moment you start Freedeck:

- A setup wizard will launch. Follow the on-screen instructions.
  - From this step, you'll be asked to setup language, styling, pairing a mobile device, then a short tutorial.
- When you complete setup, you'll be greeted by the desktop app's main UI ("Companion").

From there, Freedeck is ready to use.

## Uninstalling Freedeck

If you want to uninstall Freedeck, simply delete the `%APPDATA%\FreedeckApp` folder. To remove all traces from Electron, delete `%APPDATA%\freedeck` too. Finally, you can remove the Desktop and Start menu shortcuts. Thanks for trying Freedeck out!
