const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');
const serve = require('electron-serve');

// Configuración de electron-serve para cargar la carpeta 'out'
const loadURL = (typeof serve === 'function' ? serve : serve.default)({ directory: 'out' });

// 2. Configuración de Hot Reload
if (!app.isPackaged) {
    try {
        require('electron-reload')(__dirname, {
            electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
            awaitWriteFinish: true
        });
    } catch (_) { }
}

// Descomentado para evitar problemas de pantalla negra en algunos sistemas Linux
app.disableHardwareAcceleration();

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        backgroundColor: '#0A0A0A',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    if (app.isPackaged) {
        // En producción, carga usando electron-serve
        loadURL(mainWindow).catch(err => {
            console.error("Error al cargar la aplicación:", err);
        });
        mainWindow.setMenu(null);
        
        // Atajo para abrir DevTools en producción si es necesario (Ctrl+Shift+I)
        globalShortcut.register('CommandOrControl+Shift+I', () => {
            mainWindow.webContents.openDevTools();
        });
    } else {
        // En desarrollo, carga desde el servidor de Next.js
        mainWindow.loadURL('http://localhost:3000');
        // Abre las herramientas de desarrollo en modo desarrollo para depurar
        mainWindow.webContents.openDevTools();
    }
}

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