import React from "react";
import Container from "../components/layout/Container";
import Workflow from "../components/layout/Workflow";

const Feature = () => {
  return (
    <div className="flex flex-col gap-10">
      <Container>
        <Workflow />
      </Container>
      <div className="bg-blue-600 flex flex-col gap-10 p-10">
        <p className="pl-[25%] text-white font-poppins font-semibold text-[48px]">
          Platform Overview
        </p>
        <div className="flex justify-center">
          <img src="/platform-overview.svg" alt=""></img>
        </div>
      </div>
    </div>
  );
};

export default Feature;
