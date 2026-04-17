const { app, BrowserWindow } = require('electron');
const path = require('path');

// 1. Iniciar el servidor Express
// Al requerir el archivo, el servidor comienza a escuchar en el puerto 3000
const { PORT, HOST } = require('./server');

// 2. Configuración de Hot Reload
// Esto recarga la ventana si cambias un HTML/EJS, 
// y reinicia la app si cambias el código de Electron/Node (main.js o server.js)
if (!app.isPackaged) {
    try {
        require('electron-reload')(__dirname, {
            electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
            awaitWriteFinish: true
        });
    } catch (_) { }
}


function createWindow() {
    // Crear la ventana del navegador
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        backgroundColor: '#0A0A0A',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // En desarrollo, esperar un poco para que Next.js compile si es necesario
    const loadURL = () => {
        mainWindow.loadURL(`http://${HOST}:${PORT}`).catch(() => {
            setTimeout(loadURL, 1000); // Reintento si el servidor no está listo
        });
    }

    loadURL();

    if (app.isPackaged) {
        mainWindow.setMenu(null);
    }
}
//app.disableHardwareAcceleration();
// Inicialización de Electron
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});