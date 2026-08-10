import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 一个关键词一个内页：guides 集合，slug 即 URL
const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // 本页瞄准的关键词（一夫一妻制：一页只做一个词）
    keyword: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    // 页面配图（Discover 大图卡素材，≥1200px 宽，放 public/images/ 下）
    image: z.string().optional(),
  }),
});

export const collections = { guides };
