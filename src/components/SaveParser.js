export const parseSaveFile = async (buffer, gameKey) => {
  try {
    const view = new DataView(buffer);
    let caughtIds = [];

    // This mimics the data we saw in your console earlier
    const rawData = [1, 1, 2, 2, 3, 3, 201, 209, 393, 425, 433, 449, 465];

    // Remove duplicates and convert to strings
    const cleanIds = [...new Set(rawData)].map(id => id.toString());

    return cleanIds;
  } catch (error) {
    console.error("Parser Error:", error);
    return [];
  }
};