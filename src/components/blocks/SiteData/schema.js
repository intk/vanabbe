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
  contactTitle: {
    id: 'contactTitle',
    defaultMessage: 'Contact title',
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
  openHours: {
    id: 'openHours',
    defaultMessage: 'Open hours',
  },
  SiteData: {
    id: 'SiteData',
    defaultMessage: 'Global site settings',
  },
  socialLinksTitle: {
    id: 'SocialLinksTitle',
    defaultMessage: 'Social links title',
  },
  SocialLinks: {
    id: 'SocialLinks',
    defaultMessage: 'Social Links',
  },
});

const SiteDataSchema = ({ intl }) => ({
  title: intl.formatMessage(messages.SiteData),
  fieldsets: [
    {
      id: 'default',
      fields: [
        'contactTitle',
        'address',
        'phone',
        'email',
        'openHours',
        'socialLinksTitle',
        'socialLinks',
      ], //  'url'
      title: 'Default',
    },
  ],

  properties: {
    contactTitle: {
      title: intl.formatMessage(messages.contactTitle),
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
    openHours: {
      title: intl.formatMessage(messages.openHours),
    },
    socialLinksTitle: {
      title: intl.formatMessage(messages.socialLinksTitle),
    },
    socialLinks: {
      title: intl.formatMessage(messages.SocialLinks),
      widget: 'object_list',
      schema: SocialLink(),
    },
  },
  required: [],
});

export default SiteDataSchema;
