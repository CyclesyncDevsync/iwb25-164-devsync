import toast from "react-hot-toast";

// Enhanced toast types
export const enhancedToast = {
  success: (message: string, options?: any) => {
    return toast.success(message, {
      duration: 4000,
      style: {
        background: "var(--color-bg-primary)",
        color: "var(--color-text-primary)",
        border: "1px solid #10B981",
        borderRadius: "12px",
        padding: "16px",
        fontSize: "14px",
        fontWeight: "500",
        maxWidth: "400px",
        boxShadow: "0 10px 40px rgba(16, 185, 129, 0.1)",
      },
      iconTheme: {
        primary: "#10B981",
        secondary: "#FFFFFF",
      },
      ...options,
    });
  },

  error: (message: string, options?: any) => {
    return toast.error(message, {
      duration: 6000,
      style: {
        background: "var(--color-bg-primary)",
        color: "var(--color-text-primary)",
        border: "1px solid #EF4444",
        borderRadius: "12px",
        padding: "16px",
        fontSize: "14px",
        fontWeight: "500",
        maxWidth: "400px",
        boxShadow: "0 10px 40px rgba(239, 68, 68, 0.1)",
      },
      iconTheme: {
        primary: "#EF4444",
        secondary: "#FFFFFF",
      },
      ...options,
    });
  },
};
