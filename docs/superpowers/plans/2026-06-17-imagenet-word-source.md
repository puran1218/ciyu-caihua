# ImageNet Word Source Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a lightweight ImageNet-inspired word source that can be selected from settings without changing the family-game feel of the app.

**Architecture:** Keep the existing primary school Chinese wordbank as the default source and add a second static JSON wordbank at `static/huacai/data/imagenet-words.json`. The frontend stores a `source` setting, loads the matching JSON file, and rebuilds the deck after a source switch. Both wordbanks keep the same `groups[].words[]` shape so the current range and four-character filters continue to work.

**Tech Stack:** Static HTML/CSS/JavaScript PWA, local JSON data files, service worker asset cache.

---

### File Structure

- Modify: `static/huacai/index.html`
  - Add a compact "词库" segmented control in the existing settings panel.
- Modify: `static/huacai/app.js`
  - Add `source` to settings.
  - Load `words.json` or `imagenet-words.json` based on the selected source.
  - Keep fallback behavior when a wordbank fails to load.
- Modify: `static/huacai/styles.css`
  - Ensure the extra settings group still fits in landscape and small viewports.
- Modify: `static/huacai/service-worker.js`
  - Cache the new ImageNet wordbank and bump the cache name.
- Create: `static/huacai/data/imagenet-words.json`
  - Add a curated Chinese visual-object wordbank inspired by ImageNet categories.

### Task 1: Add ImageNet-Inspired Wordbank

- [ ] **Step 1: Create `static/huacai/data/imagenet-words.json`**

Use the existing schema style from `words.json`. Include `curation.sourcePolicy` explaining that this is a Chinese, child-friendly, game-curated set inspired by visual object categories rather than a full ImageNet class copy.

- [ ] **Step 2: Populate a first solid batch**

Add 150-250 words across `easy`, `normal`, and `hard`. Prefer concrete visual nouns and a small number of drawable four-character scene/object phrases. Cover animals, plants, food, transport, tools, furniture, sports, clothing, buildings, places, science objects, and everyday household objects.

- [ ] **Step 3: Validate the data**

Run a Node validation command that checks JSON parsing, text length, duplicate text, known tags, and expected difficulty values.

Expected: command exits 0 and reports the total word count.

### Task 2: Add Source Setting UI

- [ ] **Step 1: Modify `static/huacai/index.html`**

Add a settings group above "词语范围":

```html
<div class="setting-group">
  <div class="setting-label">词库</div>
  <div class="seg" id="sourceSeg">
    <button data-source="primary">小学语文</button>
    <button data-source="imagenet">ImageNet物品</button>
  </div>
</div>
```

- [ ] **Step 2: Check layout**

Review the settings panel CSS after adding the group. If the panel risks overflowing on small landscape screens, add constrained height and internal scrolling to `.settings-panel`.

### Task 3: Wire Source Loading

- [ ] **Step 1: Modify `static/huacai/app.js` settings state**

Add `source: "primary"` to `DEFAULT_SETTINGS`. Add `sourceButtons` to read `#sourceSeg [data-source]`.

- [ ] **Step 2: Add wordbank path selection**

Add a mapping:

```js
const WORD_BANK_SOURCES = {
  primary: "./data/words.json",
  imagenet: "./data/imagenet-words.json",
};
```

Use it when fetching data.

- [ ] **Step 3: Add `loadWordBank()`**

Move the existing fetch logic into an async function that chooses the path from `state.settings.source`, validates `groups`, updates `state.bank`, and rebuilds the deck if the game is active.

- [ ] **Step 4: Handle source button clicks**

When a source button is clicked, save the source, update settings UI, load the selected wordbank, and rebuild the deck.

- [ ] **Step 5: Preserve fallback**

If the selected wordbank fails, use `FALLBACK_BANK` and keep the app playable.

### Task 4: Cache the New Asset

- [ ] **Step 1: Modify `static/huacai/service-worker.js`**

Bump `CACHE_NAME` and add `./data/imagenet-words.json` to `ASSETS`.

- [ ] **Step 2: Ensure no path changes**

All asset paths remain relative so `/huacai/` Micro.blog deployment keeps working.

### Task 5: Final Verification

- [ ] **Step 1: Run JSON/schema validation**

Validate both `words.json` and `imagenet-words.json` for parsing, duplicate text, text length, tag validity, and difficulty values.

- [ ] **Step 2: Run source/range/four-word deck checks**

For each source and each range (`all`, `easy`, `normal`, `hard`), verify that candidate words are non-empty when four-character words are on and off.

- [ ] **Step 3: Run whitespace check**

Run `git diff --check`.

- [ ] **Step 4: Review changed files**

Confirm the change set is limited to the plan, data, app UI, app logic, styles, and service worker.
