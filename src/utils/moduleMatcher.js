function getSimilarityScore(text1, text2) {
  const words1 = text1.toLowerCase().split(/\W+/);
  const words2 = text2.toLowerCase().split(/\W+/);

  const wordSet = new Set([...words1, ...words2]);
  const wordArray = Array.from(wordSet);

  const vec1 = wordArray.map((word) => words1.filter((w) => w === word).length);
  const vec2 = wordArray.map((word) => words2.filter((w) => w === word).length);

  const dotProduct = vec1.reduce((acc, val, i) => acc + val * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((acc, val) => acc + val * val, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((acc, val) => acc + val * val, 0));

  if (magnitude1 === 0 || magnitude2 === 0) return 0;

  return dotProduct / (magnitude1 * magnitude2);
}

export function getTopMatchingModules(modules, content, title = "", topic = "", topN = 5) {
  const lessonKeywords = `${title} ${topic} ${content}`.toLowerCase().split(/\W+/).filter(Boolean);

  const scored = modules.map((mod) => {
    const overviewScore = getSimilarityScore(content, mod.overview || "");

    let tagBoost = 0;
    if (mod.tags && Array.isArray(mod.tags)) {
      const tagMatches = mod.tags.filter(tag =>
        lessonKeywords.includes(tag.toLowerCase())
      );
      if (tagMatches.length > 0) {
        tagBoost = 0.3 + tagMatches.length * 0.05; // boost more if more tags match
      }
    }

    return {
      ...mod,
      similarityScore: overviewScore + tagBoost
    };
  });

  const filtered = scored.filter(mod => mod.similarityScore >= 0.2); // still a safe minimum

  return filtered
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, topN);
}
