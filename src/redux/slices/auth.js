import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../../axios";

// Общий обработчик для fetchAuth, fetchRegister и fetchProfile
const handleFetch = (state, action) => {
  state.status = action.meta.requestStatus;
  if (action.meta.requestStatus === "fulfilled") {
    state.data = action.payload;
  }
};

const asyncThunkConfig = {
  transformResponse: (response) => response.data,
};

export const fetchAuth = createAsyncThunk(
  "auth/fetchAuth",
  async (payload, thunkAPI) => {
    const response = await axios.post("/auth/login", payload);
    return response.data;
  },
  asyncThunkConfig
);

export const fetchRegister = createAsyncThunk(
  "auth/fetchRegister",
  async (payload, thunkAPI) => {
    const response = await axios.post("/auth/register", payload);
    return response.data;
  },
  asyncThunkConfig
);

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, thunkAPI) => {
    const response = await axios.get("/auth/profile");
    return response.data;
  },
  asyncThunkConfig
);

const initialState = {
  data: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuth.fulfilled, handleFetch)
      .addCase(fetchRegister.fulfilled, handleFetch)
      .addCase(fetchProfile.fulfilled, handleFetch);
  },
});

export const isAuthSelector = (state) => Boolean(state.auth.data);

export const authReducer = authSlice.reducer;

export const { logout } = authSlice.actions;
