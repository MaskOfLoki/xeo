import { ClassComponent, Vnode } from 'mithril';
import { Unsubscribable, of } from 'rxjs';
import { api } from '../../services/api';
import { combineLatest } from 'rxjs';
import { DEFAULT_CONFIG } from '../../../../../common/common';

export interface IConfigControlAttrs {
  configField: any;
  secondaryConfigField?: string;
  defaultValueField: string;
  secondaryDefaultValueField?: string;
  namespace?: string;
  parentNamespace?: string;
}

export abstract class ConfigControl implements ClassComponent<IConfigControlAttrs> {
  protected _namespace = 'common';
  protected _parentNamespace: string;
  protected _configField: string;
  protected _secondaryConfigField: string;
  protected _configValue: any;
  protected _secondaryConfigValue: any;
  protected _defaultValue: any;
  protected _secondaryDefaultValue;
  private _subscription: Unsubscribable;
  private _secondarySubscription: Unsubscribable;

  protected valueChangeHandler(value: any) {
    this._configValue = value;
    api.setConfigField(this._configField, value, this._namespace);
  }

  public onremove() {
    this._subscription.unsubscribe();
    if (this._secondarySubscription) {
      this._secondarySubscription.unsubscribe();
    }
  }

  public view({ attrs }: Vnode<IConfigControlAttrs>) {
    if (attrs.namespace == null) {
      attrs.namespace = 'common';
      this._parentNamespace = null;
    } else if (attrs.namespace !== 'common') {
      this._parentNamespace = 'common';
    }

    if (this._configField !== attrs.configField || this._namespace !== attrs.namespace) {
      this._configField = attrs.configField;
      this._namespace = attrs.namespace;

      if (this._subscription) {
        this._subscription.unsubscribe();
      }

      // Get the local value
      const observables = [api.configField<any>(this._configField, this._namespace)];

      // If there is a parent namespace, attempt to grab the parent value
      // Otherwise fill its spot with null
      if (this._parentNamespace) {
        observables.push(api.configField<any>(this._configField, this._parentNamespace));
      } else {
        observables.push(of(null));
      }

      // Pack the defaults together
      if (attrs.defaultValueField) {
        const observes = [api.configField(attrs.defaultValueField, this._namespace)];

        // If there is a parent default value, attepmt to grab it
        // Otherwise fill its spot with null
        if (this._parentNamespace) {
          observes.push(api.configField(attrs.defaultValueField, this._parentNamespace));
        } else {
          observes.push(of(null));
        }
        observables.push(combineLatest(...observes));
      } else {
        observables.push(of([null, null]));
      }

      this._subscription = combineLatest(...observables).subscribe((values) => {
        this._configValue = values[0] ?? null;

        // Default value is local default, then parent value, then parent default
        this._defaultValue = values[2][0] ?? values[1] ?? values[2][1];

        // If none of those have a value, we attempt to get the value from the DEFAULT_CONFIG
        if (!this._defaultValue && attrs.defaultValueField) {
          this._defaultValue = getPathValue(DEFAULT_CONFIG, attrs.defaultValueField);
        }
      });
    }

    if (this._secondaryConfigField !== attrs.secondaryConfigField || this._namespace !== attrs.namespace) {
      this._secondaryConfigField = attrs.secondaryConfigField;
      this._namespace = attrs.namespace;

      if (this._secondarySubscription) {
        this._secondarySubscription.unsubscribe();
      }
      // Get the local value
      const observables = [api.configField<any>(this._secondaryConfigField, this._namespace)];

      // If there is a parent namespace, attempt to grab the parent value
      // Otherwise fill its spot with null
      if (this._parentNamespace) {
        observables.push(api.configField<any>(this._secondaryConfigField, this._parentNamespace));
      } else {
        observables.push(of(null));
      }

      // Pack the defaults together
      if (attrs.secondaryDefaultValueField) {
        const observes = [api.configField(attrs.secondaryDefaultValueField, this._namespace)];

        // If there is a parent default value, attepmt to grab it
        // Otherwise fill its spot with null
        if (this._parentNamespace) {
          observes.push(api.configField(attrs.secondaryDefaultValueField, this._parentNamespace));
        } else {
          observes.push(of(null));
        }
        observables.push(combineLatest(...observes));
      } else {
        observables.push(of([null, null]));
      }

      this._secondarySubscription = combineLatest(...observables).subscribe((values) => {
        this._secondaryConfigValue = values[0] ?? null;

        // Default value is local default, then parent value, then parent default
        this._secondaryDefaultValue = values[2][0] ?? values[1] ?? values[2][1];

        // If none of those have a value, we attempt to get the value from the DEFAULT_CONFIG
        if (!this._secondaryDefaultValue && attrs.secondaryDefaultValueField) {
          this._secondaryDefaultValue = getPathValue(DEFAULT_CONFIG, attrs.secondaryDefaultValueField);
        }
      });
    }

    return this.template(attrs);
  }

  protected get isDefault(): boolean {
    return !this._configValue;
  }

  protected get isSecondaryDefault(): boolean {
    return !this._secondaryConfigValue;
  }

  protected get value(): any {
    return !this.isDefault ? this._configValue : this._defaultValue;
  }

  protected get value2(): any {
    return !this.isSecondaryDefault ? this._secondaryConfigValue : this._secondaryDefaultValue;
  }

  abstract template(attrs?: IConfigControlAttrs): any;
}

function getPathValue(current, path) {
  path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  path = path.replace(/^\./, ''); // strip a leading dot
  const a = path.split('.');
  for (let i = 0, n = a.length; i < n; ++i) {
    const k = a[i];
    if (k in current) {
      current = current[k];
    } else {
      return;
    }
  }
  return current;
}
