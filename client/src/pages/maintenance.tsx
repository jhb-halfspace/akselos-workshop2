import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useAuth } from "src/hooks/useAuth";
import UnderMaintenance from "./pages/misc/under-maintenance";
import { isServerDown } from "src/@core/layouts/utils";

const Maintenance: React.FC = () => {
  const auth = useAuth();
  const router = useRouter();
  const [isServerAvailable, setIsServerAvailable] = useState(false);

  useEffect(() => {
    const checkServerAvailability = async () => {
      const serverAvailable = !(await isServerDown());

      setIsServerAvailable(serverAvailable);
    };

    checkServerAvailability();
  }, [router]);

  useEffect(
    () => {
      if ((auth.user !== null && window.localStorage.getItem("userData")) || isServerAvailable) {
        router.replace("/");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.route, isServerAvailable],
  );

  return (
    <>
      <UnderMaintenance />
    </>
  );
};

export default Maintenance;
