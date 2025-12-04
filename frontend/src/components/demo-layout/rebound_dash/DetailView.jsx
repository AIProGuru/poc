import React, { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import Paper from "@mui/material/Paper";
import TableBody from "@mui/material/TableBody";
import { styled } from "@mui/material/styles";
import TableContainer from "@mui/material/TableContainer";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#044BD9",
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const DetailView = (props) => {
  console.log(props.currentClaim);
  const [detailShowStatus, setDetailShowStatus] = useState(0);
  const currentClaim = props.currentClaim;
  const [expanded, setExpanded] = useState({
    keyinfo: false,
    billingprovider: false,
    patient: false,
    payer: false,
    provider: false,
    diagnosis: false,
  });
  const [serviceExpand, setServiceExpand] = useState(props.serviceExpand);

  const setExpandOrCollapses = (value) => {
    if (detailShowStatus == 0) {
      let data = expanded;
      Object.keys(data).map((row, index) => {
        console.log(row);
        data[row] = value;
      });
      setExpanded({ ...data });
      console.log(data, expanded);
    } else if (detailShowStatus == 1) {
      setServiceExpand([...serviceExpand.map((row, index) => value)]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img
            src="/arrow.svg"
            className="h-7 w-7 cursor-pointer"
            onClick={() => props.setIsDetailView(false)}
          />
          <p>Claim Details</p>
        </div>
        <div className="flex gap-4 flex-wrap text-[14px]">
          <div className="flex flex-col">
            <div>ClaimID</div>
            <div>{currentClaim.INDIVIDUAL.ClaimID}</div>
          </div>
          <div className="flex flex-col">
            <div>Charge AMT</div>
            <div>{currentClaim.INDIVIDUAL.Charge}</div>
          </div>
          <div className="flex flex-col">
            <div>Patient Resp</div>
            <div>{currentClaim.INDIVIDUAL.Patient}</div>
          </div>
          <div className="flex flex-col">
            <div>Adjustment Amt</div>
            <div>{currentClaim.INDIVIDUAL.Contractual}</div>
          </div>
          <div className="flex flex-col">
            <div>Payer Paid</div>
            <div>{currentClaim.INDIVIDUAL.Payment}</div>
          </div>
          <div className="flex flex-col">
            <div>Denied AMT</div>
            <div>{currentClaim.INDIVIDUAL.Denied}</div>
          </div>
          <div className="flex flex-col">
            <div>Dates</div>
            <div>{currentClaim.INDIVIDUAL.ServiceDate}</div>
          </div>
        </div>
      </div>
      <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">
          <li className="me-2">
            <a
              href="#"
              className={`inline-block p-4 border-b-2 ${detailShowStatus === 0
                ? "text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500"
                : "border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                }`}
              onClick={() => setDetailShowStatus(0)}
            >
              Claim
            </a>
          </li>
          <li className="me-2">
            <a
              href="#"
              className={`inline-block p-4 border-b-2 ${detailShowStatus === 1
                ? "text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500"
                : "border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                }`}
              aria-current="page"
              onClick={() => setDetailShowStatus(1)}
            >
              Remit
            </a>
          </li>
          <li className="me-2">
            <a
              href="#"
              className={`inline-block p-4 border-b-2 ${detailShowStatus === 2
                ? "text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500"
                : "border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                }`}
              aria-current="page"
              onClick={() => setDetailShowStatus(2)}
            >
              Related Encounters
            </a>
          </li>
          <li className="me-2">
            <a
              href="#"
              className={`inline-block p-4 border-b-2 ${detailShowStatus === 3
                ? "text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500"
                : "border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                }`}
              aria-current="page"
              onClick={() => setDetailShowStatus(3)}
            >
              Documentation
            </a>
          </li>
          <li className="me-2">
            <a
              href="#"
              className={`inline-block p-4 border-b-2 ${detailShowStatus === 4
                ? "text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500"
                : "border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                }`}
              aria-current="page"
              onClick={() => setDetailShowStatus(4)}
            >
              Triage/Action
            </a>
          </li>
        </ul>
      </div>
      <div className="flex gap-4">
        <button
          className="bg-blue-600 text-white font-poppins font-semibold rounded-full px-4 py-1"
          onClick={() => setExpandOrCollapses(true)}
        >
          Expand All
        </button>
        <button
          className="bg-blue-600 text-white font-poppins font-semibold rounded-full px-4 py-1"
          onClick={() => setExpandOrCollapses(false)}
        >
          Collapse All
        </button>
      </div>
      {detailShowStatus == 0 && (
        <div className="flex flex-col">
          <Accordion expanded={expanded.keyinfo}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
              onClick={() =>
                setExpanded({ ...expanded, keyinfo: !expanded.keyinfo })
              }
            >
              Visit
            </AccordionSummary>
            <AccordionDetails>
              <div className="flex flex-wrap gap-4 justify-between">
                {currentClaim.KEYINFO.map((row, index) => (
                  <div className="flex flex-col" key={index}>
                    <div className="font-semibold">{row.KEY}</div>
                    <div>{row.VALUE}</div>
                  </div>
                ))}
              </div>
            </AccordionDetails>
          </Accordion>
          {currentClaim.PATIENT && (
            <Accordion expanded={expanded.patient}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                onClick={() =>
                  setExpanded({
                    ...expanded,
                    patient: !expanded.patient,
                  })
                }
              >
                Patient
              </AccordionSummary>
              <AccordionDetails>
                <div className="flex flex-wrap gap-4 justify-between">
                  {currentClaim.PATIENT.map((row, index) => (
                    <div className="flex flex-col" key={index}>
                      <div className="font-semibold">{row.KEY}</div>
                      <div>{row.VALUE}</div>
                    </div>
                  ))}
                </div>
              </AccordionDetails>
            </Accordion>
          )}
          {currentClaim.PAYER && (
            <Accordion expanded={expanded.payer}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                onClick={() =>
                  setExpanded({
                    ...expanded,
                    payer: !expanded.payer,
                  })
                }
              >
                Payer
              </AccordionSummary>
              <AccordionDetails>
                <div className="flex flex-wrap gap-4 justify-between">
                  {currentClaim.PAYER.map((row, index) => (
                    <div className="flex flex-col" key={index}>
                      <div className="font-semibold">{row.KEY}</div>
                      <div>{row.VALUE}</div>
                    </div>
                  ))}
                </div>
              </AccordionDetails>
            </Accordion>
          )}
          {currentClaim.PROVIDER && (
            <Accordion expanded={expanded.provider}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                onClick={() =>
                  setExpanded({
                    ...expanded,
                    provider: !expanded.provider,
                  })
                }
              >
                Provider
              </AccordionSummary>
              <AccordionDetails>
                <div className="flex flex-wrap gap-4 justify-between">
                  {currentClaim.PROVIDER.map((row, index) => (
                    <div className="flex flex-col" key={index}>
                      <div className="font-semibold">{row.KEY}</div>
                      <div>{row.VALUE}</div>
                    </div>
                  ))}
                </div>
              </AccordionDetails>
            </Accordion>
          )}
          {currentClaim.DIAGNOSIS && (
            <Accordion expanded={expanded.diagnosis}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                onClick={() =>
                  setExpanded({
                    ...expanded,
                    diagnosis: !expanded.diagnosis,
                  })
                }
              >
                Diagnosis (
                {currentClaim.DIAGNOSIS.map((row, index) => row.Code).join(
                  ", "
                )}
                )
              </AccordionSummary>
              <AccordionDetails>
                <Table aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Code</TableCell>
                      <TableCell>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentClaim.DIAGNOSIS.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.Code}</TableCell>
                        <TableCell>{row.Description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionDetails>
            </Accordion>
          )}
          <Accordion expanded={expanded.keyinfo}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
              onClick={() =>
                setExpanded({ ...expanded, keyinfo: !expanded.keyinfo })
              }
            >
              Service Lines ({currentClaim.SERVICES.length})
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper}>
                <Table aria-label="customized table">
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>CPT</StyledTableCell>
                      <StyledTableCell>Description</StyledTableCell>
                      <StyledTableCell>Service Date</StyledTableCell>
                      <StyledTableCell>Charges</StyledTableCell>
                      <StyledTableCell>Units</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentClaim.SERVICES.map((row, index) =>
                      <TableRow>
                        <StyledTableCell>{row.Code}</StyledTableCell>
                        <StyledTableCell>{row.Description}</StyledTableCell>
                        <StyledTableCell>{row.ServiceDate}</StyledTableCell>
                        <StyledTableCell>{row.Charge}</StyledTableCell>
                        <StyledTableCell>{row.Units}</StyledTableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        </div>
      )}
      {detailShowStatus == 1 && (
        <div className="flex flex-col">
          <Accordion defaultExpanded={false}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              Check Information
            </AccordionSummary>
            <AccordionDetails>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Check Date</StyledTableCell>
                    <StyledTableCell>Check #</StyledTableCell>
                    <StyledTableCell>Check Amount</StyledTableCell>
                    <StyledTableCell>Payer Name</StyledTableCell>
                    <StyledTableCell>Payer ID</StyledTableCell>
                    <StyledTableCell>Provider Name</StyledTableCell>
                    <StyledTableCell>Provider Address</StyledTableCell>
                    <StyledTableCell>TaxID</StyledTableCell>
                    <StyledTableCell>NPI</StyledTableCell>
                    <StyledTableCell>PLB Adjustment</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <StyledTableCell></StyledTableCell>
                    <StyledTableCell></StyledTableCell>
                    <StyledTableCell></StyledTableCell>
                    <StyledTableCell>{currentClaim.PAYER[0].VALUE}</StyledTableCell>
                    <StyledTableCell>{currentClaim.PAYER[1].VALUE}</StyledTableCell>
                    <StyledTableCell></StyledTableCell>
                    <StyledTableCell>{currentClaim.PROVIDER[3].VALUE}</StyledTableCell>
                    <StyledTableCell>{currentClaim.PROVIDER[1].VALUE}</StyledTableCell>
                    <StyledTableCell>{currentClaim.PROVIDER[0].VALUE}</StyledTableCell>
                    <StyledTableCell></StyledTableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
          <Accordion defaultExpanded={false}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              Claim Information
            </AccordionSummary>
            <AccordionDetails>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Service Dates</StyledTableCell>
                    <StyledTableCell>Processing Status</StyledTableCell>
                    <StyledTableCell>Payer Claim #</StyledTableCell>
                    <StyledTableCell>Claim ID</StyledTableCell>
                    <StyledTableCell>Charges</StyledTableCell>
                    <StyledTableCell>Paid</StyledTableCell>
                    <StyledTableCell>Adjustment Amt</StyledTableCell>
                    <StyledTableCell>Patient Resp</StyledTableCell>
                    <StyledTableCell>Deductible</StyledTableCell>
                    <StyledTableCell>Co-Insurance</StyledTableCell>
                    <StyledTableCell>Co-Pay</StyledTableCell>
                    <StyledTableCell>Other Insurance</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <StyledTableCell>{currentClaim.INDIVIDUAL.ServiceDate}</StyledTableCell>
                    <StyledTableCell></StyledTableCell>
                    <StyledTableCell></StyledTableCell>
                    <StyledTableCell>{currentClaim.INDIVIDUAL.ClaimID}</StyledTableCell>
                    <StyledTableCell>{currentClaim.INDIVIDUAL.Charge}</StyledTableCell>
                    <StyledTableCell>{currentClaim.INDIVIDUAL.Payment}</StyledTableCell>
                    <StyledTableCell>{currentClaim.INDIVIDUAL.Denied}</StyledTableCell>
                    <StyledTableCell>{currentClaim.INDIVIDUAL.Patient}</StyledTableCell>
                    <StyledTableCell></StyledTableCell>
                    <StyledTableCell></StyledTableCell>
                    <StyledTableCell></StyledTableCell>
                    <StyledTableCell></StyledTableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
          <Accordion defaultExpanded={false}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              Patient Information
            </AccordionSummary>
            <AccordionDetails>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Patient Name</StyledTableCell>
                    <StyledTableCell>Patient Control Number</StyledTableCell>
                    <StyledTableCell>Patient ID (SSN)</StyledTableCell>
                    <StyledTableCell>Subscriber Name</StyledTableCell>
                    <StyledTableCell>Subscriber ID</StyledTableCell>
                    <StyledTableCell>Group/Policy ID</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
          <Accordion defaultExpanded={false}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              Service Line Detail
            </AccordionSummary>
            <AccordionDetails>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Line #</StyledTableCell>
                    <StyledTableCell>Service Date</StyledTableCell>
                    <StyledTableCell>Procedure Code</StyledTableCell>
                    <StyledTableCell>Description</StyledTableCell>
                    <StyledTableCell>Modifiers</StyledTableCell>
                    <StyledTableCell>Units</StyledTableCell>
                    <StyledTableCell>Charge</StyledTableCell>
                    <StyledTableCell>Allowable Amount</StyledTableCell>
                    <StyledTableCell>Not Allowable</StyledTableCell>
                    <StyledTableCell>Deductible</StyledTableCell>
                    <StyledTableCell>Co-Insurance</StyledTableCell>
                    <StyledTableCell>Co-Pay</StyledTableCell>
                    <StyledTableCell>Paid</StyledTableCell>
                    <StyledTableCell>Group Code</StyledTableCell>
                    <StyledTableCell>Reason Code</StyledTableCell>
                    <StyledTableCell>Reason Description</StyledTableCell>
                    <StyledTableCell>Amount</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentClaim.SERVICES.map((r, i) => (
                    <TableRow>
                      <StyledTableCell>{i + 1}</StyledTableCell>
                      <StyledTableCell></StyledTableCell>
                      <StyledTableCell></StyledTableCell>
                      <StyledTableCell></StyledTableCell>
                      <StyledTableCell></StyledTableCell>
                      <StyledTableCell></StyledTableCell>
                      <StyledTableCell></StyledTableCell>
                      <StyledTableCell></StyledTableCell>
                      <StyledTableCell></StyledTableCell>
                      <StyledTableCell></StyledTableCell>
                      <StyledTableCell></StyledTableCell>
                      <StyledTableCell></StyledTableCell>
                      <StyledTableCell></StyledTableCell>
                      <StyledTableCell>
                        {r.GroupCode}
                      </StyledTableCell>
                      <StyledTableCell>
                        {r.Code}
                      </StyledTableCell>
                      <StyledTableCell>
                        {r.Description}
                      </StyledTableCell>
                      <StyledTableCell>
                        {r.Amount}
                      </StyledTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        </div>
      )}
      {detailShowStatus == 2 && <div className="flex flex-col">

      </div>}
      {detailShowStatus == 3 && <div className="flex flex-col">
        <div className="flex flex-row">
          <input
            className="relative m-0 block w-full min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:file:bg-neutral-700 dark:file:text-neutral-100 dark:focus:border-primary"
            type="file"
            accept=".pdf"
            multiple
            id="formFile"
          />
          <button
            className="bg-blue-800 text-white px-6 py-2 rounded-xl"
          >
            Upload
          </button>
        </div>
      </div>}
      {detailShowStatus == 4 && <div className="flex flex-col"></div>}
    </div>
  );
};

export default DetailView;
