import { defineMessages } from 'react-intl';

export const SocialLink = (props) => ({
  title: 'Social link',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['href', 'title'],
    },
  ],
  properties: {
    title: {
      title: 'Link title',
    },
    href: {
      title: 'Social link',
      widget: 'url',
    },
  },
  required: ['title', 'href'],
});

const messages = defineMessages({
  sectionTitle: {
    id: 'sectionTitle',
    defaultMessage: 'Section title',
  },
  address: {
    id: 'address',
    defaultMessage: 'Address',
  },
  phone: {
    id: 'phone',
    defaultMessage: 'Phone',
  },
  email: {
    id: 'email',
    defaultMessage: 'Email',
  },
  contact: {
    id: 'Contact',
    defaultMessage: 'Contact',
  },
  openingHours: {
    id: 'openingHours',
    defaultMessage: 'Opening hours',
  },
  openingHoursTitle: {
    id: 'openingHoursTitle',
    defineMessages: 'Title',
  },
  openingHoursDescription: {
    id: 'openingHoursDescription',
    defaultMessage: 'Opening hours are displayed in the header.',
  },
  SiteData: {
    id: 'SiteData',
    defaultMessage: 'Global site settings',
  },
  SocialLinks: {
    id: 'SocialLinks',
    defaultMessage: 'Social Links',
  },
  buttonTitle: {
    id: 'buttonTitle',
    defaultMessage: 'Button title',
  },
  buttonHrefTitle: {
    id: 'buttonHrefTitle',
    defaultMessage: 'Button call to action',
  },
  buttonDescription: {
    id: 'buttonDescription',
    defaultMessage: 'Tickets button. Displayed in the header.',
  },
});

const SiteDataSchema = ({ intl }) => ({
  title: intl.formatMessage(messages.SiteData),
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: [
        'openingHours',
        'openingHoursTitle',
        'buttonTitle',
        'buttonHref',
      ],
    },
    {
      id: 'contact',
      title: intl.formatMessage(messages.contact),
      fields: ['contactTitle', 'address', 'phone', 'email'],
    },
    {
      id: 'socialLinks',
      title: intl.formatMessage(messages.SocialLinks),
      fields: ['socialLinksTitle', 'socialLinks'],
    },
  ],

  properties: {
    contactTitle: {
      title: intl.formatMessage(messages.sectionTitle),
    },
    address: {
      title: intl.formatMessage(messages.address),
    },
    phone: {
      title: intl.formatMessage(messages.phone),
    },
    email: {
      title: intl.formatMessage(messages.email),
    },
    openingHours: {
      title: intl.formatMessage(messages.openingHours),
    },
    openingHoursTitle: {
      title: 'Text',
      description: intl.formatMessage(messages.openingHoursDescription),
    },
    socialLinksTitle: {
      title: intl.formatMessage(messages.sectionTitle),
    },
    socialLinks: {
      title: intl.formatMessage(messages.SocialLinks),
      widget: 'object_list',
      schema: SocialLink(),
    },
    buttonTitle: {
      title: intl.formatMessage(messages.buttonTitle),
      default: 'Tickets',
    },
    buttonHref: {
      title: intl.formatMessage(messages.buttonHrefTitle),
      widget: 'object_browser',
      mode: 'link',
      selectedItemAttrs: ['Title', 'Description'],
      allowExternals: true,
      description: intl.formatMessage(messages.buttonDescription),
    },
  },
  required: [],
});

export default SiteDataSchema;
