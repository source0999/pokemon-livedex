import React from "react";
// Double-check this path! If SaveParser is in utils, it should be ../utils/SaveParser
import { parseSaveFile } from "../utils/SaveParser"; 
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function SaveImporter({ gameKey, user }) {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const buffer = event.target.result;
        const cleanIds = await parseSaveFile(buffer, gameKey);
        
        if (user && cleanIds.length > 0) {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            [`progress.${gameKey}`]: cleanIds 
          });
          console.log("Sync Complete!");
        }
      } catch (err) {
        console.error("Import failed:", err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="relative">
      <input type="file" id="save-upload" className="hidden" onChange={handleFile} />
      <label htmlFor="save-upload" className="bg-purple-600 px-6 py-4 rounded-2xl cursor-pointer font-black text-[10px] uppercase">
        Import Save
      </label>
    </div>
  );
}