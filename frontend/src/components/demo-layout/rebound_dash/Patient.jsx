import React, { Component } from "react";
const dataStyle = {
  fontSize: "16px",
  fontFace: "BlinkMacSystemFont",
  color: "#3F6594",
  borderRadius: "5px",
  backgroundColor: "#F4F5F7",
  border: "1px solid white",
  padding: "2px 5px",
  margin: "3px",
};

function Patient(props) {
  return (
    <div>
      <div
        style={dataStyle}
        role='button'
        className='my-patient-tooltip badge'
        onClick={() => {
          props.setData();
          props.openDialog();
        }}
      >
        {props.data.firstname}&nbsp;{props.data.middlename}&nbsp;{props.data.lastname}
      </div>
      <div>{props.data.address}</div>
    </div>
  );
}

export default Patient;
