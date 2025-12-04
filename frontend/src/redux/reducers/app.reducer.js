import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  startDate: null,
  endDate: null,
  currentPage: 1,
  totalPage: null,
  keyword: '',
  pageSize: 50,
  tableData: [],
  tabIndex: 0,
  extraFilter: {},
  title: "Dashboard",
  part1Loading: false,
  part2Loading: false,
  tableLoading: false,
  recoveryLoading: true,
  tagLoading: true,
  countLoading: true,
  statisticsLoading: true,
  payerLoading: true,
  loading: 0,
  type: 0,
  models: [],
  code: '',
  remark: '',
  procedure: '',
  pos: '',
  theme: 'light'
};

const appReducer = createSlice({
  name: "app",
  initialState,
  reducers: {
    // Existing reducers
    setUser: (state, action) => {
      state.models[action.payload.index].User = action.payload.value;
    },
    setStatus: (state, action) => {
      state.models[action.payload.index].Status = action.payload.value;
    },
    setRecoveryLoading: (state, action) => {
      state.recoveryLoading = action.payload;
    },
    setUpdatedAt: (state, action) => {
      state.models[action.payload.index].UpdatedAt = action.payload.UpdatedAt;
    },
    setExtraFilter: (state, action) => {
      state.extraFilter = action.payload;
    },
    increaseLoading: (state) => {
      state.loading = state.loading + 1;
    },
    decreaseLoading: (state) => {
      state.loading = state.loading - 1;
    },
    // New loading actions
    increasePart1Loading: (state) => {
      state.part1Loading = true;
    },
    decreasePart1Loading: (state) => {
      state.part1Loading = false;
    },
    // Continue existing reducers
    setStartDate: (state, action) => {
      state.startDate = action.payload;
    },
    setEndDate: (state, action) => {
      state.endDate = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setTotalPage: (state, action) => {
      state.totalPage = action.payload;
    },
    setKeyword: (state, action) => {
      state.keyword = action.payload;
    },
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
    },
    setTableData: (state, action) => {
      state.tableData = action.payload;
    },
    setTabIndex: (state, action) => {
      state.tabIndex = action.payload;
    },
    setAppTitle: (state, action) => {
      state.title = action.payload;
    },
    setPart1Loading: (state, action) => {
      state.part1Loading = action.payload;
    },
    setPart2Loading: (state, action) => {
      state.part2Loading = action.payload;
    },
    setTableLoading: (state, action) => {
      state.tableLoading = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setType: (state, action) => {
      state.type = action.payload;
    },
    setTagLoading: (state, action) => {
      state.tagLoading = action.payload;
    },
    setCountLoading: (state, action) => {
      state.countLoading = action.payload;
    },
    setStatisticsLoading: (state, action) => {
      state.statisticsLoading = action.payload;
    },
    setPayerLoading: (state, action) => {
      state.payerLoading = action.payload;
    },
    setModels: (state, action) => {
      state.models = action.payload;
    },
    setCode: (state, action) => {
      state.code = action.payload;
    },
    setRemark: (state, action) => {
      state.remark = action.payload;
    },
    setProcedure: (state, action) => {
      state.procedure = action.payload;
    },
    setPOS: (state, action) => {
      state.pos = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    }
  },
});

export const {
  setUser,
  setStatus,
  setUpdatedAt,
  setExtraFilter,
  increaseLoading,
  decreaseLoading,
  increasePart1Loading,
  decreasePart1Loading,
  setRecoveryLoading,
  setStartDate,
  setEndDate,
  setCurrentPage,
  setTotalPage,
  setKeyword,
  setPageSize,
  setTableData,
  setTabIndex,
  setAppTitle,
  setPart1Loading,
  setPart2Loading,
  setTableLoading,
  setLoading,
  setType,
  setTagLoading,
  setCountLoading,
  setStatisticsLoading,
  setPayerLoading,
  setModels,
  setCode,
  setRemark,
  setProcedure,
  setPOS,
  setTheme
} = appReducer.actions;

export default appReducer.reducer;