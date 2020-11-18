import { ITabsAttrs, Tabs } from './index';
import styles from './module.scss';
import m, { Vnode } from 'mithril';
import { TabBar } from '../tab-bar';

export function template(this: Tabs, vnode: Vnode<ITabsAttrs>) {
  return (
    <div class={styles.tabs}>
      <TabBar
        label={vnode.attrs.title}
        tabs={this.tabs}
        selectedIndex={this.selectedTab}
        onchange={(index) => {
          this.selectedTab = index;

          if (vnode.attrs.onchange) {
            vnode.attrs.onchange(index);
          }
        }}
        button={vnode.attrs.button}
        onbutton={vnode.attrs.onbutton}
      />
      <div class={styles.content}>{vnode.children[this.selectedTab]}</div>
    </div>
  );
}
