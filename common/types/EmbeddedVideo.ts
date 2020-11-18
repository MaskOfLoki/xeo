export enum EmbeddedVideo {
  YouTube = 'youtube',
  Vimeo = 'vimeo',
  Twitch = 'twitch',
  RTMP = 'RTMP',
}

export const STREAM_PLATFORMS: EmbeddedVideo[] = Object.values(EmbeddedVideo).filter(
  (item) => item !== EmbeddedVideo.RTMP,
);
export const STREAM_PLATFORMS_NAMES: string = STREAM_PLATFORMS.map(
  (item) => item.charAt(0).toUpperCase() + item.substr(1),
).join(', ');
