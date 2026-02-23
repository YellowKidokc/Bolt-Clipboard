import type { CustomPage } from '../../types';
import ResearchLinksView from '../research/ResearchLinksView';

interface CustomPageViewProps {
  page: CustomPage;
}

export default function CustomPageView({ page }: CustomPageViewProps) {
  if (page.page_type === 'link_collection') {
    return <ResearchLinksView pageId={page.id} />;
  }

  if (page.page_type === 'text_collection') {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
          Text collection page (coming soon)
        </p>
      </div>
    );
  }

  if (page.page_type === 'embed') {
    const embedUrl = (page.config as any).url || '';
    return (
      <div style={{ width: '100%', height: '100%' }}>
        {embedUrl ? (
          <iframe
            src={embedUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            title={page.name}
          />
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-muted)'
          }}>
            <p style={{ fontSize: '11px' }}>No URL configured for this embed page</p>
          </div>
        )}
      </div>
    );
  }

  if (page.page_type === 'custom_html') {
    const htmlContent = (page.config as any).html || '';
    return (
      <div
        style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
        Unknown page type
      </p>
    </div>
  );
}
