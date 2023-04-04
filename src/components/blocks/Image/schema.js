import { defineMessages } from 'react-intl';
import { flattenToAppURL } from '@plone/volto/helpers';

import clearSVG from '@plone/volto/icons/clear.svg';
import navTreeSVG from '@plone/volto/icons/nav.svg';

const messages = defineMessages({
  imageSource: {
    id: 'Image source',
    defaultMessage: 'Image source',
  },
  imageSourceDescription: {
    id: 'Write here the source/copyright of this image',
    defaultMessage: 'Write here the source/copyright of this image',
  },
  sourceURL: {
    id: 'Source website',
    defaultMessage: 'Source website',
  },
  imageCaption: {
    id: 'Image caption',
    defaultMessage: 'Image caption',
  },
  imageCaptionDescription: {
    id: 'The image caption will be shown under the image',
    defaultMessage: 'The image caption will be shown under the image',
  },
});

const ImageSchema = (props) => {
  const { block, data = {}, onChangeBlock, openObjectBrowser, intl } = props;

  return {
    title: 'Image',
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: ['source', 'sourceHref', 'imageCaption'],
      },
    ],
    properties: {
      source: {
        title: intl.formatMessage(messages.imageSource),
        description: intl.formatMessage(messages.imageSourceDescription),
      },
      sourceHref: {
        title: intl.formatMessage(messages.sourceURL),
        icon: data.href ? clearSVG : navTreeSVG,
        iconAction: data.href
          ? () => {
              onChangeBlock(block, {
                ...data,
                href: '',
                title: '',
                description: '',
                preview_image: '',
              });
            }
          : () => openObjectBrowser({ mode: 'link' }),
        value: data.href && flattenToAppURL(data.href),
      },
      imageCaption: {
        type: 'richtext',
        title: intl.formatMessage(messages.imageCaption),
        description: intl.formatMessage(messages.imageCaptionDescription),
      },
    },
    required: [],
  };
};

export default ImageSchema;
