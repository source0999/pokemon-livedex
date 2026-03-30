// src/utils/SaveParser.js

export const parseSaveFile = (buffer, selectedGame) => {
  // 1. Initial Buffer Check
  if (!buffer || buffer.byteLength === 0) {
    return { success: false, error: "Buffer is empty or null." };
  }

  try {
    const uint8Array = new Uint8Array(buffer);
    
    // 2. Normalize the key (Standardizes "HEARTGOLD" or "heartgold " to "heartgold")
    const activeKey = selectedGame?.toString().toLowerCase().trim();
    
    console.log(`[Parser] System Active. Internal Key: "${activeKey}"`);

    // 3. HeartGold / SoulSilver Logic
    if (activeKey === 'heartgold' || activeKey === 'soulsilver') {
      const offsets = [0x00400, 0x40400];
      
      for (let offset of offsets) {
        const slice = uint8Array.slice(offset, offset + 64);
        const hasData = !slice.every(b => b === 0 || b === 255);
        
        if (hasData) {
          console.log(`[Parser] Data match found at 0x${offset.toString(16)}`);
          return { success: true, game: activeKey, data: Array.from(slice) };
        }
      }
      return { success: false, error: "No Pokedex data found in HGSS blocks." };
    }

    // 4. THE CATCH-ALL: This prevents the "undefined" error
    return { success: false, error: `Verification Failed: "${activeKey}" is not configured.` };

  } catch (err) {
    console.error("[Parser] Crash:", err);
    return { success: false, error: `System Error: ${err.message}` };
  }
};