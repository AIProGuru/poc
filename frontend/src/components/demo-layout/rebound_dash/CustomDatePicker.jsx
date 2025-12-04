import React, { useState } from "react";
import {
  Typography,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

export default function CustomDatePicker({ title, onSelect }) {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    onSelect(date);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="flex flex-col gap-y-2">
        <Typography variant="h6">{title}</Typography>
        <DatePicker
          label={""}
          value={selectedDate}
          onChange={handleDateChange}
        />
      </div>
    </LocalizationProvider>
  );
}
