import React, { Component } from "react";
import Tooltip from '@mui/material/Tooltip';

const dateStyle = {
  fontSize: "14px",
  fontFace: "",
  color: "#1B2B41B0",
};

function Flags(props) {
  return (
    <div>
      <span className="my-cid-tooltip">{props.data.d1}</span>
      <br />
      <span style={dateStyle} className="my-date-tooltip">
        {props.data.d2}
      </span>
    </div>
  );
}

export default Flags;
