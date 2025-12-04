import React from "react";

function Procedure(props) {
  return (
    <div className="flex gap-2">
      {props.data != undefined &&
        props.data.map((e, index) => (
          <span
            role='button'
            className='text-white bg-blue-500 px-2 py-1 rounded-lg'
            key={index}
            onClick={() => {
              props.setData(e);
              props.openDialog(true);
            }}
          >
            {e.transactionid===undefined?e.code:e.transactionid}
          </span>
        ))}
    </div>
  );
}

export default Procedure;
