import React, { Component } from "react";

function Patient(props) {
  return (
    <div>
      <span
        role='button'
        className='text-white bg-blue-500 px-2 py-1 rounded-lg'
        onClick={() => {
          props.setData({
            bus_name: props.data.addr,
            npi: props.data.memberid,
          });
          props.openDialog();
        }}
      >
        {props.data.memberid}
      </span>
      <span>{props.data.addr}</span>
    </div>
  );
}

export default Patient;
