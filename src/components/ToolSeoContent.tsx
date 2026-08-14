import Link from 'next/link';
import { getToolPageContent } from '../content/tool-page-content';
import {
  CATEGORY_BY_ID, GROUP_HOME, GROUP_LABEL, TOOL_BY_ID,
} from '../tools/catalog';

export function ToolSeoContent({ toolId }: { toolId: string }) {
  const tool = TOOL_BY_ID.get(toolId);
  if (!tool) return null;
  const content = getToolPageContent(tool);
  const category = CATEGORY_BY_ID.get(tool.categoryId);

  const related = content.relatedToolIds
    .map((id) => TOOL_BY_ID.get(id))
    .filter((tool) => tool?.status === 'live' && tool.route)
    .slice(0, 6);

  return (
    <section className="tool-seo" aria-labelledby="tool-guide-title">
      <div className="article-prose">
        <p className="content-kicker">Reviewed {content.reviewedAt}</p>
        <h2 id="tool-guide-title">Free {content.title} – how it works</h2>
        {content.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

        {content.supportedFormats?.length ? (
          <>
            <h2>Supported formats</h2>
            <ul>{content.supportedFormats.map((format) => <li key={format}>{format}</li>)}</ul>
          </>
        ) : null}

        <h2 id="how-to-use">How to use {content.title} online</h2>
        <ol>
          {content.steps.map((step) => (
            <li key={step.title}><strong>{step.title}.</strong> {step.description}</li>
          ))}
        </ol>

        <h2>When to use it</h2>
        <ul>{content.useCases.map((useCase) => <li key={useCase}>{useCase}</li>)}</ul>

        <h2>Known limitations</h2>
        <ul>{content.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>

        <h2 id="faq">Frequently asked questions</h2>
        <div className="faq-list">
          {content.faqs.map((faq) => (
            <details className="faq-item" key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>

        {related.length ? (
          <>
            <h2>Related free tools</h2>
            <div className="related-links">
              {related.map((tool) => (
                <Link className="btn btn--sm" href={tool!.route!} key={tool!.id}>{tool!.name}</Link>
              ))}
            </div>
          </>
        ) : null}

        {category && (
          <p className="tool-seo__hub">
            Browse every{' '}
            <Link href={GROUP_HOME[category.group]}>
              {GROUP_LABEL[category.group].toLowerCase()}
            </Link>
            , or jump straight to{' '}
            <Link href={`${GROUP_HOME[category.group]}#category-${category.id}`}>
              {category.label.toLowerCase()}
            </Link>
            .
          </p>
        )}
      </div>
    </section>
  );
}
