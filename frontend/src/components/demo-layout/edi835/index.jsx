import React, { useState } from "react";
import axios from "axios";
import BillingProvider from "../utils/BillingProvider";
import Service from "../utils/Service";
import Patient from "../utils/Patient";
import BilledAmount from "../utils/BilledAmount";
import ClaimID from "../utils/ClaimID";
import { SERVER_URL } from "../../../utils/config";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';

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

const Edi835Parser = () => {
  const [ediText, setEdiText] = useState("");
  const [responseData, setResponseData] = useState({});
  const [tableview, setTableView] = useState(false);
  const [payee, setPayee] = useState(false);
  const [payeeData, setPayeeData] = useState({});
  const [service, setService] = useState(false);
  const [serviceData, setServiceData] = useState({});
  const parseEdiText = async () => {
    const edi = new FormData();
    edi.append("edi", ediText);
    try {
      const axiosResponse = await axios.post(`${SERVER_URL}/v2/parse_edi/`, edi);
      setResponseData(axiosResponse.data);
      console.log(axiosResponse.data)
      var data = {};
      axiosResponse.data.forEach((row) => {
        if (data[row.patient] === undefined) {
          data[row.patient] = row;
          data[row.patient].services = [];
        }
        data[row.patient].services.push({
          code: row.code,
          paid_amount: row.paid_amount,
          charged_amount: row.charge_amount,
          pr: row.adj_PR_amount,
          co: row.adj_CO_amount,
        });
      });
      setResponseData(data);
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };
  const saveToMongoDB = async () => {
    let data = JSON.stringify(
      Object.values(responseData).map((e, index) => {
        return JSON.stringify(e);
      })
    );
    const form = new FormData();
    form.append("data", data);
    axios
      .post(`${SERVER_URL}/v2/save_in_mongo`, form)
      .then((response) => {})
      .catch((response) => {});
  };
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

  return (
    <div className="flex flex-col gap-10">
      <Dialog
        onClose={() => setPayee(false)}
        aria-labelledby="customized-dialog-title"
        open={payee}
        fullWidth={'sm'}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Payee
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => setPayee(false)}
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
          <div>
            <div>{payeeData.bus_name}</div>
            <div style={dataStyle1}>
              <b>BUSINESS NAME</b>
            </div>
          </div>
          <div>
            <div>{payeeData.npi}</div>
            <div style={dataStyle1}>
              <b>NPI</b>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => setService(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        onClose={() => setService(false)}
        aria-labelledby="customized-dialog-title"
        open={service}
        fullWidth={'sm'}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        American Dental Association Codes
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => setPayee(false)}
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
          <div>
            <div>{serviceData.code}</div>
            <div style={dataStyle1}>
              <b>CODE</b>
            </div>
          </div>
          <div>
            <div>{serviceData.charged_amount}</div>
            <div style={dataStyle1}>
              <b>BILLED AMT</b>
            </div>
          </div>
          {serviceData.co !== null && (
            <div>
              <div>{serviceData.co}</div>
              <div style={dataStyle1}>
                <b>Contractual Obligations</b>
              </div>
            </div>
          )}
          {serviceData.pr !== null && (
            <div>
              <div>{serviceData.pr}</div>
              <div style={dataStyle1}>
                <b>Patient Responsibility</b>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => setService(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <div className="flex gap-5 items-center">
        <textarea
          className="rounded-lg border w-full min-h-48 p-3"
          value={ediText} onChange={(e) => setEdiText(e.target.value)} />
        <div className='flex flex-col text-white font-semibold text-[16px] text-center gap-5'>
          <div
            className='bg-blue-700 rounded-lg py-5 cursor-pointer'
            onClick={parseEdiText}
          >
            Parse
          </div>
          <div className='rounded-lg bg-green-700 py-5 cursor-pointer' onClick={saveToMongoDB}>
            Save to MongoDB
          </div>
        </div>
      </div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>ClaimID</StyledTableCell>
              <StyledTableCell>Payer</StyledTableCell>
              <StyledTableCell>Payee</StyledTableCell>
              <StyledTableCell>Paid Date</StyledTableCell>
              <StyledTableCell>Service Dates</StyledTableCell>
              <StyledTableCell>Services</StyledTableCell>
              <StyledTableCell>Billed Amt</StyledTableCell>
              <StyledTableCell>Paid Amt</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {responseData &&
              Object.values(responseData).map((row, index) => (
                <StyledTableRow key={index} onClick={() => setTableView(!tableview)}>
                  <StyledTableCell>
                    <ClaimID
                      data={{
                        date: row.patient_control_number,
                        cid: row.marker,
                      }}
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <BillingProvider
                      data={{
                        NPI: row.ProviderNPI,
                        bus_name: row.payer_name,
                        addr:
                          row.payer_city +
                          ", " +
                          row.payer_state +
                          " " +
                          row.payer_zipcode,
                      }}
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <Patient
                      setData={(e) => setPayeeData(e)}
                      openDialog={() => setPayee(true)}
                      data={{
                        memberid: row.payee_npi,
                        addr: row.payee_name,
                      }}
                    />
                  </StyledTableCell>
                  <StyledTableCell style={dataStyle}>
                    {new Date(row.transaction_date)
                      .toISOString()
                      .substring(0, 10)}
                  </StyledTableCell>
                  <StyledTableCell style={dataStyle}>
                    {new Date(row.start_date).toISOString().substring(0, 10)}
                  </StyledTableCell>
                  <StyledTableCell>
                    <Service
                      setData={(e) => setServiceData(e)}
                      openDialog={() => setService(true)}
                      data={row.services}
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <BilledAmount data={row.services} type={true} />
                  </StyledTableCell>
                  <StyledTableCell>
                    <BilledAmount data={row.services} type={false} />
                  </StyledTableCell>
                </StyledTableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Edi835Parser;