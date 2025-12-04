import React, { useEffect, useState } from "react";
import Diagnosis from "../utils/Diagnosis";
import Procedure from "../utils/Procedure";
import axios from "axios";
import { SERVER_URL } from "../../../utils/config";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';


const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#044BD9',
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));


const AthenaDash = () => {
  const [responseData, setResponseData] = useState({});
  const [tableview, setTableView] = useState(false);
  const [diagnosis, setDiagnosis] = useState(false);
  const [diagnosisData, setDiagnosisData] = useState({});
  const [procedure, setProcedure] = useState(false);
  const [procedureData, setProcedureData] = useState({});
  const [testing, setTesting] = useState(false);
  const dataStyle = {
    fontSize: "16px",
    fontFace: "BlinkMacSystemFont",
    color: "black",
  };
  const dataStyle1 = {
    fontSize: "16px",
    fontFace: "BlinkMacSystemFont",
    color: "#1B2B41B0",
  };

  useEffect(() => {
    axios
      .get(`${SERVER_URL}/v2/all_athena_mongodb`)
      .then((response) => {
        response = response.data;
        console.log(response);
        var data = [];
        response.forEach((row) => {
          row = JSON.parse(row);
          data.push(row);
        });
        setResponseData(data);
        console.log(responseData);
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <div style={{ width: "100%" }}>
      {testing ? (
        <div style={{ padding: "10px" }}>
          <h1>Example response</h1>
          <h5>Referring provider ID and/or name is missing/not valid</h5>
          <p>
            After reviewing the EOB under the payment batch#2559584, Claim was
            denied on 10/24/2023 for CPT 99214, 25 365415. Called
            BCBS-KANSAS[154]@18004323990 and spoke with Staria and she said that
            claim has been received on 10/04/2023. Rep said that this claim was
            denied as reffering provider npi is invalid or missing. Box# 17 and
            17b need to complete for 36415, rest of the code will be processed
            once this information corrected. I had asked for rendering provider
            name, rep said BAUER, JACLYN. I had asked for address to submit the
            correct information 1133 South West Topeka Blvd, Topeka KS 66629,
            timely filing limit is 1 year and 90 days from date of service.
            Checked in billing summary and we have not received paid claims with
            previously. Therefore, please go to the claim edit page and next to
            reffering provider, select choose/view, complete information, and
            resubmit the claim with DRPPROVNUM, Claim#57222771148 Call
            reference#222306046031. Thank you.
          </p>
          <Button onClick={() => setTesting(false)}>Back</Button>
        </div>
      ) : (
        <div className="edi-parser">
          <Dialog
            onClose={() => setProcedure(false)}
            aria-labelledby="customized-dialog-title"
            open={procedure}
            fullWidth={'sm'}
          >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
              Transaction-{procedureData.transactionid}
            </DialogTitle>
            <IconButton
              aria-label="close"
              onClick={() => setProcedure(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
            <DialogContent dividers>
              <div style={dataStyle1}>
                <b>ProcedureCode</b>
              </div>
              <div>{procedureData.procedurecode}</div>
              <div style={dataStyle1}>
                <b>ChargeAmount</b>
              </div>
              <div>{procedureData.chargeamount}</div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setProcedure(false)}>
                Close
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            onClose={() => setDiagnosis(false)}
            aria-labelledby="customized-dialog-title"
            open={diagnosis}
            fullWidth={'sm'}
          >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
              Diagnosis-{diagnosisData.diagnosisid}
            </DialogTitle>
            <IconButton
              aria-label="close"
              onClick={() => setDiagnosis(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
            <DialogContent dividers>
              <div style={dataStyle1}>
                <b>Category</b>
              </div>
              <div>{diagnosisData.diagnosiscategory}</div>
              <div style={dataStyle1}>
                <b>CodeSet</b>
              </div>
              <div>{diagnosisData.diagnosiscodeset}</div>
              <div style={dataStyle1}>
                <b>Description</b>
              </div>
              <div>{diagnosisData.diagnosisdescription}</div>
              <div style={dataStyle1}>
                <b>RawCode</b>
              </div>
              <div>{diagnosisData.diagnosisrawcode}</div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDiagnosis(false)}>
                Close
              </Button>
            </DialogActions>
          </Dialog>
          <div className="table-container">
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 700 }} aria-label="customized table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell align="center">Claim ID</StyledTableCell>
                    <StyledTableCell align="center">ProviderID</StyledTableCell>
                    <StyledTableCell align="center">Claim Date</StyledTableCell>
                    <StyledTableCell align="center">Service Dates</StyledTableCell>
                    <StyledTableCell align="center">Diagnosis</StyledTableCell>
                    <StyledTableCell align="center">Procedures</StyledTableCell>
                    <StyledTableCell align="center">Status</StyledTableCell>
                    <StyledTableCell align="center">Action</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {responseData &&
                    Object.values(responseData).map((row, index) => (
                      <StyledTableRow key={index} onClick={() => setTableView(!tableview)}>
                        <StyledTableCell>{row.claimid}</StyledTableCell>
                        <StyledTableCell>{row.billedproviderid}</StyledTableCell>
                        <StyledTableCell style={dataStyle}>{row.claimcreateddate}</StyledTableCell>
                        <StyledTableCell style={dataStyle}>{row.billedservicedate}</StyledTableCell>
                        <StyledTableCell>
                          <Diagnosis
                            setData={(e) => setDiagnosisData(e)}
                            openDialog={() => setDiagnosis(true)}
                            data={row.diagnoses}
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          <Procedure
                            setData={(e) => setProcedureData(e)}
                            openDialog={() => setProcedure(true)}
                            data={row.procedures}
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          <span className="badge badge-info">HOLD</span>
                        </StyledTableCell>
                        <StyledTableCell>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setTesting(true);
                            }}
                          >
                            Test
                          </button>
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AthenaDash;