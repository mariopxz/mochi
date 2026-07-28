import { useContext } from "react";
import { AuthContext } from "./authContext";

// Hook para usar el contexto facilmente
export function useAuth() {
  return useContext(AuthContext);
}
