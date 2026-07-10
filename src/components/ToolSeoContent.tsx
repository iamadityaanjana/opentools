import Link from 'next/link';
import { getToolPageContent } from '../content/tool-page-content';
import { TOOL_BY_ID } from '../tools/catalog';

export function ToolSeoContent({ toolId }: { toolId: string }) {
  const tool = TOOL_BY_ID.get(toolId);
  if (!tool) return null;
  const content = getToolPageContent(tool);

  const related = content.relatedToolIds
    .map((id) => TOOL_BY_ID.get(id))
    .filter((tool) => tool?.status === 'live' && tool.route);

  return (
    <section className="tool-seo" aria-labelledby="tool-guide-title">
      <div className="article-prose">
        <p className="content-kicker">Reviewed {content.reviewedAt}</p>
        <h2 id="tool-guide-title">About {content.title}</h2>
        {content.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

        {content.supportedFormats?.length ? (
          <>
            <h2>Supported formats</h2>
            <ul>{content.supportedFormats.map((format) => <li key={format}>{format}</li>)}</ul>
          </>
        ) : null}

        <h2>How to use it</h2>
        <ol>
          {content.steps.map((step) => (
            <li key={step.title}><strong>{step.title}.</strong> {step.description}</li>
          ))}
        </ol>

        <h2>Useful for</h2>
        <ul>{content.useCases.map((useCase) => <li key={useCase}>{useCase}</li>)}</ul>

        <h2>Limitations</h2>
        <ul>{content.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>

        <h2>Questions and answers</h2>
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
            <h2>Related tools</h2>
            <div className="related-links">
              {related.map((tool) => (
                <Link className="btn btn--sm" href={tool!.route!} key={tool!.id}>{tool!.name}</Link>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
