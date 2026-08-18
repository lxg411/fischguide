/**
 * 站内死链质检（postbuild 钩子，2026-08-18 自 AnvilWiki check-links.ts 移植）。
 *
 * 扫构建产物 dist/ 里全部 <a href> 内链，逐条验证目标页面文件存在。抓的是
 * 类型检查和人眼都看不见的静默杀手：
 *   - 攻略正文里链到改名前的旧 slug
 *   - nav/tools 配置指向已停用（下划线前缀）的页型
 *   - 组件渲染出的链接（源码 grep 不到，与 check-page-width 同一教训）
 * 附带 soft-404 检测：正文只有 "Not Found" 的空壳页（静态托管返回 200，
 * 状态码检查看不见）。
 *
 * 为什么扫 dist/ 不扫源码：构建后的 HTML 是唯一完整真相——组件、配置数组、
 * markdown 正文产出的链接全在里面，无需解析 AST。
 *
 * 对应 launch-site.md §1 检查清单"每个页面能打开，导航/底部链接正常"——
 * 该人工项由本脚本机器兜底。任何死链即构建失败（exit 1）。
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');

if (!existsSync(DIST)) {
  console.error('❌ dist/ 不存在——先跑 npm run build。');
  process.exit(1);
}

// 收集全部 HTML 文件
const htmlFiles = [];
(function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name.endsWith('.html')) htmlFiles.push(p);
  }
})(DIST);

// 已存在的站内路径（统一去尾斜杠比较；directory 构建 /codes/ → dist/codes/index.html）
const knownPaths = new Set(['']);
for (const file of htmlFiles) {
  const rel = relative(DIST, file)
    .replace(/\\/g, '/')
    .replace(/index\.html$/, '')
    .replace(/\.html$/, '');
  knownPaths.add('/' + rel.replace(/\/$/, ''));
}
knownPaths.add('/');

const HREF_RE = /href="([^"]*)"/g;
const ASSET_RE = /\.(png|jpe?g|webp|svg|gif|ico|css|js|mjs|json|xml|txt|webmanifest|woff2?|avif|mp4)$/i;
const broken = new Map(); // href -> [出现页面]
const soft404 = [];
let checked = 0;

for (const file of htmlFiles) {
  const src = readFileSync(file, 'utf8');
  const pagePath = relative(DIST, file).replace(/\\/g, '/');
  if (src.trim() === 'Not Found') soft404.push(pagePath);
  let m;
  while ((m = HREF_RE.exec(src)) !== null) {
    const href = m[1];
    // 只查站内页面链接：跳过外链/锚点/协议链接/资源文件
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    if (ASSET_RE.test(href)) continue;
    checked++;
    const clean = href.split('#')[0].split('?')[0].replace(/\/$/, '');
    if (clean === '') continue;
    if (!knownPaths.has(clean)) {
      const list = broken.get(href) ?? [];
      if (list.length < 3) list.push(pagePath);
      broken.set(href, list);
    }
  }
}

console.log(`🔗 站内死链质检：${htmlFiles.length} 页共 ${checked} 条内链`);

if (soft404.length > 0) {
  console.error(`\n❌ ${soft404.length} 个 soft-404 空壳页（正文只有 "Not Found"，托管仍返回 200）：`);
  for (const p of soft404) console.error(`   ${p}`);
}

if (broken.size > 0) {
  console.error(`\n❌ ${broken.size} 条死链：`);
  for (const [href, pages] of broken) {
    console.error(`   ${href}`);
    for (const p of pages) console.error(`      ↳ 出现在 ${p}`);
    if (pages.length === 3) console.error('      ↳ …');
  }
  console.error('\n修复口径：改链接或恢复目标页；页型停用时记得同步删 site.ts 的 nav/tools 入口。');
}

if (broken.size > 0 || soft404.length > 0) process.exit(1);
console.log('✅ 全部内链可达，无 soft-404。');
