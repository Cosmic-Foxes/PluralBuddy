import { createFromSource } from 'fumadocs-core/search/server';
import { source } from '@/lib/source';

export const { GET } = createFromSource(source, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: 'english',
  buildIndex(page) {
    return {

      title: page.data.title,
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData: page.data.structuredData,
      // use your desired value, like page.slugs[0]
      tag: page.slugs[0],
    }
  },
  localeMap: {
    // [locale]: Orama options
    pt: { language: 'portuguese' },
    de: { language: 'german' },
    en: { language: 'english' },
  },
  sort: {},
  components: {},
  plugins: {}
});
