import { Subject } from 'rxjs';
import { IProject } from '../../../../common/common';

class HookService {
  private readonly _projectLoadSubject: Subject<IProject> = new Subject();

  public onProjectLoad(project: IProject) {
    this._projectLoadSubject.next(project);
  }

  public get projectLoad(): Subject<IProject> {
    return this._projectLoadSubject;
  }
}

export const hookService = new HookService();
