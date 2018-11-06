import { app, BrowserWindow } from 'electron';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import { enableLiveReload } from 'electron-compile';
import path from 'path';

const squirrel = require('./squirrel');
let mainWindow;
const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode) enableLiveReload();

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 600,
    icon: path.join(__dirname + '/assets/icon.png')
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  if (isDevMode) {
    await installExtension(VUEJS_DEVTOOLS);
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

function initialize () {
  app.on('ready', createWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });

  app.on('will-quit', () => {
    globalShortcut.unregisterAll()
  });
}

switch (process.argv[1]) {
  case '--squirrel-install':
    squirrel.createShortcut(() => app.quit())
    break
  case '--squirrel-uninstall':
    squirrel.removeShortcut(() => app.quit())
    break
  case '--squirrel-firstrun':
    break
  case '--squirrel-obsolete':
    app.quit()
    break
  case '--squirrel-updated':
    squirrel.updateShortcut(() => app.quit())
    break
  default:
    initialize()
}