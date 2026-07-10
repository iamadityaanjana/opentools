import { ARTICLES } from '../content/articles';
import { GuideLinks } from './GuideLinks';

export function GuidesForTool({ toolId }: { toolId: string }) {
  const slugs = ARTICLES
    .filter((article) => article.relatedToolIds.includes(toolId))
    .slice(0, 3)
    .map((article) => article.slug);
  return <GuideLinks slugs={slugs} />;
}
