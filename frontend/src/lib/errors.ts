import { AxiosError } from "axios";

// The backend's central error handler returns { success: false, message }
// with a real HTTP status code, so axios throws for it — read the message
// from the response body first, falling back to axios's own generic message.
export const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
        return error.response?.data?.message || error.message;
    }
    if (error instanceof Error) return error.message;
    return "Something went wrong. Please try again.";
};
