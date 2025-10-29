// store/notificationSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface NotificationState {
  isOpen: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

const initialState: NotificationState = {
  isOpen: false,
  message: "",
  severity: "info",
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    // Action to show the Snackbar
    showSnackbar: (
      state,
      action: PayloadAction<{
        message: string;
        severity: NotificationState["severity"];
      }>
    ) => {
      state.isOpen = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity;
    },
    // Action to hide the Snackbar (usually triggered by a timeout or user click)
    hideSnackbar: (state) => {
      state.isOpen = false;
      state.message = "";
    },
  },
});

export const { showSnackbar, hideSnackbar } = notificationSlice.actions;
export default notificationSlice.reducer;
