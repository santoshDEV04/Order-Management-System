import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../api/auth.api.js";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      const payload = data?.message || data?.data || data;
      const accessToken = payload?.accessToken;
      const user = payload?.user;

      if (!accessToken || !user) {
        console.error("Authentication succeeded but token or user was missing in response:", data);
        return;
      }

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      // Invalidate existing queries so fresh user and permission scope is loaded
      queryClient.invalidateQueries();

      const routes = {
        ADMIN: "/admin",
        MANAGER: "/manager",
        MEMBER: "/member",
      };

      navigate(routes[user.role] || "/", { replace: true });
    },
  });
};

export default useLogin;