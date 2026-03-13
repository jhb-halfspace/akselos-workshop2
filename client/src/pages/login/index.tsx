// ** React Imports
import { ReactNode, useEffect, useState } from "react";

// ** Next Imports
import Image from "next/image";

// ** MUI Components
import Box, { BoxProps } from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { styled, useTheme } from "@mui/material/styles";
import Typography, { TypographyProps } from "@mui/material/Typography";

// ** Hooks
import { useAuth } from "src/hooks/useAuth";
import { useSettings } from "src/@core/hooks/useSettings";

// ** Configs
import themeConfig from "src/configs/themeConfig";

// ** Layout Import
import BlankLayout from "src/@core/layouts/BlankLayout";

// ** Demo Imports
import FooterIllustrationsV2 from "src/views/pages/auth/FooterIllustrationsV2";

import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { isServerDown } from "src/@core/layouts/utils";

// ** Styled Components
const LoginIllustrationWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  padding: theme.spacing(20),
  paddingRight: "0 !important",
  [theme.breakpoints.down("lg")]: {
    padding: theme.spacing(10),
  },
}));

const LoginIllustration = styled("img")(({ theme }) => ({
  maxWidth: "48rem",
  [theme.breakpoints.down("xl")]: {
    maxWidth: "38rem",
  },
  [theme.breakpoints.down("lg")]: {
    maxWidth: "30rem",
  },
}));

const RightWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  width: "100%",
  [theme.breakpoints.up("md")]: {
    maxWidth: 400,
  },
  [theme.breakpoints.up("lg")]: {
    maxWidth: 450,
  },
}));

const BoxWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  width: "100%",
  [theme.breakpoints.down("md")]: {
    maxWidth: 400,
  },
}));

const TypographyStyled = styled(Typography)<TypographyProps>(({ theme }) => ({
  fontWeight: 600,
  letterSpacing: "0.18px",
  marginBottom: theme.spacing(1.5),
  [theme.breakpoints.down("md")]: { marginTop: theme.spacing(8) },
}));

const LoginPage = () => {
  // ** Hooks
  const auth = useAuth();
  const theme = useTheme();
  const { settings } = useSettings();
  const hidden = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();
  const [isServerAvailable, setIsServerAvailable] = useState(true);

  // ** Vars
  const { skin } = settings;

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

      if (auth.user === null && !window.localStorage.getItem("userData") && !isServerAvailable) {
        router.replace("/maintenance");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.route, isServerAvailable],
  );

  const onSuccess = (res: CredentialResponse) => {
    console.log("Login Succeeded");
    const decoded = jwtDecode<any>(res.credential as string);

    // console.log(res);
    // console.log(decoded);
    // console.log("Date of expiry: ", new Date(decoded.exp * 1000));

    const { email, name, exp, picture } = decoded;

    const domain = email.split("@")[1];
    const isAdmin = email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    if (!isAdmin && domain !== "akselos.com") {
      toast.error("You cannot sign in with this email");

      return;
    }

    window.localStorage.setItem(
      "user",
      JSON.stringify({
        user_name: isAdmin ? "kim.le" : email.split("@")[0],
        name: isAdmin ? "Kim Le" : name,
        exp,
        picture,
      }),
    );

    auth.login(
      {
        email: "admin@materialize.com",
        password: "admin",
        rememberMe: true,
        cred: res.credential,
      },
      () => {},
    );
  };

  const onFailure = () => {
    console.log("Login Failed");
  };

  // const imageSource = skin === "bordered" ? "auth-v2-login-illustration-bordered" : "auth-v2-login-illustration";
  const imageSource = "auth-v2-login-illustration";

  return (
    <Box className='content-right'>
      {!hidden ? (
        <Box sx={{ flex: 1, display: "flex", position: "relative", alignItems: "center", justifyContent: "center" }}>
          <LoginIllustrationWrapper>
            <LoginIllustration alt='login-illustration' src={`/images/pages/${imageSource}.png`} />
          </LoginIllustrationWrapper>
          <FooterIllustrationsV2 />
        </Box>
      ) : null}
      <RightWrapper sx={skin === "bordered" && !hidden ? { borderLeft: `1px solid ${theme.palette.divider}` } : {}}>
        <Box
          sx={{
            p: 7,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "background.paper",
          }}
        >
          <BoxWrapper>
            <Box
              sx={{
                top: 30,
                left: 40,
                display: "flex",
                position: "absolute",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                src='/images/favicon.png'
                alt='Akselos Logo'
                width={40}
                height={40}
                style={{
                  maxWidth: "100%",
                  height: "auto",
                }}
              />
              <Typography
                variant='h6'
                sx={{
                  ml: 2,
                  lineHeight: 1,
                  fontWeight: 700,
                  fontSize: "2.5rem !important",
                  color: "#006eb7",
                  fontFamily: "Teko",
                }}
              >
                {themeConfig.templateName}
              </Typography>
            </Box>
            <Box sx={{ mb: 6 }}>
              <TypographyStyled variant='h5'>{`Welcome to Time Recorder!`}</TypographyStyled>
              <Typography variant='body2'>Please sign in to your account to proceed</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GoogleLogin
                theme='filled_blue'
                onSuccess={onSuccess}
                onError={onFailure}

                // hosted_domain="akselos.com"
              />
            </Box>
          </BoxWrapper>
        </Box>
      </RightWrapper>
    </Box>
  );
};

LoginPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>;

LoginPage.guestGuard = true;

export default LoginPage;
