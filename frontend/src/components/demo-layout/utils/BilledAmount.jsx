import React, { Component } from "react";


const dataStyle = {
  fontSize: "16px",
  fontFace: "BlinkMacSystemFont",
  fontWeight: "bold",
  color: "black",
};

function BilledAmount(props) {
  let paid_minValue = Math.min.apply(
    null,
    props.data.map((e) => e.paid_amount)
  );
  let paid_maxValue = Math.max.apply(
    null,
    props.data.map((e) => e.paid_amount)
  );
  let charged_minValue = Math.min.apply(
    null,
    props.data.map((e) => e.charged_amount)
  );
  let charged_maxValue = Math.max.apply(
    null,
    props.data.map((e) => e.charged_amount)
  );
  return (
    <div>
      {props.type === false && (
        <div>
          <div style={dataStyle}>
            ${props.data.reduce((sum, { paid_amount }) => sum + paid_amount, 0)}
          </div>
          <div>
            ${paid_minValue}-${paid_maxValue}
          </div>
        </div>
      )}
      {props.type === true && (
        <div>
          <div style={dataStyle}>
            $
            {props.data.reduce(
              (sum, { charged_amount }) => sum + charged_amount,
              0
            )}
          </div>
          <div>
            ${charged_minValue}-${charged_maxValue}
          </div>
        </div>
      )}
    </div>
  );
}

export default BilledAmount;
