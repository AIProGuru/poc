import React, { useState } from "react";
import axios from "axios";
import { SERVER_URL } from "../../../utils/config";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

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

const Athena = () => {
  const [responseData, setResponseData] = useState({});
  const [tableview, setTableView] = useState(false);
  const [departmentId, setDepartmentId] = useState("1");
  const [startDate, setStartDate] = useState("2022-01-01");
  const [endDate, setEndDate] = useState("2023-06-11");
  const [loadingVisible, setLoadingVisible] = useState(false);

  const AthenaReq = () => {
    const postData = new FormData();
    postData.append("departmentId", departmentId);
    postData.append("startDate", startDate);
    postData.append("endDate", endDate);
    setResponseData([]);
    setLoadingVisible(true);
    axios
      .post(`${SERVER_URL}/v2/athena`, postData)
      .then((response) => {
        setLoadingVisible(false);
        setResponseData(response.data.claims);
        console.log(responseData[0]);
      })
      .catch((error) => {});
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex gap-6 justify-between items-center'>
        <div>
          <p>Department</p>
          <input
            type='text'
            className='form-control'
            id='basic-url'
            aria-describedby='basic-addon3'
            value={departmentId}
            onChange={(event) => setDepartmentId(event.target.value)}
          />
        </div>
        <div>
          <p>Start Date:</p>
          <input
            type='date'
            className='form-control'
            id='basic-url'
            aria-describedby='basic-addon3'
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>
        <div>
          <p>End Date:</p>
          <input
            type='date'
            className='form-control'
            id='basic-url'
            aria-describedby='basic-addon3'
            value={endDate}
            onChange={(event) => {
              setEndDate(event.target.value);
            }}
          />
          </div>
          <p
            className="rounded-lg px-10 py-3 bg-blue-700 text-white font-poppins text-[20px] cursor-pointer"
            onClick={AthenaReq}
          >
            Send
          </p>
      </div>
      {loadingVisible && (
        <div role="status" className="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2">
          <svg aria-hidden="true" className="w-20 h-20 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
          <span className="sr-only">Loading...</span>
        </div>
      )}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell align="center">Claim ID</StyledTableCell>
              <StyledTableCell align="center">Department ID</StyledTableCell>
              <StyledTableCell align="center">Patient ID</StyledTableCell>
              <StyledTableCell align="center">Billed Service Date</StyledTableCell>
              <StyledTableCell align="center">Claim Created Date</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {responseData &&
              Object.values(responseData).map((row, index) => (
                <StyledTableRow key={index} onClick={() => setTableView(!tableview)}>
                  <StyledTableCell align="center">{row.claimid}</StyledTableCell>
                  <StyledTableCell align="center">{row.departmentid}</StyledTableCell>
                  <StyledTableCell align="center">{row.patientid}</StyledTableCell>
                  <StyledTableCell align="center">{row.billedservicedate}</StyledTableCell>
                  <StyledTableCell align="center">{row.claimcreateddate}</StyledTableCell>
                </StyledTableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};


export default Athena;