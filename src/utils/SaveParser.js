export const parseSaveFile = async (buffer, gameKey) => {
  const view = new DataView(buffer);
  const caughtIds = [];
  const isDS = ["heartgold", "soulsilver", "diamond", "pearl", "platinum"].includes(gameKey.toLowerCase());

  if (isDS) {
    const blockStarts = [0x00000, 0x23100, 0x23F00, 0x40000];
    for (let offset of blockStarts) {
      const pokedexStart = offset + 0x13F0;
      if (pokedexStart + 100 > view.byteLength) continue;
      if (view.getUint8(offset) !== 0x3B && view.getUint8(offset) !== 0x00) {
        for (let i = 0; i < 493; i++) {
          if ((view.getUint8(pokedexStart + Math.floor(i/8)) >> (i%8)) & 1) caughtIds.push((i+1).toString());
        }
        if (caughtIds.length > 0) break;
      }
    }
  }
  return caughtIds;
};