import React, { Component } from "react";
import Tooltip from '@mui/material/Tooltip';

const dataStyle = {
  fontSize: "16px",
  fontFace: "BlinkMacSystemFont",
  color: "black",
};

const dataStyle1 = {
  fontSize: "14px",
  fontFace: "BlinkMacSystemFont",
  color: "#1B2B41B0",
};

function ClaimID(props) {
  return (
    <div>
      <div style={dataStyle} className='my-cid-tooltip'>
        <Tooltip title="Patient Control Number">
          {props.data.cid}
        </Tooltip>
      </div>
      <div style={dataStyle1} className='my-date-tooltip'>
        <Tooltip anchorSelect='.my-date-tooltip' place='bottom' title="Submit date(transaction creation date)">
          {props.data.date}
        </Tooltip>
      </div>
    </div>
  );
}

export default ClaimID;
