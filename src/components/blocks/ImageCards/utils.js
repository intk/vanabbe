import config from '@plone/volto/registry';
import { flattenToAppURL } from '@plone/volto/helpers';

export const getPath = (url = '') =>
  (url || '').startsWith('http') ? new URL(url).pathname : url;

export const getScaleUrl = (url, size) =>
  (url || '').includes(config.settings.apiPath)
    ? `${flattenToAppURL(url.replace('/api', ''))}/@@images/image/${size}`
    : `${url.replace('/api', '')}/@@images/image/${size}`;

export const getSlideIndex = (sliderRef, slideIndex, settings) => {
  if (!sliderRef.current) return slideIndex + settings.slidesToShow;

  const curBreak = sliderRef.current.state?.breakpoint;

  if (curBreak) {
    const index = settings.responsive.findIndex(
      ({ breakpoint }) => breakpoint === curBreak,
    );
    let slidesToShow =
      index > -1
        ? settings.responsive[index]?.settings?.slidesToShow ||
          settings.slidesToShow
        : settings.slidesToShow;
    return slidesToShow + slideIndex;
  }

  return slideIndex + settings.slidesToShow;
};
