import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE } from '../config/site';

/**
 * RSS 输出（2026-07-30 Discover 就绪落地）：guides 集合按发布时间倒序。
 * Discover/Follow 按钮/聚合器都吃这个 feed；BaseLayout 已挂 <link rel="alternate">。
 */
export async function GET(context: APIContext) {
  const guides = await getCollection('guides');
  return rss({
    title: SITE.siteName,
    description: SITE.description,
    site: context.site!,
    items: guides
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map((g) => ({
        title: g.data.title,
        description: g.data.description,
        pubDate: g.data.updatedDate ?? g.data.pubDate,
        link: `/guides/${g.id}/`,
      })),
  });
}
