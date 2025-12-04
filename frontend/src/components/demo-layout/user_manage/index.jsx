import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { SERVER_URL } from '../../../utils/config';

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

const UserManagement = () => {
  const [responseData, setResponseData] = useState([]);
  const [tableview, setTableView] = useState(false);

  useEffect(() => {
    axios
      .get(`${SERVER_URL}/v2/users`)
      .then(res => {
        console.log(res)
        setResponseData(res.data)
      })
      .catch(res => {})
  }, [])

  return (
    <div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell align="center">No</StyledTableCell>
              <StyledTableCell align="center">EMAIL</StyledTableCell>
              <StyledTableCell align="center">FIRSTNAME</StyledTableCell>
              <StyledTableCell align="center">LASTNAME</StyledTableCell>
              <StyledTableCell align="center">ROLE</StyledTableCell>
              <StyledTableCell align="center">APPROVED</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <StyledTableRow>
              <StyledTableCell>1</StyledTableCell>
              <StyledTableCell>2</StyledTableCell>
              <StyledTableCell>3</StyledTableCell>
              <StyledTableCell>4</StyledTableCell>
              <StyledTableCell>5</StyledTableCell>
              <StyledTableCell>6</StyledTableCell>
            </StyledTableRow>
            {responseData &&
              Object.values(responseData).map((row, index) => (
                <StyledTableRow key={index} onClick={() => setTableView(!tableview)} onDoubleClick={() => alert(12321)}>
                  <StyledTableCell align="center">
                    {index+1}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {row['email']}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {row['firstname']}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {row['lastname']}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {row['role']==0?'Customer':(row['role']==1?'Demo':'Admin')}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {row['approved']}
                  </StyledTableCell>
                </StyledTableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

export default UserManagement;