// ** React Imports
import { useCallback, useEffect, useState } from "react";

// ** MUI Imports
import { FormHelperText } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import toast from "react-hot-toast";
import { useAuth } from "src/hooks/useAuth";
import { addWorkPackges, checkAuthHealth, fetchWorkPackges } from "src/store/apps/record";

const AddEntityDialog = ({
  child,
  childs,
  parent,
  parents,
  workPackges,
  projects,
  openEntityDialog,
  handleEntityDialogClose,
  dispatch,
}: any) => {
  const { logout } = useAuth();
  const [childName, setChildName] = useState("");
  const [childNameError, setChildNameError] = useState("");
  const [selectedParent, setSelectedParent] = useState("");
  const [parentError, setParentError] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [projectError, setProjectError] = useState("");
  const [selectedWorkPackge, setSelectedWorkPackge] = useState("");
  const [workPackgeError, setWorkPackgeError] = useState("");
  const [parentItems, setParentItems] = useState([]);
  const [workPackageItems, setWorkPackageItems] = useState([]);
  const [description, setDescription] = useState("");

  const handleHealthResponse = async () => {
    const healthResponse = await checkAuthHealth();
    if (healthResponse !== "success") {
      toast.dismiss();
      toast.error("Your session has expired. Please log in again to continue.");
      logout();

      return false;
    }

    return true;
  };

  const onAdd = async () => {
    const filteredChilds = childs.filter(
      (p: any) => p[`${parent.toLowerCase().split(" ").join("_")}_id`] === selectedParent,
    );

    if (childName === "") {
      setChildNameError("This field cannot be empty");
    } else if (filteredChilds.some((p: any) => p[`${child.toLowerCase().split(" ").join("_")}_name`] === childName)) {
      setChildNameError(`${child} name already existed`);
    }
    if (selectedParent === "") {
      setParentError("This field cannot be empty");
    }
    if (selectedProject === "") {
      setProjectError("This field cannot be empty");
    }
    if (selectedWorkPackge === "") {
      setWorkPackgeError("This field cannot be empty");
    }
    if (
      childName === "" ||
      filteredChilds.some((p: any) => p[`${child.toLowerCase().split(" ").join("_")}_name`] === childName) ||
      selectedParent === ""
    ) {
      return;
    }

    const output = {
      [`${child.toLowerCase().split(" ").join("_")}_name`]: childName,
      [`${parent.toLowerCase().split(" ").join("_")}_id`]: selectedParent,
      ["description"]: description,
    };

    const childActions: any = {
      "Work Package": {
        apiCall: addWorkPackges,
        dispatchAction: fetchWorkPackges,
      },
    };

    const action: any = childActions[child];
    if (action) {
      const response = await action.apiCall({ ...output, toast });
      if (response === 1) {
        const isHealthy = await handleHealthResponse();
        if (!isHealthy) {
          return;
        }
      }
      dispatch(action.dispatchAction({}));
    }

    onClose();
  };

  const handleResetValues = useCallback(() => {
    setChildName("");
    setSelectedParent("");
    setSelectedProject("");
    setSelectedWorkPackge("");
    setDescription("");

    setChildNameError("");
    setParentError("");
    setProjectError("");
    setWorkPackgeError("");
  }, []);

  const onClose = () => {
    handleResetValues();
    handleEntityDialogClose();
  };

  useEffect(() => {
    if (workPackges !== undefined) {
      setWorkPackageItems(
        workPackges.filter((wp: any) => (projects === undefined ? wp : wp.project_id === Number(selectedProject))),
      );
    }
  }, [workPackges, projects, selectedProject]);

  useEffect(() => {
    setParentItems(
      parents.filter((p: any) =>
        parent === "Project"
          ? p
          : parent === "Work Package"
            ? p.project_id === Number(selectedProject)
            : p.work_package_id === Number(selectedWorkPackge),
      ),
    );
  }, [selectedProject, selectedWorkPackge, parent, parents]);

  return (
    <>
      <Dialog
        open={openEntityDialog}
        onClose={onClose}
        aria-labelledby='user-view-edit'
        sx={{ "& .MuiPaper-root": { width: "100%", maxWidth: 650, p: [2, 10] } }}
        aria-describedby='user-view-edit-description'
      >
        <DialogTitle id='user-view-edit' sx={{ textAlign: "center", fontSize: "1.5rem !important" }}>
          Add {child}
        </DialogTitle>
        <DialogContent>
          <DialogContentText variant='body2' id='user-view-edit-description' sx={{ textAlign: "center", mb: 7 }}>
            Adding a new {child.toLowerCase()} with the following information.
          </DialogContentText>
          <form>
            <Grid container spacing={6}>
              {projects !== undefined && (
                <Grid item xs={12} sm={6}>
                  <FormControl error={projectError !== ""} fullWidth>
                    <InputLabel id='user-view-country-label'>Project</InputLabel>
                    <Select
                      label='Project'
                      value={selectedProject}
                      onChange={(e: any) => {
                        setSelectedProject(e.target.value);
                        setProjectError("");
                        setSelectedWorkPackge("");
                        setSelectedParent("");
                      }}
                      id='user-view-country'
                      labelId='user-view-country-label'
                    >
                      {projects.map((option: any) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option[`${"Project".toLowerCase().split(" ").join("_")}_name`]}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText id='component-error-text'>{projectError}</FormHelperText>
                  </FormControl>
                </Grid>
              )}
              {workPackges !== undefined && (
                <Grid item xs={12} sm={6}>
                  <FormControl error={workPackgeError !== ""} fullWidth>
                    <InputLabel id='user-view-country-label'>Work Package</InputLabel>
                    <Select
                      label='Work Package'
                      value={selectedWorkPackge}
                      onChange={(e: any) => {
                        setSelectedWorkPackge(e.target.value);
                        setWorkPackgeError("");
                        setSelectedParent("");
                      }}
                      id='user-view-country'
                      labelId='user-view-country-label'
                    >
                      {workPackageItems.length > 0 ? (
                        workPackageItems.map((option: any) => (
                          <MenuItem key={option.id} value={option.id}>
                            {option[`${"Work Package".toLowerCase().split(" ").join("_")}_name`]}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No items found</MenuItem>
                      )}
                    </Select>
                    <FormHelperText id='component-error-text'>{workPackgeError}</FormHelperText>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <FormControl error={parentError !== ""} fullWidth>
                  <InputLabel id='user-view-country-label'>{parent}</InputLabel>
                  <Select
                    label={parent}
                    value={selectedParent}
                    onChange={(e: any) => {
                      setSelectedParent(e.target.value);
                      setParentError("");
                    }}
                    id='user-view-country'
                    labelId='user-view-country-label'
                  >
                    {parentItems.length > 0 ? (
                      parentItems.map((option: any) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option[`${parent.toLowerCase().split(" ").join("_")}_name`]}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No items found</MenuItem>
                    )}
                  </Select>
                  <FormHelperText id='component-error-text'>{parentError}</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl error={childNameError !== ""} fullWidth>
                  <TextField
                    error={childNameError !== ""}
                    label={`${child} Name`}
                    value={childName}
                    onChange={e => {
                      setChildName(e.target.value);
                      setChildNameError("");
                    }}
                  />
                  <FormHelperText id='component-error-text'>{childNameError}</FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container mt={8}>
              <FormControl fullWidth>
                <TextField
                  id='filled-multiline-flexible'
                  label={`${child} Description`}
                  multiline
                  maxRows={8}
                  value={description}
                  onChange={e => {
                    setDescription(e.target.value);
                  }}
                />
              </FormControl>
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

export default AddEntityDialog;
