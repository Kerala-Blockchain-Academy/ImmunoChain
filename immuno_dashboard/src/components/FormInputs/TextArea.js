import React from "react";
import cx from "classnames";

const TextInput = ({
  input,
  rows,
  cols,
  meta: { touched, error, warning },
  inputClassName,
  placeholder,
  helpText,
  disabled
}) => (
  <div>
    <textarea
      {...input}
      rows={rows}
      cols={cols}
      className={cx(inputClassName, "form-control", {
        error: !!error
      })}
      placeholder={placeholder}
      disabled={disabled}
    />

    {touched && error && (
      <label className="error" htmlFor={input.name}>
        {error}
      </label>
    )}

    {helpText && <span className="help-block">{helpText}</span>}
  </div>
);

export default TextInput;
