import ImageCarousel, { ImageCarouselCardSchema } from './Carousel';
import LogoCards, { LogoCardsSchema } from './LogoCarousel';
import ImageGallery from './ImageGallery';

export default function install(config) {
  config.blocks.blocksConfig.imagecards.defaultRendererName = 'logoCards';
  config.blocks.blocksConfig.imagecards.blockRenderers = {
    ...config.blocks.blocksConfig.imagecards.blockRenderers,
    logoCards: {
      title: 'Logo Cards',
      schema: LogoCardsSchema,
      view: LogoCards,
      schemaExtender: LogoCards.schemaExtender,
    },
    imageGallery: {
      title: 'Image Gallery',
      schema: null,
      view: ImageGallery,
      schemaExtender: ImageGallery.schemaExtender,
    },
    imageCarousel: {
      title: 'Image Carousel',
      view: ImageCarousel,
      schema: ImageCarouselCardSchema,
      schemaExtender: ImageCarousel.schemaExtender,
    },
  };

  delete config.blocks.blocksConfig.imagecards.blockRenderers.carousel;
  delete config.blocks.blocksConfig.imagecards.blockRenderers.discreetCarousel;
  delete config.blocks.blocksConfig.imagecards.blockRenderers.round_tiled;

  return config;
}
