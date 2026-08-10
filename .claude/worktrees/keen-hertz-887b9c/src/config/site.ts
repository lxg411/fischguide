/**
 * 每上线一个新站，只需要修改这个文件 + src/data/ 下的数据文件 + src/content/ 下的攻略内容。
 * theme 部分是反足迹参数：每个站取不同的值，让模板外观彼此不同。
 *
 * 页型开关：不需要的页面，把 src/pages/ 里对应文件名加下划线前缀即可停用
 * （Astro 约定：_xxx.astro 不参与路由），nav 数组里同步删掉链接。
 */
export const SITE = {
  // ===== 站点身份 =====
  gameName: 'Sample Game', // 游戏名
  siteName: 'Sample Game Guide', // 站名（title 后缀、logo 文字）
  // 主关键词：一站一主词（域名、首页 H1、title 都围绕它），站内穷举它的长尾
  primaryKeyword: 'sample game guide',
  description:
    'Complete Sample Game guide: beginner tips, tier lists, codes, server status and player stats. Updated for the latest version.',
  language: 'en',
  // 官方购买/游玩链接（Steam 商店页、Roblox 体验页等），首页 CTA 用
  officialUrl: 'https://store.steampowered.com/',
  officialCtaLabel: 'Play on Steam',

  // ===== Discover 就绪（2026-07-30 调研落地，Raptive 数据：gaming 站约半数谷歌流量来自 Discover）=====
  // 站点默认 OG 大图：上站时放一张 ≥1200px 宽的 public/og.png 后填 '/og.png'。
  // 留空则不输出 og:image（宁缺毋 404——沿用 REPLACE-ME.invalid 的显式占位哲学）。
  // Discover 大图卡三前提：og:image + max-image-preview:large（布局已带）+ 图 ≥1200px 宽。
  ogImage: '',
  // 具名作者（E-E-A-T/Discover 信号）：填了会进 guides 页 Article 结构化数据的 author 字段
  author: '',

  // ===== 游戏事实（首页 hero 徽章 + Quick Facts + VideoGame 结构化数据）=====
  game: {
    developer: 'Sample Studio',
    genre: 'Online Co-op Action RPG',
    platforms: 'PC (Steam)',
    players: 'Solo or Online Co-op',
    price: '$19.99 USD',
    releaseDate: '2026-05-07', // ISO 格式
    releaseStage: 'Steam Early Access',
    reviewSummary: 'Mostly Positive',
  },

  // ===== 主导航（每站按启用的页型增删）=====
  nav: [
    { label: 'Guides', href: '/guides/' },
    { label: 'Codes', href: '/codes/' },
    { label: 'Tier List', href: '/tier-list/' },
    { label: 'Best Weapons', href: '/best-weapons/' },
    { label: 'Server Status', href: '/server-status/' },
    { label: 'Charts', href: '/player-count/' },
    { label: 'Release', href: '/release-date/' },
    { label: 'Review', href: '/review/' },
    { label: 'Roadmap', href: '/roadmap/' },
    { label: 'FAQ', href: '/faq/' },
  ],

  // ===== 首页 "Tools & Live Data" 区（对冲 AI Overviews 的页型入口）=====
  tools: [
    { tag: 'LIVE', title: 'Server Status', desc: 'Is the game down? Live status and login fixes.', href: '/server-status/' },
    { tag: 'DATA', title: 'Player Count', desc: 'Player count, 24h peak and 7-day trend.', href: '/player-count/' },
    { tag: 'TIER', title: 'Class Tier List', desc: 'S/A/B rankings — solo, duo and group scores.', href: '/tier-list/' },
    { tag: 'TIER', title: 'Best Weapons', desc: 'Top weapons by class with locations.', href: '/best-weapons/' },
    { tag: 'CODES', title: 'Codes', desc: 'Active promo codes, checked regularly.', href: '/codes/' },
    { tag: 'SPECS', title: 'System Requirements', desc: 'Minimum and recommended PC specs.', href: '/system-requirements/' },
  ],

  // ===== 主题参数（反足迹：每站改这些值）=====
  theme: {
    hue: 245, // 主色相 0-360，每站换一个
    accentHue: 30, // 强调色相
    radius: '10px', // 圆角
    heroAlign: 'left' as 'left' | 'center', // 首屏排版变体
  },

  // ===== 分析工具（从环境变量读取，留空不注入）=====
  gaId: import.meta.env.PUBLIC_GA_ID ?? '',
  clarityId: import.meta.env.PUBLIC_CLARITY_ID ?? '',
} as const;
