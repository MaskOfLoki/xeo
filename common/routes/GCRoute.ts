import { ClassComponent } from 'mithril';

export interface IGCRouteAttrs {
  route: string;
  component: () => Promise<{ new (): ClassComponent }>;
}

export class GCRoute {}
