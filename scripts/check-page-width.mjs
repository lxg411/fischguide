/**
 * 页宽口径防呆（postbuild 钩子，2026-08-15 加）。
 *
 * 背景：8-15 宽屏回流时，判定「哪些页该给宽容器」用的是 grep 源码里的 <table>，
 * 而 tier list / codes 的表格由 TierList.astro、CodesTable.astro 组件渲染，源码里没有
 * <table> 字样 —— 于是 7 个 tier list 页被误判成散文页跳过（含 nav 主入口）。
 * 这是典型的"人工判断项需要机器兜底"，与 check-placeholders.mjs 同源。
 *
 * 判定逻辑（只看构建产物，不看源码——源码看不见组件渲染的表格）：
 *   扫 dist/**\/index.html，对每页取最"宽"的一张表：
 *     - 列数 = 首行 <th> 个数
 *     - 文字压力 = 各列单元格字符数的中位数取最大值（中位数而非平均，避免单个长行误判）
 *   判宽 = 「列数 ≥ 4」或「列数 ≥ 3 且某列中位数 ≥ 60 字符」。
 *
 *   ⚠️ 2 列表一律不判宽（2026-08-15 试跑时被 gunztheduel /server-status/ 的
 *   [Date | Incident] 打脸修正）：横向压力来自**多列互相挤**，不是单列长文。
 *   标签+长文的 2 列表里，文字列本来就独占近全部宽度，拉到 1120 只会让它变成
 *   每行 130 字符——正是整套设计要避免的长行。
 *
 * 只查"该宽却没宽"，不查反向——容器已统一 1120（2026-08-15），
 * 多给了 wide 只是正文不限宽，无害；漏给才会让表被压到正文宽。
 *
 * 攻略详情页 /guides/<slug>/ 走 withRail 两栏，正文列另有 880 上限，不参与本检查。
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const RUNBOOK = '模板仓 ~/Desktop/gamesite/agent/runbooks/rollout-widescreen-20260814.md 踩坑 8';

const COL_LIMIT = 4; // 列数达到即判宽
const TEXT_COL_MIN = 3; // 靠"长文列"判宽的最低列数——2 列表不算横向压力
const MEDIAN_LIMIT = 60; // 长文列判据：单列文字中位数达到即算压力

if (!existsSync(DIST)) {
  console.error('⚠️  check-page-width：找不到 dist/，跳过（构建产物不存在）');
  process.exit(0);
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name === 'index.html') out.push(p);
  }
  return out;
}

const median = (arr) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

const strip = (html) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const offenders = [];

for (const file of walk(DIST)) {
  const route = '/' + relative(DIST, file).replace(/index\.html$/, '');
  // 攻略详情页走 withRail，不适用本判据；404 无内容
  if (/^\/guides\/[^/]+\//.test(route) || route.startsWith('/404')) continue;

  const html = readFileSync(file, 'utf8');
  const tables = html.match(/<table[\s\S]*?<\/table>/g);
  if (!tables) continue;

  let maxCols = 0;
  let maxMedian = 0;
  for (const t of tables) {
    const rows = t.match(/<tr[\s\S]*?<\/tr>/g) || [];
    const cols = ((rows[0] || '').match(/<th[\s>]/g) || []).length;
    maxCols = Math.max(maxCols, cols);
    if (!cols) continue;
    const byCol = Array.from({ length: cols }, () => []);
    for (const row of rows.slice(1)) {
      const cells = [...row.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map((m) => strip(m[1]));
      cells.forEach((c, i) => byCol[i] && byCol[i].push(c.length));
    }
    for (const col of byCol) maxMedian = Math.max(maxMedian, median(col));
  }

  const wideByCols = maxCols >= COL_LIMIT;
  const wideByText = maxCols >= TEXT_COL_MIN && maxMedian >= MEDIAN_LIMIT;
  const isWide = html.includes('class="wide-page"');
  if ((wideByCols || wideByText) && !isWide) {
    offenders.push({
      route,
      cols: maxCols,
      median: maxMedian,
      why: wideByCols ? `${maxCols} 列` : `${maxCols} 列且某列文字中位数 ${maxMedian} 字符`,
    });
  }
}

if (offenders.length) {
  console.error('\n❌ 页宽口径检查未通过（scripts/check-page-width.mjs）\n');
  console.error('以下页面的表格有真实横向压力，但没挂宽容器——表格会被压到正文宽：\n');
  for (const o of offenders) {
    console.error(`  ${o.route.padEnd(30)} ${o.why}（列数 ${o.cols} / 最长列中位数 ${o.median}）`);
  }
  console.error('\n修法：在对应 src/pages/*.astro 的 <BaseLayout ...> 上加 wide prop：');
  console.error('  <BaseLayout');
  console.error('    title={...}');
  console.error('    ...');
  console.error('    wide          ← 加这一行');
  console.error('  >');
  console.error(`\n判定线与背景见 ${RUNBOOK}`);
  console.error('（若确认该页就该窄——例如短单元格的规格表——把它加进本脚本的豁免清单并注明理由）\n');
  process.exit(1);
}

console.log('✅ 页宽口径检查通过（有横向压力的表格页均已挂宽容器）');
