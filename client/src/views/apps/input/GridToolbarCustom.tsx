import { useState } from "react";
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { Button, Grid, Menu, MenuItem } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

type Props = {
  handleImportDialogOpen: any;
};

const GridToolbarCustom = ({ handleImportDialogOpen }: Props) => {
  const [anchorElMenu, setAnchorElMenu] = useState<null | HTMLButtonElement>(null);
  const openMenu = Boolean(anchorElMenu);

  return (
    <GridToolbarContainer>
      <Grid container item xs>
        {/* default buttons */}
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
        <Button
          variant='text'
          size='small'
          startIcon={<CloudUploadIcon />}
          onClick={(event: any) => {
            handleImportDialogOpen();
          }}
        >
          Import
        </Button>
      </Grid>
    </GridToolbarContainer>
  );
};

export default GridToolbarCustom;
