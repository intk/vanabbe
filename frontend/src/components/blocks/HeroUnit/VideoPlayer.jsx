import React from 'react';

import './style.less';

const VideoPlayer = (props) => {
  const { videoUrl } = props;

  const getEmbedUrl = (url) => {
    let videoId;

    if (url.match('vimeo')) {
      videoId = url.match(/^.*\.com\/(.*)/)[1];
      return [
        `https://player.vimeo.com/video/${videoId}`,
        `?dnt=1`,
        `&loop=1`,
        `&background=1`,
        `&autopause=1`,
        `&muted=1`,
      ].join('');
    }
    videoId = url.match(/.be\//)
      ? url.match(/^.*\.be\/(.*)/)[1]
      : url.match(/^.*\?v=(.*)$/)[1];

    return `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&mute=1`;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <iframe
      width="100%"
      height="100%"
      src={embedUrl}
      frameborder="0"
      allow="autoplay; fullscreen"
      allowfullscreen
      title="Embedded video"
    />
  );
};

export default VideoPlayer;
