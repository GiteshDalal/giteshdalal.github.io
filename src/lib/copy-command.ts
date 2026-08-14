export type CopyCommandState = Readonly<{
  copyState: 'copied' | 'failed' | null;
  label: string;
  announcement: string;
}>;

type CopyCommandDependencies<TimerHandle> = {
  writeText: (text: string) => Promise<void>;
  setTimer: (callback: () => void, delay: number) => TimerHandle;
  clearTimer: (timer: TimerHandle) => void;
};

type CopyCommandController = {
  readonly state: CopyCommandState;
  copy: (command: string) => Promise<void>;
  subscribe: (listener: (state: CopyCommandState) => void) => () => void;
  destroy: () => void;
};

const initialState: CopyCommandState = {
  copyState: null,
  label: 'Copy install command',
  announcement: '',
};

const resetDelay = 2000;

export function createCopyCommandController<TimerHandle>(
  dependencies: CopyCommandDependencies<TimerHandle>,
): CopyCommandController {
  const listeners = new Set<(state: CopyCommandState) => void>();
  let state = initialState;
  let resetTimer: TimerHandle | undefined;
  let operationGeneration = 0;
  let disposed = false;

  function publish(nextState: CopyCommandState) {
    state = nextState;
    listeners.forEach((listener) => listener(state));
  }

  function clearPendingReset() {
    if (resetTimer === undefined) return;
    dependencies.clearTimer(resetTimer);
    resetTimer = undefined;
  }

  async function copy(command: string) {
    if (disposed) return;

    const operation = ++operationGeneration;
    clearPendingReset();
    publish({ ...state, announcement: '' });

    try {
      await dependencies.writeText(command);
      if (disposed || operation !== operationGeneration) return;
      publish({ copyState: 'copied', label: 'Copied', announcement: 'Copied' });
    } catch {
      if (disposed || operation !== operationGeneration) return;
      publish({
        copyState: 'failed',
        label: 'Copy failed',
        announcement: 'Copy failed. Select and copy the command manually.',
      });
    }

    resetTimer = dependencies.setTimer(() => {
      resetTimer = undefined;
      if (disposed || operation !== operationGeneration) return;
      publish(initialState);
    }, resetDelay);
  }

  return {
    get state() {
      return state;
    },
    copy,
    subscribe(listener) {
      listeners.add(listener);
      listener(state);
      return () => listeners.delete(listener);
    },
    destroy() {
      disposed = true;
      operationGeneration += 1;
      clearPendingReset();
      listeners.clear();
    },
  };
}

export function bindCopyCommand<TimerHandle>(
  elements: {
    button: HTMLButtonElement;
    command: HTMLElement;
    status: HTMLElement;
  },
  dependencies: CopyCommandDependencies<TimerHandle>,
): () => void {
  const { button, command, status } = elements;
  const controller = createCopyCommandController(dependencies);
  const unsubscribe = controller.subscribe((state) => {
    if (state.copyState === null) {
      delete button.dataset.copyState;
    } else {
      button.dataset.copyState = state.copyState;
    }
    button.setAttribute('aria-label', state.label);
    status.textContent = state.announcement;
  });
  const handleClick = () => {
    void controller.copy(command.textContent ?? '');
  };

  button.addEventListener('click', handleClick);

  return () => {
    button.removeEventListener('click', handleClick);
    unsubscribe();
    controller.destroy();
  };
}
