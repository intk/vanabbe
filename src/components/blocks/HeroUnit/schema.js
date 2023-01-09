import { defineMessages } from 'react-intl';

const DEFAULT_HEADLINE_LEVELS = [
  ['h1', 'h1'],
  ['h2', 'h2'],
  ['h3', 'h3'],
  ['h4', 'h4'],
];

const messages = defineMessages({
  title: {
    id: 'title',
    defaultMessage: 'Title',
  },
  image: {
    id: 'image',
    defaultMessage: 'Image',
  },
  heroUnit: {
    id: 'heroUnit',
    defaultMessage: 'Hero unit block',
  },
  headlineTag: {
    id: 'Headline level',
    defaultMessage: 'Headline level',
  },
});

const HeroUnitSchema = ({ intl }) => ({
  title: intl.formatMessage(messages.heroUnit),
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['title', 'headlineTag', 'attachedimage'],
    },
  ],

  properties: {
    title: {
      title: intl.formatMessage(messages.title),
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
