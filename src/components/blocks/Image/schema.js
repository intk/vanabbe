import { flattenToAppURL } from '@plone/volto/helpers';

import clearSVG from '@plone/volto/icons/clear.svg';
import navTreeSVG from '@plone/volto/icons/nav.svg';

const ImageSchema = (props) => {
  const { block, data = {}, onChangeBlock, openObjectBrowser } = props;

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
        title: 'Image source',
        description: 'Write here the source/copyright of this image',
      },
      sourceHref: {
        title: 'Source website',
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
        title: 'Image caption',
        description: 'The image caption will be shown under the image',
      },
    },
    required: [],
  };
};

export default ImageSchema;
