import { createSlice } from "@reduxjs/toolkit";

const initialState: any = {
  userData: {},
  userToken: null,
  profileDetails: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addUser: (state, { payload }) => {
      state.userData = payload.user;
      state.userToken = payload.token;
    },
    updateUserData: (state, { payload }) => {
      state.userData = payload.user?.user ?? payload.user;
    },
    removeUser: (state) => {
      state.userData = {};
      state.userToken = null;
      localStorage.clear();
    },
    addData: (state, { payload }) => {
      state[payload.name] = payload.value;
    },
    addProfileDetails: (state, { payload }) => {
      state.profileDetails = payload.details;
    },
  },
});

export const { addUser, removeUser, updateUserData, addData, addProfileDetails } = userSlice.actions;

export default userSlice.reducer;
