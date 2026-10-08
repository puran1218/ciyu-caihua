// Word-level gameplay difficulty may override the grade group's default.
// Pure helper: no DOM or storage, so filtering can be regression-tested.
const CyhcWords = {
  difficultyOf(word, group) {
    return word.difficulty ?? group.difficulty;
  },

  candidates(bank, { range = "all", allowFour = true } = {}) {
    const entries = bank.groups.flatMap((group) =>
      group.words.map((word) => ({ group, word })),
    );
    function collect(ignoreRange, ignoreLength) {
      const seen = new Set();
      const output = [];
      for (const { group, word } of entries) {
        if (!ignoreRange && range !== "all" && CyhcWords.difficultyOf(word, group) !== range) continue;
        if (!ignoreLength && !allowFour && word.length >= 4) continue;
        if (seen.has(word.text)) continue;
        seen.add(word.text);
        output.push(word.text);
      }
      return output;
    }
    // Preserve the existing empty-pool relaxation order.
    let words = collect(false, false);
    if (!words.length) words = collect(true, false);
    if (!words.length) words = collect(false, true);
    if (!words.length) words = collect(true, true);
    return words;
  },
};
