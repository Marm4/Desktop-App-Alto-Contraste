const createDMG = require('electron-installer-dmg');
const path = require('path');

createDMG({
  appPath: path.join(__dirname, 'dist/mac/Alto Contraste Escritorio.app'),
  name: 'Alto Contraste Escritorio',
  out: path.join(__dirname, 'dist/installers'),
  overwrite: true,
  icon: path.join(__dirname, 'assets/icons/ic_alto_contraste.icns'),
}, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('DMG installer created successfully!');
  }
});