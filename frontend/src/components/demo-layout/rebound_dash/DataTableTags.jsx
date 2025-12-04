import React, { useState, useEffect } from "react";
import axios from 'axios';
import {
  Button,
  Grid,
  IconButton,
  Typography,
  Popover,
  Divider,
  TextField
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DataTableTagsFilter from "./DataTableTagsFilter";
import CustomDatePicker from "./CustomDatePicker";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";
import { increasePart1Loading, setStartDate, setEndDate, setCurrentPage, setTableData, setTotalPage, setPart1Loading, setPart2Loading, setTableLoading, setCode, setRemark, setProcedure, setPOS, decreasePart1Loading, setExtraFilter } from "../../../redux/reducers/app.reducer";
import { useDispatch, useSelector } from "react-redux";
import { SERVER_URL } from "../../../utils/config";
import { setSelectedTags } from "../../../redux/reducers/tag.reducer";
import { setPart1Count, setPart2Count } from "../../../redux/reducers/count.reducer";
import { useApiEndpoint } from "../../../ApiEndpointContext";

export default function DataTableTags(props) {
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
    // dispatch(increasePart1Loading())
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
    console.log(endDate);
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
    })
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
      dispatch(setPart1Count(res.data));
      // dispatch(decreasePart1Loading())
      dispatch(setPart1Loading(false))
    })
    axios.post(`${apiUrl}/part2_all`, {
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
      dispatch(setPart2Count(res.data));
      dispatch(setPart2Loading(false))
    })
  }

  return (
    <div>
      <div
        onClick={handleFilterOpen}
        style={open ? { boxShadow: "0px 0px 0px 4px #F2F7FF" } : {}}
        className="flex justify-center items-center border border-[#CACBCB] px-5 py-[5px] rounded-md cursor-pointer gap-2"
      >
        <div className="w-[12px] h-[12px] flex justify-center items-center">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.82516 3.72239C1.19487 3.01796 0.879732 2.66574 0.867845 2.3664C0.857519 2.10636 0.969265 1.85643 1.16994 1.69074C1.40095 1.5 1.87357 1.5 2.81881 1.5H15.1879C16.1332 1.5 16.6058 1.5 16.8368 1.69074C17.0375 1.85643 17.1492 2.10636 17.1389 2.3664C17.127 2.66574 16.8119 3.01796 16.1816 3.72239L11.4264 9.03703C11.3007 9.17745 11.2379 9.24766 11.1931 9.32756C11.1534 9.39843 11.1242 9.47473 11.1066 9.55403C11.0867 9.64345 11.0867 9.73766 11.0867 9.92609V14.382C11.0867 14.5449 11.0867 14.6264 11.0604 14.6969C11.0372 14.7591 10.9994 14.8149 10.9502 14.8596C10.8946 14.9102 10.8189 14.9404 10.6676 15.001L7.8343 16.1343C7.52801 16.2568 7.37487 16.3181 7.25193 16.2925C7.14442 16.2702 7.05008 16.2063 6.98941 16.1148C6.92004 16.0101 6.92004 15.8452 6.92004 15.5153V9.92609C6.92004 9.73766 6.92004 9.64345 6.90014 9.55403C6.88249 9.47473 6.85334 9.39843 6.81361 9.32756C6.76882 9.24766 6.706 9.17745 6.58036 9.03703L1.82516 3.72239Z" stroke="#0D364D" strokeWidth={"1.66667"} strokeLinecap={"round"} strokeLinejoin={"round"} />
          </svg>
        </div>
        <Typography className="text-[14px]">
          Tags
        </Typography>
        <span>
          {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
        </span>
      </div>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <div
          style={{ padding: "16px", width: "500px" }}
          className="flex flex-col gap-y-4"
        >
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
            <Grid item xs={6}>
              <CustomDatePicker
                title="Start Date"
                onSelect={(date) => set_startDate(date)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomDatePicker
                title="End Date"
                onSelect={(date) => set_endDate(date)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="outlined-read-only-input"
                label="CARC"
                value={code}
                onChange={(e) => set_code(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="outlined-read-only-input"
                label="RARC"
                value={remark}
                onChange={(e) => set_remark(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="outlined-read-only-input"
                label="CPT"
                value={procedure}
                onChange={(e) => set_procedure(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="outlined-read-only-input"
                label="PoS"
                value={pos}
                onChange={(e) => set_pos(e.target.value)}
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
