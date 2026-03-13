// ** React Imports
import { useState, SyntheticEvent } from "react";

// ** MUI Imports
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography, { TypographyProps } from "@mui/material/Typography";

// ** Third Party Imports
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { API_URL, fetchRecords } from "src/store/apps/record";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { AppDispatch } from "src/store";
import { format } from "date-fns";
import { getDateString } from "src/@core/utils/get-dateString";

interface FileProp {
  name: string;
  type: string;
  size: number;
}

// Styled component for the upload image inside the dropzone area
const Img = styled("img")(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    marginRight: theme.spacing(10),
  },
  [theme.breakpoints.down("md")]: {
    marginBottom: theme.spacing(4),
  },
  [theme.breakpoints.down("sm")]: {
    width: 250,
  },
}));

// Styled component for the heading inside the dropzone area
const HeadingTypography = styled(Typography)<TypographyProps>(({ theme }) => ({
  marginBottom: theme.spacing(5),
  [theme.breakpoints.down("sm")]: {
    marginBottom: theme.spacing(4),
  },
}));

const FileUploaderSingle = ({ date, onClose }: any) => {
  // ** State
  const [files, setFiles] = useState<File[]>([]);

  // ** Hook
  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      "application/vnd.ms-excel": [".csv"],
    },

    // onDrop: (acceptedFiles: File[]) => {
    //   setFiles(acceptedFiles.map((file: File) => Object.assign(file)));
    // },
    onDrop: handleFileUpload,
  });
  const dispatch = useDispatch<AppDispatch>();

  async function handleFileUpload(acceptedFiles: File[]) {
    const file = acceptedFiles[0];

    const formData = new FormData();
    formData.append("file", file);

    const dateString = getDateString(date);
    formData.append("date", dateString);

    try {
      const user = JSON.parse(window.localStorage.getItem("user") as string);
      formData.append("userName", user.user_name);

      await axios.post(`${API_URL}/api/csv/upload_csv`, formData);
      dispatch(
        fetchRecords({
          user_name: user.user_name,
          date: dateString,
        }),
      );
      onClose();

      toast.success("Batch insertion has been successfully completed.", {
        duration: 2000,
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data ?? "";
      toast.error(`Batch insertion failed. ${errorMessage}`, {
        duration: 2000,
      });
    }
  }

  const handleLinkClick = (event: SyntheticEvent) => {
    event.preventDefault();
  };

  const txt = files.map((file: FileProp) => <div key={file.name}>{file.name}</div>);

  return (
    <Box {...getRootProps({ className: "dropzone" })} sx={files.length ? { height: 450 } : {}}>
      <input {...getInputProps()} />
      {files.length ? (
        txt
      ) : (
        <Box sx={{ display: "flex", flexDirection: ["column", "column", "row"], alignItems: "center" }}>
          <Img width={300} alt='Upload img' src='/images/misc/upload.png' />
          <Box sx={{ display: "flex", flexDirection: "column", textAlign: ["center", "center", "inherit"] }}>
            <HeadingTypography variant='h5'>Drop files here or click to upload.</HeadingTypography>
            <Typography color='textSecondary'>
              Drop files here or click{" "}
              <Link href='/' onClick={handleLinkClick}>
                browse
              </Link>{" "}
              thorough your machine
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default FileUploaderSingle;
