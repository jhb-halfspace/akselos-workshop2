// ** React Imports
import { ReactNode, ReactElement, useEffect, useState } from "react";

// ** Next Import
import { useRouter } from "next/router";

// ** Hooks Import
import { useAuth } from "src/hooks/useAuth";
import { isServerDown } from "src/@core/layouts/utils";

interface AuthGuardProps {
  children: ReactNode;
  fallback: ReactElement | null;
}

const AuthGuard = (props: AuthGuardProps) => {
  const { children, fallback } = props;
  const auth = useAuth();
  const router = useRouter();
  const [isServerAvailable, setIsServerAvailable] = useState(true);

  useEffect(() => {
    const checkServerAvailability = async () => {
      const serverAvailable = !(await isServerDown());

      setIsServerAvailable(serverAvailable);
    };

    checkServerAvailability();
  }, [router]);

  useEffect(
    () => {
      if (!router.isReady) {
        return;
      }

      if (auth.user === null && !window.localStorage.getItem("userData")) {
        if (!isServerAvailable) {
          router.replace("/maintenance");

          return;
        }

        if (router.asPath !== "/") {
          router.replace({
            pathname: "/login",
            query: { returnUrl: router.asPath },
          });
        } else {
          router.replace("/login");
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.route, isServerAvailable],
  );

  if (auth.loading || auth.user === null) {
    return fallback;
  }

  return <>{children}</>;
};

export default AuthGuard;
