// ** MUI Imports
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import { useAuth } from "src/hooks/useAuth";
import FileUploaderSingle from "src/views/forms/form-elements/file-uploader/FileUploaderSingle";
import DropzoneWrapper from "src/@core/styles/libs/react-dropzone";

const ImportDialog = ({ date, openImportDialog, handleImportDialogClose, dispatch }: any) => {
  const { logout } = useAuth();
  const onClose = () => {
    handleImportDialogClose();
  };

  return (
    <>
      <Dialog
        open={openImportDialog}
        onClose={onClose}
        aria-labelledby='user-view-edit'
        aria-describedby='user-view-edit-description'
      >
        <DialogTitle id='user-view-edit' sx={{ textAlign: "center", fontSize: "1.5rem !important" }}>
          Import CSV
        </DialogTitle>
        <DialogContent>
          <DropzoneWrapper>
            <FileUploaderSingle date={date} onClose={onClose} />
          </DropzoneWrapper>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImportDialog;
