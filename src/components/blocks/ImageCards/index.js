import ImageCarousel, { ImageCarouselCardSchema } from './Carousel';
import LogoCards, { LogoCardsSchema } from './LogoCarousel';
import ImageGallery from './ImageGallery';
// import PresentationCards from './PresentationCards';
// import SplashyCarousel, { SplashyCarouselSchema } from './SplashyCarousel';
// import VideoCarousel, { VideoCardSchema } from './VideoCarousel';

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
    // presentationCards: {
    //   title: 'Presentation Cards',
    //   schema: null,
    //   view: PresentationCards,
    //   schemaExtender: PresentationCards.schemaExtender,
    // },
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
    // splashyCarousel: {
    //   title: 'Splashy Carousel',
    //   view: SplashyCarousel,
    //   schema: SplashyCarouselSchema,
    // },
    // videoCarousel: {
    //   title: 'Video Carousel',
    //   view: VideoCarousel,
    //   schema: VideoCardSchema,
    //   // schemaExtender: VideoCarousel.schemaExtender,
    // },
  };

  delete config.blocks.blocksConfig.imagecards.blockRenderers.carousel;
  delete config.blocks.blocksConfig.imagecards.blockRenderers.discreetCarousel;
  delete config.blocks.blocksConfig.imagecards.blockRenderers.round_tiled;

  return config;
}
