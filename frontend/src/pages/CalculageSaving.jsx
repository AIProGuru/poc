import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Slider } from "@mui/material";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  border: "10px #ff0000",
  [`&.${tableCellClasses.head}`]: {
    // backgroundColor: "#044BD9",
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const PrettoSlider = styled(Slider)(({ theme }) => ({
  color: "#002FFF",
  height: 18,
  padding: "15px 0",
  "& .MuiSlider-thumb": {
    height: 24,
    width: 24,
    backgroundColor: "#002FFF",
    outline: "7px solid #0F133180",
    boxShadow: "0 0 2px 0px rgba(0, 0, 0, 0.1)",
    "&:focus, &:hover, &.Mui-active": {
      boxShadow: "0px 0px 3px 1px rgba(0, 0, 0, 0.1)",
      // Reset on touch devices, it doesn't add specificity
    },
    "&:before": {
      boxShadow:
        "0px 0px 1px 0px rgba(0,0,0,0.2), 0px 0px 0px 0px rgba(0,0,0,0.14), 0px 0px 1px 0px rgba(0,0,0,0.12)",
    },
  },
  "& .MuiSlider-track": {
    border: "none",
    height: 18,
  },
  "& .MuiSlider-rail": {
    boxShadow: "1px 1px 1px 1px #000",
    background:
      "linear-gradient(0deg, rgba(12,37,82,1) 0%, rgba(15,35,64,1) 100%)",
  },
  ...theme.applyStyles("dark", {
    color: "#0a84ff",
  }),
}));

const randomNumberInRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

function CalculateSavingsPage() {
  const [bpoAgents, setBPOAgents] = useState(150);
  const [writeoff, setWriteOff] = useState(4230397);
  const [claimsPerDay, setClaimsPerDay] = useState(37);
  const [costBPO, setCostBPO] = useState(25);

  const [avgTouches, setAvgTouches] = useState(10);
  const [avgDenialsPM, setAvgDenialsPM] = useState(500);

  const gabeo_cost_per_claim = 0.1;

  const gabeo_cpc = 0.6;
  const gabeo_success_rate = 0.8; // assume that gabeo can return 80% of denials into money

  // var n_successed_claims_per_month =
  //   ((bpoAgents * claimsPerDay) / avgTouches * 10) * 20;
  // var monthly_salary = bpoAgents * costBPO * 8 * 20;
  // var monthly_salary_with_gabeo =
  //   n_successed_claims_per_month * gabeo_cost_per_claim;
  // var projected_cost_saving = monthly_salary - monthly_salary_with_gabeo;
  // var fte_saving_per_month = projected_cost_saving / costBPO / 160 

  var monthly_salary = bpoAgents * costBPO * 8 * 20;
  var projected_cost_saving = monthly_salary * 0.4 + monthly_salary * 0.02 * avgTouches - monthly_salary * 0.015 * claimsPerDay
  var fte_saving_per_month = bpoAgents * 0.15 + bpoAgents * 0.02 * avgTouches - bpoAgents * 0.015 * claimsPerDay



  // var n_successed_claims_with_gabeo = avgDenialsPM * gabeo_success_rate

  // var total_cost_per_day = bpoAgents * costBPO * 8
  // var cost_per_claim = total_cost_per_day / n_successed_claims
  // var total_cost_per_month_with_gabeo = avgDenialsPM * gabeo_cost_per_claim

  const handleBPOAgents = (e) => {
    const value = parseInt(e.target.value, 10);
    setBPOAgents(value);
  };

  const handleWriteOffAmount = (e) => {
    const value = parseInt(e.target.value, 10);
    setWriteOff(value);
  };

  const handleClaimsPerDay = (e) => {
    const value = parseInt(e.target.value, 10);
    setClaimsPerDay(value);
  };

  const handleCostBPO = (e) => {
    const value = parseInt(e.target.value, 10);
    setCostBPO(value);
  };

  const handleAvgTouches = (e) => {
    const value = parseInt(e.target.value, 10);
    setAvgTouches(value);
  };

  return (
    <div
      className="font-poppins flex flex-col gap-4 justify-between pt-14 items-center min-h-full pb-0"
      style={{
        background:
          "linear-gradient(135deg, rgba(9,11,24,1) 0%, rgba(33,41,107,1) 53%, rgba(33,40,105,1) 63%, rgba(26,28,58,1) 100%)",
      }}
    >
      <div className="container flex justify-center">
        <div className="w-full">
          <h1 className="md:text-[54px] md:leading-[54px] text-[38px] leading-[54px] text-[#EBEDF0] font-bold text-center">
            Calculate Savings With Aaftaab
          </h1>
          {/* Input Form */}
          <div className="grid md:grid-cols-2 gap-4 grid-cols-1 mt-8">
            <div className="form-group flex flex-col gap-2 items-stretch">
              <span className="text-[#6C9BE0] font-normal text-[20px]">
                1. Number of RCM Specialists Managing Appeals & Resubmissions:
              </span>
              <div className="flex flex-row gap-2 items-center justify-between">
                <div className="w-[85%]">
                  <PrettoSlider
                    min={10}
                    max={1000}
                    value={bpoAgents}
                    onChange={handleBPOAgents}
                  />
                </div>
                <span className="text-[#EBEDF0] text-right font-normal text-[16px]">
                  {" "}
                  {bpoAgents}
                </span>
              </div>
            </div>

            <div className="form-group flex flex-col gap-2 items-stretch">
              <span className="text-[#6C9BE0] font-normal text-[20px]">
                2. Daily Appeals & Resubmissions Volume:
              </span>
              <div className="flex flex-row gap-2 items-center justify-between">
                <div className="w-[85%]">
                  <PrettoSlider
                    min={0}
                    max={50}
                    value={claimsPerDay}
                    onChange={handleClaimsPerDay}
                  />
                </div>
                <span className="text-[#EBEDF0] text-right font-normal text-[16px]">
                  {" "}
                  {claimsPerDay}/day
                </span>
              </div>
            </div>

            <div className="form-group flex flex-col gap-2 items-stretch">
              <span className="text-[#6C9BE0] font-normal text-[20px]">
                3. Average Touches per Claim in Rework:
              </span>
              <div className="flex flex-row gap-2 items-center justify-between">
                <div className="w-[85%]">
                  <PrettoSlider
                    min={10}
                    max={50}
                    step={5}
                    value={avgTouches}
                    onChange={handleAvgTouches}
                  />
                </div>
                <span className="text-[#EBEDF0] text-right font-normal text-[16px]">
                  {" "}
                  {avgTouches / 10}
                </span>
              </div>
            </div>

            <div className="form-group flex flex-col gap-2 items-stretch">
              <span className="text-[#6C9BE0] font-normal text-[20px]">
                4. Cost per RCM Specialist:
              </span>
              <div className="flex flex-row gap-2 items-center justify-between">
                <div className="w-[85%]">
                  <PrettoSlider
                    min={1}
                    max={50}
                    value={costBPO}
                    onChange={handleCostBPO}
                  />
                </div>
                <span className="text-[#EBEDF0] text-right font-normal text-[16px]">
                  {" "}
                  ${costBPO}/hour
                </span>
              </div>
            </div>

            {/* <div className="form-group flex flex-col gap-2 items-stretch">
              <span className="text-[#6C9BE0] font-normal text-[20px]">
                5. Number of Average Denials per Month 
              </span>
              <div className="flex flex-row gap-2 items-center justify-between">
                <div className="w-[85%]">
                  <PrettoSlider
                    min={10}
                    max={1000000}
                    value={avgDenialsPM}
                    onChange={(e)=>setAvgDenialsPM(parseInt(e.target.value, 10))}
                  />
                </div>
                <span className="text-[#EBEDF0] text-right font-normal text-[16px]">
                  {" "}
                  {avgDenialsPM}
                </span>
              </div>
            </div> */}
          </div>
          <div className="form-group flex flex-col gap-2 items-stretch">
            <span className="text-[#6C9BE0] font-normal text-[20px]">
              5. Annual Professional Write-off Amount:
            </span>
            <div className="flex flex-row gap-2 items-center justify-between">
              <div className="w-[93%]">
                <PrettoSlider
                  min={1}
                  max={10000000}
                  value={writeoff}
                  onChange={handleWriteOffAmount}
                />
              </div>
              <span className="text-[#EBEDF0] text-right font-normal text-[16px]">
                {" "}
                ${writeoff}
              </span>
            </div>
          </div>

          {/* Data Grid */}
          <div className="md:grid mt-12 hidden">
            <div className="overflow-x-auto rounded-3xl border-[#131529] border">
              <table className="min-w-full table-auto ">
                <thead className="bg-[#16192D] text-[#6C9BE0] text-[16px] font-normal h-[70px] rounded-3xl">
                  <tr>
                    <th className="px-4 py-2"> </th>
                    <th className="px-4 py-2">Projected Cost Sav</th>
                    <th className="px-4 py-2">Estimated FTE Reduction:</th>

                    <th className="px-4 py-2">Potential Write-off Savings</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#131529] text-[#EBEDF0] text-[20px] text-center h-[70px]">
                    <td className="px-4 py-2">Monthly</td>
                    <td className="px-4 py-2">
                      ${projected_cost_saving.toFixed(1).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      {fte_saving_per_month.toLocaleString()}
                    </td>

                    <td className="px-4 py-2">
                      ${(writeoff / 7 / 12).toLocaleString()}
                    </td>
                  </tr>
                  <tr className=" text-[#EBEDF0] text-[20px] text-center h-[70px] rounded-b-3xl">
                    <td className="px-4 py-2">Yearly</td>
                    <td className="px-4 py-2">
                      ${(projected_cost_saving * 12).toFixed(1).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      {fte_saving_per_month.toLocaleString()}
                    </td>

                    <td className="px-4 py-2">
                      ${(writeoff / 7).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="md:hidden flex flex-col border border-[#16192D] rounded-[32px]">
            <p className="px-[32px] py-[16px] rounded-t-[32px] bg-[#16192D] text-[#EBEDF0] text-[20px]">
              Monthly
            </p>
            <div className="flex flex-col border-b border-[#16192D] px-[32px] gap-1 py-[12px]">
              <p className="text-[#A9C5ED] text-[16px]">Projected Cost Sav:</p>
              <p className="text-[#EBEDF0] text-[20px]">
                {" "}
                ${projected_cost_saving.toFixed(1).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col border-b border-[#16192D] px-[32px] gap-1 py-[12px]">
              <p className="text-[#A9C5ED] text-[16px]">
                Estimated FTE Reduction:
              </p>
              <p className="text-[#EBEDF0] text-[20px]">
                {fte_saving_per_month.toFixed(1).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col border-b border-[#16192D] px-[32px] gap-1 py-[12px]">
              <p className="text-[#A9C5ED] text-[16px]">
                Potential Write-off Savings
              </p>
              <p className="text-[#EBEDF0] text-[20px]">
                ${(writeoff / 7 / 12).toLocaleString()}
              </p>
            </div>
            <p className="px-[32px] py-[16px] bg-[#16192D] text-[#EBEDF0] text-[20px]">
              Yearly
            </p>
            <div className="flex flex-col border-b border-[#16192D] px-[32px] gap-1 py-[12px]">
              <p className="text-[#A9C5ED] text-[16px]">Projected Cost Sav:</p>
              <p className="text-[#EBEDF0] text-[20px]">
                {" "}
                ${(projected_cost_saving * 12).toFixed(1).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col border-b border-[#16192D] px-[32px] gap-1 py-[12px]">
              <p className="text-[#A9C5ED] text-[16px]">
                Estimated FTE Reduction:
              </p>
              <p className="text-[#EBEDF0] text-[20px]">
                {" "}
                {/* {fte_saving_per_month.toFixed(1).toLocaleString()} */}
              </p>
            </div>
            <div className="flex flex-col px-[32px] gap-1 py-[12px]">
              <p className="text-[#A9C5ED] text-[16px]">
                Potential Write-off Savings
              </p>
              <p className="text-[#EBEDF0] text-[20px]">
                ${(writeoff / 7).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Display Aaftaab results based on the condition */}
      {projected_cost_saving > 0 ? (
        <div className="container">
          <div className="bg-gradient-to-r from-[#3849D866] to-[#0048FF] text-center w-full rounded-t-3xl h-full gap-4 flex flex-col pb-10">
            <h2 className="md:text-[54px] text-[32px] font-bold text-[#EBEDF0] pt-10 md:pt-0">
              Congratulations!
            </h2>
            <p className="text-[#6C9BE0] text-[22px]">
            Aaftaab has identified efficiencies in your process that can
              annually save you:
            </p>
            <div className="bg-gradient-to-r from-[#0B0C14] to-[#3025FF] w-fit p-5 justify-center mx-auto rounded-xl min-w-[70%]">
              <ul className="flex md:flex-row flex-col text-[#EEF6FF] text-[22px] md:gap-16 gap-4 md:justify-evenly justify-start items-start text-start">
                <li>
                  Cost saving of up to:{" "}
                  <b className="text-[#4570FF]">
                    ${(projected_cost_saving * 12).toFixed(1).toLocaleString("en-US")}
                  </b>
                </li>
                <li>
                  FTE savings of up to:{" "}
                  <b className="text-[#4570FF]">
                    {fte_saving_per_month.toLocaleString("en-US")}
                  </b>
                </li>
              </ul>
            </div>
            <div className="font-semibold text-[#EBEDF0] text-[16px]">
              <p>
                Cutting turnaround time by 30% for quicker revenue realization.
                Don't Forget The WriteOffs!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-gradient-to-r from-[#0080FF] to-[#0048FF] text-center rounded-t-3xl h-full gap-4 flex flex-col pb-10">
            <h2 className="text-[54px] font-bold text-[#EBEDF0]">Sorry!</h2>
            <p>
              Seems like your operations are already efficient; Aaftaab can't help
              optimize cost savings any further. Thanks for trying us!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalculateSavingsPage;
