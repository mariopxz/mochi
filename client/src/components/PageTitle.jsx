import { useEffect } from "react";

export default function PageTitle({ title }) {
  useEffect(() => {
    document.title = `${title} | Mochi`;

    return () => {
      document.title = "Mochi";
    };
  }, [title]);

  return null;
}