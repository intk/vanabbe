import imageSVG from '@plone/volto/icons/image.svg';
import ImageBlockView from './ImageBlockView';
import ImageBlockEdit from './ImageBlockEdit';

export default (config) => {
  config.blocks.blocksConfig.image = {
    id: 'image',
    title: 'Image',
    icon: imageSVG,
    group: 'media',
    view: ImageBlockView,
    edit: ImageBlockEdit,
    restricted: false,
    mostUsed: false,
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
  };
  return config;
};
