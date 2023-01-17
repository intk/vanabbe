import { defineMessages } from 'react-intl';

const DEFAULT_HEADLINE_LEVELS = [
  ['h1', 'h1'],
  ['h2', 'h2'],
  ['h3', 'h3'],
  ['h4', 'h4'],
];

const messages = defineMessages({
  headline: {
    id: 'headline',
    defaultMessage: 'Headline',
  },
  buttonText: {
    id: 'buttonText',
    defaultMessage: 'Button text',
  },
  linkHref: {
    id: 'linkHref',
    defaultMessage: 'Button call to action',
  },
  image: {
    id: 'image',
    defaultMessage: 'Image',
  },
  headlineTag: {
    id: 'Headline level',
    defaultMessage: 'Headline level',
  },
});

const HeroUnitSchema = ({ intl }) => ({
  title: 'Hero unit block',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: [
        'headline',
        'headlineTag',
        'buttonText',
        'linkHref',
        'attachedimage',
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
    headlineTag: {
      title: intl.formatMessage(messages.headlineTag),
      choices: DEFAULT_HEADLINE_LEVELS,
      default: 'h2',
      noValueOption: false,
    },
    attachedimage: {
      widget: 'attachedimage',
      title: intl.formatMessage(messages.image),
    },
  },
  required: [],
});

export default HeroUnitSchema;
