import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import socket from "@/config/socket";
import { notificationSlice } from "@/redux/services/apiSlices/notificationSlice";
import { RootState } from "@/redux/store";

export function useNotificationRealtime() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.userData);

  useEffect(() => {
    if (!user?._id) return;

    if (user.role === "admin") socket.emit("setupAdmin", user);
    else socket.emit("setup", user);

    const onNotification = () => {
      dispatch(notificationSlice.util.invalidateTags(["Notifications"]));
    };
    socket.on("notification", onNotification);

    return () => {
      socket.off("notification", onNotification);
    };
  }, [dispatch, user?._id, user?.role]);
}
