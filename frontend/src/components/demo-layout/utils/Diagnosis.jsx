import React from "react";

function Diagnosis(props) {
  return (
    <div>
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
            {e.diagnosisid===undefined?e.code:e.diagnosisid}
          </span>
        ))}
    </div>
  );
}

export default Diagnosis;
