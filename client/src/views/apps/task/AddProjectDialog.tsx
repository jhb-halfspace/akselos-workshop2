// ** React Imports
import { useState } from "react";

// ** MUI Imports
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
import { FormHelperText } from "@mui/material";
import { addProjects, checkAuthHealth, fetchProjects } from "src/store/apps/record";
import toast from "react-hot-toast";
import { useAuth } from "src/hooks/useAuth";

const AddProjectDialog = ({
  departments,
  activities,
  projects,
  openProjectDialog,
  handleProjectDialogClose,
  dispatch,
}: any) => {
  const { logout } = useAuth();
  const [project, setProject] = useState("");
  const [refcode, setRefcode] = useState("");
  const [projectError, setProjectError] = useState("");
  const [departmentError, setDepartmentError] = useState("");
  const [activityError, setActivityError] = useState("");
  const [selectedNewDeparment, setSelectedNewDeparment] = useState("");
  const [selectedNewActivity, setSelectedNewActivity] = useState("");

  const onAdd = async () => {
    if (project === "") {
      setProjectError("This field cannot be empty");
    } else if (projects.some((p: any) => p.project_name === project)) {
      setProjectError("Project name already existed");
    }
    if (selectedNewDeparment === "") {
      setDepartmentError("This field cannot be empty");
    }
    if (selectedNewActivity === "") {
      setActivityError("This field cannot be empty");
    }
    if (
      project === "" ||
      projects.some((p: any) => p.project_name === project) ||
      selectedNewDeparment === "" ||
      selectedNewActivity === ""
    ) {
      return;
    }

    const output = {
      project_name: project,
      ref_code: refcode,
      department_id: Number(selectedNewDeparment),
      activity: selectedNewActivity,
    };

    const response = await addProjects({ ...output, toast });
    if (response === 1) {
      const healthResponse = await checkAuthHealth();
      if (healthResponse !== "success") {
        toast.dismiss();
        toast.error("Your session has expired. Please log in again to continue.");
        logout();
      }

      return;
    }
    dispatch(fetchProjects({}));

    onClose();
  };

  const clearError = () => {
    setProjectError("");
    setDepartmentError("");
    setActivityError("");
  };

  const onClose = () => {
    setProject("");
    setSelectedNewDeparment("");
    setSelectedNewActivity("");
    clearError();
    handleProjectDialogClose();
  };

  return (
    <>
      <Dialog
        open={openProjectDialog}
        onClose={onClose}
        aria-labelledby='user-view-edit'
        sx={{ "& .MuiPaper-root": { width: "100%", maxWidth: 650, p: [2, 10] } }}
        aria-describedby='user-view-edit-description'
      >
        <DialogTitle id='user-view-edit' sx={{ textAlign: "center", fontSize: "1.5rem !important" }}>
          Add Project
        </DialogTitle>
        <DialogContent>
          <DialogContentText variant='body2' id='user-view-edit-description' sx={{ textAlign: "center", mb: 7 }}>
            Adding a new project with the following information.
          </DialogContentText>
          <form>
            <Grid container spacing={6}>
              <Grid item xs={12} sm={6}>
                <FormControl error={projectError !== ""} fullWidth>
                  <TextField
                    error={projectError !== ""}
                    label='Project Name'
                    value={project}
                    onChange={e => {
                      setProject(e.target.value);
                      setProjectError("");
                    }}
                  />
                  <FormHelperText id='component-error-text'>{projectError}</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Reference Code'
                  value={refcode}
                  onChange={e => setRefcode(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl error={departmentError !== ""} fullWidth>
                  <InputLabel id='user-view-language-label'>Department</InputLabel>
                  <Select
                    label='Department'
                    value={selectedNewDeparment}
                    onChange={(e: any) => {
                      setSelectedNewDeparment(e.target.value);
                      setDepartmentError("");
                    }}
                    id='user-view-language'
                    labelId='user-view-language-label'
                  >
                    {departments.map((option: any) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.department_name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText id='component-error-text'>{departmentError}</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl error={activityError !== ""} fullWidth>
                  <InputLabel id='user-view-country-label'>Activity</InputLabel>
                  <Select
                    label='Activity'
                    value={selectedNewActivity}
                    onChange={(e: any) => {
                      setSelectedNewActivity(e.target.value);
                      setActivityError("");
                    }}
                    id='user-view-country'
                    labelId='user-view-country-label'
                  >
                    {activities.map((option: any) => (
                      <MenuItem key={option.activity_name} value={option.activity_name}>
                        {option.activity_name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText id='component-error-text'>{activityError}</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                {/* <FormControlLabel
                    label='Use as a billing address?'
                    control={<Switch defaultChecked />}
                    sx={{ "& .MuiTypography-root": { fontWeight: 500 } }}
                  /> */}
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button variant='contained' sx={{ mr: 1 }} onClick={onAdd}>
            Add
          </Button>
          <Button variant='outlined' color='secondary' onClick={onClose}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddProjectDialog;
