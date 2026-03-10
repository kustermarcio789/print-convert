import { useParams, Navigate } from 'react-router-dom';
import { SEOPageRenderer } from '@/components/SEOPageRenderer';
import { getSEOPageBySlug } from '@/lib/seoContent';

export default function SEOContent() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return <Navigate to="/" replace />;
  }

  const page = getSEOPageBySlug(slug);

  if (!page) {
    return <Navigate to="/" replace />;
  }

  return <SEOPageRenderer page={page} />;
}
