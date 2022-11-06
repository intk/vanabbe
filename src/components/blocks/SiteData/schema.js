import { defineMessages } from 'react-intl';

export const SocialIcon = (props) => ({
  title: 'Social icon',
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
      fields: ['address', 'phone', 'email', 'openHours', 'socialLinks'], //  'url'
      title: 'Default',
    },
  ],

  properties: {
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
    socialLinks: {
      title: intl.formatMessage(messages.SocialLinks),
      widget: 'object_list',
      schema: SocialIcon(),
    },
  },
  required: [],
});

export default SiteDataSchema;
