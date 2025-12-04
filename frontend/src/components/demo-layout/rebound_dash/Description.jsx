import React from "react";
import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";

const CustomWidthTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 300,
    fontSize: "14px",
  },
});

const Description = ({description, width}) => {
  return (
    <CustomWidthTooltip title={description} placement="top">
      <div className={`max-w-24 overflow-ellipsis text-nowrap overflow-hidden`}>
        {description}
      </div>
    </CustomWidthTooltip>
  );
};

export default Description;
