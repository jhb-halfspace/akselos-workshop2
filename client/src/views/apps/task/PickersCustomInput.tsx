// ** React Imports
import { forwardRef } from "react";

// ** MUI Imports
import TextField from "@mui/material/TextField";

interface PickerProps {
  label?: string;
  readOnly?: boolean;
  className?: string;
}

const PickersComponent = forwardRef(({ className, ...props }: PickerProps, ref) => {
  // ** Props
  const { label, readOnly } = props;

  return (
    <TextField
      inputRef={ref}
      {...props}
      label={label || ""}
      {...(readOnly && { inputProps: { readOnly: true } })}
      className={className}
    />
  );
});

export default PickersComponent;
