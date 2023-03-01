import React from 'react';
import loadable from '@loadable/component';

import './style.less';

const ReactYoutubePlayer = loadable(() => import('react-player/youtube'));
const ReactVimeoPlayer = loadable(() => import('react-player/vimeo'));

const VideoPlayer = (props) => {
  const { playing, videoUrl } = props;
  const vimeoURL = videoUrl?.match('vimeo');
  const youtubeURL = videoUrl?.match(/youtube|.be\//);

  const playerProps = {
    muted: true,
    playing: playing,
    controls: false,
    url: videoUrl,
    width: '100%',
    height: '100%',
  };

  return (
    <>
      {vimeoURL ? (
        <ReactVimeoPlayer {...playerProps} />
      ) : youtubeURL ? (
        <ReactYoutubePlayer {...playerProps} />
      ) : null}
    </>
  );
};

export default VideoPlayer;
