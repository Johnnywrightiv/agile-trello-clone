import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setAuthMessage } from "./authMessageSlice";

import AuthService from "../services/auth.service";

const user = JSON.parse(localStorage.getItem("user"));

export const signup = createAsyncThunk(
  "auth/signup",
  async({ email, password }, thunkAPI) => {
    try{
      const response = await AuthService.signup(email, password);
      thunkAPI.dispatch(setAuthMessage(response.data.message));
      return response.data
    } catch (error) {
      const message =
      (error.response &&
        error.response.data &&
        error.response.data.message) ||
      error.message ||
      error.toString();
    thunkAPI.dispatch(setAuthMessage(message));
    return thunkAPI.rejectWithValue();
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, thunkAPI) => {
    try {
      const data = await AuthService.login(email, password);
      return { user: data };
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      thunkAPI.dispatch(setAuthMessage(message));
      return thunkAPI.rejectWithValue();
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await AuthService.logout();
});

const initialState = user 
  ? { isLoggedIn: true, user } 
  : { isLoggedIn: false, user: null };

const userAuthSlice = createSlice({
  name: "userAuth",
  initialState,
  extraReducers: (builder) => {
    builder.addCase(signup.fulfilled, (state, action) => {
      state.isLoggedIn = false;
    });
    builder.addCase(signup.rejected, (state, action) => {
      state.isLoggedIn = false;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoggedIn = true;
      state.user = action.payload.user;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoggedIn = false;
      state.user = null;
    });
    builder.addCase(logout.fulfilled, (state, action) => {
      state.isLoggedIn = false;
      state.user = null;
    });
  },
});

const { reducer } = userAuthSlice;
export default reducer;