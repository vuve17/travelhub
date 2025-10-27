import axios from "axios";

export const handleAxiosError = (error: unknown): string => {
  if (axios.isAxiosError(error) && error.response) {
    return (
      error.response.data?.message || `API Error: ${error.response.status}`
    );
  }
  return "An unknown error occurred.";
};
