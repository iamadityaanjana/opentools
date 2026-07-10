import { ARTICLES } from '../content/articles';
import { CATEGORY_BY_ID, TOOL_BY_ID } from '../tools/catalog';
import { GuideLinks } from './GuideLinks';

export function GuidesForTool({ toolId }: { toolId: string }) {
  const tool = TOOL_BY_ID.get(toolId);
  const group = tool ? CATEGORY_BY_ID.get(tool.categoryId)?.group : undefined;
  const ranked = ARTICLES.map((article) => {
    if (article.relatedToolIds.includes(toolId)) return { article, score: 3 };
    const relatedTools = article.relatedToolIds.map((id) => TOOL_BY_ID.get(id)).filter(Boolean);
    if (tool && relatedTools.some((related) => related?.categoryId === tool.categoryId)) return { article, score: 2 };
    if (group && relatedTools.some((related) => CATEGORY_BY_ID.get(related!.categoryId)?.group === group)) return { article, score: 1 };
    return { article, score: 0 };
  });
  const slugs = ranked
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ article }) => article.slug);
  return <GuideLinks slugs={slugs} title={`Guides related to ${tool?.name ?? 'this tool'}`} />;
}
