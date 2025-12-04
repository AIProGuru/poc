import React, { useEffect, useState } from 'react';
import axios from "axios";
import { DataGrid } from '@mui/x-data-grid';
import { SERVER_URL } from '../../../utils/config';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'payer', headerName: 'Payer', width: 130 },
  { field: 'geo', headerName: 'State', width: 100 },
  { field: 'policy', headerName: 'Policy', width: 500 },
  { field: 'url', headerName: 'Url', width: 400 },
  { field: 'category', headerName: 'Category', width: 200 },
  { field: 'lastupdated', headerName: 'Last Update', width: 130 },
];

const PolicyBoard = () => {
  const [tableData, setTableData] = useState([])

  useEffect(() => {
    axios
      .get(`${SERVER_URL}/v2/get_policy_board`)
      .then((response) => {
        response = response.data
        console.log(response)
        setTableData(response)
      })
      .catch((error) => console.log(error))
  }, [])
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <DataGrid
        rows={tableData}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 15 },
          },
        }}
        pageSizeOptions={[5, 10, 15, 20, 25, 50, 100]}
        checkboxSelection
      />
    </div>
  );
}

export default PolicyBoard;