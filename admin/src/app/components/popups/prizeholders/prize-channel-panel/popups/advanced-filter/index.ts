import { redraw, Vnode } from 'mithril';
import { template } from './template';
import './module.scss';
import { PopupComponent, IPopupAttrs } from '../../../../../../../../../common/popups/PopupManager';
import { ILeadersFilter } from '../../../../../../utils';
import { IChannel, PointsType } from '../../../../../../../../../common/common';
import Swal from 'sweetalert2';
import basicContext from 'basiccontext';
import { saveAs } from 'file-saver';
import { fileService } from '../../../../../../services/FileService';
import { isValidFilter } from '../../target-filter/services';

export interface IAdvancedFilterPopup extends IPopupAttrs {
  filters: ILeadersFilter[];
  channel: IChannel;
}

export class AdvancedFilterPopup extends PopupComponent<IPopupAttrs> {
  public filters: ILeadersFilter[] = [];

  public oninit(vnode: Vnode<IAdvancedFilterPopup>) {
    super.oninit(vnode);
    this.filters = vnode.attrs.filters;
  }

  public menuHandler(e: Event) {
    basicContext.show(
      [
        {
          title: 'IMPORT',
          fn: this.importHandler.bind(this),
        },
        {
          title: 'EXPORT',
          fn: this.exportHandler.bind(this),
        },
      ],
      e,
    );
  }

  public async importHandler() {
    const file: File = await fileService.select('.json');

    if (!file) {
      return;
    }

    const content: string = await fileService.readFileAsText(file);

    try {
      const data: ILeadersFilter[] = JSON.parse(content);
      if (!Array.isArray(data)) {
        throw new Error('not an array');
      }

      this.filters = data;
      redraw();
    } catch (e) {
      console.warn('AdvancedFilterPopup.importHandler error', e);
      Swal.fire({
        icon: 'error',
        title: 'Invalid filters file',
      });
    }
  }

  public exportHandler() {
    if (!this.validate()) {
      return;
    }

    const blob = new Blob([JSON.stringify(this.filters)], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `advanced-filters.json`);
  }

  public buttonDeleteHandler(index: number) {
    this.filters.splice(index, 1);
  }

  public buttonAddHandler() {
    this.filters.push({
      type: PointsType.CARD,
    });
  }

  public buttonConfirmHandler() {
    if (!this.validate()) {
      return;
    }

    this.close(this.filters);
  }

  private validate(): boolean {
    if (this.filters.length === 0) {
      Swal.fire('Please add at least one filter');
      return false;
    }

    if (this.filters.some((filter) => !isValidFilter(filter))) {
      Swal.fire('Please fill in all filters');
      return false;
    }

    return true;
  }

  public view({ attrs }: Vnode<IAdvancedFilterPopup>) {
    return template.call(this, attrs);
  }
}
