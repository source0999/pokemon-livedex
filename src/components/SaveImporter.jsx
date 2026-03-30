import React from 'react';

// CRC16 Checksum function used by Gen 4 / PKHeX
const getCRC16 = (data) => {
  let crc = 0;
  for (let i = 0; i < data.length; i++) {
    crc ^= (data[i] << 8);
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) crc = (crc << 1) ^ 0x1021;
      else crc <<= 1;
    }
  }
  return crc & 0xFFFF;
};

const SaveImporter = ({ onSaveParsed }) => {
  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);
    const caughtIds = new Set();

    // HGSS Block Sizes
    const BLOCK_SIZE = 0xF618; // General Block size for HGSS
    const offsets = [0x0, 0x40000]; // Primary and Backup

    offsets.forEach(base => {
      // PKHeX verifies the block header/footer
      // The last 2 bytes of the block are the CRC16 checksum
      const blockData = data.slice(base, base + BLOCK_SIZE - 2);
      const storedChecksum = data[base + BLOCK_SIZE - 2] | (data[base + BLOCK_SIZE - 1] << 8);
      const calculatedChecksum = getCRC16(blockData);

      if (storedChecksum === calculatedChecksum) {
        console.log(`%c [PKHEX VERIFIED] Valid Block at 0x${base.toString(16)}`, "color: #10b981; font-weight: bold;");
        
        // Now we ONLY scan this verified block
        // 1. Pokedex Flags (0x640)
        const dexSlice = data.slice(base + 0x640, base + 0x640 + 64);
        dexSlice.forEach((byte, i) => {
          for (let bit = 0; bit < 8; bit++) {
            if ((byte >> bit) & 1) caughtIds.add((i * 8) + bit + 1);
          }
        });

        // 2. Physical PC Scan (0xC100)
        // 18 Boxes * 30 slots * 136 bytes
        for (let i = 0; i < 540; i++) {
          const pos = base + 0xC100 + (i * 136);
          const species = data[pos] | (data[pos + 1] << 8);
          if (species > 0 && species <= 493) caughtIds.add(species);
        }
      }
    });

    const final = Array.from(caughtIds).filter(id => id <= 493).sort((a,b) => a-b);
    console.log(`%c Final Clean Count: ${final.length} `, "background: #111827; color: #38bdf8; font-weight: bold;");
    
    if (onSaveParsed) onSaveParsed(final);
  };

  return (
    <div className="mt-8 p-4 border-2 border-dashed border-zinc-800 rounded-lg bg-black/60">
      <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">
        CRC16 Authenticated Scanner
      </h3>
      <input type="file" onChange={handleUpload} className="text-[10px] text-zinc-400 cursor-pointer" />
    </div>
  );
};

export default SaveImporter;