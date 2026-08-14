import { describe, expect, test } from 'bun:test';
import { bindCopyCommand, createCopyCommandController } from './copy-command';

type PendingTimer = {
  callback: () => void;
  delay: number;
  active: boolean;
};

type Deferred = {
  promise: Promise<void>;
  resolve: () => void;
  reject: (error: Error) => void;
};

class FakeButton extends EventTarget {
  dataset: Record<string, string | undefined> = {};
  attributes = new Map<string, string>();

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }
}

function createDeferred(): Deferred {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

function createDeferredClipboard() {
  const requests: Array<{ text: string; deferred: Deferred }> = [];

  return {
    requests,
    writeText(text: string) {
      const deferred = createDeferred();
      requests.push({ text, deferred });
      return deferred.promise;
    },
  };
}

function createTimerHarness() {
  const scheduled: PendingTimer[] = [];
  const cleared: PendingTimer[] = [];

  return {
    cleared,
    scheduled,
    activeTimers() {
      return scheduled.filter((timer) => timer.active);
    },
    clearTimer(timer: PendingTimer) {
      timer.active = false;
      cleared.push(timer);
    },
    setTimer(callback: () => void, delay: number) {
      const timer = { callback, delay, active: true };
      scheduled.push(timer);
      return timer;
    },
    run(timer: PendingTimer) {
      timer.active = false;
      timer.callback();
    },
  };
}

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
}

function createBindingElements(commandText: string) {
  const button = new FakeButton();
  button.setAttribute('aria-label', 'Copy install command');
  const command = { textContent: commandText };
  const status = { textContent: '' };

  return {
    button,
    command,
    status,
    elements: {
      button: button as unknown as HTMLButtonElement,
      command: command as HTMLElement,
      status: status as HTMLElement,
    },
  };
}

describe('copy command controller', () => {
  test('copies the exact command, exposes success, and resets after two seconds', async () => {
    const clipboardWrites: string[] = [];
    const timers = createTimerHarness();
    const controller = createCopyCommandController({
      ...timers,
      async writeText(text) {
        clipboardWrites.push(text);
      },
    });

    await controller.copy(
      'curl -fsSL https://raw.githubusercontent.com/GiteshDalal/fdf/main/install.sh | bash',
    );

    expect(clipboardWrites).toEqual([
      'curl -fsSL https://raw.githubusercontent.com/GiteshDalal/fdf/main/install.sh | bash',
    ]);
    expect(controller.state).toEqual({
      copyState: 'copied',
      label: 'Copied',
      announcement: 'Copied',
    });
    expect(timers.scheduled).toHaveLength(1);
    expect(timers.scheduled[0].delay).toBe(2000);

    timers.run(timers.scheduled[0]);

    expect(controller.state).toEqual({
      copyState: null,
      label: 'Copy install command',
      announcement: '',
    });
  });

  test('exposes an accessible failure state when the clipboard write rejects', async () => {
    const timers = createTimerHarness();
    const controller = createCopyCommandController({
      ...timers,
      async writeText() {
        throw new Error('Clipboard unavailable');
      },
    });

    await controller.copy('fdf install');

    expect(controller.state).toEqual({
      copyState: 'failed',
      label: 'Copy failed',
      announcement: 'Copy failed. Select and copy the command manually.',
    });
    expect(timers.scheduled[0].delay).toBe(2000);
  });

  test('replaces pending resets and clears the active timer on cleanup', async () => {
    const timers = createTimerHarness();
    const controller = createCopyCommandController({
      ...timers,
      async writeText() {},
    });

    await controller.copy('first command');
    const firstReset = timers.scheduled[0];

    await controller.copy('second command');
    const secondReset = timers.scheduled[1];

    expect(timers.cleared).toEqual([firstReset]);

    controller.destroy();

    expect(timers.cleared).toEqual([firstReset, secondReset]);
  });

  test('ignores an older rejection after the latest copy succeeds', async () => {
    const clipboard = createDeferredClipboard();
    const timers = createTimerHarness();
    const controller = createCopyCommandController({ ...timers, writeText: clipboard.writeText });

    const olderCopy = controller.copy('older command');
    const latestCopy = controller.copy('latest command');

    clipboard.requests[1].deferred.resolve();
    await latestCopy;
    clipboard.requests[0].deferred.reject(new Error('Older write failed'));
    await olderCopy;

    expect(controller.state).toEqual({
      copyState: 'copied',
      label: 'Copied',
      announcement: 'Copied',
    });
    expect(timers.scheduled).toHaveLength(1);
    expect(timers.activeTimers()).toHaveLength(1);
  });

  test('ignores an older success after the latest copy fails', async () => {
    const clipboard = createDeferredClipboard();
    const timers = createTimerHarness();
    const controller = createCopyCommandController({ ...timers, writeText: clipboard.writeText });

    const olderCopy = controller.copy('older command');
    const latestCopy = controller.copy('latest command');

    clipboard.requests[1].deferred.reject(new Error('Latest write failed'));
    await latestCopy;
    clipboard.requests[0].deferred.resolve();
    await olderCopy;

    expect(controller.state).toEqual({
      copyState: 'failed',
      label: 'Copy failed',
      announcement: 'Copy failed. Select and copy the command manually.',
    });
    expect(timers.scheduled).toHaveLength(1);
    expect(timers.activeTimers()).toHaveLength(1);
  });

  test('does not publish or schedule a reset when destroyed during a clipboard write', async () => {
    const clipboard = createDeferredClipboard();
    const timers = createTimerHarness();
    const controller = createCopyCommandController({ ...timers, writeText: clipboard.writeText });
    const states: unknown[] = [];
    controller.subscribe((state) => states.push({ ...state }));

    const copy = controller.copy('pending command');
    controller.destroy();
    const stateCountAtDestroy = states.length;

    clipboard.requests[0].deferred.resolve();
    await copy;

    expect(controller.state).toEqual({
      copyState: null,
      label: 'Copy install command',
      announcement: '',
    });
    expect(states).toHaveLength(stateCountAtDestroy);
    expect(timers.scheduled).toHaveLength(0);
  });
});

describe('copy command binding', () => {
  test('copies on click and propagates success and reset state to the DOM', async () => {
    const clipboardWrites: string[] = [];
    const timers = createTimerHarness();
    const binding = createBindingElements('fdf install --global');
    const cleanup = bindCopyCommand(binding.elements, {
      ...timers,
      async writeText(text) {
        clipboardWrites.push(text);
      },
    });

    binding.button.dispatchEvent(new Event('click'));
    await flushMicrotasks();

    expect(clipboardWrites).toEqual(['fdf install --global']);
    expect(binding.button.dataset.copyState).toBe('copied');
    expect(binding.button.getAttribute('aria-label')).toBe('Copied');
    expect(binding.status.textContent).toBe('Copied');

    timers.run(timers.scheduled[0]);

    expect(binding.button.dataset.copyState).toBeUndefined();
    expect(binding.button.getAttribute('aria-label')).toBe('Copy install command');
    expect(binding.status.textContent).toBe('');

    cleanup();
    binding.button.dispatchEvent(new Event('click'));
    await flushMicrotasks();
    expect(clipboardWrites).toEqual(['fdf install --global']);
  });

  test('propagates clipboard failure state to the DOM', async () => {
    const timers = createTimerHarness();
    const binding = createBindingElements('fdf install');
    bindCopyCommand(binding.elements, {
      ...timers,
      async writeText() {
        throw new Error('Clipboard unavailable');
      },
    });

    binding.button.dispatchEvent(new Event('click'));
    await flushMicrotasks();

    expect(binding.button.dataset.copyState).toBe('failed');
    expect(binding.button.getAttribute('aria-label')).toBe('Copy failed');
    expect(binding.status.textContent).toBe(
      'Copy failed. Select and copy the command manually.',
    );
  });

  test('cleanup removes the listener and destroys a pending copy', async () => {
    const clipboard = createDeferredClipboard();
    const timers = createTimerHarness();
    const binding = createBindingElements('pending command');
    const cleanup = bindCopyCommand(binding.elements, {
      ...timers,
      writeText: clipboard.writeText,
    });

    binding.button.dispatchEvent(new Event('click'));
    cleanup();
    clipboard.requests[0].deferred.resolve();
    await flushMicrotasks();

    expect(binding.button.dataset.copyState).toBeUndefined();
    expect(binding.button.getAttribute('aria-label')).toBe('Copy install command');
    expect(binding.status.textContent).toBe('');
    expect(timers.scheduled).toHaveLength(0);

    binding.button.dispatchEvent(new Event('click'));
    expect(clipboard.requests).toHaveLength(1);
  });
});
