# ⚔️ Cross-Platform C2 Simulation & Advanced Defense Training 🛡️

This project is a sophisticated ethical hacking exercise demonstrating the full attack lifecycle of a modern Command and Control (C2) system, focused on bypassing security measures.

It involves communication between two distinct operating environments via a central cloud service.

---

## 🎯 Project Components & Objective

| Component | Technology | Role in Simulation |
| :--- | :--- | :--- |
| **Implant (Target)** | **Electron / Node.js** (Windows) | Runs covertly on the target system, performs system scans, executes remote commands, and handles data transmission. |
| **Controller (Attacker)** | **Python 3** (Parrot OS) | Connects to the C2 channel, fetches target data, and remotely issues commands (e.g., Delete, Upload). |
| **C2 Channel** | **Firebase Realtime DB** | The covert communication backbone for sending small commands. |
| **Data Endpoint** | **PHP Server (Hostinger)** | The remote server that physically receives and saves the stolen files. |

**Objective:** To successfully deploy the C2 system and test advanced covert data transport methods against real-world firewall rules.

---

## ✨ Advanced Technical Achievements

* **Asynchronous Stability:** The Implant uses non-blocking asynchronous I/O to scan the `C:\` drive without freezing the application window, a key requirement for persistent malware.
* **Targeted Reconnaissance:** Scanning is limited to **top-level directories only**, optimizing speed and minimizing system detection footprint.
* **Remote System Control:** Verified success of the `delete` command, proving system modification is possible across the network.
* **Covert Data Transport:** Achieved file transfer by implementing **Base64 JSON Exfiltration**—a technique where files are encoded as a stealthy JSON string to bypass standard Web Application Firewall (WAF) blocks on multi-part file uploads.

---

## 🚨 Important Notice: Ethical Use

This framework is **strictly for educational and defensive training purposes**. It is designed to teach professionals how to recognize and defend against complex C2 threats. Do not deploy this code on any network or system without explicit, written permission from the owner.

---

## 🚀 Getting Started

### Prerequisites

* **Windows Machine:** Node.js/npm and the running Implant.
* **Parrot OS/Linux Machine:** Python 3 and the `firebase-admin` module.
* **Firebase Account:** Credentials (`serviceAccountKey.json`) required for both Controller and Implant.

### Execution Flow (The C2 Loop)

1.  **Windows Implant:** Runs `npm start` to connect to Firebase and upload its list of top-level folders to the `systemdata` node.
2.  **Parrot Controller:** Runs `python3 update_task.py`. It skips local scanning, **fetches the target list** from the Firebase `systemdata` node, and displays it.
3.  **Command:** The user types a command (e.g., `upload` or `delete`) and selects a target index (e.g., `37` for `C:\Test Folder`).
4.  **Action:** The command is sent to the Firebase `task` node, where the Windows Implant immediately executes it, proving remote system control.

---

## 📂 Project File Structure

| File | Environment | Purpose |
| :--- | :--- | :--- |
| `main.js` | Windows (Implant) | Contains the asynchronous scan logic, C2 listener, and Base64 exfiltration code. |
| `update_task.py` | Parrot OS (Controller) | Fetches the target list from Firebase and manages user input to send commands. |
| `serviceAccountKey.json` | Both | The administrative credential file for connecting to Firebase. |
| `package.json` | Windows (Implant) | Lists Node.js dependencies (`electron`, `axios`, etc.). |
| `json_receiver.php` | Hostinger (Data Endpoint) | The script that successfully decodes the incoming Base64 JSON payload and saves the file. |
