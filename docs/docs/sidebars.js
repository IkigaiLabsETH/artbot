// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    'intro',
    'quickstart',
    {
      type: 'category',
      label: 'Guides',
      link: {
        type: 'generated-index',
        title: 'Guides',
        description: 'Learn how to use elizaOS',
        slug: '/category/guides',
        keywords: ['guides'],
      },
      items: [
        'guides/configuration',
        'guides/characters',
        'guides/memory-management',
        'guides/fine-tuning',
        'guides/secrets-management',
        'guides/remote-deployment',
        'guides/start-script',
        'guides/template-configuration',
        'guides/wsl',
        'guides/nft-trading-automation',
      ],
    },
    {
      type: 'category',
      label: 'Core Concepts',
      link: {
        type: 'generated-index',
        title: 'Core Concepts',
        description: 'Learn about the core concepts of elizaOS',
        slug: '/category/core',
        keywords: ['core'],
      },
      items: [
        'core/architecture',
        'core/agent',
        'core/plugins',
        'core/actions',
        'core/evaluators',
        'core/providers',
        'core/services',
        'core/memory',
        'core/character',
        'core/runtime',
        'core/llm',
      ],
    },
    {
      type: 'category',
      label: 'Tutorials',
      link: {
        type: 'generated-index',
        title: 'Tutorials',
        description: 'Learn how to use elizaOS with step-by-step tutorials',
        slug: '/category/tutorials',
        keywords: ['tutorials'],
      },
      items: [
        'tutorials/create-plugin',
        'tutorials/create-action',
        'tutorials/create-evaluator',
        'tutorials/create-provider',
        'tutorials/create-service',
        'tutorials/create-character',
      ],
    },
    {
      type: 'category',
      label: 'Advanced',
      link: {
        type: 'generated-index',
        title: 'Advanced',
        description: 'Advanced topics for elizaOS',
        slug: '/category/advanced',
        keywords: ['advanced'],
      },
      items: [
        'advanced/custom-llm',
        'advanced/custom-memory',
        'advanced/custom-runtime',
        'advanced/custom-character',
        'advanced/custom-plugin',
        'advanced/custom-action',
        'advanced/custom-evaluator',
        'advanced/custom-provider',
        'advanced/custom-service',
      ],
    },
    'faq',
    'contributing',
    'changelog',
  ],
  api: [
    {
      type: 'autogenerated',
      dirName: '.',
    },
    'api/nft-trading',
  ],
};

module.exports = sidebars; 