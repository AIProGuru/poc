import { createSlice } from "@reduxjs/toolkit";
import { EMPTY_ADVANCED_FILTERS } from "../../utils/advancedFilters";

const initialState = {
  startDate: null,
  endDate: null,
  currentPage: 1,
  totalPage: null,
  keyword: '',
  advancedFilters: { ...EMPTY_ADVANCED_FILTERS },
  pageSize: 50,
  tableData: [],
  tabIndex: 0,
  extraFilter: {},
  title: "Home",
  part1Loading: false,
  part2Loading: false,
  tableLoading: false,
  recoveryLoading: true,
  tagLoading: true,
  countLoading: true,
  statisticsLoading: true,
  payerLoading: true,
  loading: 0,
  bootstrapLoading: false,
  type: 0,
  models: [],
  code: '',
  remark: '',
  procedure: '',
  pos: '',
  theme: 'dark',
  selectedClaimIds: [],
  navGrouped: {},
  navPendCounts: {},
  worklistSummary: null,
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
      state.selectedClaimIds = [];
    },
    setTotalPage: (state, action) => {
      state.totalPage = action.payload;
    },
    setKeyword: (state, action) => {
      state.keyword = action.payload;
    },
    setAdvancedFilters: (state, action) => {
      state.advancedFilters = { ...EMPTY_ADVANCED_FILTERS, ...(action.payload || {}) };
    },
    clearAdvancedFilters: (state) => {
      state.advancedFilters = { ...EMPTY_ADVANCED_FILTERS };
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
    setBootstrapLoading: (state, action) => {
      state.bootstrapLoading = action.payload;
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
    },
    setSelectedClaimIds: (state, action) => {
      state.selectedClaimIds = action.payload;
    },
    setNavGrouped: (state, action) => {
      state.navGrouped = action.payload || {};
    },
    setNavPendCounts: (state, action) => {
      state.navPendCounts = action.payload || {};
    },
    setWorklistSummary: (state, action) => {
      state.worklistSummary = action.payload || null;
    },
    clearSelectedClaimIds: (state) => {
      state.selectedClaimIds = [];
    },
    setTabDefaults: (state, action) => {
      const { tabIndex, extraFilter, selectedTags } = action.payload || {};
      state.tabIndex = tabIndex ?? state.tabIndex;
      state.currentPage = 1;
      state.keyword = '';
      state.advancedFilters = { ...EMPTY_ADVANCED_FILTERS };
      state.startDate = null;
      state.endDate = null;
      state.code = '';
      state.remark = '';
      state.pos = '';
      state.procedure = '';
      state.extraFilter = extraFilter || {};
      state.selectedClaimIds = [];
      state.tableLoading = true;
      state.part1Loading = true;
      state.part2Loading = true;
    },
    resetViewState: (state) => {
      state.startDate = null;
      state.endDate = null;
      state.currentPage = 1;
      state.totalPage = null;
      state.keyword = '';
      state.advancedFilters = { ...EMPTY_ADVANCED_FILTERS };
      state.tableData = [];
      state.tabIndex = 0;
      state.extraFilter = { IncludeAllCategories: true };
      state.title = "Home";
      state.part1Loading = false;
      state.part2Loading = false;
      state.tableLoading = false;
      state.recoveryLoading = false;
      state.tagLoading = false;
      state.countLoading = false;
      state.statisticsLoading = false;
      state.payerLoading = false;
      state.loading = 0;
      state.bootstrapLoading = false;
      state.models = [];
      state.code = '';
      state.remark = '';
      state.procedure = '';
      state.pos = '';
      state.selectedClaimIds = [];
      state.navGrouped = {};
      state.navPendCounts = {};
      state.worklistSummary = null;
    }
  },
});

export const {
  setUser,
  setStatus,
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
  setAdvancedFilters,
  clearAdvancedFilters,
  setPageSize,
  setTableData,
  setTabIndex,
  setAppTitle,
  setPart1Loading,
  setPart2Loading,
  setTableLoading,
  setLoading,
  setBootstrapLoading,
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
  setTheme,
  setSelectedClaimIds,
  setNavGrouped,
  setNavPendCounts,
  setWorklistSummary,
  clearSelectedClaimIds,
  setTabDefaults,
  resetViewState,
} = appReducer.actions;

export default appReducer.reducer;
