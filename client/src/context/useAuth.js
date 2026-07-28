import { useContext } from "react";
import { AuthContext } from "./AuthContext";

// Hook para usar el contexto facilmente
export function useAuth() {
  return useContext(AuthContext);
}