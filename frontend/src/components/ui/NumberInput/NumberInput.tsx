import scss from "./numberInput.module.scss";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import type { ChangeEvent, InputHTMLAttributes } from "react";

interface INumberInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "defaultValue" | "onChange" | "type" | "value"
  > {
  value?: number | string;
  defaultValue?: number | string;
  increment?: number;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string) => void;
}

const getNumberValue = (value: number | string | undefined) => {
  if (value === undefined || value === "") return undefined;

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
};

const getDecimalPlaces = (value: number) => {
  const decimalPart = value.toString().split(".")[1];
  return decimalPart?.length ?? 0;
};

const NumberInput = forwardRef<HTMLInputElement, INumberInputProps>(
  (
    {
      className,
      value,
      defaultValue,
      increment = 1,
      min,
      max,
      disabled = false,
      onChange,
      onValueChange,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uncontrolledValue, setUncontrolledValue] = useState(() =>
      defaultValue === undefined ? "" : String(defaultValue),
    );
    const isControlled = value !== undefined;
    const displayedValue = isControlled ? String(value) : uncontrolledValue;
    const minValue = getNumberValue(min);
    const maxValue = getNumberValue(max);
    const numericValue = getNumberValue(displayedValue);
    const isDecrementDisabled =
      disabled ||
      (numericValue !== undefined &&
        minValue !== undefined &&
        numericValue <= minValue);
    const isIncrementDisabled =
      disabled ||
      (numericValue !== undefined &&
        maxValue !== undefined &&
        numericValue >= maxValue);
    const classNames = [scss.root, className].filter(Boolean).join(" ");

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const handleValueUpdate = (nextValue: string) => {
      if (!isControlled) setUncontrolledValue(nextValue);
      onValueChange?.(nextValue);
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      handleValueUpdate(event.target.value);
      onChange?.(event);
    };

    const handleStep = (direction: 1 | -1) => {
      const baseValue = numericValue ?? minValue ?? 0;
      const unboundedValue = baseValue + increment * direction;
      const nextNumber = Math.min(
        maxValue ?? Number.POSITIVE_INFINITY,
        Math.max(minValue ?? Number.NEGATIVE_INFINITY, unboundedValue),
      );
      const precision = Math.max(getDecimalPlaces(increment), 6);
      const nextValue = String(Number(nextNumber.toFixed(precision)));
      const input = inputRef.current;

      if (input) input.value = nextValue;
      handleValueUpdate(nextValue);

      if (input && onChange) {
        onChange({ target: input, currentTarget: input } as ChangeEvent<HTMLInputElement>);
      }

      input?.focus();
    };

    return (
      <div className={classNames} data-disabled={disabled || undefined}>
        <input
          {...props}
          ref={inputRef}
          className={scss.input}
          type="number"
          min={min}
          max={max}
          disabled={disabled}
          value={displayedValue}
          onChange={handleChange}
        />
        <div className={scss.controls} aria-label="Изменение значения">
          <button
            className={scss.control}
            type="button"
            disabled={isIncrementDisabled}
            aria-label="Увеличить значение"
            onClick={() => handleStep(1)}
          >
            <span aria-hidden="true">+</span>
          </button>
          <button
            className={scss.control}
            type="button"
            disabled={isDecrementDisabled}
            aria-label="Уменьшить значение"
            onClick={() => handleStep(-1)}
          >
            <span aria-hidden="true">−</span>
          </button>
        </div>
      </div>
    );
  },
);

NumberInput.displayName = "NumberInput";

export default NumberInput;
