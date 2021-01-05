import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  ICommandPalette, MainAreaWidget, WidgetTracker
} from '@jupyterlab/apputils';

import {
  ILauncher,
} from '@jupyterlab/launcher';

import { LabIcon } from '@jupyterlab/ui-components';

import { WWTLabViewer } from './viewer';
import WWT_ICON from '../style/icons/wwt.svg';

const CATEGORY: string = 'AAS WorldWide Telescope';
const OPEN_COMMAND: string = 'wwtelescope:open';

const wwtIcon = new LabIcon({
  name: '@wwtelescope/jupyterlab:research:wwt',
  svgstr: WWT_ICON,
});

class WWTLabExtensionState {
  constructor(app: JupyterFrontEnd, restorer: ILayoutRestorer) {
    this.app = app;

    // Set up to track and restore widget state. Of course we're not correctly
    // persisting the internal engine state.
    this.tracker = new WidgetTracker<MainAreaWidget<WWTLabViewer>>({
      namespace: '@wwtelescope/jupyterlab:research'
    });
    restorer.restore(this.tracker, {
      command: OPEN_COMMAND,
      name: () => '@wwtelescope/jupyterlab:research'
    });
  }

  private app: JupyterFrontEnd;
  private tracker: WidgetTracker;
  private widget: MainAreaWidget<WWTLabViewer> | null = null;

  onOpenNewViewer() {
    if (this.widget == null) {
      const content = new WWTLabViewer('@wwtelescope/jupyterlab:research');

      this.widget = new MainAreaWidget({ content });
      this.widget.id = `@wwtelescope/jupyterlab:research:wwt`;
      this.widget.title.label = `AAS WorldWide Telescope`;
      this.widget.title.icon = wwtIcon;
      this.widget.title.closable = true;
      this.widget.disposed.connect(() => {
        this.widget = null;
      });
    }

    if (!this.tracker.has(this.widget)) {
      this.tracker.add(this.widget);
    }

    if (!this.widget.isAttached) {
      this.app.shell.add(this.widget, 'main');
    }

    this.app.shell.activateById(this.widget.id);
  }
}

function activate(app: JupyterFrontEnd, palette: ICommandPalette, launcher: ILauncher, restorer: ILayoutRestorer) {
  let state = new WWTLabExtensionState(app, restorer);

  app.commands.addCommand(OPEN_COMMAND, {
    label: args => (args['isPalette'] ? 'Open AAS WorldWide Telescope Viewer' : 'AAS WorldWide Telescope'),
    caption: 'Open the AAS WorldWide Telescope viewer',
    icon: wwtIcon,
    iconClass: args => (args['isPalette'] ? '' : 'jp-TerminalIcon'),
    execute: state.onOpenNewViewer.bind(state),
  });

  palette.addItem({command: OPEN_COMMAND, category: CATEGORY});

  launcher.add({
    command: OPEN_COMMAND,
    category: 'Other',
    rank: 1,
  })
}

/**
 * Initialization data for the extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: '@wwtelescope/jupyterlab:research',
  autoStart: true,
  requires: [ICommandPalette, ILauncher, ILayoutRestorer],
  activate: activate,
};

export default extension;
