// 词库共用工具：加载、校验、统计。仅供开发脚本使用，不进入 PWA。
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { isAbsolute, join } from "node:path";

export const DIFFICULTIES = ["easy", "normal", "hard"];

export const DEFAULT_BANK_PATHS = [
  "static/huacai/data/words.json",
  "static/huacai/data/imagenet-words.json",
];

export function repoRoot() {
  return fileURLToPath(new URL("..", import.meta.url));
}

// CLI 参数里给了路径就用给的，否则用默认的两个词库；相对路径基于仓库根目录
export function resolveBankPaths(args) {
  const paths = args.length > 0 ? args : DEFAULT_BANK_PATHS;
  return paths.map((path) => (isAbsolute(path) ? path : join(repoRoot(), path)));
}

export function loadBankFile(filePath) {
  let raw;
  try {
    raw = readFileSync(filePath, "utf8");
  } catch (err) {
    throw new Error(`无法读取文件：${err.message}`);
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`JSON 解析失败：${err.message}`);
  }
}

export function charCount(text) {
  return Array.from(text).length;
}

function validateWord(word, catalog) {
  if (!word || typeof word !== "object" || Array.isArray(word)) {
    return ["词条应为对象"];
  }
  const problems = [];
  if (typeof word.text !== "string" || word.text.trim() === "") {
    problems.push("text 应为非空字符串");
  } else {
    if (word.text !== word.text.trim()) {
      problems.push("text 有首尾空白");
    }
    const actual = charCount(word.text);
    if (typeof word.length !== "number" || !Number.isFinite(word.length)) {
      problems.push(`length 应为数字，实际是 ${JSON.stringify(word.length)}`);
    } else if (word.length !== actual) {
      problems.push(`length 与实际字数不符：应为 ${actual}，写的是 ${word.length}`);
    }
  }
  if (!Array.isArray(word.tags)) {
    problems.push("tags 应为数组");
  } else if (catalog) {
    for (const tag of word.tags) {
      if (typeof tag !== "string" || !(tag in catalog)) {
        problems.push(`未知 tag "${String(tag)}"`);
      }
    }
  }
  return problems;
}

// 校验单个词库，返回 { errors, stats }。
// stats 即使有错误也会尽量统计，供报告脚本展示覆盖情况。
export function validateBank(bank) {
  const errors = [];
  const stats = {
    version: "",
    total: 0,
    unique: 0,
    duplicates: 0,
    unknownTags: 0,
    byGroup: [],
    byDifficulty: {},
    byLength: {},
    byTag: {},
  };

  if (!bank || typeof bank !== "object" || Array.isArray(bank)) {
    errors.push("根节点应为对象");
    return { errors, stats };
  }
  if (typeof bank.version !== "string" || bank.version.trim() === "") {
    errors.push("根节点缺少 version（字符串）");
  } else {
    stats.version = bank.version;
  }
  if (!Array.isArray(bank.groups) || bank.groups.length === 0) {
    errors.push("groups 应为非空数组");
    return { errors, stats };
  }

  const catalog =
    bank.tagCatalog && typeof bank.tagCatalog === "object" && !Array.isArray(bank.tagCatalog)
      ? bank.tagCatalog
      : null;
  const seen = new Map(); // text → 出现过的组 id 列表
  const groupIds = new Set();

  bank.groups.forEach((group, groupIndex) => {
    const where = group && typeof group.id === "string" && group.id ? `组 "${group.id}"` : `groups[${groupIndex}]`;
    if (!group || typeof group !== "object" || Array.isArray(group)) {
      errors.push(`${where}: 组应为对象`);
      return;
    }
    if (typeof group.id !== "string" || group.id.trim() === "") {
      errors.push(`${where}: 缺少 id`);
    } else if (groupIds.has(group.id)) {
      errors.push(`${where}: 组 id "${group.id}" 重复`);
    } else {
      groupIds.add(group.id);
    }
    if (typeof group.label !== "string" || group.label.trim() === "") {
      errors.push(`${where}: 缺少 label`);
    }
    if (!DIFFICULTIES.includes(group.difficulty)) {
      errors.push(
        `${where}: difficulty 应为 ${DIFFICULTIES.join(" / ")}，实际是 ${JSON.stringify(group.difficulty)}`,
      );
    }
    if (!Array.isArray(group.words)) {
      errors.push(`${where}: words 应为数组`);
      return;
    }

    let groupTotal = 0;
    group.words.forEach((word, wordIndex) => {
      const problems = validateWord(word, catalog);
      for (const problem of problems) {
        errors.push(`${where} words[${wordIndex}]: ${problem}`);
      }
      if (problems.length > 0 || !word || typeof word.text !== "string") {
        return; // 无效词条不参与统计和查重
      }
      groupTotal += 1;
      stats.total += 1;
      stats.byDifficulty[group.difficulty] = (stats.byDifficulty[group.difficulty] || 0) + 1;
      const len = charCount(word.text);
      stats.byLength[len] = (stats.byLength[len] || 0) + 1;
      const groupList = seen.get(word.text) || [];
      groupList.push(groupIds.has(group.id) ? group.id : where);
      seen.set(word.text, groupList);
      for (const tag of word.tags) {
        stats.byTag[tag] = (stats.byTag[tag] || 0) + 1;
        if (catalog && !(tag in catalog)) {
          stats.unknownTags += 1;
        }
      }
    });
    stats.byGroup.push({
      id: typeof group.id === "string" ? group.id : `groups[${groupIndex}]`,
      label: typeof group.label === "string" ? group.label : "",
      difficulty: group.difficulty,
      count: groupTotal,
    });
  });

  for (const [text, groupList] of seen) {
    if (groupList.length > 1) {
      stats.duplicates += groupList.length - 1;
      errors.push(`Duplicate "${text}":\n${groupList.map((id) => `  ${id}`).join("\n")}`);
    }
  }
  stats.unique = seen.size;
  return { errors, stats };
}

// 报告脚本用的标签覆盖列表：tagCatalog 里的都列出（含 0），未知 tag 附在最后
export function tagCoverage(stats, bank) {
  const catalog =
    bank && bank.tagCatalog && typeof bank.tagCatalog === "object" && !Array.isArray(bank.tagCatalog)
      ? bank.tagCatalog
      : {};
  const rows = Object.keys(catalog).map((tag) => ({ tag, count: stats.byTag[tag] || 0, known: true }));
  for (const [tag, count] of Object.entries(stats.byTag)) {
    if (!(tag in catalog)) {
      rows.push({ tag, count, known: false });
    }
  }
  rows.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  return rows;
}
