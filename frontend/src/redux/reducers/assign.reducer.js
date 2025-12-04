import { createSlice } from "@reduxjs/toolkit";

const initialState = {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
};

const assignReducer = createSlice({
  name: "assign",
  initialState,
  reducers: {
    setStartDate: (state, action) => {
      state.startDate = action.payload;
    },
  },
});

export const { setStartDate, setEndDate, setCurrentPage, setTotalPage, setKeyword, setPageSize, setTableData, setTabIndex, setAppTitle, setPart1Loading, setPart2Loading, setTableLoading } = assignReducer.actions;

export default assignReducer.reducer;
