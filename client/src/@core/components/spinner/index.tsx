// ** Next Import
import Image from "next/image";

// ** MUI Import
import Box, { BoxProps } from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

const FallbackSpinner = ({ sx }: { sx?: BoxProps["sx"] }) => {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "center",
        ...sx,
      }}
    >
      <Image
        src='/images/favicon.png'
        alt='Akselos Logo'
        width={30}
        height={30}
        style={{
          maxWidth: "100%",
          height: "auto",
        }}
      />
      <CircularProgress disableShrink sx={{ mt: 6 }} />
    </Box>
  );
};

export default FallbackSpinner;
