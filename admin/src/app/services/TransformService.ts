import semver from 'semver';
import { IChannel, IProject } from '../../../../common/common';
import { api } from './api';
import { hookService } from './HookService';
import { isEmptyString, cloneObject } from '@gamechangerinteractive/xc-backend/utils';

type TransformFunction = (IChannel) => boolean;

class TransformService {
  private readonly _versions = ['0.9.0', '0.9.2', '0.9.4'].map((version) => semver.parse(version));

  private readonly _transforms: TransformFunction[][] = [
    [require('../transforms/0.9.0-update_image_cards').updateImageCards],
    [require('../transforms/0.9.2-add_default_cardset').addDefaultCardset],
    [require('../transforms/0.9.4-update_deleted').updateDeleted],
  ];

  public get latestVersion(): string {
    return this._versions[this._versions.length - 1].raw;
  }

  public onProjectLoad(project: IProject) {
    let didUpdate = false;
    project.channels.forEach((channel, index) => {
      const result = this.onChannel(channel);

      // Make sure that every channel has a version, and that after an update, it is up to date
      // Do not update the version number if null is passed back because
      // null represents an error occurring
      if (result.updated || (result.updated === false && isEmptyString(result.chan.version))) {
        result.chan.version = this.latestVersion;
        result.updated = true;
      }

      if (result.updated) {
        project.channels[index] = result.chan;
        didUpdate = true;
      }
    });
    if (didUpdate) {
      api.savePreset(project);
    }
  }

  public validate(): boolean {
    let valid = true;
    const invalidVersions = this._versions.map((version, idx) => [version, idx]).filter((value) => value[0] === null);

    if (invalidVersions.length) {
      console.error(
        `There are invalid version numbers in UpdateService::_versions. Invalid versions at the following indexes: ${invalidVersions.map(
          (value) => value[1],
        )}`,
      );
      valid = false;
    }

    if (this._versions.length !== this._transforms.length) {
      console.error(
        `Then number of versions does not match the count of version update arrays. Versions: ${this._versions.length}, Updates: ${this._transforms.length}`,
      );
      valid = false;
    }

    return valid;
  }

  private onChannel(channel: IChannel) {
    const version = semver.parse(channel.version);
    let startIdx = 0;
    if (version) {
      startIdx = this._versions.findIndex((ver) => ver.compare(version) == 1);
    } else if (channel.version) {
      // An invalid channel version exists. Notify and return false
      console.error(
        `Cannot parse invalid channel version of '${channel.version}' for channel '${channel.name}' (${channel.id})`,
      );
      return { updated: false, chan: channel };
    }

    if (startIdx !== -1) {
      try {
        const chan = cloneObject(channel);
        const didUpdate = this._transforms
          .slice(startIdx)
          .reduce((previous, updates) => previous.concat(updates), [])
          .reduce((last, func) => {
            return func(chan) || last;
          }, false);

        return { updated: didUpdate, chan };
      } catch (e) {
        console.error(e);
        return { updated: false, chan: channel };
      }
    } else {
      return { updated: false, chan: channel };
    }
  }
}

export const transformService = new TransformService();

// This is called here to allow us to verify that everything is correct within the TransformService
// This is not inserted into the class to prevent it from being called elsewhere
if (transformService.validate()) {
  hookService.projectLoad.subscribe(transformService.onProjectLoad.bind(transformService));
}
