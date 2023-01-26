import { defineMessages } from 'react-intl';

const DEFAULT_HEADLINE_LEVELS = [
  ['h1', 'h1'],
  ['h2', 'h2'],
  ['h3', 'h3'],
  ['h4', 'h4'],
];

const messages = defineMessages({
  headline: {
    id: 'Headline',
    defaultMessage: 'Headline',
  },
  buttonText: {
    id: 'Button text',
    defaultMessage: 'Button text',
  },
  linkHref: {
    id: 'Button call to action',
    defaultMessage: 'Button call to action',
  },
  headlineTag: {
    id: 'Headline level',
    defaultMessage: 'Headline level',
  },
  image: {
    id: 'Image',
    defaultMessage: 'Image',
  },
});

const HeroUnitSchema = ({ intl, data }) => ({
  title: 'Hero unit block',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: [
        'headline',
        'headlineTag',
        ...(!data.videoUrl ? ['attachedimage'] : []),
        ...(!data.attachedimage ? ['videoUrl'] : []),
        'buttonText',
        'linkHref',
      ],
    },
  ],

  properties: {
    headline: {
      title: intl.formatMessage(messages.headline),
    },
    buttonText: {
      title: intl.formatMessage(messages.buttonText),
    },
    linkHref: {
      title: intl.formatMessage(messages.linkHref),
      widget: 'object_browser',
      mode: 'link',
      selectedItemAttrs: ['Title', 'Description'],
      allowExternals: true,
    },
    videoUrl: {
      widget: 'text',
      title: 'Video URL',
      description: 'Youtube/Vimeo video URL',
    },
    attachedimage: {
      widget: 'attachedimage',
      title: intl.formatMessage(messages.image),
    },
    headlineTag: {
      title: intl.formatMessage(messages.headlineTag),
      choices: DEFAULT_HEADLINE_LEVELS,
      default: 'h2',
      noValueOption: false,
    },
  },
  required: [],
});

export default HeroUnitSchema;
