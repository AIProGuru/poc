import React, { Component } from "react";

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

function BillingProvider(props) {
  return (
    <div>
      <div style={dataStyle}>{props.data.bus_name}</div>
      <div style={dataStyle1}>{props.data.addr}</div>
    </div>
  );
}

export default BillingProvider;
