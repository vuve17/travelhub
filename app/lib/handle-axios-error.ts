import { showSnackbar } from "@/app/store/notification.slice";
import { Dispatch } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

/**
 * Handles common Axios errors, logs the error, and dispatches a Redux action
 * to show a Snackbar notification with a user-friendly message.
 *
 * @param error - The error object (expected to be an AxiosError).
 * @param dispatch - The Redux dispatch function.
 * @param prefixMessage - A message prefix (e.g., "Error fetching airline").
 */
export const handleAxiosError = (
  error: unknown,
  dispatch: Dispatch,
  prefixMessage: string
) => {
  const err = error as AxiosError;
  console.error(prefixMessage, err);
  const errorMessage =
    (err.response?.data as { message?: string })?.message || err.message || "";

  const snackbarMessage = `${prefixMessage}${
    errorMessage ? `: ${errorMessage}` : ""
  }`;

  dispatch(
    showSnackbar({
      message: snackbarMessage,
      severity: "error",
    })
  );
};
