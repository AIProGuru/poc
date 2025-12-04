import React from "react";

function Service(props) {
  return (
    <div className="flex gap-2">
      {props.data != undefined &&
        props.data.map((e, index) => (
          <span
            role='button'
            key={index}
            className='text-white bg-blue-500 px-2 py-1 rounded-lg'
            onClick={() => {
              props.setData(e);
              props.openDialog(true);
            }}
          >
            {e.code}
          </span>
        ))}
    </div>
  );
}

export default Service;
