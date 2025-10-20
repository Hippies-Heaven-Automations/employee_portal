import toast from "react-hot-toast";
import React from "react";

export const confirmAction = (
  message: string,
  onConfirm: () => void,
  confirmLabel?: string,
  confirmColor?: string
) => {
  const id = toast.custom(
    (t) => {
      const label = confirmLabel || (message.toLowerCase().includes("delete") ? "Delete" : "Save");
      const color =
        confirmColor ||
        (label.toLowerCase().includes("delete")
          ? "bg-red-600 hover:bg-red-700"
          : "bg-hemp-green hover:bg-hemp-forest");

      return (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } bg-white border border-gray-200 shadow-xl rounded-xl p-4 flex flex-col gap-3 w-[320px]`}
        >
          <p className="text-gray-800 text-sm font-medium">{message}</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => toast.dismiss(id)}
              className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(id);
                onConfirm();
              }}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold text-white transition ${color}`}
            >
              {label}
            </button>
          </div>
        </div>
      );
    },
    { duration: 8000 }
  );
};
