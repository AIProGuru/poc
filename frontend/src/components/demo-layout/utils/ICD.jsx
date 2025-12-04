import React from "react";

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

function ICD(props) {
  return (
    <div>
      {props.data != undefined &&
        props.data.map((e, index) => (
          <div
            role='button'
            key={index}
            style={dataStyle}
            className='my-title-tooltip badge'
            onClick={() => {
              props.setData(e);
              props.openDialog();
            }}
          >
            {e.code}
          </div>
        ))}
    </div>
  );
}

export default ICD;
