import React, { useEffect, useState } from "react";
import axios from "axios";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

export default function DataTableTagsFilter(props) {
  const allTags = useSelector((state) => state.tags.allTags);

  const [loading, setLoading] = useState(false);

  return (
    <Autocomplete
      multiple
      id="checkboxes-tags-demo"
      options={allTags}
      value={props.selectedTags}
      onChange={(event, value) => {
        props.setSelectedTags(value);
      }}
      disableCloseOnSelect
      getOptionLabel={(option) => option}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
            checkedIcon={<CheckBoxIcon fontSize="small" />}
            style={{ marginRight: 8 }}
            checked={selected}
          />
          {option}
        </li>
      )}
      renderInput={(params) => (
        <TextField {...params} label="Tags" placeholder="Select Tags" />
      )}
      loading={loading}
    />
  );
}
