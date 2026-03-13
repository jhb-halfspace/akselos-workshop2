import { Summarize } from "@mui/icons-material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Button, Grid, Menu, MenuItem } from "@mui/material";
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
  useGridApiContext,
} from "@mui/x-data-grid";
import { useState } from "react";

type Props = {
  userName: string;
  position: string;
  handleProjectDialogOpen: any;
  handleWorkPackageDialogOpen: any;
  setOpenTaskMode: any;
  generateReport: any;
  exportCurrentTable: any;
};
//test
const GridToolbarCustom = ({
  position,
  handleProjectDialogOpen,
  handleWorkPackageDialogOpen,
  setOpenTaskMode,
  generateReport,
  exportCurrentTable,
}: Props) => {
  const [anchorElMenu, setAnchorElMenu] = useState<null | HTMLButtonElement>(null);
  const [anchorE2Menu, setAnchorE2Menu] = useState<null | HTMLButtonElement>(null);

  const openMenu1 = Boolean(anchorElMenu);
  const openMenu2 = Boolean(anchorE2Menu);

  const apiRef = useGridApiContext();

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
          startIcon={<Summarize />}
          onClick={(event: any) => {
            exportCurrentTable(apiRef);
          }}
        >
          Excel Report
        </Button>
        <Button
          variant='text'
          size='small'
          startIcon={<VisibilityIcon />}
          onClick={(event: any) => {
            setAnchorE2Menu(event.currentTarget);
          }}
        >
          View Mode
        </Button>
        <Menu
          id='menu-options'
          anchorEl={anchorE2Menu}
          open={openMenu2}
          onClose={() => {
            setAnchorE2Menu(null);
          }}
        >
          <MenuItem
            onClick={(event: any) => {
              setOpenTaskMode(true);
              setAnchorE2Menu(null);
            }}
          >
            Task-based mode
          </MenuItem>
          <MenuItem
            onClick={() => {
              setOpenTaskMode(false);
              setAnchorE2Menu(null);
            }}
          >
            Hour-based mode
          </MenuItem>
        </Menu>
        {position === "Manager" && (
          <>
            <Button
              variant='text'
              size='small'
              startIcon={<AdminPanelSettingsIcon />}
              onClick={(event: any) => {
                setAnchorElMenu(event.currentTarget);
              }}
            >
              Manager
            </Button>
            <Menu
              id='menu-options'
              anchorEl={anchorElMenu}
              open={openMenu1}
              onClose={() => {
                setAnchorElMenu(null);
              }}
            >
              <MenuItem
                onClick={() => {
                  handleProjectDialogOpen();
                  setAnchorElMenu(null);
                }}
              >
                Add Project
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleWorkPackageDialogOpen();
                  setAnchorElMenu(null);
                }}
              >
                Add Work Package
              </MenuItem>
              <MenuItem
                onClick={() => {
                  generateReport();
                }}
              >
                Export Summary Report
              </MenuItem>
            </Menu>
          </>
        )}
      </Grid>
    </GridToolbarContainer>
  );
};

export default GridToolbarCustom;
