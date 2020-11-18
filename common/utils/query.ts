import { MobilePreviewMode, MainboardPreviewMode } from '../common';

const queryParams = new URLSearchParams(window.location.search);

export function getQueryParam(name: string) {
  return queryParams.get(name);
}

export function isPreview(): boolean {
  return queryParams.has('previewMode') || queryParams.has('preview');
}

export function forcedDevice(): string {
  return queryParams.has('forcedDevice') ? queryParams.get('forcedDevice') : '';
}

export function getPreviewMode(): MobilePreviewMode {
  return parseInt(queryParams.get('previewMode'));
}

export function getPreviewMainboardMode(): MainboardPreviewMode {
  return parseInt(queryParams.get('previewMode'));
}

export function getChannel(): string {
  return queryParams.get('channel') ?? '';
}

export function isReplay(): boolean {
  return queryParams.has('isReplay');
}
