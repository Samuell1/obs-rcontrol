const path = require('path');
const packageJSON = require('./package.json')

module.exports = {
  make_targets: {
    win32: [
        "squirrel"
    ],
    darwin: [
        "zip"
    ],
    linux: [
        "deb",
        "rpm"
    ]
  },
  electronPackagerConfig: {
    "packageManager": "npm",
    icon: path.join(__dirname, 'src/assets/icon'),
    win32metadata: {
      'ProductName': packageJSON.productName,
      'CompanyName': packageJSON.author,
      'InternalName': packageJSON.name,
      'OriginalFilename': '',
      'FileDescription': ''
    },
    "version-string":{
      CompanyName: packageJSON.author,
      LegalCopyright: `Copyright © ${packageJSON.author}`,
      ProductName: packageJSON.name,
      InternalName: packageJSON.name,
      FileDescription: packageJSON.description,
      OriginalFilename: packageJSON.name,
      FileVersion: packageJSON.version,
      ProductVersion: packageJSON.version
    }
  },
  electronWinstallerConfig: {
    "name": "obs_rcontrol",
    iconUrl: 'https://raw.githubusercontent.com/Samuell1/obs-rcontrol/master/src/assets/icon.ico',
    setupIcon: path.join(__dirname, 'src/assets/setup.ico'),
  },
  electronInstallerDebian: {},
  electronInstallerRedhat: {},
  github_repository: {
    "owner": "Samuell1",
    "name": "obs-rcontrol"
  },
  windowsStoreConfig: {
    packageName: "",
    name: "obsrcontrol"
  }
}