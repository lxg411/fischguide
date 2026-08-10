# Game Guide Site Template

游戏攻略站模板（Astro 5 静态站），页型对标成熟明星站（farevergame.wiki 形态）：一站一主词，站内穷举长尾关键词。每上线一个新站只改三处——

1. `src/config/site.ts` — 游戏名、主关键词、游戏事实（价格/发售日/平台）、导航、主题参数（每站取不同值）
2. `src/data/*.json` — 各页型数据（codes、tier list、玩家数、服务器状态、评测、路线图、配置要求、FAQ、新闻）
3. `src/content/guides/*.md` — 攻略内页（一个关键词一个内页）

部署平台环境变量（见 `.env.example`）：`SITE_URL`、`PUBLIC_GA_ID`、`PUBLIC_CLARITY_ID`。

## 页型库

| 页面 | 瞄准的搜索意图 | 数据来源 |
|---|---|---|
| `/`（首页） | `{game} guide` 主词 | config + 各数据文件聚合 |
| `/guides/*` | 各长尾攻略词 | `src/content/guides/*.md` |
| `/codes/` | `{game} codes` | `data/codes.json`（标题自动带当月） |
| `/tier-list/` | `{game} tier list` | `data/tier-list.json` |
| `/best-weapons/` | `{game} best weapons` | `data/weapons-tier-list.json` |
| `/server-status/` | `is {game} down` | `data/server-status.json`（Stage 3 接实时源） |
| `/player-count/` | `{game} player count / steam charts` | `data/player-stats.json`（Stage 3 接 Steam API） |
| `/release-date/` | `{game} release date` | config + `data/roadmap.json` |
| `/system-requirements/` | `{game} system requirements` | `data/system-requirements.json` |
| `/review/` | `is {game} worth it` | `data/review.json`（含 Review 结构化数据） |
| `/roadmap/` | `{game} roadmap` | `data/roadmap.json` |
| `/faq/` | 各类问句词 | `data/faq.json`（首页展示前 3 条） |
| `/about/ /privacy/ /contact/` | 信任页（广告审核必需） | 静态 |

**页型开关**：测试站不需要的页面，把 `src/pages/` 里对应文件加下划线前缀停用（如 `_review.astro`，Astro 约定不参与路由），并从 `site.ts` 的 `nav`/`tools` 数组删掉入口。测试站建议起步集：首页 + guides + codes + faq；数据起来后再逐个页型开启。

## 命令

```bash
npm install    # 安装依赖
npm run dev    # 本地开发 http://localhost:4321
npm run build  # 构建（产出 dist/，含 sitemap-index.xml）
```

## 内置的 SEO 能力

- Title/Meta/Canonical/OG 模板化（`BaseLayout.astro`）
- 结构化数据：VideoGame + WebSite（首页）、Article + BreadcrumbList（内页）、FAQPage（FAQ 组件）、ItemList（tier list）、Review（评测页）
- `sitemap-index.xml` 构建时自动生成，`robots.txt` 动态指向
- codes / server-status / player-count 属于实时维护型页面（AI Overviews 难以替代），日期随构建自动刷新
- 底部 About / Privacy / Contact 齐全（广告联盟审核 + 检查清单要求）

## 上线检查清单（对应 SOP 2.3 第四步）

- [ ] 每个页面能打开，导航/底部链接正常
- [ ] Title 含主关键词、Description 说明页面用途、H1 与主题一致
- [ ] `contact.astro` 里的邮箱已替换为真实地址
- [ ] 各 `data/*.json` 已替换为该游戏的真实数据（不要带着占位数据上线）
- [ ] Lighthouse SEO ≥ 95

项目整体规划见 `IMPLEMENTATION_PLAN.md`。
