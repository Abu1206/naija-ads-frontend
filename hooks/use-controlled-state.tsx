import * as React from "react";

interface CommonControlledStateProps<T> {
  value?: T;
  defaultValue?: T;
}

export function useControlledState<T, Rest extends any[] = []>(
  props: CommonControlledStateProps<T> & {
    onChange?: (value: T, ...args: Rest) => void;
  },
): readonly [T, (next: T, ...args: Rest) => void] {
  const { value, defaultValue, onChange } = props;

  const [state, setInternalState] = React.useState<T>(
    value !== undefined ? value : (defaultValue as T),
  );

  // Controlled sync without a setState-in-effect (which cascades renders):
  // adjust state during render when the controlled value changes — the
  // derived-state pattern React sanctions.
  const [prevControlled, setPrevControlled] = React.useState(value);
  if (value !== prevControlled) {
    setPrevControlled(value);
    if (value !== undefined) setInternalState(value);
  }

  const setState = React.useCallback(
    (next: T, ...args: Rest) => {
      setInternalState(next);
      onChange?.(next, ...args);
    },
    [onChange],
  );

  return [state, setState] as const;
}
