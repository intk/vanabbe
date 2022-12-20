import ImageCarousel from './Carousel';
import LogoCardsCarousel, { LogoCardsSchema } from './LogoCarousel';
import PresentationCards from './PresentationCards';
import TestimonialCards, { TestimonialCardsSchema } from './TestimonialCards';
import SplashyCarousel, { SplashyCarouselSchema } from './SplashyCarousel';
// import VideoCarousel, { VideoCardSchema } from './VideoCarousel';

export default function install(config) {
  config.blocks.blocksConfig.imagecards.defaultRendererName = 'logoCards';
  config.blocks.blocksConfig.imagecards.blockRenderers = {
    ...config.blocks.blocksConfig.imagecards.blockRenderers,
    logoCards: {
      title: 'Logo Cards',
      schema: LogoCardsSchema,
      view: LogoCardsCarousel,
      schemaExtender: LogoCardsCarousel.schemaExtender,
    },
    presentationCards: {
      title: 'Presentation Cards',
      schema: null,
      view: PresentationCards,
      schemaExtender: PresentationCards.schemaExtender,
    },
    testimonialCards: {
      title: 'Testimonial Cards',
      view: TestimonialCards,
      schema: TestimonialCardsSchema,
      schemaExtender: TestimonialCards.schemaExtender,
    },
    imageCarousel: {
      title: 'Image Carousel',
      schema: null,
      view: ImageCarousel,
      schemaExtender: ImageCarousel.schemaExtender,
    },
    splashyCarousel: {
      title: 'Splashy Carousel',
      view: SplashyCarousel,
      schema: SplashyCarouselSchema,
    },
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
