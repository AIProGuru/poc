import React, { useState, useEffect } from "react";
import axios from "axios";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { SERVER_URL } from "../../../utils/config";
import { useLocation } from "react-router-dom";

const CustomWidthTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 300,
    fontSize: "14px",
  },
});

const Diagnosis = (props) => {
  const location = useLocation();
  const [description, setDescription] = useState("");

  const getDescription = () => {
    if (location.pathname.startsWith("/demo")) {
      axios
        .get(`${SERVER_URL}/v2/get_diagnosis_description?code=${props.Code}`)
        .then((res) => {
          setDescription(res.data);
        });
    } else {
      axios
        .get(`${SERVER_URL}/v2/get_diagnosis_description?code=${props.Code}`)
        .then((res) => {
          setDescription(res.data);
        });
    }
  };

  return (
    <CustomWidthTooltip title={description} placement="top">
      <Button onMouseOver={getDescription}>{props.Code}</Button>
    </CustomWidthTooltip>
  );
};

export default Diagnosis;
