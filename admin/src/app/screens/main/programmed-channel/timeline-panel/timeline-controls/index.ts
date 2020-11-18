import { ClassComponent, Vnode } from 'mithril';
import { template } from './template';

export interface ITimelineControlsAttrs {
  onstart: VoidFunction;
  onend: VoidFunction;
  onnext: VoidFunction;
  onprev: VoidFunction;
  ontoggleplay: (value: boolean) => void;
  playing: boolean;
}

export class TimelineControls implements ClassComponent<ITimelineControlsAttrs> {
  public view({ attrs }: Vnode<ITimelineControlsAttrs>) {
    return template.call(this, attrs);
  }
}
