/**
 * 每上线一个新站，只需要修改这个文件 + src/data/ 下的数据文件 + src/content/ 下的攻略内容。
 * theme 部分是反足迹参数：每个站取不同的值，让模板外观彼此不同。
 *
 * 本站（Fisch / fischguide.wiki）为**泳道2长青资料站**：交易值表主体
 * （三大社区值体系 Proto/TrueVal/TradeHub 交叉仲裁 + 分歧标注，周更）
 * + mutation 乘数速查（325 条全量，官方 wiki 提取核实）+ rod tier list（248 根全字段）
 * + codes 入口（闪码模式差异化：本游戏周更码 24-48h 过期，媒体通版页不讲这个）。
 * 歧义对策：主词 fisch 是德语"鱼"通用词——全站瞄 fisch values / roblox fisch 组合词族，FAQ 消歧。
 */
export const SITE = {
  // ===== 站点身份 =====
  gameName: 'Fisch',
  siteName: 'Fisch Guide',
  primaryKeyword: 'fisch values',
  description:
    'Fisch guide for Roblox: live trading values with demand ratings, all 325 mutation multipliers, complete rod tier list and working codes — updated weekly.',
  language: 'en',
  officialUrl: 'https://www.roblox.com/games/16732694052/Fisch-THE-DEEP',
  officialCtaLabel: 'Play on Roblox',

  // ===== Discover 就绪 =====
  ogImage: '/og.png',
  author: 'The Harbor Master',

  // ===== 游戏事实（首页 hero 徽章 + Quick Facts + VideoGame 结构化数据）=====
  game: {
    developer: 'Fisch Studios',
    genre: 'Fishing Adventure / Trading',
    platforms: 'Roblox (PC, Mobile, Console)',
    players: '45,710 online (Aug 2026)',
    price: 'Free to Play',
    releaseDate: '2024-03-13',
    releaseStage: 'Live — THE DEEP update',
    reviewSummary: '4.75B visits, 3.56M favorites',
  },

  // ===== 主导航 =====
  nav: [
    { label: 'Values', href: '/values/' },
    { label: 'Mutations', href: '/mutations/' },
    { label: 'Rod Tier List', href: '/rod-tier-list/' },
    { label: 'Codes', href: '/codes/' },
    { label: 'Guides', href: '/guides/' },
    { label: 'FAQ', href: '/faq/' },
  ],

  // ===== 首页 "Tools & Live Data" 区 =====
  tools: [
    { tag: 'VALUES', title: 'Trading Value List', desc: 'Boats, rod skins & cosmetics — three community systems cross-checked weekly.', href: '/values/' },
    { tag: 'DATA', title: 'Mutation Multipliers', desc: 'All 325 mutations ranked by sell-value multiplier, Aether 12x to Glitched 0x.', href: '/mutations/' },
    { tag: 'TIER', title: 'Rod Tier List', desc: 'Every rod with lure, luck and control stats — 248 rods ranked by stage.', href: '/rod-tier-list/' },
    { tag: 'CODES', title: 'Working Codes', desc: 'Active codes plus the flash-code schedule so you stop missing 24h drops.', href: '/codes/' },
    { tag: 'GUIDE', title: 'Trading Guide', desc: 'WFL basics, scam patterns and how the three value systems differ.', href: '/guides/trading-guide/' },
    { tag: 'FAQ', title: 'Fisch FAQ', desc: 'New-player answers — from appraisal odds to what "Fisch" even means.', href: '/faq/' },
  ],

  // ===== 主题参数（反足迹）=====
  theme: {
    hue: 200, // 深海蓝
    accentHue: 168, // 蓝绿（THE DEEP 调性）
    radius: '14px',
    heroAlign: 'center' as 'left' | 'center',
  },

  // ===== 分析工具 =====
  gaId: import.meta.env.PUBLIC_GA_ID ?? '',
  clarityId: import.meta.env.PUBLIC_CLARITY_ID ?? '',
} as const;
