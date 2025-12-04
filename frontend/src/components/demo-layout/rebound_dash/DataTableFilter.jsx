import React, { useState, useEffect } from "react";
import axios from 'axios';
import {
  Button,
  Grid,
  IconButton,
  Typography,
  Popover,
  Divider,
  TextField,
  Backdrop
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DataTableTagsFilter from "./DataTableTagsFilter";
import CustomDatePicker from "./CustomDatePicker";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { SERVER_URL } from "../../../utils/config";
import { setSelectedTags } from "../../../redux/reducers/tag.reducer";
import { setPart1Count, setPart2Count } from "../../../redux/reducers/count.reducer";
import { useApiEndpoint } from "../../../ApiEndpointContext";
import {
  increasePart1Loading, setStartDate, setEndDate, setCurrentPage, setTableData, setTotalPage, setPart1Loading, setPart2Loading, setTableLoading, setCode, setRemark, setProcedure, setPOS, decreasePart1Loading, setExtraFilter
} from "../../../redux/reducers/app.reducer";

export default function DataTableFilter(props) {
  const apiUrl = useApiEndpoint();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const dispatch = useDispatch();
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const currentPage = useSelector((state) => state.app.currentPage)
  const perPage = useSelector((state) => state.app.pageSize)
  const keyword = useSelector((state) => state.app.keyword)
  const tabIndex = useSelector((state) => state.app.tabIndex)

  const [startDate, set_startDate] = useState(useSelector((state) => state.app.startDate))
  const [endDate, set_endDate] = useState(useSelector((state) => state.app.endDate))
  const [code, set_code] = useState(useSelector((state) => state.app.code))
  const [remark, set_remark] = useState(useSelector((state) => state.app.remark))
  const [procedure, set_procedure] = useState(useSelector((state) => state.app.procedure))
  const [pos, set_pos] = useState(useSelector((state) => state.app.pos))
  const [selectedTags, set_selectedTags] = useState([])
const theme = useSelector((state) => state.app.theme)
  useEffect(() => {
    set_selectedTags(props.selectedTags);
  }, [props.selectedTags])

  const handleFilterOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const applyFilter = () => {
    dispatch(setPart1Loading(true))
    dispatch(setPart2Loading(true))
    dispatch(setTableLoading(true))
    dispatch(setStartDate(startDate))
    dispatch(setEndDate(endDate))
    dispatch(setCurrentPage(1));
    dispatch(setSelectedTags(selectedTags))
    dispatch(setCode(code))
    dispatch(setRemark(remark))
    dispatch(setProcedure(procedure))
    dispatch(setPOS(pos))
    dispatch(setExtraFilter({}))
    setAnchorEl(null);
  
    axios.post(`${apiUrl}/data_all`, {
      tabIndex: tabIndex,
      currentPage: currentPage,
      perPage: perPage,
      selectedTags,
      keyword: keyword,
      startDate: startDate ? startDate.toISOString().substr(0, 10) : null,
      endDate: endDate ? endDate.toISOString().substr(0, 10) : null,
      code: code,
      remark: remark,
      procedure: procedure,
      pos: pos,
      sort: props.order
    }).then(res => {
      dispatch(setTableData(res.data.data));
      dispatch(setTotalPage(res.data.maxPage));
      dispatch(setTableLoading(false))
    }).catch(error => {
      console.error("Error fetching rebound_data_all:", error);
      dispatch(setTableLoading(false));
    });
  
    axios.post(`${apiUrl}/part1_all`, {
      tabIndex,
      keyword,
      selectedTags,
      startDate: startDate ? startDate.toISOString().substr(0, 10) : null,
      endDate: endDate ? endDate.toISOString().substr(0, 10) : null,
      code: code,
      remark: remark,
      procedure: procedure,
      pos: pos
    }).then(res => {
      console.log("rebound_data_part1_all response:", res.data);
      dispatch(setPart1Count(res.data));
      dispatch(setPart1Loading(false))
    }).catch(error => {
      console.error("Error fetching rebound_data_part1_all:", error);
      dispatch(setPart1Loading(false));
    });
  
    axios.post(`${apiUrl}/part2_all`, {
      tabIndex,
      keyword,
      selectedTags,
      startDate: startDate ? startDate.toISOString().substr(0, 10) : null,
      endDate: endDate ? endDate.toISOString().substr(0, 10) : null,
      code: code,
      remark,
      procedure,
      pos
    }).then(res => {
      console.log("rebound_data_part2_all response:", res.data);
      dispatch(setPart2Count(res.data));
      dispatch(setPart2Loading(false))
    }).catch(error => {
      console.error("Error fetching rebound_data_part2_all:", error);
      dispatch(setPart2Loading(false));
    });
  }

  return (
    <div>
      <button
        onClick={handleFilterOpen}
        style={open ? { boxShadow: "0px 0px 0px 4px #F2F7FF" } : {}}
        className={`w-[144px] rounded-lg flex justify-center items-center h-[40px] p-3 border ${theme === 'dark' ?"bg-[#151619] text-white  border border-gray-600" :" text-black bg-white border border-gray-300"} gap-2`}
      >
        <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.84717 16.9446V12.0835" stroke="#9598B0" strokeWidth="1.3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.84717 5.139V3.05566" stroke="#9598B0" strokeWidth="1.3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14.4861 16.9444V14.8611" stroke="#9598B0" strokeWidth="1.3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14.4861 7.91678V3.05566" stroke="#9598B0" strokeWidth="1.3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8.93049 6.5278V10.6945C8.93049 11.4584 8.58327 12.0834 7.5416 12.0834H6.15271C5.11105 12.0834 4.76382 11.4584 4.76382 10.6945V6.5278C4.76382 5.76392 5.11105 5.13892 6.15271 5.13892H7.5416C8.58327 5.13892 8.93049 5.76392 8.93049 6.5278Z" stroke="#9598B0" strokeWidth="1.3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16.5694 9.30564V13.4723C16.5694 14.2362 16.2222 14.8612 15.1805 14.8612H13.7916C12.75 14.8612 12.4027 14.2362 12.4027 13.4723V9.30564C12.4027 8.54175 12.75 7.91675 13.7916 7.91675H15.1805C16.2222 7.91675 16.5694 8.54175 16.5694 9.30564Z" stroke="#9598B0" strokeWidth="1.3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[14px] px-2">Filters</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.0666 5.30542L7.44441 8.92764C7.01663 9.35542 6.31663 9.35542 5.88885 8.92764L2.26663 5.30542" stroke="#9598B0" strokeWidth="1.4" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <Backdrop open={open} onClick={handleClose} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backdropFilter: 'blur(5px)' }} />
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            width: '90%',
            maxWidth: '500px',
            p: 2,
            borderRadius: 2,
            boxShadow: 3,
          }
        }}
      >
        <div className="flex flex-col gap-y-4">
          <Typography variant="h6" sx={{ padding: "8px" }}>
            <span>Filter</span>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </Typography>
          <Divider />
          <DataTableTagsFilter selectedTags={selectedTags} setSelectedTags={set_selectedTags} />
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <CustomDatePicker
                title="Start Date"
                onSelect={(date) => set_startDate(date)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomDatePicker
                title="End Date"
                onSelect={(date) => set_endDate(date)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                id="outlined-read-only-input"
                label="CARC"
                value={code}
                onChange={(e) => set_code(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                id="outlined-read-only-input"
                label="RARC"
                value={remark}
                onChange={(e) => set_remark(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                id="outlined-read-only-input"
                label="CPT"
                value={procedure}
                onChange={(e) => set_procedure(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                id="outlined-read-only-input"
                label="PoS"
                value={pos}
                onChange={(e) => set_pos(e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>
          <Divider />
          <div className="flex justify-end gap-x-2">
            <Button variant="text" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="contained" onClick={applyFilter}>Apply</Button>
          </div>
        </div>
      </Popover>
    </div>
  );
}