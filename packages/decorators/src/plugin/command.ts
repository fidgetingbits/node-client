import { NVIM_SYNC, NVIM_SPEC, NVIM_METHOD_NAME } from './properties';
import { CommandOptions } from './types';

// Example
// @Command('BufEnter', { range: '', nargs: '*' })
// @Command('MyCommand', { complete: 'customlist,MyCustomCompleteListFunc' })
// @Command('MyCommand', { complete: 'dir' })
export function Command(name: string, options?: CommandOptions) {
  return function (cls: any, methodName: string | null) {
    const sync = options && !!options.sync;
    const isMethod = typeof methodName === 'string';
    const f = isMethod ? cls[methodName] : cls;
    const opts: CommandOptions = {};

    // @ts-expect-error changing `option: keyof …` to `option: string` causes other errors.
    ['range', 'nargs', 'complete'].forEach((option: keyof CommandOptions) => {
      if (options && typeof options[option] !== 'undefined') {
        (opts[option] as any) = options[option];
      }
    });

    Object.defineProperty(f, NVIM_METHOD_NAME, { value: `command:${name}` });
    Object.defineProperty(f, NVIM_SYNC, { value: !!sync });
    Object.defineProperty(f, NVIM_SPEC, {
      value: {
        type: 'command',
        name,
        sync: !!sync,
        opts,
      },
    });

    if (isMethod) {
      // eslint-disable-next-line no-param-reassign
      cls[methodName] = f;
    }

    return cls;
  };
}
