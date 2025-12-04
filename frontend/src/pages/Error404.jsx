import React from "react";

const Error404 = ({message}) => {
  return (
    <div className="flex justify-center">
        <p className="font-poppins text-[72px] text-red-600 font-semibo pt-12">{message}</p>
    </div>
  )
}

export default Error404;