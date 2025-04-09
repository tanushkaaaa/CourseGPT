export function generateTagsFromText(text) {
    if (!text) return [];
  
    const keywords = text
      .toLowerCase()
      .match(/\b[a-z]{4,}\b/g); // only words with 4+ letters
  
    const frequencyMap = {};
  
    for (const word of keywords || []) {
      frequencyMap[word] = (frequencyMap[word] || 0) + 1;
    }
  
    return Object.entries(frequencyMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }
  