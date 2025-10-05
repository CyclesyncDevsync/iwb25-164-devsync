import { toast } from "react-hot-toast";

export const showToast = (
  message: string,
  type: "success" | "error" = "success"
) => {
  toast[type](message, {
    position: "top-right",
    duration: 3000,
  });
};
