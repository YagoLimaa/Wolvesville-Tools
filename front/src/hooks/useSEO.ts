import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string[];
  author?: string;
  schemaMarkup?: Record<string, unknown>;
}

export const useSEO = ({
  title,
  description,
  image = 'https://wolvesville-tools.pages.dev/link.png',
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = 'website',
  keywords = [],
  author = 'Wolvesville Tools',
  schemaMarkup,
}: SEOProps) => {
  useEffect(() => {
    const fullTitle = title.includes('Wolvesville') 
      ? title 
      : `${title} - Wolvesville Tools`;
    
    document.title = fullTitle;
    updateMetaTag('name', 'description', description);
    updateMetaTag('name', 'keywords', keywords.join(', '));
    updateMetaTag('name', 'author', author);
    
    updateMetaTag('property', 'og:title', fullTitle);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:image', image);
    updateMetaTag('property', 'og:url', url);
    updateMetaTag('property', 'og:type', type);
    

    updateMetaTag('name', 'twitter:title', fullTitle);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', image);
    updateMetaTag('name', 'twitter:card', 'summary_large_image');

 
    updateCanonicalURL(url);
    if (schemaMarkup) {
      updateSchemaMarkup(schemaMarkup);
    }
  }, [title, description, image, url, type, keywords, author, schemaMarkup]);
};

const updateMetaTag = (
  attribute: 'name' | 'property',
  value: string,
  content: string
) => {
  let element = document.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${value}"]`
  );

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
};

const updateCanonicalURL = (url: string) => {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }

  link.setAttribute('href', url);
};

const updateSchemaMarkup = (schema: Record<string, unknown>) => {
  const oldScript = document.querySelector(
    'script[type="application/ld+json"]'
  );
  if (oldScript) {
    oldScript.remove();
  }

  const script = document.createElement('script');
  script.setAttribute('type', 'application/ld+json');
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
};
