import { map } from 'rxjs/operators';
import { redraw, Vnode } from 'mithril';
import { Unsubscribable } from 'rxjs';
import { template } from './template';
import Swal from 'sweetalert2';
import { TermsConditionPopup } from './edit_terms_popup';
import { ChannelStateComponent } from '../../../../utils/ChannelStateComponent';
import { IChannelAttrs } from '../../../../screens/main/channels-panel/channel';
import { ITermCondition, IConfig } from '../../../../../../../common/common';
import { api } from '../../../../services/api';
import { PopupManager } from '../../../../../../../common/popups/PopupManager';

export class TermsConditionsSettings extends ChannelStateComponent<IChannelAttrs> {
  private _subscriptions: Unsubscribable[];
  private _terms: ITermCondition[] = [];

  private _namespace: string;

  public oninit({ attrs }: Vnode<any>) {
    this._namespace = attrs.channel?.id ?? 'common';
    this._subscriptions = [
      api
        .config<IConfig>(this._namespace)
        .pipe(map((value: IConfig) => value.terms || []))
        .subscribe(this.termsHandler.bind(this)),
    ];
  }

  public onremove() {
    this._subscriptions.forEach((sub) => sub.unsubscribe());
  }

  public view() {
    return template.call(this);
  }

  public async addTerm() {
    const result: ITermCondition = await PopupManager.show(TermsConditionPopup);

    if (result) {
      this._terms.push(result);

      await api.setConfigField('terms', this.terms, this._namespace);
    }
  }

  public async editTerm(term: ITermCondition) {
    const result: ITermCondition = await PopupManager.show(TermsConditionPopup, {
      name: term.name,
      url: term.url,
    });

    if (result) {
      term.name = result.name;
      term.url = result.url;

      await api.setConfigField('terms', this.terms, 'common');
    }
  }

  public async deleteTerm(idx: number) {
    const { value } = await Swal.fire({
      title: `Are you sure you want to delete "${this.terms[idx].name}"?`,
      showCancelButton: true,
    });

    if (value) {
      this.terms.splice(idx, 1);
      await api.setConfigField('terms', this.terms, 'common');
      redraw();
    }
  }

  private termsHandler(terms: ITermCondition[]) {
    this._terms = terms;

    redraw();
  }

  public get terms(): ITermCondition[] {
    return this._terms;
  }
}
