import toast from "react-hot-toast";

export const notifySuccess = (message: string) => {
  toast.success(message, {
    style: {
      background: "#ffffff",
      border: "1px solid #D1E7DD",
      color: "#0F5132",
      fontSize: "14px",
      fontWeight: 500,
      padding: "12px 16px",
      borderRadius: "8px",
    },
    icon: null, // ❌ no checkmark
  });
};

export const notifyError = (message: string) => {
  toast.error(message, {
    style: {
      background: "#ffffff",
      border: "1px solid #F8D7DA",
      color: "#842029",
      fontSize: "14px",
      fontWeight: 500,
      padding: "12px 16px",
      borderRadius: "8px",
    },
    icon: null, // ❌ no emoji
  });
};
