// ** React Imports

// ** MUI Imports
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DatePicker from "react-datepicker";

// ** Icons
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CopyAllIcon from "@mui/icons-material/CopyAll";

// ** Library Imports
import DatePickerWrapper from "src/@core/styles/libs/react-datepicker";
import { DateType } from "src/types/forms/reactDatepickerTypes";
import CustomInput from "./PickersCustomInput";
// ** utlis Imports
import { isDateValid } from "src/@core/utils/isDateValid";

interface TableHeaderProps {
  value: string;
  date: DateType;
  isEditing: boolean;
  handleFilter: (val: string) => void;
  onSetDate: (date: DateType) => void;
  onAddRow: () => void;
  onOpenDuplicateTaskDialog: () => void;
}

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const { date, onSetDate, onAddRow, onOpenDuplicateTaskDialog } = props;
  // ** State
  return (
    <Box>
      <DatePickerWrapper>
        <Box sx={{ p: 5, pb: 5, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "right" }}>
          <div>
            <DatePicker
              showMonthDropdown
              selected={date}
              id='date-input'
              popperPlacement={"bottom-start"}
              onChange={(date: DateType) => {
                onSetDate(date);
              }}
              placeholderText='Click to select a date'
              customInput={<CustomInput label='Date' />}
              dateFormat='yyyy-MMM-dd'
            />
          </div>
          <div>
            {isDateValid(date) && (
              <Button sx={{ ml: 4 }} variant='outlined' startIcon={<AddCircleOutlineIcon />} onClick={onAddRow}>
                Add Row
              </Button>
            )}
            <Button sx={{ ml: 4 }} variant='contained' startIcon={<CopyAllIcon />} onClick={onOpenDuplicateTaskDialog}>
              Duplicate Tasks
            </Button>
          </div>
        </Box>
      </DatePickerWrapper>
    </Box>
  );
};

export default TableHeader;
