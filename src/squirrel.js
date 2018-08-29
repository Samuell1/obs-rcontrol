const ChildProcess = require('child_process'),
      path = require('path'),
      os = require('os'),
      fs = require('fs'),

      appFolder = path.dirname(process.execPath),
      updateExe = path.resolve(appFolder, '..', 'Update.exe'),
      exeName = path.basename(process.execPath),
      homeDir = os.homedir()

// Create shortcut after install
const createShortcut = function (callback) {
  spawnUpdate([
    '--createShortcut',
    exeName,
    '--shortcut-locations',
    'StartMenu'
  ], callback)
}

// Remove shortcut after uninstall
const removeShortcut = function (callback) {
  spawnUpdate([
    '--removeShortcut',
    exeName
  ], callback)
}

// Update shortcut after update
const updateShortcut = function (callback) {
  if (homeDir) {
    const desktopShortcutPath = path.join(homeDir, 'Desktop', 'OBS Remote Control.lnk')
    // If the desktop shortcut was deleted by the user, then keep it deleted.
    fs.access(desktopShortcutPath, function (err) {
      const desktopShortcutExists = !err
      createShortcut(function () {
        if (desktopShortcutExists) {
          callback()
        } else {
          // Remove the unwanted desktop shortcut that was recreated
          fs.unlink(desktopShortcutPath, callback)
        }
      })
    })
  } else {
    createShortcut(callback)
  }
}

// Check if is update supported
const supported = function () {
  try {
    fs.accessSync(updateExe, fs.R_OK)
    return true
  } catch (error) {
    return false
  }
}

function spawnUpdate (args, callback) {
  var stdout = '',
      spawned = null,
      error = null
  try {
    spawned = ChildProcess.spawn(updateExe, args)
  } catch (error) {
    if (error && error.stdout == null) error.stdout = stdout
    process.nextTick(function () { callback(error) })
    return
  }

  spawned.stdout.on('data', function (data) { stdout += data })

  spawned.on('error', function (processError) {
    if (!error) error = processError
  })

  spawned.on('close', function (code, signal) {
    if (!error && code !== 0) {
      error = new Error('Command failed: ' + code + ' ' + signal)
    }
    if (error && error.code == null) error.code = code
    if (error && error.stdout == null) error.stdout = stdout
    callback(error)
  })
}

module.exports = {
  createShortcut,
  removeShortcut,
  updateShortcut,
  supported
}