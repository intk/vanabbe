// See https://react-slick.neostack.com/docs/api
export const ImageCarouselSchema = ({ data, schema, intl }) => {
  return {
    fieldsets: [
      {
        id: 'imageCarouselSpotlight',
        title: 'Image Carousel Settings',
        fields: [
          'autoplay',
          'autoplaySpeed',
          'hideNavigationDots',
          'height',
          'itemsPerRow',
        ],
      },
    ],
    properties: {
      autoplay: {
        type: 'boolean',
        title: 'Autoplay',
      },
      autoplaySpeed: {
        type: 'number',
        title: 'Autoplay delay',
        defaultValue: 50,
      },
      hideNavigationDots: {
        type: 'boolean',
        title: 'Hide navigation dots',
      },
      itemsPerRow: {
        type: 'number',
        title: 'Items per row',
        defaultValue: 4,
      },
      height: {
        defaultValue: '25vh',
        title: (
          <a
            rel="noreferrer"
            target="_blank"
            href="https://developer.mozilla.org/en-US/docs/Web/CSS/height"
          >
            CSS height
          </a>
        ),
      },
    },
  };
};

export const LogoCardsSchema = (args) => {
  return {
    title: 'Logo Cards',
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: ['attachedimage', 'linkHref'],
      },
    ],

    properties: {
      attachedimage: {
        widget: 'attachedimage',
        title: 'Image',
      },
      linkHref: {
        widget: 'url',
        title: 'Link',
      },
    },

    required: [],
  };
};

export const TestimonialCardsSchema = (args) => {
  return {
    title: 'Testimonial Card',
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: ['name', 'post', 'text', 'attachedimage'],
      },
    ],

    properties: {
      name: {
        type: 'string',
        title: 'Name',
      },
      post: {
        type: 'string',
        title: 'Post',
      },
      text: {
        widget: 'slate_richtext',
        title: 'Text',
      },
      attachedimage: {
        widget: 'attachedimage',
        title: 'Avatar',
      },
    },

    required: [],
  };
};

export const SplashyCarouselSchema = (args) => {
  return {
    title: 'Splashy Carousel',
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: [
          'title',
          'subTitle',
          'videoUrl',
          'linkHref',
          'linkTitle',
          'attachedimage',
        ],
      },
    ],

    properties: {
      title: {
        type: 'string',
        title: 'Title',
      },
      subTitle: {
        type: 'string',
        title: 'Subtitle',
      },
      videoUrl: {
        widget: 'text',
        title: 'Video URL',
        description: 'Youtube/Vimeo video URL',
      },
      linkTitle: {
        title: 'Button title',
      },
      linkHref: {
        title: 'Call to action',
        widget: 'object_browser',
        mode: 'link',
        selectedItemAttrs: ['Title', 'Description'],
        allowExternals: true,
      },
      attachedimage: {
        widget: 'attachedimage',
        title: 'Image',
      },
    },

    required: ['attachedimage'],
  };
};

export const VideoCardSchema = (args) => {
  return {
    title: 'Video Card',
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: ['title', 'videoUrl', 'linkHref', 'linkTitle', 'attachedimage'],
      },
    ],

    properties: {
      title: {
        type: 'string',
        title: 'Message',
      },
      videoUrl: {
        widget: 'text',
        title: 'Video URL',
        description: 'Youtube/Vimeo video URL',
      },
      linkTitle: {
        title: 'Button title',
      },
      linkHref: {
        title: 'Call to action',
        widget: 'object_browser',
        mode: 'link',
        selectedItemAttrs: ['Title', 'Description'],
        allowExternals: true,
      },
      attachedimage: {
        widget: 'attachedimage',
        title: 'Preview image',
      },
    },

    required: ['attachedimage'],
  };
};
