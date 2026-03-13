// ** MUI Imports
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

const FooterContent = () => {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
      <Typography sx={{ mr: 2 }}>
        {`© ${new Date().getFullYear()} `}
        <Link target='_blank' href='https://akselos.com/'>
          Akselos SA
        </Link>
        . All Rights Reserved
      </Typography>
    </Box>
  );
};

export default FooterContent;
